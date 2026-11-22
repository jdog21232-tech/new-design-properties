// New Design Properties draft: mode switch, gallery filter + lightbox, estimate flow, open-now chip.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const CONTACTS = {
    buildSD: { phone: "+16056503214", email: "Jeffgenser@yahoo.com" },
    buildMN: { phone: "+17635280872", email: "Jeffgenser@yahoo.com" },
    lawn:    { phone: "+16057281478", email: "Joshgenser@gmail.com" },
  };

  // Mode switch (Build & Remodel / Lawn & Landscape)
  const tabs = $$(".mode-switch [role=tab]");
  function setMode(mode, focus) {
    document.body.dataset.mode = mode;
    tabs.forEach(t => {
      const on = t.dataset.mode === mode;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
      if (on && focus) t.focus();
    });
    $("#sb-call").href = "tel:" + (mode === "lawn" ? CONTACTS.lawn : CONTACTS.buildSD).phone;
  }
  tabs.forEach(t => {
    t.addEventListener("click", () => setMode(t.dataset.mode));
    t.addEventListener("keydown", e => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setMode(document.body.dataset.mode === "build" ? "lawn" : "build", true);
      }
    });
  });

  // Gallery filter
  const items = $$("#gallery > li");
  $$(".filter").forEach(b => b.addEventListener("click", () => {
    $$(".filter").forEach(x => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", x === b); });
    const f = b.dataset.filter;
    items.forEach(li => { li.hidden = !(f === "all" || li.dataset.cat === f); });
  }));

  // Lightbox
  const lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap");
  $$(".shot").forEach(s => s.addEventListener("click", () => {
    const img = $("img", s);
    lbImg.src = s.dataset.full; lbImg.alt = img.alt; lbCap.textContent = $("span", s).textContent;
    if (lb.showModal) lb.showModal(); else window.open(s.dataset.full, "_blank");
  }));
  $("#lb-close").addEventListener("click", () => lb.close());
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });

  // Estimate flow
  const form = $("#est-form");
  const steps = $$(".est-step", form);
  const bars = $$(".est-progress li");
  const back = $("#est-back"), count = $("#est-count");
  let cur = 1;
  function show(n) {
    cur = n;
    steps.forEach(s => { s.hidden = Number(s.dataset.step) !== n; });
    bars.forEach((b, i) => b.classList.toggle("on", i < n));
    back.hidden = n === 1;
    count.textContent = `Step ${n} of ${steps.length}`;
    const first = $("input", steps[n - 1]);
    if (first && n > 1) first.focus({ preventScroll: true });
    if (n === steps.length) summarize();
  }
  form.addEventListener("change", e => {
    const t = e.target;
    if (t.type === "radio") {
      if (t.name === "project") setMode(t.dataset.team);
      setTimeout(() => show(Math.min(cur + 1, steps.length)), 180);
    }
  });
  back.addEventListener("click", () => show(cur - 1));

  const val = n => (form.elements[n] && form.elements[n].value || "").trim();
  function pick() {
    const p = form.querySelector("input[name=project]:checked");
    const team = p ? p.dataset.team : "build";
    if (team === "lawn") return CONTACTS.lawn;
    return val("area") === "Sioux Falls area" ? CONTACTS.buildSD : CONTACTS.buildMN;
  }
  function message() {
    const lines = [
      "Hi, I'd like a free estimate.",
      `Project: ${val("project")}`,
      `Area: ${val("area")}`,
      `Timing: ${val("when")}`,
      `Name: ${val("name")}`,
      `Phone: ${val("phone")}`,
    ];
    if (val("note")) lines.push(`Note: ${val("note")}`);
    return lines.join("\n");
  }
  function summarize() {
    $("#est-summary").textContent = `${val("project")} · ${val("area")} · ${val("when")}`;
    update();
  }
  function update() {
    const c = pick(), body = encodeURIComponent(message());
    $("#send-text").href = `sms:${c.phone}?&body=${body}`;
    $("#send-email").href = `mailto:${c.email}?subject=${encodeURIComponent("Free estimate request: " + val("project"))}&body=${body}`;
  }
  form.addEventListener("input", e => {
    if (e.target.classList && e.target.value.trim()) { e.target.classList.remove("invalid"); e.target.removeAttribute("aria-invalid"); }
    update();
  });
  ["#send-text", "#send-email"].forEach(id => $(id).addEventListener("click", e => {
    let ok = true;
    ["name", "phone"].forEach(n => {
      const el = form.elements[n], bad = !el.value.trim();
      el.classList.toggle("invalid", bad); el.setAttribute("aria-invalid", bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    if (!ok) e.preventDefault(); else update();
  }));

  // Open-now chip (Central Time, Mon to Fri 9 to 5)
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", hour12: false }).formatToParts(new Date());
    const wd = parts.find(p => p.type === "weekday").value;
    const hr = Number(parts.find(p => p.type === "hour").value) % 24;
    const open = !["Sat", "Sun"].includes(wd) && hr >= 9 && hr < 17;
    if (open) $("#open-now").textContent = "Open now · Family-owned since 2003";
  } catch (_) { /* keep default text */ }
})();
