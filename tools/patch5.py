import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
miss = []
def edit(rel, pairs):
    p = R / rel; t = p.read_text(encoding="utf-8")
    for a, b in pairs:
        if a not in t: miss.append(rel + " :: " + a[:48]); print("  MISS", rel, a[:48]); continue
        t = t.replace(a, b, 1); print("  ok  ", rel, "—", a.split("\n")[0][:52])
    p.write_text(t, encoding="utf-8")

# ── load order ───────────────────────────────────────────────
o = R / "src/order.json"; names = json.loads(o.read_text())
if "20-photo-and-share.js" not in names:
    names.append("20-photo-and-share.js"); o.write_text(json.dumps(names, indent=2) + "\n")
    print("  ok   order.json — 20 appended")

# ══ CSS ══════════════════════════════════════════════════════
# text on every block scales from the block's own font-size
edit("src/styles.css", [
(".b-swatch .nm{font-family:var(--f-ui); font-weight:700; font-size:12px; color:#171512;",
 ".b-swatch{font-size:12px}\n.b-swatch .nm{font-family:var(--f-ui); font-weight:700; font-size:1em; color:#171512;"),
(".b-swatch .sp{font-family:var(--f-mono); font-size:9.5px;",
 ".b-swatch .sp{font-family:var(--f-mono); font-size:.8em;"),
(".b-spec h4{margin:0 0 9px; font-family:var(--f-disp); font-size:15px; font-weight:600;",
 ".b-spec{font-size:10.5px}\n.b-spec h4{margin:0 0 .85em; font-family:var(--f-disp); font-size:1.42em; font-weight:600;"),
(".b-spec table{width:100%; border-collapse:collapse; font-family:var(--f-mono); font-size:10.5px}",
 ".b-spec table{width:100%; border-collapse:collapse; font-family:var(--f-mono); font-size:1em}"),
("""  font-size:9px; padding-right:14px; white-space:nowrap; padding-top:6px}""",
 """  font-size:.86em; padding-right:14px; white-space:nowrap; padding-top:6px}"""),
(".b-ticket .stub{width:31%; border-right:2px dashed rgba(0,0,0,.3); display:grid; place-items:center;\n  font-family:var(--f-type); font-size:19px;",
 ".b-ticket{font-size:14px}\n.b-ticket .stub{width:31%; border-right:2px dashed rgba(0,0,0,.3); display:grid; place-items:center;\n  font-family:var(--f-type); font-size:1.36em;"),
(".b-ticket .t1{font-family:var(--f-type); font-size:14px;", ".b-ticket .t1{font-family:var(--f-type); font-size:1em;"),
(".b-ticket .t2{font-family:var(--f-mono); font-size:9px;", ".b-ticket .t2{font-family:var(--f-mono); font-size:.64em;"),
(".b-stamp .val{position:absolute; left:6px; top:5px; font-family:var(--f-type); font-size:12px;",
 ".b-stamp{font-size:12px}\n.b-stamp .val{position:absolute; left:6px; top:5px; font-family:var(--f-type); font-size:1em;"),
(".b-stamp .cap{position:absolute; left:0; right:0; bottom:4px; text-align:center;\n  font-family:var(--f-mono); font-size:8px;",
 ".b-stamp .cap{position:absolute; left:0; right:0; bottom:4px; text-align:center;\n  font-family:var(--f-mono); font-size:.67em;"),
(".b-card .hd{font-size:9px;", ".b-card{font-size:9px}\n.b-card .hd{font-size:1em;"),
(".b-env .lbl{position:absolute; left:10%; right:10%; bottom:12%; text-align:center;\n  font-size:12px;",
 ".b-env{font-size:12px}\n.b-env .lbl{position:absolute; left:10%; right:10%; bottom:12%; text-align:center;\n  font-size:1em;"),
(".b-track .th{font-family:var(--f-hand); font-size:14px; margin-bottom:2px}",
 ".b-track .th{font-family:var(--f-hand); font-size:1.55em; margin-bottom:2px}"),
(".b-track .tl{display:flex; align-items:center; gap:7px; font-size:9px}",
 ".b-track .tl{display:flex; align-items:center; gap:7px; font-size:1em}"),
(".b-month .mh{font-family:var(--f-disp); font-size:14px; font-weight:600; text-align:center}",
 ".b-month .mh{font-family:var(--f-disp); font-size:1.55em; font-weight:600; text-align:center}"),
(".b-month .mg{display:grid; grid-template-columns:repeat(7,1fr); gap:2px; flex:1; font-size:9px}",
 ".b-month .mg{display:grid; grid-template-columns:repeat(7,1fr); gap:2px; flex:1; font-size:1em}"),
(".b-quote .q{font-family:var(--f-disp); font-style:italic; font-size:15px; line-height:1.45}",
 ".b-quote .q{font-family:var(--f-disp); font-style:italic; font-size:1em; line-height:1.45}"),
(".b-quote .by{font-family:var(--f-mono); font-size:8.5px;",
 ".b-quote .by{font-family:var(--f-mono); font-size:.58em;"),
(".b-mood i{font-style:normal; font-size:20px;", ".b-mood i{font-style:normal; font-size:1em;"),
(".b-rate i{font-style:normal; font-size:22px;", ".b-rate i{font-style:normal; font-size:1em;"),

# a stamp's frame is drawn in EM, so it grows with the type instead
# of staying a fixed hoop the letters burst out of
(""".b-mark.box{border:3px solid currentColor; border-radius:3px; box-shadow:inset 0 0 0 2px transparent,
  inset 0 0 0 4.5px currentColor}
.b-mark.rnd{border:3px solid currentColor; border-radius:50%; box-shadow:inset 0 0 0 4.5px currentColor}""",
 """.b-mark.box{border:.16em solid currentColor; border-radius:.16em;
  box-shadow:inset 0 0 0 .1em transparent, inset 0 0 0 .24em currentColor}
.b-mark.rnd{border:.16em solid currentColor; border-radius:50%; box-shadow:inset 0 0 0 .24em currentColor}"""),
(""".b-date{position:absolute; inset:0; display:grid; place-items:center; padding:6px 10px;
  font-family:var(--f-type); text-align:center; line-height:1.15; opacity:.82;
  border:2.5px solid currentColor; border-radius:4px}""",
 """.b-date{position:absolute; inset:0; display:grid; place-items:center; padding:.3em .5em;
  font-family:var(--f-type); text-align:center; line-height:1.15; opacity:.82;
  border:.14em solid currentColor; border-radius:.2em}"""),
(".b-date.round{border:3px solid currentColor; border-radius:50%;\n  box-shadow:inset 0 0 0 4.5px currentColor}",
 ".b-date.round{border:.16em solid currentColor; border-radius:50%;\n  box-shadow:inset 0 0 0 .24em currentColor}"),

# the photograph gains a working area inside its frame
(".b-photo{overflow:hidden; background:#D9D4CA}",
 """.b-photo{overflow:hidden; background:#D9D4CA}
.b-photo .pwrap{position:relative; width:100%; height:100%; overflow:hidden}
.b-photo .pwrap img{width:100%; height:100%; display:block; transform-origin:center}
.b-photo .pink{position:absolute; inset:0; width:100%; height:100%; overflow:visible;
  pointer-events:none}
#canvas.cropping .blk .hit{cursor:move}
.blk.crop .pwrap{outline:2px dashed var(--accent); outline-offset:-2px}"""),
])

