/* ═══════════════════════════════════════════════════════════════
   PART E — a cover is a KIND OF PAGE, export is a choice, and a
   lot more to stick on.
   ═══════════════════════════════════════════════════════════════ */

const isCover = p => !!(p && p.kind === "cover");
const COVER_COLORS = ["#3A4E4A","#5E3428","#2E3A52","#6B2E3A","#7A6A3E","#2A2620",
  "#8A6034","#4A5E68","#A0563E","#C9A97C"];
function coverMenu(anchor){
  const p = page(), cov = isCover(p), c = cvOf(p);
  popup(anchor, cov ? `<div class="gl">Material</div>
      ${Object.keys(COVERS).map(k => `<button data-cm="${k}"><span class="gicon">▦</span>${COVERS[k][0]}
        <span class="k">${c.material===k?"✓":""}</span></button>`).join("")}
      <hr><div class="gl">Colour</div>
      <div class="swrow2">${COVER_COLORS.map(x =>
        `<button data-cc="${x}" style="background:${x}" aria-pressed="${c.color===x}"
          aria-label="${x}"></button>`).join("")}</div>
      <hr><div class="gl">Blocking</div>
      ${[["label","Paper label"],["foil","Foil-blocked"],["blind","Blind-stamped"],["none","Bare"]].map(
        ([k,l]) => `<button data-cs="${k}"><span class="gicon">◇</span>${l}
        <span class="k">${c.style===k?"✓":""}</span></button>`).join("")}
      <hr>
      <button data-cx="title"><span class="gicon">T</span>Title${c.title?" — "+esc(c.title.slice(0,18)):"…"}</button>
      <button data-cx="sub"><span class="gicon">t</span>Second line${c.sub?" — "+esc(c.sub.slice(0,18)):"…"}</button>
      <button data-cx="foil"><span class="gicon">✦</span>Blocking colour…</button>
      <hr>
      <button data-cx="unmake"><span class="gicon">↩</span>Turn it back into a page</button>`
    : `<div class="gl">This page</div>
      <button data-cx="make"><span class="gicon">◆</span>Make it a cover</button>
      <hr><div class="gl">A cover is a page with a board instead of paper — it
      shows on its own, takes no page number, and can sit anywhere. Add as many
      as you like: front, back, or between sections.</div>`,
  async e => {
    const P = page();
    const m = e.target.closest("[data-cm]");
    if (m){ snap(); P.cover = Object.assign(cvOf(P), {material:m.dataset.cm});
      dirty(); drawBlocks(); drawSide(); closePop(); return; }
    const cc = e.target.closest("[data-cc]");
    if (cc){ snap(); P.cover = Object.assign(cvOf(P), {color:cc.dataset.cc});
      dirty(); drawBlocks(); drawSide(); closePop(); return; }
    const st = e.target.closest("[data-cs]");
    if (st){ snap(); P.cover = Object.assign(cvOf(P), {style:st.dataset.cs});
      dirty(); drawBlocks(); drawSide(); closePop(); return; }
    const x = e.target.closest("[data-cx]"); if (!x) return;
    const k = x.dataset.cx; closePop();
    if (k === "make"){
      snap(); P.kind = "cover";
      P.cover = Object.assign({}, COVER_DEF, {title:NB.title||""}, P.cover||{});
      if (/^Page /.test(P.name) || !P.name) P.name = "Cover";
      dirty(); drawAll(); fitPage(false);
      toast("It is a cover now. Material and blocking are under Cover ▾.", 4000);
      return;
    }
    if (k === "unmake"){
      snap(); delete P.kind;
      if (P.name === "Cover") P.name = "Page " + (PI + 1);
      dirty(); drawAll(); fitPage(false); return;
    }
    const ask = {title:["Cover title", "Blocked or printed on the front."],
      sub:["Second line", "A date, a volume number, a place."],
      foil:["Blocking colour", "A hex colour for the foil or the stamped lettering."]}[k];
    if (!ask) return;
    const v = await askText(ask[0], ask[1], k === "foil" ? c.foil : (c[k] || ""), "Set");
    if (v == null) return;
    snap(); P.cover = Object.assign(cvOf(P), {[k]: v.trim()});
    dirty(); drawBlocks(); drawSide();
  });
}
const COVER_DEF = {material:"cloth", color:"#3A4E4A", style:"label", foil:"#D9C08A", title:"", sub:""};
function cvOf(p){ return Object.assign({}, COVER_DEF, p.cover || {}); }
function coverCSS(p){
  const c = cvOf(p), m = COVERS[c.material] || COVERS.cloth;
  return m[1](esc(c.color));
}
function coverInner(p){
  const c = cvOf(p), foil = esc(c.foil), t = esc(c.title || ""), sub = esc(c.sub || "");
  if (!t && !sub) return "";
  if (c.style === "none") return "";
  if (c.style === "blind") return `<div class="cv-blind" style="color:${foil}">
    <span style="${textStyle({role:"title"})};color:inherit">${t}</span>
    ${sub ? `<span style="${textStyle({role:"label"})};color:inherit">${sub}</span>` : ""}</div>`;
  if (c.style === "foil") return `<div class="cv-foil" style="color:${foil}">
    <span style="${textStyle({role:"header"})};color:inherit;font-size:48px">${t}</span>
    ${sub ? `<span style="${textStyle({role:"label"})};color:inherit">${sub}</span>` : ""}</div>`;
  return `<div class="cv-label">
    <span style="${textStyle({role:"title"})};font-size:30px">${t}</span>
    ${sub ? `<span style="${textStyle({role:"label"})}">${sub}</span>` : ""}</div>`;
}
/* page numbers count leaves, not covers */
function pageNo(pi){
  const ps = sec().pages; let n = 0;
  for (let i = 0; i <= pi; i++) if (!isCover(ps[i])) n++;
  return isCover(ps[pi]) ? "" : String(n);
}

