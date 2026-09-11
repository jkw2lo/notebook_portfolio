# Plate & Bleed

A junk journal you build on facing pages. Drop photographs anywhere, write straight onto the
paper, stick tape and tickets and pressed ephemera over the top, and read the whole thing back
as a bound book — or print it, or hand someone a single file that opens as a finished portfolio.

It is one static page. No build step, no dependencies, no server — open
`plate-and-bleed.html` and it works.

## What it is

Most tools of this kind are one of two things: a template filler that decides your layout for
you, or a slide deck wearing a paper texture. This is neither. **Nothing composes anything.**
You put pieces exactly where you want them, on a spread that behaves like an open book.

- **A notebook, not a deck.** Sections hold pages; pages face each other across a real gutter
  with a stitched, spiral, taped or glued spine. Drag a piece across the gutter and it moves to
  the other leaf. Pages carry numbers; covers do not.
- **Covers are pages.** Add one, or convert any page into one — bookcloth, leather, kraft
  board, marbled or linen, with a paper label, foil blocking or a blind stamp. Put as many as
  you like anywhere: front, back, between sections.
- **Thirty-one kinds of thing to put down**, from a photograph to a wax seal. Everything drags,
  resizes, rotates, layers and locks.
- **Type as a system.** Ten kits, eight roles. Change the kit and every header, caption and
  label in the notebook restyles together.
- **A stencil layer** you can make from your own arrangement and reuse on any page — shaded,
  untouchable, snapped to while you drag.
- **Read it, print it, or hand it over.** Page turning in 3-D, print to PDF at true size, or
  export a standalone HTML file that reads and prints on its own.

## What you can put on a page

| | |
|---|---|
| **Written** | text in eight roles, sticky notes, quote bands, checklists you tick on the page |
| **Pictures** | photographs with no frame, a mat, a polaroid or a torn edge; postcards |
| **Drawn** | pen and marker — each stroke its own object; 28 doodles in your ink colour |
| **Ephemera** | paper scraps with seeded torn edges, tags, tickets, postage stamps, envelopes, library cards, wax seals, paper clips, lace trim, ribbon, washi tape, stitch lines |
| **Planner** | date stamps in 9 formats × 8 styles, hour columns, little months, habit grids, mood and weather rows, star ratings |
| **Stickers** | 87 across nine drawers — Holidays, Effects, Landmarks, Travel, Nature, Desk, Food, Feelings, Life — plus stretching and repeating Borders |
| **Reference** | spec tables, material swatches, shapes and frames |

Washi tape and borders are sized in pixels, not stretched: **pull a longer piece and you get
more of the pattern**, at the right weight, with the torn bite the same size at both ends.

## How it fits together

```
  NB  ──────►  sections  ──────►  pages  ──────►  blocks
the notebook   a run of pages     paper, size,    x, y, w, h, rot
(one object)   under one tab      stencil, kind   and whatever that kind needs
```

`NB` is the whole notebook and it is the only thing that is ever edited. Everything on screen
is a reader of it: the canvas, the page rail, the objects list, Read mode, the printed sheets
and the standalone export all render from the same `blockHTML()`. There is no second renderer,
so the printed page and the exported file cannot drift from the screen.

A block's `x`/`y` are **local to its own page**. On a spread, the right-hand leaf is drawn at an
offset (`ox`), and anything working across both — selection boxes, snapping, marquee — converts
to that shared space and back. It is the one piece of arithmetic in here worth being careful
about.

## Where things live

It is a single file, and that is deliberate for now: the page publishes and saves *itself*, so
there is nothing to assemble. Inside, it reads top to bottom in sections:

| Section | What it owns |
|---|---|
| tokens & CSS | the two palettes, every block's look, print rules |
| tape, journal blocks, stamps | patterned washi, hour columns, months, habit grids |
| stencils, rulers, layouts | the shaded plan layer and the layout gallery |
| faces, stickers, doodles, dates | the type list, 87 stickers, 28 marks, date formats |
| the book | spreads, gutter, binding, page numbers |
| reading & export | page turning, printing, the standalone copy |
| type, cover, locking, objects | kits and roles, cover materials, the object list |
| modals | the in-page dialogs — `prompt()` does not work in the frame |
| render / tool rail / canvas | drawing, the contextual toolbar, every pointer gesture |
| photographs, pages, save, boot | images, section and page handling, publishing, startup |

Splitting it into `src/*.js` the way Awl & Gusset is split is the obvious next move — see
[CLAUDE.md](CLAUDE.md).

## Working on it

```bash
npm run check     # or: node tools/check.js
npm start         # python3 -m http.server 8732
```

`tools/check.js` is not a test suite. It is a short list of mistakes that have **already** been
made in this file, each of which broke the page silently — a `url("…")` inside an inline style
closing the attribute, a second `const` of the same name, a literal `</script>` ending the block
early, a `prompt()` that the sandbox swallows. Run it before publishing.

Read [CLAUDE.md](CLAUDE.md) before changing anything. It is the rulebook, and most of it exists
because the obvious approach quietly did not work.

## Saving, and the one thing to be careful about

Inside Claude the page **publishes itself**: your notebook is written into a
`<script id="seed">` block in the page, and photographs are embedded with it. That is why a
shared link is a self-contained page with nothing to fetch — and why the copy in this repo has
`seed` set to `null`.

> **The repo holds the tool. The published artifact holds the notebook.**
> Publishing this file as-is over a live artifact replaces someone's journal with an empty one.
> Read the live page first, lift its seed block, and splice it into the new build.

There is also a `localStorage` draft as a backstop, **Export notebook JSON** for a copy you
keep, and **Import** to bring one back.

## Getting it out

- **Print / save as PDF** — every chosen page at true size, one to a sheet, drawn by the same
  renderer as the screen. Print at 100% with fit-to-page off.
- **Export a standalone copy** — one HTML file with the notebook and its photographs baked in.
  It opens in any browser as a reader, turns pages, and prints. It is the same page with a
  read-only flag, so it cannot drift from what you made.

Both let you tick which sections and pages go in.

## Not built yet

- The file is one blob. Splitting it needs a small inliner, because publishing wants one file.
- Undo is a snapshot stack of the whole notebook; it is fine at this size and will not stay fine.
- Text is plain — no bold or italic *within* a block, only per block.
- Photographs are resized to 1800 px on the long edge and embedded, so the whole notebook shares
  one budget of roughly 9 MB. Large collections want a second notebook.
- No way to move a page from one section to another yet; you can re-order within a section.

## Licence

MIT — see [LICENSE](LICENSE).
