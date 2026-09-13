/* ════ TOOL RAIL ════════════════════════════════════════════ */
const EPHEMERA = [["scrap","▨","Paper scrap"],["tag","⬟","Tag"],["ticket","🎟","Ticket"],
  ["stamp","▦","Postage stamp"],["post","✉","Postcard"],["env","✉","Envelope"],
  ["libcard","▤","Library card"],["seal","✹","Wax seal"],["clip","🖇","Paper clip"],
  ["lace","︵","Lace trim"],["ribbon","➤","Ribbon"],["tape","▬","Washi tape"],
  ["stitch","┈","Stitch line"],["shape","◆","Shape or frame"]];
const JOURNAL = [["date","▢","Date stamp"],["mark","◉","Rubber stamp"],["check","☑","Checklist"],
  ["time","⌇","Hour column"],["month","▦","Little month"],["track","▥","Habit grid"],
  ["mood","☺","Mood / weather"],["rate","★","Stars"],["quote","❝","Quote band"],
  ["spec","≣","Spec table"],["swatch","◧","Material swatch"]];

function drawTools(){
  const t = $("#tools");
  if (RO){
    t.innerHTML = `<span class="lbl">Read only</span><span class="sep"></span>
      <button class="btn ghost" id="t-export">Export JSON</button>
      <button class="btn ghost" id="t-pdf">⎙ Print / PDF</button>`;
    $("#t-export").onclick = exportJSON;
    $("#t-pdf").onclick = doPrint; return;
  }
  if (TOOL !== "select"){ t.innerHTML = penHTML(); wirePen(); return; }
  const arr = selArr();
  t.innerHTML = arr.length ? propsHTML(arr) : insertHTML();
  wireTools(arr);
}
function penHTML(){
  return `<span class="lbl">${TOOL === "marker" ? "Marker" : "Pen"}</span>
    <div class="seg" id="pk">
      <button data-k="pen" aria-pressed="${TOOL==="pen"}">Pen</button>
      <button data-k="marker" aria-pressed="${TOOL==="marker"}">Marker</button></div>
    ${INK_COLORS.map(c=>`<button class="ico" data-pc="${c}" style="background:${c};
      border:2px solid ${PEN.color===c?"var(--accent)":"transparent"}" aria-label="${c}"></button>`).join("")}
    <span class="sep"></span><span class="lbl">Width</span>
    <input type="range" min="1" max="24" id="pw" value="${PEN.width}">
    <span class="sep"></span>
    <button class="btn pri" id="p-done">Done drawing <span class="k">Esc</span></button>
    <span class="lbl">draw on the page — each stroke is its own object</span>`;
}
function wirePen(){
  const t = $("#tools");
  t.onclick = e => {
    const k = e.target.closest("#pk [data-k]");
    if (k){ TOOL = k.dataset.k; PEN.kind = TOOL; drawTools(); return; }
    const c = e.target.closest("[data-pc]");
    if (c){ PEN.color = c.dataset.pc; drawTools(); return; }
    if (e.target.closest("#p-done")) setTool("select");
  };
  t.oninput = e => { if (e.target.id === "pw") PEN.width = +e.target.value; };
}
function setTool(t){
  TOOL = t; PEN.kind = t === "marker" ? "marker" : "pen";
  $("#canvas").classList.toggle("inking", t !== "select");
  if (t !== "select"){ SEL.clear(); }
  drawSel(); drawTools();
}

function insertHTML(){
  const it = (k,ic,label) => `<button class="btn ghost" data-ins="${k}"><span>${ic}</span>${label}</button>`;
  return `<span class="lbl">Add</span>
    ${it("text","T","Text")}${it("photo","▣","Photo")}${it("note","▤","Note")}
    <button class="btn ghost" id="t-pen">✎ Pen <span class="k">P</span></button>
    <span class="sep"></span>
    <button class="btn ghost" id="t-eph">✂ Ephemera ▾</button>
    <button class="btn ghost" id="t-jour">☑ Journal ▾</button>
    <button class="btn ghost" id="t-stick">✦ Stickers ▾</button>
    <button class="btn ghost" id="t-layouts">◰ Layouts ▾</button>
    <span class="sep"></span>
    <button class="btn ghost" id="t-sten">▦ Stencil ▾</button>
    <button class="btn ghost" id="t-book">▥ Book ▾</button>
    <button class="btn ghost" id="t-doodle">✐ Marks ▾</button>
    <span class="sep"></span><span class="lbl">Page</span>
    <select class="fld" id="t-paper">${Object.keys(PAPERS).map(k =>
      `<option value="${k}">${PAPERS[k].label}</option>`).join("")}</select>
    <select class="fld" id="t-size">
      <option value="land">Landscape</option><option value="square">Square</option>
      <option value="port">Portrait</option></select>
    <button class="btn ghost" id="t-rename">Rename</button>
    <button class="btn ghost" id="t-duppage">Duplicate</button>
    <button class="btn ghost" id="t-delpage">Delete</button>
    <span class="sep"></span>
    <button class="btn ghost" id="t-cover">${isCover(page()) ? "◆" : "◇"} Cover ▾</button>
    <button class="btn ghost" id="t-tmpl">▤ Template ▾</button>`;
}

/* Text size is a SLIDER, and it changes the TEXT — never the box the
   text sits in. An earlier go grew the block to match, which read as the
   piece resizing itself out from under you. The frames that wrap words
   are drawn in `em`, so they follow the type on their own. */
const sizeField = v => `<span class="lbl">Size</span>
  <input type="range" min="6" max="120" step="1" data-p="size" value="${v}">
  <span class="lbl" data-szv>${Math.round(v)}px</span>`;

function propsHTML(arr){
  const b = arr[0], many = arr.length > 1;
  const sw = (list, key) => list.map(c => `<button class="ico" data-swatch="${c}" data-swk="${key||"color"}"
    style="background:${c};border:2px solid ${b[key||"color"]===c?"var(--accent)":"var(--line)"}"
    aria-label="${c}"></button>`).join("");
  let s = `<span class="lbl">${many ? arr.length+" selected" : b.t}</span>`;
  if (!many){
    if (b.t === "text"){
      s += `<select class="fld" data-p="role" style="width:104px">${Object.keys(ROLES).map(r =>
          `<option value="${r}" ${(b.role||"body")===r?"selected":""}>${esc(ROLES[r][0])}</option>`).join("")}</select>
        <button class="btn ghost" data-act="type">Aa ${esc(NB.kit||"Bench")} ▾</button>
        ${sizeField(roleSize(b))}
        <div class="seg" data-p="align">${["left","center","right"].map(v=>
          `<button data-v="${v}" aria-pressed="${(b.align||"left")===v}">${v[0].toUpperCase()}</button>`).join("")}</div>
        <input type="color" data-p="color" value="${esc(b.color||"#171512")}" aria-label="Text colour">
        <span class="lbl">Track</span>
        <input type="range" min="-5" max="40" data-p="trackx" value="${Math.round((b.track||0)*100)}">
        <button class="ico" data-act="caps" aria-pressed="${!!b.caps}" title="Capitals">AA</button>
        <button class="ico" data-act="ital" aria-pressed="${!!b.ital}" title="Italic"><i>I</i></button>`;
    }
    if (b.t === "photo"){
      /* grouped the way the work goes: the picture itself, then the
         shape it is cut to, then the edge round it, then its colour,
         then the caption under it */
      s += `<span class="lbl">Picture</span>
        <button class="btn ${b.src?"ghost":"pri"}" data-act="replace">
          ${b.src ? "Replace photo" : "＋ Add my photo"}</button>
        <button class="btn ghost" data-act="crop" aria-pressed="${CROP===b.id}">✥ Crop</button>
        <span class="lbl">Zoom</span>
        <input type="range" min="100" max="400" data-p="zoomx" value="${Math.round((b.zoom||1)*100)}">
        <div class="seg" data-p="fit">${["cover","contain"].map(v=>
          `<button data-v="${v}" aria-pressed="${(b.fit||"cover")===v}">${v}</button>`).join("")}</div>

        <span class="sep"></span><span class="lbl">Shape</span>
        <select class="fld" data-p="shape">${Object.keys(SHAPES).map(k =>
          `<option value="${k}" ${(b.shape||"none")===k?"selected":""}>${SHAPES[k][0]}</option>`).join("")}</select>
        <select class="fld" data-p="frame">${["none","mat","polaroid","torn"].map(v=>
          `<option value="${v}" ${b.frame===v?"selected":""}>${v==="none"?"no mount":v}</option>`).join("")}</select>
        ${(b.shape && b.shape !== "none") || b.frame === "torn" ? "" :
          `<span class="lbl">Round</span>
           <input type="range" min="0" max="60" data-p="radius" value="${b.radius||0}">`}

        <span class="sep"></span><span class="lbl">Edge</span>
        <input type="range" min="0" max="26" data-p="bw" value="${b.bw||0}" title="Edge width">
        <input type="color" data-p="bc" value="${esc(b.bc||"#2A2520")}" aria-label="Edge colour">

        <span class="sep"></span><span class="lbl">Colour</span>
        <select class="fld" data-p="fx">${Object.keys(FX).map(k =>
          `<option value="${k}" ${(b.fx||"none")===k?"selected":""}>${FX[k][0]}</option>`).join("")}</select>

        <span class="sep"></span><span class="lbl">Marks</span>
        <button class="btn ghost" data-act="drawon" aria-pressed="${INKTO===b.id}">✎ Draw on it</button>
        ${b.pen && b.pen.length ? `<button class="btn ghost" data-act="wipe">Rub out</button>` : ""}

        <span class="sep"></span><span class="lbl">Caption</span>
        <input class="fld" style="width:130px" data-p="caption" placeholder="Say something"
          value="${esc(b.caption||"")}">
        <button class="ico" data-p="capOff" data-toggle="1" aria-pressed="${b.capOff!==1}"
          title="${b.capOff===1?"Show the caption":"Hide the caption"}">${b.capOff===1?"◌":"●"}</button>
        ${b.capOff === 1 ? "" : `
          <select class="fld" style="width:104px" data-p="capFont">${Object.keys(FACES).map(k =>
            `<option value="${k}" ${(b.capFont||"hand")===k?"selected":""}>${esc(FACES[k][0])}</option>`).join("")}</select>
          <input type="range" min="7" max="48" data-p="capSize" value="${b.capSize||14}" title="Caption size">
          <div class="seg" data-p="capAlign">${["left","center","right"].map(v=>
            `<button data-v="${v}" aria-pressed="${(b.capAlign||"center")===v}">${v[0].toUpperCase()}</button>`).join("")}</div>
          <input type="color" data-p="capColor" value="${esc(b.capColor||"#3A352C")}" aria-label="Caption colour">`}`;
    }
    if (b.t === "note") s += sw(NOTE_COLORS) +
      `${sizeField(b.size||16)}`;
    if (b.t === "scrap") s += sw(SCRAP_COLORS) + `<span class="lbl">torn edges, seeded to this scrap</span>`;
    if (b.t === "ribbon" || b.t === "tape"){
      s += sw(b.t === "tape" ? ["#D9CBA8","#C9D8C4","#E4C3BC","#C3CEE0","#E8DCC0","#EADFC2"] : RIBBON_COLORS);
      s += `<select class="fld" data-p="pat">${Object.keys(PATS).map(k =>
        `<option value="${k}" ${(b.pat||"solid")===k?"selected":""}>${PATS[k][0]}</option>`).join("")}</select>
        <input type="color" data-p="ink" value="${esc(b.ink||"#6B5E48")}" aria-label="Pattern colour">
        <button class="btn ghost" data-act="rip" aria-pressed="${b.rip!==false}">Torn ends</button>
        <span class="lbl">pull it longer and the pattern repeats</span>`;
    }
    if (b.t === "sticker"){
      const m = skMode(b.key);
      s += `<button class="btn ghost" data-act="pickSticker">Change</button>` +
        (m ? `<div class="seg" data-p="fit">${[["repeat","repeat"],["stretch","stretch"],
              ["fixed","keep shape"]].map(([v,l]) =>
              `<button data-v="${v}" aria-pressed="${(b.fit||m)===v}">${l}</button>`).join("")}</div>
             <span class="lbl">pull it longer for more of the pattern</span>`
           : `<button class="btn ghost" data-act="die" aria-pressed="${b.die!==false}">Die-cut edge</button>`) +
        `<span class="lbl">${esc(skName(b.key||""))}</span>`;
    }
    if (b.t === "mark"){
      s += `<input class="fld" style="width:112px" data-p="text" value="${esc((b.text||"").split("\n")[0])}">
        <button class="btn ghost" data-act="marktext">Lines…</button>
        <select class="fld" data-p="style">${["box","rnd","ban","bst"].map(v =>
          `<option value="${v}" ${(b.style||"box")===v?"selected":""}>${
            {box:"framed",rnd:"round",ban:"banner",bst:"burst"}[v]}</option>`).join("")}</select>
        ${b.style === "rnd" ? `<input class="fld" style="width:96px" data-p="sub"
          placeholder="small line" value="${esc(b.sub||"")}">` : ""}
        <div class="seg" data-p="align">${["left","center","right"].map(v=>
          `<button data-v="${v}" aria-pressed="${(b.align||"center")===v}">${v[0].toUpperCase()}</button>`).join("")}</div>
        <input type="color" data-p="color" value="${esc(b.color||"#8A2B2B")}" aria-label="Ink">
        ${sizeField(b.size||20)}
        <span class="lbl">Border</span>
        <input type="range" min="0" max="30" data-p="bord" value="${b.bord==null?16:b.bord}">
        <div class="chips">${MARKS.map(m => `<button class="chipb" data-mark="${m}">${m}</button>`).join("")}</div>`;
    }
    if (b.t === "time"){
      s += `<span class="lbl">From</span><input class="fld" type="number" min="0" max="23"
          style="width:56px" data-p="from" value="${b.from==null?6:b.from}">
        <span class="lbl">to</span><input class="fld" type="number" min="1" max="30"
          style="width:56px" data-p="to" value="${b.to==null?22:b.to}">
        <input type="color" data-p="color" value="${esc(b.color||"#8A8175")}" aria-label="Rule colour">${sizeField(b.size||10)}`;
    }
    if (b.t === "month"){
      const d = new Date();
      const yy = b.y || d.getFullYear(), mm = (b.m == null ? d.getMonth() : b.m) + 1;
      s += `<input class="fld" type="month" style="width:146px" data-p="ym"
          value="${yy}-${String(mm).padStart(2,"0")}" aria-label="Month and year">
        <input type="color" data-p="color" value="${esc(b.color||"#2B2720")}" aria-label="Ink">${sizeField(b.size||9)}<span class="lbl">click a day on the page to ring it</span>`;
    }
    if (b.t === "track"){
      s += `<input class="fld" style="width:112px" data-p="title" placeholder="Title" value="${esc(b.title||"")}">
        <button class="btn ghost" data-act="trackrows">Edit rows…</button>
        <span class="lbl">Days</span><input class="fld" type="number" min="3" max="31" style="width:56px"
          data-p="cols" value="${b.cols||14}">
        <input type="color" data-p="color" value="${esc(b.color||"#3F5A46")}" aria-label="Ink">${sizeField(b.size||9)}`;
    }
    if (b.t === "mood"){
      s += `<div class="seg" data-p="kind">${["face","weather"].map(v =>
        `<button data-v="${v}" aria-pressed="${(b.kind||"face")===v}">${v}</button>`).join("")}</div>
        <input class="fld" style="width:100px" data-p="title" placeholder="Label" value="${esc(b.title||"")}">${sizeField(b.size||20)}<span class="lbl">tap one on the page to choose it</span>`;
    }
    if (b.t === "rate"){
      s += `<span class="lbl">Of</span><input class="fld" type="number" min="3" max="10" style="width:56px"
          data-p="n" value="${b.n||5}">
        <input type="color" data-p="color" value="${esc(b.color||"#C4903C")}" aria-label="Ink">${sizeField(b.size||22)}<span class="lbl">tap a star on the page</span>`;
    }
    if (b.t === "quote"){
      s += `<input class="fld" style="width:200px" data-p="text" value="${esc(b.text||"")}">
        <input class="fld" style="width:120px" data-p="by" placeholder="— who said it" value="${esc(b.by||"")}">
        <input type="color" data-p="color" value="${esc(b.color||"#4A453D")}" aria-label="Ink">${sizeField(b.size||15)}`;
    }
    if (b.t === "tag"){
      s += `<input class="fld" style="width:150px" data-p="text" placeholder="Written on the tag" value="${esc(b.text||"")}">
        ${sw(SCRAP_COLORS)}
        ${sizeField(b.size||15)}`;
    }
    if (b.t === "ticket"){
      s += `<input class="fld" style="width:38px" data-p="stub" value="${esc(b.stub||"")}" aria-label="Stub">
        <input class="fld" style="width:150px" data-p="t1" placeholder="Where from" value="${esc(b.t1||"")}">
        <input class="fld" style="width:150px" data-p="t2" placeholder="What it was" value="${esc(b.t2||"")}">${sizeField(b.size||14)}`;
    }
    if (b.t === "stamp"){
      s += `<button class="btn ${b.src?"ghost":"pri"}" data-act="replace">
          ${b.src ? "Replace photo" : "＋ Add my photo"}</button>${sizeField(b.size||12)}
        <input type="color" data-p="color" value="${esc(b.color||"#8FA9B8")}" aria-label="Stamp colour">
        <input class="fld" style="width:44px" data-p="val" placeholder="5" value="${esc(b.val||"")}">
        <input class="fld" style="width:120px" data-p="cap" placeholder="Caption"
          value="${esc((b.cap||"").split("\n")[0])}">
        <button class="btn ghost" data-act="captext">Lines…</button>
        <div class="seg" data-p="align">${["left","center","right"].map(v=>
          `<button data-v="${v}" aria-pressed="${(b.align||"center")===v}">${v[0].toUpperCase()}</button>`).join("")}</div>`;
    }
    if (b.t === "date"){
      s += `<select class="fld" data-p="fmt">${Object.keys(DATE_FMTS).map(k =>
          `<option value="${k}" ${(b.fmt||"stamp")===k?"selected":""}>${esc(DATE_FMTS[k][0])}</option>`).join("")}
          <option value="custom" ${b.fmt==="custom"?"selected":""}>Custom…</option></select>
        <select class="fld" data-p="style">${Object.keys(DATE_STYLES).map(k =>
          `<option value="${k}" ${(b.style||"box")===k?"selected":""}>${esc(DATE_STYLES[k])}</option>`).join("")}</select>
        ${b.fmt === "custom" ? `<input class="fld" style="width:150px" data-p="text" value="${esc(b.text||"")}">` : ""}
        <input class="fld" type="date" style="width:130px" data-p="iso" value="${esc(b.iso||"")}">
        <select class="fld" data-p="font">${Object.keys(FACES).map(k =>
          `<option value="${k}" ${(b.font||"type")===k?"selected":""}>${esc(FACES[k][0])}</option>`).join("")}</select>
        <input type="color" data-p="color" value="${esc(b.color||"#8A2B2B")}" aria-label="Ink colour">
        <button class="btn ghost" data-act="setToday">Today</button>`;
    }
    if (b.t === "doodle"){
      s += `<button class="btn ghost" data-act="pickDoodle">Change mark</button>
        <input type="color" data-p="color" value="${esc(b.color||"#1E1B16")}" aria-label="Ink">
        <span class="lbl">Width</span><input type="range" min="2" max="16" data-p="width" value="${b.width||5}">`;
    }
    if (b.t === "seal") s += `<input type="color" data-p="color" value="${esc(b.color||"#8E2B3E")}" aria-label="Wax">
      <input class="fld" style="width:74px" data-p="text" placeholder="JL" value="${esc(b.text||"")}">
      ${sizeField(b.size||18)}`;
    if (b.t === "env") s += sw(SCRAP_COLORS) +
      `<input class="fld" style="width:140px" data-p="text" placeholder="Written on it" value="${esc(b.text||"")}">${sizeField(b.size||12)}`;
    if (b.t === "lace") s += sw(["#FBF7EE","#F4E8E4","#EDF0F4","#F2EEE2","#E8DCC4"]);
    if (b.t === "clip") s += sw(["#8A9098","#C4A04E","#C4463C","#3F5A6B","#2A2520"]);
    if (b.t === "libcard") s += `<input class="fld" style="width:140px" data-p="title" value="${esc(b.title||"")}">
      <span class="lbl">Lines</span><input class="fld" type="number" min="2" max="14" style="width:56px"
        data-p="lines" value="${b.lines||6}">${sizeField(b.size||9)}`;
    if (b.t === "post") s += `<button class="btn ${b.src?"ghost":"pri"}" data-act="replace">
      ${b.src ? "Replace photo" : "＋ Add my photo"}</button>`;
    if (b.t === "check"){
      s += `<button class="btn ghost" data-act="editlist">Edit items…</button>
        ${sizeField(b.size||16)}
        <span class="lbl">click a box on the page to tick it</span>`;
    }
    if (b.t === "swatch"){
      s += `<input type="color" data-p="color" value="${esc(b.color||"#8A6034")}" aria-label="Swatch colour">
        <input class="fld" style="width:112px" data-p="label" placeholder="Material" value="${esc(b.label||"")}">
        <input class="fld" style="width:134px" data-p="spec" placeholder="3.2 mm · natural" value="${esc(b.spec||"")}">${sizeField(b.size||12)}`;
    }
    if (b.t === "spec"){
      s += `<input class="fld" style="width:120px" data-p="title" placeholder="Title" value="${esc(b.title||"")}">
        <button class="btn ghost" data-act="specedit">Edit rows…</button>${sizeField(b.size||10.5)}`;
    }
    if (b.t === "stitch"){
      s += `<input type="color" data-p="color" value="${esc(b.color||"#8A6034")}" aria-label="Thread colour">
        <span class="lbl">Weight</span><input type="range" min="1" max="8" data-p="weight" value="${b.weight||2}">`;
    }
    if (b.t === "ink"){
      s += `<input type="color" data-p="color" value="${esc(b.color||"#1E1B16")}" aria-label="Ink colour">
        <span class="lbl">Width</span><input type="range" min="1" max="24" data-p="width" value="${b.width||3}">
        <div class="seg" data-p="kind">${["pen","marker"].map(v=>
          `<button data-v="${v}" aria-pressed="${(b.kind||"pen")===v}">${v}</button>`).join("")}</div>`;
    }
    if (b.t === "shape"){
      const open = b.fill === "none";
      s += `<select class="fld" data-p="kind">${["rect","ellipse","rule"].map(v=>
        `<option value="${v}" ${b.kind===v?"selected":""}>${v}</option>`).join("")}</select>
        ${b.kind !== "rule" ? `<div class="seg" data-p="fill">
          <button data-v="solid" aria-pressed="${!open}">filled</button>
          <button data-v="none" aria-pressed="${open}">border</button></div>` : ""}
        ${open ? `<input type="color" data-p="stroke" value="${esc(b.stroke||"#8A8175")}" aria-label="Border colour">
          <span class="lbl">Weight</span><input type="range" min="1" max="18" data-p="strokeW" value="${b.strokeW||3}">
          <select class="fld" data-p="dash">${OPEN_SHAPES.map(v =>
            `<option value="${v}" ${(b.dash||"solid")===v?"selected":""}>${v}</option>`).join("")}</select>`
        : ""}
        <input type="color" data-p="color" value="${esc(b.color||"#DDD6C7")}" aria-label="Shape colour">
        ${b.kind==="rule" ? `<span class="lbl">Weight</span><input type="range" min="1" max="14" data-p="weight" value="${b.weight||2}">`
          : `<span class="lbl">Round</span><input type="range" min="0" max="80" data-p="radius" value="${b.radius||0}">`}`;
    }
    s += `<span class="sep"></span><span class="lbl">Turn</span>
      <input type="range" min="-30" max="30" step="0.5" data-p="rot" value="${b.rot||0}">`;
  }
  s += `<span class="sep"></span>
    <button class="ico" data-act="front" title="Bring to front">⤒</button>
    <button class="ico" data-act="back" title="Send to back">⤓</button>
    ${many ? `<span class="sep"></span>
      <button class="btn ghost" data-act="alignL">Align left</button>
      <button class="btn ghost" data-act="alignC">Centre</button>
      <button class="btn ghost" data-act="distV">Space out</button>` : ""}
    <span class="sep"></span>
    <button class="ico" data-act="lock" title="Lock (⌘L)"
      aria-pressed="${arr.every(b=>b.lock)}">${arr.every(b=>b.lock) ? "🔒" : "🔓"}</button>
    <button class="ico" data-act="dup" title="Duplicate (⌘D)">⧉</button>
    <button class="ico" data-act="del" title="Delete (⌫)">🗑</button>`;
  return s;
}

