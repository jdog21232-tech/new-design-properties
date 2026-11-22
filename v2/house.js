// Version 2: scroll-driven walk through a house built from New Design Properties' own work.
// Units are metres. Floor top at y = 0.3, walls 3 m, house 12 x 12, front door at z = 0, back door at z = -12.
// Every photo wall is laid out on an exact grid and every camera stop looks at it dead level and square-on;
// the camera distance is solved from the field of view so the photos fill the free part of the screen.
import * as THREE from "../vendor/three.module.min.js";
import { initEstimate, ESTIMATE_HTML } from "../estimate.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = "../img/sm/", FULL = "../img/";

// ------------------------------------------------------------------ estimate form (works with or without 3D)
const form = $("#estimate");
form.innerHTML = ESTIMATE_HTML;
initEstimate(form, { onTeam: t => { document.body.dataset.mode = t; } });

// ------------------------------------------------------------------ photos (aspect = width / height)
const PHOTOS = {
  "kitchen-1": [1400 / 927, "Kitchen island"], "kitchen-2": [1400 / 927, "Kitchen"],
  "great-room": [1400 / 927, "Great room"], "living-2": [1400 / 927, "Living room"],
  "bedroom": [1400 / 927, "Bedroom"], "wet-bar": [1400 / 927, "Finish carpentry"],
  "deck-composite-2": [480 / 640, "Composite deck"], "deck-composite-1": [360 / 480, "Deck stairs"], "deck-cedar": [1024 / 768, "Cedar deck"],
  "lawn-front": [1, "Lawn care"], "paver-patio": [1, "Paver patio"], "rock-bed": [1, "Rock and edging"], "lawn-hillside": [1400 / 1054, "Backyard lawn"],
};

// ------------------------------------------------------------------ WebGL or flat fallback
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $("#scene"), antialias: true, powerPreference: "high-performance" });
} catch (e) { renderer = null; }
if (!renderer) { flat(); throw new Error("WebGL unavailable, showing flat page"); }

function flat() {
  document.body.classList.add("flat");
  $$(".stop[data-photos]").forEach(card => {
    const wrap = document.createElement("div"); wrap.className = "flat-photos";
    card.dataset.photos.split(",").forEach(k => { const i = new Image(); i.src = IMG + k + ".jpg"; i.alt = PHOTOS[k][1]; i.loading = "lazy"; wrap.append(i); });
    card.append(wrap);
  });
  $("#loader").classList.add("done");
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
const SKY = 0xd8e4ec;
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 70, 220);
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 400);

scene.add(new THREE.HemisphereLight(0xffffff, 0xa89c84, 2.0));
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
sun.position.set(14, 22, 16);
scene.add(sun);
for (const z of [-2, -6, -10]) { const l = new THREE.PointLight(0xffe7c4, 10, 9, 2); l.position.set(0, 3.2, z); scene.add(l); }

