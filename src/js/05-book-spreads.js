/* ═══════════════════════════════════════════════════════════════
   PART B — the notebook: spreads, gutter, binding, page numbers.

   A single page floating on a desk is a slide. Two facing pages
   with a gutter between them is a book — so the page is no longer
   the unit of view, the SPREAD is, and everything that used to
   assume one page now walks a small list of them.
   ═══════════════════════════════════════════════════════════════ */

const BINDS = {
  single: ["One page",  0],
  spread: ["Facing pages", 1]
};
const SPINES = {none:"None", stitch:"Stitched", spiral:"Spiral", tape:"Taped", perfect:"Glued"};

const gutterW = () => NB.bind === "spread" ? (NB.gutter == null ? 56 : NB.gutter) : 0;
const spreadOf = pi => Math.floor(pi / 2);

/* The pages on screen right now, each with its x offset in world. */
function viewPages(){
  const ps = sec().pages;
  const here = {p: ps[PI], pi: PI, ox: 0};
  /* a cover is always shown on its own — a book does not open
     onto its own boards */
  if (NB.bind !== "spread" || isCover(ps[PI])) return [here];
  const [pw] = PAGE_SIZES[ps[PI].size] || PAGE_SIZES.land;
  const l = spreadOf(PI) * 2;
  if (isCover(ps[l]) || isCover(ps[l+1])) return [here];
  const out = [{p: ps[l], pi: l, ox: 0}];
  if (ps[l + 1]) out.push({p: ps[l + 1], pi: l + 1, ox: pw + gutterW()});
  return out;
}
function viewBlocks(){
  const out = [];
  for (const v of viewPages()) for (const b of (v.p.blocks || [])) out.push(b);
  return out;
}
function pageOfBlock(id){
  for (const v of viewPages()) if ((v.p.blocks||[]).some(b => b.id === id)) return v;
  return viewPages()[0];
}
const oxOf = id => pageOfBlock(id).ox;
/* world extent of everything on view */
function viewSize(){
  const v = viewPages(), last = v[v.length-1];
  const [pw,ph] = PAGE_SIZES[last.p.size] || PAGE_SIZES.land;
  return [last.ox + pw, ph];
}

function drawPages(){
  const host = $("#pages");
  host.innerHTML = "";
  const v = viewPages();
  /* the gutter is filled with the same paper, so an open book
     reads as one sheet folded — not two slides with a gap */
  if (NB.bind === "spread" && v.length === 2){
    const [pw,ph] = PAGE_SIZES[v[0].p.size] || PAGE_SIZES.land;
    const pa = PAPERS[v[0].p.paper] || PAPERS.plain;
    const fill = document.createElement("div");
    fill.className = "bodyfill";
    fill.style.cssText = `left:${pw-2}px;width:${gutterW()+4}px;height:${ph}px;` +
      `background-color:${pa.bg};${pa.css}`;
    fill.innerHTML = `<div class="grain"></div>`;
    host.appendChild(fill);
  }
  for (const {p, pi, ox} of v){
    const [w,h] = PAGE_SIZES[p.size] || PAGE_SIZES.land;
    const cov = isCover(p);
    const pa = PAPERS[p.paper] || PAPERS.plain;
    const el = document.createElement("div");
    el.className = "pg" + (cov ? " cover" : ""); el.dataset.pi = pi;
    el.style.cssText = `left:${ox}px;top:0;width:${w}px;height:${h}px`;
    const side = NB.bind === "spread" ? (ox ? "r" : "l") : "s";
    el.innerHTML =
      (cov ? `<div class="paper" style="${coverCSS(p)}"><div class="grain"></div></div>
              <div class="spinestrip"></div>${coverInner(p)}`
           : `<div class="paper" style="background-color:${pa.bg};${pa.css}"><div class="grain"></div></div>`) +
      (!cov && NB.gutterShade !== false && NB.bind === "spread"
        ? `<div class="gut ${side}"></div>` : "") +
      (!cov && NB.nums !== false ? `<div class="pnum ${side}">${pageNo(pi)}</div>` : "") +
      (v.length === 2 ? `<div class="edges ${ox ? "r" : "l"}"></div>`
        : `<div class="edges r"></div>`) +
      `<div class="holder"></div>`;
    host.appendChild(el);
  }
  /* the binding itself, drawn between the two pages */
  const sp = $("#spine");
  if (NB.bind === "spread" && v.length === 2 && (NB.spine || "stitch") !== "none"){
    const [pw,ph] = PAGE_SIZES[v[0].p.size] || PAGE_SIZES.land;
    sp.hidden = false;
    sp.className = "sp-" + (NB.spine || "stitch");
    sp.style.cssText = `left:${pw}px;top:0;width:${gutterW()}px;height:${ph}px`;
  } else sp.hidden = true;

  const [vw, vh] = viewSize();
  for (const id of ["#guides","#wet"]){
    const o = $(id); o.setAttribute("width", vw); o.setAttribute("height", vh);
  }
}

