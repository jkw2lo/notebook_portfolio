/* ═══════════════════════════════════════════════════════════════
   PART A — type, stickers, doodles, ephemera, dates.
   ═══════════════════════════════════════════════════════════════ */

/* ── FACES ───────────────────────────────────────────────────
   Named so the picker reads like a drawer of type, not a CSS
   stack. Every one carries a real fallback.                   */
const FACES = {
  disp:   ["Newsreader",       '"Newsreader", Georgia, serif'],
  body:   ["Karla",            '"Karla", system-ui, sans-serif'],
  mono:   ["IBM Plex Mono",    '"IBM Plex Mono", ui-monospace, Menlo, monospace'],
  hand:   ["Shantell",         '"Shantell Sans", "Bradley Hand", cursive'],
  type:   ["Typewriter",       '"Special Elite", "Courier New", monospace'],
  fraun:  ["Fraunces",         '"Fraunces", Georgia, serif'],
  instr:  ["Instrument",       '"Instrument Serif", Georgia, serif'],
  corm:   ["Cormorant",        '"Cormorant Garamond", Georgia, serif'],
  bebas:  ["Bebas",            '"Bebas Neue", Impact, sans-serif'],
  black:  ["Archivo Black",    '"Archivo Black", Helvetica, sans-serif'],
  caveat: ["Caveat",           '"Caveat", "Bradley Hand", cursive'],
  amatic: ["Amatic",           '"Amatic SC", "Bradley Hand", cursive'],
  courier:["Courier Prime",    '"Courier Prime", "Courier New", monospace']
};
const faceCSS = k => (FACES[k] || FACES.body)[1];


/* ── STICKERS ────────────────────────────────────────────────
   Drawn on a 0 0 100 100 box. A thick white copy sits behind the
   inked one, which is what gives each its die-cut border.     */
