// Gallery: the 10 best photos up front, then every other photo in collapsed groups with subtitles
// (open one, or "Expand all"). The lightbox steps through the group you opened it from.
import { PHOTOS } from "./gallery-data.js?v=20261123m";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// The strongest photo of each kind of work, in the order they read best.
const BEST = [
  "img/kitchen-1.jpg", "img/gallery/fb/fb-122215263470302949.jpg", "img/great-room.jpg", "img/deck-cedar.jpg",
  "img/gallery/fb/fb-122231688872302949.jpg", "img/gallery/bathroom.jpg", "img/gallery/home-front.jpg",
  "img/gallery/fb/fb-122186425292302949.jpg", "img/wet-bar.jpg", "img/gallery/white-rock-1.jpg",
];
const GROUPS = [
  { key: "inside", title: "Kitchens & interiors", test: p => !p.stock && p.c === "inside" },
  { key: "decks", title: "Decks", test: p => !p.stock && p.c === "decks" },
  { key: "exteriors", title: "Homes & exteriors", test: p => !p.stock && p.c === "exteriors" },
  { key: "yard", title: "Lawn & landscape", test: p => !p.stock && p.c === "yard" },
  { key: "stock", title: "Stock pictures", test: p => p.stock,
    note: '<p class="confirm-note"><mark class="confirm">Stock photo</mark> These are pictures the current website uses on its service pages, not New Design jobs. Swap in your own when you can.</p>' },
];

const own = PHOTOS.filter(p => !p.stock).length;
$("#g-count").textContent = `${PHOTOS.length} photos, ${own} of them our own jobs. Our 10 favourites are below; open a group to see the rest.`;

const lists = {};   // group key -> photo indexes, used by the lightbox
const tile = (i, g, eager) => { const p = PHOTOS[i]; return `<li><button class="g-tile" data-i="${i}" data-g="${g}" aria-label="Open photo: ${p.cap}">
  <img src="${p.thumb}" alt="${p.cap}" width="${p.w}" height="${p.h}" loading="${eager ? "eager" : "lazy"}" decoding="async">
  ${p.stock ? '<mark class="confirm">Stock photo</mark>' : ""}<span class="g-tag">${p.cap}</span></button></li>`; };

const best = BEST.map(src => PHOTOS.findIndex(p => p.src === src)).filter(i => i >= 0);
lists.best = best;
$("#g-best").innerHTML = best.map((i, k) => tile(i, "best", k < 4)).join("");

$("#g-groups").innerHTML = GROUPS.map(G => {
  const idx = PHOTOS.map((p, i) => i).filter(i => G.test(PHOTOS[i]) && !best.includes(i));
  lists[G.key] = idx;
  if (!idx.length) return "";
  return `<details class="g-group" data-g="${G.key}"><summary><span class="g-group-t">${G.title}</span><span class="g-group-n">${idx.length} photo${idx.length > 1 ? "s" : ""}</span></summary>
    ${G.note || ""}<ul class="g-grid">${idx.map(i => tile(i, G.key, false)).join("")}</ul></details>`;
}).join("");

// Expand all / Collapse all
const allBtn = $(".g-all"), groups = $$(".g-group");
const sync = () => { const open = groups.every(d => d.open); allBtn.textContent = open ? "Collapse all" : "Expand all"; allBtn.setAttribute("aria-expanded", open); };
allBtn.addEventListener("click", () => { const open = !groups.every(d => d.open); groups.forEach(d => { d.open = open; }); sync(); });
groups.forEach(d => d.addEventListener("toggle", sync));

// Lightbox: previous / next within the group the photo came from, arrow keys and swipe
const lb = $("#lightbox"), big = $("img", lb);
let shown = [], at = 0;
function show() {
  const p = PHOTOS[shown[at]];
  big.src = p.src; big.alt = p.cap;
  $(".g-cap", lb).textContent = p.cap + (p.stock ? " · stock photo" : "");
  $(".g-num", lb).textContent = `${at + 1} / ${shown.length}`;
  new Image().src = PHOTOS[shown[(at + 1) % shown.length]].src; // preload the next one
}
const step = d => { at = (at + d + shown.length) % shown.length; show(); };
document.addEventListener("click", e => {
  const t = e.target.closest(".g-tile"); if (!t) return;
  shown = lists[t.dataset.g]; at = shown.indexOf(Number(t.dataset.i)); show();
  if (lb.showModal) lb.showModal(); else window.open(PHOTOS[shown[at]].src, "_blank");
});
$(".g-prev", lb).addEventListener("click", () => step(-1));
$(".g-next", lb).addEventListener("click", () => step(1));
$(".lb-close", lb).addEventListener("click", () => lb.close());
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });
let x0 = null;
lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); x0 = null; });