// ------------------------------------------------------------------ materials and canvas textures
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, ...extra });
function canvasTex(size, draw, rx = 1, ry = 1) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; t.repeat.set(rx, ry);
  return t;
}
const sidingTex = canvasTex(256, (g, s) => { // board and batten, 1 tile = 1.2 m, 3 battens
  g.fillStyle = "#2f3339"; g.fillRect(0, 0, s, s);
  g.fillStyle = "#3b4047"; for (let i = 0; i < 3; i++) g.fillRect(i * s / 3, 0, s / 24, s);
});
const woodTex = canvasTex(512, (g, s) => { // oak planks, 1 tile = 2 m, 8 rows
  const tones = ["#cfae84", "#c8a67b", "#d6b68d", "#c4a074"];
  for (let r = 0; r < 8; r++) {
    const y = r * s / 8, off = (r % 2) * s / 3;
    for (let x = -s; x < s; x += s / 1.5) { g.fillStyle = tones[(r + Math.round(x)) & 3]; g.fillRect(x + off, y, s / 1.5, s / 8); }
    g.fillStyle = "rgba(90,60,30,.25)"; g.fillRect(0, y, s, 1.5);
  }
});
const lawnTex = canvasTex(256, (g, s) => { g.fillStyle = "#5f9543"; g.fillRect(0, 0, s, s); g.fillStyle = "#6aa04c"; g.fillRect(0, 0, s / 2, s); });
const deckTex = canvasTex(256, (g, s) => { g.fillStyle = "#9da1a3"; g.fillRect(0, 0, s, s); g.fillStyle = "#6f7375"; for (let i = 0; i < 8; i++) g.fillRect(i * s / 8, 0, 2, s); });
const paverTex = canvasTex(256, (g, s) => {
  g.fillStyle = "#8f8a82"; g.fillRect(0, 0, s, s);
  const tones = ["#c9b9a0", "#bfae93", "#d2c3aa"];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { g.fillStyle = tones[(r + c) % 3]; g.fillRect(c * s / 2 + 3 + (r % 2) * s / 4, r * s / 4 + 3, s / 2 - 6, s / 4 - 6); g.fillRect(c * s / 2 + 3 + (r % 2) * s / 4 - s, r * s / 4 + 3, s / 2 - 6, s / 4 - 6); }
});
const tiled = (tex, rx, ry) => { const t = tex.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return t; };

const M = {
  paint: std(0xf2eee6), trim: std(0xf6f4ef), slab: std(0x9a968e), roof: std(0x34383e, { roughness: 0.65 }),
  ink: std(0x15171a, { roughness: 0.6 }), glass: std(0x2f3b45, { roughness: 0.15, metalness: 0.2 }),
  white: std(0xf7f6f3, { roughness: 0.5 }), quartz: std(0xeeece8, { roughness: 0.3 }), wood: std(0x8a5a33),
  sofa: std(0x8f969c), rug: std(0xd8cdbb), linen: std(0xe8e2d6), teal: std(0x2f5e55), grey: std(0x6b6f76),
  mulch: std(0x5a3a26), rock: std(0xcbbfa9), conifer: std(0x2e5a39, { flatShading: true }), leaf: std(0x4f7f3a, { flatShading: true }), trunk: std(0x5b4331),
  glow: new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0xffd9a0, emissiveIntensity: 2.2 }),
};
const siding = (w, h) => std(0xffffff, { map: tiled(sidingTex, w / 1.2, h / 1.2) });

// ------------------------------------------------------------------ geometry helpers
const F = 0.3, H = 3, T = 0.2;               // floor top, wall height, wall thickness
const house = new THREE.Group(); scene.add(house);
function box(w, h, d, mat, x, y, z, parent = house) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m;
}
// faces of BoxGeometry: [+x, -x, +y, -y, +z, -z]
function wallSeg(len, alongX, ext, c, holeTop = 0) {
  const h = H - holeTop, y = F + holeTop + h / 2;
  const mats = [M.paint, M.paint, M.trim, M.paint, M.paint, M.paint];
  const s = siding(len, h);
  if (alongX) { if (ext > 0) mats[4] = s; else if (ext < 0) mats[5] = s; }
  else { if (ext > 0) mats[0] = s; else if (ext < 0) mats[1] = s; }
  return alongX ? box(len, h, T, mats, c, y, wallSeg.fixed) : box(T, h, len, mats, wallSeg.fixed, y, c);
}
// Wall along x at z (or along z at x) from a to b with door holes [{a, b, top}]; ext = side the siding faces (+1, -1, 0).
function wall(alongX, fixed, a, b, ext, holes = []) {
  wallSeg.fixed = fixed;
  let cur = a;
  for (const hole of holes) {
    if (hole.a > cur) wallSeg(hole.a - cur, alongX, ext, (cur + hole.a) / 2);
    wallSeg(hole.b - hole.a, alongX, ext, (hole.a + hole.b) / 2, hole.top);
    cur = hole.b;
  }
  if (b > cur) wallSeg(b - cur, alongX, ext, (cur + b) / 2);
}
function windowPane(x, z, rotY) { // 1.6 x 1.4 window with 0.08 white trim, proud of an exterior wall face
  const g = new THREE.Group(); g.position.set(x, F + 1.6, z); g.rotation.y = rotY; house.add(g);
  box(1.6, 1.4, 0.04, M.glass, 0, 0, 0, g);
  for (const [w, h, px, py] of [[1.76, 0.08, 0, 0.74], [1.76, 0.08, 0, -0.74], [0.08, 1.4, 0.84, 0], [0.08, 1.4, -0.84, 0], [0.06, 1.4, 0, 0]]) box(w, h, 0.06, M.trim, px, py, 0.02, g);
}

