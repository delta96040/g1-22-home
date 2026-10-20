import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ITEM } from './catalog.js';

const loader = new GLTFLoader();
const cache = new Map();      // model id -> Promise<{scene, size}>
const BASE = 'models/';

export function loadModel(id) {
  if (!cache.has(id)) {
    cache.set(id, loader.loadAsync(BASE + id + '.glb').then(g => {
      const root = g.scene;
      root.traverse(o => {
        if (o.isMesh) {
          o.castShadow = o.receiveShadow = true;
          const m = o.material;
          m.color.convertSRGBToLinear();
          m.roughness = Math.min(0.9, m.roughness ?? 0.65);
          m.envMapIntensity = 0.6;
        }
      });
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      root.position.set(-center.x, -box.min.y, -center.z);
      // pick the material covering most triangles as the recolourable "main" one
      const tally = new Map();
      root.traverse(o => { if (o.isMesh) { const n = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count; tally.set(o.material.name, (tally.get(o.material.name) || 0) + n); } });
      let main = null, best = -1; for (const [k, v] of tally) if (v > best) { best = v; main = k; }
      return { root, size, main };
    }));
  }
  return cache.get(id);
}

/* ---------------- procedural pieces ---------------- */
const shared = {};
function S(name, make) { return shared[name] || (shared[name] = make()); }
const std = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const A = {
  get dark() { return S('dark', () => std('#2b2b2b', 0.6)); },
  get metal() { return S('metal', () => std('#b4b9bd', 0.3, 0.8)); },
  get gold() { return S('gold', () => std('#c9a35a', 0.3, 0.9)); },
  get white() { return S('white', () => std('#f4f4f2', 0.5)); },
  get stone() { return S('stone', () => std('#dcd7cf', 0.3)); },
  get screen() { return S('screen', () => new THREE.MeshStandardMaterial({ color: '#05070a', roughness: 0.12, metalness: 0.2 })); },
  get glass() { return S('glass', () => new THREE.MeshPhysicalMaterial({ color: '#d9ecf2', roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.35 })); },
  get mirror() { return S('mirror', () => new THREE.MeshStandardMaterial({ color: '#e8eef2', roughness: 0.02, metalness: 1.0, envMapIntensity: 1.4 })); },
  get cream() { return S('cream', () => std('#efe9df', 0.9)); },
};
function B(g, w, h, d, x, y, z, m) { const me = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.002), Math.max(h, 0.002), Math.max(d, 0.002)), m); me.position.set(x, y + h / 2, z); g.add(me); return me; }
function Cy(g, r1, r2, h, x, y, z, m, s = 20) { const me = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s), m); me.position.set(x, y + h / 2, z); g.add(me); return me; }
function legs4(g, w, d, h, ins, r, m) { [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => Cy(g, r, r, h, i * (w / 2 - ins), 0, j * (d / 2 - ins), m, 10)); }
function cab(g, w, d, h, m, doors) {
  B(g, w, h - 0.08, d, 0, 0.08, 0, m); B(g, w - 0.04, 0.08, d - 0.04, 0, 0, 0, A.dark);
  for (let i = 1; i < doors; i++) B(g, 0.006, h - 0.14, 0.004, -w / 2 + i * w / doors, 0.11, d / 2 + 0.001, A.dark);
  for (let i = 0; i < doors; i++) B(g, 0.014, Math.min(0.3, h * 0.2), 0.02, -w / 2 + (i + 0.5) * w / doors + (i % 2 ? -1 : 1) * w / doors * 0.36, h * 0.48, d / 2 + 0.01, A.metal);
}
// All builders: front faces +z, origin at floor centre, sized w × d × h.
export const BUILDERS = {
  box: (g, w, d, h, m) => B(g, w, h, d, 0, 0, 0, m),
  tvWall: (g, w, d, h, m) => { B(g, w, h, d, 0, 0, 0, std('#121315', 0.4)); B(g, w - 0.012, h - 0.012, 0.002, 0, 0.006, d / 2 + 0.001, A.screen); },
  panel: (g, w, d, h, m) => { B(g, w, h, 0.02, 0, 0, -d / 2 + 0.01, m); const n = Math.floor(w / 0.05); for (let i = 0; i < n; i++) Cy(g, 0.018, 0.018, h, -w / 2 + 0.025 + i * (w / n), 0, -d / 2 + 0.03, m, 8); },
  wardrobe: (g, w, d, h, m) => cab(g, w, d, h, m, Math.max(2, Math.round(w / 0.6))),
  slider: (g, w, d, h, m) => { B(g, w, h, d, 0, 0, 0, m); const n = Math.max(2, Math.round(w / 0.9)); for (let i = 0; i < n; i++) { const pw = w / n; const p = B(g, pw - 0.02, h - 0.06, 0.02, -w / 2 + (i + 0.5) * pw, 0.03, d / 2 + (i % 2 ? 0.02 : 0.005), i % 2 ? A.mirror : m); } },
  dresser: (g, w, d, h, m) => { B(g, w, 0.72, d, 0, 0.04, 0, m); legs4(g, w, d, 0.04, 0.04, 0.012, A.dark); B(g, w - 0.04, 0.005, 0.004, 0, 0.5, d / 2 + 0.001, A.dark); B(g, w * 0.7, h - 0.82, 0.03, 0, 0.8, -d / 2 + 0.03, m); B(g, w * 0.7 - 0.06, h - 0.88, 0.005, 0, 0.83, -d / 2 + 0.047, A.mirror); },
  mirror: (g, w, d, h, m) => { B(g, w, h, d, 0, 0, 0, m); B(g, w - 0.05, h - 0.05, 0.004, 0, 0.025, d / 2 + 0.002, A.mirror); },
  barCab: (g, w, d, h, m) => {
    B(g, w, 0.9, d, 0, 0, 0, m); B(g, w, 0.03, d, 0, 0.9, 0, A.stone); B(g, w, h - 0.93, 0.03, 0, 0.93, -d / 2 + 0.015, m);
    B(g, 0.03, h - 0.93, d, -w / 2 + 0.015, 0.93, 0, m); B(g, 0.03, h - 0.93, d, w / 2 - 0.015, 0.93, 0, m); B(g, w, 0.03, d, 0, h - 0.03, 0, m);
    for (const y of [1.28, 1.62]) B(g, w - 0.06, 0.02, d * 0.75, 0, y, -d / 2 + d * 0.375, A.glass);
    const cols = ['#5a2d1a', '#2f5a3a', '#c9a35a', '#7a1f2b'];
    for (let i = 0; i < 8; i++) { const c = std(cols[i % 4], 0.15); Cy(g, 0.035, 0.035, 0.22, -w / 2 + 0.12 + i * (w - 0.24) / 7, 0.93, -d / 2 + 0.16, c); Cy(g, 0.01, 0.015, 0.08, -w / 2 + 0.12 + i * (w - 0.24) / 7, 1.15, -d / 2 + 0.16, c); }
  },
  crockery: (g, w, d, h, m) => { cab(g, w, d, 0.9, m, 2); B(g, w, 0.03, d, 0, 0.9, 0, A.stone); B(g, w, h - 0.93, d * 0.8, 0, 0.93, -d * 0.1, m); B(g, w - 0.04, h - 0.97, 0.005, 0, 0.95, d * 0.3 + 0.003, A.glass); },
  island: (g, w, d, h, m) => { cab(g, w, d - 0.12, h - 0.04, m, 3); B(g, w + 0.08, 0.04, d, 0, h - 0.04, 0, A.stone); },
  shoeRack: (g, w, d, h, m) => {
    B(g, 0.03, h, d, -w / 2 + 0.015, 0, 0, m); B(g, 0.03, h, d, w / 2 - 0.015, 0, 0, m);
    const cols = ['#2b2b2b', '#a33', '#ddd', '#365', '#963', '#246'];
    for (let i = 0; i < 4; i++) { const y = i * (h - 0.03) / 3; B(g, w, 0.025, d, 0, y, 0, m); if (i < 3) for (let j = 0; j < Math.floor((w - 0.1) / 0.28); j++) { const c = std(cols[(i * 2 + j) % 6]); B(g, 0.1, 0.09, 0.26, -w / 2 + 0.12 + j * 0.28, y + 0.025, 0, c); B(g, 0.1, 0.09, 0.26, -w / 2 + 0.23 + j * 0.28, y + 0.025, 0, c); } }
  },
  shoeCab: (g, w, d, h, m) => { cab(g, w, d, h, m, Math.max(2, Math.round(w / 0.45))); B(g, w + 0.02, 0.03, d + 0.02, 0, h, 0, std('#8b5e3c', 0.5)); },
  ac: (g, w, d, h, m) => {
    const body = B(g, w, h * 0.8, d, 0, h * 0.2, 0, m); B(g, w - 0.02, h * 0.25, d * 0.8, 0, 0, 0.02 - d * 0.1, m);
    B(g, w - 0.08, 0.012, 0.01, 0, h * 0.12, d / 2 - 0.02, A.dark); B(g, 0.06, 0.012, 0.003, w / 2 - 0.12, h * 0.6, d / 2 + 0.002, std('#36c', 0.3));
  },
  art: (g, w, d, h, m) => { B(g, w, h, d, 0, 0, 0, std('#1d1d1d', 0.5)); B(g, w - 0.06, h - 0.06, 0.004, 0, 0.03, d / 2 + 0.002, m); B(g, (w - 0.06) * 0.4, (h - 0.06) * 0.5, 0.005, -(w - 0.06) * 0.15, 0.1, d / 2 + 0.003, std('#e8d9b8')); },
  curtain: (g, w, d, h, m) => {
    Cy(g, 0.012, 0.012, w + 0.2, 0, h - 0.04, 0, A.metal).rotation.z = Math.PI / 2;
    const folds = Math.round(w / 0.12); const pw = w * 0.32;
    for (const side of [-1, 1]) for (let i = 0; i < folds / 3; i++) { const c = Cy(g, 0.045, 0.05, h - 0.08, side * (w / 2 - pw / 2) + (i - folds / 6) * (pw / (folds / 3)), 0, (i % 2 ? 0.02 : -0.02), m, 10); }
  },
  mandir: (g, w, d, h, m) => {
    B(g, w, 0.75, d, 0, 0, 0, m); B(g, w, 0.04, d + 0.02, 0, 0.75, 0, A.stone);
    B(g, 0.05, h - 0.79, d, -w / 2 + 0.025, 0.79, 0, m); B(g, 0.05, h - 0.79, d, w / 2 - 0.025, 0.79, 0, m);
    B(g, w, h - 0.79, 0.02, 0, 0.79, -d / 2 + 0.01, std('#f2e3c4', 0.9)); B(g, w + 0.04, 0.12, d + 0.04, 0, h - 0.12, 0, m);
    const dome = new THREE.Mesh(new THREE.ConeGeometry(w * 0.3, 0.25, 8), m); dome.position.set(0, h + 0.12, 0); g.add(dome);
    Cy(g, 0.03, 0.03, 0.05, 0, 0.79, 0.05, A.gold); Cy(g, 0.06, 0.06, 0.18, 0, 0.79, -0.08, A.gold, 12);
  },
};

