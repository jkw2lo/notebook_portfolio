#!/usr/bin/env node
/* Notebook Portfolio — the standing checks.
 *
 * There is no test suite in the awl-gusset sense: this page has no
 * pure functions to sweep, it has a canvas. What it does have is a
 * short list of mistakes that have ALREADY been made here, each of
 * which broke the page silently. Every check below is one of those.
 *
 *   node tools/check.js        # or: npm run check
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FILE = path.join(__dirname, "..", "notebook-portfolio.html");
const html = fs.readFileSync(FILE, "utf8");

let bad = 0;
const ok   = m => console.log("  ok   " + m);
const fail = m => { bad++; console.log("  FAIL " + m); };

/* ── the page is one document with exactly two scripts ─────── */
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
const closers = (html.match(/<\/script>/g) || []).length;
closers === 2
  ? ok("two </script> closers — the seed block and the app")
  : fail(`${closers} </script> closers; expected 2. A literal </script> inside the app ` +
         `code ends the block early — write it as <\\/script>.`);

const app = scripts.map(m => m[1]).sort((a, b) => b.length - a.length)[0] || "";
console.log(`  ..   app script is ${app.length.toLocaleString()} characters`);

/* ── it parses ─────────────────────────────────────────────── */
try { new vm.Script(app, {filename: "notebook-portfolio.js"}); ok("the app script parses"); }
catch (e) { fail("syntax error: " + e.message); }

/* ── nothing is declared twice ──────────────────────────────
   Parts of this file were spliced in over many sittings; a second
   `const SK = …` is a silent redeclaration error at load.       */
const names = [...app.matchAll(/^(?:const|let|function)\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
const dupes = [...new Set(names.filter(n => names.filter(x => x === n).length > 1))];
dupes.length ? fail("declared more than once: " + dupes.join(", "))
             : ok(`${new Set(names).size} top-level names, none declared twice`);

/* ── no url("…") inside an inline style ─────────────────────
   A double quote inside url() closes the style="" attribute it is
   written into, and everything after it is thrown away. This is
   what made washi tape lose its colour whenever torn ends were on. */
const badURL = [...app.matchAll(/style="[^"]*url\("/g)].length
             + [...app.matchAll(/url\("\$\{/g)].length;
badURL ? fail(`${badURL} url("…") in a template that becomes a style attribute — use url('…')`)
       : ok("every inline url() is apostrophe-quoted");

/* ── the frame blocks these ─────────────────────────────────
   prompt() and confirm() return null with no error inside the
   artifact sandbox, so a dialog built on them looks simply dead. */
const code = app.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const dialogs = [...code.matchAll(/(?<![A-Za-z.$])(prompt|confirm|alert)\s*\(/g)];
dialogs.length ? fail(`${dialogs.length} call(s) to prompt/confirm/alert — blocked in the frame; ` +
                      `use askText / askArea / askConfirm`)
               : ok("no prompt/confirm/alert — the in-page modals are used");

/* ── the seed block is where a save writes ─────────────────── */
const seed = /<script id="seed" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
if (!seed) fail('no <script id="seed"> block — the whole-page save has nowhere to write');
else {
  try {
    const d = JSON.parse(seed[1]);
    if (d === null) ok("seed block present and empty (a fresh copy)");
    else {
      const secs = (d.sections || []).length;
      const pages = (d.sections || []).reduce((n, s) => n + (s.pages || []).length, 0);
      ok(`seed block holds a notebook: ${secs} section(s), ${pages} page(s)`);
    }
  } catch (e) { fail("seed block is not valid JSON: " + e.message); }
}

/* ── the page must not have been serialised from a live DOM ── */
const markup = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");
/contenteditable="true"|class="[^"]*\blit2\b|id="marquee"/.test(markup)
  ? fail("live editing state is baked into the markup — this looks like a serialised DOM")
  : ok("no live-editing state baked into the markup");

/* ── size, against the 9 MB the whole-page save allows ─────── */
const mb = Buffer.byteLength(html) / 1048576;
console.log(`  ..   page is ${mb.toFixed(2)} MB of the ~9 MB a whole-page save can hold`);
if (mb > 8) fail("close to the limit — photographs will start to be refused");

console.log(bad ? `\n${bad} problem(s).` : "\nAll checks pass.");
process.exit(bad ? 1 : 0);
