/* ═══════════════════════════════════════════════════════════════
   PART 2 — the stencil layer, the rulers, and the layout gallery.
   ═══════════════════════════════════════════════════════════════ */

/* ── STENCILS ────────────────────────────────────────────────
   A stencil is a shaded plan drawn UNDER everything and touched
   by nothing: it takes no clicks, prints on no page, and leaves
   no trace in what you made. Its only effect is that dragging
   snaps to it, so a spacing you settled on once is a spacing you
   can hit again on every page after.                          */
const STOCK_STENCILS = [
  {id:"st-margin", name:"Margins", cells:[[70,60,1140,680]]},
  {id:"st-2col",   name:"Two columns", cells:[[70,60,548,680],[662,60,548,680]]},
  {id:"st-3col",   name:"Three columns", cells:[[70,60,356,680],[462,60,356,680],[854,60,356,680]]},
  {id:"st-third",  name:"Thirds", cells:[[70,60,1140,220],[70,300,1140,200],[70,520,1140,220]]},
  {id:"st-daily",  name:"Daily planner", cells:[[70,56,180,688],[280,56,600,140],[280,216,600,528],[910,56,300,420],[910,496,300,248]]},
  {id:"st-grid",   name:"Grid 4 × 3", cells:(()=>{const c=[];for(let r=0;r<3;r++)for(let k=0;k<4;k++)c.push([70+k*292,60+r*236,272,216]);return c;})()},
  {id:"st-week",   name:"Week, seven up", cells:(()=>{const c=[];for(let i=0;i<7;i++)c.push([64+i*166,120,150,620]);return c;})()},
  {id:"st-gallery",name:"Gallery wall", cells:[[80,70,520,420],[630,70,250,200],[630,290,250,200],[910,70,300,420],[80,520,520,220],[630,520,580,220]]}
];
function stencils(){ return STOCK_STENCILS.concat(NB.stencils || []); }
function stenById(id){ return stencils().find(s => s.id === id) || null; }
function curSten(){ return page() && page().sten ? stenById(page().sten) : null; }

function stenMenu(anchor){
  const cur = page().sten || "";
  popup(anchor, `<div class="gl">Stencil on this page</div>
    <button data-sten=""><span class="gicon">∅</span>None${cur===""?' <span class="k">✓</span>':""}</button>
    ${stencils().map(s => `<button data-sten="${esc(s.id)}"><span class="gicon">▦</span>${esc(s.name)}
      <span class="k">${s.cells.length} cells${cur===s.id?" ✓":""}</span></button>`).join("")}
    <hr>
    <button data-sx="make"><span class="gicon">✥</span>Make one from the selection</button>
    <button data-sx="all"><span class="gicon">▤</span>Use this stencil on every page</button>
    <button data-sx="del"><span class="gicon">🗑</span>Delete a stencil of mine…</button>
    <hr>
    <button data-sx="show"><span class="gicon">${NB.stenOn===false?"○":"●"}</span>Show the stencil<span class="k">G</span></button>
    <button data-sx="snap"><span class="gicon">${NB.stenSnap===false?"○":"●"}</span>Snap to it while dragging</button>
    <button data-sx="rule"><span class="gicon">${NB.rulers?"●":"○"}</span>Rulers down the edges<span class="k">R</span></button>`,
  e => {
    const p = e.target.closest("[data-sten]");
    if (p){ snap(); page().sten = p.dataset.sten || null; dirty(); drawSten(); closePop(); drawTools(); return; }
    const x = e.target.closest("[data-sx]"); if (!x) return;
    const k = x.dataset.sx;
    if (k === "show"){ NB.stenOn = NB.stenOn === false; dirty(); drawSten(); closePop(); return; }
    if (k === "snap"){ NB.stenSnap = NB.stenSnap === false; dirty(); closePop(); return; }
    if (k === "rule"){ NB.rulers = !NB.rulers; dirty(); drawRulers(); closePop(); return; }
    if (k === "all"){
      const id = page().sten;
      if (!id) return toast("Pick a stencil for this page first.");
      snap(); NB.sections.forEach(s => s.pages.forEach(p2 => p2.sten = id));
      dirty(); closePop(); toast("Every page now carries that stencil.");
      return;
    }
    if (k === "make") { closePop(); makeSten(); return; }
    if (k === "del")  { closePop(); delSten(); return; }
  });
}
async function makeSten(){
  const arr = selArr();
  if (arr.length < 1) return toast("Select the pieces whose spacing you want to keep, then try again.");
  const name = await askText("Name this stencil",
    "It keeps the position and size of everything selected, and nothing else — no colours, no content.",
    "My layout", "Make stencil");
  if (name == null) return;
  snap();
  NB.stencils = NB.stencils || [];
  const st = {id:"my-"+uid(), name:name.trim() || "My layout",
    cells: arr.map(b => [Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h||30)])};
  NB.stencils.push(st); page().sten = st.id; NB.stenOn = true;
  dirty(); drawSten(); drawTools();
  toast(`“${st.name}” saved — it is on every stencil list from now on.`);
}
async function delSten(){
  const mine = NB.stencils || [];
  if (!mine.length) return toast("The built-in stencils stay; you have not made any of your own yet.");
  const v = await openModal(`<h3>Delete a stencil</h3><div class="mb">
    <p class="note">Only stencils you made are listed. Pages using it keep their spacing — they simply stop showing the plan.</p>
    ${mine.map(s => `<button class="btn" style="width:100%;justify-content:space-between;margin-bottom:6px"
      data-x="${esc(s.id)}">${esc(s.name)}<span class="eyebrow">${s.cells.length} cells</span></button>`).join("")}
    </div><div class="mf"><button class="btn" data-x="">Cancel</button></div>`,
    m => { m.onclick = e => { const b = e.target.closest("[data-x]"); if (b) closeModal(b.dataset.x || null); }; });
  if (!v) return;
  snap();
  NB.stencils = mine.filter(s => s.id !== v);
  NB.sections.forEach(s => s.pages.forEach(p => { if (p.sten === v) p.sten = null; }));
  dirty(); drawSten(); drawTools(); toast("Stencil deleted.");
}