function wireTools(arr){
  const t = $("#tools");
  t.onclick = e => {
    const ins = e.target.closest("[data-ins]"); if (ins) return insert(ins.dataset.ins);
    const mk = e.target.closest("[data-mark]");
    if (mk){ snap(); arr.forEach(b => b.text = mk.dataset.mark); dirty(); drawBlocks(); drawTools(); return; }
    const sw = e.target.closest("[data-swatch]");
    if (sw){ const k = sw.dataset.swk || "color";
      snap(); arr.forEach(b => b[k] = sw.dataset.swatch); dirty(); drawBlocks(); drawTools(); return; }
    const seg = e.target.closest(".seg [data-v]");
    if (seg){ const p = seg.closest("[data-p]").dataset.p;
      snap(); arr.forEach(b => b[p] = seg.dataset.v); dirty(); drawBlocks(); drawTools(); return; }
    const tg = e.target.closest("[data-toggle]");
    if (tg){ const k = tg.dataset.p;
      snap(); arr.forEach(b => { b[k] = b[k] === 1 ? 0 : 1; });
      dirty(); drawBlocks(); drawTools(); return; }
    const act = e.target.closest("[data-act]"); if (act) return doAct(act.dataset.act, arr);
    if (e.target.closest("#t-pen")) return setTool("pen");
    if (e.target.closest("#t-eph")) return kindMenu(e.target.closest("#t-eph"), EPHEMERA, "Ephemera");
    if (e.target.closest("#t-jour")) return kindMenu(e.target.closest("#t-jour"), JOURNAL, "Journal");
    if (e.target.closest("#t-stick")) return stickerMenu(e.target.closest("#t-stick"));
    if (e.target.closest("#t-sten")) return stenMenu(e.target.closest("#t-sten"));
    if (e.target.closest("#t-book")) return bookMenu(e.target.closest("#t-book"));
    if (e.target.closest("#t-doodle")) return doodleMenu(e.target.closest("#t-doodle"), null);
    if (e.target.closest("#t-layouts")) return layoutMenu(e.target.closest("#t-layouts"));
    if (e.target.closest("#t-cover")) return coverMenu(e.target.closest("#t-cover"));
    if (e.target.closest("#t-tmpl")) return tmplMenu(e.target.closest("#t-tmpl"));
    if (e.target.closest("#t-rename")) return renamePage();
    if (e.target.closest("#t-duppage")) return dupPage();
    if (e.target.closest("#t-delpage")) return delPage();
  };
  const live = e => {
    const p = e.target.dataset.p; if (!p) return;
    const v = (e.target.type === "number" || e.target.type === "range") ? +e.target.value : e.target.value;
    arr.forEach(b => {
      b[p] = v;
      if (p === "preset" || p === "size" || p === "font" || p === "caps" || p === "role") b.h = 0;
      if (p === "zoomx"){ b.zoom = v/100; delete b.zoomx; }
      if (p === "role"){ delete b.track; delete b.caps; delete b.ital; delete b.font;
        delete b.weight; delete b.color; delete b.size; }
      if (p === "trackx"){ b.track = v/100; delete b.trackx; b.h = 0; }
      if (p === "fmt" && v !== "custom") delete b.text;
      /* a month is picked whole: a part-typed year is not a year */
      if (p === "ym"){
        const mt = /^(\d{4})-(\d{2})$/.exec(String(v));
        if (mt){ b.y = +mt[1]; b.m = +mt[2] - 1; }
        delete b.ym;
      }
      if (p === "kind" && b.t === "shape") b.h = b.kind === "rule" ? 0 : (b.h || 120);
    });
    if (p === "size"){ const rd = $("#tools [data-szv]");
      if (rd) rd.textContent = Math.round(v) + "px"; }
    dirty(); drawBlocks(); drawSel();
    if (["kind","frame","fill","fmt","style","role","shape","fx","capOff"].includes(p)) drawTools();
  };
  t.oninput = e => { if (e.target.tagName !== "SELECT") live(e); };
  t.onchange = e => {
    if (e.target.id === "t-size"){ snap(); page().size = e.target.value; dirty(); drawAll(); fitPage(true); return; }
    if (e.target.id === "t-paper"){ snap(); page().paper = e.target.value; dirty(); drawAll(); return; }
    if (e.target.tagName === "SELECT") live(e);
  };
  t.onfocusin = e => { if (e.target.dataset.p) snap(); };
  const sz = $("#t-size"); if (sz) sz.value = page().size || "land";
  const pp = $("#t-paper"); if (pp) pp.value = page().paper || "plain";
}