/* ── choosing what to export ─────────────────────────────────
   A notebook is rarely all one thing. Printing the whole of it
   when you wanted the Spring pages is a waste of paper and of
   the reader's patience.                                       */
function askPages(title, okLabel){
  const rows = [];
  NB.sections.forEach((s, si) => s.pages.forEach((p, pi) =>
    rows.push({si, pi, p, sname:s.name, scol:s.color})));
  let chosen = new Set(rows.map(r => r.si + ":" + r.pi));
  const body = () => NB.sections.map((s, si) => `
    <div class="xsec">
      <label class="xhead"><input type="checkbox" data-sec="${si}"
        ${s.pages.every((_,pi)=>chosen.has(si+":"+pi)) ? "checked" : ""}>
        <span class="tab" style="background:${esc(s.color)}"></span>${esc(s.name)}
        <span class="k">${s.pages.length}</span></label>
      <div class="xpages">${s.pages.map((p, pi) => `
        <label class="xrow"><input type="checkbox" data-pg="${si}:${pi}"
          ${chosen.has(si+":"+pi) ? "checked" : ""}>
          <span class="nm">${esc(p.name)}</span>
          ${isCover(p) ? `<span class="k">cover</span>` : `<span class="k">${p.blocks.length}</span>`}
        </label>`).join("")}</div>
    </div>`).join("");
  return openModal(`<h3>${esc(title)}</h3><div class="mb">
      <p class="note">Tick what you want. Covers count as sheets of their own.</p>
      <div class="xbar"><button class="btn" data-all="1">All</button>
        <button class="btn" data-all="0">None</button>
        <span class="eyebrow" id="xcount"></span></div>
      <div id="xlist">${body()}</div></div>
    <div class="mf"><button class="btn" data-x="0">Cancel</button>
    <button class="btn pri" data-x="1">${esc(okLabel || "Export")}</button></div>`,
  m => {
    const count = () => { const c = m.querySelector("#xcount");
      if (c) c.textContent = chosen.size + " of " + rows.length; };
    count();
    m.querySelector("#xlist").onchange = e => {
      const sc = e.target.dataset.sec, pg = e.target.dataset.pg;
      if (sc != null){
        NB.sections[+sc].pages.forEach((_, pi) => {
          const k = sc + ":" + pi;
          e.target.checked ? chosen.add(k) : chosen.delete(k);
        });
        m.querySelector("#xlist").innerHTML = body();
      } else if (pg != null){
        e.target.checked ? chosen.add(pg) : chosen.delete(pg);
        const si = pg.split(":")[0];
        const head = m.querySelector(`[data-sec="${si}"]`);
        if (head) head.checked = NB.sections[+si].pages.every((_,pi)=>chosen.has(si+":"+pi));
      }
      count();
    };
    m.onclick = e => {
      const a = e.target.closest("[data-all]");
      if (a){
        chosen = a.dataset.all === "1" ? new Set(rows.map(r => r.si+":"+r.pi)) : new Set();
        m.querySelector("#xlist").innerHTML = body(); count(); return;
      }
      const b = e.target.closest("[data-x]"); if (!b) return;
      if (b.dataset.x !== "1") return closeModal(null);
      if (!chosen.size) return toast("Nothing ticked.");
      closeModal(rows.filter(r => chosen.has(r.si+":"+r.pi)));
    };
  });
}

