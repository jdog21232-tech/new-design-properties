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
One site with a 3D walkthrough page. They share one estimate flow (`estimate.js`), one set of tokens (`base.css`) and one
photo set (`img/`). Every page links back: the walkthrough has a Back button (to `../#work`), a logo link home and
"Back to the main site" on its last card; the main site and About page link to it from the header, the Our work row
and the footer.

- **Main site** (`index.html`, `v1.css`, `v1.js`): lead-first and short (about 2 phone screens). Hero photo with
  the estimate card on the first screen (8 service groups that open into job lists), the Our work row (photos in
  three quarters, a 3D walkthrough door in the last quarter; a full-width banner on phones), hours and both
  licenses as large cards, contacts in one row of quarters.
- **3D walkthrough** (`v2/`, `v2/walk.js`): you walk *into* their photos. Each of 9 photos is rebuilt as a simple 3D
  room measured from its own perspective (horizon, floor lines of each wall, ceiling line, plus depth cards for near
  objects: island, sofa, chairs, bed, deck, tree, pallets). The photo is projected onto that room from the spot it
  was taken, so each stop shows the real photo and scrolling steps into it with true parallax, then cross-fades into
  the next. Phones pan across each photo as you walk; mouse or phone tilt adds a little look-around. Ends on the
  estimate form. Room measurements live in the `ROOMS` table at the top of `walk.js`. Three.js r170 (MIT) in
  `vendor/`. Falls back to plain photo cards without WebGL.
- **About us** (`about.html`, `about.css`): their own About text (story, team, quality, experience), facts row,
  the two teams with logos and contacts, service area, hours and licenses.
- Geometry: 4px spacing grid, one container edge (max 1120 = 4 x 280, quarter columns), concentric radii
  (card radius = control radius + padding) and squircle corners via `corner-shape: squircle` (Chrome and Edge;
  other browsers show regular rounded corners).
- The estimate flow opens a pre-filled text or email to the right line; nothing is stored.
- `privacy.html`: draft privacy page. `img/sm/`: smaller copies for the photo row and the 3D textures.
- `noindex` on every page, and a ribbon marks it as a draft (with a Main site / 3D walkthrough switch).

## Going live checklist (needs the owner's yes, nothing here is done)
- [ ] Client says yes to the concept.
- [ ] Client confirms the photos are theirs to use (the listing photos especially) and sends bath/kitchen photos.
- [ ] Remove the draft ribbon, the footer draft note and the `noindex` meta tags.
- [ ] Owner reviews `privacy.html`.
- [ ] Pick a free host and point their domain at it (client changes DNS at GoDaddy themselves).

## Stand-in photos (CC0, replace with the client's own)
Picking a service in the estimate swaps the hero photo. Three services have no New Design Properties photo yet, so
they use public-domain (CC0) stand-ins, marked on the page with a faint "Photo needed" watermark and a yellow
"Sample photo" note. Originals are in `_source/stock/` (kept off GitHub).
- `img/ph-additions.jpg`: "House framing", Wikimedia Commons, CC0. https://commons.wikimedia.org/wiki/File:House_framing.jpg
- `img/ph-exteriors.jpg`: "Houses with vinyl siding, South Side, 2022-08-17, 01", Wikimedia Commons, CC0. https://commons.wikimedia.org/wiki/File:Houses_with_vinyl_siding,_South_Side,_2022-08-17,_01.jpg
- `img/ph-repairs.jpg`: "Construction-work-carpenter-tools (23697903934)", Wikimedia Commons, CC0. https://commons.wikimedia.org/wiki/File:Construction-work-carpenter-tools_(23697903934).jpg
To swap one: drop the client's photo in `img/` (1400 px wide) and `img/sm/` (900 px), change `photo:` for that group in
`estimate.js` and remove `placeholder: true`.

