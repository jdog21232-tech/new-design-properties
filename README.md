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

## Photos
Every image on newdesignproperties.com was collected on 2026-11-23 (home gallery 24, outdoor gallery 44, plus the
service and about pages): 77 photos after removing duplicates. The New Design Lawn & Landscape Facebook page added 94
more job photos (111 on the page; 9 were already on the website and 8 are graphics: logos, cover, banner, 3 promo
flyers, avatar, kept in `_source/facebook/graphics`). All 171 are on `gallery.html` ("See all 171 photos" under Our
work); `_source/fb_build.py` adds the Facebook set. Their own photos got the same photo-editor look as the rest of the site, uncropped. Rebuild with
`_source/gallery_build.py` (kept off GitHub); data lives in `gallery-data.js`.
- 162 are New Design jobs (68 from the website, 94 from Facebook). 9 are stock pictures the current site uses on its service pages (two are iStock 612 px
  previews, one is from Pexels); they carry a yellow "Stock photo" mark and sit at the end of the gallery.
- Hero photo per service: their own photos, except Repairs & handyman, which uses the current site's stock
  remodeling picture with the faint "Photo needed" mark until they send their own.
- Originals: `_source/photos-original/` (their photos) and `_source/site-stock/` (stock), both kept off GitHub.
