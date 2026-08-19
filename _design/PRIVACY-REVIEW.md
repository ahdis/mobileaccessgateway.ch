# Privacy policy — what was changed, and the one item left open

The policy was first ported **verbatim** from the Squarespace site. The edits
below were then made on request, to bring it in line with how the site actually
works after the move to GitHub Pages.

**This is legal text. Please have it reviewed before the cutover.** Every change
is listed here with the exact before/after so a reviewer does not have to diff
the HTML. The wording is deliberately conservative — nothing was restructured,
and no section was added or removed.

---

## Changes made

### 1. Section 6 — place of data processing (the important one)

This was the statement that became false the moment the site moves to GitHub.

**Before**
> We store and process your personal data in Switzerland. However, in order to
> achieve some of the purposes described in this Privacy Policy, it may also be
> necessary for us to process your personal data in countries outside
> Switzerland and the EU or to transfer it to such countries.

**After**
> This Website is hosted on GitHub Pages, a service of GitHub, Inc. (United
> States), and delivered through its global content delivery network. The server
> log data described in section 1 is therefore processed by GitHub outside
> Switzerland. Other personal data we collect, for example when you contact us
> or when you use our products and services, is stored and processed in
> Switzerland.
>
> In order to achieve some of the purposes described in this Privacy Policy, it
> may also be necessary for us to process your personal data in further
> countries outside Switzerland and the EU or to transfer it to such countries.

The sentence that follows, about standard data protection clauses and legal
exceptions, is unchanged and still carries the transfer.

### 2. Section 1 — the contact form no longer exists

**Before:** "If you contact us using our contact forms or by email or telephone…"
**After:** "If you contact us by email or telephone…"

### 3. Section 3 — removed a legal-basis bullet that no longer applies

Deleted: "● Protection against misuse of our contact forms". There is no form.
All other bullets are untouched.

### 4. Section 2 — the cookie statement understated the actual handling

**Before:** "In addition, we use cookies to enable web analytics. You can set
your preferences in your browser."

**After:** "In addition, we use cookies to enable web analytics. Analytics
cookies are only set if you agree to them: when you first visit the Website you
are asked whether to allow them, and none are set unless you accept. You can
change that decision at any time, and you can also set your preferences in your
browser."

"change that decision at any time" is a working link that brings the consent
banner back — so the sentence is literally true, not aspirational.

### 5. Section 7 — named the hosting provider

**Before:** "● External service providers,"
**After:** "● External service providers, including the provider hosting this
Website (GitHub, Inc.),"

and

**Before:** "Such recipients are usually based in Switzerland, or in an EU or EEA
member state."
**After:** "…or in an EU or EEA member state; our hosting provider is based in
the United States."

---

## Left unchanged — needs your decision

### The newsletter paragraphs (section 1)

> "When you sign up for our newsletter, we collect the information you provide
> to us… please use the unsubscribe link at the end of the newsletter."

There is no newsletter signup anywhere on this site, and there was none on the
Squarespace version either — this text appears to have been inaccurate before
the migration too.

**I deliberately did not delete it.** Describing collection that does not happen
is over-disclosure, which is harmless; deleting it when ahdis does run a
newsletter through some other channel would be under-disclosure, which is the
worse error. I cannot verify which is the case from the site alone.

If MAG has no newsletter, say so and it is a one-line deletion of the
`<em>Use and optimization of our newsletter</em>` paragraph and the two
paragraphs following it.

---

## Unaffected by the migration

- Google Analytics is retained (`G-29ZBMN1C2G`), so section 1's web analytics
  paragraph and the rest of section 2 remain accurate.
- Section 1's claim that IP addresses are "shortened or completely removed"
  before leaving Switzerland/EU/EEA still holds: the rebuild sets
  `anonymize_ip: true` and initialises Consent Mode to `denied`.
- Sections 4, 5, 8 and everything describing products and services are untouched.

## Suggestion not acted on

The policy carries no "last updated" date. Adding one is normal practice and
would be useful given these amendments, but it is a new element rather than a
correction, so I left it out.