// ------------------------------------------------------------------ the house
const DOOR = { a: -0.8, b: 0.8, top: 2.4 };
box(12.4, F, 12.4, [M.slab, M.slab, std(0xffffff, { map: tiled(woodTex, 6, 6) }), M.slab, M.slab, M.slab], 0, F / 2, -6); // slab + oak floor
wall(true, 0, -6.1, 6.1, +1, [DOOR]);                 // front
wall(true, -12, -6.1, 6.1, -1, [DOOR]);               // back
wall(false, -6, -11.9, -0.1, -1);                     // left
wall(false, 6, -11.9, -0.1, +1);                      // right
wall(true, -4, -5.9, 5.9, 0, [{ a: -0.9, b: 0.9, top: 2.4 }]);  // kitchen | living
wall(true, -8, -5.9, 5.9, 0, [{ a: -0.9, b: 0.9, top: 2.4 }]);  // living | bedroom
box(0.06, 2.3, 1.5, M.ink, 0.83, F + 1.15, -0.85);     // front door, swung open
box(0.06, 2.3, 1.5, M.ink, 0.83, F + 1.15, -11.15);    // back door, swung open
for (const x of [-3.4, 3.4]) windowPane(x, 0.13, 0);
windowPane(3.4, -12.13, Math.PI);
for (const z of [-2, -6, -10]) { windowPane(-6.13, z, -Math.PI / 2); windowPane(6.13, z, Math.PI / 2); }

// Gable roof: underside passes exactly through the wall tops (y 3.3 at x = ±6) and the ridge (y 5.5 at x = 0).
{
  const rise = 2.2, run = 6, over = 0.6, slope = rise / run, ang = Math.atan(slope), t = 0.16, depth = 13;
  const L = (run + over) / Math.cos(ang), cx = (run + over) / 2, cyUnder = F + H + rise - cx * slope;
  for (const side of [-1, 1]) {
    const n = new THREE.Vector3(side * Math.sin(ang), Math.cos(ang), 0);
    const m = box(L, t, depth, [M.trim, M.trim, M.roof, M.paint, M.trim, M.trim], side * cx + n.x * t / 2, cyUnder + n.y * t / 2, -6);
    m.rotation.z = -side * ang;
  }
  box(0.34, 0.14, depth, M.roof, 0, F + H + rise + 0.1, -6);
  const tri = new THREE.Shape([new THREE.Vector2(-run, 0), new THREE.Vector2(run, 0), new THREE.Vector2(0, rise)]);
  const gableTex = std(0xffffff, { map: tiled(sidingTex, 1 / 1.2, 1 / 1.2) });
  const gable = (mat, z, rotY) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(tri), mat); m.position.set(0, F + H, z); m.rotation.y = rotY; house.add(m); };
  gable(gableTex, 0.1, 0); gable(M.paint, -0.1, Math.PI); gable(gableTex, -12.1, Math.PI); gable(M.paint, -11.9, 0);
  box(0.9, 2.4, 0.9, M.roof, 3.4, 5.2, -3);           // chimney, like the logo
}

