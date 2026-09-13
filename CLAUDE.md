# Notebook Portfolio — working notes

A junk-journal notebook that runs as one static page with no dependencies and nothing to
fetch: open `index.html` and it works.

**`npm run check` must PASS, and it now RUNS the script, not just parses it.** A patch once
turned `const AUTO_H = b => …` into `const AUTO_H = b = …`. That parses. Under `"use strict"` it
throws `ReferenceError: b is not defined` the instant the script is evaluated, and every
statement after that line — the whole tool rail, every canvas gesture, the page rail, boot —
simply never runs. The page came up as an empty shell. `check.js` evaluates the built script
against a stub DOM and requires the top level to complete; `boot()` parks on its first `await
fetch`, so it checks loading the page, not running it. **If you add a check, prove it fails on
the bug it is for** before you believe it.

**Read this before changing anything.** Almost every rule below exists because the obvious
approach broke the page *silently* — no error in the console, just a control that did nothing
or a piece that vanished. The note says what each one cost.

It is published as a Claude artifact, and that frame is not an ordinary browser. Several of the
hardest-won rules here are about the frame, not about journals.

## Who it is for

Jennifer keeps a bench journal and designs bags. She wants the making to feel like sticking
things into a book, not like filling in a template — so **nothing in here composes anything**.
An earlier version scored the content and laid it out automatically; it was rejected, correctly,
because the arranging *is* the activity. Snapping, stencils and drop-in layouts exist to make
hand-placing fast, never to take it over.

## Layout

```
notebook-portfolio/
├── src/
│   ├── head.html  markup.html  styles.css   the page around the script
│   ├── order.json                           the load order, and the only copy of it
│   └── js/01-core.js … 20-photo-and-share.js  one concern per file
├── tools/build.js         src/ → index.html, the one page that ships
├── tools/check.js         the standing checks
├── starters/              notebooks to import and build on
├── index.html             BUILT — a whole document, for Pages or a folder
├── artifact/page.html     BUILT — the same page as a fragment, to publish
├── docs/notebook-format.md
├── README.md
└── CLAUDE.md              this file
```

**`index.html` is generated.** Edit `src/`, run `npm run build`, commit both.
`npm run build -- --check` fails if the built page is stale. The split was made by cutting the
old single file at its section banners and proving the rebuild came back **byte-identical**; if
you ever restructure it again, do the same.

`seed` in the repo copy is `null` on purpose — see **Publishing** below.

## The shape of it

```
NB → sections[] → pages[] → blocks[]
```

`NB` is the entire notebook and the only thing that is ever edited. Every surface is a reader:
the canvas, the page rail, the objects list, Read mode, the print sheets and the standalone
export all go through the same `blockHTML()`. **Do not write a second renderer.** That single
decision is why the printed page cannot drift from the screen.

## Invariants — do not break these

### The frame

**`prompt()`, `confirm()` and `alert()` are blocked.** Inside the artifact sandbox they return
`null` with no error at all. "+ Section isn't working" was this, and so were rename, delete and
the spec-row editor — five dead controls from one cause. Everything asks through `askText`,
`askArea`, `askConfirm`, `askSection`, `askPages`. `tools/check.js` fails the build if one
creeps back.

**A double quote inside an inline `style` attribute ends the attribute.** `url("data:…")`
written into `style="…"` truncates everything after it, so the tape lost its colour and pattern
whenever torn edges were on, and thin borders vanished unless the die-cut was off. Every data
URI is percent-encoded whole (`SVG_URI`) and quoted with **apostrophes** inside `url()`. The
check scans for this.

**`</script>` inside the script ends the block.** Anywhere the code writes that string — the
seed splicer does — it must be `<\/script>`. The check counts closers; there must be exactly
two, the seed block and the app.

**The files form of `publish` is not available here.** It rejects `capability_disabled`, so
saving falls back to rewriting the whole page with the notebook baked into `<script id="seed">`
and photographs as data URIs. This is the working path; the files path is kept only because
another host might offer it.

**A failed save must never disable editing.** The work is in the browser and is fine; only the
write failed. Read-only is reserved for a genuine reader (`not_writer` / `not_granted`).
Everything else shows the amber chip with the actual error code and leaves every tool alive.
Collapsing four causes into "Read only" locked her out of her own notebook once.

**A published photograph keeps its `blob:` URL on screen.** The running view still serves the
version it *loaded*, so a `media/…` path does not resolve until the next reload. Swapping the
src at save time blanked every photograph the instant she pressed Save. `BLOBS` is what is still
to upload, `KEEP` is what has gone up and whose URL is still live; `serialise()` maps either to
a path, and nothing rewrites `b.src`.

### The book

**A block's `x`/`y` are local to its own page.** The right leaf of a spread is drawn at `ox`;
anything that works across both — `selBox`, `snapDelta`, the marquee, `rehomeBlocks` — converts
into that shared space and back. Get it wrong and pieces jump a page-width when selected.

**`#pages` holds the gutter fill as well as the leaves**, so `:first-child` is *not* the first
leaf. Page turning worked forwards and silently did nothing backwards for exactly this reason.
Use `$$("#pages .pg")` and index it.