# ══ renderers read their own size ════════════════════════════
edit("src/js/02-tape-and-journal.js", [
('return `<div class="b-time" style="position:absolute;inset:0;color:${esc(b.color||"#8A8175")}">',
 'return `<div class="b-time" style="position:absolute;inset:0;font-size:${b.size||10}px;color:${esc(b.color||"#8A8175")}">'),
('return `<div class="b-month" style="position:absolute;inset:0;color:${esc(b.color||"#2B2720")}">',
 'return `<div class="b-month" style="position:absolute;inset:0;font-size:${b.size||9}px;color:${esc(b.color||"#2B2720")}">'),
('return `<div class="b-track" style="position:absolute;inset:0;color:${esc(b.color||"#2B2720")}">',
 'return `<div class="b-track" style="position:absolute;inset:0;font-size:${b.size||9}px;color:${esc(b.color||"#2B2720")}">'),
('return `<div class="b-mood" style="position:absolute;inset:0;color:${esc(b.color||"#2B2720")}">',
 'return `<div class="b-mood" style="position:absolute;inset:0;font-size:${b.size||20}px;color:${esc(b.color||"#2B2720")}">'),
('return `<div class="b-rate" style="position:absolute;inset:0;color:${esc(b.color||"#C4903C")}">',
 'return `<div class="b-rate" style="position:absolute;inset:0;font-size:${b.size||22}px;color:${esc(b.color||"#C4903C")}">'),
('return `<div class="b-quote" style="position:absolute;inset:0;color:${esc(b.color||"#4A453D")}">',
 'return `<div class="b-quote" style="position:absolute;inset:0;font-size:${b.size||15}px;color:${esc(b.color||"#4A453D")}">'),
])
edit("src/js/04-type-stickers-dates.js", [
('return `<div class="b-env" style="position:absolute;inset:0;background:${c}">',
 'return `<div class="b-env" style="position:absolute;inset:0;font-size:${b.size||12}px;background:${c}">'),
('return `<div class="b-card" style="position:absolute;inset:0">',
 'return `<div class="b-card" style="position:absolute;inset:0;font-size:${b.size||9}px">'),
])
edit("src/js/10-render.js", [
("""    case "swatch":
      return `<div class="b-swatch" style="position:absolute;inset:0">""",
 """    case "swatch":
      return `<div class="b-swatch" style="position:absolute;inset:0;font-size:${b.size||12}px">"""),
("""    case "spec":
      return `<div class="b-spec" style="position:absolute;inset:0">""",
 """    case "spec":
      return `<div class="b-spec" style="position:absolute;inset:0;font-size:${b.size||10.5}px">"""),
("""    case "ticket":
      return `<div class="b-ticket">""",
 """    case "ticket":
      return `<div class="b-ticket" style="font-size:${b.size||14}px">"""),
("""    case "stamp":
      return `<div class="b-stamp">""",
 """    case "stamp":
      return `<div class="b-stamp" style="font-size:${b.size||12}px">"""),
# the photograph is drawn by its own function now
("""    case "photo": {
      const inner = b.src ? `<img src="${esc(b.src)}" alt="${esc(b.caption||"")}" draggable="false">`
                          : `<div class="ph">drop a photo</div>`;
      const cap = b.frame === "polaroid" ? `<div class="pcap">${esc(b.caption||"")}</div>` : "";
      const clip = b.frame === "torn" ? `clip-path:${torn(b.id, 2.6)};` : "";
      return `<div class="b-photo fit-${esc(b.fit||"cover")} fr-${esc(b.frame||"none")}"
        style="position:absolute;inset:0;border-radius:${b.radius||0}px;${clip}">${inner}${cap}</div>`;
    }""",
 """    case "photo": return photoHTML(b);"""),
])