function drawBlocks(){
  drawPages();
  for (const {p, pi} of viewPages()){
    const host = $(`#pages .pg[data-pi="${pi}"] .holder`);
    if (!host) continue;
    const [pw,ph] = PAGE_SIZES[p.size] || PAGE_SIZES.land;
    for (const b of p.blocks){
      const el = document.createElement("div");
      el.className = "blk"; el.dataset.id = b.id;
      const auto = AUTO_H(b), fit = FITS.has(b.t);
      el.style.cssText = `left:${b.x}px;top:${b.y}px;` +
        (fit ? "" : `width:${b.w}px;` + (auto && !b.h ? "" : `height:${b.h}px;`)) +
        `transform:rotate(${b.rot||0}deg)`;
      if (isLocked(b)) el.classList.add("lk");
      if (b.id === CROP) el.classList.add("crop");
      el.innerHTML = blockHTML(b) + `<div class="hit"></div>`;
      host.appendChild(el);
      if (fit){                    /* the box is whatever was drawn */
        b.w = Math.max(8, el.offsetWidth);
        b.h = Math.max(8, el.offsetHeight);
      } else if (auto && !b.h){
        b.h = Math.max(el.offsetHeight, b.t === "text" ? Math.round((b.size||16)*1.6) : 10);
        el.style.height = b.h + "px";
      }
      /* measured last, because a fitted block does not know its size
         until it has been drawn */
      if (b.x + b.w < -4 || b.y + (b.h||30) < -4 || b.x > pw+4 || b.y > ph+4) el.classList.add("off");
    }
  }
}

/* selection boxes live in WORLD space, so a multi-select can
   reach across the gutter and still draw one honest rectangle */
function selBox(){
  const arr = selArr(); if (!arr.length) return null;
  if (arr.length === 1){ const b = arr[0], ox = oxOf(b.id);
    return {x:b.x + ox, y:b.y, w:b.w, h:b.h||30, rot:b.rot||0, multi:false}; }
  let a=1e9,c=1e9,d=-1e9,e=-1e9;
  for (const b of arr){ const ox = oxOf(b.id);
    a=Math.min(a,b.x+ox); c=Math.min(c,b.y);
    d=Math.max(d,b.x+ox+b.w); e=Math.max(e,b.y+(b.h||30)); }
  return {x:a,y:c,w:d-a,h:e-c,rot:0,multi:true};
}

function fitPage(anim){
  const c = $("#canvas").getBoundingClientRect(), [vw,vh] = viewSize();
  const pad = PRESENT ? 26 : 52;
  const z = clamp(Math.min((c.width-pad*2)/vw, (c.height-pad*2)/vh), .06, 3);
  const to = {z, x:(c.width-vw*z)/2, y:(c.height-vh*z)/2};
  if (!anim){ Object.assign(W,to); camApply(); return; }
  const from = {...W}, t0 = performance.now();
  (function step(t){
    const k = clamp((t-t0)/300,0,1), e = 1-Math.pow(1-k,3);
    W.x = from.x+(to.x-from.x)*e; W.y = from.y+(to.y-from.y)*e; W.z = from.z+(to.z-from.z)*e;
    camApply(); if (k<1) requestAnimationFrame(step);
  })(t0);
}

