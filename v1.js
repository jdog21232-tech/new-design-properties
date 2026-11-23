import { initEstimate, ESTIMATE_HTML } from "./estimate.js?v=20261122j";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Estimate card (first screen)
const form = $("#estimate");
form.innerHTML = ESTIMATE_HTML;
initEstimate(form, { onTeam: t => { document.body.dataset.mode = t; } });

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