// Kitchen (z 0 to -4): photos on the left wall, cabinets and island on the right
box(0.6, 0.9, 3.4, M.white, 5.6, F + 0.45, -2); box(0.64, 0.04, 3.4, M.quartz, 5.58, F + 0.92, -2);
box(0.36, 0.7, 3.4, M.white, 5.72, F + 2.0, -2);
box(1.0, 0.9, 2.2, M.white, 2.6, F + 0.45, -2); box(1.12, 0.05, 2.32, M.quartz, 2.6, F + 0.925, -2);
for (const z of [-1.3, -2, -2.7]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 20), M.wood); s.position.set(1.8, F + 0.7, z); house.add(s); box(0.04, 0.68, 0.04, M.ink, 1.8, F + 0.34, z); }
for (const z of [-1.45, -2.55]) {
  box(0.02, 1.2, 0.02, M.ink, 2.6, F + 2.9, z);
  const g = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), M.glow); g.position.set(2.6, F + 2.2, z); house.add(g);
  for (const [dx, dz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) box(0.02, 0.36, 0.02, M.ink, 2.6 + dx, F + 2.22, z + dz);
}
// Living (z -4 to -8): photos on the right wall, sofa facing them
box(3.0, 0.01, 3.2, M.rug, -3.0, F + 0.005, -6);
box(0.95, 0.45, 2.4, M.sofa, -4.9, F + 0.225, -6); box(0.25, 0.55, 2.4, M.sofa, -5.3, F + 0.725, -6);
for (const dz of [-1.3, 1.3]) box(0.95, 0.62, 0.2, M.sofa, -4.9, F + 0.31, -6 + dz);
{ const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 32), M.wood); t.position.set(-3.1, F + 0.42, -6); house.add(t); box(0.06, 0.4, 0.06, M.ink, -3.1, F + 0.2, -6); }
// Bedroom (z -8 to -12): photos on the left wall, bed on the right
box(2.0, 0.45, 1.7, M.linen, 4.85, F + 0.225, -10); box(0.12, 1.1, 1.8, M.grey, 5.84, F + 0.55, -10);
box(1.3, 0.06, 1.72, M.teal, 4.3, F + 0.48, -10);
for (const dz of [-0.4, 0.4]) box(0.35, 0.14, 0.62, M.white, 5.5, F + 0.52, -10 + dz);
for (const dz of [-1.15, 1.15]) box(0.45, 0.5, 0.45, M.white, 5.6, F + 0.25, -10 + dz);

// Deck (z -12.1 to -15.6) with black rails and a 1.6 m stair gap, exactly centred on the back door
{
  const x0 = -4, x1 = 4, z0 = -12.1, z1 = -15.6, top = F, railH = 1.0;
  box(x1 - x0, top, z0 - z1, [M.grey, M.grey, std(0xffffff, { map: tiled(deckTex, 4, 1) }), M.grey, M.grey, M.grey], 0, top / 2, (z0 + z1) / 2);
  const runs = [[x0, z1, -0.8, z1], [0.8, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1]];
  const bal = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, railH - 0.1, 0.025), M.ink, 200);
  let n = 0; const m4 = new THREE.Matrix4();
  for (const [ax, az, bx, bz] of runs) {
    const len = Math.hypot(bx - ax, bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2, alongX = az === bz;
    box(alongX ? len + 0.08 : 0.08, 0.06, alongX ? 0.08 : len + 0.08, M.ink, cx, top + railH, cz);
    const posts = Math.round(len / 1.0);
    for (let i = 0; i <= posts; i++) { const f = i / posts; box(0.08, railH, 0.08, M.ink, ax + (bx - ax) * f, top + railH / 2, az + (bz - az) * f); }
    const k = Math.round(len / 0.12);
    for (let i = 1; i < k; i++) { const f = i / k; m4.makeTranslation(ax + (bx - ax) * f, top + (railH - 0.1) / 2, az + (bz - az) * f); bal.setMatrixAt(n++, m4); }
  }
  bal.count = n; house.add(bal);
  box(1.6, 0.2, 0.35, M.grey, 0, 0.1, z1 - 0.175); box(1.6, 0.1, 0.35, M.grey, 0, 0.05, z1 - 0.525);
}

