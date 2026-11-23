import { initEstimate, ESTIMATE_HTML, GROUPS } from "./estimate.js?v=20261123i";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Estimate card (first screen)
const form = $("#estimate");
form.innerHTML = ESTIMATE_HTML;
// Picking a service swaps the hero photo to matching work (cross-fade). Stand-in photos get a faint "photo needed" note.
const hero = $(".hero"), small = window.matchMedia("(max-width: 719px)");
let heroSrc = "img/kitchen-1.jpg";
// Where the subject sits across each photo (0 left, 1 right); phones show a tall slice centred there.
const FOCUS = { "kitchen-1": 0.45, "kitchen-2": 0.35, "great-room": 0.6, "home-front": 0.5, "deck-cedar": 0.42,
  "home-winter": 0.42, "stock-remodel": 0.55, "lawn-hillside": 0.5, "paver-patio": 0.45 };
const pos = key => `${(FOCUS[key] ?? 0.5) * 100}% 50%`;
function setHero(g) {
  if (!g.photo) return;
  const src = `img/${small.matches ? "sm/" : ""}${g.photo}.jpg`;
  hero.classList.toggle("is-ph", !!g.placeholder);
  $(".ph-note .ph-long").textContent = g.placeholder ? `Send us a photo of your own ${g.name.toLowerCase()} work for this spot.` : "";
  if (src === heroSrc) return;
  heroSrc = src;
  const im = new Image(); im.className = "hero-bg is-new"; im.alt = ""; im.src = src; im.style.objectPosition = pos(g.photo);
  im.decode().catch(() => {}).then(() => {
    if (heroSrc !== src) return;
    const old = $$(".hero-bg"); old[old.length - 1].after(im);
    requestAnimationFrame(() => requestAnimationFrame(() => im.classList.remove("is-new")));
    setTimeout(() => old.forEach(o => o.remove()), 700);
  });
}
initEstimate(form, { onTeam: t => { document.body.dataset.mode = t; }, onGroup: setHero });
GROUPS.forEach(g => { const i = new Image(); i.src = `img/${small.matches ? "sm/" : ""}${g.photo}.jpg`; }); // warm the cache so swaps are instant

// Work rail: filter + arrows
const rail = $("#rail");
$$(".seg button").forEach(b => b.addEventListener("click", () => {
  $$(".seg button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
  $$("li", rail).forEach(li => { li.hidden = !(b.dataset.f === "all" || li.dataset.c === b.dataset.f); });
  rail.scrollTo({ left: 0 });
}));
$$(".rail-btn").forEach(b => b.addEventListener("click", () => {
  rail.scrollBy({ left: Number(b.dataset.dir) * rail.clientWidth, behavior: "smooth" });
}));

// Lightbox
const lb = $("#lightbox");
$$(".ph").forEach(p => p.addEventListener("click", () => {
  $("#lb-img").src = p.dataset.full; $("#lb-img").alt = $("img", p).alt; $("#lb-cap").textContent = p.dataset.cap;
  lb.showModal ? lb.showModal() : window.open(p.dataset.full, "_blank");
}));
$("#lb-close").addEventListener("click", () => lb.close());
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
