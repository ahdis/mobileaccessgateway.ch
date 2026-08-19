# Converting a Squarespace 7.1 site to GitHub Pages

A working prompt for a future session, written after converting
**www.mobileaccessgateway.ch**. The next target is **www.matchbox.health**.

Point a new session at this file. Everything below is either a checklist to run
or a trap that cost real time on the first conversion.

---

## 0. Before anything else

**The domain is `matchbox.health`, not `matchbox.ch`.** `matchbox.ch` is
Mattel's toy-car site, on unrelated infrastructure with an expired certificate.
The ahdis one is listed as the homepage of `ahdis/matchbox`.

Do not write a line of HTML until the reconnaissance below is done. On the first
conversion, every hour spent measuring the original saved several spent guessing.

---

## 1. Reconnaissance

Run all of this first and write the answers down.

```sh
# every page, verbatim
curl -sSL --compressed -o home.html https://www.matchbox.health/

# platform and layout engine
grep -oE 'sqs-seven-one' home.html                 # confirms Squarespace 7.1
grep -o 'fe-block-' home.html | wc -l              # >0 means Fluid Engine (see §4)
grep -oE 'data-section-theme="[^"]*"' home.html | sort | uniq -c

# what has to be replaced
grep -o 'sqs-block-form' home.html | wc -l         # contact forms
grep -oE 'G-[A-Z0-9]{8,}|GTM-[A-Z0-9]+' home.html  # analytics property

# real pages (ignore /cart — a commerce stub, do not port it)
grep -oE 'href="/[a-z0-9/-]*"' home.html | sed 's/href="//;s/"//' | sort -u
```

Then check the things that constrain the whole job:

- **DNS**: `dig +short www.<domain> CNAME` → expect `ext-cust.squarespace.com`.
  Find out who controls the zone. (ahdis uses Google Cloud DNS.)
- **Org plan**: `gh api orgs/ahdis -q .plan` → ahdis is on **free**, so Pages
  only serves from a **public** repo. Not negotiable.
- **Pages collisions**: does another repo already publish Pages for a related
  project? `ahdis/MobileAccessGateway` already serves its mkdocs at
  `ahdis.github.io/MobileAccessGateway/`, so the marketing site needed its own
  repo. Check `ahdis/matchbox` the same way.
- **Repo naming**: ahdis names site repos after the domain
  (`k8s-fhir.ch`, `test.ahdis.ch`, `mobileaccessgateway.ch`). Use
  `ahdis/matchbox.health`.

### Known already about matchbox.health

| | |
|---|---|
| Platform | Squarespace 7.1 (`sqs-seven-one`) |
| Layout engine | **Classic sections — zero Fluid Engine blocks** |
| Real pages | `/`, `/features`, `/privacy-policy` (plus a `/cart` stub) |
| Section themes | bright, dark ×2, dark-bold, light, white |
| Analytics | GA4 `G-NJ6P4XSZMC` |
| Forms | none |
| Images | 10 distinct |
| DNS | `www` → `ext-cust.squarespace.com` |

**This is a materially easier job than mobileaccessgateway.ch.** No Fluid Engine
means no dual-grid extraction (§4), and no form means no replacement decision.
Expect roughly half the work. Do not skip the measurement discipline anyway.

---

## 2. Get these decisions from the user up front

They change what gets built, so ask before building:

1. **Contact form** (if any) → mailto, a third-party endpoint, or drop it.
2. **Analytics** → keep GA4, drop it, or swap for something cookieless.
   *Keeping GA4 means you must build a consent banner*, because Squarespace was
   providing one. Dropping analytics removes the banner and shrinks the privacy
   policy.
3. **Privacy policy** → port verbatim and flag mismatches, or amend.
   On the first conversion the user chose "verbatim + flag", then asked for the
   amendments afterwards. Both are reasonable; do not amend legal text silently
   either way.

---

## 3. Method: measure, never eyeball

This is the single most important lesson. Screenshots tell you *something is
off*; they do not tell you *what*. Build measurement tools early and let them
drive the loop.

The tools from the first conversion are in `_design/tools/` of this repo and are
mostly reusable as-is:

| Tool | What it answers |
|---|---|
| `compare.mjs` | Full-page height, live vs local, all pages, both viewports |
| `measure.mjs` | Landmark x/width (`AXIS=y` for y/height), live vs local |
| `probe-sections.mjs` | Per-section y, height and padding |
| `landmarks.mjs` | Generic dump of headings/images/buttons for any page |
| `crop.py` | Crop a region out of a screenshot (no imaging deps) |
| `linkcheck.mjs` | Every internal link and asset resolves |
| `test-consent.mjs` | Analytics stays off until Accept, and the choice persists |
| `extract-*.py/mjs` | Tokens, type scale, grid tables, prose, content map |