const SK = {
  holiday: {
    heart:    ["Heart",    `<path d="M50 84C20 62 14 44 24 32c10-11 23-6 26 4 3-10 16-15 26-4 10 12 4 30-26 52Z" fill="#E4636B"/>`],
    tree:     ["Tree",     `<path d="M50 12 66 38H34Z" fill="#3F7A4E"/><path d="M50 30 70 60H30Z" fill="#3F7A4E"/><path d="M50 48 76 82H24Z" fill="#3F7A4E"/><rect x="44" y="82" width="12" height="10" fill="#8A6034"/>`],
    snow:     ["Snowflake",`<g stroke="#5E92C4" stroke-width="5" fill="none"><path d="M50 12v76M20 30l60 40M80 30L20 70"/><path d="M50 26l-9-9M50 26l9-9M50 74l-9 9M50 74l9 9"/></g>`],
    pumpkin:  ["Pumpkin",  `<ellipse cx="50" cy="58" rx="34" ry="28" fill="#E08A3C"/><ellipse cx="36" cy="58" rx="13" ry="28" fill="#D97B2C"/><ellipse cx="64" cy="58" rx="13" ry="28" fill="#D97B2C"/><path d="M50 30V16c8-2 12 2 12 6" fill="none" stroke="#4E7A3A" stroke-width="6"/>`],
    cake:     ["Cake",     `<rect x="20" y="50" width="60" height="32" rx="4" fill="#F3D9C0"/><path d="M20 60h60v10H20Z" fill="#E4636B"/><rect x="47" y="30" width="6" height="16" fill="#F0C04A"/><path d="M50 30c4-6-4-8 0-14" fill="none" stroke="#E4914A" stroke-width="4"/>`],
    fire:     ["Fireworks",`<g stroke="#C4478A" stroke-width="5"><path d="M50 50V18M50 50l23-23M50 50h32M50 50l23 23M50 50v32M50 50l-23 23M50 50H18M50 50L27 27"/></g><circle cx="50" cy="50" r="7" fill="#F0C04A"/>`],
    leaf:     ["Leaf",     `<path d="M78 20C40 22 20 42 22 76c34 2 54-18 56-56Z" fill="#C4712C"/><path d="M22 78 74 24" fill="none" stroke="#8A4B1C" stroke-width="4"/>`],
    egg:      ["Egg",      `<ellipse cx="50" cy="54" rx="28" ry="36" fill="#F4E2C8"/><path d="M22 50h56M22 64h56" fill="none" stroke="#7FB0C4" stroke-width="5"/>`],
    gift:     ["Gift",     `<rect x="18" y="42" width="64" height="44" rx="3" fill="#7FA8D4"/><rect x="14" y="30" width="72" height="16" rx="3" fill="#5E88BC"/><rect x="44" y="30" width="12" height="56" fill="#E4636B"/>`]
  },
  effect: {
    sparkle:  ["Sparkle",  `<path d="M50 10c4 26 14 36 40 40-26 4-36 14-40 40-4-26-14-36-40-40 26-4 36-14 40-40Z" fill="#F0C04A"/>`],
    burst:    ["Pop",      `<path d="M50 8 60 30 84 22 76 46 98 56 74 64 82 88 58 80 50 98 42 80 18 88 26 64 2 56 24 46 16 22 40 30Z" fill="#F2A93B"/>`],
    bubble:   ["Speech",   `<path d="M14 20h72v46H50L30 84V66H14Z" fill="#FFFFFF"/><path d="M34 36h32M34 50h22" stroke="#2A2520" stroke-width="5" fill="none"/>`],
    bang:     ["Bang",     `<path d="M50 6 62 34 92 30 72 52 92 74 62 70 50 98 38 70 8 74 28 52 8 30 38 34Z" fill="#E4636B"/><path d="M50 32v24" stroke="#FFF" stroke-width="7"/><circle cx="50" cy="68" r="5" fill="#FFF"/>`],
    swoosh:   ["Motion",   `<g stroke="#6E9CC4" stroke-width="7" fill="none"><path d="M12 34h56M20 52h48M12 70h60"/></g>`],
    dots:     ["Confetti", `<circle cx="24" cy="26" r="7" fill="#E4636B"/><circle cx="62" cy="18" r="6" fill="#F0C04A"/><circle cx="80" cy="46" r="7" fill="#6E9CC4"/><circle cx="38" cy="56" r="6" fill="#7FA85E"/><circle cx="66" cy="76" r="7" fill="#C48ABE"/><circle cx="22" cy="80" r="5" fill="#F0C04A"/>`],
    arrow:    ["Arrow",    `<path d="M14 74C22 34 54 18 84 24" fill="none" stroke="#3F7A4E" stroke-width="8"/><path d="M84 24 66 14M84 24 70 42" fill="none" stroke="#3F7A4E" stroke-width="8"/>`],
    cloud:    ["Cloud",    `<path d="M28 68a16 16 0 0 1 2-32 22 22 0 0 1 42-4 15 15 0 0 1 2 36Z" fill="#DCE6F0"/>`],
    check:    ["Tick",     `<path d="M18 54 40 76 84 24" fill="none" stroke="#3F7A4E" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`]
  },
  place: {
    eiffel:   ["Eiffel",   `<path d="M50 8v18M42 26h16M28 88 50 26l22 62" fill="none" stroke="#6B7280" stroke-width="6"/><path d="M36 62h28M32 74h36M40 46h20" stroke="#6B7280" stroke-width="5"/>`],
    bigben:   ["Big Ben",  `<path d="M50 6 58 22H42Z" fill="#8A6034"/><rect x="36" y="22" width="28" height="20" fill="#C9A97C"/><circle cx="50" cy="32" r="7" fill="#FFF8E4"/><rect x="32" y="42" width="36" height="48" fill="#B08A5E"/><path d="M40 54h20M40 68h20" stroke="#8A6034" stroke-width="4"/>`],
    torii:    ["Torii",    `<path d="M14 26h72M18 38h64" stroke="#C4463C" stroke-width="9" fill="none"/><path d="M32 38v52M68 38v52" stroke="#C4463C" stroke-width="9"/>`],
    fuji:     ["Mountain", `<path d="M12 80 50 24l38 56Z" fill="#7F94B8"/><path d="M36 50 50 30l14 20c-8 5-20 5-28 0Z" fill="#FFFFFF"/>`],
    colosseum:["Colosseum",`<rect x="14" y="34" width="72" height="54" rx="4" fill="#D9C7A8"/><g fill="#A8906C"><rect x="22" y="44" width="12" height="18" rx="6"/><rect x="44" y="44" width="12" height="18" rx="6"/><rect x="66" y="44" width="12" height="18" rx="6"/><rect x="22" y="68" width="12" height="18" rx="6"/><rect x="44" y="68" width="12" height="18" rx="6"/><rect x="66" y="68" width="12" height="18" rx="6"/></g>`],
    pyramid:  ["Pyramid",  `<circle cx="74" cy="24" r="11" fill="#F0C04A"/><path d="M10 84 46 26l36 58Z" fill="#D9B478"/><path d="M46 26 46 84" stroke="#B8965C" stroke-width="5"/>`],
    lighthouse:["Lighthouse",`<path d="M38 88 42 34h16l4 54Z" fill="#F4EDE0"/><path d="M41 46h18M40 60h20M39 74h22" stroke="#C4463C" stroke-width="7"/><rect x="40" y="20" width="20" height="14" rx="3" fill="#6B7280"/>`],
    bridge:   ["Bridge",   `<path d="M8 74h84" stroke="#C4463C" stroke-width="7" fill="none"/><path d="M26 74V26M74 74V26" stroke="#C4463C" stroke-width="7"/><path d="M8 56C26 30 74 30 92 56" fill="none" stroke="#C4463C" stroke-width="6"/>`]
  },
  travel: {
    plane:    ["Aeroplane",`<path d="M50 8c5 0 8 10 8 22v10l32 18v10l-32-8v14l10 9v7l-18-5-18 5v-7l10-9V60L8 68V58l32-18V30c0-12 3-22 10-22Z" fill="#7F9BC4"/>`],
    case:     ["Suitcase", `<rect x="14" y="34" width="72" height="50" rx="6" fill="#8A5A38"/><path d="M38 34V22h24v12" fill="none" stroke="#5E3E24" stroke-width="7"/><path d="M14 54h72" stroke="#5E3E24" stroke-width="6"/>`],
    compass:  ["Compass",  `<circle cx="50" cy="52" r="36" fill="#E8DCC4"/><circle cx="50" cy="52" r="29" fill="none" stroke="#8A7850" stroke-width="3"/><path d="M50 26 60 52 50 78 40 52Z" fill="#C4463C"/><circle cx="50" cy="52" r="5" fill="#3F3A32"/>`],
    pin:      ["Map pin",  `<path d="M50 92C34 68 26 56 26 44a24 24 0 0 1 48 0c0 12-8 24-24 48Z" fill="#C4463C"/><circle cx="50" cy="43" r="10" fill="#FFF6EC"/>`],
    passport: ["Passport", `<rect x="22" y="12" width="56" height="76" rx="5" fill="#2E4A6B"/><circle cx="50" cy="42" r="13" fill="none" stroke="#D9B478" stroke-width="4"/><path d="M37 42h26M50 29v26" stroke="#D9B478" stroke-width="3"/><path d="M36 68h28" stroke="#D9B478" stroke-width="4"/>`],
    camera:   ["Camera",   `<rect x="12" y="30" width="76" height="54" rx="7" fill="#3F3A38"/><path d="M36 30l6-10h16l6 10" fill="#3F3A38"/><circle cx="50" cy="57" r="18" fill="#7F9BC4"/><circle cx="50" cy="57" r="9" fill="#2A3644"/>`],
    globe:    ["Globe",    `<circle cx="50" cy="50" r="36" fill="#7FA8C4"/><path d="M50 14c12 12 12 60 0 72M50 14c-12 12-12 60 0 72M16 40h68M16 62h68" fill="none" stroke="#3F6A8A" stroke-width="4"/>`],
    map:      ["Map",      `<path d="M8 26 34 16v58L8 84Z" fill="#D9C7A8"/><path d="M34 16 66 26v58L34 74Z" fill="#C9B894"/><path d="M66 26 92 16v58L66 84Z" fill="#D9C7A8"/><path d="M20 40c10 6 14 18 28 16s18-14 30-8" fill="none" stroke="#B4463C" stroke-width="3.5" stroke-dasharray="6 5"/>`]
  },
  nature: {
    flower:   ["Flower",   `<g fill="#E4849E"><circle cx="50" cy="26" r="14"/><circle cx="74" cy="44" r="14"/><circle cx="65" cy="72" r="14"/><circle cx="35" cy="72" r="14"/><circle cx="26" cy="44" r="14"/></g><circle cx="50" cy="50" r="12" fill="#F0C04A"/>`],
    sprig:    ["Sprig",    `<path d="M50 92V16" stroke="#4E7A46" stroke-width="5" fill="none"/><g fill="#6E9A5E"><ellipse cx="34" cy="34" rx="14" ry="8" transform="rotate(-30 34 34)"/><ellipse cx="66" cy="46" rx="14" ry="8" transform="rotate(30 66 46)"/><ellipse cx="34" cy="58" rx="14" ry="8" transform="rotate(-30 34 58)"/><ellipse cx="66" cy="72" rx="14" ry="8" transform="rotate(30 66 72)"/></g>`],
    sun:      ["Sun",      `<circle cx="50" cy="50" r="22" fill="#F0B33C"/><g stroke="#F0B33C" stroke-width="7"><path d="M50 8v12M50 80v12M8 50h12M80 50h12M20 20l9 9M71 71l9 9M80 20l-9 9M29 71l-9 9"/></g>`],
    moon:     ["Moon",     `<path d="M62 12a40 40 0 1 0 26 52A34 34 0 0 1 62 12Z" fill="#E8DCC4"/>`],
    rain:     ["Rain",     `<path d="M30 52a15 15 0 0 1 2-30 21 21 0 0 1 40-4 14 14 0 0 1 2 34Z" fill="#C4D2E0"/><g stroke="#6E9CC4" stroke-width="6" stroke-linecap="round"><path d="M34 66l-5 14M52 66l-5 14M70 66l-5 14"/></g>`],
    wave:     ["Wave",     `<g fill="none" stroke="#5E92B8" stroke-width="7" stroke-linecap="round"><path d="M8 38c10-12 22-12 32 0s22 12 32 0 12-8 20-4"/><path d="M8 60c10-12 22-12 32 0s22 12 32 0 12-8 20-4"/></g>`],
    mush:     ["Mushroom", `<path d="M16 52a34 26 0 0 1 68 0Z" fill="#D4544E"/><circle cx="34" cy="42" r="6" fill="#FFF"/><circle cx="62" cy="38" r="7" fill="#FFF"/><path d="M38 52h24v26a12 12 0 0 1-24 0Z" fill="#F4EDE0"/>`],
    bird:     ["Bird",     `<path d="M14 58c14-22 40-26 54-14 6-16 18-12 18-12s-4 12-12 16c4 18-14 34-34 32-14-2-22-12-26-22Z" fill="#7FA8C4"/><circle cx="66" cy="40" r="3.5" fill="#2A2520"/>`]
  },
  desk: {
    pen:      ["Pen",      `<path d="M22 84 30 62 74 18l10 10-44 44Z" fill="#C9A97C"/><path d="M74 18 84 28" stroke="#8A6034" stroke-width="5"/><path d="M22 84 30 62l8 8Z" fill="#2A2520"/>`],
    scissors: ["Scissors", `<g stroke="#7A8088" stroke-width="6" fill="none"><path d="M24 18 66 66M76 18 34 66"/></g><circle cx="28" cy="76" r="11" fill="none" stroke="#7A8088" stroke-width="6"/><circle cx="72" cy="76" r="11" fill="none" stroke="#7A8088" stroke-width="6"/>`],
    tapeRoll: ["Tape roll",`<circle cx="50" cy="50" r="36" fill="#E4C3BC"/><circle cx="50" cy="50" r="15" fill="#FAF7F1"/><path d="M84 56 96 70l-18 6Z" fill="#E4C3BC"/>`],
    clip:     ["Paper clip",`<path d="M64 22v46a18 18 0 0 1-36 0V30a11 11 0 0 1 22 0v36a5 5 0 0 1-10 0V32" fill="none" stroke="#8A9098" stroke-width="7" stroke-linecap="round"/>`],
    pin:      ["Push pin", `<path d="M38 14h24l-4 24 16 14H26l16-14Z" fill="#C4463C"/><path d="M50 52v34" stroke="#7A8088" stroke-width="5"/>`],
    book:     ["Book",     `<path d="M14 22h30a8 8 0 0 1 6 4 8 8 0 0 1 6-4h30v56H56a8 8 0 0 0-6 4 8 8 0 0 0-6-4H14Z" fill="#C9A97C"/><path d="M50 26v56" stroke="#8A6034" stroke-width="4"/>`],
    key:      ["Key",      `<circle cx="32" cy="38" r="18" fill="none" stroke="#C4A04E" stroke-width="8"/><path d="M44 50 84 90M66 72l10-10M76 82l10-10" stroke="#C4A04E" stroke-width="8" fill="none"/>`],
    mug:      ["Mug",      `<path d="M20 30h48v40a14 14 0 0 1-14 14H34a14 14 0 0 1-14-14Z" fill="#FFFFFF"/><path d="M68 40h10a10 10 0 0 1 0 20H68" fill="none" stroke="#2A2520" stroke-width="5"/><path d="M34 18c4-6-4-8 0-12M50 18c4-6-4-8 0-12" fill="none" stroke="#A89C88" stroke-width="4"/>`]
  },
  food: {
    coffee:   ["Coffee",   `<path d="M20 40h52v30a18 18 0 0 1-18 18H38a18 18 0 0 1-18-18Z" fill="#FFFFFF"/><path d="M72 48h10a10 10 0 0 1 0 20h-10" fill="none" stroke="#2A2520" stroke-width="5"/><path d="M34 28c4-6-4-8 0-14M50 28c4-6-4-8 0-14" fill="none" stroke="#A89C88" stroke-width="4"/>`],
    croissant:["Croissant",`<path d="M14 62c10-30 62-30 72 0-8-10-20-4-24 6-8-10-16-10-24 0-4-10-16-16-24-6Z" fill="#E0A84E"/>`],
    icecream: ["Ice cream",`<path d="M34 50h32L50 90Z" fill="#E0A84E"/><circle cx="40" cy="42" r="13" fill="#F2A9BE"/><circle cx="60" cy="42" r="13" fill="#F4E2C8"/><circle cx="50" cy="28" r="13" fill="#A8C48A"/>`],
    sushi:    ["Sushi",    `<rect x="18" y="38" width="64" height="34" rx="8" fill="#FFFFFF"/><rect x="40" y="38" width="20" height="34" fill="#3F5A3A"/><ellipse cx="50" cy="38" rx="22" ry="8" fill="#E48A6E"/>`],
    ramen:    ["Ramen",    `<path d="M16 46h68a34 34 0 0 1-68 0Z" fill="#E4E0D4"/><path d="M28 46c4-10 16-10 20 0M50 46c4-12 18-10 22 0" fill="none" stroke="#E0A84E" stroke-width="5"/><circle cx="62" cy="40" r="7" fill="#F2C9A0"/>`],
    donut:    ["Donut",    `<circle cx="50" cy="52" r="34" fill="#E0A84E"/><circle cx="50" cy="52" r="12" fill="#FAF7F1"/><path d="M18 48c8 8 22 2 30 10s24 4 34-6" fill="none" stroke="#F2A9BE" stroke-width="11"/>`],
    boba:     ["Boba",     `<path d="M28 30h44l-6 58H34Z" fill="#E4D0B0"/><rect x="24" y="22" width="52" height="9" rx="4" fill="#D4BC94"/><g fill="#4A3A2A"><circle cx="40" cy="74" r="5"/><circle cx="54" cy="78" r="5"/><circle cx="62" cy="68" r="5"/><circle cx="46" cy="64" r="5"/></g>`],
    apple:    ["Apple",    `<path d="M50 30c-16-10-34 2-32 22 2 22 18 36 32 36s30-14 32-36c2-20-16-32-32-22Z" fill="#D4544E"/><path d="M50 30V16" stroke="#6B4A2A" stroke-width="5"/><path d="M50 20c8-8 16-6 18-2-2 6-10 10-18 2Z" fill="#5E8A4A"/>`],
    bread:    ["Bread",    `<path d="M16 46a18 12 0 0 1 20-14h28a18 12 0 0 1 20 14v30a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8Z" fill="#D9A860"/><path d="M30 34v50M50 32v52M70 34v50" stroke="#B8873E" stroke-width="3.5"/>`]
  }
};
const SK_CATS = {holiday:"Holidays", effect:"Effects", place:"Landmarks",
  travel:"Travel", nature:"Nature", desk:"Desk", food:"Food"};
