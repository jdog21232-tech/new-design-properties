# New Design Properties: website concept

DRAFT concept for review, made by JustGreen Technology (Web Studio) on 2026-11-22 to show what the
New Design Properties site could look like. Not the official site; hidden from search engines.

Facts and photos come only from newdesignproperties.com.

Stack: plain HTML/CSS/JS, static, no build step, no server, no stored data. Skills used: flyer-site-builder
(workflow) + design-master (tokens, anti-slop pass). Fonts: Oswald + Source Sans 3 (Google Fonts, OFL), with
system fallbacks.

## Look at it on this Mac
```bash
python3 -m http.server 8820 --bind 127.0.0.1
```
Then open http://127.0.0.1:8820 (run it from this folder).

## What's in it
- `index.html`: one phone-first page. Hero (their kitchen photo + their tagline), trust strip, Build & Remodel /
  Lawn & Landscape switch (swaps photos, service list, accent colour and the sticky Call number), filterable
  gallery with a lightbox, "your next bathroom" slot, 4-step process, service-area map of MN + SD (signature
  element), 4-step free-estimate flow that opens a pre-filled text or email to the right line, story, contacts
  by team, hours, licenses.
- `privacy.html`: draft privacy page.
- `img/`: their photos, resized. Originals in `_source/` (not committed).
- `noindex` is set on every page, and a ribbon marks it as a draft.

## Going live checklist (needs the owner's yes, nothing here is done)
- [ ] Client says yes to the concept.
- [ ] Client confirms the photos are theirs to use (the listing photos especially) and sends bath/kitchen photos.
- [ ] Remove the draft ribbon, the footer draft note and the `noindex` meta tags.
- [ ] Owner reviews `privacy.html`.
- [ ] Pick a free host and point their domain at it (client changes DNS at GoDaddy themselves).
