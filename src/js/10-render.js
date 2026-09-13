/* ════ RENDER ═══════════════════════════════════════════════ */
function drawAll(){ drawSide(); drawSten(); drawBlocks(); drawTools(); drawSel(); drawRulers(); drawObjs(); }

function drawSide(){
  $("#seclist").innerHTML = NB.sections.map((s,i) => `
    <button class="srow" data-si="${i}" aria-current="${i===SI}">
      <span class="tab" style="background:${esc(s.color)}"></span>
      <span class="nm">${esc(s.name)}</span><span class="ct">${s.pages.length}</span></button>`).join("");
  $("#pagehead").textContent = sec() ? sec().name : "Pages";
  $("#pagelist").innerHTML = sec().pages.map((p,i) => `
    <div class="prow${isCover(p)?" cov":""}" draggable="true" data-pi="${i}"
         aria-current="${i===PI}" role="button" tabindex="0">
      <span class="thumb" style="${isCover(p) ? coverCSS(p)
        : "background:" + esc((PAPERS[p.paper]||PAPERS.plain).bg)}">${isCover(p)?"":miniHTML(p)}</span>
      <span class="nm">${esc(p.name)}</span>
      ${isCover(p) ? `<span class="badge">cover</span>` : `<span class="ct">${p.blocks.length}</span>`}
    </div>`).join("");
  drawObjs();
}
function miniHTML(p){
  const [pw,ph] = PAGE_SIZES[p.size] || PAGE_SIZES.land;
  return p.blocks.slice(0,10).map(b => {
    const x = clamp(b.x/pw,0,1)*100, y = clamp(b.y/ph,0,1)*100;
    const w = clamp((b.w||40)/pw,0,1)*100, h = clamp((b.h||24)/ph,.04,1)*100;
    return `<i style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></i>`;
  }).join("");
}
function pageDims(){ return PAGE_SIZES[page().size] || PAGE_SIZES.land; }

function inkPath(b){
  const p = b.pts || [];
  if (p.length < 2) return "";
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i=1;i<p.length-1;i++){
    const mx = (p[i][0]+p[i+1][0])/2, my = (p[i][1]+p[i+1][1])/2;
    d += ` Q ${p[i][0]} ${p[i][1]} ${mx} ${my}`;
  }
  const l = p[p.length-1]; d += ` L ${l[0]} ${l[1]}`;
  return d;
}

