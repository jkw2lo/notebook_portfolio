#!/usr/bin/env node
/* Notebook Portfolio — assemble src/ into the one page that ships.
 *
 * The published page has to be a SINGLE file: it saves itself by
 * rewriting its own source, so there is nothing to fetch alongside it.
 * The source is split for reading; this puts it back together.
 *
 *   node tools/build.js              # writes index.html
 *   node tools/build.js --check      # builds and diffs, changes nothing
 *
 * Load order lives in src/order.json and nowhere else. Every file
 * shares one global scope, so at load time a file may only touch what
 * an earlier one has already defined — calls happen later and may go
 * anywhere.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
/* Two outputs from one source, because the two places this runs want
   different things:
     index.html        a COMPLETE document — GitHub Pages, or a folder
     artifact/page.html the same page as a FRAGMENT, because the artifact
                       host wraps it in its own <head> at publish time
   Publishing the complete document would give it two heads; serving the
   fragment gives it none, which is what broke the standalone export. */
const OUT = path.join(ROOT, "index.html");
const FRAG = path.join(ROOT, "artifact", "page.html");

const read = p => fs.readFileSync(path.join(SRC, p), "utf8");
const order = JSON.parse(read("order.json"));

const js = order.map(n => read(path.join("js", n))).join("");

/* The seed block is where a save writes the notebook. It ships EMPTY:
   this repo holds the tool, the published artifact holds the journal. */
const seed = '<script id="seed" type="application/json">null</' + 'script>\n\n';

const body = read("head.html")
  + "<style>" + read("styles.css") + "</style>"
  + read("markup.html")
  + seed
  + "<script>\n" + js + "</" + "script>"
  + read("tail.html");

/* What the artifact host supplies for itself, written out here so the
   hosted copy looks the same — with one change: `light dark`, so the
   standalone follows the reader's theme the way the artifact does. */
const HEAD = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="A junk-journal notebook you build on facing pages.">
<style>:root{color-scheme:light dark}body{margin:0;padding:0;font:14px -apple-system,\
BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}\
[hidden]:not([hidden=until-found]){display:none!important}</style>
</head>
<body>
`;
const page = HEAD + body + "\n</body></html>\n";

if (process.argv.includes("--check")) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  const hf = fs.existsSync(FRAG) ? fs.readFileSync(FRAG, "utf8") : "";
  if (have === page && hf === body) { console.log("index.html and artifact/page.html are up to date."); process.exit(0); }
  console.log("index.html is STALE — run: node tools/build.js");
  console.log(`  built ${page.length} bytes, on disk ${have.length}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(FRAG), {recursive: true});
fs.writeFileSync(FRAG, body);
fs.writeFileSync(OUT, page);
console.log(`Built index.html (${(page.length/1024).toFixed(1)} KB) and ` +
  `artifact/page.html (${(body.length/1024).toFixed(1)} KB)`);
console.log(`  ${order.length} scripts, ${read("styles.css").length.toLocaleString()} bytes of CSS.`);
if (0) console.log(`Built index.html — ${(page.length/1024).toFixed(1)} KB` +
  ` from ${order.length} scripts, ${read("styles.css").length.toLocaleString()} bytes of CSS.`);
