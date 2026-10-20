import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ROOMS, HALL, OPENINGS, WALL_H, DOOR_H, CENTER, PLOT, STAIR, buildWallPieces } from './plan.js';

export const W = {};   // the world: renderer, scene, cameras, controls, groups

/* ---------------- textures ---------------- */
function rnd(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function tex(size, meters, paint) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  paint(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.userData.m = meters; return t;
}
const planks = (h, s, l, n, var_) => (x, S) => {
  const ph = S / n;
  for (let i = 0; i < n; i++) {
    for (let seg = 0; seg < 2; seg++) {
      const off = (rnd(i) * S) + seg * S / 2;
      const L = l + (rnd(i * 3 + seg) - 0.5) * var_;
      x.fillStyle = `hsl(${h + (rnd(i + seg) - 0.5) * 6},${s}%,${L}%)`;
      x.fillRect(off % S, i * ph, S / 2, ph); if (off % S + S / 2 > S) x.fillRect(0, i * ph, (off % S + S / 2) - S, ph);
      x.fillStyle = 'rgba(40,22,10,.45)'; x.fillRect(off % S, i * ph, 2, ph);
    }
    x.fillStyle = 'rgba(40,22,10,.35)'; x.fillRect(0, i * ph, S, 2);
    x.strokeStyle = 'rgba(60,35,15,.10)'; x.lineWidth = 1.5;
    for (let j = 0; j < 10; j++) { x.beginPath(); const y = i * ph + rnd(i * 17 + j) * ph; x.moveTo(0, y); x.bezierCurveTo(S * .3, y + 5 * rnd(j), S * .6, y - 5 * rnd(j + 1), S, y + 2); x.stroke(); }
  }
};
const marble = (base, vein, grid) => (x, S) => {
  x.fillStyle = base; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 14; i++) {
    x.strokeStyle = vein; x.lineWidth = 0.6 + rnd(i) * 2.2; x.beginPath();
    let px = rnd(i) * S, py = -10; x.moveTo(px, py);
    for (let k = 0; k < 9; k++) { px += (rnd(i * 13 + k) - .5) * S * .25; py += S / 8; x.lineTo(px, py); }
    x.stroke();
  }
  x.strokeStyle = 'rgba(0,0,0,.09)'; x.lineWidth = 2;
  for (let i = 0; i <= grid; i++) { x.beginPath(); x.moveTo(i * S / grid, 0); x.lineTo(i * S / grid, S); x.moveTo(0, i * S / grid); x.lineTo(S, i * S / grid); x.stroke(); }
};
const tiles = (base, line, n, jitter = 4) => (x, S) => {
  const t = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const l = (rnd(i * 31 + j) - .5) * jitter; x.fillStyle = base; x.fillRect(i * t, j * t, t, t); x.fillStyle = `rgba(${l > 0 ? '255,255,255' : '0,0,0'},${Math.abs(l) / 40})`; x.fillRect(i * t, j * t, t, t); }
  x.strokeStyle = line; x.lineWidth = 3;
  for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * t, 0); x.lineTo(i * t, S); x.moveTo(0, i * t); x.lineTo(S, i * t); x.stroke(); }
};
const speckle = (base, dots, n, a) => (x, S) => { x.fillStyle = base; x.fillRect(0, 0, S, S); for (let i = 0; i < n; i++) { x.fillStyle = dots[i % dots.length]; x.globalAlpha = a * (0.4 + rnd(i) * .6); const r = 1 + rnd(i + 7) * 3; x.beginPath(); x.arc(rnd(i + 1) * S, rnd(i + 2) * S, r, 0, 7); x.fill(); } x.globalAlpha = 1; };

