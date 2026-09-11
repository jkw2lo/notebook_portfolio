/* ═══════════════════════════════════════════════════════════════
   PART C — reading it as a book: flipping, printing, and a
   standalone copy that needs nothing but a browser.
   ═══════════════════════════════════════════════════════════════ */

/* where a new piece lands: the leaf it was dropped on, in that
   leaf's own coordinates */
function targetPage(pt){
  const v = NB.bind === "spread" ? pageAtX(pt.x) : viewPages()[0];
  return {p: v.p, x: pt.x - v.ox, y: pt.y};
}

/* ── flipping ────────────────────────────────────────────────
   A spread does not cut to the next one, it turns. The leaf that
   is leaving is lifted out as a copy and rotated about the spine
   while the spread underneath is already the new one.         */
let FLIPPING = false;
function flip(dir){
  const wrap = $("#flip");
  if (FLIPPING || NB.bind !== "spread" || PRESENT === false || NB.anim === false){ return false; }
  /* #pages also holds the gutter fill, so :first-child is not the
     first LEAF — which is why turning back never fired */
  const leaves = $$("#pages .pg");
  const leaf = dir > 0 ? leaves[leaves.length - 1] : leaves[0];
  if (!leaf) return false;
  const r = leaf.getBoundingClientRect(), c = $("#canvas").getBoundingClientRect();
  const clone = leaf.cloneNode(true);
  clone.style.cssText = `left:0;top:0;width:${r.width}px;height:${r.height}px;position:absolute`;
  wrap.style.cssText = `left:${r.left-c.left}px;top:${r.top-c.top}px;width:${r.width}px;` +
    `height:${r.height}px;transform-origin:${dir > 0 ? "left" : "right"} center;` +
    `--sh:${dir > 0 ? "90deg" : "270deg"}`;
  wrap.innerHTML = ""; wrap.appendChild(clone);
  wrap.insertAdjacentHTML("beforeend", `<div class="shade"></div>`);
  wrap.hidden = false; FLIPPING = true;
  requestAnimationFrame(() => {
    wrap.classList.add("go");
    wrap.style.transform = `rotateY(${dir > 0 ? -170 : 170}deg)`;
  });
  setTimeout(() => {
    wrap.classList.remove("go"); wrap.hidden = true;
    wrap.style.transform = ""; wrap.innerHTML = ""; FLIPPING = false;
  }, 620);
  return true;
}

/* ── printing ────────────────────────────────────────────────
   Every page at its true size, one to a sheet, drawn from the
   same renderer as the screen so nothing can drift.           */