function skSVG(key, plain){
  const [cat, name] = String(key||"").split("/");
  const e = SK[cat] && SK[cat][name]; if (!e) return "";
  const g = e[1];
  const par = e[2] ? ' preserveAspectRatio="none"' : "";
  return `<svg viewBox="0 0 100 100"${par} style="width:100%;height:100%;display:block;overflow:visible">
    ${plain ? "" : `<g fill="#FFF" stroke="#FFF" stroke-width="13" stroke-linejoin="round" stroke-linecap="round">${g}</g>`}
    <g stroke="#2A2520" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">${g}</g></svg>`;
}
const skName = key => { const [c,n] = String(key||"").split("/"); return (SK[c] && SK[c][n]) ? SK[c][n][0] : key; };

/* ── DOODLES ─────────────────────────────────────────────────
   Not stickers: no fill, no die-cut, and they take the colour of
   the pen you set — so they read as drawn on the page rather
   than stuck to it.                                           */
const DOODLES = {
  star:    ["Star",      `M50 12 61 40 90 42 68 60 75 88 50 72 25 88 32 60 10 42 39 40Z`],
  heart:   ["Heart",     `M50 86C22 64 14 46 26 34c9-9 20-4 24 6 4-10 15-15 24-6 12 12 4 30-24 52Z`],
  arrow:   ["Arrow",     `M12 72C22 34 52 16 86 22M86 22 68 12M86 22 72 40`],
  squig:   ["Underline", `M8 52c12-14 22 14 34 0s22 14 34 0 12 8 16 4`],
  box:     ["Box",       `M12 20h76v60H12ZM12 20l76 60M88 20 12 80`],
  brack:   ["Brackets",  `M30 14c-12 0-14 10-14 36s2 36 14 36M70 14c12 0 14 10 14 36s-2 36-14 36`],
  aster:   ["Asterisk",  `M50 14v72M20 32l60 36M80 32 20 68`],
  tick:    ["Check",     `M14 52 38 78 86 18`],
  cross:   ["Cross",     `M20 20 80 80M80 20 20 80`],
  spiral:  ["Spiral",    `M58 50a8 8 0 1 1-8-8 16 16 0 1 1 16 16 24 24 0 1 1-24-24 32 32 0 1 1-32 32`],
  bolt:    ["Bolt",      `M56 8 26 54h20l-8 38 34-50H52Z`],
  cloudy:  ["Callout",   `M22 62a14 14 0 0 1 2-28 20 20 0 0 1 38-4 13 13 0 0 1 2 32H40l-12 14V62Z`],
  circ:    ["Ring",      `M50 14c22 0 38 16 38 36S72 86 50 86 12 70 12 50 28 14 50 14Z`],
  wave:    ["Wave",      `M8 40c10-10 20 10 30 0s20 10 30 0 14 6 24 2M8 66c10-10 20 10 30 0s20 10 30 0 14 6 24 2`],
  hand:    ["Pointer",   `M40 88V40a7 7 0 0 1 14 0v-8a7 7 0 0 1 14 0v8a7 7 0 0 1 14 0v26c0 12-8 22-20 22Z`],
  frame:   ["Frame",     `M10 18h80v64H10ZM18 26h64v48H18`]
};
function doodleSVG(key, color, w){
  const d = DOODLES[key]; if (!d) return "";
  return `<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block;overflow:visible">
    <path d="${d[0+1]}" fill="none" stroke="${esc(color||"#1E1B16")}" stroke-width="${w||5}"
      stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ── DATE STAMPS ─────────────────────────────────────────────
   Formats and styles are separate: the same day can be a neat
   ISO line in a box or a big numeral over a month.            */
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DATE_FMTS = {
  stamp: ["09 SEP 2026",      d => `${String(d.getDate()).padStart(2,"0")} ${MON[d.getMonth()].toUpperCase()} ${d.getFullYear()}`],
  iso:   ["2026-09-09",       d => d.toISOString().slice(0,10)],
  long:  ["9 September 2026", d => d.toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})],
  short: ["Sep 9",            d => `${MON[d.getMonth()]} ${d.getDate()}`],
  slash: ["09/09/26",         d => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getFullYear()).slice(2)}`],
  full:  ["Wednesday, 9 Sep", d => d.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"short"})],
  week:  ["Week 37",          d => { const t = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
           t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay()||7));
           const y0 = new Date(Date.UTC(t.getUTCFullYear(),0,1));
           return "Week " + Math.ceil((((t-y0)/864e5)+1)/7); }],
  doy:   ["Day 252",          d => "Day " + Math.ceil((d - new Date(d.getFullYear(),0,0)) / 864e5)],
  month: ["SEPTEMBER",        d => d.toLocaleDateString(undefined,{month:"long"}).toUpperCase()]
};
const DATE_STYLES = {plain:"Plain", box:"Framed", round:"Postmark", banner:"Banner",
  burst:"Burst", big:"Big numeral", stack:"Stacked", strip:"Torn strip"};