function doAct(a, arr){
  const bs = blocks();
  if (a === "del"){ snap(); viewPages().forEach(v => v.p.blocks = v.p.blocks.filter(b => !SEL.has(b.id)));
    SEL.clear(); }
  else if (a === "dup"){
    snap();
    const copies = arr.map(b => {
      const c = Object.assign({}, b, {id:uid(), x:b.x+24, y:b.y+24});
      const bl = blobFor(b.id); if (bl) BLOBS.set(c.id, bl);
      return c;
    });
    copies.forEach((c,i) => pageOfBlock(arr[i].id).p.blocks.push(c));
    SEL = new Set(copies.map(c => c.id));
  }
  else if (a === "front"){ snap(); arr.forEach(b => { const L = pageOfBlock(b.id).p.blocks;
    L.splice(L.indexOf(b),1); L.push(b); }); }
  else if (a === "back"){ snap(); arr.slice().reverse().forEach(b => { const L = pageOfBlock(b.id).p.blocks;
    L.splice(L.indexOf(b),1); L.unshift(b); }); }
  else if (a === "alignL"){ snap(); const x = Math.min(...arr.map(b=>b.x)); arr.forEach(b=>b.x=x); }
  else if (a === "alignC"){ snap(); const c = arr.reduce((s,b)=>s+b.x+b.w/2,0)/arr.length;
    arr.forEach(b=>b.x=Math.round(c-b.w/2)); }
  else if (a === "distV"){ snap(); const s = arr.slice().sort((p,q)=>p.y-q.y);
    const top = s[0].y, gap = (s[s.length-1].y-top)/(s.length-1);
    s.forEach((b,i)=>b.y=Math.round(top+gap*i)); }
  else if (a === "rip"){ snap(); arr.forEach(b => b.rip = b.rip === false); }
  else if (a === "lock"){ toggleLock(arr); return; }
  else if (a === "caps"){ snap(); arr.forEach(b => { b.caps = b.caps ? 0 : 1; b.h = 0; }); }
  else if (a === "ital"){ snap(); arr.forEach(b => { b.ital = b.ital ? 0 : 1; b.h = 0; }); }
  else if (a === "type"){ kitMenu($("#tools"), arr); return; }
  else if (a === "pickDoodle"){ doodleMenu($("#tools"), arr[0]); return; }
  else if (a === "die"){ snap(); arr.forEach(b => b.die = b.die === false); }
  else if (a === "pickSticker"){ stickerSwap(arr[0]); return; }
  else if (a === "trackrows") return trackRows(arr[0]);
  else if (a === "marktext") return linesOf(arr[0], "text", "What the stamp says");
  else if (a === "captext")  return linesOf(arr[0], "cap",  "The stamp's caption");
  else if (a === "crop"){ setCrop(CROP === arr[0].id ? null : arr[0].id); return; }
  else if (a === "drawon"){ setInkTo(INKTO === arr[0].id ? null : arr[0].id); return; }
  else if (a === "wipe"){ snap(); arr.forEach(b => delete b.pen); }
  else if (a === "replace"){ PICK_FOR = arr[0].id; $("#picker").click(); return; }
  else if (a === "specedit") return specEditor(arr[0]);
  else if (a === "editlist") return listEditor(arr[0]);
  else if (a === "setToday"){ const t = today(); snap(); arr[0].text = t.stamp; arr[0].sub = t.wd; }
  dirty(); drawBlocks(); drawSel(); drawTools(); drawSide();
}