const FLOOR_DEF = {
  wood: [() => tex(1024, 2.0, planks(30, 42, 52, 10, 10)), 0.55],
  walnut: [() => tex(1024, 2.0, planks(22, 34, 30, 10, 8)), 0.5],
  marble: [() => tex(1024, 1.2, marble('#f0eeea', 'rgba(140,130,118,.25)', 2)), 0.18],
  stone: [() => tex(1024, 1.2, marble('#e4dfd6', 'rgba(120,108,92,.22)', 2)), 0.3],
  tile: [() => tex(512, 1.2, tiles('#d6dadb', 'rgba(110,118,120,.6)', 4)), 0.4],
  ktile: [() => tex(512, 1.2, tiles('#cbc2b5', 'rgba(90,80,70,.55)', 2)), 0.45],
  black: [() => tex(1024, 1.2, marble('#26272a', 'rgba(220,220,220,.10)', 2)), 0.15],
  terrazzo: [() => tex(1024, 1.0, speckle('#e6e1d8', ['#9a8f80', '#c9b79a', '#6b6f73', '#b55'], 2600, 0.8)), 0.35],
  deck: [() => tex(512, 1.2, (x, S) => { const n = 8; for (let i = 0; i < n; i++) { x.fillStyle = `hsl(25,32%,${34 + rnd(i + 3) * 9}%)`; x.fillRect(i * S / n, 0, S / n - 4, S); x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(i * S / n + S / n - 4, 0, 4, S); } }), 0.8],
  granite: [() => tex(512, 1.0, speckle('#2c2c2f', ['#fff', '#888'], 3000, 0.25)), 0.25],
  pebble: [() => tex(512, 1.0, speckle('#b9b4aa', ['#8a857c', '#e3ded4', '#a39c90'], 1400, 1)), 0.95],
  steel: [() => tex(256, 1.0, (x, S) => { x.fillStyle = '#9aa0a4'; x.fillRect(0, 0, S, S); for (let i = 0; i < S; i += 2) { x.fillStyle = `rgba(255,255,255,${rnd(i) * .12})`; x.fillRect(0, i, S, 1); } }), 0.35],
  carpet: [() => tex(512, 1.0, speckle('#8d8577', ['#7a7366', '#a39b8c'], 6000, 0.5)), 1.0],
};
const texCache = {};
export function floorMaterial(type, w, d) {
  const def = FLOOR_DEF[type] || FLOOR_DEF.marble;
  const base = texCache[type] || (texCache[type] = def[0]());
  const t = base.clone(); t.needsUpdate = true; t.repeat.set(w / base.userData.m, d / base.userData.m);
  return new THREE.MeshStandardMaterial({ map: t, roughness: def[1], metalness: type === 'steel' ? 0.6 : 0, envMapIntensity: 0.7 });
}

/* ---------------- init ---------------- */
export function initWorld(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const persp = new THREE.PerspectiveCamera(45, 1, 0.05, 300);
  const ortho = new THREE.OrthographicCamera(-15, 15, 15, -15, 0.1, 300);
  const orbit = new OrbitControls(persp, renderer.domElement);
  Object.assign(orbit, { enableDamping: true, dampingFactor: 0.09, maxPolarAngle: Math.PI * 0.49, minDistance: 1.5, maxDistance: 80, zoomToCursor: true });
  const plan = new OrbitControls(ortho, renderer.domElement);
  Object.assign(plan, { enableRotate: false, screenSpacePanning: true, enableDamping: true, dampingFactor: 0.12, minZoom: 0.4, maxZoom: 14, zoomToCursor: true });
  plan.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  plan.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
  plan.enabled = false;
  persp.position.set(CENTER.x + 15, 27, CENTER.z + 13); orbit.target.set(CENTER.x, 0, CENTER.z); orbit.update();
  ortho.position.set(CENTER.x, 80, CENTER.z + 0.001); plan.target.set(CENTER.x, 0, CENTER.z); plan.update();

  // light
  scene.add(new THREE.HemisphereLight(0xfff8ee, 0x9a8f7c, 0.55));
  const sun = new THREE.DirectionalLight(0xfff1dd, 2.3);
  sun.position.set(CENTER.x - 10, 28, CENTER.z - 8); sun.target.position.set(CENTER.x, 0, CENTER.z);
  sun.castShadow = true; const small = matchMedia('(max-width: 820px)').matches; sun.shadow.mapSize.set(small ? 2048 : 4096, small ? 2048 : 4096);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 80 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: '#c4c9bf', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(CENTER.x, -0.05, CENTER.z); ground.receiveShadow = true; scene.add(ground);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(10.9, 0.05, 26.1), new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.9 }));
  plinth.position.set(5.25, -0.025, 12.86); plinth.receiveShadow = true; scene.add(plinth);

  Object.assign(W, { renderer, scene, persp, ortho, orbit, plan, cam: persp, ctrl: orbit, sun, ground,
    floors: {}, wallMats: {}, groups: {} });
  W.groups.walls = new THREE.Group(); W.groups.fixtures = new THREE.Group(); W.groups.items = new THREE.Group(); W.groups.helpers = new THREE.Group();
  scene.add(W.groups.walls, W.groups.fixtures, W.groups.items, W.groups.helpers);

  // floors
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(HALL[2] - HALL[0], HALL[3] - HALL[1]), floorMaterial('marble', HALL[2] - HALL[0], HALL[3] - HALL[1]));
  hall.rotation.x = -Math.PI / 2; hall.position.set((HALL[0] + HALL[2]) / 2, 0, (HALL[1] + HALL[3]) / 2); hall.receiveShadow = true; scene.add(hall);
  W.floors.hall = hall;
  for (const r of ROOMS) {
    if (!r.floor) continue;
    const [x0, z0, x1, z1] = r.r;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 + 0.07, z1 - z0 + 0.07), floorMaterial(r.floor, x1 - x0, z1 - z0));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.003, (z0 + z1) / 2); m.receiveShadow = true; m.userData.room = r.id;
    scene.add(m); W.floors[r.id] = m;
  }
  W.pieces = buildWallPieces();
  buildFixtures();
  buildCeiling();

  // post-processing (ambient occlusion)
  const composer = new EffectComposer(renderer);
  W.renderPass = new RenderPass(scene, persp); composer.addPass(W.renderPass);
  W.gtao = new GTAOPass(scene, persp, 1, 1); W.gtao.output = GTAOPass.OUTPUT.Default;
  W.gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 12 });
  W.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  composer.addPass(W.gtao); composer.addPass(new OutputPass());
  W.composer = composer; W.useAO = false;
  return W;
}