function dateText(b){
  const d = b.iso ? new Date(b.iso + "T12:00:00") : new Date();
  const f = DATE_FMTS[b.fmt || "stamp"];
  return f ? f[1](d) : (b.text || "");
}
function dateHTML(b){
  const d = b.iso ? new Date(b.iso + "T12:00:00") : new Date();
  const st = b.style || "box", c = esc(b.color || "#8A2B2B"), fs = b.size || 19;
  const t = esc(b.text && b.fmt === "custom" ? b.text : dateText(b));
  const sub = b.sub === false ? "" : esc(b.sub || d.toLocaleDateString(undefined,{weekday:"long"}));
  const face = faceCSS(b.font || "type");
  const base = `position:absolute;inset:0;color:${c};font-size:${fs}px;font-family:${face}`;
  if (st === "big") return `<div class="b-date big" style="${base}">
    <b>${d.getDate()}</b><span>${esc(MON[d.getMonth()].toUpperCase())} ${d.getFullYear()}</span></div>`;
  if (st === "stack") return `<div class="b-date stack" style="${base}">
    <i>${String(d.getDate()).padStart(2,"0")}</i><i>${esc(MON[d.getMonth()].toUpperCase())}</i>
    <i>${d.getFullYear()}</i></div>`;
  if (st === "strip") return `<div class="b-date strip" style="${base}"><span>${t}</span></div>`;
  const inner = `<div><div class="d">${t}</div>${sub ? `<div class="w">${sub}</div>` : ""}</div>`;
  return `<div class="b-date ${esc(st)}" style="${base}">${inner}</div>`;
}

