# The notebook file

What **Export notebook JSON** writes, what **Import** accepts, and what the page bakes into its
own `<script id="seed">` block when it saves. One object, no schema version beyond `version`.

```jsonc
{
  "title": "My journal",
  "version": 3,

  "kit": "Bench",          // type kit: Bench, Field notes, Plate, Almanac, Ledger,
                           // Postcard, Atlas, Letter, Journal, Specimen
  "bind": "spread",        // "single" | "spread"
  "gutter": 56,            // px between facing pages
  "spine": "stitch",       // none | stitch | spiral | tape | perfect
  "gutterShade": true,
  "nums": true,            // page numbers (covers never get one)
  "anim": true,            // turn pages when reading
  "rulers": false,
  "stenOn": true,
  "stenSnap": true,
  "stencils": [ { "id": "my-…", "name": "My layout", "cells": [[x, y, w, h]] } ],
  "readonly": false,       // set by the standalone export; opens as a reader

  "sections": [
    {
      "id": "…", "name": "Daily pages", "color": "#6B6320",
      "pages": [
        {
          "id": "…", "name": "2026-09-11",
          "kind": "cover",          // omitted on an ordinary page
          "size": "land",           // land 1280×800 | square 1040×1040 | port 820×1160
          "paper": "ruled",         // plain ruled dot graph ledger kraft aged music
          "sten": null,             // id of the stencil shown on this page
          "cover": {                // only when kind === "cover"
            "material": "cloth",    // cloth leather kraft marble linen
            "color": "#3A4E4A",
            "style": "label",       // label | foil | blind | none
            "foil": "#D9C08A",
            "title": "Spring", "sub": "vol. ii"
          },
          "blocks": [ /* below */ ]
        }
      ]
    }
  ]
}
```

## A block

Every block carries the same frame. `x` and `y` are **local to its own page**, with the origin
at the page's top-left corner — not to the spread.

```jsonc
{ "id": "b…", "t": "text", "x": 92, "y": 168, "w": 470, "h": 84, "rot": -2.4, "lock": 1 }
```

`rot` is degrees. `lock: 1` makes it scenery: no pointer, no marquee, no nudge. `h` may be `0`
on a text, stitch or rule block, meaning "measure it" — the page fills it in on first draw.

### What each kind adds

| `t` | fields |
|---|---|
| `text` | `text`, `role` (header title subtitle kicker body quote caption label), `align`, and optional overrides `size` `font` `track` `caps` `ital` `weight` `color` |
| `photo` | `src`, `natW`, `natH`, `fit` (cover/contain), `frame` (none/mat/polaroid/torn), `radius`, `caption` |
| `note` | `text`, `color`, `size` |
| `ink` | `pts` `[[x,y]…]` relative to the block, `vw` `vh` (the box they were drawn in), `color`, `width`, `kind` (pen/marker) |
| `sticker` | `key` as `"category/name"`, `die`, and `fit` on border art (repeat/stretch/fixed) |
| `doodle` | `key`, `color`, `width` |
| `shape` | `kind` (rect/ellipse/rule), `color`, `radius`, `weight`, `fill` ("none" makes it a border), `stroke`, `strokeW`, `dash` |
| `tape`, `ribbon` | `color`, `pat` (solid stripe dot check grid chev dash wave star heart floral plaid), `ink`, `rip` |
| `scrap`, `lace`, `clip` | `color` |
| `tag` | `text`, `color`, `size` |
| `ticket` | `stub`, `t1`, `t2` |
| `stamp` | `src`, `color`, `val`, `cap` |
| `post` | `src` |
| `env` | `color`, `text` |
| `seal` | `color`, `text`, `size`, `font` |
| `libcard` | `title`, `lines` |
| `stitch` | `color`, `weight` |
| `date` | `fmt` (stamp iso long short slash full week doy month custom), `style` (plain box round banner burst big stack strip), `iso` `"YYYY-MM-DD"`, `font`, `size`, `color`, `sub` |
| `check` | `items` `[[done, "text"]…]`, `size` |
| `time` | `from`, `to`, `color` |
| `month` | `y`, `m` *(0-based)*, `on` `[day…]`, `color` |
| `track` | `title`, `rows` `["…"]`, `cols`, `on` `[[row, col]…]`, `color` |
| `mood` | `kind` (face/weather), `pick`, `title`, `color` |
| `rate` | `n`, `v`, `color` |
| `quote` | `text`, `by`, `color` |
| `mark` | `text`, `style` (box/rnd/ban/bst), `sub`, `size`, `color` |
| `spec` | `title`, `rows` `[[label, value]…]` |
| `swatch` | `color`, `label`, `spec` |

## Photographs

`src` is one of three things, and which one depends on how the notebook was written:

- a `data:` URI — a whole-page save or a standalone export, which is the usual case here
- a `media/<block id>.jpg` path — a files-form save, if the host offers one
- `null` — the frame is empty, or the image was added and never saved

A `blob:` URL is never written out; it is dead the moment the page reloads, so `serialise()`
turns it into `null` rather than leaving a broken link.

## Loading

`adopt()` fills in every default, so an older file loads without complaint. Two migrations run
on the way in:

- text blocks with a `preset` and no `role` are mapped across, so nothing already written
  changes face
- a notebook-level `cover` from before covers were pages becomes a cover page at the front of
  the first section