function blockHTML(b){
  switch (b.t){
    case "photo": return photoHTML(b);
    case "text":
      return `<div class="b-text" style="position:absolute;inset:0;${textStyle(b)}
        text-align:${esc(b.align||"left")}">${esc(b.text||"")}</div>`;
    case "note":
      return `<div class="b-note" style="position:absolute;inset:0;background:${esc(b.color||NOTE_COLORS[0])};
        font-size:${b.size||16}px">${esc(b.text||"")}</div>`;
    case "swatch":
      return `<div class="b-swatch" style="position:absolute;inset:0;font-size:${b.size||12}px">
        <div class="chip" style="background:${esc(b.color||"#8A6034")}"></div>
        <div class="meta"><div class="nm">${esc(b.label||"Material")}</div>
        <div class="sp">${esc(b.spec||"")}</div></div></div>`;
    case "spec":
      return `<div class="b-spec" style="position:absolute;inset:0;font-size:${b.size||10.5}px">
        ${b.title ? `<h4>${esc(b.title)}</h4>` : ""}
        <table><tbody>${(b.rows||[]).map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div>`;
    case "shape": {
      const k = b.kind || "rect";
      if (k === "rule") return `<div class="b-shape" style="position:absolute;left:0;right:0;top:50%;
        height:${b.weight||2}px;transform:translateY(-50%);background:${esc(b.color||"#171512")}"></div>`;
      /* fill:"none" makes it a border — a frame you put round things */
      const open = b.fill === "none";
      const bd = open ? `border:${b.strokeW||3}px ${esc(b.dash||"solid")} ${esc(b.stroke||b.color||"#8A8175")};`
                      : `background:${esc(b.color||"#DDD6C7")};`;
      return `<div class="b-shape" style="position:absolute;inset:0;${bd}
        border-radius:${k==="ellipse"?"50%":(b.radius||0)+"px"}"></div>`;
    }
    case "stitch":
      return `<svg style="position:absolute;left:0;right:0;top:0;width:100%;height:100%;overflow:visible"
        preserveAspectRatio="none" viewBox="0 0 100 10"><line x1="0" y1="5" x2="100" y2="5"
        stroke="${esc(b.color||"#8A6034")}" stroke-width="${b.weight||2}"
        stroke-dasharray="4 3" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
    case "tape":
      return `<div class="b-tape" style="position:absolute;inset:0;opacity:.88;${
        tapeCSS(b, esc(b.color||"#D9CBA8"))}"></div>`;
    case "scrap":
      return `<div class="b-scrap" style="position:absolute;inset:0;background:${esc(b.color||SCRAP_COLORS[0])};
        clip-path:${torn(b.id, 3.4)}"><div class="grain"></div></div>`;
    case "tag":
      return `<div class="b-tag" style="background:${esc(b.color||"#E3D6BB")};
        clip-path:polygon(50% 0,100% 15%,100% 100%,0 100%,0 15%)">
        <span class="eyelet"></span>
        <div class="txt" style="font-size:${b.size||15}px">${esc(b.text||"")}</div></div>`;
    case "ticket":
      return `<div class="b-ticket" style="font-size:${b.size||14}px"><div class="stub">${esc(b.stub||"01")}</div>
        <div class="body"><div class="t1">${esc(b.t1||"")}</div>
        <div class="t2">${esc(b.t2||"")}</div></div></div>`;
    case "stamp":
      return `<div class="b-stamp" style="font-size:${b.size||12}px"><div class="in" style="background:${esc(b.color||"#8FA9B8")}">
        ${b.src ? `<img src="${esc(b.src)}" alt="" draggable="false">` : ""}
        <span class="val">${esc(b.val||"")}</span>
        <span class="cap" style="text-align:${esc(b.align||"center")}">${
          esc(b.cap||"").replace(/\n/g, "<br>")}</span></div></div>`;
    case "ribbon":
      return `<div class="b-ribbon" style="${tapeCSS(b, esc(b.color||RIBBON_COLORS[0]))}"></div>`;
    case "date":   return dateHTML(b);
    case "doodle":
      return `<div class="b-doodle">${doodleSVG(b.key, b.color, b.width)}</div>`;
    case "clip":   return clipHTML(b);
    case "seal":   return sealHTML(b);
    case "env":    return envHTML(b);
    case "lace":   return laceHTML(b);
    case "libcard":return cardHTML(b);
    case "post":   return postHTML(b);
    case "check":
      return `<div class="b-check" style="font-size:${b.size||16}px">${
        (b.items||[]).map((it,i) => `<div class="ci ${it[0]?"on":""}">
          <span class="bx" data-ck="${i}"></span><span>${esc(it[1])}</span></div>`).join("")}</div>`;
    case "sticker":
      /* border art is a background so it can tile; everything else is
         an inline drawing so it can carry its die-cut halo */
      if (skMode(b.key)) return `<div class="b-bord" style="position:absolute;inset:0;${borderCSS(b)}"></div>`;
      return `<div class="b-sticker ${b.die===false?"flat":"die"}"
        style="position:absolute;inset:0">${skSVG(b.key)}</div>`;
    case "time":   return timeHTML(b);
    case "month":  return monthHTML(b);
    case "track":  return trackHTML(b);
    case "mood":   return moodHTML(b);
    case "rate":   return rateHTML(b);
    case "quote":  return quoteHTML(b);
    case "mark":   return markHTML(b);
    case "ink":
      return `<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"
        viewBox="0 0 ${b.vw||100} ${b.vh||100}" preserveAspectRatio="none">
        <path d="${inkPath(b)}" fill="none" stroke="${esc(b.color||"#1E1B16")}"
        stroke-width="${b.width||3}" stroke-linecap="round" stroke-linejoin="round"
        ${b.kind==="marker" ? 'opacity="0.42"' : ""}/></svg>`;
  }
  return "";
}

/* a frame drawn round words has to grow when the words do — but a band
   that spans the page keeps its width and only gets taller */
const DEF_SIZE = {mark:20, date:19, seal:18, tag:15, swatch:12, ticket:14, stamp:12,
  libcard:9, env:12, quote:15, spec:10.5, check:16, track:9, month:9, mood:20, rate:22, time:10};
/* A piece whose SIZE IS ITS CONTENT. The block box is measured from what
   was drawn, every render, so the type size is the only size there is and
   nothing can be clipped by a rectangle that fell out of step. Dragging a
   corner scales the type instead of the box — see MODE "size". */
const FITS = new Set(["mark"]);
const AUTO_H = b => b.t === "text" || b.t === "stitch" || (b.t === "shape" && b.kind === "rule");
/* things whose own controls sit on the page and must take a click */
const LIVE_BITS = "[data-ck],[data-day],[data-cell],[data-pick],[data-star]";
const OPEN_SHAPES = ["solid","dashed","dotted","double"];


function drawSel(){
  const s = $("#sel"), box = selBox();
  if (!box || PRESENT || TOOL !== "select"){ s.hidden = true; return; }
  s.hidden = false; s.dataset.multi = box.multi ? "1" : "0";
  s.style.cssText = `left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;
    transform:rotate(${box.rot}deg)`;
  const r = s.querySelector(".rot");
  r.style.left = "50%"; r.style.top = (-26/W.z) + "px";
  drawObjs();
}
function camApply(){
  $("#world").style.transform = `translate(${W.x}px,${W.y}px) scale(${W.z})`;
  document.documentElement.style.setProperty("--iz", (1/W.z).toFixed(4));
  $("#z-lvl").textContent = Math.round(W.z*100) + "%";
  drawRulers();
}
const toWorld = (cx,cy) => {
  const r = $("#canvas").getBoundingClientRect();
  return {x:(cx-r.left-W.x)/W.z, y:(cy-r.top-W.y)/W.z};
};