# ══ the toolbar ══════════════════════════════════════════════
SIZE = lambda d: ('<input class="fld" type="number" min="6" max="120" style="width:58px" '
                  'data-p="size" value="${b.size||%s}" title="Text size">' % d)
edit("src/js/11-tool-rail.js", [
# photograph: plain names, and the tools to cut it up
("""    if (b.t === "photo"){
      s += `<button class="btn ghost" data-act="replace">Replace</button>
        <div class="seg" data-p="fit">${["cover","contain"].map(v=>
          `<button data-v="${v}" aria-pressed="${(b.fit||"cover")===v}">${v}</button>`).join("")}</div>
        <select class="fld" data-p="frame">${["none","mat","polaroid","torn"].map(v=>
          `<option value="${v}" ${b.frame===v?"selected":""}>${v==="none"?"no frame":v}</option>`).join("")}</select>
        <input class="fld" style="width:126px" data-p="caption" placeholder="Caption" value="${esc(b.caption||"")}">
        <span class="lbl">Round</span><input type="range" min="0" max="60" data-p="radius" value="${b.radius||0}">`;
    }""",
 """    if (b.t === "photo"){
      s += `<button class="btn ${b.src?"ghost":"pri"}" data-act="replace">
          ${b.src ? "Replace photo" : "＋ Add my photo"}</button>
        <button class="btn ghost" data-act="crop" aria-pressed="${CROP===b.id}">✥ Crop</button>
        <button class="btn ghost" data-act="drawon" aria-pressed="${INKTO===b.id}">✎ Draw on it</button>
        ${b.pen && b.pen.length ? `<button class="btn ghost" data-act="wipe">Rub out marks</button>` : ""}
        <span class="sep"></span>
        <select class="fld" data-p="shape">${Object.keys(SHAPES).map(k =>
          `<option value="${k}" ${(b.shape||"none")===k?"selected":""}>${SHAPES[k][0]}</option>`).join("")}</select>
        <select class="fld" data-p="fx">${Object.keys(FX).map(k =>
          `<option value="${k}" ${(b.fx||"none")===k?"selected":""}>${FX[k][0]}</option>`).join("")}</select>
        <select class="fld" data-p="frame">${["none","mat","polaroid","torn"].map(v=>
          `<option value="${v}" ${b.frame===v?"selected":""}>${v==="none"?"no frame":v}</option>`).join("")}</select>
        <span class="sep"></span><span class="lbl">Zoom</span>
        <input type="range" min="100" max="400" data-p="zoomx" value="${Math.round((b.zoom||1)*100)}">
        <span class="lbl">Edge</span>
        <input type="range" min="0" max="26" data-p="bw" value="${b.bw||0}">
        <input type="color" data-p="bc" value="${esc(b.bc||"#2A2520")}" aria-label="Edge colour">
        <div class="seg" data-p="fit">${["cover","contain"].map(v=>
          `<button data-v="${v}" aria-pressed="${(b.fit||"cover")===v}">${v}</button>`).join("")}</div>
        <input class="fld" style="width:120px" data-p="caption" placeholder="Caption" value="${esc(b.caption||"")}">
        <span class="lbl">Round</span><input type="range" min="0" max="60" data-p="radius" value="${b.radius||0}">`;
    }"""),
("""    if (b.t === "post") s += `<button class="btn ghost" data-act="replace">Photo</button>`;""",
 """    if (b.t === "post") s += `<button class="btn ${b.src?"ghost":"pri"}" data-act="replace">
      ${b.src ? "Replace photo" : "＋ Add my photo"}</button>`;"""),
("""    if (b.t === "stamp"){
      s += `<button class="btn ghost" data-act="replace">Photo</button>""",
 """    if (b.t === "stamp"){
      s += `<button class="btn ${b.src?"ghost":"pri"}" data-act="replace">
          ${b.src ? "Replace photo" : "＋ Add my photo"}</button>""" + SIZE(12)),
# size controls on every block that shows words
('        <input class="fld" style="width:120px" data-p="cap" placeholder="Caption" value="${esc(b.cap||"")}">`;',
 '        <input class="fld" style="width:120px" data-p="cap" placeholder="Caption" value="${esc(b.cap||"")}">`;'),
("""        <input class="fld" style="width:150px" data-p="t2" placeholder="What it was" value="${esc(b.t2||"")}">`;""",
 """        <input class="fld" style="width:150px" data-p="t2" placeholder="What it was" value="${esc(b.t2||"")}">""" + SIZE(14) + "`;"),
("""        <input class="fld" style="width:134px" data-p="spec" placeholder="3.2 mm · natural" value="${esc(b.spec||"")}">`;""",
 """        <input class="fld" style="width:134px" data-p="spec" placeholder="3.2 mm · natural" value="${esc(b.spec||"")}">""" + SIZE(12) + "`;"),
("""        <button class="btn ghost" data-act="specedit">Edit rows…</button>`;""",
 """        <button class="btn ghost" data-act="specedit">Edit rows…</button>""" + SIZE(10.5) + "`;"),
("""        <input class="fld" style="width:120px" data-p="by" placeholder="— who said it" value="${esc(b.by||"")}">
        <input type="color" data-p="color" value="${esc(b.color||"#4A453D")}" aria-label="Ink">`;""",
 """        <input class="fld" style="width:120px" data-p="by" placeholder="— who said it" value="${esc(b.by||"")}">
        <input type="color" data-p="color" value="${esc(b.color||"#4A453D")}" aria-label="Ink">""" + SIZE(15) + "`;"),
("""        <input type="color" data-p="color" value="${esc(b.color||"#8A8175")}" aria-label="Rule colour">`;""",
 """        <input type="color" data-p="color" value="${esc(b.color||"#8A8175")}" aria-label="Rule colour">""" + SIZE(10) + "`;"),
("""        <input type="color" data-p="color" value="${esc(b.color||"#2B2720")}" aria-label="Ink">
        <span class="lbl">click a day on the page to ring it</span>`;""",
 """        <input type="color" data-p="color" value="${esc(b.color||"#2B2720")}" aria-label="Ink">""" + SIZE(9) +
 """<span class="lbl">click a day on the page to ring it</span>`;"""),
("""        <input type="color" data-p="color" value="${esc(b.color||"#3F5A46")}" aria-label="Ink">`;""",
 """        <input type="color" data-p="color" value="${esc(b.color||"#3F5A46")}" aria-label="Ink">""" + SIZE(9) + "`;"),
("""        <input class="fld" style="width:100px" data-p="title" placeholder="Label" value="${esc(b.title||"")}">
        <span class="lbl">tap one on the page to choose it</span>`;""",
 """        <input class="fld" style="width:100px" data-p="title" placeholder="Label" value="${esc(b.title||"")}">""" +
 SIZE(20) + """<span class="lbl">tap one on the page to choose it</span>`;"""),
("""        <input type="color" data-p="color" value="${esc(b.color||"#C4903C")}" aria-label="Ink">
        <span class="lbl">tap a star on the page</span>`;""",
 """        <input type="color" data-p="color" value="${esc(b.color||"#C4903C")}" aria-label="Ink">""" + SIZE(22) +
 """<span class="lbl">tap a star on the page</span>`;"""),
("""      <span class="lbl">Lines</span><input class="fld" type="number" min="2" max="14" style="width:56px"
        data-p="lines" value="${b.lines||6}">`;""",
 """      <span class="lbl">Lines</span><input class="fld" type="number" min="2" max="14" style="width:56px"
        data-p="lines" value="${b.lines||6}">""" + SIZE(9) + "`;"),
("""      `<input class="fld" style="width:140px" data-p="text" placeholder="Written on it" value="${esc(b.text||"")}">`;""",
 """      `<input class="fld" style="width:140px" data-p="text" placeholder="Written on it" value="${esc(b.text||"")}">""" + SIZE(12) + "`;"),

# growing the type grows the box with it, so a frame never bursts
("""      if (p === "preset" || p === "size" || p === "font" || p === "caps" || p === "role") b.h = 0;""",
 """      if (p === "preset" || p === "size" || p === "font" || p === "caps" || p === "role") b.h = 0;
      /* a piece whose box hugs its words grows with them — otherwise the
         frame stays put and the letters climb out of it */
      if (p === "size" && HUGS.has(b.t) && old && old > 4){
        const k = v / old;
        b.w = Math.max(20, Math.round(b.w * k));
        b.h = Math.max(16, Math.round((b.h || 30) * k));
      }
      if (p === "zoomx"){ b.zoom = v/100; delete b.zoomx; }"""),
("""  const live = e => {
    const p = e.target.dataset.p; if (!p) return;
    const v = (e.target.type === "number" || e.target.type === "range") ? +e.target.value : e.target.value;""",
 """  const live = e => {
    const p = e.target.dataset.p; if (!p) return;
    const v = (e.target.type === "number" || e.target.type === "range") ? +e.target.value : e.target.value;
    const old = p === "size" ? (arr[0] && arr[0].size) : null;"""),
('    if (["kind","frame","fill","fmt","style","role"].includes(p)) drawTools();',
 '    if (["kind","frame","fill","fmt","style","role","shape","fx"].includes(p)) drawTools();'),
# actions
("""  else if (a === "replace"){ PICK_FOR = arr[0].id; $("#picker").click(); return; }""",
 """  else if (a === "crop"){ setCrop(CROP === arr[0].id ? null : arr[0].id); return; }
  else if (a === "drawon"){ setInkTo(INKTO === arr[0].id ? null : arr[0].id); return; }
  else if (a === "wipe"){ snap(); arr.forEach(b => delete b.pen); }
  else if (a === "replace"){ PICK_FOR = arr[0].id; $("#picker").click(); return; }"""),
])

