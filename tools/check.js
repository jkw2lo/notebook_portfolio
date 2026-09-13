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

const FILE = path.join(__dirname, "..", "index.html");
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
let parsed = null;
try {
  parsed = new vm.Script(app, {filename: "notebook-portfolio.js"});
  ok("the app script parses");
} catch (e) { fail("syntax error: " + e.message); }

/* ── it RUNS ────────────────────────────────────────────────
   Parsing is not enough, and believing it was cost a whole broken
   release. `const AUTO_H = b = b.t === "text"` — an arrow that lost
   its ">" — parses perfectly and then throws ReferenceError the
   moment the script is evaluated, under "use strict", killing every
   statement after it: the tool rail, every canvas gesture, boot.
   The page came up as an empty shell with no error anyone would see.

   So: evaluate the real script against a stub DOM and require the
   top level to complete. `boot()` suspends on its first `await fetch`,
   which never settles here, so nothing past that point is exercised —
   this checks the loading of the page, not the running of it.       */
function stub(path){
  const fn = function(){ return stub(path + "()"); };
  return new Proxy(fn, {
    get(t, k){
      if (k in t) return t[k];                       /* whatever was assigned */
      if (k === Symbol.iterator) return function*(){};
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === "length") return 0;
      if (k === "then") return undefined;            /* not a thenable */
      return stub(path + "." + String(k));
    },
    set(t, k, v){ t[k] = v; return true; },
    has(){ return true; }
  });
}
let ctx = null;
if (parsed){
  const doc = stub("document");
  const sandbox = {
    console: {log(){}, warn(){}, error(){}},
    document: doc,
    location: {href: "https://example.invalid/index.html"},
    navigator: {userAgent: "check"},
    innerWidth: 1440, innerHeight: 900,
    localStorage: {getItem: () => null, setItem(){}, removeItem(){}},
    indexedDB: stub("indexedDB"),
    /* never settles, so boot() stops at its first await and the rest of
       this check is about load time only */
    fetch: () => new Promise(() => {}),
    addEventListener(){}, removeEventListener(){},
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    requestAnimationFrame: () => 0,
    performance: {now: () => 0},
    getSelection: () => stub("selection"),
    matchMedia: () => ({matches: false, addEventListener(){}})
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  try {
    ctx = vm.createContext(sandbox);
    parsed.runInContext(ctx, {timeout: 10000});
    ok("the app script runs — every top-level statement completed");
  } catch (e) {
    ctx = null;
    fail("the script THROWS at load: " + e.message +
         "\n         Everything after that line is dead — the page comes up as an empty shell.");
  }
}

/* ── a style="…" attribute cannot contain a double quote ────
   `faceCSS` returned '"Amatic SC", …' and every renderer wrote it into
   style="…". The attribute ended at that first quote, font-family was
   thrown away, and EVERY face on the page fell back to the body font —
   so the type kit appeared to do nothing at all. Same trap as url("…"),
   which already has a check; this is the other half of it.           */
if (ctx){
  try {
    const bad = vm.runInContext(
      `Object.keys(FACES).map(k => [k, faceCSS(k)]).filter(p => p[1].includes('"'))`,
      ctx, {timeout: 5000});
    bad.length
      ? fail(`${bad.length} typeface(s) quoted with " — they go into style="…" and ` +
             `close it, losing the family: ` + bad.map(p => p[0]).join(", "))
      : ok("every typeface is apostrophe-quoted — survives a style attribute");
    const ts = vm.runInContext(`textStyle({role:"header", kit:"Postcard"})`, ctx, {timeout: 5000});
    ts.includes('"')
      ? fail('textStyle() emits a double quote — it is written into style="…"')
      : ok("textStyle() output survives a style attribute");
  } catch (e) { fail("could not inspect the type system: " + e.message); }
}

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