/* ── RULERS ──────────────────────────────────────────────────
   Page millimetres along two edges, with a hairline that tracks
   the pointer — so you can read a position off the page instead
   of guessing it.                                             */
function drawRulers(){
  if (!NB) return;
  const on = !!NB.rulers && !PRESENT;
  document.body.classList.toggle("ruled", on);
  if (!on) return;
  const c = $("#canvas").getBoundingClientRect();
  const step = W.z > 1.4 ? 25 : W.z > .7 ? 50 : W.z > .35 ? 100 : 200;
  let t = "", l = "";
  const x0 = Math.floor(-W.x / W.z / step) * step, x1 = (c.width - W.x) / W.z;
  for (let v = x0; v < x1; v += step){
    const px = W.x + v * W.z;
    if (px < 0 || px > c.width) continue;
    t += `<i style="left:${px.toFixed(1)}px"><b>${v}</b></i>`;
  }
  const y0 = Math.floor(-W.y / W.z / step) * step, y1 = (c.height - W.y) / W.z;
  for (let v = y0; v < y1; v += step){
    const py = W.y + v * W.z;
    if (py < 0 || py > c.height) continue;
    l += `<i style="top:${py.toFixed(1)}px"><b>${v}</b></i>`;
  }
  $("#rulT").innerHTML = t; $("#rulL").innerHTML = l;
}
function moveRulerMark(cx, cy){
  if (!NB || !NB.rulers || PRESENT) return;
  const c = $("#canvas").getBoundingClientRect();
  $("#markX").style.left = (cx - c.left) + "px";
  $("#markY").style.top = (cy - c.top) + "px";
  const w = toWorld(cx, cy);
  $("#rulPos").textContent = Math.round(w.x) + ", " + Math.round(w.y);
}

/* ── LAYOUT GALLERY ──────────────────────────────────────────
   Every layout draws its own thumbnail from the very blocks it
   would place, so the picture cannot drift from the thing.    */
