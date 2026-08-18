# Privacy policy — statements that no longer match the site

The policy text was ported **verbatim** from the Squarespace site; nothing was
reworded. This is the list of statements that no longer describe how the site
actually works, for you (or counsel) to rule on. **None of these have been
changed in the published text.**

Ordered by how much they matter.

## 1. Place of processing — now inaccurate (§6)

> "We store and process your personal data in Switzerland."

The site will be served by **GitHub Pages (GitHub Inc., USA)** over a global
CDN. Web server logs — which §1 already says include IP address, browser and
timestamp — are processed by GitHub outside Switzerland. This is the one
statement that becomes materially wrong on the day of the cutover.

§6 does go on to allow transfers abroad "on the basis of standard data
protection clauses or legal exceptions", so the fix may be as small as removing
the flat first sentence. That is a legal call, not mine.

## 2. Contact forms — no longer exist (§1 and §3)

> "If you contact us using our contact forms or by email or telephone…"
> "Protection against misuse of our contact forms"

The Squarespace form has been replaced by a `mailto:` link, so no form data is
collected by the website at all. Email and telephone still apply, so §1 is only
partly stale; the §3 bullet no longer applies to anything.

## 3. Newsletter — appears to describe something that is not here (§1)

> "When you sign up for our newsletter, we collect the information you provide…"

There is no newsletter signup on any of the four pages, and there was none on
the Squarespace site either. This paragraph appears to have been inaccurate
before the migration; it is carried over unchanged. Worth deleting if MAG has
no newsletter, or leaving if one is planned.

## 4. Cookie preferences — understated (§2)

> "You can set your preferences in your browser."

There is now an explicit consent banner: Google Analytics loads **only** after
the visitor clicks Accept, and the choice is remembered. This is stricter than
what the policy describes, so the text is not wrong — just out of date in a way
that undersells the actual handling.

## 5. Recipients — GitHub is not named (§7)

> "External service providers"

GitHub now hosts the site and processes server logs. Whether to name it
explicitly is a matter of house style; the existing catch-all arguably covers it.

---

## What did **not** change

- Google Analytics is retained (`G-29ZBMN1C2G`), as decided, so §1's web
  analytics paragraph and §2's cookie paragraph remain accurate.
- The analytics paragraph's claim that IP addresses are "shortened or completely
  removed" before leaving Switzerland/EU/EEA still holds: the rebuild sets
  `anonymize_ip: true` and initialises Consent Mode to `denied`.
- Sections 3, 4, 5, 8 and everything about products and services are untouched
  and unaffected by the migration.
