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
Two versions share one estimate flow (`estimate.js`), one set of tokens (`base.css`) and one photo set (`img/`).

- **Version 1** (`index.html`, `v1.css`, `v1.js`): lead-first and short (about 2 phone screens). Hero photo with
  the estimate card on the first screen, one swipeable photo row with filters and a lightbox, all 21 services
  behind one "Everything we do" toggle, contacts in one row of quarters.
- **Version 2** (`v2/`): a scroll-driven 3D walk through a house built with Three.js (`vendor/three.module.min.js`,
  r170, MIT). Front of the house, kitchen, living room, bedroom, out the back door to the deck, the yard, then an
  aerial view with the estimate form. Their photos hang in frames on the walls (tap one to enlarge). Each stop's
  camera is solved from the field of view so the photos fill the free part of the screen, dead level and square on;
  phones stack the photos, wide screens lay them in a row. Falls back to a plain page without WebGL.
- Geometry: 4px spacing grid, one container edge (max 1120 = 4 x 280, quarter columns), concentric radii
  (card radius = control radius + padding) and squircle corners via `corner-shape: squircle` (Chrome and Edge;
  other browsers show regular rounded corners).
- The estimate flow opens a pre-filled text or email to the right line; nothing is stored.
- `privacy.html`: draft privacy page. `img/sm/`: smaller copies for the photo row and the 3D textures.
- `noindex` on every page, and a ribbon marks it as a draft (with a Version 1 / Version 2 switch).

## Going live checklist (needs the owner's yes, nothing here is done)
- [ ] Client says yes to the concept.
- [ ] Client confirms the photos are theirs to use (the listing photos especially) and sends bath/kitchen photos.
- [ ] Remove the draft ribbon, the footer draft note and the `noindex` meta tags.
- [ ] Owner reviews `privacy.html`.
- [ ] Pick a free host and point their domain at it (client changes DNS at GoDaddy themselves).