export function setCamera(which) {
  W.cam = which === 'plan' ? W.ortho : W.persp;
  W.ctrl = which === 'plan' ? W.plan : W.orbit;
  W.orbit.enabled = which === 'orbit'; W.plan.enabled = which === 'plan';
  W.renderPass.camera = W.cam; W.gtao.camera = W.cam;
}

export function resize(w, h) {
  if (!w || !h) return;
  W.renderer.setSize(w, h, false);
  W.persp.aspect = w / h; W.persp.updateProjectionMatrix();
  const half = 15; W.ortho.left = -half * w / h; W.ortho.right = half * w / h; W.ortho.top = half; W.ortho.bottom = -half; W.ortho.updateProjectionMatrix();
  W.composer.setSize(w, h); W.gtao.setSize(w * W.renderer.getPixelRatio(), h * W.renderer.getPixelRatio());
}

export function render() {
  if (W.useAO && W.cam === W.persp) W.composer.render(); else W.renderer.render(W.scene, W.cam);
}

/* ---------------- walls ---------------- */
const capMat = new THREE.MeshStandardMaterial({ color: '#3a3f3d', roughness: 0.9 });
const skirtMat = new THREE.MeshStandardMaterial({ color: '#d9d4cb', roughness: 0.6 });
export function wallMaterial(roomId) {
  if (!W.wallMats[roomId]) {
    const r = ROOMS.find(q => q.id === roomId);
    W.wallMats[roomId] = new THREE.MeshStandardMaterial({ color: (r && r.paint) || '#f2efe9', roughness: 0.9, envMapIntensity: 0.5 });
  }
  return W.wallMats[roomId];
}
// interior-facing normal of a wall piece (points into the room / building)
function inward(p) {
  if (p.room) return p.axis === 'x' ? [0, p.side] : [p.side, 0];
  return p.fixed < 5 ? [1, 0] : [-1, 0];
}
const PERIM = p => !p.room || (p.axis === 'z' && (Math.abs(p.fixed - 0.3) < 0.01 || Math.abs(p.fixed - 10.2) < 0.01)) || (p.axis === 'x' && (Math.abs(p.fixed - 2.0) < 0.01 || Math.abs(p.fixed - 23.65) < 0.01));
export function buildWalls(mode, paints = {}, view = null) {
  const g = W.groups.walls; g.clear();
  const LOW = 1.1;
  const H = mode === 'full' || mode === 'auto' ? WALL_H : mode === 'low' ? LOW : 0.06;
  // auto: perimeter walls whose inside faces the camera stay full height (plus the focused room's back walls); everything else is cut to 1.1 m
  const heightFor = p => {
    if (mode !== 'auto' || !view) return H;
    const n = inward(p), d = n[0] * view.dir[0] + n[1] * view.dir[1];
    if (d > 0.25 && (PERIM(p) || (view.room && p.room === view.room))) return WALL_H;
    return LOW;
  };
  for (const [id, hex] of Object.entries(paints)) wallMaterial(id).color.set(hex);
  const ext = wallMaterial('exterior');
  const openH = new Map();
  for (const p of W.pieces) {
    const PH = heightFor(p);
    if (p.part === 'head' || p.part === 'sill') { /* openings track the tallest neighbour */ }
    if (p.y0 >= PH) continue;
    const y1 = Math.min(p.y1, PH), h = y1 - p.y0; if (h <= 0.001) continue;
    if (p.y0 === 0 && !p.part) for (const o of OPENINGS) if (o.axis === p.axis && Math.abs(o.at - p.fixed) < 0.22 && (Math.abs(o.a - p.b) < 0.02 || Math.abs(o.b - p.a) < 0.02)) openH.set(o, Math.max(openH.get(o) || 0, PH));
    const L = p.b - p.a;
    const side = p.room ? wallMaterial(p.room) : ext;
    const geo = p.axis === 'x' ? new THREE.BoxGeometry(L, h, p.t) : new THREE.BoxGeometry(p.t, h, L);
    const m = new THREE.Mesh(geo, [side, side, capMat, side, side, side]);
    m.castShadow = m.receiveShadow = true;
    if (p.axis === 'x') m.position.set((p.a + p.b) / 2, p.y0 + h / 2, p.fixed); else m.position.set(p.fixed, p.y0 + h / 2, (p.a + p.b) / 2);
    m.userData.wall = p; g.add(m);
    if (p.room && p.y0 === 0 && mode !== 'off') {   // skirting on the room's inner face
      const off = p.side * (p.t / 2 + 0.006);
      const sk = p.axis === 'x' ? new THREE.BoxGeometry(L, 0.09, 0.012) : new THREE.BoxGeometry(0.012, 0.09, L);
      const s = new THREE.Mesh(sk, skirtMat);
      if (p.axis === 'x') s.position.set((p.a + p.b) / 2, 0.045, p.fixed + off); else s.position.set(p.fixed + off, 0.045, (p.a + p.b) / 2);
      g.add(s);
    }
  }
  // openings that depend on wall height
  for (const o of OPENINGS) {
    const oh = mode === 'auto' ? (openH.get(o) || LOW) : H;
    if (o.kind === 'window' && mode !== 'off') addWindow(g, o, oh);
    if (o.kind === 'slide' && mode !== 'off') addSlider(g, o, oh);
    if (o.kind === 'door') addDoor(g, o, oh >= 2.5 ? 'full' : mode === 'off' ? 'off' : 'low');
    if (o.liftDoor && mode !== 'off') addLiftDoor(g, o, oh);
  }
  W.wallH = H;
}
const frameMat = new THREE.MeshStandardMaterial({ color: '#2e3134', roughness: 0.4, metalness: 0.6 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: '#cfe6ee', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.25, depthWrite: false, envMapIntensity: 1.2 });
const leafMat = new THREE.MeshStandardMaterial({ color: '#7a5233', roughness: 0.55 });
const handleMat = new THREE.MeshStandardMaterial({ color: '#c9c3b6', roughness: 0.25, metalness: 0.9 });
function placeAlong(o, mesh, along, y, across = 0) {
  if (o.axis === 'x') mesh.position.set(along, y, o.at + across); else mesh.position.set(o.at + across, y, along);
}
function box(o, len, h, t) { return o.axis === 'x' ? new THREE.BoxGeometry(len, h, t) : new THREE.BoxGeometry(t, h, len); }
function addWindow(g, o, H) {
  const top = Math.min(DOOR_H, H); if (top <= o.sill) return;
  const h = top - o.sill, L = o.b - o.a, mid = (o.a + o.b) / 2;
  const glass = new THREE.Mesh(box(o, L, h, 0.012), glassMat); placeAlong(o, glass, mid, o.sill + h / 2); g.add(glass);
  for (const [len, hh, al, y] of [[L, 0.05, mid, o.sill + 0.025], [L, 0.05, mid, top - 0.025], [0.05, h, o.a + 0.025, o.sill + h / 2], [0.05, h, o.b - 0.025, o.sill + h / 2], [0.04, h, mid, o.sill + h / 2]]) {
    const f = new THREE.Mesh(box(o, len, hh, 0.06), frameMat); placeAlong(o, f, al, y); g.add(f);
  }
}
function addSlider(g, o, H) {
  const top = Math.min(DOOR_H, H), L = o.b - o.a; const n = L > 2 ? 4 : 2; const pw = L / n;
  for (let i = 0; i < n; i++) {
    const al = o.a + (i + 0.5) * pw, across = (i % 2 ? 0.03 : -0.03);
    const gl = new THREE.Mesh(box(o, pw, top, 0.012), glassMat); placeAlong(o, gl, al, top / 2, across); g.add(gl);
    for (const [len, hh, a2, y] of [[pw, 0.05, al, 0.025], [pw, 0.05, al, top - 0.025], [0.045, top, al - pw / 2 + 0.022, top / 2], [0.045, top, al + pw / 2 - 0.022, top / 2]]) {
      const f = new THREE.Mesh(box(o, len, hh, 0.04), frameMat); placeAlong(o, f, a2, y, across); g.add(f);
    }
  }
}
function addDoor(g, o, mode) {
  const L = o.b - o.a - 0.02, hh = mode === 'full' ? 2.05 : 0.03;
  const pivot = new THREE.Group();
  const hingeAt = o.hinge === 'a' ? o.a + 0.01 : o.b - 0.01;
  placeAlong(o, pivot, hingeAt, 0);
  const dir = o.hinge === 'a' ? 1 : -1;
  const leaf = new THREE.Mesh(o.axis === 'x' ? new THREE.BoxGeometry(L, hh, 0.04) : new THREE.BoxGeometry(0.04, hh, L), leafMat);
  if (o.axis === 'x') leaf.position.set(dir * L / 2, hh / 2, 0); else leaf.position.set(0, hh / 2, dir * L / 2);
  leaf.castShadow = true; pivot.add(leaf);
  if (mode === 'full') {
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.12), handleMat);
    if (o.axis === 'x') hd.position.set(dir * (L - 0.08), 1.0, 0); else hd.position.set(0, 1.0, dir * (L - 0.08));
    pivot.add(hd);
  }
  const ang = THREE.MathUtils.degToRad(82);
  let rot;
  if (o.axis === 'x') rot = o.hinge === 'a' ? -o.swing * ang : o.swing * ang;
  else rot = o.hinge === 'a' ? o.swing * ang : -o.swing * ang;
  pivot.rotation.y = rot; g.add(pivot);
}
function addLiftDoor(g, o, H) {
  const top = Math.min(DOOR_H, H), L = o.b - o.a;
  const steel = new THREE.MeshStandardMaterial({ color: '#b8bec2', roughness: 0.25, metalness: 0.9 });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(box(o, L / 2 - 0.01, top, 0.04), steel); placeAlong(o, p, (o.a + o.b) / 2 + s * L / 4, top / 2); g.add(p); }
}

