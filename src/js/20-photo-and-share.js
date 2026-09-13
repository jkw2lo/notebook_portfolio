/* ═══════════════════════════════════════════════════════════════
   PART G — a photograph you can actually work on, and one place
   to get things in and out.
   ═══════════════════════════════════════════════════════════════ */

/* ── CUTTING A PHOTOGRAPH OUT ────────────────────────────────
   A collage is not a grid of rectangles. These are the scissors:
   a shape to cut to, a crop to push the subject around inside it,
   a border, a treatment, and a pen that stays on the picture.  */
const SHAPES = {
  none:    ["Rectangle", ""],
  round:   ["Rounded",   "inset(0 round 18px)"],
  pill:    ["Pill",      "inset(0 round 999px)"],
  circle:  ["Circle",    "circle(50% at 50% 50%)"],
  ellipse: ["Oval",      "ellipse(50% 50% at 50% 50%)"],
  arch:    ["Arch",      "polygon(0% 100%, 0% 42%, 8% 22%, 26% 7%, 50% 2%, 74% 7%, 92% 22%, 100% 42%, 100% 100%)"],
  hex:     ["Hexagon",   "polygon(25% 2%, 75% 2%, 100% 50%, 75% 98%, 25% 98%, 0% 50%)"],
  diamond: ["Diamond",   "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"],
  star:    ["Star",      "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"],
  heart:   ["Heart",     "path('M 150 280 C 30 190 10 120 55 70 C 90 30 140 45 150 85 C 160 45 210 30 245 70 C 290 120 270 190 150 280 Z')"],
  blob:    ["Blob",      "polygon(28% 3%, 62% 0, 88% 16%, 100% 44%, 93% 74%, 70% 95%, 40% 100%, 13% 88%, 0 62%, 4% 30%)"],
  scallop: ["Scalloped", "polygon(0% 12%,8% 4%,17% 12%,25% 4%,33% 12%,42% 4%,50% 12%,58% 4%,67% 12%,75% 4%,83% 12%,92% 4%,100% 12%,100% 88%,92% 96%,83% 88%,75% 96%,67% 88%,58% 96%,50% 88%,42% 96%,33% 88%,25% 96%,17% 88%,8% 96%,0% 88%)"]
};
const FX = {
  none:   ["As it is",  ""],
  bw:     ["Black & white", "grayscale(1) contrast(1.08)"],
  high:   ["High contrast", "contrast(1.45) saturate(1.15)"],
  faded:  ["Faded",     "saturate(.62) contrast(.9) brightness(1.08) sepia(.12)"],
  warm:   ["Warm",      "sepia(.35) saturate(1.3) hue-rotate(-12deg)"],
  cool:   ["Cool",      "saturate(1.1) hue-rotate(14deg) brightness(1.03)"],
  ink:    ["Inky",      "grayscale(1) contrast(2.1) brightness(1.05)"],
  bleach: ["Bleached",  "grayscale(.55) contrast(1.3) brightness(1.18)"],
  night:  ["Night",     "grayscale(.4) contrast(1.2) brightness(.78) hue-rotate(190deg) saturate(1.4)"]
};

/* a point on the page, in the photograph's own upright frame */
function toLocal(b, wx, wy){
  const ox = oxOf(b.id);
  const cx = ox + b.x + b.w/2, cy = b.y + (b.h||30)/2;
  const t = -rad(b.rot || 0), dx = wx - cx, dy = wy - cy;
  return {x: dx*Math.cos(t) - dy*Math.sin(t) + b.w/2,
          y: dx*Math.sin(t) + dy*Math.cos(t) + (b.h||30)/2};
}
/* Strokes are kept in a 0–1000 square of their own, NOT in the block's
   pixels. Drawn in pixels they were re-read against whatever size the
   block happened to be later, so resizing a picture slid its marks off
   it. Normalised, the drawing simply stretches with the picture.
   A stroke without `n` is from before that fix and is scaled on sight. */
