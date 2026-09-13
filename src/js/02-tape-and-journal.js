/* ═══════════════════════════════════════════════════════════════
   PART 1 — stickers, tape patterns, journal blocks, stamps.
   Spliced into notebook-portfolio.html by build.py.
   ═══════════════════════════════════════════════════════════════ */


/* ── TAPE AND RIBBON ─────────────────────────────────────────
   Patterns are CSS gradients sized in PIXELS, so pulling a
   length of tape out reveals more repeats instead of stretching
   the design. The torn ends are a fixed-size mask at each end,
   so they keep their bite at any length.                      */
/* Percent-encoded whole, and quoted with APOSTROPHES in the CSS: a
   double quote inside url() closes the style="" attribute it is
   written into, and everything after it — colour, pattern — is lost. */
const SVG_URI = svg => "data:image/svg+xml," + encodeURIComponent(svg);
const RIP_SVG = d => `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="40">` +
  `<path d="${d}" fill="#000"/></svg>`;
const RIP_L = SVG_URI(RIP_SVG("M12 0 4 3 9 8 2 12 8 18 3 23 9 28 4 33 10 37 12 40Z"));
const RIP_R = SVG_URI(RIP_SVG("M0 0 8 3 3 8 10 12 4 18 9 23 3 28 8 33 2 37 0 40Z"));
function ripCSS(on){
  if (!on) return "";
  return `-webkit-mask-image:url('${RIP_L}'),url('${RIP_R}'),linear-gradient(#000,#000);
    -webkit-mask-size:12px 40px,12px 40px,calc(100% - 22px) 100%;
    -webkit-mask-position:left top,right top,11px 0;
    -webkit-mask-repeat:repeat-y,repeat-y,no-repeat;
    mask-image:url('${RIP_L}'),url('${RIP_R}'),linear-gradient(#000,#000);
    mask-size:12px 40px,12px 40px,calc(100% - 22px) 100%;
    mask-position:left top,right top,11px 0;
    mask-repeat:repeat-y,repeat-y,no-repeat;`;
}
const PATS = {
  solid:  ["Solid",   () => ""],
  stripe: ["Stripes", c => `background-image:repeating-linear-gradient(60deg,${c} 0 9px,transparent 9px 19px);`],
  dot:    ["Dots",    c => `background-image:radial-gradient(circle at 7px 7px,${c} 3.2px,transparent 0);background-size:16px 16px;`],
  check:  ["Gingham", c => `background-image:repeating-linear-gradient(90deg,${c} 0 9px,transparent 9px 18px),repeating-linear-gradient(0deg,${c} 0 9px,transparent 9px 18px);`],
  grid:   ["Grid",    c => `background-image:repeating-linear-gradient(90deg,${c} 0 1.6px,transparent 1.6px 14px),repeating-linear-gradient(0deg,${c} 0 1.6px,transparent 1.6px 14px);`],
  chev:   ["Chevron", c => `background-image:repeating-linear-gradient(135deg,${c} 0 6px,transparent 6px 12px),repeating-linear-gradient(45deg,${c} 0 6px,transparent 6px 12px);background-size:24px 24px;`],
  dash:   ["Dashes",  c => `background-image:repeating-linear-gradient(90deg,${c} 0 13px,transparent 13px 24px);background-size:24px 7px;background-position:0 50%;background-repeat:repeat-x;`],
  wave:   ["Scallop", c => `background-image:radial-gradient(circle at 10px 14px,${c} 8px,transparent 0);background-size:20px 20px;`],
  star:   ["Stars",   c => `background-image:radial-gradient(circle at 6px 6px,${c} 2.6px,transparent 0),radial-gradient(circle at 18px 16px,${c} 1.8px,transparent 0);background-size:24px 22px;`],
  heart:  ["Hearts",  c => `background-image:radial-gradient(circle at 7px 9px,${c} 4px,transparent 0),radial-gradient(circle at 13px 9px,${c} 4px,transparent 0);background-size:22px 20px;`],
  floral: ["Floral",  c => `background-image:radial-gradient(circle at 11px 6px,${c} 3px,transparent 0),radial-gradient(circle at 6px 14px,${c} 3px,transparent 0),radial-gradient(circle at 16px 14px,${c} 3px,transparent 0);background-size:22px 22px;`],
  plaid:  ["Plaid",   c => `background-image:repeating-linear-gradient(90deg,${c} 0 5px,transparent 5px 11px,${c} 11px 13px,transparent 13px 30px),repeating-linear-gradient(0deg,${c} 0 5px,transparent 5px 11px,${c} 11px 13px,transparent 13px 30px);`]
};
const PAT_INK = "rgba(0,0,0,.22)";
function tapeCSS(b, base){
  const p = PATS[b.pat || "solid"];
  return `background-color:${base};${p ? p[1](b.ink || PAT_INK) : ""}${ripCSS(b.rip !== false)}`;
}