# ══ share menu in the rail ═══════════════════════════════════
edit("src/markup.html", [
("""  <button class="btn ghost" id="b-objs" aria-pressed="false">☰ Objects</button>""",
 """  <button class="btn ghost" id="b-objs" aria-pressed="false">☰ Objects</button>
  <button class="btn ghost" id="b-share">⇪ Export ▾</button>"""),
])
edit("src/js/14-sections-and-pages.js", [
("""$("#objs-x").onclick = () => $("#b-objs").click();""",
 """$("#objs-x").onclick = () => $("#b-objs").click();
$("#b-share").onclick = e => shareMenu(e.currentTarget);"""),
])
edit("src/js/16-help.js", [
("""    <hr><button data-x="export"><span class="gicon">↓</span>Export notebook JSON</button>
    <button data-x="import"><span class="gicon">↑</span>Import a notebook…</button>
    <button data-x="pdf"><span class="gicon">⎙</span>Print / save as PDF</button>
    <button data-x="stand"><span class="gicon">⇪</span>Export a standalone copy…</button>`,""",
 """    <hr><div class="gl">Getting things in and out lives under Export in the top bar.</div>`,"""),
])

# ══ blocks whose box hugs their words ════════════════════════
edit("src/js/10-render.js", [
("const AUTO_H = b =>",
 """/* a frame drawn round words has to grow when the words do */
const HUGS = new Set(["mark","date","seal","tag","swatch","ticket","stamp","libcard","env","quote"]);
const AUTO_H = b ="""),
])

