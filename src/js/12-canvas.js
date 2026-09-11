/* ════ CANVAS INTERACTION ═══════════════════════════════════ */
let MODE = null, START = null, ORIG = null, SPACE = false, STROKE = null;
const SNAP_PX = 6;

$("#canvas").addEventListener("pointerdown", e => {
  if (PRESENT) return;
  if (e.target.closest("#hud")) return;
  const cv = $("#canvas");
  cv.setPointerCapture(e.pointerId);
  START = {sx:e.clientX, sy:e.clientY, w:toWorld(e.clientX, e.clientY)};

  if (SPACE || e.button === 1){ MODE = "pan"; ORIG = {...W}; cv.classList.add("pan"); return; }

  if (TOOL !== "select" && !RO){
    MODE = "ink"; STROKE = [[START.w.x, START.w.y]];
    $("#wet").innerHTML = `<path id="wetp" fill="none" stroke="${PEN.color}" stroke-width="${PEN.width}"
      stroke-linecap="round" stroke-linejoin="round" ${TOOL==="marker"?'opacity="0.42"':""}/>`;
    return;
  }

  /* a tick, a ringed day, a filled square — a click on the page
     itself, not a selection */
  const bit = e.target.closest(LIVE_BITS);
  if (bit && !RO){
    const host = e.target.closest(".blk"), b = host && byId(host.dataset.id);
    if (b){
      const d = bit.dataset;
      snap();
      if (d.ck != null && b.items) b.items[+d.ck][0] = b.items[+d.ck][0] ? 0 : 1;
      else if (d.day != null){
        const set = new Set(b.on || []); const v = +d.day;
        set.has(v) ? set.delete(v) : set.add(v); b.on = [...set].sort((x,y)=>x-y);
      } else if (d.cell != null){
        const [r,c] = d.cell.split(",").map(Number);
        const has = (b.on||[]).some(p => p[0]===r && p[1]===c);
        b.on = has ? b.on.filter(p => !(p[0]===r && p[1]===c)) : (b.on||[]).concat([[r,c]]);
      } else if (d.pick != null) b.pick = b.pick === +d.pick ? -1 : +d.pick;
      else if (d.star != null)   b.v = b.v === +d.star + 1 ? +d.star : +d.star + 1;
      dirty(); drawBlocks(); MODE = null; return;
    }
  }

  const handle = e.target.closest("#sel .h");
  const blkEl = e.target.closest(".blk");
  if (handle && !RO){
    MODE = handle.dataset.h === "rot" ? "rot" : "size";
    ORIG = {h:handle.dataset.h, blocks:selArr().map(b=>({...b, ox:oxOf(b.id)})), box:selBox()};
    snap(); return;
  }
  if (blkEl && !RO){
    const id = blkEl.dataset.id;
    if (blkEl.dataset.edit === "1") return;
    if (isLocked(byId(id))){                 /* a locked piece is scenery */
      if (!e.shiftKey){ SEL.clear(); drawSel(); drawTools(); }
      MODE = "marquee"; return;
    }
    if (e.shiftKey){ SEL.has(id) ? SEL.delete(id) : SEL.add(id); drawSel(); drawTools(); MODE = null; return; }
    if (!SEL.has(id)){ SEL = new Set([id]); drawSel(); drawTools(); }
    MODE = "maybe"; ORIG = {blocks:selArr().map(b=>({...b, ox:oxOf(b.id)}))};
    return;
  }
  if (!e.shiftKey && !RO){ SEL.clear(); drawSel(); drawTools(); }
  MODE = RO ? "pan" : "marquee";
  if (MODE === "pan"){ ORIG = {...W}; cv.classList.add("pan"); }
});

