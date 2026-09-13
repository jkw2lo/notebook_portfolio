/* ═══════════════════════════════════════════════════════════════
   PART F — saving where there is no host, and page templates.
   ═══════════════════════════════════════════════════════════════ */

/* ── PHOTOGRAPHS THAT SURVIVE A RELOAD ───────────────────────
   A `blob:` URL dies with the page, so a notebook kept only in
   localStorage came back with empty frames. The pictures go in
   IndexedDB under the block's own id and are rehydrated on load.
   Everything here fails soft: a browser with storage switched off
   gets a notebook with no photographs, not a broken page.       */
const IDB_NAME = "notebook-portfolio", IDB_STORE = "photos";
let IDB = null;
function idb(){
  if (IDB) return IDB;
  IDB = new Promise(res => {
    try {
      const rq = indexedDB.open(IDB_NAME, 1);
      rq.onupgradeneeded = () => {
        const d = rq.result;
        if (!d.objectStoreNames.contains(IDB_STORE)) d.createObjectStore(IDB_STORE);
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => res(null);
    } catch(_){ res(null); }
  });
  return IDB;
}
async function idbDo(mode, fn){
  const d = await idb(); if (!d) return null;
  try {
    return await new Promise((res, rej) => {
      const tx = d.transaction(IDB_STORE, mode);
      const rq = fn(tx.objectStore(IDB_STORE));
      if (rq){ rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); }
      else tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    });
  } catch(_){ return null; }
}
const idbPut = (id, blob) => idbDo("readwrite", s => s.put(blob, id));
const idbGet = id        => idbDo("readonly",  s => s.get(id));
const idbDel = id        => idbDo("readwrite", s => s.delete(id));

/* Put every photograph back on the page it belongs to. Called once
   at boot, after the notebook has been adopted. */
async function restorePhotos(){
  const pages = NB.sections.flatMap(s => s.pages);
  let back = 0;
  for (const p of pages) for (const b of p.blocks){
    if (!("src" in b)) continue;
    const live = b.src && !String(b.src).startsWith("blob:");
    if (live) continue;                       /* a data: or media/ path is fine as it is */
    const blob = await idbGet(b.id);
    if (!blob) { if (b.src) b.src = null; continue; }
    b.src = URL.createObjectURL(blob);
    KEEP.set(b.id, blob);                     /* so a later save can publish it */
    back++;
  }
  if (back){ drawBlocks(); drawSide(); }
  return back;
}

/* ── SAVING WITH NOWHERE TO PUBLISH ──────────────────────────
   Opened from a folder or off a web server there is no artifact to
   write a version into — but "you must export to keep anything" is
   a bad answer. This keeps the notebook in the browser properly,
   photographs included, and says so plainly.                    */
async function saveLocal(){
  const btn = $("#b-save");
  btn.disabled = true; btn.textContent = "Saving…";
  let n = 0;
  try {
    for (const [id, blob] of BLOBS){ await idbPut(id, blob); KEEP.set(id, blob); n++; }
    BLOBS.clear();
    localStorage.setItem("pb.draft", JSON.stringify(serialise()));
    dirty(false);
    const first = !saveLocal.done; saveLocal.done = true;
    toast(first
      ? "Kept in this browser, photographs and all. It will be here when you come back — " +
        "use Export for a copy you can move."
      : n ? `Saved — ${n} photograph${n>1?"s":""} kept.` : "Saved.", first ? 5200 : 2400);
  } catch(err){
    dirty(true);
    warnSave("no_room", err && err.message);
  }
}

/* ── PAGE TEMPLATES ──────────────────────────────────────────
   A daily page has a shape you settle into. Rebuilding it every
   morning, or duplicating yesterday and editing the date, is the
   friction this removes: lay one out, keep it, stamp it out.   */
function templates(){ return NB.templates || (NB.templates = []); }

/* Anything dated on a stamped-out page means the day it was stamped,
   not the day the template was designed. */