Target: **every landmark's x and width matching exactly** (`dx=0 dw=0`) at both
breakpoints, then converge heights. On the first conversion the home page
reached exactly that, with total height within 1px on desktop.

**Always neutralise Squarespace's scroll animations before screenshotting**,
or the live captures come back with large blank regions:

```js
await page.addStyleTag({ content:
  '.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important;visibility:visible!important}' });
```

---

## 4. The traps

Each of these cost time. Read them before starting, not after.

### Layout

**Mobile is a separately authored layout, not a reflow.** *(Fluid Engine only —
matchbox.health appears not to use it, but verify.)* Fluid Engine emits two
independent CSS Grids per section, and every block carries a different
`grid-area` in each. On mobileaccessgateway.ch all 21 blocks were repositioned.
The consequence that bites: the home page's feature groups alternate
image-left/image-right on desktop but always stack image-first on mobile, so
**mobile stacking order is not derivable from desktop order**. Extract both grids
into a table and treat it as the spec.

**The grid has 26 tracks, not 24** — `minmax(gutter,1fr) repeat(24, …)
minmax(gutter,1fr)`. Squarespace's `grid-area` line numbers only work against
that same track list. Reproducing the track template lets the extracted numbers
be used verbatim; using a bare 24-column grid puts everything one column out.

**Spacing comes from grid rows, not margins.** There is no rhythm to infer.
Measure the gaps between consecutive blocks and set them. Expect irregularities
that look like bugs but are real — one feature had a 96px gap before its button
on mobile purely because its prose did not fill the rows the grid allotted it.

**Sections are transparent.** `<section>` computes to `rgba(0,0,0,0)`; the colour
is painted by a `.section-background` child. Query the child.

**The header band is invisible to computed styles too** — it is painted by
`div.header-background-solid`. If the page looks right except for a coloured
strip at the top, this is why. Find it by walking all elements near the top
looking for a non-transparent background.

**Section padding is not symmetric.** A band that looks vertically centred may
be 143px top / 31px bottom. Measure both.

### Images

**Content images may be circle-clipped by an SVG `clipPath`**
(`clipPathUnits="objectBoundingBox"`, a circle path). The image files themselves
are opaque squares with the pale background baked in, so without the clip they
render as pale squares. `border-radius: 50%` is equivalent. Check for
`clip-path` on the image *and its ancestors* — and check `mask-image` too;
`border-radius` and `clip-path` on the `<img>` alone will read as `none`.

**The CDN content-negotiates non-deterministically.** The same URL returns WebP
or PNG depending on `Accept` *and* edge cache state — two runs minutes apart gave
different formats and byte counts. Send an explicit `Accept` header when
archiving so the archive is reproducible. Note the PNG rendition may flatten
transparency that the WebP keeps, or vice versa; verify what you actually got.

**Assets are referenced protocol-relative** (`//images.squarespace-cdn.com`), so
a grep for `https://` silently misses some — the header logos, in our case.
Match `(https:)?//`.

**Distinct assets share filenames.** Three separate uploads were all called
`AHD_MAG_..._Logo.png`, and all 18 webfonts are called
`latin.woff2` / `latin-ext.woff2` / `devanagari.woff2`. Key archived files by
their asset UUID.

**GIFs are served unresized** — the CDN ignores `?format=` for them, so animation
survives. `gif2webp` converts them with animation intact (verify the frame count).

### Type and content

**The type scale is `16px + N·vw` above 768px and fixed below**, with a
*discontinuity* at the breakpoint (mobile h1 can be larger than desktop h1 at
768px). Sample at 390/480/768/1024/1280/1440/1920 and fit the line; the fits came
out exact. Different sections scale slightly differently — the privacy policy's
prose did not match the home page's.

**Body copy may be marked up as `<h1>`.** The hero was three `<h1>` elements, so
it renders at h1 size with 32px margins and a 17px inset inside its column.
Rebuild as paragraphs plus one visually-hidden `<h1>` — same pixels, sane
outline — but *keep the h1 sizing*.

**`sqsrte-large`** is Squarespace's "lead paragraph" class. **`sqsrte-text-color--*`**
carries palette colours.