/* ── JOURNAL BLOCKS ──────────────────────────────────────────
   Borrowed from the daily-planner tradition: a time column you
   write beside, a month you can circle a day on, a habit grid,
   and a quote band along the foot of the page.               */
const MOODS = ["☺","☹","◠","✦","zZ","♥"];
const WX = ["☀","☁","☂","❄","☾","☼"];

function timeHTML(b){
  const from = b.from == null ? 6 : b.from, to = b.to == null ? 22 : b.to;
  const n = Math.max(1, to - from), rows = [];
  for (let i = 0; i <= n; i++){
    const top = (i / n * 100).toFixed(3);
    const hr = from + i;
    rows.push(`<div class="tr" style="top:${top}%">
      <span class="hn">${String(hr % 24).padStart(2,"0")}</span><i></i></div>`);
    if (i < n) rows.push(`<div class="tr half" style="top:${((i+.5)/n*100).toFixed(3)}%"><i></i></div>`);
  }
  return `<div class="b-time" style="position:absolute;inset:0;font-size:${b.size||10}px;color:${esc(b.color||"#8A8175")}">${rows.join("")}</div>`;
}
function monthHTML(b){
  const d = new Date(), y = b.y || d.getFullYear(), m = b.m == null ? d.getMonth() : b.m;
  const first = new Date(y, m, 1), days = new Date(y, m+1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;            /* weeks start Monday */
  const on = new Set(b.on || []);
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(`<i></i>`);
  for (let dd = 1; dd <= days; dd++)
    cells.push(`<i class="d ${on.has(dd)?"on":""}" data-day="${dd}">${dd}</i>`);
  return `<div class="b-month" style="position:absolute;inset:0;font-size:${b.size||9}px;color:${esc(b.color||"#2B2720")}">
    <div class="mh">${first.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</div>
    <div class="mg">${["M","T","W","T","F","S","S"].map(w=>`<i class="w">${w}</i>`).join("")}${cells.join("")}</div></div>`;
}
function trackHTML(b){
  const rows = b.rows || ["Habit"], cols = b.cols || 14, on = b.on || [];
  const set = new Set(on.map(p => p[0] + ":" + p[1]));
  return `<div class="b-track" style="position:absolute;inset:0;font-size:${b.size||9}px;color:${esc(b.color||"#2B2720")}">
    ${b.title ? `<div class="th">${esc(b.title)}</div>` : ""}
    ${rows.map((r,ri) => `<div class="tl"><span class="nm">${esc(r)}</span>
      <span class="cells">${Array.from({length:cols},(_,ci) =>
        `<i class="${set.has(ri+":"+ci)?"on":""}" data-cell="${ri},${ci}"></i>`).join("")}</span></div>`).join("")}</div>`;
}
function moodHTML(b){
  const set = b.kind === "weather" ? WX : MOODS;
  return `<div class="b-mood" style="position:absolute;inset:0;font-size:${b.size||20}px;color:${esc(b.color||"#2B2720")}">
    ${b.title ? `<span class="ml">${esc(b.title)}</span>` : ""}
    ${set.map((g,i) => `<i class="${b.pick===i?"on":""}" data-pick="${i}">${g}</i>`).join("")}</div>`;
}
function rateHTML(b){
  const n = b.n || 5;
  return `<div class="b-rate" style="position:absolute;inset:0;font-size:${b.size||22}px;color:${esc(b.color||"#C4903C")}">
    ${Array.from({length:n},(_,i) => `<i class="${i < (b.v||0) ? "on":""}" data-star="${i}">★</i>`).join("")}</div>`;
}
function quoteHTML(b){
  return `<div class="b-quote" style="position:absolute;inset:0;font-size:${b.size||15}px;color:${esc(b.color||"#4A453D")}">
    <span class="q">${esc(b.text||"")}</span>
    ${b.by ? `<span class="by">${esc(b.by)}</span>` : ""}</div>`;
}

/* ── RUBBER STAMPS ───────────────────────────────────────── */
const MARKS = ["DONE","TO DO","IDEA","NOTE","SEEN","DRAFT","URGENT","KEEP"];
function markHTML(b){
  const c = esc(b.color || "#8A2B2B"), fs = b.size || 20;
  /* the rail has always written the SHORT code and this read the long
     one, so every style but "framed" quietly did nothing */
  const cls = {round:"rnd", rnd:"rnd", banner:"ban", ban:"ban",
               burst:"bst", bst:"bst"}[b.style || "box"] || "box";
  const bord = (b.bord == null ? 16 : b.bord) / 100;
  const al = esc(b.align || "center");
  const t = esc(b.text || "DONE").replace(/\n/g, "<br>");
  const sub = (cls === "rnd" && b.sub) ? `<span class="sub">${esc(b.sub)}</span>` : "";
  /* no wrapper and no absolute box: drawBlocks measures the block FROM
     this element, so the stamp can never outgrow its own rectangle */
  return `<div class="b-mark ${cls}" style="color:${c};font-size:${fs}px;--bord:${bord}em;
    text-align:${al}"><span class="t">${t}</span>${sub}</div>`;
}