// Yard
{
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std(0xffffff, { map: tiled(lawnTex, 100, 1) }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const flatPlane = (w, d, mat, x, z, y = 0.01) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); p.rotation.x = -Math.PI / 2; p.position.set(x, y, z); scene.add(p); return p; };
  flatPlane(1.6, 8, std(0xffffff, { map: tiled(paverTex, 1.6 / 1.2, 8 / 0.6) }), 0, 4.6);                // front walk
  flatPlane(4, 3.6, std(0xffffff, { map: tiled(paverTex, 4 / 1.2, 3.6 / 0.6) }), 3.6, -17.9);            // patio
  for (const x of [-3.6, 3.6]) { box(4.4, 0.06, 1.2, M.mulch, x, 0.03, 0.9, scene); for (const dx of [-1.5, 0, 1.5]) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), M.leaf); s.position.set(x + dx, 0.38, 0.9); scene.add(s); } }
  const rb = new THREE.Mesh(new THREE.CircleGeometry(1.8, 48), M.rock); rb.rotation.x = -Math.PI / 2; rb.position.set(-8, 0.012, -19); scene.add(rb);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 6, 64), M.ink); edge.rotation.x = -Math.PI / 2; edge.position.set(-8, 0.02, -19); scene.add(edge);
  const conifer = (x, z, s = 1) => { box(0.3 * s, 0.8 * s, 0.3 * s, M.trunk, x, 0.4 * s, z, scene); const c = new THREE.Mesh(new THREE.ConeGeometry(1.3 * s, 4 * s, 7), M.conifer); c.position.set(x, 0.8 * s + 2 * s, z); scene.add(c); };
  const leafy = (x, z, s = 1) => { box(0.3 * s, 1.6 * s, 0.3 * s, M.trunk, x, 0.8 * s, z, scene); const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 * s, 1), M.leaf); c.position.set(x, 2.6 * s, z); scene.add(c); };
  conifer(-8, -19, 1.1); conifer(-12, -9); conifer(12, -31, 1.2); conifer(-12, -32, 1.3); conifer(14, -10, 0.9);
  leafy(10, 3); leafy(-11, 4, 1.2); leafy(13, -19); leafy(-15, -16, 1.1);
}

// ------------------------------------------------------------------ photo walls (exact grid layout)
const loader = new THREE.TextureLoader();
const texCache = {};
const tex = k => texCache[k] || (texCache[k] = loader.load(IMG + k + ".jpg", t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; dirty = true; if (document.hidden) tick(); }));
const FRAME = 0.06, GAP = 0.28, UP = new THREE.Vector3(0, 1, 0);
const pickables = [];

const STOPS = [
  { name: "Front", view: { target: [0, 2.6, -6], dir: [0.55, 0.24, 0.8], box: [19, 8] } },
  { name: "Kitchen", wall: { at: [-5.89, -2], normal: [1, 0, 0], photos: ["kitchen-1", "kitchen-2"], hL: 1.1, hP: 0.95, bottomL: F + 1.0, bottomP: F + 0.55, max: 10.6 } },
  { name: "Living", wall: { at: [5.89, -6], normal: [-1, 0, 0], photos: ["great-room", "living-2"], hL: 1.1, hP: 0.95, bottomL: F + 1.0, bottomP: F + 0.55, max: 10.6 } },
  { name: "Bedroom", wall: { at: [-5.89, -10], normal: [1, 0, 0], photos: ["bedroom", "wet-bar"], hL: 1.1, hP: 0.95, bottomL: F + 1.0, bottomP: F + 0.55, max: 10.6 } },
  { name: "Deck", wall: { at: [-3.4, -12.13], normal: [0, 0, -1], photos: ["deck-composite-2", "deck-composite-1", "deck-cedar"], hL: 1.25, hP: 0.78, bottomL: 1.45, bottomP: 1.45, max: 16 } },
  { name: "Yard", wall: { at: [0, -27], normal: [0, 0, 1], photos: ["lawn-front", "paver-patio", "rock-bed", "lawn-hillside"], hL: 1.3, hP: 1.0, bottomL: 0.7, bottomP: 0.6, max: 9.5, posts: true } },
  { name: "Estimate", view: { target: [0, 1, -9], dir: [0.66, 0.5, 0.56], box: [26, 18] } },
];
// Waypoints between stops (pass through door openings on the centre line x = 0) and how much the camera
// looks along its path mid-way (1 = fully ahead, 0 = keeps turning between the two stop targets).
const LEGS = [
  { via: [[0, 2.2, 7], [0, 1.95, 1.0], [0, 1.95, -1.0]], ahead: 0.9 },
  { via: [[0, 1.95, -4]], ahead: 0.8 },
  { via: [[0, 1.95, -8]], ahead: 0.8 },
  { via: [[0, 1.95, -11.0], [0, 1.95, -13.0], [0, 1.7, -15.3], [-1.4, 2.0, -17.4]], ahead: 0.9 },
  { via: [], ahead: 0.2 },
  { via: [[4, 7, -14]], ahead: 0 },
];

