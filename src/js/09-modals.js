/* ════ MODALS ═══════════════════════════════════════════════
   prompt() and confirm() are blocked inside the artifact frame —
   they return null with no error, which is why "+ Section" looked
   dead. Everything that used to ask goes through these instead.
   ═══════════════════════════════════════════════════════════ */
let MODAL_DONE = null;
function closeModal(v){
  $("#scrim").classList.remove("on"); $("#modal").innerHTML = "";
  const d = MODAL_DONE; MODAL_DONE = null; if (d) d(v);
}
function openModal(html, wire){
  return new Promise(done => {
    MODAL_DONE = done;
    $("#modal").innerHTML = html;
    $("#scrim").classList.add("on");
    if (wire) wire($("#modal"));
    const f = $("#modal").querySelector("input,textarea,button.pri");
    if (f){ f.focus(); if (f.select) f.select(); }
  });
}
$("#scrim").addEventListener("pointerdown", e => { if (e.target.id === "scrim") closeModal(null); });

function askText(title, note, value, okLabel){
  return openModal(`<h3>${esc(title)}</h3><div class="mb">
    ${note ? `<p class="note">${esc(note)}</p>` : ""}
    <input class="big" id="mx" value="${esc(value||"")}"></div>
    <div class="mf"><button class="btn" data-x="0">Cancel</button>
    <button class="btn pri" data-x="1">${esc(okLabel||"OK")}</button></div>`,
  m => {
    m.onclick = e => { const b = e.target.closest("[data-x]"); if (b) closeModal(b.dataset.x === "1" ? m.querySelector("#mx").value : null); };
    m.querySelector("#mx").onkeydown = e => {
      if (e.key === "Enter"){ e.preventDefault(); closeModal(e.target.value); }
      if (e.key === "Escape"){ e.preventDefault(); closeModal(null); }
    };
  });
}
function askArea(title, note, value, okLabel){
  return openModal(`<h3>${esc(title)}</h3><div class="mb">
    ${note ? `<p class="note">${esc(note)}</p>` : ""}
    <textarea class="big" id="mx" spellcheck="false">${esc(value||"")}</textarea></div>
    <div class="mf"><button class="btn" data-x="0">Cancel</button>
    <button class="btn pri" data-x="1">${esc(okLabel||"Save")}</button></div>`,
  m => {
    m.onclick = e => { const b = e.target.closest("[data-x]"); if (b) closeModal(b.dataset.x === "1" ? m.querySelector("#mx").value : null); };
    m.querySelector("#mx").onkeydown = e => {
      if (e.key === "Escape"){ e.preventDefault(); closeModal(null); }
      if (e.key === "Enter" && (e.metaKey||e.ctrlKey)){ e.preventDefault(); closeModal(e.target.value); }
    };
  });
}
function askConfirm(title, note, okLabel){
  return openModal(`<h3>${esc(title)}</h3><div class="mb"><p class="note">${esc(note||"")}</p></div>
    <div class="mf"><button class="btn" data-x="0">Cancel</button>
    <button class="btn pri" data-x="1">${esc(okLabel||"Delete")}</button></div>`,
  m => { m.onclick = e => { const b = e.target.closest("[data-x]"); if (b) closeModal(b.dataset.x === "1"); }; })
  .then(v => v === true);
}
function askSection(title, name, color){
  return openModal(`<h3>${esc(title)}</h3><div class="mb">
    <input class="big" id="mx" value="${esc(name||"")}" placeholder="Section name">
    <div class="swrow" id="msw">${SECT_COLORS.map(c =>
      `<button data-c="${c}" style="background:${c}" aria-pressed="${c===color}" aria-label="${c}"></button>`).join("")}</div>
    </div><div class="mf"><button class="btn" data-x="0">Cancel</button>
    <button class="btn pri" data-x="1">${esc(name ? "Rename" : "Add section")}</button></div>`,
  m => {
    let pick = color || SECT_COLORS[0];
    m.querySelector("#msw").onclick = e => {
      const b = e.target.closest("[data-c]"); if (!b) return;
      pick = b.dataset.c;
      m.querySelectorAll("#msw button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.c === pick)));
    };
    m.onclick = e => {
      const b = e.target.closest("[data-x]"); if (!b) return;
      closeModal(b.dataset.x === "1" ? {name:m.querySelector("#mx").value.trim(), color:pick} : null);
    };
    m.querySelector("#mx").onkeydown = e => {
      if (e.key === "Enter"){ e.preventDefault(); closeModal({name:e.target.value.trim(), color:pick}); }
      if (e.key === "Escape"){ e.preventDefault(); closeModal(null); }
    };
  });
}

/* ── torn edges, seeded per block so they never dance ───────── */
function torn(id, amp){
  const r = rng(hash(id)), a = amp || 2.2, pts = [], N = 13;
  const push = (x,y) => pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  for (let i=0;i<=N;i++) push(i/N*100, (r()*a));
  for (let i=1;i<=N;i++) push(100 - (r()*a), i/N*100);
  for (let i=N-1;i>=0;i--) push(i/N*100, 100 - (r()*a));
  for (let i=N-1;i>=1;i--) push(r()*a, i/N*100);
  return `polygon(${pts.join(",")})`;
}

/* ── seed ───────────────────────────────────────────────────── */
function blk(t,x,y,w,h,extra){ return Object.assign({id:uid(), t, x, y, w, h, rot:0}, extra||{}); }
function today(){
  const d = new Date();
  return {iso:d.toISOString().slice(0,10),
    nice:d.toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"}),
    wd:d.toLocaleDateString(undefined,{weekday:"long"}),
    stamp:d.toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()};
}
function seed(){
  const t = today();
  return {
    title:"My journal", version:3, stencils:[], stenOn:true, stenSnap:true, rulers:false,
    bind:"spread", gutter:56, spine:"stitch", gutterShade:true, nums:true, anim:true,
    kit:"Bench",
    sections:[
      {id:uid(), name:"Daily pages", color:SECT_COLORS[4], pages:[
        {id:uid(), name:t.iso, size:"land", paper:"ruled", blocks:[
          blk("date",92,64,210,74,{text:t.stamp, sub:t.wd, size:19, color:"#8A2B2B", rot:-2.4}),
          blk("text",92,168,470,0,{text:"Started the day squaring off the gusset pattern. The taper is still fighting me at the base — the slant measures longer than the width, which I keep forgetting.",preset:"hand",size:21,align:"left",color:"#26221B"}),
          blk("check",92,340,330,150,{items:[[1,"Cut the test gusset"],[0,"Re-draft the taper"],[0,"Order 0.6 thread"]],size:16}),
          blk("scrap",470,330,300,220,{color:SCRAP_COLORS[1], rot:-3}),
          blk("photo",492,350,256,180,{src:null,natW:4,natH:3,fit:"cover",frame:"torn",radius:0,caption:"",rot:2}),
          blk("tag",820,120,120,190,{text:"swatch no. 4", color:"#E3D6BB", rot:4}),
          blk("ticket",810,350,300,96,{t1:"Leather Merchants", t2:"veg-tan · 3.2 mm", stub:"04", rot:-2}),
          blk("note",820,480,280,140,{text:"A fold is never pricked.",color:NOTE_COLORS[0],size:17,rot:2}),
          blk("stitch",92,530,470,0,{color:"#8A6034",weight:2}),
          blk("text",92,548,470,0,{text:"double-click anywhere to write · press P for the pen",preset:"label",size:10,align:"left",color:"#8A8175"})
        ]}
      ]},
      {id:uid(), name:"Spring collection", color:SECT_COLORS[0], pages:[
        {id:uid(), name:"Cover", size:"land", paper:"aged", blocks:[
          blk("text",110,196,700,0,{text:"Spring collection",preset:"display",size:74,align:"left",color:"#171512"}),
          blk("stitch",112,306,180,0,{color:"#1F5F4E",weight:2}),
          blk("text",112,332,520,0,{text:"Six bags drafted at the bench over the winter. Every pattern cut by hand, every seam pricked with a 3.85 mm iron.",preset:"body",size:16,align:"left",color:"#4A453D"}),
          blk("photo",760,150,400,500,{src:null,natW:4,natH:5,fit:"cover",frame:"mat",radius:0,caption:""}),
          blk("tape",880,124,160,34,{color:"#D9CBA8",rot:-6}),
          blk("stamp",120,470,130,150,{src:null,val:"5",cap:"handmade",rot:-4})
        ]},
        {id:uid(), name:"Field satchel", size:"land", paper:"plain", blocks:[
          blk("text",70,60,460,0,{text:"Field satchel",preset:"display",size:44,align:"left",color:"#171512"}),
          blk("photo",70,140,520,390,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}),
          blk("photo",620,140,250,190,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}),
          blk("photo",620,350,250,180,{src:null,natW:4,natH:3,fit:"cover",frame:"none",radius:2,caption:""}),
          blk("spec",910,140,300,0,{title:"Specification",rows:[["Body","3.2 mm veg-tan"],["Gusset","90 → 60 mm"],["Iron","3.85 mm, 8 prong"],["Seam allowance","4 mm"],["Hide","9 sq ft"]]}),
          blk("note",910,400,300,130,{text:"The gusset is cut short along its length — a slanted edge measures longer than its width.",color:NOTE_COLORS[0],size:16,rot:1.5}),
          blk("swatch",70,570,150,150,{color:"#8A6034",label:"Veg-tan",spec:"3.2 mm · natural"}),
          blk("swatch",240,570,150,150,{color:"#2E2A26",label:"Waxed thread",spec:"0.6 mm · brown"}),
          blk("ribbon",430,600,260,26,{color:RIBBON_COLORS[0],rot:-3})
        ]}
      ]}
    ]
  };
}

