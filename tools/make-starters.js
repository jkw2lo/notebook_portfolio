#!/usr/bin/env node
/* Writes starters/*.json — notebooks to import and build on.
 *
 * A blank page is a poor invitation. Each of these is a real spread
 * with the pieces already placed and empty frames to drop photographs
 * into: open one, replace the words, and it is yours.
 *
 *   node tools/make-starters.js
 */
const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "..", "starters");

let n = 0;
const id = () => "s" + (n++).toString(36).padStart(3, "0");
const B = (t, x, y, w, h, extra) => Object.assign({id: id(), t, x, y, w, h, rot: 0}, extra || {});
const text = (x, y, w, role, s, extra) => B("text", x, y, w, 0, Object.assign({text: s, role, align: "left"}, extra));
const photo = (x, y, w, h, extra) => B("photo", x, y, w, h,
  Object.assign({src: null, natW: 4, natH: 3, fit: "cover", frame: "none", radius: 2, caption: ""}, extra));

const page = (name, paper, blocks, extra) =>
  Object.assign({id: id(), name, size: "land", paper, sten: null, blocks}, extra || {});
const cover = (name, c, blocks) => page(name, "plain", blocks || [], {kind: "cover", cover: c});

const notebook = (title, kit, sections, extra) => Object.assign({
  title, version: 3, kit,
  bind: "spread", gutter: 56, spine: "stitch", gutterShade: true, nums: true, anim: true,
  rulers: false, stenOn: true, stenSnap: true, stencils: [], readonly: false, sections
}, extra || {});

/* ── 1. a travel journal ─────────────────────────────────────── */
const travel = notebook("Travel journal", "Postcard", [
  {id: id(), name: "The trip", color: "#8A4326", pages: [
    cover("Cover", {material: "kraft", color: "#B9885A", style: "label",
      foil: "#D9C08A", title: "Somewhere", sub: "a fortnight"}),
    page("Getting there", "aged", [
      B("date", 92, 60, 210, 74, {fmt: "long", style: "box", font: "type", size: 17, color: "#8A4326", rot: -2}),
      text(92, 168, 460, "title", "Getting there"),
      text(92, 236, 460, "body", "Two trains and a long wait. Write what the light was like before you forget it."),
      B("sticker", 92, 360, 420, 52, {key: "border/rule", rot: 0}),
      B("ticket", 92, 440, 320, 96, {stub: "A1", t1: "Where from", t2: "and how", rot: -2}),
      B("sticker", 460, 420, 96, 96, {key: "travel/plane", die: true, rot: -12}),
      B("scrap", 700, 120, 380, 280, {color: "#D9C7A8", rot: -3}),
      photo(724, 146, 332, 228, {frame: "torn", rot: 2}),
      B("tape", 800, 104, 160, 34, {color: "#C3CEE0", pat: "stripe", ink: "#6B7E99", rot: -7}),
      B("note", 740, 440, 300, 130, {text: "The thing nobody warns you about.", color: "#FBE79B", size: 17, rot: 2})
    ]),
    page("What I kept", "kraft", [
      text(92, 70, 460, "kicker", "What I kept"),
      B("sticker", 92, 120, 420, 52, {key: "border/vine", rot: 0}),
      B("stamp", 92, 200, 130, 150, {src: null, color: "#8FA9B8", val: "5", cap: "post", rot: -5}),
      B("tag", 260, 200, 120, 190, {text: "ticket stub", color: "#E3D6BB", size: 15, rot: 4}),
      B("env", 430, 200, 260, 168, {color: "#E8DCC4", text: "receipts", rot: -2}),
      B("post", 730, 200, 340, 220, {src: null, rot: 2}),
      B("sticker", 140, 470, 110, 110, {key: "place/torii", die: true, rot: 8}),
      B("sticker", 300, 470, 110, 110, {key: "food/ramen", die: true, rot: -6}),
      B("sticker", 460, 470, 110, 110, {key: "travel/compass", die: true, rot: 5}),
      text(92, 620, 500, "caption", "Stick the paper things down before they go soft in a pocket.")
    ])
  ]}
]);

