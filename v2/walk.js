// Version 2: walk *into* New Design Properties' own photos.
// Each photo is rebuilt as a simple 3D room (floor, walls, ceiling, and depth cards for near objects such as an
// island, sofa, bed or tree), measured from the photo's own perspective. The photo is then projected onto that room
// from the exact point it was taken ("Tour Into the Picture"). Standing at that point you see the photo itself;
// stepping forward gives true parallax. Scrolling walks you into one photo and on into the next.
import * as THREE from "../vendor/three.module.min.js";
import { initEstimate, ESTIMATE_HTML } from "../estimate.js?v=20261123b";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = "../img/";

const form = $("#estimate");
form.innerHTML = ESTIMATE_HTML;
const estimate = initEstimate(form, { onTeam: t => { document.body.dataset.mode = t; } });

// ------------------------------------------------------------------ measured rooms
// Image coordinates: u 0..1 left to right, v 0..1 bottom to top. vy = horizon (eye level).
// walls: floor lines [u1, v1, u2, v2]. ceil: v of the ceiling line on the first wall. cards: near objects,
// standing on the floor at contact v (c) or at a set depth in metres (z).
const ROOMS = {
  "lawn-front": { aspect: 1, hfov: 62, h: 1.3, vy: 0.66, walls: [[-0.1, 0.58, 1.1, 0.58]],
    cards: [{ u: [0.765, 0.925], v: [0.12, 1.02], c: 0.17 }] },
  "kitchen-1": { aspect: 1400 / 927, hfov: 80, h: 1.4, vy: 0.47, ceil: 0.66,
    walls: [[0.08, 0.345, 0.68, 0.35], [0.6, 0.207, 1.06, 0.03], [-0.08, 0.2, 0.11, 0.335]],
    cards: [{ u: [-0.02, 0.72], v: [-0.02, 0.335], z: 2.5 }, { u: [0.17, 0.25], v: [0.7, 1.02], z: 2.3 }, { u: [0.44, 0.52], v: [0.66, 1.02], z: 3.2 }] },
  "great-room": { aspect: 1400 / 927, hfov: 80, h: 1.4, vy: 0.5, ceil: 0.66,
    walls: [[-0.1, 0.36, 0.53, 0.37], [0.5, 0.33, 1.1, 0.31]],
    cards: [{ u: [0.1, 0.37], v: [0.33, 0.53], c: 0.335 }, { u: [0.5, 0.9], v: [0.21, 0.47], c: 0.21 }, { u: [0.865, 0.975], v: [0.31, 0.66], c: 0.31 },
      { u: [0.39, 0.58], v: [0.12, 0.31], c: 0.12 }, { u: [0.55, 1.02], v: [-0.02, 0.27], z: 1.7 }, { u: [0.4, 0.57], v: [0.84, 1.02], z: 4.0 }] },
  "living-2": { aspect: 1400 / 927, hfov: 80, h: 1.4, vy: 0.5, ceil: 0.73,
    walls: [[0.21, 0.355, 0.71, 0.36], [-0.1, -0.1, 0.21, 0.355], [0.7, 0.18, 1.1, 0.17]],
    cards: [{ u: [0.45, 0.84], v: [0.16, 0.47], c: 0.165 }, { u: [0.38, 0.56], v: [0.12, 0.34], c: 0.13 }, { u: [0.8, 1.02], v: [-0.02, 0.62], c: 0.03 }, { u: [0.42, 0.81], v: [-0.02, 0.33], z: 1.8 }] },
  "bedroom": { aspect: 1400 / 927, hfov: 80, h: 1.3, vy: 0.55, ceil: 0.74,
    walls: [[0.47, 0.365, 1.1, 0.28], [-0.1, 0.29, 0.47, 0.365]],
    cards: [{ u: [0.13, 0.26], v: [0.3, 0.67], c: 0.32 }, { u: [0.4, 0.775], v: [0.1, 0.45], c: 0.1 }, { u: [0.82, 0.98], v: [0.13, 0.55], c: 0.135 }, { u: [-0.02, 0.235], v: [-0.02, 0.47], z: 2.2 }, { u: [0.455, 0.555], v: [0.81, 0.95], z: 3.0 }] },
  "wet-bar": { aspect: 1400 / 927, hfov: 80, h: 1.4, vy: 0.5, ceil: 0.87,
    walls: [[0.4, 0.25, 0.82, 0.25], [-0.1, 0.0, 0.43, 0.185], [0.79, 0.22, 1.1, 0.22]],
    cards: [{ u: [0.6, 1.02], v: [-0.02, 0.48], z: 2.7 }, { u: [0.475, 0.75], v: [-0.02, 0.4], z: 2.1 }] },
  "deck-cedar": { aspect: 4 / 3, hfov: 60, h: 1.6, vy: 0.56, walk: 0.5, walls: [[-0.1, 0.43, 0.62, 0.44], [0.6, 0.47, 1.1, 0.47]],
    cards: [{ u: [0.13, 0.4], v: [0.33, 0.75], c: 0.36 }, { u: [0.4, 0.98], v: [0.33, 1.02], c: 0.36 }, { u: [0.28, 0.66], v: [0.15, 0.62], c: 0.17 }] },
  "paver-patio": { aspect: 1, hfov: 62, h: 1.6, vy: 0.755, walls: [[-0.1, 0.745, 1.1, 0.745], [0.88, 0.655, 1.1, 0.65]],
    cards: [{ u: [0.11, 0.68], v: [-0.02, 0.3], c: 0.03 }, { u: [0.74, 1.02], v: [-0.02, 0.29], c: 0.03 }] },
  "lawn-hillside": { aspect: 1400 / 1054, hfov: 66, h: 1.6, vy: 0.69, walls: [[-0.1, 0.645, 1.1, 0.645]], cards: [] },
};
// Scroll stops. Consecutive stops in the same room keep walking instead of cross-fading.
const STOPS = ["lawn-front", "kitchen-1", "great-room", "living-2", "bedroom", "wet-bar", "deck-cedar", "paver-patio", "lawn-hillside", "lawn-hillside"];
const N = STOPS.length;
const DUST = new Set(["kitchen-1", "great-room", "living-2", "bedroom", "wet-bar"]);

