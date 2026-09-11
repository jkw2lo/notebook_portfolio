#!/usr/bin/env node
/* Notebook Portfolio — assemble src/ into the one page that ships.
 *
 * The published page has to be a SINGLE file: it saves itself by
 * rewriting its own source, so there is nothing to fetch alongside it.
 * The source is split for reading; this puts it back together.
 *
 *   node tools/build.js              # writes notebook-portfolio.html
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
const OUT = path.join(ROOT, "notebook-portfolio.html");

const read = p => fs.readFileSync(path.join(SRC, p), "utf8");
const order = JSON.parse(read("order.json"));

const js = order.map(n => read(path.join("js", n))).join("");

/* The seed block is where a save writes the notebook. It ships EMPTY:
   this repo holds the tool, the published artifact holds the journal. */
const seed = '<script id="seed" type="application/json">null</' + 'script>\n\n';

const page = read("head.html")
  + "<style>" + read("styles.css") + "</style>"
  + read("markup.html")
  + seed
  + "<script>\n" + js + "</" + "script>"
  + read("tail.html");

if (process.argv.includes("--check")) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (have === page) { console.log("notebook-portfolio.html is up to date."); process.exit(0); }
  console.log("notebook-portfolio.html is STALE — run: node tools/build.js");
  console.log(`  built ${page.length} bytes, on disk ${have.length}`);
  process.exit(1);
}

fs.writeFileSync(OUT, page);
console.log(`Built notebook-portfolio.html — ${(page.length/1024).toFixed(1)} KB` +
  ` from ${order.length} scripts, ${read("styles.css").length.toLocaleString()} bytes of CSS.`);