/* ── MORE EPHEMERA ─────────────────────────────────────────── */
function clipHTML(b){
  return `<svg class="b-clip" style="position:absolute;inset:0;overflow:visible" viewBox="0 0 40 100"
    preserveAspectRatio="none"><path d="M28 10v70a10 10 0 0 1-20 0V22a6 6 0 0 1 12 0v54a3 3 0 0 1-6 0V26"
    fill="none" stroke="${esc(b.color||"#8A9098")}" stroke-width="5" stroke-linecap="round"/></svg>`;
}
function sealHTML(b){
  const c = esc(b.color || "#8E2B3E");
  return `<div class="b-seal" style="position:absolute;inset:0;background:${c};
    font-size:${b.size || 18}px">
    <span style="font-family:${faceCSS(b.font||"disp")}">${esc(b.text||"")}</span></div>`;
}
function envHTML(b){
  const c = esc(b.color || "#E8DCC4");
  return `<div class="b-env" style="position:absolute;inset:0;background:${c}">
    <div class="flap" style="border-top-color:${c}"></div>
    <div class="lbl" style="font-family:${faceCSS(b.font||"type")}">${esc(b.text||"")}</div></div>`;
}
function laceHTML(b){
  const c = esc(b.color || "#FBF7EE");
  return `<div class="b-lace" style="position:absolute;inset:0;background:${c}"></div>`;
}
function cardHTML(b){
  return `<div class="b-card" style="position:absolute;inset:0">
    <div class="hd" style="font-family:${faceCSS("mono")}">${esc(b.title||"")}</div>
    <div class="rows">${Array.from({length:b.lines||6},()=>`<i></i>`).join("")}</div></div>`;
}
function postHTML(b){
  return `<div class="b-post" style="position:absolute;inset:0">
    <div class="l">${b.src ? `<img src="${esc(b.src)}" alt="" draggable="false">`
      : `<span class="ph">drop a photo</span>`}</div>
    <div class="r"><div class="stampbox"></div><div class="lines">
      ${Array.from({length:4},()=>`<i></i>`).join("")}</div></div></div>`;
}

