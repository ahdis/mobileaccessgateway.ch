# mobileaccessgateway.ch

Static site for [www.mobileaccessgateway.ch](https://www.mobileaccessgateway.ch/),
migrated off Squarespace to GitHub Pages.

The Mobile Access Gateway itself lives in
[ahdis/MobileAccessGateway](https://github.com/ahdis/MobileAccessGateway); its
technical documentation is published separately at
[ahdis.github.io/MobileAccessGateway](https://ahdis.github.io/MobileAccessGateway/).
This repository is the marketing site only.

## Status

**The live site is still served by Squarespace.** DNS has not been changed, no
`CNAME` file exists, and GitHub Pages has not been enabled. See
[Cutover](#cutover) below.

## Editing

Pages are generated from shared chrome so the header and footer cannot drift
between files. Edit the content in `_build/`, then:

```sh
python3 _build/build.py     # regenerates index.html and the three page dirs
```

Commit the generated HTML — GitHub Pages serves it as-is, with no build step,
no Jekyll and no Actions workflow. (`.nojekyll` is present because Jekyll would
otherwise skip the `_`-prefixed directories.)

Preview locally with `python3 -m http.server 8080`.

## Layout

```
index.html, contributors/, contact/, privacy-policy/, 404.html
assets/          css, js, self-hosted Poppins, WebP images
_build/          page content + shared header/footer -> the HTML above
_design/         extracted tokens, grid tables, review notes, and the tools
_reference/      verbatim archive of the original Squarespace site
```

## How faithful is it?

Every page was measured against the live Squarespace site with Playwright at
1440px and 390px. Full-page heights:

| Page | Desktop | Mobile |
|---|---|---|
| home | 0.0% | +0.3% |
| contributors | −1.0% | +0.7% |
| privacy-policy | +3.4%\* | +4.1%\* |
| contact | −19.4% | −25.5% |

On the home page every landmark's x position and width matches exactly at both
breakpoints.

Two pages differ on purpose, so their numbers are not fidelity measures:
**contact** is shorter because the Squarespace form was replaced by a `mailto:`
link, and **privacy-policy** (\*) is longer because its text was amended — see
below.

Re-run the comparison at any time (needs the local server running):

```sh
npm install
node _design/tools/compare.mjs        # page heights, live vs local
node _design/tools/measure.mjs /      # landmark x/width;  AXIS=y for vertical
VP=mobile node _design/tools/measure.mjs /
node _design/tools/linkcheck.mjs      # internal links and assets
node _design/tools/test-consent.mjs   # verifies analytics stays off until Accept
```

## The archive

`_reference/archive.sh` re-downloads the original site: all four pages, every
CDN asset, the theme CSS, the webfonts, and the inline `<style>` blocks holding
the Fluid Engine grid definitions. Run it again while the Squarespace
subscription is still active if anything looks missing — once it lapses the
original is unrecoverable.

## Design extraction

Tokens were measured from the live site rather than reverse-engineered from
Squarespace's 1.27 MB `site.css`. See
[`_design/DESIGN-NOTES.md`](_design/DESIGN-NOTES.md) for the findings and
[`_design/GRID.md`](_design/GRID.md) for the per-breakpoint grid tables.

The key one: **mobile is a separately authored layout, not a reflow.** All 21
Fluid Engine blocks sit at different grid positions at the two breakpoints, and
mobile stacking order cannot be derived from the desktop arrangement — the home
page's three feature groups alternate left/right on desktop but always put the
image first on mobile.

## Decisions and open items

- **Contact form → `mailto:info@ahdis.ch`.** No third-party form processor.
- **Google Analytics retained** (`G-29ZBMN1C2G`), so a consent banner was
  rebuilt: Consent Mode starts `denied`, GA loads only after Accept, and the
  choice is remembered. Verified by `_design/tools/test-consent.mjs`.
- **Privacy policy amended.** Ported verbatim first, then updated so it matches
  how the site actually works on GitHub Pages — most importantly section 6,
  which claimed all processing happens in Switzerland. Every change is recorded
  with before/after in
  [`_design/PRIVACY-REVIEW.md`](_design/PRIVACY-REVIEW.md), along with one item
  (the newsletter paragraphs) left open for a decision.
  **This is legal text and should be reviewed before the cutover.**
- **Broken links fixed.** The home page's "Mobile health (mHealth)" link now
  points at ahdis's mHealth-Konzept PDF; it previously went to an
  e-health-suisse.ch URL that 404s (and still 404s on the live site). The
  footer's `ahdis.ch/en/` link, which 301s to a 404, now uses
  `www.ahdis.ch/en/home` like the other ahdis links. No external link on the
  site is broken.

## Cutover

Not done yet, and gated on explicit approval. When it happens:

1. Enable GitHub Pages on `main` / root, verify at `ahdis.github.io/mobileaccessgateway.ch`.
2. Add a `CNAME` file containing `www.mobileaccessgateway.ch`.
3. In Google Cloud DNS, point the apex at GitHub's IPs
   (`185.199.108–111.153`) and `www` at `ahdis.github.io`.
4. Wait for the certificate, then enable **Enforce HTTPS**.
5. Only after verifying: cancel Squarespace.

The repository must stay **public** — ahdis is on the free org plan, which does
not serve Pages from private repositories.