/* ---------------- build an item object ---------------- */
// state: {id, k, x, z, y, rot, w, d, h, c}
export async function buildItem(state) {
  const def = ITEM[state.k] || ITEM.custom;
  const outer = new THREE.Group();
  const inner = new THREE.Group();
  outer.add(inner);
  let main = [];
  if (def.m) {
    const { root, size, main: mainName } = await loadModel(def.m);
    const clone = root.clone(true);
    clone.traverse(o => {
      if (o.isMesh) {
        o.material = o.material.clone();
        if (o.material.name === mainName) main.push(o.material);
      }
    });
    const turn = new THREE.Group();
    turn.add(clone);
    turn.rotation.y = Math.PI;              // Kenney models face -z; ours face +z
    inner.add(turn);
    inner.scale.set(state.w / size.x, state.h / size.y, state.d / size.z);
  } else {
    const m = std(state.c || def.color || '#9aa8a2', 0.7);
    main.push(m);
    (BUILDERS[def.p] || BUILDERS.box)(inner, state.w, state.d, state.h, m);
    inner.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  }
  if (state.c && def.m) main.forEach(m => m.color.set(state.c));
  outer.userData = { id: state.id, main };
  outer.position.set(state.x, state.y, state.z);
  outer.rotation.y = state.rot;
  return outer;
}

export function recolor(obj, hex) { obj.userData.main.forEach(m => m.color.set(hex)); }