/* which page is a given world x over? used when a piece is
   dragged across the gutter onto the other leaf */
function pageAtX(wx){
  const v = viewPages();
  for (let i = v.length - 1; i >= 0; i--){
    const [pw] = PAGE_SIZES[v[i].p.size] || PAGE_SIZES.land;
    if (wx >= v[i].ox - gutterW()/2 && wx <= v[i].ox + pw + gutterW()/2) return v[i];
  }
  return wx < v[0].ox ? v[0] : v[v.length-1];
}
function rehomeBlocks(arr){
  if (NB.bind !== "spread") return false;
  let moved = false;
  for (const b of arr){
    const from = pageOfBlock(b.id);
    const to = pageAtX(from.ox + b.x + b.w/2);
    if (to.p === from.p) continue;
    from.p.blocks = from.p.blocks.filter(q => q.id !== b.id);
    b.x = Math.round(from.ox + b.x - to.ox);
    to.p.blocks.push(b);
    moved = true;
  }
  return moved;
}

function snapDelta(wx, wy){
  const moving = ORIG.blocks;                /* each carries its own ox */
  const wxs = moving.map(o => o.x + o.ox);
  const box = {x: Math.min(...wxs) + wx, y: Math.min(...moving.map(o=>o.y)) + wy};
  box.w = Math.max(...moving.map(o=>o.x+o.ox+o.w)) + wx - box.x;
  box.h = Math.max(...moving.map(o=>o.y+(o.h||30))) + wy - box.y;
  const tol = SNAP_PX/W.z;
  const xs = [], ys = [];
  for (const v of viewPages()){
    const [pw,ph] = PAGE_SIZES[v.p.size] || PAGE_SIZES.land;
    xs.push(v.ox, v.ox+pw/2, v.ox+pw); ys.push(0, ph/2, ph);
    for (const o of v.p.blocks){
      if (SEL.has(o.id)) continue;
      xs.push(o.x+v.ox, o.x+v.ox+o.w/2, o.x+v.ox+o.w);
      ys.push(o.y, o.y+(o.h||30)/2, o.y+(o.h||30));
    }
  }
  const st = curSten();
  if (st && NB.stenSnap !== false && NB.stenOn !== false)
    for (const v of viewPages()) for (const c of st.cells){
      xs.push(c[0]+v.ox, c[0]+v.ox+c[2]/2, c[0]+v.ox+c[2]);
      ys.push(c[1], c[1]+c[3]/2, c[1]+c[3]);
    }
  let bx = null, by = null, gx = null, gy = null;
  for (const t of xs) for (const mine of [box.x, box.x+box.w/2, box.x+box.w]){
    const d = t-mine; if (Math.abs(d) < tol && (bx===null || Math.abs(d)<Math.abs(bx))){ bx=d; gx=t; }
  }
  for (const t of ys) for (const mine of [box.y, box.y+box.h/2, box.y+box.h]){
    const d = t-mine; if (Math.abs(d) < tol && (by===null || Math.abs(d)<Math.abs(by))){ by=d; gy=t; }
  }
  return {x: wx+(bx||0), y: wy+(by||0), gx, gy};
}
function drawGuides(gx, gy){
  const [vw,vh] = viewSize();
  $("#guides").innerHTML =
    (gx!=null ? `<line x1="${gx}" y1="-400" x2="${gx}" y2="${vh+400}"></line>` : "") +
    (gy!=null ? `<line x1="-400" y1="${gy}" x2="${vw+400}" y2="${gy}"></line>` : "");
}

/* the stencil repeats on each leaf of the spread */
function drawSten(){
  const el = $("#sten"), s = curSten();
  const show = s && NB.stenOn !== false && !PRESENT;
  el.hidden = !show;
  if (!show){ el.innerHTML = ""; return; }
  el.innerHTML = viewPages().map(v => s.cells.map((c,i) =>
    `<i style="left:${c[0]+v.ox}px;top:${c[1]}px;width:${c[2]}px;height:${c[3]}px"><b>${i+1}</b></i>`
  ).join("")).join("");
}

