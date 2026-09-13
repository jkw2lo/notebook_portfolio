/* ═══════════════════════════════════════════════════════════════
   PART D — type as a SYSTEM, a cover, locking, and the object list.
   ═══════════════════════════════════════════════════════════════ */

/* ── TYPE ────────────────────────────────────────────────────
   A typeface on its own changes very little. What changes a page
   is a ROLE — header, title, caption — sized, tracked and cased
   against the others. So a kit names three faces, the roles say
   how each is set, and a kit may bend a role where its own faces
   need it (Amatic is tiny at 60px; Archivo Black is enormous).
   ═══════════════════════════════════════════════════════════════ */
const ROLES = {
  header:  ["Header",   {slot:"disp", size:62, w:600, track:-.018, caps:0, lh:1.03}],
  title:   ["Title",    {slot:"disp", size:38, w:600, track:-.01,  caps:0, lh:1.12}],
  subtitle:["Subtitle", {slot:"body", size:20, w:400, track:.004,  caps:0, lh:1.40, ital:1, dim:1}],
  kicker:  ["Kicker",   {slot:"mono", size:12, w:500, track:.26,   caps:1, lh:1.4,  dim:1}],
  body:    ["Body",     {slot:"body", size:16, w:400, track:0,     caps:0, lh:1.62}],
  quote:   ["Quote",    {slot:"disp", size:25, w:400, track:0,     caps:0, lh:1.45, ital:1}],
  caption: ["Caption",  {slot:"mono", size:11, w:400, track:.10,   caps:0, lh:1.5,  dim:1}],
  label:   ["Label",    {slot:"mono", size:10, w:500, track:.22,   caps:1, lh:1.5}]
};
const KITS = {
  Bench:      {note:"Newsreader · Karla · Plex", disp:"disp",  body:"body",   mono:"mono"},
  "Field notes":{note:"Bebas · Karla · Courier", disp:"bebas", body:"body",   mono:"courier",
    roles:{header:{size:74, track:.06, caps:1}, title:{size:44, track:.08, caps:1}}},
  Plate:      {note:"Instrument · Karla · Plex",  disp:"instr", body:"body",   mono:"mono",
    roles:{header:{size:76, track:-.02}, quote:{size:28}}},
  Almanac:    {note:"Fraunces · Cormorant · Plex",disp:"fraun", body:"corm",   mono:"mono",
    roles:{body:{size:19}, subtitle:{size:23}}},
  Ledger:     {note:"Courier throughout",         disp:"courier",body:"courier",mono:"courier",
    roles:{header:{size:36, track:.18, caps:1}, title:{size:24, track:.2, caps:1}, body:{size:14}}},
  Postcard:   {note:"Amatic · Caveat · Typewriter",disp:"amatic",body:"caveat", mono:"type",
    roles:{header:{size:96, track:.02, caps:1}, title:{size:62, caps:1}, body:{size:22}, subtitle:{size:26}}},
  Atlas:      {note:"Archivo Black · Karla · Plex",disp:"black",body:"body",   mono:"mono",
    roles:{header:{size:52, track:-.03, caps:1}, title:{size:32, caps:1}}},
  Letter:     {note:"Cormorant throughout",       disp:"corm",  body:"corm",   mono:"mono",
    roles:{header:{size:72}, body:{size:19}}},
  Journal:    {note:"Caveat · Shantell · Typewriter",disp:"caveat",body:"hand",mono:"type",
    roles:{header:{size:78}, title:{size:50}, body:{size:19}}},
  Specimen:   {note:"Newsreader · Plex · Plex",   disp:"disp",  body:"mono",   mono:"mono",
    roles:{body:{size:13, lh:1.7}, subtitle:{size:15, ital:0}}}
};
function kitOf(b){ return KITS[(b && b.kit) || (NB && NB.kit) || "Bench"] || KITS.Bench; }
function roleSpec(b){
  const r = (ROLES[b && b.role] || ROLES.body)[1];
  const k = kitOf(b);
  return Object.assign({}, r, (k.roles && k.roles[(b && b.role) || "body"]) || {});
}
/* the resolved look: role first, then anything the maker overrode */
function textStyle(b){
  const k = kitOf(b), r = roleSpec(b);
  const face = faceCSS(b.font || k[r.slot] || "body");
  const size = b.size || r.size;
  const track = b.track != null ? b.track : r.track;
  const caps = b.caps != null ? b.caps : r.caps;
  const ital = b.ital != null ? b.ital : (r.ital || 0);
  const col = b.color || (r.dim ? "#6A6257" : "#171512");
  return `font-family:${face};font-size:${size}px;font-weight:${b.weight || r.w};` +
    `letter-spacing:${track}em;line-height:${r.lh};color:${esc(col)};` +
    (caps ? "text-transform:uppercase;" : "") + (ital ? "font-style:italic;" : "");
}
function roleSize(b){ return b.size || roleSpec(b).size; }