**`drawPages()` empties the holders.** It rebuilds the leaves, and the blocks go with them.
Anything that changes a page's appearance must call `drawBlocks()`, which calls `drawPages()`
first and then puts the blocks back. Changing a cover colour wiped the page once.

**The gutter must be filled with paper.** Left as a gap it reads as a hole between two slides,
which is precisely the complaint that prompted spreads in the first place. A `.bodyfill` spans
the gutter in the left page's paper, with the curve shading drawn over it.

**A cover is a kind of page, not a thing on the notebook.** `page.kind === "cover"`. It was a
single hidden `NB.cover` once and nobody could find it. Covers show alone (a book does not open
onto its own boards), take no page number, and can sit anywhere.

### The pieces

**A locked piece takes no pointer.** It is skipped by hit-testing, the marquee, select-all and
nudging. It is the only way to work over a background you have already placed.

**Patterns are sized in pixels, not stretched.** Washi tape and repeating borders use
`background-size` in px with `repeat-x`, so pulling a longer piece reveals *more of the
pattern* rather than a bigger one. Torn ends are fixed-size masks at each end, so the bite stays
the same at any length.

**Border art is a background; a sticker is inline SVG.** Stickers carry a thick white copy
behind the ink, which is what gives the die-cut edge — on a thin horizontal motif that halo
swallows the drawing. Borders skip it and tile instead. Each border declares `repeat`,
`stretch` or `fixed` as its third table entry.

**A doodle is not a sticker.** No fill, no halo, drawn in the current ink colour, so it reads as
pen on the page rather than something stuck to it.

### Photographs

**A photograph is material.** `SHAPES` cuts it (twelve `clip-path`s), `FX` treats it (nine
filter stacks), `b.pen[]` holds strokes drawn on it, and `b.zoom`/`b.ox`/`b.oy` crop it by
moving the picture inside its frame. All of them are readers of one `photoHTML(b)`; the print
sheets and the standalone copy get them for nothing.

**A cut-out shape and a torn frame are the same slot.** Both are `clip-path`, and an element has
one. `photoHTML` gives the shape precedence and drops the tear — two `clip-path`s on one element
means the second silently wins, which looked like the torn frame had stopped working.

**Ink drawn on a photograph is stored in the photograph's own frame**, not in world
coordinates, so it turns and scales with the picture. `toLocal()` un-rotates a world point into
that frame; skip it and every stroke lands somewhere else the moment the photo is rotated.

**"Replace" is not what someone with an empty frame is looking for.** The button reads
**＋ Add my photo** until there is one to replace. The words on a control are part of whether it
works.

**Torn edges are seeded from the block id** (`torn()` over `rng(hash(id))`). Random each render
and the tear reshuffles every time you nudge the scrap.

**A `style="…"` attribute cannot contain a double quote — and typefaces are full of them.**
`faceCSS` returned `'"Amatic SC", "Bradley Hand", cursive'` and every renderer wrote it straight
into `style="…"`. The attribute ended at that first quote, `font-family` was discarded, and
**every face on the page fell back to the body font** — which is why the type kit looked like it
changed nothing, for its whole life. `FACES` is apostrophe-quoted now and `check.js` asserts it,
alongside the `url("…")` check that is the same trap in the other half of the CSS.

**A web font is only fetched when something is painted in it.** The type-kit menu was the first
use of eight of the thirteen faces, so it drew every specimen in the fallback and every kit
looked identical — the picker showing the one thing it exists to distinguish. `warmFaces()` asks
for them at boot.

**Text size changes the TEXT, not the box.** The slider writes `b.size` and nothing else. An
earlier go grew `b.w`/`b.h` to match, which read as the piece resizing itself out from under you;
Jennifer asked for it removed in as many words. Instead the frames that wrap words **hug their
words**: `.b-markwrap` holds the position and `.b-mark` inside it is sized by its own text, with
the border in `em`. That is why a stamp can be set to 60px and still look like a stamp.

**A shape cuts the whole CARD, not just the picture.** Clipping only the image left `.b-photo`'s
own ground — grey with no mount, white with one — standing behind the oval as a rectangle, which
is not a cut-out at all. The same path clips the card, the edge and the picture. The **edge is a
band of colour behind the picture, never a CSS `border`**: a border is always a rectangle and
cannot bend round an oval. And the **caption lives outside the clip**, or an oval crops its own
words off.

**Marks drawn on a photograph are stored as a fraction of it (0–1000), not in its pixels.**
Stored in pixels they were re-read against whatever size the block happened to be later, so
resizing a picture slid its marks off it.

**Every block that shows text must read its own `size`.** `sealHTML` did not, so the control
appeared to do nothing. If a block has a size field, the renderer uses it.

**A frame drawn round words is sized in `em`.** A stamp's perforations, a date's border, a
seal's disc were fixed pixel values, so turning the type up pushed the letters through the edge.
The CSS is `em`-relative with the root size set on the block, so the frame follows the type.

