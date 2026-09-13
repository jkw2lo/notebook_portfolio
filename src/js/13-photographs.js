/* ════ PHOTOGRAPHS ══════════════════════════════════════════ */
const MAX_EDGE = 1800, Q = 0.82;
let PICK_FOR = null;
async function shrink(file){
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, MAX_EDGE/Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width*k), h = Math.round(bmp.height*k);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  c.getContext("2d").drawImage(bmp, 0, 0, w, h);
  bmp.close && bmp.close();
  return {blob: await new Promise(r => c.toBlob(r,"image/jpeg",Q)), w, h};
}
async function setPhoto(b, file){
  try {
    const {blob,w,h} = await shrink(file);
    if (b.src && b.src.startsWith("blob:")) URL.revokeObjectURL(b.src);
    snap(); b.src = URL.createObjectURL(blob); b.natW = w; b.natH = h;
    BLOBS.set(b.id, blob); idbPut(b.id, blob); dirty(); drawBlocks(); drawSide(); drawTools();
  } catch(_){ toast("That file could not be read as an image."); }
}
async function dropFiles(files, at){
  const imgs = [...files].filter(f => /^image\//.test(f.type));
  if (!imgs.length) return;
  const empties = viewBlocks().filter(b => (b.t === "photo" || b.t === "stamp" || b.t === "post") && !b.src);
  let n = 0, ox = 0;
  for (const f of imgs){
    if (empties.length){ await setPhoto(empties.shift(), f); n++; continue; }
    try {
      const {blob,w,h} = await shrink(f);
      const ww = 320, hh = Math.round(ww*h/w);
      const b = blk("photo", Math.round(at.x-ww/2+ox), Math.round(at.y-hh/2+ox), ww, hh,
        {src:URL.createObjectURL(blob), natW:w, natH:h, fit:"cover", frame:"none", radius:2, caption:""});
      snap(); putBlocks([b], at); BLOBS.set(b.id, blob); idbPut(b.id, blob); ox += 26; n++;
    } catch(_){}
  }
  if (n){ dirty(); drawBlocks(); drawSel(); drawSide(); toast(`${n} photograph${n>1?"s":""} placed.`); }
}
$("#picker").onchange = async e => {
  const f = e.target.files;
  if (PICK_FOR && f.length === 1){ const b = byId(PICK_FOR); if (b) await setPhoto(b, f[0]); }
  else await dropFiles(f, centreOfView());
  PICK_FOR = null; e.target.value = "";
};
$("#canvas").addEventListener("dragover", e => e.preventDefault());
$("#canvas").addEventListener("drop", e => {
  e.preventDefault(); if (RO || PRESENT) return;
  if (e.dataTransfer.files.length) dropFiles(e.dataTransfer.files, toWorld(e.clientX, e.clientY));
});
addEventListener("paste", e => {
  if (RO || PRESENT || e.target.isContentEditable) return;
  const f = [...(e.clipboardData?.items||[])].filter(i => i.type.startsWith("image/"))
    .map(i => i.getAsFile()).filter(Boolean);
  if (f.length){ e.preventDefault(); dropFiles(f, centreOfView()); }
});

