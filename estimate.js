// Shared free-estimate flow for Version 1 and Version 2.
// 4 steps: project -> area -> timing -> contact. Ends in a pre-filled text or email to the right line.
// Nothing is stored or sent by the site itself.
export const CONTACTS = {
  buildSD: { label: "Construction, Sioux Falls", phone: "+16056503214", show: "605-650-3214", email: "Jeffgenser@yahoo.com" },
  buildMN: { label: "Construction, Minnesota", phone: "+17635280872", show: "763-528-0872", email: "Jeffgenser@yahoo.com" },
  lawn:    { label: "Lawn & Landscape, SD", phone: "+16057281478", show: "605-728-1478", email: "Joshgenser@gmail.com" },
};

export function initEstimate(form, { onTeam } = {}) {
  const $ = s => form.querySelector(s);
  const steps = [...form.querySelectorAll(".est-step")];
  const bars = [...form.querySelectorAll(".est-progress li")];
  const back = $(".est-back"), count = $(".est-count");
  const text = $(".send-text"), mail = $(".send-email"), summary = $(".est-summary");
  let cur = 1;

  const val = n => (form.elements[n] && form.elements[n].value || "").trim();
  const team = () => { const p = form.querySelector("input[name=project]:checked"); return p ? p.dataset.team : "build"; };
  const contact = () => team() === "lawn" ? CONTACTS.lawn : (val("area") === "Twin Cities" || val("area") === "Southwest MN" ? CONTACTS.buildMN : CONTACTS.buildSD);

  function show(n) {
    cur = n;
    steps.forEach(s => { s.hidden = Number(s.dataset.step) !== n; });
    bars.forEach((b, i) => b.classList.toggle("on", i < n));
    back.hidden = n === 1;
    count.textContent = `Step ${n} of ${steps.length}`;
    if (n === steps.length) { summary.textContent = `${val("project")} · ${val("area")} · ${val("when")}`; update(); }
  }
  function message() {
    const l = ["Hi, I'd like a free estimate.", `Project: ${val("project")}`, `Area: ${val("area")}`, `Timing: ${val("when")}`, `Name: ${val("name")}`, `Phone: ${val("phone")}`];
    return l.join("\n");
  }
  function update() {
    const c = contact(), body = encodeURIComponent(message());
    text.href = `sms:${c.phone}?&body=${body}`;
    mail.href = `mailto:${c.email}?subject=${encodeURIComponent("Free estimate: " + val("project"))}&body=${body}`;
  }

  form.addEventListener("change", e => {
    const t = e.target;
    if (t.type !== "radio") return;
    if (t.name === "project" && onTeam) onTeam(t.dataset.team);
    setTimeout(() => show(Math.min(cur + 1, steps.length)), 160);
  });
  form.addEventListener("input", e => {
    if (e.target.value && e.target.value.trim()) { e.target.classList.remove("invalid"); e.target.removeAttribute("aria-invalid"); }
    update();
  });
  form.addEventListener("submit", e => e.preventDefault());
  back.addEventListener("click", () => show(cur - 1));
  [text, mail].forEach(a => a.addEventListener("click", e => {
    let ok = true;
    ["name", "phone"].forEach(n => {
      const el = form.elements[n], bad = !el.value.trim();
      el.classList.toggle("invalid", bad); el.setAttribute("aria-invalid", bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    if (!ok) e.preventDefault(); else update();
  }));
  show(1);
  // Jump straight in with a project already picked (Version 2 room cards use this).
  return {
    preset(value) {
      const r = [...form.querySelectorAll("input[name=project]")].find(i => i.value === value);
      if (!r) return show(1);
      r.checked = true;
      if (onTeam) onTeam(r.dataset.team);
      show(2);
    },
  };
}

export const ESTIMATE_HTML = `
<div class="est-head"><h2>Free estimate</h2><span class="est-count">Step 1 of 4</span></div>
<ol class="est-progress" aria-hidden="true"><li></li><li></li><li></li><li></li></ol>
<fieldset class="est-step" data-step="1">
  <legend>What's the project?</legend>
  <div class="tiles">
    <label><input type="radio" name="project" value="Bathroom or kitchen" data-team="build"><span>Bath or kitchen</span></label>
    <label><input type="radio" name="project" value="Deck or patio" data-team="build"><span>Deck or patio</span></label>
    <label><input type="radio" name="project" value="Addition or new build" data-team="build"><span>Addition or new build</span></label>
    <label><input type="radio" name="project" value="Siding, windows or roof" data-team="build"><span>Siding, windows, roof</span></label>
    <label><input type="radio" name="project" value="Repair or handyman job" data-team="build"><span>Repair or handyman</span></label>
    <label><input type="radio" name="project" value="Remodel or renovation" data-team="build"><span>Remodel or renovation</span></label>
    <label><input type="radio" name="project" value="Lawn or landscaping" data-team="lawn"><span>Lawn or landscaping</span></label>
  </div>
</fieldset>
<fieldset class="est-step" data-step="2" hidden>
  <legend>Where is it?</legend>
  <div class="tiles tiles-1">
    <label><input type="radio" name="area" value="Sioux Falls area"><span>Sioux Falls area</span></label>
    <label><input type="radio" name="area" value="Twin Cities"><span>Twin Cities</span></label>
    <label><input type="radio" name="area" value="Southwest MN"><span>Southwest MN</span></label>
  </div>
</fieldset>
<fieldset class="est-step" data-step="3" hidden>
  <legend>When?</legend>
  <div class="tiles tiles-1">
    <label><input type="radio" name="when" value="As soon as possible"><span>As soon as possible</span></label>
    <label><input type="radio" name="when" value="In the next 1 to 3 months"><span>Next 1 to 3 months</span></label>
    <label><input type="radio" name="when" value="Just planning"><span>Just planning</span></label>
  </div>
</fieldset>
<fieldset class="est-step" data-step="4" hidden>
  <legend>How do we reach you?</legend>
  <div class="fields">
    <label>Name<input name="name" autocomplete="name" required></label>
    <label>Phone<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label>
  </div>
  <p class="est-summary" aria-live="polite"></p>
  <div class="est-send">
    <a class="btn btn-solid send-text" href="#">Text it to us</a>
    <a class="btn btn-ghost send-email" href="#">Email</a>
  </div>
</fieldset>
<div class="est-foot">
  <button type="button" class="est-back" hidden>Back</button>
  <span class="fine">Estimates are free</span>
</div>`;