const PEN_VB = 1000;
function penOverlay(b){
  if (!b.pen || !b.pen.length) return "";
  const w = b.w || 1, h = b.h || 30;
  return `<svg class="pink" viewBox="0 0 ${PEN_VB} ${PEN_VB}" preserveAspectRatio="none">` +
    b.pen.map(s => {
      const pts = s.n ? s.pts : (s.pts||[]).map(q => [q[0]/w*PEN_VB, q[1]/h*PEN_VB]);
      const wd  = s.n ? (s.width || 40) : (s.width || 4)/w*PEN_VB;
      return `<path d="${inkPath({pts})}" fill="none" stroke="${esc(s.color||"#FFF")}"
        stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round"
        ${s.kind === "marker" ? 'opacity="0.45"' : ""}/>`;
    }).join("") + `</svg>`;
}
function photoHTML(b){
  const px = b.px == null ? 50 : b.px, py = b.py == null ? 50 : b.py;
  const inner = b.src
    ? `<img src="${esc(b.src)}" alt="${esc(b.caption||"")}" draggable="false"
        style="object-position:${px}% ${py}%;transform:scale(${b.zoom || 1});
        ${b.fx && FX[b.fx] && FX[b.fx][1] ? `filter:${FX[b.fx][1]};` : ""}">`
    : `<div class="ph">add a photo</div>`;
  /* CUTTING TO A SHAPE CUTS THE WHOLE CARD. Clipping only the picture
     left the card's own ground — grey with no frame, white with a mount —
     standing behind the oval as a rectangle, which is not a cut-out at
     all. So the same path clips the card, the edge and the picture. */
  const shape = (b.shape && SHAPES[b.shape] && SHAPES[b.shape][1]) ? SHAPES[b.shape][1] : "";
  const cut = shape ? `clip-path:${shape};` : "";
  const card = shape ? cut : (b.frame === "torn" ? `clip-path:${torn(b.id, 2.6)};` : "");
  /* the edge is a BAND OF COLOUR behind the picture, not a CSS border:
     a border is always a rectangle and cannot bend round an oval */
  const edge = b.bw ? `background:${esc(b.bc||"#2A2520")};padding:${b.bw}px;` : "";
  const capOn = b.caption && b.capOff !== 1;
  const cap = capOn
    ? `<div class="pcap" style="font-family:${faceCSS(b.capFont||"hand")};
        font-size:${b.capSize||14}px;text-align:${esc(b.capAlign||"center")};
        color:${esc(b.capColor||"#3A352C")}">${esc(b.caption)}</div>`
    : "";
  const rad0 = (!shape && b.frame !== "torn" && b.radius) ? `border-radius:${b.radius}px;` : "";
  return `<div class="b-photo${shape?" cut":""} fit-${esc(b.fit||"cover")} fr-${esc(b.frame||"none")}"
    style="position:absolute;inset:0">
    <div class="pcard" style="${card}${rad0}">
      <div class="pedge" style="${cut}${rad0}${edge}">
        <div class="pwrap" style="${cut}${rad0}">${inner}</div></div>
    </div>${penOverlay(b)}${cap}</div>`;
}

/* ── CROPPING ────────────────────────────────────────────────
   The frame stays where you put it; the picture moves inside it.
   Drag to push the subject about, scroll to come in closer.    */
let CROP = null, INKTO = null;
function setCrop(id){
  CROP = id; INKTO = null;
  $("#canvas").classList.toggle("cropping", !!CROP);
  drawTools();
  if (id) toast("Drag the picture to move it in its frame; scroll to zoom. Esc when it sits right.", 5000);
}
function setInkTo(id){
  INKTO = id; CROP = null;
  if (id){ setTool("pen"); toast("Drawing on the photograph — the marks belong to it and travel with it.", 4600); }
  else setTool("select");
  drawTools();
}

/* ── WARM THE TYPE ───────────────────────────────────────────
   A web font is only fetched when something is painted in it. The type
   kit menu was the FIRST use of eight of these faces, so it drew every
   specimen in the fallback and every kit looked identical — the picker
   was showing the one thing it exists to distinguish. Asking for them
   at boot means the menu is right the first time it is opened.      */
