// Shared free-estimate flow for Version 1 and Version 2.
// 4 steps: project -> area -> timing -> contact. Ends in a pre-filled text or email to the right line.
// Nothing is stored or sent by the site itself.
export const CONTACTS = {
  buildSD: { label: "Construction, Sioux Falls", phone: "+16056503214", show: "605-650-3214", email: "Jeffgenser@yahoo.com" },
  buildMN: { label: "Construction, Minnesota", phone: "+17635280872", show: "763-528-0872", email: "Jeffgenser@yahoo.com" },
  lawn:    { label: "Lawn & Landscape, SD", phone: "+16057281478", show: "605-728-1478", email: "Joshgenser@gmail.com" },
};

// Everything we do, in 8 groups. Picking a group fills its list of specific jobs, then Continue.
// Exactly 3 short jobs per group (one line each on a phone) so the panel keeps one height while people choose.
// (All 22 services from newdesignproperties.com are covered.) photo = img/<photo>.jpg shown behind the hero when picked;
// placeholder: true marks a free CC0 stand-in until New Design Properties sends their own photo.
export const GROUPS = [
  { name: "Kitchens & baths", photo: "kitchen-2", team: "build", jobs: ["Kitchen remodels", "Bathroom remodels", "Cabinets, counters and tile"] },
  { name: "Remodeling & finish work", photo: "great-room", team: "build", jobs: ["Renovations and remodels", "Finish carpentry and built-ins", "Basements and framing"] },
  { name: "Additions & new builds", photo: "ph-additions", placeholder: true, team: "build", jobs: ["Home additions and garages", "New homes and commercial builds", "Project management"] },
  { name: "Decks", photo: "deck-cedar", team: "build", jobs: ["Cedar and composite decks", "Stairs, railings and pergolas", "Deck repairs and rebuilds"] },
  { name: "Exteriors & storm repair", photo: "ph-exteriors", placeholder: true, team: "build", jobs: ["Siding and windows", "Roofing", "Storm damage repair"] },
  { name: "Repairs & handyman", photo: "ph-repairs", placeholder: true, team: "build", jobs: ["Handyman jobs", "Small repairs and fixes", "Doors, trim and drywall patches"] },
  { name: "Lawn care", photo: "lawn-hillside", team: "lawn", jobs: ["Lawn mowing and edging", "Bush trimming", "Seed and sodding"] },
  { name: "Landscaping & patios", photo: "paver-patio", team: "lawn", jobs: ["Landscaping and planting beds", "Paver patios", "Mulch and rock installs"] },
];
const esc = t => t.replace(/&/g, "&amp;");

export function initEstimate(form, { onTeam, onGroup } = {}) {
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
    if (val("email")) l.push(`Email: ${val("email")}`);
    if (val("comments")) l.push(`Comments: ${val("comments")}`);
    return l.join("\n");
  }
  function update() {
    const c = contact(), body = encodeURIComponent(message());
    text.href = `sms:${c.phone}?&body=${body}`;
    mail.href = `mailto:${c.email}?subject=${encodeURIComponent("Free estimate: " + val("project"))}&body=${body}`;
  }

  const detail = $(".est-detail");
  function openGroup(value) {
    const g = GROUPS.find(x => x.name === value);
    if (!g) return;
    detail.querySelector(".est-detail-title").textContent = g.name + " includes";
    detail.querySelector(".est-jobs").replaceChildren(...g.jobs.map(j => { const li = document.createElement("li"); li.textContent = j; return li; }));
    detail.dataset.team = g.team;
    detail.querySelector(".est-next").disabled = false;
    if (onGroup) onGroup(g);
  }
  form.addEventListener("change", e => {
    const t = e.target;
    if (t.type !== "radio") return;
    if (t.name === "project") { if (onTeam) onTeam(t.dataset.team); openGroup(t.value); return; }
    setTimeout(() => show(Math.min(cur + 1, steps.length)), 160);
  });
  $(".est-next").addEventListener("click", () => show(2));
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
      openGroup(value);
      show(2);
    },
  };
}

export const ESTIMATE_HTML = `
<div class="est-head"><div><p class="est-kicker">Everything we do</p><h2>Free estimate</h2></div><span class="est-count">Step 1 of 4</span></div>
<ol class="est-progress" aria-hidden="true"><li></li><li></li><li></li><li></li></ol>
<fieldset class="est-step" data-step="1">
  <legend>What do you need?</legend>
  <div class="tiles">
${GROUPS.map(g => `    <label><input type="radio" name="project" value="${esc(g.name)}" data-team="${g.team}"><span>${esc(g.name)}</span></label>`).join("\n")}
  </div>
  <div class="est-detail" aria-live="polite">
    <p class="est-detail-title">What's included</p>
    <ul class="est-jobs"><li class="ghost"><i></i></li><li class="ghost"><i></i></li><li class="ghost"><i></i></li></ul>
    <button type="button" class="btn btn-solid est-next" disabled>Continue</button>
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
    <label class="wide"><span>Email <span class="opt">(optional)</span></span><input name="email" type="email" autocomplete="email" inputmode="email"></label>
    <label class="wide"><span>Comments <span class="opt">(optional)</span></span><textarea name="comments" rows="3" placeholder="Tell us about the project: size, ideas, best time to call"></textarea></label>
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