**A rubber stamp IS its words — `FITS`.** There is no container behind it to fall out of step:
`drawBlocks` measures `b.w`/`b.h` back off what was actually drawn, every render, so the type
size is the only size there is and dragging a corner sets `b.size` rather than the box. Two
earlier goes were both wrong and both were rejected: growing `b.w`/`b.h` alongside `size` read as
the piece resizing itself out from under you, and a centred wrapper with `overflow:hidden`
**clipped the stamp out of existence** the moment the words outgrew the old box — losing the top
edge first, which is why the words looked like they were sliding upward.

### Type

**A face on its own changes very little; a role changes the page.** `ROLES` sets slot, size,
weight, tracking, case, line-height and colour together; `KITS` names a display/body/mono trio
and may bend a role where its own faces need it — Amatic is tiny, Archivo Black is enormous.
`textStyle(b)` resolves kit → role → the maker's overrides, in that order. An earlier version
only swapped the family and felt, correctly, like nothing had happened.

**Applying a role clears the overrides.** Otherwise a size set by hand three kits ago quietly
survives and the role looks broken.

**Old text carries `preset`, not `role`.** `migrate()` maps them on load so nothing already
written changes face.

### Dates

**`new Date(26, …)` is 1926.** JavaScript maps years 0–99 into the 1900s. Worse, the year was a
number field updating on every keystroke, so typing "2026" was evaluated as 2, then 20, then
202. A month is now picked whole with `<input type="month">` and parsed as `YYYY-MM`.

### Away from Claude

**Two builds, because the two hosts want opposite things.** The artifact host wraps what you
publish in its own `<!doctype>` and `<head>`, so an artifact page must be a FRAGMENT; served
from GitHub Pages the same bytes have no charset, no viewport and no doctype. `index.html` is
the whole document, `artifact/page.html` is the fragment. Publishing the whole document gives
it two heads; serving the fragment gives it none — and the missing doctype is what made
`pageSource()` reject the page and a standalone export fail with "could not read its own
source". `pageSource()` now proves the page by its SEED BLOCK and adds a doctype if there is
none.

**`claude.use()` resolving `null` is not an error, it is a place.** Opened from a folder or off
GitHub Pages there is no host to publish into. `HOSTLESS` turns Save into **Export**, and the
save indicator says "not saved here" rather than leaving it to be discovered. Everything else —
every tool, print, the standalone export — works untouched.

**A hostless page still exports a standalone copy**, because `pageSource()` fetches
`location.href`, which is a real file there. That is the only way photographs survive a reload
outside Claude: the local draft drops `blob:` URLs, which are dead after a reload anyway.

### Paper and theme

**The chrome follows the viewer's theme; the paper never does.** A page you are making is a
physical object and its colours are the work, not the UI. A photograph does not invert at dusk,
so neither does the page. Only rails and menus change.

**Paper is drawn, not photographed.** Ruled, dot, graph, ledger, kraft, aged and manuscript are
CSS gradients with one shared grain. Nothing is fetched and nothing is added to what has to be
published.

## Publishing

The artifact lives at `claude.ai/code/artifact/8c3bef17-cf59-48f2-ac1c-26e8aa4a2f8d`.

> **The repo holds the tool. The artifact holds the notebook.**

Because the page saves itself into its own `seed` block, the live version contains her journal
and this file does not. Before republishing:

1. Read the live artifact (`Artifact action:"read"`).
2. Lift `<script id="seed" type="application/json">…</script>` out of it.
3. Splice it into the new build in place of `null`.
4. Publish.

Skipping step 2 replaces her notebook with an empty one. `npm run check` reports whether the
seed is empty or holds a notebook, which is the last chance to notice.

Ask her to **save before requesting changes**, so the merge picks up her latest.

## Deliberate decisions

- **One file ships; the source is split.** The page saves itself by rewriting its own source,
  so what publishes must be a single document with nothing to fetch. `tools/build.js` is the
  whole build: concatenate in `src/order.json` order, wrap, write. No bundler, no transpile.
- **No libraries.** Nothing is loaded from a CDN. Everything — paper, stickers, borders, seals,
  page turning — is CSS and inline SVG.
- **The standalone export is the same page** with `readonly` set in the seed, not a second
  reader. One renderer, so the copy cannot drift.
- **Print goes through the browser**, not a PDF writer. `buildPrint()` lays every chosen page at
  true size into `#printarea` and `@page` is sized to match.
- Undo is a snapshot stack of `NB.sections`, capped at 60. Coarse, but the notebook is small
  and it has never been the slow part.
- Photographs are resized to 1800 px on the long edge at quality 0.82 before they are kept.

## Ideas not yet built

- Moving a page from one section to another (re-ordering within a section works).
- Rich text inside a block — bold and italic are per block today.
- A back cover that knows it is the back, so Read mode can end on it.
- Grouping pieces, so an arrangement can be moved as one.
- Cutting one photograph out of another — masking by a shape works, lassoing a subject does not.
- Filters are CSS stacks, so they cannot do anything per-region: no dodging, no local warmth.
- Templates keep pieces, paper, size and stencil; they do not keep the page's *name* pattern,
  so a template cannot say "call me the ISO date and nothing else".
