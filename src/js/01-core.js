"use strict";
/* ════════════════════════════════════════════════════════════
   A notebook of sections; a section of pages; a page of things
   you put exactly where you want them. Nothing composes for you.
   ════════════════════════════════════════════════════════════ */

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const uid = () => "b" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const rad = d => d*Math.PI/180;
function hash(s){ let h = 2166136261; for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619); } return h>>>0; }
function rng(seed){ let s = seed || 1; return () => (s = (s*1664525 + 1013904223) >>> 0) / 4294967296; }

const SECT_COLORS = ["#1F5F4E","#8A4326","#3A4E8C","#7A2E4E","#6B6320","#2E6A7A"];
const NOTE_COLORS = ["#FBE79B","#C9E8B6","#F7C6C0","#BFD9F2","#E6D3F0","#F4E2C8"];
const SCRAP_COLORS = ["#E8DCC4","#D9C7A8","#C9D6C2","#E3CFC6","#CFD6E0","#EFE6D2","#B9A98C"];
const INK_COLORS = ["#1E1B16","#2C4A7C","#8A2B2B","#1F5F4E","#7A4E86","#B06A1F"];
const RIBBON_COLORS = ["#9E5E6A","#6E8B6E","#8E7BA6","#B08A4E","#5E7A96"];
const PAGE_SIZES = {land:[1280,800], square:[1040,1040], port:[820,1160]};

/* Paper is drawn, not photographed — so it survives any resolution
   and adds nothing to what has to be published. */
const PAPERS = {
  plain:  {label:"Plain",   bg:"#FAF7F1", css:""},
  ruled:  {label:"Ruled",   bg:"#FCFAF4", css:
    "background-image:repeating-linear-gradient(180deg,transparent 0 31px,#C3D3DE 31px 32px)," +
    "linear-gradient(90deg,transparent 0 74px,#E0A9A2 74px 76px,transparent 76px);"},
  dot:    {label:"Dot grid",bg:"#FBF8F2", css:
    "background-image:radial-gradient(circle at 1px 1px,#BFB6A4 1.3px,transparent 0);" +
    "background-size:24px 24px;"},
  graph:  {label:"Graph",   bg:"#FAF8F3", css:
    "background-image:repeating-linear-gradient(0deg,#D7E2DA 0 1px,transparent 1px 20px)," +
    "repeating-linear-gradient(90deg,#D7E2DA 0 1px,transparent 1px 20px)," +
    "repeating-linear-gradient(0deg,#B9CDC0 0 1px,transparent 1px 100px)," +
    "repeating-linear-gradient(90deg,#B9CDC0 0 1px,transparent 1px 100px);"},
  ledger: {label:"Ledger",  bg:"#F6F3E4", css:
    "background-image:repeating-linear-gradient(180deg,rgba(150,175,150,.22) 0 26px,transparent 26px 52px)," +
    "repeating-linear-gradient(180deg,transparent 0 25px,#A9BCA9 25px 26px);"},
  kraft:  {label:"Kraft",   bg:"#C9A97C", css:
    "background-image:radial-gradient(ellipse at 22% 18%,rgba(255,246,222,.34),transparent 58%)," +
    "radial-gradient(ellipse at 78% 82%,rgba(96,66,32,.24),transparent 62%);"},
  aged:   {label:"Aged",    bg:"#EFE3CB", css:
    "background-image:radial-gradient(ellipse at 12% 16%,rgba(150,110,55,.24),transparent 42%)," +
    "radial-gradient(ellipse at 88% 26%,rgba(140,100,50,.19),transparent 38%)," +
    "radial-gradient(ellipse at 72% 88%,rgba(120,85,40,.22),transparent 46%)," +
    "radial-gradient(ellipse at 30% 72%,rgba(160,120,60,.15),transparent 40%);"},
  music:  {label:"Music",   bg:"#F7F2E6", css:
    "background-image:repeating-linear-gradient(180deg,#8C8674 0 1px,transparent 1px 9px," +
    "#8C8674 9px 10px,transparent 10px 18px,#8C8674 18px 19px,transparent 19px 27px," +
    "#8C8674 27px 28px,transparent 28px 36px,#8C8674 36px 37px,transparent 37px 78px);"}
};