/* ── inserting ─────────────────────────────────────────────── */
function centreOfView(){
  const c = $("#canvas").getBoundingClientRect();
  return toWorld(c.left + c.width/2, c.top + c.height/2);
}
const pick = a => a[Math.floor(Math.random()*a.length)];
function putBlocks(list, pt){
  const v = (NB.bind === "spread") ? pageAtX(pt.x) : viewPages()[0];
  list.forEach(b => { b.x = Math.round(b.x - v.ox); v.p.blocks.push(b); });
  return v.p;
}
function insert(kind, at){
  const p = at || centreOfView(), x = Math.round(p.x), y = Math.round(p.y);
  const t = today();
  let b;
  switch (kind){
    case "text":   b = blk("text",x-180,y-24,360,0,{text:"",preset:"body",size:18,align:"left",color:"#171512"}); break;
    case "photo":  b = blk("photo",x-170,y-128,340,256,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}); break;
    case "note":   b = blk("note",x-140,y-80,280,160,{text:"A note to yourself.",
      color:NOTE_COLORS[blocks().length%NOTE_COLORS.length],size:16,rot:Math.random()*4-2}); break;
    case "swatch": b = blk("swatch",x-75,y-75,150,150,{color:"#8A6034",label:"Material",spec:""}); break;
    case "spec":   b = blk("spec",x-150,y-90,300,0,{title:"Specification",rows:[["Body",""],["Hardware",""],["Finish",""]]}); break;
    case "shape":  b = blk("shape",x-110,y-70,220,140,{kind:"rect",color:"#DDD6C7",radius:0,weight:2}); break;
    case "tape":   b = blk("tape",x-85,y-17,170,34,{color:"#D9CBA8",rot:-5}); break;
    case "stitch": b = blk("stitch",x-150,y-5,300,0,{color:"#8A6034",weight:2,rot:0}); break;
    case "scrap":  b = blk("scrap",x-150,y-110,300,220,{color:pick(SCRAP_COLORS),rot:Math.random()*6-3}); break;
    case "tag":    b = blk("tag",x-60,y-95,120,190,{text:"a label",color:pick(SCRAP_COLORS),size:15,rot:Math.random()*8-4}); break;
    case "ticket": b = blk("ticket",x-150,y-48,300,96,{stub:"01",t1:"Where it came from",t2:"and what it was",rot:Math.random()*4-2}); break;
    case "stamp":  b = blk("stamp",x-65,y-75,130,150,{src:null,color:"#8FA9B8",val:"5",cap:"handmade",rot:Math.random()*8-4}); break;
    case "ribbon": b = blk("ribbon",x-130,y-13,260,26,{color:pick(RIBBON_COLORS),rot:Math.random()*6-3}); break;
    case "date":   b = blk("date",x-105,y-37,210,74,
      {fmt:"stamp",style:"box",font:"type",size:19,color:"#8A2B2B",rot:Math.random()*5-2.5}); break;
    case "check":  b = blk("check",x-165,y-75,330,150,{items:[[0,"Something to do"],[0,"And another"]],size:16}); break;
    case "time":   b = blk("time",x-45,y-300,90,600,{from:6,to:22,color:"#8A8175"}); break;
    case "month":  b = blk("month",x-95,y-95,190,190,{on:[],color:"#2B2720"}); break;
    case "track":  b = blk("track",x-150,y-60,300,120,
      {title:"This week",rows:["Draft","Cut","Stitch"],cols:14,on:[],color:"#3F5A46"}); break;
    case "mood":   b = blk("mood",x-115,y-20,230,40,{kind:"face",pick:-1,title:"Mood",color:"#2B2720"}); break;
    case "rate":   b = blk("rate",x-70,y-18,140,36,{n:5,v:3,color:"#C4903C"}); break;
    case "quote":  b = blk("quote",x-230,y-32,460,64,
      {text:"A line worth keeping.",by:"",color:"#4A453D"}); break;
    case "doodle": b = blk("doodle",x-45,y-45,90,90,{key:"star",color:PEN.color,width:5,rot:Math.random()*14-7}); break;
    case "clip":   b = blk("clip",x-16,y-52,32,104,{color:"#8A9098",rot:Math.random()*12-6}); break;
    case "seal":   b = blk("seal",x-38,y-38,76,76,{color:"#8E2B3E",text:"",size:18,rot:Math.random()*18-9}); break;
    case "env":    b = blk("env",x-130,y-84,260,168,{color:"#E8DCC4",text:"keepsakes",rot:Math.random()*5-2.5}); break;
    case "lace":   b = blk("lace",x-160,y-20,320,40,{color:"#FBF7EE",rot:Math.random()*4-2}); break;
    case "libcard":b = blk("libcard",x-110,y-72,220,144,{title:"Date due",lines:6,rot:Math.random()*5-2.5}); break;
    case "post":   b = blk("post",x-170,y-110,340,220,{src:null,rot:Math.random()*5-2.5}); break;
    case "mark":   b = blk("mark",x-70,y-26,140,52,
      {text:"DONE",style:"box",size:20,color:"#8A2B2B",rot:Math.random()*9-4.5}); break;
  }
  if (!b) return;
  snap(); putBlocks([b], p); SEL = new Set([b.id]);
  dirty(); drawBlocks(); drawSel(); drawTools(); drawSide();
  if (kind === "text") setTimeout(() => editText(b.id), 20);
}