function kitMenu(anchor, arr){
  const pv = (kit, role) => {
    const fake = {kit, role};
    return `<span style="${textStyle(fake)};font-size:${Math.min(roleSpec(fake).size, 26)}px">Aa</span>`;
  };
  popup(anchor, `<div class="gl">Type kit — sets every role at once</div>
    <div class="kitgrid">${Object.keys(KITS).map(k => `
      <button class="kitcard ${(NB.kit||"Bench")===k?"on":""}" data-kit="${esc(k)}">
        <span class="hd" style="${textStyle({kit:k,role:"header"})};font-size:27px">Ag</span>
        <span class="ti" style="${textStyle({kit:k,role:"title"})};font-size:15px">${esc(k)}</span>
        <span class="bd" style="${textStyle({kit:k,role:"body"})};font-size:12px">Handgloves 123</span>
        <span class="cp" style="${textStyle({kit:k,role:"label"})};font-size:8px">${esc(KITS[k].note)}</span>
      </button>`).join("")}</div>
    <hr><div class="gl">Role for the selected text</div>
    <div class="rolelist">${Object.keys(ROLES).map(r => `
      <button data-role="${r}"><span class="rp" style="${textStyle({role:r})};font-size:${
        Math.min(roleSpec({role:r}).size, 24)}px">${esc(ROLES[r][0])}</span>
      <span class="k">${roleSpec({role:r}).size}px${arr.some(b=>b.role===r)?" ✓":""}</span></button>`).join("")}</div>
    <hr><div class="gl">Override the face on this piece only</div>
    <div class="fgrid">${Object.keys(FACES).map(k =>
      `<button class="fcard" data-face="${k}" style="font-family:${faceCSS(k)}">${esc(FACES[k][0])}</button>`).join("")}</div>`,
  e => {
    const kb = e.target.closest("[data-kit]");
    if (kb){ snap(); NB.kit = kb.dataset.kit; dirty(); drawBlocks(); drawSel(); drawTools(); closePop();
      toast(`Type kit: ${kb.dataset.kit}. Every role on every page follows it.`, 3200); return; }
    const rb = e.target.closest("[data-role]");
    if (rb){
      snap(); arr.forEach(b => { if (b.t !== "text") return;
        b.role = rb.dataset.role;
        delete b.size; delete b.track; delete b.caps; delete b.ital; delete b.font;
        delete b.weight; delete b.color; b.h = 0; });
      dirty(); drawBlocks(); drawSel(); drawTools(); closePop(); return;
    }
    const fb = e.target.closest("[data-face]");
    if (fb){ snap(); arr.forEach(b => { b.font = fb.dataset.face; b.h = 0; });
      dirty(); drawBlocks(); drawSel(); drawTools(); closePop(); }
  }, "wide");
}


/* ── THE COVER ───────────────────────────────────────────────
   Not a page: a different material, no page number, and it is
   what the book opens on. It still takes pieces, so a label or a
   photograph can be stuck to it.                               */
const COVERS = {
  cloth:   ["Bookcloth", c => `background:${c};background-image:
    repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px),
    repeating-linear-gradient(0deg,rgba(0,0,0,.07) 0 1px,transparent 1px 3px)`],
  leather: ["Leather",   c => `background:${c};background-image:
    radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.10),transparent 55%),
    radial-gradient(ellipse at 75% 75%,rgba(0,0,0,.22),transparent 60%)`],
  kraft:   ["Kraft board",c => `background:${c};background-image:
    radial-gradient(ellipse at 20% 15%,rgba(255,245,225,.20),transparent 60%),
    radial-gradient(ellipse at 80% 80%,rgba(80,52,24,.22),transparent 62%)`],
  marble:  ["Marbled",   c => `background:${c};background-image:
    repeating-radial-gradient(ellipse at 25% 30%,rgba(255,255,255,.16) 0 10px,transparent 10px 26px),
    repeating-radial-gradient(ellipse at 72% 66%,rgba(0,0,0,.16) 0 14px,transparent 14px 34px)`],
  linen:   ["Linen",     c => `background:${c};background-image:
    repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 2px,transparent 2px 5px),
    repeating-linear-gradient(-45deg,rgba(0,0,0,.05) 0 2px,transparent 2px 5px)`]
};

/* ── LOCKING ─────────────────────────────────────────────────
   A locked piece is finished: it takes no pointer, cannot be
   marqueed and cannot be nudged. It is the only way to work over
   a background you have already placed.                        */
const isLocked = b => !!(b && b.lock);
function toggleLock(arr, on){
  snap();
  const v = on == null ? !arr.every(isLocked) : on;
  arr.forEach(b => { if (v) b.lock = 1; else delete b.lock; });
  dirty(); drawBlocks(); drawSel(); drawTools(); drawObjs();
  toast(v ? "Locked. Click it in the Objects list to unlock." : "Unlocked.", 2600);
}