// Rows: landscape = all photos in one row; portrait = stacked (2 photos -> 1 per row, more -> 2 per row).
function layout(w, portrait) {
  const n = w.photos.length, per = portrait ? (n === 2 ? 1 : 2) : n, h = portrait ? w.hP : w.hL;
  const rows = []; for (let i = 0; i < n; i += per) rows.push(w.photos.slice(i, i + per));
  const rowW = rows.map(r => r.reduce((s, k) => s + h * PHOTOS[k][0], 0) + GAP * (r.length - 1));
  const totalH = rows.length * h + GAP * (rows.length - 1);
  const items = [];
  rows.forEach((r, ri) => {
    let x = -rowW[ri] / 2; const y = totalH / 2 - h / 2 - ri * (h + GAP);
    r.forEach(k => { const pw = h * PHOTOS[k][0]; items.push({ k, w: pw, h, x: x + pw / 2, y }); x += pw + GAP; });
  });
  const bottom = portrait ? w.bottomP : w.bottomL;
  return { items, w: Math.max(...rowW) + 2 * FRAME, h: totalH + 2 * FRAME, cy: bottom + FRAME + totalH / 2 };
}

let walls = new THREE.Group(); scene.add(walls);
function buildWalls(portrait) {
  scene.remove(walls); walls.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  walls = new THREE.Group(); scene.add(walls); pickables.length = 0;
  for (const s of STOPS) {
    if (!s.wall) continue;
    const w = s.wall, L = layout(w, portrait);
    const n = new THREE.Vector3(...w.normal), right = new THREE.Vector3().crossVectors(n.clone().negate(), UP).normalize();
    const anchor = new THREE.Vector3(w.at[0], L.cy, w.at[1]);
    s.anchor = anchor; s.box = [L.w, L.h]; s.normal = n;
    for (const it of L.items) {
      const g = new THREE.Group();
      g.position.copy(anchor).addScaledVector(right, it.x).addScaledVector(UP, it.y - 0).addScaledVector(n, 0.03);
      g.position.y = anchor.y + it.y;
      g.lookAt(g.position.clone().add(n));
      const frame = new THREE.Mesh(new THREE.BoxGeometry(it.w + 2 * FRAME, it.h + 2 * FRAME, 0.05), M.ink); g.add(frame);
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(it.w, it.h), new THREE.MeshBasicMaterial({ map: tex(it.k), toneMapped: false }));
      photo.position.z = 0.026; photo.userData = { k: it.k }; g.add(photo); pickables.push(photo);
      if (w.posts) { const ph = g.position.y - it.h / 2 - FRAME; for (const dx of [-it.w / 2 + 0.1, it.w / 2 - 0.1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, ph, 0.08), M.ink); p.position.set(dx, -(it.h / 2 + FRAME) - ph / 2, -0.04); g.add(p); } }
      walls.add(g);
    }
  }
}

// ------------------------------------------------------------------ camera: fit each stop, then build the legs
const N = STOPS.length;
const state = { W: 1, H: 1, portrait: null, xc: 0, yc: 0, fullW: 1, fullH: 1, reserve: [], dirtyLayout: true };

