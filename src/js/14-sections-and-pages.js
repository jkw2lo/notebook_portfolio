/* ════ SECTIONS & PAGES ═════════════════════════════════════ */
$("#seclist").onclick = e => {
  const r = e.target.closest("[data-si]"); if (!r) return;
  if (+r.dataset.si === SI) return renameSection();
  SI = +r.dataset.si; PI = 0; SEL.clear(); drawAll(); fitPage(false);
};
$("#pagelist").onclick = e => {
  const r = e.target.closest("[data-pi]"); if (!r) return;
  const t = +r.dataset.pi;
  if (t === PI) return renamePage();
  PI = t; SEL.clear(); drawAll(); fitPage(false);
  document.body.classList.remove("side-open");
};
/* pages are re-ordered by dragging them in the rail */
(function pageDnD(){
  const list = $("#pagelist"); let src = null;
  list.addEventListener("dragstart", e => {
    src = e.target.closest('.prow[draggable="true"]');
    if (src) { src.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; }
  });
  list.addEventListener("dragend", () => { if (src) src.classList.remove("drag"); src = null; });
  list.addEventListener("dragover", e => {
    if (!src) return;
    e.preventDefault();
    const over = e.target.closest('.prow[draggable="true"]');
    if (!over || over === src) return;
    const r = over.getBoundingClientRect();
    list.insertBefore(src, (e.clientY - r.top)/r.height > .5 ? over.nextSibling : over);
  });
  list.addEventListener("drop", e => {
    if (!src) return;
    e.preventDefault();
    const order = [...list.querySelectorAll('.prow[draggable="true"]')].map(n => +n.dataset.pi);
    const keep = sec().pages[PI];
    snap();
    sec().pages = order.map(i => sec().pages[i]).filter(Boolean);
    PI = Math.max(0, sec().pages.indexOf(keep));
    dirty(); drawAll();
    toast("Pages re-ordered.");
  });
})();
$("#b-newsec").onclick = async () => {
  const v = await askSection("New section", "", SECT_COLORS[NB.sections.length % SECT_COLORS.length]);
  if (!v) return;
  snap();
  NB.sections.push({id:uid(), name:v.name || "Untitled section", color:v.color,
    pages:[{id:uid(), name:"Page 1", size:"land", paper:"plain", blocks:[]}]});
  SI = NB.sections.length-1; PI = 0; SEL.clear(); dirty(); drawAll(); fitPage(false);
  toast("Section added.");
};
$("#b-newpage").onclick = () => {
  snap();
  sec().pages.push({id:uid(), name:"Page " + (sec().pages.length+1),
    size: page()?page().size:"land", paper: page()?page().paper:"plain", blocks:[]});
  PI = sec().pages.length-1; SEL.clear(); dirty(); drawAll(); fitPage(false);
};
$("#b-newcover").onclick = () => {
  snap();
  const at = sec().pages.length ? PI + 1 : 0;
  sec().pages.splice(at, 0, {id:uid(), name:"Cover", kind:"cover",
    size: page() ? page().size : "land", paper:"plain", blocks:[],
    cover:{material:"cloth", color:"#3A4E4A", style:"label", foil:"#D9C08A",
      title: NB.title || "", sub:""}});
  PI = at; SEL.clear(); dirty(); drawAll(); fitPage(false);
  toast("A cover. Its material and blocking are in the Page controls above.", 4200);
};
$("#b-today").onclick = () => {
  const t = today();
  snap();
  const p = {id:uid(), name:t.iso, size:"land", paper:"ruled", blocks:[]};
  sec().pages.push(p); PI = sec().pages.length-1;
  p.blocks.push(...LAYOUTS["Daily entry"]({x:92, y:64}));
  SEL.clear(); dirty(); drawAll(); fitPage(false);
  toast(t.nice + " — a fresh page.");
};
async function renameSection(){
  const v = await askSection("Rename section", sec().name, sec().color);
  if (!v) return;
  snap(); sec().name = v.name || sec().name; sec().color = v.color; dirty(); drawSide();
}
async function renamePage(){
  const v = await askText("Rename page", null, page().name, "Rename");
  if (v == null) return;
  snap(); page().name = v.trim() || page().name; dirty(); drawSide();
}
function dupPage(){
  snap();
  const c = JSON.parse(JSON.stringify(page()));
  c.id = uid(); c.name = page().name + " copy";
  c.blocks.forEach(b => { const old = b.id; b.id = uid();
    const bl = blobFor(old); if (bl) BLOBS.set(b.id, bl); });
  sec().pages.splice(PI+1, 0, c); PI++; SEL.clear(); dirty(); drawAll();
}
async function delPage(){
  if (sec().pages.length === 1){
    if (NB.sections.length === 1) return toast("A notebook keeps at least one page.");
    if (!await askConfirm("Delete section", `“${sec().name}” has one page left. Delete the whole section?`, "Delete section")) return;
    snap(); NB.sections.splice(SI,1); SI = clamp(SI,0,NB.sections.length-1); PI = 0;
    SEL.clear(); dirty(); drawAll(); fitPage(false); return;
  }
  if (!await askConfirm("Delete page", `“${page().name}” and everything on it.`, "Delete page")) return;
  snap(); sec().pages.splice(PI,1); PI = clamp(PI,0,sec().pages.length-1);
  SEL.clear(); dirty(); drawAll(); fitPage(false);
}
$("#nbname").oninput = e => { NB.title = e.target.value; dirty(); };
$("#b-side").onclick = () => document.body.classList.toggle("side-open");
$("#b-objs").onclick = () => {
  OBJS_ON = !OBJS_ON;
  document.body.classList.toggle("objs-open", OBJS_ON);
  $("#b-objs").setAttribute("aria-pressed", String(OBJS_ON));
  drawObjs(); fitPage(true);
};
$("#objs-x").onclick = () => $("#b-objs").click();
wireObjs();