function stampToday(blocks){
  const iso = today().iso;
  for (const b of blocks){
    if (b.t !== "date") continue;
    b.iso = iso;
    delete b.sub;                              /* let the weekday follow the date */
    if (b.fmt === "custom") delete b.fmt;
  }
  return blocks;
}
function cloneBlocks(list){
  return list.map(b => {
    const c = JSON.parse(JSON.stringify(b));
    c.id = uid();
    const bl = blobFor(b.id);
    if (bl){ BLOBS.set(c.id, bl); c.src = URL.createObjectURL(bl); }
    return c;
  });
}
function pageFromTemplate(t, name){
  const p = {id:uid(), name: name || t.name, size:t.size || "land",
    paper:t.paper || "plain", sten:t.sten || null, blocks:stampToday(cloneBlocks(t.blocks || []))};
  if (t.kind === "cover"){ p.kind = "cover"; p.cover = JSON.parse(JSON.stringify(t.cover || {})); }
  return p;
}
function dailyTemplate(){
  return templates().find(t => t.id === NB.daily) || null;
}

async function saveTemplate(){
  const p = page();
  const v = await askText("Keep this page as a template",
    "Its pieces, paper and size — not its name. Dates are re-stamped to the day it is used.",
    p.name && !/^Page /.test(p.name) ? p.name : "My daily page", "Keep");
  if (v == null) return;
  snap();
  const t = {id:"t-"+uid(), name:v.trim() || "Untitled template", size:p.size, paper:p.paper,
    sten:p.sten || null, blocks:JSON.parse(JSON.stringify(p.blocks))};
  if (isCover(p)){ t.kind = "cover"; t.cover = JSON.parse(JSON.stringify(p.cover || {})); }
  templates().push(t);
  if (!NB.daily) NB.daily = t.id;
  dirty(); drawTools();
  toast(`“${t.name}” kept${NB.daily === t.id ? " — and it is what “+ Today” now stamps out" : ""}.`, 4600);
}

function tmplMenu(anchor){
  const list = templates();
  popup(anchor, `<div class="gl">Templates</div>
    <button data-tx="save"><span class="gicon">＋</span>Keep this page as a template…</button>
    ${list.length ? `<hr><div class="gl">Start a page from</div>` +
      list.map(t => `<button data-tnew="${esc(t.id)}"><span class="gicon">▤</span>${esc(t.name)}
        <span class="k">${(t.blocks||[]).length} pieces</span></button>`).join("") +
      `<hr><div class="gl">“+ Today” uses</div>` +
      list.map(t => `<button data-tday="${esc(t.id)}"><span class="gicon">${NB.daily===t.id?"●":"○"}</span>
        ${esc(t.name)}</button>`).join("") +
      `<button data-tday=""><span class="gicon">${NB.daily?"○":"●"}</span>The built-in daily page</button>
       <hr><button data-tx="del"><span class="gicon">🗑</span>Delete a template…</button>`
    : `<hr><div class="gl">Lay a page out the way you like it, then keep it here. “+ Today”
       will stamp it out with the date already right.</div>`}`,
  async e => {
    const nw = e.target.closest("[data-tnew]");
    if (nw){
      const t = templates().find(x => x.id === nw.dataset.tnew); if (!t) return;
      closePop(); snap();
      sec().pages.splice(PI + 1, 0, pageFromTemplate(t));
      PI = PI + 1; SEL.clear(); dirty(); drawAll(); fitPage(false);
      toast(`A page from “${t.name}”.`); return;
    }
    const dy = e.target.closest("[data-tday]");
    if (dy){ snap(); NB.daily = dy.dataset.tday || null; dirty(); closePop(); drawTools();
      toast(NB.daily ? "“+ Today” will use that template." : "“+ Today” is back to the built-in page.");
      return; }
    const x = e.target.closest("[data-tx]"); if (!x) return;
    closePop();
    if (x.dataset.tx === "save") return saveTemplate();
    if (x.dataset.tx === "del"){
      const v = await openModal(`<h3>Delete a template</h3><div class="mb">
        <p class="note">Pages already made from it are not touched.</p>
        ${templates().map(t => `<button class="btn" style="width:100%;justify-content:space-between;
          margin-bottom:6px" data-x="${esc(t.id)}">${esc(t.name)}
          <span class="eyebrow">${(t.blocks||[]).length} pieces</span></button>`).join("")}
        </div><div class="mf"><button class="btn" data-x="">Cancel</button></div>`,
        m => { m.onclick = ev => { const b = ev.target.closest("[data-x]");
          if (b) closeModal(b.dataset.x || null); }; });
      if (!v) return;
      snap();
      NB.templates = templates().filter(t => t.id !== v);
      if (NB.daily === v) NB.daily = null;
      dirty(); drawTools(); toast("Template deleted.");
    }
  });
}
