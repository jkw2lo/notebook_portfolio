/* ════ BOOT ═════════════════════════════════════════════════ */
function use(n){
  try { if (window.claude && typeof window.claude.use === "function") return window.claude.use(n); }
  catch(_){}
  return Promise.resolve(null);
}
/* Text was styled by a "preset" before roles existed. Carry the old
   choice across so nothing that was already written changes face. */
const OLD_PRESET = {display:["title","disp"], body:["body","body"], label:["label","mono"],
  hand:["body","hand"], type:["body","type"]};
function migrate(b){
  if (b.t === "text" && !b.role){
    const m = OLD_PRESET[b.preset] || OLD_PRESET.body;
    b.role = m[0]; if (!b.font) b.font = m[1];
  }
  delete b.preset;
  return b;
}
function adopt(d){
  if (!d || !Array.isArray(d.sections) || !d.sections.length) return false;
  NB = {title: d.title || "My journal", version:3, sections:d.sections,
    stencils: Array.isArray(d.stencils) ? d.stencils : [],
    stenOn: d.stenOn !== false, stenSnap: d.stenSnap !== false, rulers: !!d.rulers,
    bind: d.bind || "single", gutter: d.gutter == null ? 56 : d.gutter,
    spine: d.spine || "stitch", gutterShade: d.gutterShade !== false,
    nums: d.nums !== false, anim: d.anim !== false, readonly: !!d.readonly,
    kit: KITS[d.kit] ? d.kit : "Bench"};
  /* the cover used to be one hidden thing on the notebook; it is a
     page now, so fold the old one into the front of the first section */
  if (d.cover && d.cover.on !== false && !NB.sections.some(x => x.pages.some(isCover))){
    const old = d.coverPage && Array.isArray(d.coverPage.blocks) ? d.coverPage : {blocks:[]};
    NB.sections[0].pages.unshift({id: old.id || uid(), name:"Cover", kind:"cover",
      size: old.size || "land", paper:"plain", blocks: old.blocks || [],
      cover:{material:d.cover.material||"cloth", color:d.cover.color||"#3A4E4A",
        style:d.cover.style||"label", foil:d.cover.foil||"#D9C08A",
        title:d.cover.title != null ? d.cover.title : (d.title||""), sub:d.cover.sub||""}});
  }
  for (const sc of NB.sections) for (const p of sc.pages)
    if (isCover(p)) p.blocks = (p.blocks||[]).map(b => migrate({rot:0, ...b}));
  for (const s of NB.sections){
    s.color = s.color || SECT_COLORS[0];
    s.pages = (s.pages||[]).map(p => ({size:"land", paper:"plain", sten:null, blocks:[], ...p}));
    if (!s.pages.length) s.pages = [{id:uid(), name:"Page 1", size:"land", paper:"plain", sten:null, blocks:[]}];
    for (const p of s.pages) p.blocks = (p.blocks||[]).map(b => migrate({rot:0, ...b}));
  }
  return true;
}
(async function boot(){
  let loaded = false;
  try { const r = await fetch("data/notebook.json",{cache:"no-store"}); if (r.ok) loaded = adopt(await r.json()); }
  catch(_){}
  if (!loaded){                                  /* a whole-page save bakes it in here */
    try { const el = document.getElementById("seed");
      if (el) loaded = adopt(JSON.parse(el.textContent)); } catch(_){}
  }
  if (!loaded){ try { const d = localStorage.getItem("pb.draft"); if (d) loaded = adopt(JSON.parse(d)); } catch(_){} }
  if (!loaded) NB = seed();
  $("#nbname").value = NB.title;
  drawAll(); fitPage(false); dirty(!loaded);
  if (NB.readonly){                     /* a standalone copy: read it, do not edit it */
    goReadOnly(); setPresent(true);
    $("#b-present").hidden = false;
    return;
  }
  CAP = await use("artifact");
  if (!CAP){
    /* served as an ordinary web page: there is nothing to publish into,
       so Save becomes the thing that actually keeps the work */
    HOSTLESS = true;
    const b = $("#b-save");
    b.hidden = false; b.disabled = false; b.textContent = "↓ Export";
    b.title = "Save a standalone copy — this page cannot publish";
    b.onclick = exportStandalone;
    dirty(true);
  }
  if (!loaded) toast("Double-click the page to write. Press P for the pen. Drop photos anywhere.", 5200);
})();
