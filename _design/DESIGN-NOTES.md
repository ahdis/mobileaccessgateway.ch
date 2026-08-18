# Design notes — porting mobileaccessgateway.ch off Squarespace

Findings from analysing the live Squarespace 7.1 site, recorded so the rebuild
targets measured values rather than guesses.

## Pages

| Page | Sections | Layout engine |
|---|---|---|
| `/` | 4 (`bright`, `white-bold`, `light-bold`, `dark-bold`) | Fluid Engine, 15 blocks |
| `/contributors` | 2 | Classic — ordinary responsive reflow |
| `/contact` | 3 | Fluid Engine, 4 blocks |
| `/privacy-policy` | 2 | Fluid Engine, 2 blocks |

`/cart` exists as a Squarespace commerce stub and is **not** being ported.

## Mobile is a second authored layout, not a reflow

Fluid Engine emits two independent CSS Grids per section:

|  | Mobile (`<768px`) | Desktop (`≥768px`) |
|---|---|---|
| Columns | 8 | 24 |
| Rows (home) | 104 | 53 |
| Row height | `minmax(24px, auto)` | `container-width × 0.0215` |

**All 21 Fluid Engine blocks carry a different `grid-area` in each.** Full table
in [GRID.md](GRID.md). Consequences for the rebuild:

- Column numbers are not comparable across breakpoints (8-col vs 24-col grid).
- Stacking order on mobile is **not** derivable from desktop left-to-right order.
  On the home page, blocks `yui_3_17_2_1…6896622` and `a586f7ed74db` sit side by
  side on desktop (cols 9–13 and 14–22) but stack in the reverse of the naive
  order on mobile. A "build desktop, let it wrap" port gets this pair backwards.
- Same content at both breakpoints — the only `display:none` rules are
  Squarespace editor artifacts (`js-content-mode-element-wrapper`), so nothing
  is hidden on one breakpoint only.

## Type scale

Sampled at 390/480/768/1024/1280/1440/1920px (`tools/extract-scale.mjs`).
Above the breakpoint every size is exactly `16px + N·vw`:

| | mobile (fixed) | desktop |
|---|---|---|
| h1 | 20.32px | `16px + 0.48vw` |
| h2 | 32.2px | `16px + 1.80vw` |
| h3 | 23.56px | `16px + 0.84vw` |
| body | 17.08px | `16px + 0.12vw` |
| nav | 16px | 16px |

There is a **discontinuity at 768px** — mobile h1 (20.32px) is *larger* than
desktop h1 at 768px (19.69px). Two separate declarations, consistent with the
two-layout finding.

Buttons are the one anomaly: 14.92 → 14.4 → 14.272 → 13.696px, non-monotonic.
Not fitted; pinned per breakpoint and to be confirmed in the visual diff pass.

## Palette

Lifted as HSL from `site.css`, each confirmed by round-tripping to the RGB
actually computed on the live page:

| Token | HSL | RGB | Used as |
|---|---|---|---|
| `--sq-accent` | `88.36 26.32% 40.98%` | `106,132,77` | hero bg, h2/h3 |
| `--sq-black` | `70.22 63.98% 41.37%` | `150,173,38` | body copy (not black!) |
| `--sq-light-accent` | `65.07 71.72% 61.18%` | `215,227,85` | `light-bold` band |
| `--sq-dark-accent` | `205.56 30.68% 34.51%` | `61,92,115` | footer bg, nav links |

Section backgrounds are painted on a `.section-background` child; the `<section>`
itself is `rgba(0,0,0,0)`.

## Font

Poppins, weights 400 and 500 only. The original serves 18 woff2 files from the
Squarespace CDN covering latin / latin-ext / devanagari — archived under
`_reference/squarespace/fonts/`. The rebuild only needs latin + latin-ext at
400/500; devanagari is unused by any page content.

## Things that were not visible from the markup

Found only by measuring or sampling the rendered page:

- **The header sits on a solid chartreuse band** painted by
  `div.header-background-solid`; every element's `background-color` reports
  `rgba(0,0,0,0)`. The mobile menu overlay uses the same chartreuse.
- **All four content images are circle-clipped** by an SVG `clipPath`
  (`objectBoundingBox` circle). The image files themselves are opaque squares
  with a pale background baked in, so without the clip they render as pale
  squares. `border-radius: 50%` is equivalent.
- **The menu button is Squarespace's "plus" icon** (`header-menu-icon-plus`),
  which rotates into a cross — not a hamburger.
- **The CDN content-negotiates**: the same URL returns WebP or PNG depending on
  `Accept` and edge cache state, which made the first archive non-deterministic.
  `archive.sh` now sends an explicit `Accept` so it stores true originals.
- **The header logos are referenced protocol-relative** (`//images...`), and
  three distinct asset UUIDs share one filename, so assets are keyed by UUID.
- **Hero copy is `<h1>`** in the original, so it renders at h1 size with 32px
  paragraph margins and a 17px inset inside its 671px column.

## Decisions taken

- **Contact form** → replaced by a `mailto:info@ahdis.ch` button plus the postal
  address. No third-party form processor.
- **Analytics** → GA4 `G-29ZBMN1C2G` retained, which means a consent banner must
  be rebuilt (Squarespace was providing it). Banner colors from `custom.css`:
  bg `#445c71`, accept-hover `#dae16c`, deny-hover `#db7c33`, `border-radius: 5px`.
- **Privacy policy** → ported verbatim; mismatches with the new hosting are
  listed in [PRIVACY-REVIEW.md](PRIVACY-REVIEW.md), not silently edited.

## Verification

`tools/compare.mjs` reports full-page heights against the live site; at the time
of writing home and privacy match to 1px on desktop, contributors is within 1%,
and all four are within 1% on mobile except contact, which is intentionally
shorter without the form. `tools/measure.mjs` compares landmark geometry —
on the home page every x and width matches exactly at both breakpoints.