function screenRegion(i) { // the free part of the screen for stop i, in px: {x0, x1, y0, y1}
  const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--top")) || 104;
  const desktop = state.W >= 1024;
  const card = $(`.stop[data-i="${i}"]`);
  if (desktop) { const r = card.getBoundingClientRect(); const right = r.width ? r.right : state.W * 0.35; return { x0: right + 24, x1: state.W - 120, y0: top + 16, y1: state.H - 24 }; }
  const ch = card.offsetHeight || 220;
  return { x0: 12, x1: state.W - 12, y0: top + 8, y1: state.H - ch - 32 };
}
function fit(i) {
  const s = STOPS[i], reg = screenRegion(i);
  const xc = (reg.x0 + reg.x1) / 2, yc = (reg.y0 + reg.y1) / 2;
  // Off-axis projection: same pixel scale as a centred camera, principal point moved to (xc, yc).
  const tanPerPx = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / (state.H / 2);
  const tw = (reg.x1 - reg.x0) / 2 * tanPerPx, th = (reg.y1 - reg.y0) / 2 * tanPerPx;
  const [bw, bh] = s.wall ? s.box : s.view.box;
  const m = s.wall ? 1.32 : 1.08; // breathing room so the room around the photos shows
  let d = Math.max((bw / 2 * m) / tw, (bh / 2 * m) / th);
  if (s.wall) d = Math.min(d, s.wall.max);
  const target = s.wall ? s.anchor.clone() : new THREE.Vector3(...s.view.target);
  const dir = s.wall ? s.normal.clone() : new THREE.Vector3(...s.view.dir).normalize();
  s.pos = target.clone().addScaledVector(dir, d); s.look = target; s.xc = xc; s.yc = yc;
}
let legs = [];
function buildLegs() {
  legs = LEGS.map((L, i) => ({ curve: new THREE.CatmullRomCurve3([STOPS[i].pos, ...L.via.map(v => new THREE.Vector3(...v)), STOPS[i + 1].pos], false, "centripetal"), ahead: L.ahead }));
}

function resize() {
  state.W = window.innerWidth; state.H = window.innerHeight;
  renderer.setSize(state.W, state.H, false);
  camera.aspect = state.W / state.H;
  camera.fov = state.W < 720 ? 58 : 50;
  const portrait = state.W / state.H < 1.0;
  if (portrait !== state.portrait) { state.portrait = portrait; buildWalls(portrait); }
  STOPS.forEach((_, i) => fit(i));
  buildLegs();
  dirty = true;
}

// ------------------------------------------------------------------ scroll -> camera
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let sTarget = 0, sCur = 0, dirty = true;
const pointer = new THREE.Vector2(0, 0), pointerS = new THREE.Vector2(0, 0);
const tmp = new THREE.Vector3(), look = new THREE.Vector3(), camRight = new THREE.Vector3();

// One stop per (scrollable height / 6), so the last stop is always reachable whatever the browser bars do.
const stopPx = () => Math.max(1, (document.documentElement.scrollHeight - window.innerHeight) / (N - 1));
function readScroll() { sTarget = THREE.MathUtils.clamp(window.scrollY / stopPx(), 0, N - 1); }

function place(s) {
  const i = Math.min(Math.floor(s), N - 2), f = s - i, e = smooth(0.12, 0.88, f);
  const leg = legs[i], A = STOPS[i], B = STOPS[i + 1];
  camera.position.copy(leg.curve.getPointAt(e));
  const base = tmp.copy(A.look).lerp(B.look, e);
  const w = Math.pow(Math.sin(Math.PI * e), 2) * leg.ahead;
  const ahead = leg.curve.getTangentAt(Math.min(e, 0.999)).multiplyScalar(4).add(camera.position);
  look.copy(base).lerp(ahead, w);
  // principal point follows the free part of the screen
  const xc = THREE.MathUtils.lerp(A.xc, B.xc, e), yc = THREE.MathUtils.lerp(A.yc, B.yc, e);
  camera.setViewOffset(state.W, state.H, state.W / 2 - xc, state.H / 2 - yc, state.W, state.H);
  // gentle look-around with the mouse, fades out while moving between rooms
  const hold = 1 - Math.sin(Math.PI * e);
  camRight.subVectors(look, camera.position).cross(UP).normalize();
  const dist = camera.position.distanceTo(look);
  look.addScaledVector(camRight, pointerS.x * 0.035 * dist * hold).addScaledVector(UP, -pointerS.y * 0.02 * dist * hold);
  camera.lookAt(look);
}