**The palette names lie.** `--black` was `rgb(150,173,38)`, an olive-lime used
for body copy. Lift the HSL values from `site.css` and round-trip them against
computed RGB to confirm.

**The menu button may not be a hamburger.** Look for `header-menu-icon-plus` —
a plus that rotates into a cross. The overlay centres its links *below* the
header, and its colours may differ from the page (ours was chartreuse with olive
links, not what the header suggested).

**Squarespace renders duplicate desktop and mobile headers.** Element counts and
indexes differ between live and your rebuild; don't chase a "missing" element
that is just the hidden duplicate. Filter by `getBoundingClientRect().width > 0`.

**List-style content lives in JSON**, not markup — `data-current-context` on
`.user-items-list-item-container` holds titles, descriptions, images and buttons.
Parse it rather than scraping the rendered DOM.

**`site.css` is ~1.3 MB of framework.** Do not copy it. The rebuild needed ~450
lines. Extract tokens from *computed* styles on the live page instead.

---

## 5. Order of work

1. **Archive first.** All pages, every asset at full resolution, theme CSS,
   webfonts, and the inline `<style>` blocks (they hold the grid definitions).
   Make it a re-runnable script. Once the Squarespace subscription lapses the
   original is unrecoverable — this is the one irreversible deadline.
2. **Extract tokens** — palette, type scale, section geometry, grid tables.
3. **Build page by page**, largest first.
4. **Converge with the measurement loop**: x/width first, then heights.
5. **Plumbing** — `.nojekyll`, `404.html`, `robots.txt`, `sitemap.xml`, favicon,
   og tags.
6. **Verify** — links, consent, subpath rendering.
7. **Stop.** Cutover is the user's call.

### Build setup that worked

Generate the pages from a shared header/footer in `_build/` with a small Python
script, and commit the generated HTML. GitHub Pages then serves plain static
files — no Jekyll, no Actions, no Ruby. `.nojekyll` is required because Jekyll
would otherwise skip `_`-prefixed directories.

**Use page-relative paths from the start.** Root-absolute `/assets/...` works
under a custom domain but breaks on the `ahdis.github.io/<repo>/` preview URL.
Rewrite `href`/`src`/**`srcset`** relative to each page's depth at build time,
and when appending a trailing slash to directory URLs, exclude anything with a
file extension. Both of those were bugs I shipped and had to fix.

---

## 6. Mistakes worth not repeating

- **I tuned spacing before finding a font-size bug.** A `.hero__body p` rule was
  beating `.hero__lede` on specificity, rendering hero copy at body size. All the
  spacing I had "carefully calibrated" was compensating for it, and had to be
  redone. **Check that fonts, sizes and colours are right before touching
  spacing.**
- **I sampled pixels outside the element's box** and concluded from that the
  images had transparency, which sent me through several wrong hypotheses about
  the CDN. Get the element's actual rect first, then sample inside it.
- **Two Python `str.replace` calls hit more than intended** — once silently doing
  nothing because of escaping, once replacing both the base and the media-query
  copy of an identical rule. Assert that a replacement applied and that the match
  count is what you expect.
- **I let CSS edits delete neighbouring rules** by replacing a range between two
  markers without checking what was inside it. Re-grep for the rules you expect
  to survive.

---

## 7. Cutover — always ask first

Never do this unprompted, and re-confirm even if the plan was approved earlier.

1. Enable Pages on `main` / root; verify at `ahdis.github.io/<repo>/`.
2. Add `CNAME` containing the hostname.
3. DNS: apex A records → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`;
   `www` CNAME → `ahdis.github.io`.
4. Wait for the certificate, then enable **Enforce HTTPS**.
5. Verify, *then* cancel Squarespace.

Note: `gh api -X POST .../pages` and `gh repo create` were both blocked by the
permission classifier in my session. Expect to hand those two commands to the
user rather than running them.

---

## 8. What "done" looked like

For mobileaccessgateway.ch, against the live site at 1440px and 390px:

| Page | Desktop | Mobile |
|---|---|---|
| home | 0.0% (+1px) | +0.3% |
| contributors | −1.0% | +0.7% |
| privacy-policy | 0.0% (+1px) | +0.5% |

Every landmark on the home page matched exactly in x and width at both
breakpoints, and the mobile nav overlay matched link-for-link. Contact was
deliberately ~20% shorter because its form was replaced by a mailto link — a
page whose content legitimately changed stops being measurable this way, and
that is fine as long as you say so rather than quietly reporting the number.