# ══ cropping and drawing on a photograph ═════════════════════
edit("src/js/12-canvas.js", [
("""  if (SPACE || e.button === 1){ MODE = "pan"; ORIG = {...W}; cv.classList.add("pan"); return; }""",
 """  if (SPACE || e.button === 1){ MODE = "pan"; ORIG = {...W}; cv.classList.add("pan"); return; }

  /* cropping: the frame stays, the picture moves inside it */
  if (CROP){
    const host = e.target.closest(".blk");
    if (host && host.dataset.id === CROP){
      const b = byId(CROP);
      MODE = "crop"; ORIG = {b, px: b.px == null ? 50 : b.px, py: b.py == null ? 50 : b.py};
      snap(); return;
    }
    setCrop(null);
  }"""),
("""  if (MODE === "pan"){ W.x = ORIG.x + dx; W.y = ORIG.y + dy; camApply(); return; }""",
 """  if (MODE === "pan"){ W.x = ORIG.x + dx; W.y = ORIG.y + dy; camApply(); return; }

  if (MODE === "crop"){
    const b = ORIG.b, z = Math.max(1, b.zoom || 1);
    /* at 1× there is nothing to move; the further in, the more there is */
    const span = 100 / Math.max(.001, z - 1 + .35);
    b.px = clamp(ORIG.px - (dx / W.z / b.w) * span, 0, 100);
    b.py = clamp(ORIG.py - (dy / W.z / (b.h||30)) * span, 0, 100);
    const img = $(`.blk[data-id="${b.id}"] .pwrap img`);
    if (img) img.style.objectPosition = `${b.px}% ${b.py}%`;
    return;
  }"""),
("""  if (MODE === "move"){ rehomeBlocks(selArr()); }""",
 """  if (MODE === "crop"){ dirty(); MODE = null; ORIG = null; return; }
  if (MODE === "move"){ rehomeBlocks(selArr()); }"""),
# a stroke drawn on a photograph belongs to it
("""      snap(); putBlocks([b], {x:x0, y:y0}); dirty(); drawBlocks(); drawSide();""",
 """      const host = INKTO && byId(INKTO);
      if (host){                       /* the marks travel with the picture */
        const pts = STROKE.map(p => { const l = toLocal(host, p[0], p[1]); return [l.x, l.y]; });
        snap();
        (host.pen = host.pen || []).push({pts, color:PEN.color, width:PEN.width, kind:PEN.kind});
        dirty(); drawBlocks();
      } else {
        snap(); putBlocks([b], {x:x0, y:y0}); dirty(); drawBlocks(); drawSide();
      }"""),
# scroll zooms the crop rather than the canvas
("""$("#canvas").addEventListener("wheel", e => {
  e.preventDefault();""",
 """$("#canvas").addEventListener("wheel", e => {
  e.preventDefault();
  if (CROP){
    const b = byId(CROP);
    if (b){ b.zoom = clamp((b.zoom || 1) * Math.exp(-e.deltaY * 0.0016), 1, 4);
      dirty(); drawBlocks(); drawTools(); return; }
  }"""),
("""  if (e.key === "Escape"){ if (TOOL !== "select") setTool("select"); else { SEL.clear(); drawSel(); drawTools(); } return; }""",
 """  if (e.key === "Escape"){
    if (CROP) return setCrop(null);
    if (INKTO) return setInkTo(null);
    if (TOOL !== "select") setTool("select"); else { SEL.clear(); drawSel(); drawTools(); } return; }"""),
])
edit("src/js/10-render.js", [
("""      if (isLocked(b)) el.classList.add("lk");""",
 """      if (isLocked(b)) el.classList.add("lk");
      if (b.id === CROP) el.classList.add("crop");"""),
])
edit("src/js/13-photographs.js", [
("""    BLOBS.set(b.id, blob); idbPut(b.id, blob); dirty(); drawBlocks(); drawSide();""",
 """    BLOBS.set(b.id, blob); idbPut(b.id, blob); dirty(); drawBlocks(); drawSide(); drawTools();"""),
])

if miss: print("\n!! MISSED:", *miss, sep="\n   "); sys.exit(1)
print("\npatch applied")
