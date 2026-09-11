/* ════ PRESENT ══════════════════════════════════════════════ */
function allPages(){
  const out = [];
  NB.sections.forEach((s,si) => s.pages.forEach((p,pi) => out.push({si,pi})));
  return out;
}
function setPresent(on){
  PRESENT = on;
  if (on) setTool("select");
  document.body.classList.toggle("present", on);
  $("#canvas").classList.toggle("present", on);
  if (on) SEL.clear();
  drawSel(); drawSten(); drawRulers(); drawBlocks(); pinfo(); fitPage(false);
  $("#b-present").textContent = on ? "Exit" : (NB.bind === "spread" ? "▥ Read" : "▶ Present");
}
function pinfo(){
  const all = allPages(), i = all.findIndex(a => a.si===SI && a.pi===PI);
  $("#p-now").textContent = (i+1) + " / " + all.length;
  $("#pbar").classList.toggle("book", NB.bind === "spread");
  $("#ptitle").textContent = sec().name + " — " + page().name;
}
function pgo(d){
  const all = allPages();
  let i = all.findIndex(a => a.si===SI && a.pi===PI);
  /* in a bound book you turn a leaf, which is two pages */
  if (NB.bind === "spread" && !isCover(page()) && all[i] && all[i].si === SI){
    const step = d > 0 ? 2 : -2;
    let j = i + step;
    if (j < 0 || j >= all.length){
      j = d > 0 ? Math.min(i + 1, all.length - 1) : Math.max(i - 1, 0);
      if (j === i) return toast(d>0 ? "The last page." : "The first page.");
    }
    if (PRESENT) flip(d);
    SI = all[j].si; PI = all[j].pi;
    drawSten(); drawBlocks(); drawSide(); pinfo(); fitPage(true);
    return;
  }
  i += d;
  if (i < 0 || i >= all.length) return toast(d>0 ? "The last page." : "The first page.");
  SI = all[i].si; PI = all[i].pi;
  drawSten(); drawBlocks(); drawSide(); pinfo(); fitPage(true);
}
$("#b-present").onclick = () => setPresent(!PRESENT);
$("#p-exit").onclick = () => setPresent(false);
$("#p-next").onclick = () => pgo(1);
$("#p-prev").onclick = () => pgo(-1);
$("#canvas").addEventListener("click", e => {
  if (PRESENT && !e.target.closest("#pbar")) pgo(1);
});

$("#z-in").onclick = () => zstep(1.25);
$("#z-out").onclick = () => zstep(.8);
$("#z-fit").onclick = () => fitPage(true);
function zstep(k){
  const c = $("#canvas").getBoundingClientRect();
  const wx = (c.width/2-W.x)/W.z, wy = (c.height/2-W.y)/W.z;
  W.z = clamp(W.z*k, .08, 4);
  W.x = c.width/2 - wx*W.z; W.y = c.height/2 - wy*W.z;
  camApply();
}
addEventListener("resize", () => { if (PRESENT) fitPage(false); });

