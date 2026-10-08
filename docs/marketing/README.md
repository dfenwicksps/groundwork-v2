# Marketing

Positioning, messaging and the evidence behind it. These are the outward-facing
counterpart to [`docs/frameworks.md`](../frameworks.md), which records the research
the product is built on — this directory records what may be *claimed* about it.

| File | What it is |
| --- | --- |
| `marketing-guide.html` | The extended guide. Ten sections: positioning, benefit by mission, the ten weeks, the number bank, the claim ladder, messaging by audience, objection handling, copy blocks, 27 references. |
| `Groundwork-Marketing-Guide.docx` | The same guide as a Word document, for sending to people who won't open an HTML file. Generated — edit the source, not this. |
| `build-docx.js` | Generates the `.docx`. See below. |
| `parent-onepager.html` | A single A4 handout for parent evenings. Prints from the browser; the print stylesheet swaps in an ink-aware palette so it also reads in mono. |

Both HTML files are standalone — no build step, no dependencies beyond a webfont
link. Open them in a browser.

## The claim ladder is the important part

Section 7 of the guide sorts every claim into **say it** / **say it carefully** /
**never say**, with the reason attached. Two rules it exists to enforce:

- **No figure in the guide describes Groundwork.** None of the cited studies
  evaluated this app. They establish that the *categories* it works in produce
  measurable effects. "Programmes of this kind have been shown to…" is defensible;
  "Groundwork delivers…" is not, until there is a pilot with pre/post data.
- **Nothing may position Groundwork as therapy.** The product says it isn't one, on
  the landing page and in settings. Marketing must not contradict the product.

Re-read section 7 whenever the product changes. A claim that was true of an earlier
build is the easiest kind of overreach to ship by accident.

## Regenerating the Word document

`docx` is deliberately not a project dependency — it is only needed to rebuild this
one file:

```bash
npm install --no-save docx && node docs/marketing/build-docx.js
```

The script writes `Groundwork-Marketing-Guide.docx` next to itself. Content lives in
the script, so change it there and rebuild; edits made in Word are overwritten.

Rendering the result is worth doing if LibreOffice is available:

```bash
soffice --headless --convert-to pdf docs/marketing/Groundwork-Marketing-Guide.docx
```

## Keeping the two versions in step

`marketing-guide.html` and `build-docx.js` carry the same content in two forms and
have to be edited together. The HTML is the reference copy — if they diverge, it wins.

_Product facts current as at October 2026; references verified against source papers (items 24–27 added October 2026)._
