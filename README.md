# mobileaccessgateway.ch

Static site for [www.mobileaccessgateway.ch](https://www.mobileaccessgateway.ch/),
migrated off Squarespace to GitHub Pages.

The Mobile Access Gateway itself lives in
[ahdis/MobileAccessGateway](https://github.com/ahdis/MobileAccessGateway); its
technical documentation is published separately at
[ahdis.github.io/MobileAccessGateway](https://ahdis.github.io/MobileAccessGateway/).
This repository is the marketing site only.

## Status

Migration in progress. **The live site is still served by Squarespace** — DNS has
not been changed and GitHub Pages is not yet enabled.

## Layout

```
_reference/     Verbatim archive of the original Squarespace site (see below)
_design/        Extracted design tokens, grid tables and the tools that produced them
```

## The archive

`_reference/archive.sh` re-downloads the original site — all four pages, every
CDN-hosted image at full resolution, the theme CSS, the webfonts, and the inline
`<style>` blocks that carry the Fluid Engine grid definitions.

This exists because the original becomes unrecoverable once the Squarespace
subscription lapses. Run it again while the subscription is still active if
anything looks missing:

```sh
./_reference/archive.sh
```

## Design extraction

Rather than reverse-engineering Squarespace's 1.27 MB `site.css`, the tokens were
measured from the live site with Playwright:

```sh
npm install
node _design/tools/extract-tokens.mjs   # computed styles per section, both viewports
node _design/tools/extract-scale.mjs    # fluid type scale sampled across 7 widths
python3 _design/tools/extract-grid.py   # mobile/desktop Fluid Engine grid tables
```

Results: [`_design/tokens.css`](_design/tokens.css),
[`_design/GRID.md`](_design/GRID.md),
[`_design/DESIGN-NOTES.md`](_design/DESIGN-NOTES.md).

The key finding is that **mobile is a separately authored layout, not a reflow** —
all 21 Fluid Engine blocks are placed differently at the two breakpoints, and
mobile stacking order cannot be derived from the desktop arrangement. See
[`_design/DESIGN-NOTES.md`](_design/DESIGN-NOTES.md).