/* ── 2. daily field notes ────────────────────────────────────── */
const field = notebook("Field notes", "Ledger", [
  {id: id(), name: "Daily", color: "#6B6320", pages: [
    page("A day", "graph", [
      B("date", 80, 56, 210, 74, {fmt: "iso", style: "strip", font: "courier", size: 18, color: "#3F3A32", rot: 0}),
      B("mood", 330, 66, 230, 40, {kind: "weather", pick: -1, title: "", color: "#3F3A32"}),
      B("time", 80, 160, 84, 560, {from: 7, to: 20, color: "#8A8175"}),
      text(196, 160, 520, "body", "Beside the hours: what actually happened, not what was planned."),
      B("stitch", 196, 700, 520, 0, {color: "#8A8175", weight: 1.5}),
      B("track", 760, 160, 420, 150, {title: "This week",
        rows: ["Draft", "Cut", "Stitch"], cols: 14, on: [], color: "#3F5A46"}),
      B("check", 760, 340, 420, 150, {items: [[0, "First thing"], [0, "Then"], [0, "If there is time"]], size: 15}),
      B("spec", 760, 520, 420, 0, {title: "Measured", rows: [["", ""], ["", ""], ["", ""]]}),
      text(196, 716, 520, "label", "carried over")
    ]),
    page("Looking at", "dot", [
      text(80, 60, 520, "title", "Looking at"),
      B("shape", 80, 130, 520, 400, {kind: "rect", color: "#FFFFFF", radius: 2, fill: "none",
        stroke: "#B4AE9E", strokeW: 2, dash: "dashed"}),
      text(80, 552, 520, "caption", "Draw here — press P for the pen."),
      photo(660, 130, 520, 390, {frame: "mat"}),
      text(660, 552, 520, "subtitle", "and what it actually looked like"),
      B("quote", 80, 660, 1100, 64, {text: "Measure twice.", by: "", color: "#4A453D"})
    ])
  ]}
]);

/* ── 3. a portfolio ──────────────────────────────────────────── */
const port = notebook("Portfolio", "Plate", [
  {id: id(), name: "Work", color: "#1F5F4E", pages: [
    cover("Cover", {material: "cloth", color: "#2E3A52", style: "foil",
      foil: "#D9C08A", title: "Selected work", sub: "2026"}),
    page("Opening", "plain", [
      text(110, 200, 700, "header", "Selected work"),
      B("stitch", 112, 320, 180, 0, {color: "#1F5F4E", weight: 2}),
      text(112, 350, 520, "subtitle", "A sentence about what this is and why it exists."),
      text(112, 430, 520, "label", "and who made it"),
      photo(760, 150, 400, 500, {natW: 4, natH: 5, frame: "mat"})
    ]),
    page("One piece", "plain", [
      text(70, 60, 460, "title", "The piece"),
      photo(70, 140, 520, 390, {frame: "none"}),
      photo(620, 140, 250, 190),
      photo(620, 350, 250, 180),
      B("spec", 910, 140, 300, 0, {title: "Specification",
        rows: [["Body", ""], ["Lining", ""], ["Hardware", ""], ["Finished", ""]]}),
      text(70, 556, 520, "caption", "What it is, and the one thing worth knowing about it."),
      B("swatch", 620, 560, 145, 145, {color: "#8A6034", label: "Leather", spec: ""}),
      B("swatch", 780, 560, 145, 145, {color: "#2E2A26", label: "Thread", spec: ""})
    ])
  ]}
]);

fs.mkdirSync(OUT, {recursive: true});
for (const [file, nb] of [["travel-journal", travel], ["field-notes", field], ["portfolio", port]]) {
  const p = path.join(OUT, file + ".json");
  fs.writeFileSync(p, JSON.stringify(nb, null, 1) + "\n");
  const pages = nb.sections.reduce((a, s) => a + s.pages.length, 0);
  const blocks = nb.sections.reduce((a, s) => a + s.pages.reduce((b, q) => b + q.blocks.length, 0), 0);
  console.log(`  ${file.padEnd(16)} ${pages} pages, ${blocks} pieces, ${(fs.statSync(p).size/1024).toFixed(1)} KB`);
}