/* ── layouts: starting arrangements, not auto-layout ───────── */
const LAYOUTS = {
  "Daily entry": p => { const t = today(); return [
    blk("date",p.x,p.y,210,74,{iso:t.iso,fmt:"long",style:"box",font:"type",size:17,color:"#8A2B2B",rot:-2.2}),
    blk("text",p.x,p.y+104,470,0,{text:"Today…",preset:"hand",size:21,align:"left",color:"#26221B"}),
    blk("check",p.x,p.y+240,330,150,{items:[[0,"First thing"],[0,"Second thing"],[0,"Third thing"]],size:16}),
    blk("scrap",p.x+390,p.y+230,300,220,{color:pick(SCRAP_COLORS),rot:-3}),
    blk("photo",p.x+412,p.y+250,256,180,{src:null,natW:4,natH:3,fit:"cover",frame:"torn",radius:0,caption:"",rot:2})
  ];},
  "Ephemera cluster": p => ([
    blk("scrap",p.x,p.y,320,240,{color:pick(SCRAP_COLORS),rot:-4}),
    blk("ticket",p.x+40,p.y+40,280,90,{stub:"07",t1:"Where from",t2:"and when",rot:3}),
    blk("tag",p.x+250,p.y+150,110,175,{text:"a label",color:pick(SCRAP_COLORS),size:15,rot:-7}),
    blk("stamp",p.x+390,p.y+30,120,140,{src:null,color:"#B08A8A",val:"2",cap:"post",rot:5}),
    blk("ribbon",p.x+360,p.y+230,240,24,{color:pick(RIBBON_COLORS),rot:-2}),
    blk("tape",p.x+120,p.y-14,150,32,{color:"#D9CBA8",rot:-6})
  ]),
  "Sketch and notes": p => ([
    blk("shape",p.x,p.y,440,330,{kind:"rect",color:"#FFFFFF",radius:2}),
    blk("text",p.x,p.y+346,440,0,{text:"what I was looking at",preset:"hand",size:19,align:"left",color:"#4A453D"}),
    blk("stitch",p.x,p.y+392,440,0,{color:"#8A6034",weight:2}),
    blk("note",p.x+480,p.y+20,270,150,{text:"and what I noticed",color:NOTE_COLORS[3],size:16,rot:1.6})
  ]),
  "Hour by hour": p => { const t = today(); return [
    blk("time",p.x,p.y+56,84,600,{from:6,to:22,color:"#8A8175"}),
    blk("date",p.x+108,p.y,210,74,{text:t.stamp,sub:t.wd,size:19,color:"#8A2B2B",rot:-1.6}),
    blk("stitch",p.x+108,p.y+92,560,0,{color:"#8A8175",weight:1.5}),
    blk("text",p.x+108,p.y+112,560,0,{text:"Today…",preset:"hand",size:20,align:"left",color:"#26221B"}),
    blk("mood",p.x+360,p.y+8,230,40,{kind:"weather",pick:-1,title:"",color:"#2B2720"}),
    blk("quote",p.x,p.y+690,700,64,{text:"A line worth keeping.",by:"",color:"#4A453D"})
  ];},
  "Month at a glance": p => ([
    blk("month",p.x,p.y,300,300,{on:[],color:"#2B2720"}),
    blk("track",p.x+336,p.y,420,150,{title:"This month",rows:["Draft","Cut","Stitch"],cols:16,on:[],color:"#3F5A46"}),
    blk("check",p.x+336,p.y+176,420,140,{items:[[0,"Something to finish"],[0,"Something to start"]],size:16}),
    blk("stitch",p.x,p.y+330,756,0,{color:"#8A6034",weight:2})
  ]),
  "Week, seven up": p => {
    const out = [blk("text",p.x,p.y,300,0,{text:"This week",preset:"display",size:30,align:"left",color:"#171512"})];
    const wd = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    for (let i=0;i<7;i++){
      out.push(blk("text",p.x+i*150,p.y+56,140,0,{text:wd[i],preset:"label",size:10,align:"left",color:"#8A8175"}));
      out.push(blk("stitch",p.x+i*150,p.y+76,140,0,{color:"#C3D3DE",weight:1.5}));
      out.push(blk("check",p.x+i*150,p.y+88,140,110,{items:[[0,""],[0,""]],size:13}));
    }
    return out;
  },
  "Travel page": p => ([
    blk("scrap",p.x,p.y,340,250,{color:"#E8DCC4",rot:-2.4}),
    blk("photo",p.x+22,p.y+22,296,200,{src:null,natW:3,natH:2,fit:"cover",frame:"torn",radius:0,caption:"",rot:1.4}),
    blk("sticker",p.x+300,p.y-30,96,96,{key:"place/eiffel",die:true,rot:-9}),
    blk("ticket",p.x+380,p.y+40,300,96,{stub:"A2",t1:"Where I went",t2:"and how I got there",rot:2}),
    blk("stamp",p.x+390,p.y+170,120,140,{src:null,color:"#B08A8A",val:"5",cap:"post",rot:-5}),
    blk("text",p.x,p.y+280,420,0,{text:"what it smelled like",preset:"hand",size:21,align:"left",color:"#4A453D"}),
    blk("tape",p.x+120,p.y-16,160,34,{color:"#C3CEE0",pat:"stripe",ink:"#6B7E99",rot:-7})
  ]),
  "Recipe": p => ([
    blk("sticker",p.x,p.y,84,84,{key:"food/ramen",die:true,rot:-6}),
    blk("text",p.x+104,p.y+10,420,0,{text:"Something I cooked",preset:"display",size:32,align:"left",color:"#171512"}),
    blk("rate",p.x+104,p.y+58,140,36,{n:5,v:4,color:"#C4903C"}),
    blk("spec",p.x,p.y+120,300,0,{title:"What is in it",rows:[["",""],["",""],["",""],["",""]]}),
    blk("check",p.x+336,p.y+120,360,180,{items:[[0,"First"],[0,"Then"],[0,"Finally"]],size:16}),
    blk("note",p.x+336,p.y+320,360,120,{text:"next time: less salt",color:"#FBE79B",size:17,rot:1.5})
  ]),
  "Mood board": p => {
    const out = [], put = [[0,0,230,170],[250,0,170,170],[440,0,230,110],[0,190,170,180],
                 [190,190,230,180],[440,130,230,240]];
    put.forEach((q,i) => out.push(blk("photo",p.x+q[0],p.y+q[1],q[2],q[3],
      {src:null,natW:q[2],natH:q[3],fit:"cover",frame:i%3===0?"mat":"none",radius:2,caption:""})));
    out.push(blk("swatch",p.x,p.y+390,140,140,{color:"#8A6034",label:"",spec:""}));
    out.push(blk("swatch",p.x+156,p.y+390,140,140,{color:"#3F5A46",label:"",spec:""}));
    out.push(blk("ribbon",p.x+320,p.y+430,350,26,{color:"#9E5E6A",pat:"dot",ink:"#FFFFFF",rot:-2}));
    return out;
  },
  "Three good things": p => ([
    blk("date",p.x,p.y,210,74,{text:today().stamp,sub:today().wd,size:19,color:"#3F5A46",rot:-2}),
    blk("text",p.x,p.y+104,460,0,{text:"Three good things",preset:"display",size:34,align:"left",color:"#171512"}),
    blk("text",p.x,p.y+164,460,0,{text:"1.",preset:"hand",size:22,align:"left",color:"#26221B"}),
    blk("text",p.x,p.y+218,460,0,{text:"2.",preset:"hand",size:22,align:"left",color:"#26221B"}),
    blk("text",p.x,p.y+272,460,0,{text:"3.",preset:"hand",size:22,align:"left",color:"#26221B"}),
    blk("mood",p.x,p.y+336,230,40,{kind:"face",pick:-1,title:"Mood",color:"#2B2720"}),
    blk("sticker",p.x+500,p.y+60,110,110,{key:"effect/sparkle",die:true,rot:11})
  ]),
  "Cover": p => ([
    blk("text",p.x,p.y,660,0,{text:"A new collection",preset:"display",size:66,align:"left",color:"#171512"}),
    blk("stitch",p.x+2,p.y+100,150,0,{color:"#1F5F4E",weight:2}),
    blk("text",p.x+2,p.y+126,480,0,{text:"A sentence about what this is and why it exists.",preset:"body",size:16,align:"left",color:"#4A453D"})
  ]),
  "Hero and three details": p => ([
    blk("photo",p.x,p.y,520,390,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}),
    blk("photo",p.x,p.y+404,164,124,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}),
    blk("photo",p.x+178,p.y+404,164,124,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}),
    blk("photo",p.x+356,p.y+404,164,124,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}),
    blk("text",p.x+552,p.y,300,0,{text:"Title",preset:"display",size:30,align:"left",color:"#171512"}),
    blk("text",p.x+552,p.y+48,300,0,{text:"What this piece is, and the one thing worth knowing about it.",preset:"body",size:14,align:"left",color:"#4A453D"})
  ]),
  "Specimen card": p => ([
    blk("photo",p.x,p.y,360,360,{src:null,natW:1,natH:1,fit:"cover",frame:"mat",radius:0,caption:""}),
    blk("spec",p.x+392,p.y,300,0,{title:"Specification",rows:[["Body",""],["Lining",""],["Hardware",""],["Finished",""]]}),
    blk("swatch",p.x+392,p.y+230,145,145,{color:"#8A6034",label:"Leather",spec:""}),
    blk("swatch",p.x+547,p.y+230,145,145,{color:"#2E2A26",label:"Thread",spec:""})
  ]),
  "Contact sheet": p => {
    const out = [];
    for (let i=0;i<6;i++) out.push(blk("photo",p.x+(i%3)*198,p.y+Math.floor(i/3)*160,182,144,
      {src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}));
    return out;
  }
};
function kindMenu(anchor, list, title){
  popup(anchor, `<div class="gl">${esc(title)}</div>` +
    list.map(([k,ic,label])=>`<button data-k2="${k}"><span class="gicon">${ic}</span>${esc(label)}</button>`).join(""),
    e => { const b = e.target.closest("[data-k2]"); if (!b) return; closePop(); insert(b.dataset.k2); });
}

