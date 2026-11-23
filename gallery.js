// Full gallery: every photo from newdesignproperties.com, filterable, with a previous/next lightbox.
import { PHOTOS } from "./gallery-data.js?v=20261123j";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const grid = $("#g-grid"), lb = $("#lightbox"), big = $("img", lb);
const own = PHOTOS.filter(p => !p.stock).length;
$("#g-count").textContent = `${PHOTOS.length} photos, ${own} of them our own jobs: kitchens and baths, decks, homes, rock beds, retaining walls and lawns.`;

grid.innerHTML = PHOTOS.map((p, i) => `<li data-c="${p.c}"><button class="g-tile" data-i="${i}" aria-label="Open photo: ${p.cap}">
  <img src="${p.thumb}" alt="${p.cap}" width="${p.w}" height="${p.h}" loading="${i < 8 ? "eager" : "lazy"}" decoding="async">
  ${p.stock ? '<mark class="confirm">Stock photo</mark>' : ""}<span class="g-tag">${p.cap}</span></button></li>`).join("");

// Filter
let shown = PHOTOS.map((_, i) => i);
$$(".g-seg button").forEach(b => b.addEventListener("click", () => {
  $$(".g-seg button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
  shown = [];
  $$("li", grid).forEach((li, i) => { const on = b.dataset.f === "all" || li.dataset.c === b.dataset.f; li.hidden = !on; if (on) shown.push(i); });
}));

// Lightbox: previous / next within the current filter, arrow keys and swipe
let at = 0;
function open(i) {
  at = shown.indexOf(i); show();
  if (lb.showModal) lb.showModal(); else window.open(PHOTOS[i].src, "_blank");
}
function show() {
  const p = PHOTOS[shown[at]];
  big.src = p.src; big.alt = p.cap;
  $(".g-cap", lb).textContent = p.cap + (p.stock ? " · stock photo" : "");
  $(".g-num", lb).textContent = `${at + 1} / ${shown.length}`;
  const n = PHOTOS[shown[(at + 1) % shown.length]]; new Image().src = n.src; // preload the next one
}
const step = d => { at = (at + d + shown.length) % shown.length; show(); };
grid.addEventListener("click", e => { const t = e.target.closest(".g-tile"); if (t) open(Number(t.dataset.i)); });
$(".g-prev", lb).addEventListener("click", () => step(-1));
$(".g-next", lb).addEventListener("click", () => step(1));
$(".lb-close", lb).addEventListener("click", () => lb.close());
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });
let x0 = null;
lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); x0 = null; });
