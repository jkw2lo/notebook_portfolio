/* ════ SAVE ═════════════════════════════════════════════════ */
function serialise(){
  const out = JSON.parse(JSON.stringify({title:NB.title, version:3, sections:NB.sections,
    stencils:NB.stencils||[], stenOn:NB.stenOn!==false, stenSnap:NB.stenSnap!==false, rulers:!!NB.rulers,
    bind:NB.bind||"single", gutter:gutterW(), spine:NB.spine||"stitch",
    gutterShade:NB.gutterShade!==false, nums:NB.nums!==false, anim:NB.anim!==false,
    kit:NB.kit||"Bench", templates:NB.templates||[], daily:NB.daily||null}));
  const pl = out.sections.flatMap(s => s.pages);
  for (const p of pl) for (const b of p.blocks){
    if (!b.src) continue;
    if (blobFor(b.id)) b.src = "media/" + b.id + ".jpg";      /* ours, published or about to be */
    else if (String(b.src).startsWith("blob:")) b.src = null;  /* a dead URL from a past session */
    /* anything else is already a media/ path from a previous load — leave it */
  }
  return out;
}
let FILES_OK = true, SAVE_ERR = null, SAVED_BYTES = 0;

const seedRe = () => /<script id="seed" type="application\/json">[\s\S]*?<\/script>/;
const dataURL = blob => new Promise((ok,no) => {
  const f = new FileReader(); f.onload = () => ok(f.result); f.onerror = no; f.readAsDataURL(blob);
});

/* The files form writes only what changed and leaves this view running.
   Not every host offers it, so there is a whole-page fallback below. */
async function saveFiles(){
  const files = {"data/notebook.json":{content:JSON.stringify(serialise()), contentType:"application/json"}};
  SAVED_BYTES = 0;
  for (const [id,blob] of BLOBS){ files["media/"+id+".jpg"] = blob; SAVED_BYTES += blob.size; }
  await CAP.publish(files);
}

/* Fallback: rewrite this page with the notebook baked into it. Photographs
   go in as data URIs, because there is no media/ directory in this mode. */
async function serialiseInline(){
  const out = serialise();
  const pp = out.sections.flatMap(s => s.pages);
  for (const p of pp) for (const b of p.blocks){
    if (!b.src) continue;
    const bl = blobFor(b.id);
    if (bl){ b.src = await dataURL(bl); continue; }
    if (String(b.src).startsWith("data:")) continue;
    try {                                   /* an earlier media/ file — pull it back in */
      const r = await fetch(b.src, {cache:"force-cache"});
      b.src = r.ok ? await dataURL(await r.blob()) : null;
    } catch(_){ b.src = null; }
  }
  return out;
}
async function pageSource(){
  try {
    const r = await fetch(location.href, {cache:"no-store"});
    if (!r.ok) return null;
    const t = await r.text();
    /* The seed block is the real proof this is our own page. A doctype
        is NOT: the artifact host adds one at publish time, so the copy
        in the repo has none — which is what made a standalone export
        fail with "could not read its own source". */
    if (!seedRe().test(t)) return null;
    return /^\s*<!doctype/i.test(t) ? t : "<!doctype html>\n" + t;
  } catch(_){ return null; }
}
async function saveWholePage(){
  const src = await pageSource();
  if (!src) throw {code:"no_source", message:"this page's own source could not be read"};
  const json = JSON.stringify(await serialiseInline()).replace(/</g, "\\u003c");
  const out = src.replace(seedRe(), '<script id="seed" type="application/json">' + json + '<\/script>');
  if (out === src) throw {code:"no_seed", message:"nowhere in the page to write the notebook"};
  if (out.length > 9e6) throw {code:"too_large", message:"the notebook and its photographs are too big to embed"};
  await CAP.publish(out);                    /* on success every view, this one included, reloads */
}