const LAY_TINT = {
  photo:"#8FA9B8", text:"#8A8175", note:"#E8CF7A", scrap:"#C9B48C", check:"#9BBE8E",
  spec:"#B0AAA0", swatch:"#A98A64", tag:"#C9A97C", ticket:"#D9C08A", stamp:"#B08A8A",
  ribbon:"#9E7E96", tape:"#CBB894", stitch:"#8A6034", date:"#B4635E", shape:"#CFC9BC",
  time:"#9AA8B4", month:"#94A89C", track:"#9BBE8E", mood:"#C9A0B4", rate:"#D4B35C",
  quote:"#A8A090", mark:"#B4635E", sticker:"#C4A24E", ink:"#4A4A4A"
};
function layPreview(name, w, h){
  const made = LAYOUTS[name]({x:0, y:0});
  let X0=1e9, Y0=1e9, X1=-1e9, Y1=-1e9;
  for (const b of made){
    const bh = b.h || (b.t === "text" ? (b.size||16)*1.7 : 28);
    X0 = Math.min(X0,b.x); Y0 = Math.min(Y0,b.y);
    X1 = Math.max(X1,b.x+b.w); Y1 = Math.max(Y1,b.y+bh);
  }
  const sw = X1-X0 || 1, sh = Y1-Y0 || 1;
  const k = Math.min((w-8)/sw, (h-8)/sh);
  const ox = (w - sw*k)/2, oy = (h - sh*k)/2;
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:100%;display:block">
    <rect width="${w}" height="${h}" rx="3" fill="#FAF7F1"/>
    ${made.map(b => {
      const bh = b.h || (b.t === "text" ? (b.size||16)*1.7 : 28);
      const x = ox + (b.x-X0)*k, y = oy + (b.y-Y0)*k;
      const bw = Math.max(1.5, b.w*k), bhh = Math.max(1.5, bh*k);
      const f = LAY_TINT[b.t] || "#B8B2A6";
      const r = b.t === "text" || b.t === "stitch" ? 0.5 : 1.5;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}"
        height="${bhh.toFixed(1)}" rx="${r}" fill="${f}" opacity="${b.t==="text"?.55:.85}"/>`;
    }).join("")}</svg>`;
}
function layoutMenu(anchor){
  const keys = Object.keys(LAYOUTS);
  popup(anchor, `<div class="gl">Drop in an arrangement — hover to see it</div>
    <div class="laygrid">${keys.map(k => `
      <button class="laycard" data-lay="${esc(k)}">
        <span class="thumb">${layPreview(k, 132, 86)}</span>
        <span class="nm">${esc(k)}</span>
        <span class="ct">${LAYOUTS[k]({x:0,y:0}).length} pieces</span>
      </button>`).join("")}</div>`,
  e => {
    const l = e.target.closest("[data-lay]"); if (!l) return;
    const p = centreOfView();
    const made = LAYOUTS[l.dataset.lay]({x:Math.round(p.x-300), y:Math.round(p.y-220)});
    snap(); putBlocks(made, p); SEL = new Set(made.map(b=>b.id));
    dirty(); drawBlocks(); drawSel(); drawTools(); drawSide(); closePop();
    toast("Dropped in — now pull it apart.");
  }, "wide");
}

function doodleMenu(anchor, target){
  popup(anchor, `<div class="gl">Marks — drawn in your ink, not stuck on</div>
    <div class="dgrid">${Object.keys(DOODLES).map(k =>
      `<button class="dcard" data-dd="${k}" title="${esc(DOODLES[k][0])}">
        ${doodleSVG(k, "currentColor", 6)}</button>`).join("")}</div>`,
  e => {
    const d = e.target.closest("[data-dd]"); if (!d) return;
    closePop();
    if (target){ snap(); target.key = d.dataset.dd; }
    else { insert("doodle", centreOfView()); const b = selArr()[0]; if (b) b.key = d.dataset.dd; }
    dirty(); drawBlocks(); drawTools();
  }, "wide");
}

/* ── STICKER PICKER ────────────────────────────────────────── */
let SK_CAT = "holiday";
function stickerMenu(anchor){
  const draw = () => `<div class="gl">Stickers</div>
    <div class="skcats">${Object.keys(SK_CATS).map(c =>
      `<button class="chipb" data-cat="${c}" aria-pressed="${c===SK_CAT}">${SK_CATS[c]}</button>`).join("")}</div>
    <div class="skgrid">${Object.keys(SK[SK_CAT]).map(n =>
      `<button class="skcard" data-sk="${SK_CAT}/${n}" title="${esc(SK[SK_CAT][n][0])}">
        <span class="sv">${skSVG(SK_CAT+"/"+n)}</span>
        <span class="nm">${esc(SK[SK_CAT][n][0])}</span></button>`).join("")}</div>`;
  popup(anchor, draw(), e => {
    const c = e.target.closest("[data-cat]");
    if (c){ SK_CAT = c.dataset.cat; $("#pop").innerHTML = draw(); return; }
    const s = e.target.closest("[data-sk]");
    if (s){ closePop(); insertSticker(s.dataset.sk); }
  }, "wide");
}
function insertSticker(key, at){
  const p = at || centreOfView();
  const m = skMode(key);
  const b = m === "repeat" ? blk("sticker", Math.round(p.x-210), Math.round(p.y-26), 420, 52, {key, rot:0})
    : m === "stretch"      ? blk("sticker", Math.round(p.x-190), Math.round(p.y-34), 380, 68, {key, rot:0})
    : m === "fixed"        ? blk("sticker", Math.round(p.x-64), Math.round(p.y-64), 128, 128, {key, rot:0})
    : blk("sticker", Math.round(p.x-45), Math.round(p.y-45), 90, 90, {key, rot: Math.random()*16-8, die:true});
  snap(); putBlocks([b], p); SEL = new Set([b.id]);
  dirty(); drawBlocks(); drawSel(); drawTools(); drawSide();
}