function buildPrint(list){
  const host = $("#printarea");
  host.innerHTML = "";
  let css = "";
  const all = list || NB.sections.flatMap(s => s.pages);
  all.forEach(p => {
    const [w,h] = PAGE_SIZES[p.size] || PAGE_SIZES.land;
    const pa = PAPERS[p.paper] || PAPERS.plain;
    const sheet = document.createElement("div");
    sheet.className = "psheet";
    sheet.style.cssText = `width:${w}px;height:${h}px;background-color:${pa.bg};${pa.css}`;
    const hold = document.createElement("div");
    hold.className = "holder"; hold.style.cssText = "position:absolute;inset:0";
    for (const b of p.blocks){
      if (b.x + b.w < 0 || b.y + (b.h||30) < 0 || b.x > w || b.y > h) continue;
      const el = document.createElement("div");
      el.className = "blk";
      el.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h||30}px;` +
        `transform:rotate(${b.rot||0}deg)`;
      el.innerHTML = blockHTML(b);
      hold.appendChild(el);
    }
    sheet.appendChild(hold);
    host.appendChild(sheet);
    css = `@page{size:${w}px ${h}px;margin:0}`;
  });
  let st = document.getElementById("printcss");
  if (!st){ st = document.createElement("style"); st.id = "printcss"; document.head.appendChild(st); }
  st.textContent = css;
}
async function doPrint(){
  const picked = await askPages("Print / save as PDF", "Print");
  if (!picked) return;
  buildPrint(picked.map(r => r.p));
  document.body.classList.add("printing");
  const done = () => { document.body.classList.remove("printing"); $("#printarea").innerHTML = ""; };
  try {
    const after = () => { done(); removeEventListener("afterprint", after); };
    addEventListener("afterprint", after);
    window.print();
    setTimeout(() => { if (document.body.classList.contains("printing")) done(); }, 4000);
  } catch(_){
    done();
    toast("This view will not let the page open a print dialog. Export the standalone copy and print that.", 5200);
  }
}

/* ── standalone copy ─────────────────────────────────────────
   The same page, with the notebook baked in and a flag that makes
   it open as a reader. One renderer, so the copy cannot drift
   from what you made — and it prints to PDF from any browser.  */
async function exportStandalone(){
  const picked = await askPages("Export a standalone copy", "Export");
  if (!picked) return;
  toast("Packing the notebook — photographs are embedded, so give it a moment.", 4000);
  const src = await pageSource();
  if (!src){
    toast("This page could not read its own source, so a standalone copy cannot be built here.", 5200);
    return;
  }
  const data = await serialiseInline();
  /* keep only what was ticked, and drop any section left empty */
  const keep = new Set(picked.map(r => r.si + ":" + r.pi));
  data.sections = data.sections
    .map((sc, si) => Object.assign({}, sc,
      {pages: sc.pages.filter((_, pi) => keep.has(si + ":" + pi))}))
    .filter(sc => sc.pages.length);
  if (!data.sections.length){ toast("Nothing was ticked."); return; }
  data.readonly = true;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const out = src.replace(seedRe(), '<script id="seed" type="application/json">' + json + '<\/script>');
  if (out === src){ toast("Nowhere in this page to write the notebook."); return; }
  const name = (NB.title||"notebook").toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40) + ".html";
  const dl = await use("downloads");
  if (dl){
    try { await dl.save({filename:name, data:out});
      toast("Standalone copy saved. Open it in any browser — it reads, flips and prints on its own.", 5200);
      return;
    } catch(_){}
  }
  const url = URL.createObjectURL(new Blob([out],{type:"text/html"}));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 6000);
  toast("Standalone copy saved.", 4000);
}

/* ── the book menu ─────────────────────────────────────────── */
function bookMenu(anchor){
  popup(anchor, `<div class="gl">How it is bound</div>
    ${Object.keys(BINDS).map(k => `<button data-bind="${k}"><span class="gicon">${k==="spread"?"▥":"▯"}</span>
      ${BINDS[k][0]}<span class="k">${(NB.bind||"single")===k?"✓":""}</span></button>`).join("")}
    <hr><div class="gl">Spine</div>
    ${Object.keys(SPINES).map(k => `<button data-spine="${k}"><span class="gicon">┃</span>${SPINES[k]}
      <span class="k">${(NB.spine||"stitch")===k?"✓":""}</span></button>`).join("")}
    <hr>
    <button data-bx="gut"><span class="gicon">${NB.gutterShade===false?"○":"●"}</span>Shade the gutter</button>
    <button data-bx="num"><span class="gicon">${NB.nums===false?"○":"●"}</span>Page numbers</button>
    <button data-bx="anim"><span class="gicon">${NB.anim===false?"○":"●"}</span>Turn pages when reading</button>
    <button data-bx="wide"><span class="gicon">↔</span>Gutter width — ${gutterW()} px</button>
    <hr>
    <button data-bx="print"><span class="gicon">⎙</span>Print / save as PDF</button>
    <button data-bx="stand"><span class="gicon">⇪</span>Export a standalone copy…</button>`,
  async e => {
    const b = e.target.closest("[data-bind]");
    if (b){ snap(); NB.bind = b.dataset.bind; dirty(); closePop(); drawAll(); fitPage(true); return; }
    const s = e.target.closest("[data-spine]");
    if (s){ snap(); NB.spine = s.dataset.spine; dirty(); closePop(); drawAll(); return; }
    const x = e.target.closest("[data-bx]"); if (!x) return;
    const k = x.dataset.bx;
    if (k === "gut"){ NB.gutterShade = NB.gutterShade === false; dirty(); closePop(); drawAll(); }
    if (k === "num"){ NB.nums = NB.nums === false; dirty(); closePop(); drawAll(); }
    if (k === "anim"){ NB.anim = NB.anim === false; dirty(); closePop(); }
    if (k === "print"){ closePop(); doPrint(); }
    if (k === "stand"){ closePop(); exportStandalone(); }
    if (k === "wide"){
      closePop();
      const v = await askText("Gutter width", "The space between the two facing pages, in pixels.",
        String(gutterW()), "Set");
      if (v == null) return;
      snap(); NB.gutter = clamp(parseInt(v,10) || 0, 0, 400); dirty(); drawAll(); fitPage(true);
    }
  });
}