// cards + room rail
const cards = $$(".stop"), railBtns = $$(".rooms button");
function updateUI(s) {
  cards.forEach((c, i) => {
    const d = s - i, a = THREE.MathUtils.clamp(1 - (Math.abs(d) - 0.12) / 0.3, 0, 1);
    c.style.opacity = a.toFixed(3);
    c.style.visibility = a > 0.001 ? "visible" : "hidden";
    const shift = (-d * 24).toFixed(1);
    c.style.transform = state.W >= 1024 ? `translateY(calc(-50% + ${shift}px))` : `translateY(${shift}px)`;
    c.classList.toggle("live", a > 0.5);
  });
  const on = Math.round(s);
  railBtns.forEach((b, i) => { b.classList.toggle("on", i === on); b.classList.toggle("past", i < on); b.setAttribute("aria-current", i === on ? "step" : "false"); });
  document.body.dataset.mode = on === 5 ? "lawn" : (form.querySelector("input[name=project]:checked")?.dataset.team || "build");
}

function tick() {
  const k = reduce || document.hidden ? 1 : 0.11;
  const ds = sTarget - sCur;
  if (Math.abs(ds) > 1e-4) { sCur += ds * k; dirty = true; } else if (sCur !== sTarget) { sCur = sTarget; dirty = true; }
  const dp = pointer.clone().sub(pointerS);
  if (dp.lengthSq() > 1e-6) { pointerS.addScaledVector(dp, 0.08); dirty = true; }
  if (dirty) { place(sCur); updateUI(sCur); renderer.render(scene, camera); dirty = false; }
}
function frame() { tick(); requestAnimationFrame(frame); }

// ------------------------------------------------------------------ input
// Render straight away when the tab is in the background (no animation frames there).
window.addEventListener("scroll", () => { readScroll(); if (document.hidden) tick(); }, { passive: true });
window.addEventListener("resize", () => { resize(); readScroll(); tick(); });
$$("[data-go]").forEach(b => b.addEventListener("click", e => {
  e.preventDefault();
  window.scrollTo({ top: Number(b.dataset.go) * stopPx(), behavior: reduce ? "auto" : "smooth" });
}));
const canvas = renderer.domElement, ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function hit(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(pickables, false)[0];
  return h ? h.object.userData.k : null;
}
window.addEventListener("pointermove", ev => {
  if (ev.pointerType === "mouse") {
    pointer.set((ev.clientX / state.W) * 2 - 1, (ev.clientY / state.H) * 2 - 1);
    canvas.style.cursor = hit(ev) ? "zoom-in" : "";
  }
}, { passive: true });
let down = null;
canvas.addEventListener("pointerdown", ev => { down = { x: ev.clientX, y: ev.clientY, t: performance.now() }; });
canvas.addEventListener("pointerup", ev => {
  if (!down) return;
  const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y), quick = performance.now() - down.t < 500;
  down = null;
  if (moved > 8 || !quick) return;
  const k = hit(ev); if (!k) return;
  const lb = $("#lightbox");
  $("#lb-img").src = FULL + k + ".jpg"; $("#lb-img").alt = PHOTOS[k][1]; $("#lb-cap").textContent = PHOTOS[k][1];
  lb.showModal ? lb.showModal() : window.open(FULL + k + ".jpg", "_blank");
});
$("#lb-close").addEventListener("click", () => $("#lightbox").close());
$("#lightbox").addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

// ------------------------------------------------------------------ go
resize(); readScroll(); sCur = sTarget; tick();
$("#loader").classList.add("done");
requestAnimationFrame(frame);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { resize(); tick(); });