function warmFaces(){
  if (!document.fonts || !document.fonts.load) return;
  const fams = Object.values(FACES).map(v => v[1].split(",")[0].replace(/["']/g, "").trim());
  Promise.all(fams.map(f => document.fonts.load(`24px "${f}"`).catch(() => null)))
    .then(() => { if (NB) drawBlocks(); })
    .catch(() => {});
}

/* More than one line, anywhere words are set into a shape. A single-line
   field cannot say what a two-line stamp says. */
async function linesOf(b, key, title){
  const v = await askArea(title, "One line per line.", b[key] || "");
  if (v == null) return;
  snap(); b[key] = v.replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "");
  dirty(); drawBlocks(); drawSel(); drawTools();
}

/* ── ONE PLACE FOR IN AND OUT ────────────────────────────────
   Export and import were buried in the shortcut sheet, which is
   the last place anybody looks for them.                      */
function shareMenu(anchor){
  popup(anchor, `<div class="gl">Take it out</div>
    <button data-sx2="pdf"><span class="gicon">⎙</span>Print / save as PDF
      <span class="k">choose pages</span></button>
    <button data-sx2="stand"><span class="gicon">⇪</span>Standalone copy…
      <span class="k">one HTML file</span></button>
    <button data-sx2="json"><span class="gicon">↓</span>Export notebook JSON
      <span class="k">to keep or move</span></button>
    <hr><div class="gl">Bring one in</div>
    <button data-sx2="import"><span class="gicon">↑</span>Import a notebook…
      <span class="k">replaces this one</span></button>
    <hr><div class="gl">A standalone copy carries the whole notebook and its
      photographs in one file. It opens in any browser, turns its own pages and
      prints — nothing to install and nothing to fetch.</div>`,
  e => {
    const x = e.target.closest("[data-sx2]"); if (!x) return;
    closePop();
    if (x.dataset.sx2 === "pdf") doPrint();
    if (x.dataset.sx2 === "stand") exportStandalone();
    if (x.dataset.sx2 === "json") exportJSON();
    if (x.dataset.sx2 === "import") importJSON();
  });
}

/* ── MORE TO STICK ON ────────────────────────────────────────
   Cut-and-paste magazine: halftone, checkerboard, torn strips,
   price tags, and faces drawn in line rather than filled.     */
const SK_MORE = {
  collage: {
    halftone: ["Halftone", `<defs><pattern id="ht" width="13" height="13" patternUnits="userSpaceOnUse">
      <circle cx="6.5" cy="6.5" r="4.6" fill="#2A2520"/></pattern></defs>
      <circle cx="50" cy="50" r="46" fill="url(#ht)"/>`],
    check:    ["Checker", `<g fill="#2A2520">${(()=>{let s="";for(let r=0;r<5;r++)for(let c=0;c<5;c++)
      if((r+c)%2===0)s+=`<rect x="${c*20}" y="${r*20}" width="20" height="20"/>`;return s;})()}</g>`, "repeat"],
    film:     ["Film strip", `<rect x="2" y="18" width="96" height="64" fill="#23211E"/>
      <rect x="14" y="30" width="72" height="40" fill="#DCD6C8"/>
      <g fill="#DCD6C8">${(()=>{let s="";for(let i=0;i<6;i++)s+=
      `<rect x="${6+i*15}" y="21" width="8" height="6" rx="1"/><rect x="${6+i*15}" y="73" width="8" height="6" rx="1"/>`;
      return s;})()}</g>`, "repeat"],
    torn:     ["Torn strip", `<path d="M0 30 12 24 24 32 37 25 49 33 62 26 74 34 87 27 100 34v34l-13 7-13-7-12 8-13-7-12 7-13-8-12 7-12-6Z" fill="#E8DCC4"/>`, "repeat"],
    barcode:  ["Barcode", `<g fill="#1E1B16">${(()=>{let s="",x=6;
      [4,2,6,2,3,7,2,4,2,8,3,2,6,2,4].forEach(w=>{s+=`<rect x="${x}" y="22" width="${w}" height="48"/>`;x+=w+3;});
      return s;})()}</g><rect x="6" y="74" width="88" height="2" fill="#1E1B16"/>`],
    tagprice: ["Price tag", `<path d="M6 44 46 6h46a6 6 0 0 1 6 6v46L58 96a6 6 0 0 1-8 0L6 52a6 6 0 0 1 0-8Z" fill="#E4A04E"/>
      <circle cx="80" cy="24" r="8" fill="#FFF8EC"/>`],
    badge:    ["New badge", `<path d="M50 2 60 20 80 14 78 35 98 40 84 55 98 70 78 75 80 96 60 90 50 108 40 90 20 96 22 75 2 70 16 55 2 40 22 35 20 14 40 20Z" fill="#C4463C"/>
      <path d="M32 46h36M32 58h26" stroke="#FFF3EC" stroke-width="6"/>`],
    cutarrow: ["Cut arrow", `<path d="M4 38h52V14l40 36-40 36V62H4Z" fill="#2E4A6B"/>`],
    burstsay: ["Say burst", `<path d="M50 4 58 22 76 12 74 32 94 30 84 46 100 56 82 62 90 80 70 76 68 96 52 84 38 98 32 78 12 82 18 62 0 54 16 44 6 26 26 28 26 8Z" fill="#F0C04A"/>
      <path d="M30 44h40M30 58h28" stroke="#3A3020" stroke-width="5"/>`]
  },
  cute: {
    sparkeyes:["Sparkle eyes", `<circle cx="50" cy="52" r="38" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M34 40c6 6 6 12 0 18M34 40c-6 6-6 12 0 18M66 40c6 6 6 12 0 18M66 40c-6 6-6 12 0 18" fill="#2A2520"/>
      <path d="M40 70c6 6 14 6 20 0" fill="none" stroke="#2A2520" stroke-width="4"/>`],
    blush:    ["Blush", `<circle cx="50" cy="52" r="38" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M34 44c4-5 8-5 12 0M54 44c4-5 8-5 12 0" fill="none" stroke="#2A2520" stroke-width="4"/>
      <ellipse cx="28" cy="60" rx="9" ry="5" fill="#F2A9BE"/><ellipse cx="72" cy="60" rx="9" ry="5" fill="#F2A9BE"/>
      <path d="M42 66c4 5 12 5 16 0" fill="none" stroke="#2A2520" stroke-width="4"/>`],
    cat:      ["Cat", `<path d="M18 34 22 8l20 16M82 34 78 8 58 24" fill="none" stroke="#2A2520" stroke-width="4"/>
      <circle cx="50" cy="56" r="34" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M36 50h8M56 50h8" stroke="#2A2520" stroke-width="5"/>
      <path d="M44 64c3 4 9 4 12 0" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M14 58h16M70 58h16M14 66h16M70 66h16" stroke="#2A2520" stroke-width="3"/>`],
    bear:     ["Bear", `<circle cx="22" cy="24" r="12" fill="none" stroke="#2A2520" stroke-width="4"/>
      <circle cx="78" cy="24" r="12" fill="none" stroke="#2A2520" stroke-width="4"/>
      <circle cx="50" cy="56" r="34" fill="none" stroke="#2A2520" stroke-width="4"/>
      <circle cx="38" cy="50" r="4" fill="#2A2520"/><circle cx="62" cy="50" r="4" fill="#2A2520"/>
      <ellipse cx="50" cy="64" rx="7" ry="5" fill="#2A2520"/>`],
    bunny:    ["Bunny", `<ellipse cx="34" cy="20" rx="9" ry="20" fill="none" stroke="#2A2520" stroke-width="4"/>
      <ellipse cx="66" cy="20" rx="9" ry="20" fill="none" stroke="#2A2520" stroke-width="4"/>
      <circle cx="50" cy="62" r="30" fill="none" stroke="#2A2520" stroke-width="4"/>
      <circle cx="40" cy="58" r="4" fill="#2A2520"/><circle cx="60" cy="58" r="4" fill="#2A2520"/>
      <path d="M46 70h8" stroke="#2A2520" stroke-width="4"/>`],
    wink:     ["Wink", `<circle cx="50" cy="52" r="38" fill="none" stroke="#2A2520" stroke-width="4"/>
      <circle cx="36" cy="46" r="5" fill="#2A2520"/><path d="M58 46c4-5 10-5 14 0" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M38 66c6 8 18 8 24 0" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M82 26l6-10 6 10" fill="none" stroke="#F0C04A" stroke-width="4"/>`],
    shy:      ["Shy", `<circle cx="50" cy="52" r="38" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M32 48h14M54 48h14" stroke="#2A2520" stroke-width="4"/>
      <path d="M42 68c4-4 12-4 16 0" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M22 58h10M68 58h10" stroke="#F2A9BE" stroke-width="4"/>`],
    hearteye: ["Heart eyes", `<circle cx="50" cy="52" r="38" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M36 52c-8-6-10-11-6-14s8 0 6 4c-2-4 2-7 6-4s0 8-6 14Z" fill="#C4463C"/>
      <path d="M64 52c-8-6-10-11-6-14s8 0 6 4c-2-4 2-7 6-4s0 8-6 14Z" fill="#C4463C"/>
      <path d="M38 68c6 8 18 8 24 0" fill="none" stroke="#2A2520" stroke-width="4"/>`],
    shout:    ["Shout", `<circle cx="50" cy="52" r="38" fill="none" stroke="#2A2520" stroke-width="4"/>
      <path d="M32 40l14 6M68 40l-14 6" stroke="#2A2520" stroke-width="4"/>
      <ellipse cx="50" cy="68" rx="14" ry="11" fill="#2A2520"/>
      <path d="M6 30l12 4M94 30l-12 4M50 4v10" stroke="#2A2520" stroke-width="4"/>`]
  },
  pretty: {
    bow:      ["Bow", `<path d="M50 50 16 28c-8-5-14 4-12 14s10 16 18 12Z" fill="#E4849E"/>
      <path d="M50 50 84 28c8-5 14 4 12 14s-10 16-18 12Z" fill="#E4849E"/>
      <ellipse cx="50" cy="50" rx="10" ry="9" fill="#C4637E"/>
      <path d="M44 58 34 88M56 58l10 30" fill="none" stroke="#E4849E" stroke-width="7"/>`],
    pearls:   ["Pearls", `<g fill="#F2EDE4" stroke="#C9BFA6" stroke-width="2">
      <circle cx="10" cy="50" r="9"/><circle cx="30" cy="50" r="9"/><circle cx="50" cy="50" r="9"/>
      <circle cx="70" cy="50" r="9"/><circle cx="90" cy="50" r="9"/></g>`, "repeat"],
    butterfly:["Butterfly", `<path d="M50 52C32 18 6 24 10 46c3 16 26 18 40 6Z" fill="#C48ABE"/>
      <path d="M50 52C68 18 94 24 90 46c-3 16-26 18-40 6Z" fill="#C48ABE"/>
      <path d="M50 52C36 76 18 84 22 92c4 8 22-2 28-14Z" fill="#A96EA4"/>
      <path d="M50 52c14 24 32 32 28 40-4 8-22-2-28-14Z" fill="#A96EA4"/>
      <path d="M50 40v46" stroke="#3A2A38" stroke-width="5"/>`],
    cherry:   ["Cherries", `<circle cx="34" cy="72" r="16" fill="#C4463C"/><circle cx="68" cy="78" r="14" fill="#C4463C"/>
      <path d="M34 56C40 26 60 14 80 12M68 64C66 38 72 24 80 12" fill="none" stroke="#5E8A4A" stroke-width="5"/>
      <path d="M80 12c8-4 14 0 16 6-8 4-14 2-16-6Z" fill="#5E8A4A"/>`],
    posy:     ["Posy", `<g fill="#E4849E"><circle cx="34" cy="34" r="12"/><circle cx="58" cy="26" r="10"/>
      <circle cx="70" cy="46" r="12"/><circle cx="46" cy="52" r="11"/></g>
      <g fill="#F0C04A"><circle cx="34" cy="34" r="4.5"/><circle cx="58" cy="26" r="4"/>
      <circle cx="70" cy="46" r="4.5"/><circle cx="46" cy="52" r="4"/></g>
      <path d="M40 60 52 94M58 58 56 94M66 58 74 92" fill="none" stroke="#5E8A4A" stroke-width="5"/>`],
    gem:      ["Gem", `<path d="M28 14h44l22 26-44 50-44-50Z" fill="#8FC4D4"/>
      <path d="M28 14 50 40 72 14M6 40h88M50 40v50" fill="none" stroke="#FFF" stroke-width="3.5" opacity=".75"/>`],
    crown:    ["Crown", `<path d="M10 74 4 24l26 20L50 12l20 32 26-20-6 50Z" fill="#E0B44E"/>
      <path d="M10 78h80" stroke="#C49A34" stroke-width="8"/>
      <circle cx="30" cy="56" r="5" fill="#C4463C"/><circle cx="50" cy="50" r="5" fill="#5E92C4"/>
      <circle cx="70" cy="56" r="5" fill="#C4463C"/>`],
    lipstick: ["Lipstick", `<path d="M38 42h24v48a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6Z" fill="#D4C0A8"/>
      <path d="M40 8h20v34H40Z" fill="#C4463C"/><path d="M40 8 60 2v6Z" fill="#A82F30"/>`],
    rosette:  ["Rosette", `<g fill="#C48A9E">${(()=>{let s="";for(let i=0;i<10;i++){const a=i*36;
      s+=`<ellipse cx="50" cy="26" rx="9" ry="20" transform="rotate(${a} 50 50)"/>`;}return s;})()}</g>
      <circle cx="50" cy="50" r="12" fill="#8E5A70"/>
      <path d="M42 62 34 96l16-10 16 10-8-34Z" fill="#C48A9E"/>`]
  }
};
Object.assign(SK, SK_MORE);
Object.assign(SK_CATS, {collage:"Collage", cute:"Faces", pretty:"Pretty"});