$("#canvas").addEventListener("pointermove", e => {
  moveRulerMark(e.clientX, e.clientY);
  if (!MODE) return;
  const dx = e.clientX - START.sx, dy = e.clientY - START.sy;

  if (MODE === "pan"){ W.x = ORIG.x + dx; W.y = ORIG.y + dy; camApply(); return; }

  if (MODE === "ink"){
    const p = toWorld(e.clientX, e.clientY), last = STROKE[STROKE.length-1];
    if (Math.hypot(p.x-last[0], p.y-last[1]) < 2/W.z) return;
    STROKE.push([p.x, p.y]);
    const wp = $("#wetp");
    if (wp) wp.setAttribute("d", inkPath({pts:STROKE}));
    return;
  }

  if (MODE === "maybe"){ if (Math.hypot(dx,dy) < 4) return; MODE = "move"; snap(); }

  if (MODE === "move"){
    const g = snapDelta(dx/W.z, dy/W.z);
    ORIG.blocks.forEach(o => {
      const b = byId(o.id); if (!b) return;
      b.x = Math.round(o.x + g.x); b.y = Math.round(o.y + g.y);
      const el = $(`.blk[data-id="${b.id}"]`);
      if (el){ el.style.left = b.x+"px"; el.style.top = b.y+"px"; }
    });
    drawSel(); drawGuides(g.gx, g.gy); return;
  }

  if (MODE === "size"){
    const h = ORIG.h, th = rad(ORIG.box.rot);
    const lx =  (dx/W.z)*Math.cos(th) + (dy/W.z)*Math.sin(th);
    const ly = -(dx/W.z)*Math.sin(th) + (dy/W.z)*Math.cos(th);
    const west = h.includes("w"), east = h.includes("e");
    const north = h.startsWith("n"), south = h.startsWith("s");
    ORIG.blocks.forEach(o => {
      const b = byId(o.id); if (!b) return;
      let x=o.x, y=o.y, w=o.w, hh=o.h||30;
      if (east) w = Math.max(24, o.w + lx);
      if (west){ w = Math.max(24, o.w - lx); x = o.x + (o.w - w); }
      if (south) hh = Math.max(16, (o.h||30) + ly);
      if (north){ hh = Math.max(16, (o.h||30) - ly); y = o.y + ((o.h||30) - hh); }
      if (e.shiftKey && (o.h||0)){
        const k = o.w/(o.h||30);
        if (east||west) hh = Math.max(16, w/k); else w = Math.max(24, hh*k);
      }
      b.x=Math.round(x); b.y=Math.round(y); b.w=Math.round(w); b.h=Math.round(hh);
      const el = $(`.blk[data-id="${b.id}"]`);
      if (el){ el.style.left=b.x+"px"; el.style.top=b.y+"px";
               el.style.width=b.w+"px"; el.style.height=b.h+"px"; }
    });
    drawSel(); return;
  }

  if (MODE === "rot"){
    const box = ORIG.box, r = $("#canvas").getBoundingClientRect();
    const cx = r.left + W.x + (box.x+box.w/2)*W.z, cy = r.top + W.y + (box.y+box.h/2)*W.z;
    let a = Math.atan2(e.clientY-cy, e.clientX-cx)*180/Math.PI + 90;
    if (e.shiftKey) a = Math.round(a/15)*15;
    ORIG.blocks.forEach(o => {
      const b = byId(o.id); if (!b) return;
      b.rot = Math.round(a*10)/10;
      const el = $(`.blk[data-id="${b.id}"]`); if (el) el.style.transform = `rotate(${b.rot}deg)`;
    });
    drawSel(); return;
  }

  if (MODE === "marquee"){
    let m = $("#marquee");
    if (!m){ m = document.createElement("div"); m.id = "marquee"; $("#world").appendChild(m); }
    const a = START.w, b = toWorld(e.clientX, e.clientY);
    const x = Math.min(a.x,b.x), y = Math.min(a.y,b.y);
    const w = Math.abs(b.x-a.x), hgt = Math.abs(b.y-a.y);
    m.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${hgt}px`;
    SEL = new Set(viewBlocks().filter(q => { if (isLocked(q)) return false; const o = oxOf(q.id);
      return q.x+o < x+w && q.x+o+q.w > x && q.y < y+hgt && q.y+(q.h||30) > y; }).map(q=>q.id));
    drawSel();
  }
});


$("#canvas").addEventListener("pointerup", () => {
  $("#canvas").classList.remove("pan");
  const m = $("#marquee"); if (m) m.remove();
  $("#guides").innerHTML = "";
  if (MODE === "ink"){
    $("#wet").innerHTML = "";
    if (STROKE && STROKE.length > 1){
      const xs = STROKE.map(p=>p[0]), ys = STROKE.map(p=>p[1]);
      const pad = PEN.width + 4;
      const x0 = Math.min(...xs)-pad, y0 = Math.min(...ys)-pad;
      const w = Math.max(...xs)-Math.min(...xs)+pad*2, h = Math.max(...ys)-Math.min(...ys)+pad*2;
      const b = blk("ink", Math.round(x0), Math.round(y0), Math.round(w), Math.round(h), {
        pts: STROKE.map(p => [+(p[0]-x0).toFixed(1), +(p[1]-y0).toFixed(1)]),
        vw: Math.round(w), vh: Math.round(h),
        color: PEN.color, width: PEN.width, kind: PEN.kind
      });
      snap(); putBlocks([b], {x:x0, y:y0}); dirty(); drawBlocks(); drawSide();
    }
    STROKE = null; MODE = null; return;
  }
  if (MODE === "move"){ rehomeBlocks(selArr()); }
  if (MODE === "move" || MODE === "size" || MODE === "rot"){ dirty(); drawBlocks(); drawSel(); drawSide(); }
  if (MODE === "marquee") drawTools();
  MODE = null; ORIG = null;
});
$("#canvas").addEventListener("pointercancel", () => {
  MODE = null; STROKE = null; $("#wet").innerHTML = "";
  $("#canvas").classList.remove("pan");
  const m = $("#marquee"); if (m) m.remove();
});

$("#canvas").addEventListener("dblclick", e => {
  if (PRESENT || RO || TOOL !== "select") return;
  const el = e.target.closest(".blk");
  if (el){
    const b = byId(el.dataset.id); if (!b) return;
    if (b.t === "text" || b.t === "note") return editText(b.id);
    if (b.t === "photo" || b.t === "stamp"){ PICK_FOR = b.id; $("#picker").click(); return; }
    if (b.t === "spec") return specEditor(b);
    if (b.t === "check") return listEditor(b);
    return;
  }
  insert("text", toWorld(e.clientX, e.clientY));   /* click on nothing, start writing */
});

$("#canvas").addEventListener("wheel", e => {
  e.preventDefault();
  const r = $("#canvas").getBoundingClientRect();
  const mx = e.clientX-r.left, my = e.clientY-r.top;
  if (e.ctrlKey || e.metaKey){                     /* a trackpad pinch arrives with ctrlKey */
    const wx = (mx-W.x)/W.z, wy = (my-W.y)/W.z;
    W.z = clamp(W.z * Math.exp(-e.deltaY*0.01), .08, 4);
    W.x = mx - wx*W.z; W.y = my - wy*W.z;
  } else {
    W.x -= e.shiftKey ? e.deltaY : e.deltaX;
    W.y -= e.shiftKey ? 0 : e.deltaY;
  }
  camApply();
}, {passive:false});

/* ── text editing ──────────────────────────────────────────── */
function editText(id){
  const b = byId(id), el = $(`.blk[data-id="${id}"]`);
  if (!b || !el) return;
  const t = el.querySelector(b.t === "note" ? ".b-note" : ".b-text");
  if (!t) return;
  el.dataset.edit = "1";
  t.contentEditable = "true"; t.spellcheck = true; t.focus();
  const r = document.createRange(); r.selectNodeContents(t);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  const finish = () => {
    t.contentEditable = "false"; delete el.dataset.edit;
    const v = t.innerText.replace(/\u00A0/g," ").replace(/\n{3,}/g,"\n\n").trim();
    if (v !== (b.text||"")){ snap(); b.text = v; dirty(); }
    if (b.t === "text") b.h = 0;
    if (!v && b.t === "text"){ const pp = pageOfBlock(b.id).p;
      pp.blocks = pp.blocks.filter(q => q.id !== b.id); SEL.delete(b.id); }
    drawBlocks(); drawSel(); drawTools(); drawSide();
  };
  t.addEventListener("blur", finish, {once:true});
  t.addEventListener("keydown", ev => {
    ev.stopPropagation();
    if (ev.key === "Escape"){ ev.preventDefault(); t.blur(); }
    if (ev.key === "Enter" && (ev.metaKey||ev.ctrlKey)){ ev.preventDefault(); t.blur(); }
  });
}

/* ── keyboard ──────────────────────────────────────────────── */
addEventListener("keydown", e => {
  if ($("#scrim").classList.contains("on")) return;
  const typing = e.target.isContentEditable || /input|textarea|select/i.test(e.target.tagName);
  if (e.key === " " && !typing && !PRESENT){ SPACE = true; $("#canvas").classList.add("spacing"); }
  if (PRESENT){
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " "){ e.preventDefault(); pgo(1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp"){ e.preventDefault(); pgo(-1); }
    if (e.key === "Escape") setPresent(false);
    return;
  }
  if (typing) return;
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === "z"){ e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() === "s"){ e.preventDefault(); save(); return; }
  if (mod && e.key.toLowerCase() === "d"){ e.preventDefault(); if (SEL.size) doAct("dup", selArr()); return; }
  if (mod && e.key.toLowerCase() === "a"){ e.preventDefault();
    SEL = new Set(viewBlocks().filter(b => !isLocked(b)).map(b=>b.id)); drawSel(); drawTools(); return; }
  if (mod && e.key.toLowerCase() === "l"){ e.preventDefault(); if (SEL.size) toggleLock(selArr()); return; }
  if (mod) return;
  if (e.key === "Escape"){ if (TOOL !== "select") setTool("select"); else { SEL.clear(); drawSel(); drawTools(); } return; }
  if ((e.key === "Backspace" || e.key === "Delete") && SEL.size){ e.preventDefault(); doAct("del", selArr()); return; }
  if (e.key.startsWith("Arrow") && SEL.size){
    e.preventDefault(); snap();
    const d = e.shiftKey ? 10 : 1;
    selArr().forEach(b => {
      if (e.key === "ArrowLeft") b.x -= d; if (e.key === "ArrowRight") b.x += d;
      if (e.key === "ArrowUp") b.y -= d;   if (e.key === "ArrowDown") b.y += d;
    });
    dirty(); drawBlocks(); drawSel(); return;
  }
  const k = e.key.toLowerCase();
  if (k === "p") setTool(TOOL === "select" ? "pen" : "select");
  if (k === "t") insert("text");
  if (k === "n") insert("note");
  if (k === "v") setTool("select");
  if (k === "g"){ NB.stenOn = NB.stenOn === false; dirty(); drawSten();
    toast(NB.stenOn === false ? "Stencil hidden." : "Stencil shown."); }
  if (k === "r"){ NB.rulers = !NB.rulers; dirty(); drawRulers(); }
}, false);
addEventListener("keyup", e => {
  if (e.key === " "){ SPACE = false; $("#canvas").classList.remove("spacing"); }
});