/* ── THE OBJECT LIST ─────────────────────────────────────────
   Everything on the spread, back of the stack at the bottom, the
   way it is actually layered. Hovering lights the piece on the
   page; dragging a row restacks it.                            */
const OBJ_ICON = {photo:"▣", text:"T", note:"▤", swatch:"◧", spec:"≣", shape:"◆", stitch:"┈",
  tape:"▬", scrap:"▨", tag:"⬟", ticket:"🎟", stamp:"▦", ribbon:"➤", date:"▢", check:"☑",
  ink:"✎", sticker:"✦", doodle:"✐", time:"⌇", month:"▦", track:"▥", mood:"☺", rate:"★",
  quote:"❝", mark:"◉", clip:"🖇", seal:"✹", env:"✉", lace:"︵", libcard:"▤", post:"✉"};
function objName(b){
  if (b.t === "text") return (b.text || "").slice(0, 34) || "Empty text";
  if (b.t === "note") return (b.text || "").slice(0, 34) || "Note";
  if (b.t === "photo") return b.caption || (b.src ? "Photograph" : "Empty photo frame");
  if (b.t === "sticker") return skName(b.key);
  if (b.t === "doodle") return (DOODLES[b.key] || ["Mark"])[0];
  if (b.t === "date") return dateText(b);
  if (b.t === "spec") return b.title || "Spec table";
  if (b.t === "swatch") return b.label || "Swatch";
  if (b.t === "tag" || b.t === "mark" || b.t === "seal") return b.text || b.t;
  if (b.t === "ticket") return b.t1 || "Ticket";
  return (b.t.charAt(0).toUpperCase() + b.t.slice(1));
}
function drawObjs(){
  const host = $("#objlist"); if (!host) return;
  $("#objs").hidden = !OBJS_ON || PRESENT;
  if (!OBJS_ON || PRESENT) return;
  const v = viewPages();
  host.innerHTML = v.map(({p, pi, ox}) => {
    const side = NB.bind === "spread" ? (ox ? "right" : "left") : "";
    const rows = p.blocks.slice().reverse().map(b => `
      <div class="orow2 ${SEL.has(b.id)?"sel":""} ${isLocked(b)?"lk":""}"
           draggable="${isLocked(b)?"false":"true"}" data-oid="${b.id}">
        <span class="ic">${OBJ_ICON[b.t] || "◻"}</span>
        <span class="nm">${esc(objName(b))}</span>
        <button class="lb" data-lock="${b.id}" title="${isLocked(b)?"Unlock":"Lock"}"
          aria-pressed="${isLocked(b)}">${isLocked(b)?"🔒":"🔓"}</button>
      </div>`).join("");
    return `<div class="ogroup"><div class="oh">${esc(p.name)}${side?` · ${side}`:""}
      <span>${p.blocks.length}</span></div>${rows || `<div class="oempty">nothing on this page yet</div>`}</div>`;
  }).join("");
}
let OBJS_ON = false;
function wireObjs(){
  const host = $("#objlist");
  host.onclick = e => {
    const lk = e.target.closest("[data-lock]");
    if (lk){ const b = byId(lk.dataset.lock); if (b) toggleLock([b]); return; }
    const r = e.target.closest("[data-oid]"); if (!r) return;
    const id = r.dataset.oid;
    if (e.shiftKey) SEL.has(id) ? SEL.delete(id) : SEL.add(id);
    else SEL = new Set([id]);
    drawSel(); drawTools(); drawObjs();
  };
  host.onmouseover = e => {
    const r = e.target.closest("[data-oid]"); if (!r) return;
    $$(".blk.lit2").forEach(n => n.classList.remove("lit2"));
    const el = $(`.blk[data-id="${r.dataset.oid}"]`); if (el) el.classList.add("lit2");
  };
  host.onmouseleave = () => $$(".blk.lit2").forEach(n => n.classList.remove("lit2"));
  let src = null;
  host.addEventListener("dragstart", e => {
    src = e.target.closest("[data-oid]"); if (src) src.classList.add("drag");
  });
  host.addEventListener("dragend", () => { if (src) src.classList.remove("drag"); src = null; });
  host.addEventListener("dragover", e => {
    e.preventDefault();
    const over = e.target.closest("[data-oid]");
    if (!over || !src || over === src || over.parentNode !== src.parentNode) return;
    const r = over.getBoundingClientRect();
    over.parentNode.insertBefore(src, (e.clientY - r.top)/r.height > .5 ? over.nextSibling : over);
  });
  host.addEventListener("drop", e => {
    e.preventDefault();
    const group = src && src.parentNode; if (!group) return;
    const ids = [...group.querySelectorAll("[data-oid]")].map(n => n.dataset.oid).reverse();
    const v = viewPages()[[...host.children].indexOf(group)];
    if (!v) return;
    snap();
    const map = new Map(v.p.blocks.map(b => [b.id, b]));
    v.p.blocks = ids.map(i => map.get(i)).filter(Boolean);
    dirty(); drawBlocks(); drawSel(); drawObjs();
  });
}