/* ---------------- fixed fixtures: stairs, railings, OTS ---------------- */
function B(g, w, h, d, x, y, z, m) { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y + h / 2, z); me.castShadow = me.receiveShadow = true; g.add(me); return me; }
function buildFixtures() {
  const g = W.groups.fixtures;
  const tread = new THREE.MeshStandardMaterial({ color: '#232326', roughness: 0.2, envMapIntensity: 1 });
  const riser = new THREE.MeshStandardMaterial({ color: '#efece6', roughness: 0.7 });
  const { rise, run, f1, f2, landing } = STAIR;
  for (let i = 0; i < 9; i++) {
    const h = (i + 1) * rise, z = f1.zStart - (i + 0.5) * run;
    B(g, f1.x1 - f1.x0, h - 0.03, run, (f1.x0 + f1.x1) / 2, 0, z, riser); B(g, f1.x1 - f1.x0, 0.03, run + 0.02, (f1.x0 + f1.x1) / 2, h - 0.03, z - 0.01, tread);
    const h2 = 1.5 + (i + 1) * rise, z2 = f2.zStart + (i + 0.5) * run;
    B(g, f2.x1 - f2.x0, h2 - 0.03, run, (f2.x0 + f2.x1) / 2, 0, z2, riser); B(g, f2.x1 - f2.x0, 0.03, run + 0.02, (f2.x0 + f2.x1) / 2, h2 - 0.03, z2 + 0.01, tread);
  }
  B(g, landing[2] - landing[0], 1.47, landing[3] - landing[1], (landing[0] + landing[2]) / 2, 0, (landing[1] + landing[3]) / 2, riser);
  B(g, landing[2] - landing[0], 0.03, landing[3] - landing[1], (landing[0] + landing[2]) / 2, 1.47, (landing[1] + landing[3]) / 2, tread);
  const gl = new THREE.MeshPhysicalMaterial({ color: '#d6ebf2', transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false });
  const rail = new THREE.MeshStandardMaterial({ color: '#c9c3b6', roughness: 0.25, metalness: 0.9 });
  // balustrades along the stair well (sloped panels approximated by stepped glass)
  for (let i = 0; i < 9; i++) {
    const y1 = (i + 1) * rise, z = f1.zStart - (i + 0.5) * run;
    B(g, 0.015, 0.9, run, f1.x1 + 0.01, y1, z, gl);
    const y2 = 1.5 + (i + 1) * rise, z2 = f2.zStart + (i + 0.5) * run;
    B(g, 0.015, 0.9, run, f2.x0 - 0.01, y2, z2, gl);
  }
  B(g, f2.x0 - f1.x1, 0.9, 0.015, (f1.x1 + f2.x0) / 2, 1.5, landing[3] + 0.01, gl);
  // balcony railings + planters
  const par = new THREE.MeshStandardMaterial({ color: '#e4e0d8', roughness: 0.8 });
  const pot = new THREE.MeshStandardMaterial({ color: '#cfc6b8', roughness: 0.8 });
  const leaf = new THREE.MeshStandardMaterial({ color: '#4c7a3c', roughness: 0.85 });
  for (const r of ROOMS) {
    if (r.rail) {
      const [x0, z0, x1, z1] = r.r;
      for (const s of r.rail) {
        const horiz = s === 'n' || s === 's'; const L = horiz ? x1 - x0 : z1 - z0;
        const cx = horiz ? (x0 + x1) / 2 : (s === 'w' ? x0 : x1), cz = horiz ? (s === 'n' ? z0 : z1) : (z0 + z1) / 2;
        const dims = (h, t) => horiz ? [L, h, t] : [t, h, L];
        let d = dims(0.25, 0.15); B(g, ...d, cx, 0, cz, par);
        d = dims(0.8, 0.015); B(g, ...d, cx, 0.25, cz, gl);
        d = dims(0.05, 0.06); B(g, ...d, cx, 1.05, cz, rail);
      }
      [[x0 + 0.4, z0 + 0.4], [x1 - 0.4, z0 + 0.4], [x0 + 0.4, z1 - 0.4], [x1 - 0.4, z1 - 0.4]].forEach(([x, z]) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.45, 20), pot); p.position.set(x, 0.225, z); p.castShadow = true; g.add(p);
        for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + k * 0.03, 1), leaf); s.position.set(x + (k - 1) * 0.06, 0.6 + k * 0.16, z + (k % 2) * 0.05); s.castShadow = true; g.add(s); }
      });
    }
    if (r.sky) {
      const [x0, z0, x1, z1] = r.r;
      for (let k = 0; k < 5; k++) { const x = x0 + 0.3 + k * (x1 - x0 - 0.6) / 4; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 2.6, 6), new THREE.MeshStandardMaterial({ color: '#7a8f4a' })); c.position.set(x, 1.3, z0 + 0.3); c.castShadow = true; g.add(c); const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), leaf); s.position.set(x, 2.5, z0 + 0.3); g.add(s); }
    }
  }
}
function buildCeiling() {
  const c = new THREE.Mesh(new THREE.PlaneGeometry(HALL[2] - HALL[0], HALL[3] - HALL[1]), new THREE.MeshStandardMaterial({ color: '#f7f5f0', roughness: 1, side: THREE.BackSide }));
  c.rotation.x = -Math.PI / 2; c.position.set((HALL[0] + HALL[2]) / 2, WALL_H, (HALL[1] + HALL[3]) / 2); c.visible = false; W.ceiling = c; W.scene.add(c);
  const room = ROOMS.find(r => r.sky); // open-to-sky cut-out: just skip, it's small
}

export function setFloor(roomId, type) {
  const m = W.floors[roomId]; if (!m) return;
  const r = ROOMS.find(q => q.id === roomId); const [x0, z0, x1, z1] = r.r;
  m.material.dispose(); m.material = floorMaterial(type, x1 - x0, z1 - z0);
}
