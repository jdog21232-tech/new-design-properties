import { initEstimate, ESTIMATE_HTML, CONTACTS } from "./estimate.js?v=20261122h";
import { SERVICES } from "./services.js?v=20261122h";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Estimate card (first screen)
const form = $("#estimate");
form.innerHTML = ESTIMATE_HTML;
initEstimate(form, { onTeam: t => { document.body.dataset.mode = t; } });

// Service pop-up: quick rundown + inquiry form addressed to the right line
const modal = $("#svc-modal"), sf = $("#svc-form");
let current = { name: "", team: "build" };
const v = n => (sf.elements[n].value || "").trim();
function contact() {
  if (current.team === "lawn") return CONTACTS.lawn;
  return v("area") === "Sioux Falls area" ? CONTACTS.buildSD : CONTACTS.buildMN;
}
function update() {
  const c = contact();
  const lines = [`Hi, I'm interested in ${current.name.toLowerCase()}.`, `Name: ${v("name")}`, `Phone: ${v("phone")}`];
  if (v("email")) lines.push(`Email: ${v("email")}`);
  lines.push(`Area: ${v("area")}`);
  if (v("msg")) lines.push(`Details: ${v("msg")}`);
  const body = encodeURIComponent(lines.join("\n"));
  $("#svc-text").href = `sms:${c.phone}?&body=${body}`;
  $("#svc-email").href = `mailto:${c.email}?subject=${encodeURIComponent("Inquiry: " + current.name)}&body=${body}`;
  $("#svc-to").textContent = `Goes to ${c.label} · ${c.show}`;
}
$$(".svc").forEach(b => b.addEventListener("click", () => {
  current = { name: b.dataset.svc, team: b.dataset.team };
  modal.dataset.team = current.team;
  $("#svc-tag").textContent = current.team === "lawn" ? "Lawn & Landscape" : "Build & Remodel";
  $("#svc-title").textContent = current.name;
  $("#svc-points").replaceChildren(...(SERVICES[current.name] || []).slice(0, 3).map(t => { const li = document.createElement("li"); li.textContent = t; return li; }));
  sf.elements.msg.placeholder = `Tell us a little about your ${current.name.toLowerCase()} project`;
  ["name", "phone"].forEach(n => { sf.elements[n].classList.remove("invalid"); sf.elements[n].removeAttribute("aria-invalid"); });
  update();
  modal.showModal ? modal.showModal() : null;
}));
sf.addEventListener("input", e => { if (e.target.value && e.target.value.trim()) e.target.classList.remove("invalid"); update(); });
sf.addEventListener("change", update);
sf.addEventListener("submit", e => e.preventDefault());
["#svc-text", "#svc-email"].forEach(id => $(id).addEventListener("click", e => {
  let ok = true;
  ["name", "phone"].forEach(n => {
    const el = sf.elements[n], bad = !el.value.trim();
    el.classList.toggle("invalid", bad); el.setAttribute("aria-invalid", bad);
    if (bad && ok) { el.focus(); ok = false; }
  });
  if (!ok) e.preventDefault(); else update();
}));
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

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