// ------------------------------------------------------------------ renderer (or flat fallback)
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas: $("#scene"), antialias: true, powerPreference: "high-performance" }); } catch (e) { renderer = null; }
if (!renderer) {
  document.body.classList.add("flat");
  $$(".stop").forEach((c, i) => { if (i < N - 1) { const im = new Image(); im.src = IMG + STOPS[i] + ".jpg"; im.alt = ""; im.className = "flat-photo"; c.prepend(im); } });
  $("#loader").classList.add("done");
  throw new Error("WebGL unavailable, showing flat page");
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.autoClear = false;
renderer.setClearColor(0x15171a, 1);
const maxAniso = renderer.capabilities.getMaxAnisotropy();
const camera = new THREE.PerspectiveCamera();
camera.matrixAutoUpdate = true;

// ------------------------------------------------------------------ projective photo material
const VERT = `
  varying vec3 vWorld;
  void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FRAG = `
  uniform sampler2D map; uniform mat4 photoVP; uniform float ready;
  varying vec3 vWorld;
  void main() {
    vec4 p = photoVP * vec4(vWorld, 1.0);
    vec2 uv = p.xy / max(p.w, 1e-4) * 0.5 + 0.5;
    vec2 o = max(max(-uv, uv - 1.0), 0.0);
    float out_ = length(o);
    vec3 col = texture2D(map, clamp(uv, 0.002, 0.998)).rgb;
    col = mix(col, col * 0.55, smoothstep(0.0, 0.12, out_));
    gl_FragColor = vec4(mix(vec3(0.0824, 0.0902, 0.102), col, ready), 1.0);
    #include <colorspace_fragment>
  }`;

const loader = new THREE.TextureLoader();
function photoProjection(r) { // off-axis camera through the horizon: verticals stay vertical, like the photo
  const t = Math.tan(THREE.MathUtils.degToRad(r.hfov / 2)) / r.aspect, Hp = 2 * t, Wp = r.aspect * Hp;
  r.Hp = Hp; r.Wp = Wp;
  const n = 0.05, f = 2000;
  return new THREE.Matrix4().makePerspective(-0.5 * Wp * n, 0.5 * Wp * n, (1 - r.vy) * Hp * n, -r.vy * Hp * n, n, f);
}
const floorPt = (r, u, v) => { const z = r.h / Math.max((r.vy - v) * r.Hp, 1e-3); return new THREE.Vector3((u - 0.5) * r.Wp * z, -r.h, -z); };

function buildRoom(key) {
  const r = ROOMS[key];
  const proj = photoProjection(r);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, photoVP: { value: proj }, ready: { value: 0 } },
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide,
  });
  const tex = loader.load(IMG + key + ".jpg", t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; t.minFilter = THREE.LinearMipmapLinearFilter; mat.uniforms.map.value = t; mat.uniforms.ready.value = 1; r.loaded = true; onLoaded(); });
  const g = new THREE.Group(); g.visible = false;
  const quad = (a, b, c, d) => { // four corners, counter-clockwise
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([...a.toArray(), ...b.toArray(), ...c.toArray(), ...a.toArray(), ...c.toArray(), ...d.toArray()], 3));
    g.add(new THREE.Mesh(geo, mat));
  };
  // ceiling height from the first wall's top line
  const w0 = r.walls[0], z0 = (floorPt(r, w0[0], w0[1]).z + floorPt(r, w0[2], w0[3]).z) / 2;
  const top = r.ceil ? (r.ceil - r.vy) * r.Hp * -z0 : 60;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  quad(V(-80, -r.h, 4), V(80, -r.h, 4), V(80, -r.h, -400), V(-80, -r.h, -400));                       // floor
  if (r.ceil) quad(V(-80, top, 4), V(-80, top, -400), V(80, top, -400), V(80, top, 4));               // ceiling
  for (const [u1, v1, u2, v2] of r.walls) {
    const a = floorPt(r, u1, v1), b = floorPt(r, u2, v2);
    const ext = 0.04, d = b.clone().sub(a);
    a.addScaledVector(d, -ext); b.addScaledVector(d, ext);
    quad(a, b, V(b.x, top, b.z), V(a.x, top, a.z));
  }
  quad(V(-600, -60, -1500), V(600, -60, -1500), V(600, 400, -1500), V(-600, 400, -1500));              // far backdrop
  for (const c of r.cards) {
    const z = c.z ?? r.h / ((r.vy - c.c) * r.Hp);
    const x0 = (c.u[0] - 0.5) * r.Wp * z, x1 = (c.u[1] - 0.5) * r.Wp * z;
    const y0 = c.c !== undefined ? -r.h : Math.max(-r.h, (c.v[0] - r.vy) * r.Hp * z), y1 = (c.v[1] - r.vy) * r.Hp * z;
    quad(V(x0, y0, -z), V(x1, y0, -z), V(x1, y1, -z), V(x0, y1, -z));
  }
  // how far we can walk in without passing through a near object in the middle of the view
  const centreCards = r.cards.filter(c => c.u[0] < 0.7 && c.u[1] > 0.3).map(c => c.z ?? r.h / ((r.vy - c.c) * r.Hp));
  const wallZ = Math.min(...r.walls.map(([u1, v1, u2, v2]) => Math.min(-floorPt(r, u1, v1).z, -floorPt(r, u2, v2).z)));
  r.travel = Math.min(centreCards.length ? 0.62 * Math.min(...centreCards) : 99, 0.32 * wallZ, 3.2) * 0.8 * (r.walk ?? 1); // lower-res photos walk less
  if (DUST.has(key)) g.add(dust(r, top));
  r.group = g; r.mat = mat; r.tex = tex;
  return g;
}

// floating dust in the light: a little air in each interior room
let dustTex;
function dust(r, top) {
  if (!dustTex) {
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,248,235,1)"); gr.addColorStop(1, "rgba(255,248,235,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64); dustTex = new THREE.CanvasTexture(c);
  }
  const n = 260, pos = new Float32Array(n * 3), depth = Math.max(4, r.travel + 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 4; pos[i * 3 + 1] = -r.h + 0.3 + Math.random() * (Math.min(top, 2) + r.h - 0.3); pos[i * 3 + 2] = -0.6 - Math.random() * depth; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.014, map: dustTex, transparent: true, opacity: 0.38, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  p.userData.dust = true;
  return p;
}

const scenes = {};
for (const key of new Set(STOPS)) { const s = new THREE.Scene(); s.add(buildRoom(key)); scenes[key] = s; }

// ------------------------------------------------------------------ cross-fade compositing
let rt = null;
const fadeMat = new THREE.ShaderMaterial({
  uniforms: { tex: { value: null }, alpha: { value: 0 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  fragmentShader: "uniform sampler2D tex; uniform float alpha; varying vec2 vUv; void main(){ vec4 c = texture2D(tex, vUv); gl_FragColor = vec4(c.rgb, alpha);\n#include <colorspace_fragment>\n}",
  transparent: true, depthTest: false, depthWrite: false,
});
const fadeScene = new THREE.Scene(), fadeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMat));

// ------------------------------------------------------------------ camera inside a room
const state = { W: 1, H: 1 };
const HOLD = 0; // each stop rests exactly where the photo was taken, so it shows the real photo, seam-free
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2();
let clock = 0;

// Lens window: crop of the photo that fills this screen (cover), 6% inset for parallax room.
// Phones pan across the photo as you walk; wide screens show it whole.
function setCamera(key, p, sway) {
  const r = ROOMS[key];
  const n = 0.05, inset = 0.94, Hp = r.Hp, Wp = r.Wp, A = state.W / state.H;
  let halfW, halfH, cx, cy;
  if (A < r.aspect) { halfH = Hp / 2 * inset; halfW = halfH * A; const lim = Wp / 2 - halfW; cx = THREE.MathUtils.lerp(-lim, lim, 0.15 + 0.7 * smooth(0, 1, p)); cy = (0.5 - r.vy) * Hp; }
  else { halfW = Wp / 2 * inset; halfH = halfW / A; const lim = Hp / 2 - halfH; cx = 0; cy = THREE.MathUtils.clamp(0, (0.5 - r.vy) * Hp - lim, (0.5 - r.vy) * Hp + lim); }
  camera.projectionMatrix.makePerspective((cx - halfW) * n, (cx + halfW) * n, (cy + halfH) * n, (cy - halfH) * n, n, 2000);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  const L = r.travel, breathe = reduce ? 0 : 0.012 * L;
  const x = (sway * L * 0.1 + pointerS.x * 0.05 * L + Math.sin(clock * 0.5) * breathe) * p;
  const y = (-pointerS.y * 0.03 * L + Math.sin(clock * 0.37) * breathe * 0.6) * p;
  camera.position.set(x, y, -L * p);
  camera.rotation.set(0, 0, 0);
  camera.updateMatrixWorld(true);
}

function draw(s) {
  const i = Math.min(Math.floor(s), N - 2), f = s - i;
  const A = STOPS[i], B = STOPS[i + 1];
  renderer.setRenderTarget(null); renderer.clear();
  const showDust = (key, on) => scenes[key].traverse(o => { if (o.userData.dust) { o.visible = on; o.rotation.y = clock * 0.01; o.position.y = Math.sin(clock * 0.2) * 0.05; } });
  if (A === B) { // same photo: keep walking in
    const p = THREE.MathUtils.lerp(HOLD, 0.92, smooth(0, 1, f));
    ROOMS[A].group.visible = true; showDust(A, true); setCamera(A, p, i % 2 ? 1 : -1); renderer.render(scenes[A], camera);
    return { a: 0, room: A };
  }
  const pA = THREE.MathUtils.lerp(HOLD, 1, smooth(0, 0.72, f));
  const pB = 0; // the next photo fades in exactly as it was taken
  const alpha = smooth(0.4, 0.74, f);
  ROOMS[A].group.visible = true; showDust(A, true); setCamera(A, pA, i % 2 ? 1 : -1); renderer.render(scenes[A], camera);
  if (alpha > 0.001) {
    ROOMS[B].group.visible = true; showDust(B, true);
    renderer.setRenderTarget(rt); renderer.clear(); setCamera(B, pB, (i + 1) % 2 ? 1 : -1); renderer.render(scenes[B], camera);
    renderer.setRenderTarget(null); fadeMat.uniforms.tex.value = rt.texture; fadeMat.uniforms.alpha.value = alpha; renderer.render(fadeScene, fadeCam);
  }
  return { a: alpha, room: alpha > 0.5 ? B : A };
}

// ------------------------------------------------------------------ scroll, cards, rail
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// One stop per scroll-track section, measured from the sections themselves so snap points and stops always agree
// (on phones the toolbar changes innerHeight, which used to leave the walk half way between two photos).
const secs = $$(".track section");
const stopPx = () => Math.max(1, secs[0].offsetHeight);
let sTarget = 0, sCur = 0;
const readScroll = () => { sTarget = THREE.MathUtils.clamp(window.scrollY / stopPx(), 0, N - 1); };
let lastOn = -1;
const cards = $$(".stop"), railBtns = $$(".rooms button"), dim = $("#dim");
function updateUI(s) {
  cards.forEach((c, i) => {
    const d = s - i, a = THREE.MathUtils.clamp(1 - (Math.abs(d) - 0.1) / 0.28, 0, 1);
    c.style.opacity = a.toFixed(3); c.style.visibility = a > 0.001 ? "visible" : "hidden";
    const shift = (-d * 24).toFixed(1);
    c.style.transform = state.W >= 1024 ? `translateY(calc(-50% + ${shift}px))` : `translateY(${shift}px)`;
    c.classList.toggle("live", a > 0.5);
  });
  const on = Math.round(s);
  if (on !== lastOn) { lastOn = on; cards.forEach(c => { c.classList.remove("open"); c.querySelector(".more")?.setAttribute("aria-expanded", "false"); }); }
  railBtns.forEach((b, i) => { b.classList.toggle("on", i === on); b.classList.toggle("past", i < on); b.setAttribute("aria-current", i === on ? "step" : "false"); });
  dim.style.opacity = (smooth(N - 2, N - 1, s) * 0.55).toFixed(3);
  const lawn = ["paver-patio", "lawn-hillside", "lawn-front"].includes(STOPS[on]) && on > 0;
  document.body.dataset.mode = lawn ? "lawn" : (form.querySelector("input[name=project]:checked")?.dataset.team || "build");
}
function resize() {
  state.W = window.innerWidth; state.H = window.innerHeight;
  const z = state.W >= 1024 ? Math.min(2.8, Math.max(1, Math.min(state.W / 1440, state.H / 860))) : 1;
  document.documentElement.style.setProperty("--z", z.toFixed(4));
  renderer.setSize(state.W, state.H, false);
  const pr = renderer.getPixelRatio();
  if (rt) rt.dispose();
  rt = new THREE.WebGLRenderTarget(Math.round(state.W * pr), Math.round(state.H * pr), { colorSpace: THREE.SRGBColorSpace });
}

let last = performance.now();
function tick(now = performance.now()) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
  const k = reduce || document.hidden ? 1 : 1 - Math.pow(0.0015, dt * 0.5); // half speed: an unhurried walk between stops
  sCur += (sTarget - sCur) * k; if (Math.abs(sTarget - sCur) < 1e-4) sCur = sTarget;
  pointerS.lerp(pointer, 1 - Math.pow(0.02, dt));
  for (const key in ROOMS) if (ROOMS[key].group) ROOMS[key].group.visible = false;
  draw(sCur); updateUI(sCur);
}
function frame(now) { tick(now); requestAnimationFrame(frame); }

let firstReady = false;
function onLoaded() {
  if (!firstReady && ROOMS[STOPS[0]].loaded) { firstReady = true; $("#loader").classList.add("done"); }
  if (document.hidden) tick();
}

// ------------------------------------------------------------------ input
window.addEventListener("scroll", () => { readScroll(); if (document.hidden) tick(); }, { passive: true });
window.addEventListener("resize", () => { resize(); readScroll(); tick(); });
window.addEventListener("pointermove", ev => { if (ev.pointerType === "mouse") pointer.set((ev.clientX / state.W) * 2 - 1, (ev.clientY / state.H) * 2 - 1); }, { passive: true });
window.addEventListener("deviceorientation", ev => { if (ev.gamma == null) return; pointer.set(THREE.MathUtils.clamp(ev.gamma / 25, -1, 1), THREE.MathUtils.clamp((ev.beta - 45) / 25, -1, 1)); }, { passive: true });
$$("[data-go]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); if (b.dataset.project) estimate.preset(b.dataset.project); window.scrollTo({ top: secs[Number(b.dataset.go)].offsetTop, behavior: reduce ? "auto" : "smooth" }); }));

// Slim phone cards: wrap each call-to-action with a Details button that opens the bullet list.
$$(".stop").forEach(c => {
  const cta = c.querySelector(".stop-cta"), pts = c.querySelector(".points");
  if (!cta || !pts) return;
  const row = document.createElement("div"); row.className = "stop-row";
  const more = document.createElement("button"); more.type = "button"; more.className = "more"; more.textContent = "Details"; more.setAttribute("aria-expanded", "false");
  more.addEventListener("click", () => { const o = c.classList.toggle("open"); more.setAttribute("aria-expanded", o); });
  cta.before(row); row.append(more, cta);
});

resize(); readScroll(); sCur = sTarget; tick();
setTimeout(() => $("#loader").classList.add("done"), 4000); // never leave the loader up
requestAnimationFrame(frame);