/* ── MORE TO STICK ON ────────────────────────────────────────
   Borders stretch to whatever length you pull them to; the rest
   keep their shape.                                            */
const SK_EXTRA = {
  border: {
    rule:    ["Rule", `<path d="M2 50h96" stroke="#8A6034" stroke-width="4"/><circle cx="50" cy="50" r="7" fill="#8A6034"/><circle cx="24" cy="50" r="4" fill="#8A6034"/><circle cx="76" cy="50" r="4" fill="#8A6034"/>`, "repeat"],
    vine:    ["Vine", `<path d="M2 50c12-16 24 16 36 0s24-16 36 0 12 10 24 0" fill="none" stroke="#5E8A4A" stroke-width="4"/><circle cx="20" cy="40" r="5" fill="#7FA85E"/><circle cx="56" cy="60" r="5" fill="#7FA85E"/><circle cx="86" cy="44" r="5" fill="#7FA85E"/>`, "repeat"],
    scallop: ["Scallop", `<path d="M0 62c8 0 8-24 16-24s8 24 16 24 8-24 16-24 8 24 16 24 8-24 16-24 8 24 16 24" fill="none" stroke="#C48A9E" stroke-width="5"/>`, "repeat"],
    chain:   ["Chain", `<g fill="none" stroke="#C4A04E" stroke-width="5"><ellipse cx="14" cy="50" rx="12" ry="8"/><ellipse cx="38" cy="50" rx="12" ry="8"/><ellipse cx="62" cy="50" rx="12" ry="8"/><ellipse cx="86" cy="50" rx="12" ry="8"/></g>`, "repeat"],
    deco:    ["Deco", `<path d="M2 34h96M2 66h96" stroke="#3F5A6B" stroke-width="4"/><path d="M20 34 34 50 20 66M50 34 64 50 50 66M80 34 94 50 80 66" fill="none" stroke="#3F5A6B" stroke-width="3.5"/>`, "repeat"],
    dots:    ["Beads", `<g fill="#8A7850"><circle cx="8" cy="50" r="5"/><circle cx="30" cy="50" r="3"/><circle cx="50" cy="50" r="6"/><circle cx="70" cy="50" r="3"/><circle cx="92" cy="50" r="5"/></g>`, "repeat"],
    laurel:  ["Laurel", `<path d="M50 88C26 78 16 56 20 30M50 88c24-10 34-32 30-58" fill="none" stroke="#5E8A4A" stroke-width="5"/><g fill="#7FA85E"><ellipse cx="26" cy="42" rx="9" ry="5" transform="rotate(-40 26 42)"/><ellipse cx="30" cy="60" rx="9" ry="5" transform="rotate(-25 30 60)"/><ellipse cx="74" cy="42" rx="9" ry="5" transform="rotate(40 74 42)"/><ellipse cx="70" cy="60" rx="9" ry="5" transform="rotate(25 70 60)"/></g>`, "fixed"],
    corner:  ["Corner", `<path d="M6 94V22a16 16 0 0 1 16-16h72" fill="none" stroke="#8A6034" stroke-width="5"/><path d="M18 94V32a10 10 0 0 1 10-10h66" fill="none" stroke="#8A6034" stroke-width="2.5"/><circle cx="22" cy="22" r="7" fill="#8A6034"/>`, "fixed"],
    banner:  ["Banner", `<path d="M18 30h64v34H18Z" fill="#C4685E"/>` +
      `<path d="M18 30 2 22v50l16-8Z" fill="#93433B"/>` +
      `<path d="M82 30 98 22v50l-16-8Z" fill="#93433B"/>` +
      `<path d="M18 30v34M82 30v34" stroke="#7E3630" stroke-width="2"/>`, "stretch"]
  },
  feel: {
    happy:   ["Happy", `<circle cx="50" cy="50" r="38" fill="#F5D264"/><circle cx="36" cy="42" r="5" fill="#2A2520"/><circle cx="64" cy="42" r="5" fill="#2A2520"/><path d="M32 62c6 10 30 10 36 0" fill="none" stroke="#2A2520" stroke-width="5"/>`],
    sad:     ["Sad", `<circle cx="50" cy="50" r="38" fill="#A8C0DC"/><circle cx="36" cy="44" r="5" fill="#2A2520"/><circle cx="64" cy="44" r="5" fill="#2A2520"/><path d="M34 70c6-10 26-10 32 0" fill="none" stroke="#2A2520" stroke-width="5"/><path d="M36 52c-2 8-6 10-6 14" fill="none" stroke="#6E9CC4" stroke-width="4"/>`],
    love:    ["Smitten", `<circle cx="50" cy="50" r="38" fill="#F2A9BE"/><path d="M36 48c-8-6-10-12-6-15s8 0 6 4c-2-4 2-7 6-4s0 9-6 15Z" fill="#C4463C"/><path d="M64 48c-8-6-10-12-6-15s8 0 6 4c-2-4 2-7 6-4s0 9-6 15Z" fill="#C4463C"/><path d="M34 64c6 10 26 10 32 0" fill="none" stroke="#2A2520" stroke-width="5"/>`],
    sleepy:  ["Sleepy", `<circle cx="50" cy="50" r="38" fill="#C6BEDC"/><path d="M28 44c5-5 11-5 16 0M56 44c5-5 11-5 16 0" fill="none" stroke="#2A2520" stroke-width="5"/><ellipse cx="50" cy="66" rx="8" ry="10" fill="#2A2520"/>`],
    wow:     ["Wow", `<circle cx="50" cy="50" r="38" fill="#F5C38A"/><circle cx="36" cy="40" r="6" fill="#2A2520"/><circle cx="64" cy="40" r="6" fill="#2A2520"/><ellipse cx="50" cy="66" rx="11" ry="14" fill="#2A2520"/>`],
    calm:    ["Calm", `<circle cx="50" cy="50" r="38" fill="#A8CBB4"/><path d="M30 44h14M56 44h14" stroke="#2A2520" stroke-width="5"/><path d="M36 64c6 6 22 6 28 0" fill="none" stroke="#2A2520" stroke-width="5"/>`],
    cross:   ["Cross", `<circle cx="50" cy="50" r="38" fill="#E08A7C"/><path d="M28 36l16 8M72 36l-16 8" stroke="#2A2520" stroke-width="5"/><path d="M34 70c6-8 26-8 32 0" fill="none" stroke="#2A2520" stroke-width="5"/>`],
    think:   ["Thinking", `<circle cx="50" cy="50" r="38" fill="#DCCFA8"/><circle cx="36" cy="44" r="5" fill="#2A2520"/><circle cx="64" cy="44" r="5" fill="#2A2520"/><path d="M36 68h22" stroke="#2A2520" stroke-width="5"/><circle cx="80" cy="20" r="7" fill="#FFF" stroke="#2A2520" stroke-width="3"/>`],
    cry:     ["Tearful", `<circle cx="50" cy="50" r="38" fill="#9EC4DC"/><path d="M28 42c5 5 11 5 16 0M56 42c5 5 11 5 16 0" fill="none" stroke="#2A2520" stroke-width="5"/><path d="M36 46c-3 12-7 14-7 20a7 7 0 0 0 14 0c0-6-4-8-7-20Z" fill="#5E92C4"/><path d="M36 70c6-8 22-8 28 0" fill="none" stroke="#2A2520" stroke-width="5"/>`]
  },
  life: {
    rings:   ["Rings", `<circle cx="38" cy="56" r="22" fill="none" stroke="#C4A04E" stroke-width="7"/><circle cx="64" cy="56" r="22" fill="none" stroke="#D9C08A" stroke-width="7"/><path d="M64 30 58 18h12Z" fill="#9EC8DC"/>`],
    cap:     ["Graduation", `<path d="M8 42 50 24l42 18-42 18Z" fill="#2A3644"/><path d="M26 52v20c0 8 48 8 48 0V52" fill="none" stroke="#2A3644" stroke-width="6"/><path d="M88 46v22" stroke="#C4A04E" stroke-width="4"/><circle cx="88" cy="72" r="5" fill="#C4A04E"/>`],
    baby:    ["New baby", `<circle cx="50" cy="54" r="30" fill="#F4DCC8"/><path d="M24 42a26 26 0 0 1 52 0Z" fill="#A8C8DC"/><circle cx="40" cy="56" r="4" fill="#2A2520"/><circle cx="60" cy="56" r="4" fill="#2A2520"/><path d="M42 68c4 5 12 5 16 0" fill="none" stroke="#2A2520" stroke-width="4"/>`],
    house:   ["New home", `<path d="M8 50 50 16l42 34Z" fill="#C4685E"/><rect x="20" y="50" width="60" height="38" fill="#E8DCC4"/><rect x="42" y="62" width="16" height="26" fill="#8A6034"/><rect x="26" y="58" width="12" height="12" fill="#9EC4DC"/>`],
    popper:  ["Celebration", `<path d="M14 88 40 44l18 18Z" fill="#E0A84E"/><g fill="#C4478A"><circle cx="70" cy="26" r="5"/><circle cx="86" cy="44" r="4"/><circle cx="60" cy="14" r="4"/></g><g fill="#5E92C4"><circle cx="84" cy="20" r="4"/><circle cx="72" cy="46" r="4"/></g>`],
    glass:   ["Toast", `<path d="M26 12h18l-4 34a9 9 0 0 1-10 0Z" fill="#E8DCC4"/><path d="M56 12h18l-4 34a9 9 0 0 1-10 0Z" fill="#E8DCC4"/><path d="M35 46v34M65 46v34M26 84h18M56 84h18" stroke="#B4A88E" stroke-width="5"/>`],
    briefcase:["New job", `<rect x="12" y="34" width="76" height="48" rx="5" fill="#6B4A32"/><path d="M38 34V24h24v10" fill="none" stroke="#4A3220" stroke-width="6"/><path d="M12 54h76" stroke="#4A3220" stroke-width="5"/>`],
    candle:  ["Another year", `<rect x="36" y="40" width="28" height="48" rx="4" fill="#F2C9A0"/><path d="M50 40c0-10-8-12-4-22 8 6 14 12 14 20a10 10 0 0 1-20 2Z" fill="#F0A43C"/><path d="M30 88h40" stroke="#C9BFA6" stroke-width="6"/>`],
    heartH:  ["Together", `<path d="M50 84C22 62 14 44 26 32c9-9 20-4 24 6 4-10 15-15 24-6 12 12 4 30-24 52Z" fill="#C4463C"/><path d="M18 92c8-10 18-14 32-14s24 4 32 14" fill="none" stroke="#8A2B2B" stroke-width="5"/>`]
  }
};
Object.assign(SK, SK_EXTRA);
Object.assign(SK_CATS, {border:"Borders", feel:"Feelings", life:"Life"});