async function save(){
  if (RO) return;
  if (!CAP){ warnSave("no_host"); return; }
  const btn = $("#b-save"); btn.disabled = true; btn.textContent = "Saving…";
  try {
    if (FILES_OK){
      try {
        await saveFiles();
        for (const [id,blob] of BLOBS) KEEP.set(id, blob);
        BLOBS.clear(); SAVE_ERR = null; $("#savewarn").hidden = true; dirty(false);
        const first = !save.done; save.done = true;
        toast(first ? "Saved. Carry on — nothing is locked, and the next save picks up from here."
            : SAVED_BYTES ? `Saved — ${(SAVED_BYTES/1048576).toFixed(1)} MB of photographs published.` : "Saved.",
          first ? 4200 : 2400);
        return;
      } catch(err){
        const c = err && err.code;
        if (c === "capability_disabled" || c === "capability_removed" || c === "read_only_path"){
          FILES_OK = false;                  /* this viewer cannot write single files */
          toast("Saving the quick way is not available here — writing the whole page instead.", 3600);
        } else throw err;
      }
    }
    await saveWholePage();
    toast("Saved. The page is reloading to what you just saved.", 4000);
  } catch(err){
    const code = (err && err.code) || "upstream_error";
    if (code === "conflict"){ toast("Someone saved first — this view is reloading to their version."); return; }
    if (code === "not_writer" || code === "not_granted"){
      goReadOnly("You can look at this notebook but not write to it. Export keeps a copy of anything you changed.");
      return;
    }
    /* Everything else leaves editing exactly as it was. The work is in the
       browser and is fine; it is only the write that failed. */
    warnSave(code, err && err.message);
    dirty(true);
  }
}
function warnSave(code, msg){
  SAVE_ERR = code;
  const w = $("#savewarn");
  w.hidden = false; w.textContent = "⚠ Not saved · " + code;
  const why = {
    no_host: "This copy of the page is not running inside Claude, so it has nothing to publish to. Everything still works — use Export to keep your notebook.",
    no_source: "The page could not read its own source, which the whole-page save needs. Use Export to keep your notebook and tell Claude this happened.",
    no_seed: "This version of the page has no place to write the notebook into. Use Export, then tell Claude.",
    too_large: "The notebook and its photographs are larger than one page can hold. Delete a few photographs, or split the notebook, then save again.",
    no_room: "This browser would not store the notebook — usually private browsing, or the site's storage is full. Export keeps a copy you can open anywhere.",
    rate_limited: "Saved too often in a short time. Wait half a minute and press Save again.",
    invalid_content: "The page that was submitted was not accepted. Use Export to keep your work and tell Claude.",
    upstream_error: "The save did not get through. Press Save again in a moment; if it keeps failing, use Export."
  }[code] || ("The save failed with the code “" + code + "”." + (msg ? " " + msg : ""));
  w.onclick = () => openModal(
    `<h3>Not saved</h3><div class="mb"><p class="note">${esc(why)}</p>
     <p class="note">Nothing has been lost — your notebook is still open and still editable, and a
     copy is kept in this browser. Export writes it to a file you can keep.</p></div>
     <div class="mf"><button class="btn" data-x="0">Close</button>
     <button class="btn" data-x="2">Export JSON</button>
     <button class="btn pri" data-x="1">Try saving again</button></div>`,
    m => { m.onclick = e => { const b = e.target.closest("[data-x]"); if (!b) return;
      const v = b.dataset.x; closeModal(null);
      if (v === "1") save(); if (v === "2") exportJSON(); }; });
  dirty(true);
}
$("#b-save").onclick = save;
function goReadOnly(msg){
  RO = true;
  $("#b-save").hidden = true; $("#b-newsec").hidden = true;
  $("#b-newpage").hidden = true; $("#b-today").hidden = true;
  SEL.clear(); drawAll();
  if (msg) toast(msg, 6000);
}
async function importJSON(){
  const v = await askArea("Import a notebook",
    "Paste the contents of an exported notebook file. This replaces what is open now.", "");
  if (v == null || !v.trim()) return;
  let d; try { d = JSON.parse(v); } catch(_){ return toast("That is not valid notebook JSON."); }
  const keep = NB;
  snap();
  if (!adopt(d)){ NB = keep; return toast("That file does not look like a notebook."); }
  SI = 0; PI = 0; SEL.clear(); BLOBS.clear(); KEEP.clear();
  $("#nbname").value = NB.title; dirty(); drawAll(); fitPage(false);
  toast("Notebook imported.");
}
async function exportJSON(){
  const data = JSON.stringify(serialise(), null, 2);
  const name = (NB.title||"notebook").toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40) + ".json";
  const dl = await use("downloads");
  if (dl){ try { await dl.save({filename:name, data}); toast("Copy saved."); return; } catch(_){} }
  const url = URL.createObjectURL(new Blob([data],{type:"application/json"}));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}