/* ── popup ─────────────────────────────────────────────────── */
function popup(anchor, html, onClick, cls){
  const p = $("#pop"); p.innerHTML = html; p.className = "on" + (cls ? " " + cls : "");
  const r = anchor.getBoundingClientRect();
  p.style.left = Math.max(8, Math.min(r.left, innerWidth - p.offsetWidth - 12)) + "px";
  p.style.top = (r.bottom + 6) + "px";
  p.onclick = e => onClick && onClick(e);
}
function closePop(){ $("#pop").classList.remove("on"); }
addEventListener("pointerdown", e => {
  if (!e.target.closest("#pop") && !e.target.closest("#tools") && !e.target.closest("#b-help")) closePop();
}, true);

/* ── row editors ───────────────────────────────────────────── */
async function specEditor(b){
  const v = await askArea("Specification rows",
    "One row per line, written as  label | value", (b.rows||[]).map(r => r[0]+" | "+r[1]).join("\n"));
  if (v == null) return;
  snap();
  b.rows = v.split("\n").map(l => l.split("|")).filter(p => (p[0]||"").trim())
    .map(p => [(p[0]||"").trim(), (p[1]||"").trim()]);
  b.h = 0; dirty(); drawBlocks(); drawSel();
}
async function listEditor(b){
  const v = await askArea("Checklist",
    "One item per line. Start a line with x to tick it.",
    (b.items||[]).map(i => (i[0] ? "x " : "") + i[1]).join("\n"));
  if (v == null) return;
  snap();
  b.items = v.split("\n").filter(l => l.trim()).map(l => {
    const on = /^x\s+/i.test(l);
    return [on ? 1 : 0, l.replace(/^x\s+/i,"").trim()];
  });
  dirty(); drawBlocks(); drawSel();
}

async function trackRows(b){
  const v = await askArea("Habit rows", "One habit per line.", (b.rows||[]).join("\n"));
  if (v == null) return;
  snap(); b.rows = v.split("\n").map(x => x.trim()).filter(Boolean);
  if (!b.rows.length) b.rows = ["Habit"];
  dirty(); drawBlocks(); drawSel();
}
function stickerSwap(b){
  const anchor = $("#t-stick") || $("#tools");
  stickerMenu(anchor);
  const p = $("#pop");
  p.onclick = e => {
    const c = e.target.closest("[data-cat]");
    if (c){ SK_CAT = c.dataset.cat; stickerSwap(b); return; }
    const s2 = e.target.closest("[data-sk]");
    if (s2){ snap(); b.key = s2.dataset.sk; dirty(); drawBlocks(); drawTools(); closePop(); }
  };
}