/* How a piece of border art answers being pulled longer:
   repeat  — the motif tiles, so a longer run is more of it
   stretch — one motif drawn to the box
   fixed   — keeps its shape, scales whole                     */
function skMode(key){
  const [c,n] = String(key||"").split("/");
  const e = SK[c] && SK[c][n];
  return (e && e[2]) || null;
}
function borderCSS(b){
  const [c,n] = String(b.key||"").split("/");
  const e = SK[c] && SK[c][n]; if (!e) return "";
  const mode = b.fit || skMode(b.key) || "repeat";
  const par = mode === "repeat" ? "" : ' preserveAspectRatio="none"';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${par}>` +
    `<g stroke-linejoin="round" stroke-linecap="round">${e[1]}</g></svg>`;
  const size = mode === "repeat" ? "auto 100%" : mode === "fixed" ? "contain" : "100% 100%";
  const rep = mode === "repeat" ? "repeat-x" : "no-repeat";
  return `background-image:url('${SVG_URI(svg)}');background-size:${size};` +
    `background-repeat:${rep};background-position:${mode === "fixed" ? "center" : "left center"}`;
}

const DOODLE_EXTRA = {
  divide:  ["Divider",   `M4 50h26M70 50h26M40 50h20M50 40v20`],
  sparks:  ["Sparks",    `M20 20v16M12 28h16M62 12v12M56 18h12M74 58v20M64 68h20`],
  hearts:  ["Hearts",    `M26 56C12 44 8 34 16 28c6-4 12 0 10 6 2-6 10-8 14-2 6 8-2 16-14 24M70 78C58 68 54 60 61 55c5-4 10 0 9 5 2-5 8-7 12-2 5 7-1 13-12 20`],
  ribbon:  ["Ribbon",    `M10 40h80v24H10ZM10 40 2 32v40l8-8M90 40l8-8v40l-8-8`],
  banner2: ["Banner",    `M14 26h72v34l-36 14-36-14Z`],
  swirl:   ["Flourish",  `M6 62c18 0 22-28 40-28s16 22 0 22-16-22 4-22 30 18 44 6`],
  question:["Question",  `M34 34a16 16 0 1 1 22 15c-4 3-6 6-6 11M50 78v2`],
  note:    ["Music",     `M38 76V20l34-8v56M38 76a10 8 0 1 1-20 0 10 8 0 0 1 20 0ZM72 68a10 8 0 1 1-20 0 10 8 0 0 1 20 0Z`],
  cornerB: ["Corner",    `M8 92V26a18 18 0 0 1 18-18h66M20 92V34a10 10 0 0 1 10-10h62`],
  plus:    ["Plus",      `M50 22v56M22 50h56`],
  underline2:["Double",  `M6 44h88M6 58h88`],
  loop:    ["Loops",     `M4 56c10-22 20 22 30 0s20 22 30 0 20 22 32 0`]
};
Object.assign(DOODLES, DOODLE_EXTRA);

/* ── state ──────────────────────────────────────────────────── */
let NB = null, CAP = null, RO = false, DIRTY = false, HOSTLESS = false;
let SI = 0, PI = 0, SEL = new Set(), PRESENT = false, TOOL = "select";
const BLOBS = new Map();   /* id → Blob still to be published */
const KEEP  = new Map();   /* id → Blob already published, URL still live here */
const blobFor = id => BLOBS.get(id) || KEEP.get(id);
const W = {x:0, y:0, z:1};
const UNDO = [], REDO = [];
let PEN = {color:INK_COLORS[0], width:3, kind:"pen"};

const sec  = () => NB.sections[SI];
const page = () => sec() && sec().pages[PI];
const blocks = () => (page() && page().blocks) || [];
const byId = id => viewBlocks().find(b => b.id === id);
const selArr = () => [...SEL].map(byId).filter(Boolean);

function toast(m, ms){
  const t = $("#toast"); t.textContent = m; t.classList.add("on");
  clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove("on"), ms||2400);
}
function dirty(on){
  DIRTY = on !== false;
  const b = $("#b-save");
  b.innerHTML = DIRTY ? '<span class="dot"></span>Save' : "✓ Saved";
  b.disabled = !DIRTY || RO;
  const w = $("#savedat");
  if (HOSTLESS){                    /* opened as a plain web page, not in Claude */
    w.hidden = false; w.textContent = "not saved here — Export keeps it";
    return;
  }
  if (!DIRTY){ dirty.at = new Date(); w.hidden = false;
    w.textContent = "saved " + dirty.at.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  } else if (dirty.at){ w.hidden = false; w.textContent = "unsaved changes"; }
  if (DIRTY) { try { localStorage.setItem("pb.draft", JSON.stringify(serialise())); } catch(_){} }
}
function snap(){ UNDO.push(JSON.stringify(NB.sections)); if (UNDO.length > 60) UNDO.shift(); REDO.length = 0; }
function undo(){
  if (!UNDO.length) return toast("Nothing to undo.");
  REDO.push(JSON.stringify(NB.sections)); NB.sections = JSON.parse(UNDO.pop());
  SI = clamp(SI,0,NB.sections.length-1); PI = clamp(PI,0,sec().pages.length-1);
  SEL.clear(); dirty(); drawAll();
}
function redo(){
  if (!REDO.length) return;
  UNDO.push(JSON.stringify(NB.sections)); NB.sections = JSON.parse(REDO.pop());
  SI = clamp(SI,0,NB.sections.length-1); PI = clamp(PI,0,sec().pages.length-1);
  SEL.clear(); dirty(); drawAll();
}

