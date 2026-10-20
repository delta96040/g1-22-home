import * as THREE from 'three';
import { ROOMS, OPENINGS, PLOT, CENTER, WALL_H, roomAt, wallFaces } from './plan.js';
import { ITEMS, ITEM, CATEGORIES, FLOOR_TYPES, PAINTS } from './catalog.js';
import { W, initWorld, setCamera, resize, render, buildWalls, setFloor, floorMaterial } from './scene.js';
import { buildItem, recolor, BUILDERS } from './items.js';
import { buildSVG } from './export.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const stage = $('#stage');
const isPhone = () => matchMedia('(max-width: 820px)').matches;
const deg = r => Math.round((((r * 180 / Math.PI) % 360) + 360) % 360);
const cm = v => Math.round(v * 100);

/* ======================= state ======================= */
const KEY = 'g122-home-v2';
let state = { v: 2, items: [], next: 1, rooms: {}, hallFloor: 'marble' };
const undoStack = [], redoStack = [];
function snapshot() { return JSON.stringify(state); }
function commit(prev) { undoStack.push(prev); if (undoStack.length > 80) undoStack.shift(); redoStack.length = 0; save(); updateUndo(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } renderList(); }
function updateUndo() { $('#undo').disabled = !undoStack.length; $('#redo').disabled = !redoStack.length; }
async function restore(json) { state = JSON.parse(json); await applyAll(); save(); }
$('#undo').onclick = async () => { if (!undoStack.length) return; redoStack.push(snapshot()); await restore(undoStack.pop()); select(null); updateUndo(); };
$('#redo').onclick = async () => { if (!redoStack.length) return; undoStack.push(snapshot()); await restore(redoStack.pop()); select(null); updateUndo(); };

function mk(k, x, z, rot = 0, extra = {}) {
  const d = ITEM[k];
  return { id: state.next++, k, n: d.name, x, z, y: d.y || 0, rot, w: d.size[0], d: d.size[1], h: d.size[2], c: null, ...extra };
}
function expandSet(k, x, z, rot = 0) {
  const d = ITEM[k]; const g = 'g' + state.next; const out = [];
  const cs = Math.cos(rot), sn = Math.sin(rot);
  for (const [pk, px, pz, pr, py] of d.set) {
    // rotate local offset (px,pz) by rot about y
    const wx = x + px * cs + pz * sn, wz = z - px * sn + pz * cs;
    out.push(mk(pk, wx, wz, rot + (pr || 0) * Math.PI / 180, { g, ...(py != null ? { y: py } : {}) }));
  }
  return out;
}
const R = Math.PI;
function seed() {
  state = { v: 2, items: [], next: 1, rooms: {}, hallFloor: 'marble' };
  const add = (...a) => state.items.push(mk(...a));
  const set = (...a) => state.items.push(...expandSet(...a));
  // Lounge
  add('rugRect', 4.75, 8.55, R / 2); add('sofaL', 6.3, 8.55, -R / 2); add('coffee', 4.65, 8.55, R / 2);
  add('tvUnit', 3.075, 8.55, R / 2); add('tv55', 2.877, 8.55, R / 2); add('ac', 2.967, 8.55, R / 2);
  add('floorLamp', 6.85, 7.15); add('plant', 3.25, 7.1); add('fan', 4.9, 8.55);
  // Dining
  set('setDining6', 6.35, 16.95, 0); add('crockery', 4.6, 19.0, R);
  // Drawing room
  add('sofa3', 5.67, 23.13, R); add('armchair', 4.4, 21.5, R / 2); add('armchair', 6.95, 21.5, -R / 2);
  add('coffeeGlass', 5.67, 21.9); add('rugRounded', 5.67, 22.0); add('barCab', 4.105, 20.45, R / 2); add('ac', 5.67, 19.565, 0, { y: 2.35 });
  // Bedroom 15
  add('bedKing', 3.895, 4.3, R / 2); add('bedside', 3.03, 3.05, R / 2); add('bedside', 3.03, 5.55, R / 2);
  add('tableLamp', 3.03, 3.05, R / 2); add('wardrobe3', 6.03, 4.3, -R / 2); add('ac', 2.937, 4.3, R / 2);
  add('desk', 4.85, 6.26, R); add('deskChair', 4.85, 5.75, 0); add('laptop', 4.85, 6.24, R); add('fan', 4.6, 4.3);
  // Bedroom 18
  add('bedQueen', 9.08, 4.3, -R / 2); add('bedside', 9.92, 3.2, -R / 2); add('bedside', 9.92, 5.4, -R / 2);
  add('wardrobeSlide', 7.9, 2.395, 0); add('ac', 10.015, 4.3, -R / 2); add('mirrorFull', 6.535, 4.6, R / 2);
  // Bedroom 5 + guest 13
  add('bedQueen', 1.42, 12.5, R / 2); add('wardrobe2', 2.95, 10.94, 0); add('bedside', 0.58, 11.2, R / 2);
  add('bedQueen', 1.42, 21.6, R / 2); add('bedside', 0.58, 20.3, R / 2); add('dresser', 3.36, 22.2, -R / 2);
  // Kitchen run on the east wall
  const kx = 9.83;
  add('kBase', kx, 19.95, -R / 2); add('kSink', kx, 20.55, -R / 2); add('kDrawer', kx, 21.15, -R / 2); add('kStove', kx, 21.75, -R / 2); add('kBase', kx, 22.35, -R / 2);
  add('fridgeDD', 9.77, 23.13, -R / 2); add('kHood', 9.905, 21.75, -R / 2); add('kUpper', 9.955, 19.95, -R / 2); add('kUpper2', 9.955, 20.55, -R / 2);
  add('micro', 9.85, 22.35, -R / 2, { y: 0.9 });
  // Bathrooms
  add('wc', 2.51, 17.55, R / 2); add('vanity', 3.5, 17.245, 0); add('cupboard', 2.395, 19.015, R / 2, { w: 0.82 });
  add('shower', 0.82, 2.52, 0); add('wc', 0.71, 3.6, R / 2); add('vanity', 1.95, 2.345, 0);
  add('wc', 0.71, 18.6, R / 2); add('basin', 1.5, 17.195, 0);
  // Hall & balconies
  add('shoeCab', 9.965, 17.9, -R / 2); add('designChair', 4.4, 1.0, R); add('designChair', 6.1, 1.0, R); add('coffeeSq', 5.25, 0.6);
}
function load() {
  const h = location.hash.startsWith('#d=') ? location.hash.slice(3) : null;
  if (h) return decodeShare(h).then(s => { if (s) { state = s; history.replaceState(null, '', location.pathname); } else loadLocal(); });
  loadLocal(); return Promise.resolve();
}
function loadLocal() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 2 && Array.isArray(s.items)) { state = s; return; } } catch (e) { } seed(); }

/* ======================= world ======================= */
initWorld(stage);
let wallMode = 'auto', view = 'orbit', snapOn = true, measureOn = false;
const objs = new Map();
let faces = [];
let wallKey = '';
function camDir() { const dx = W.persp.position.x - W.orbit.target.x, dz = W.persp.position.z - W.orbit.target.z, l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; }
function rebuildWalls() {
  const mode = view === 'walk' ? 'full' : view === 'plan' && (wallMode === 'auto' || wallMode === 'full') ? 'plan' : wallMode;
  const dir = camDir();
  wallKey = mode + Math.round(Math.atan2(dir[1], dir[0]) / (Math.PI / 8)) + (focusedRoom ? focusedRoom.id : '');
  buildWalls(mode, Object.fromEntries(Object.entries(state.rooms).filter(([, v]) => v.paint).map(([k, v]) => [k, v.paint])), { dir, room: focusedRoom ? focusedRoom.id : null });
  faces = wallFaces(W.pieces);
}
function maybeRebuildWalls() {
  if (view !== 'orbit' || wallMode !== 'auto') return;
  const dir = camDir(); const key = 'auto' + Math.round(Math.atan2(dir[1], dir[0]) / (Math.PI / 8)) + (focusedRoom ? focusedRoom.id : '');
  if (key !== wallKey) rebuildWalls();
}
async function applyAll() {
  for (const r of ROOMS) { if (!r.floor) continue; const t = state.rooms[r.id]?.floor; setFloor(r.id, t || r.floor); }
  const hm = W.floors.hall; hm.material.dispose(); hm.material = floorMaterial(state.hallFloor || 'marble', 10.26, 21.79);
  rebuildWalls();
  W.groups.items.clear(); objs.clear();
  await Promise.all(state.items.map(renderItem));
}
async function renderItem(it) {
  const o = await buildItem(it);
  const old = objs.get(it.id); if (old) W.groups.items.remove(old);
  if (!state.items.includes(it)) return;   // deleted while loading
  o.userData.k = it.k;
  W.groups.items.add(o); objs.set(it.id, o);
  if (selected && groupOf(selected).includes(it)) refreshSelection();
}
function placeObj(it) { const o = objs.get(it.id); if (!o) return; o.position.set(it.x, it.y, it.z); o.rotation.y = it.rot; }
const getItem = id => state.items.find(i => i.id === id);
const groupOf = it => it.g ? state.items.filter(i => i.g === it.g) : [it];

/* ======================= labels overlay ======================= */
const overlay = $('#labels');
const roomLabels = ROOMS.filter(r => !r.noLabel).map(r => {
  const el = document.createElement('div'); el.className = 'rlabel';
  el.innerHTML = `<i>${r.id}</i><b>${r.name}</b><span>${r.dim}</span>`; el.title = `${r.id} · ${r.name} · ${r.dim}`;
  el.onclick = () => focusRoom(r.id);
  overlay.appendChild(el);
  const [x0, z0, x1, z1] = r.r;
  return { el, p: new THREE.Vector3((x0 + x1) / 2, r.stairs ? 1.6 : 0.1, (z0 + z1) / 2), a: new THREE.Vector3(x0, 0, (z0 + z1) / 2), b: new THREE.Vector3(x1, 0, (z0 + z1) / 2), area: (x1 - x0) * (z1 - z0), r, mode: '' };
}).sort((p, q) => q.area - p.area);
let labelsOn = true;
const tmpV = new THREE.Vector3();
function toScreen(p) { tmpV.copy(p).project(W.cam); return { x: (tmpV.x + 1) / 2 * stage.clientWidth, y: (1 - tmpV.y) / 2 * stage.clientHeight, ok: tmpV.z < 1 && tmpV.z > -1 }; }
function updateLabels() {
  const show = labelsOn && view !== 'walk';
  const placed = [];
  for (const L of roomLabels) {
    if (!show) { L.el.hidden = true; continue; }
    const s = toScreen(L.p); if (!s.ok) { L.el.hidden = true; continue; }
    const sa = toScreen(L.a), sb = toScreen(L.b); const px = Math.hypot(sa.x - sb.x, sa.y - sb.y);
    const mode = px > 150 ? 'full' : px > 80 ? 'name' : 'badge';
    if (mode !== L.mode) { L.el.className = 'rlabel ' + mode; L.mode = mode; L.w = 0; }
    if (!L.w) { L.el.hidden = false; L.w = L.el.offsetWidth; L.h = L.el.offsetHeight; }
    const rect = [s.x - L.w / 2, s.y - L.h / 2, s.x + L.w / 2, s.y + L.h / 2];
    const hit = placed.some(q => rect[0] < q[2] && rect[2] > q[0] && rect[1] < q[3] && rect[3] > q[1]);
    L.el.hidden = hit; if (hit) continue; placed.push(rect);
    L.el.style.transform = `translate(${s.x}px,${s.y}px) translate(-50%,-50%)`;
  }
  for (const d of dimLabels) { const s = toScreen(d.p); d.el.hidden = !s.ok || view === 'walk'; d.el.style.transform = `translate(${s.x}px,${s.y}px) translate(-50%,-50%)`; }
}

/* ======================= selection, dimension guides ======================= */
let selected = null;
const selGroup = new THREE.Group(); W.groups.helpers.add(selGroup);
let dimLabels = [];
const accent = new THREE.Color('#d48a1e');
function clearDims() { selGroup.clear(); dimLabels.forEach(d => d.el.remove()); dimLabels = []; }
function dimLabel(text, p, cls = '') { const el = document.createElement('div'); el.className = 'dlabel ' + cls; el.textContent = text; overlay.appendChild(el); dimLabels.push({ el, p: p.clone() }); }
function footprint(it) { const c = Math.abs(Math.cos(it.rot)), s = Math.abs(Math.sin(it.rot)); return { hw: c * it.w / 2 + s * it.d / 2, hd: s * it.w / 2 + c * it.d / 2 }; }
function groupBox(items) {
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity, y1 = 0;
  for (const it of items) { const { hw, hd } = footprint(it); x0 = Math.min(x0, it.x - hw); x1 = Math.max(x1, it.x + hw); z0 = Math.min(z0, it.z - hd); z1 = Math.max(z1, it.z + hd); y1 = Math.max(y1, it.y + it.h); }
  return { x0, z0, x1, z1, y0: Math.min(...items.map(i => i.y)), y1 };
}
function refreshSelection() {
  clearDims();
  if (!selected) { $('#gaps').hidden = true; return; }
  const it = selected; const items = groupOf(it);
  // oriented outline for single item, AABB for groups
  const lineMat = new THREE.LineBasicMaterial({ color: accent, depthTest: false, transparent: true });
  if (items.length === 1) {
    const g = new THREE.Group(); g.position.set(it.x, it.y, it.z); g.rotation.y = it.rot;
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(it.w + 0.02, it.h + 0.02, it.d + 0.02)), lineMat);
    e.position.y = it.h / 2; e.renderOrder = 20; g.add(e);
    // front marker
    const fm = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 3), new THREE.MeshBasicMaterial({ color: accent, depthTest: false }));
    fm.rotation.x = Math.PI / 2; fm.position.set(0, 0.03, it.d / 2 + 0.16); fm.renderOrder = 21; g.add(fm);
    selGroup.add(g);
    const fwd = new THREE.Vector3(Math.sin(it.rot), 0, Math.cos(it.rot)), right = new THREE.Vector3(Math.cos(it.rot), 0, -Math.sin(it.rot));
    const base = new THREE.Vector3(it.x, it.y + it.h + 0.05, it.z);
    dimLabel(`${cm(it.w)} cm`, base.clone().addScaledVector(fwd, it.d / 2 + 0.05), 'dim');
    dimLabel(`${cm(it.d)} cm`, base.clone().addScaledVector(right, it.w / 2 + 0.05), 'dim');
    dimLabel(`H ${cm(it.h)}${it.y > 0.02 ? ' · ↑' + cm(it.y) : ''}`, new THREE.Vector3(it.x, it.y + it.h + 0.3, it.z), 'dim h');
  } else {
    const b = groupBox(items);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(b.x1 - b.x0 + 0.04, b.y1 - b.y0 + 0.02, b.z1 - b.z0 + 0.04)), lineMat);
    e.position.set((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2); e.renderOrder = 20; selGroup.add(e);
    dimLabel(`${cm(b.x1 - b.x0)} × ${cm(b.z1 - b.z0)} cm`, new THREE.Vector3((b.x0 + b.x1) / 2, b.y1 + 0.3, (b.z0 + b.z1) / 2), 'dim h');
  }
  // clearance to nearest walls in 4 directions
  const b = groupBox(items); const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
  const dirs = [
    { name: 'W', test: f => f.axis === 'z' && f.n === 1 && f.pos <= b.x0 + 0.001 && cz >= f.a && cz <= f.b, dist: f => b.x0 - f.pos, a: f => new THREE.Vector3(f.pos, 0.03, cz), bpt: () => new THREE.Vector3(b.x0, 0.03, cz) },
    { name: 'E', test: f => f.axis === 'z' && f.n === -1 && f.pos >= b.x1 - 0.001 && cz >= f.a && cz <= f.b, dist: f => f.pos - b.x1, a: f => new THREE.Vector3(f.pos, 0.03, cz), bpt: () => new THREE.Vector3(b.x1, 0.03, cz) },
    { name: 'N', test: f => f.axis === 'x' && f.n === 1 && f.pos <= b.z0 + 0.001 && cx >= f.a && cx <= f.b, dist: f => b.z0 - f.pos, a: f => new THREE.Vector3(cx, 0.03, f.pos), bpt: () => new THREE.Vector3(cx, 0.03, b.z0) },
    { name: 'S', test: f => f.axis === 'x' && f.n === -1 && f.pos >= b.z1 - 0.001 && cx >= f.a && cx <= f.b, dist: f => f.pos - b.z1, a: f => new THREE.Vector3(cx, 0.03, f.pos), bpt: () => new THREE.Vector3(cx, 0.03, b.z1) },
  ];
  const gapTxt = [];
  for (const D of dirs) {
    let best = null, bd = 6;
    for (const f of faces) if (D.test(f)) { const d = D.dist(f); if (d >= -0.005 && d < bd) { bd = d; best = f; } }
    if (!best) continue;
    const p1 = D.a(best), p2 = D.bpt();
    if (bd > 0.015) {
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), new THREE.LineDashedMaterial({ color: accent, dashSize: 0.08, gapSize: 0.05, depthTest: false }));
      l.computeLineDistances(); l.renderOrder = 19; selGroup.add(l);
      dimLabel(`${cm(bd)}`, p1.clone().lerp(p2, 0.5), 'gap');
    }
    gapTxt.push(`${{ W: '←', E: '→', N: '↑', S: '↓' }[D.name]} <b>${cm(Math.max(0, bd))}</b>`);
  }
  const r = roomAt(cx, cz);
  $('#gaps').innerHTML = `${r ? r.id + ' ' + r.name + ' · ' : ''}clearance ${gapTxt.join('  ')} cm`;
  $('#gaps').hidden = false;
}
function select(it) {
  selected = it || null;
  refreshSelection(); fillInspector();
  if (selected && isPhone()) closeSheet();
}

/* ======================= inspector ======================= */
const insp = $('#insp');
function fillInspector() {
  if (!selected) { insp.hidden = true; return; }
  const it = selected, d = ITEM[it.k], grp = groupOf(it).length > 1;
  insp.hidden = false;
  $('#iThumb').src = thumbSrc(it.k);
  $('#iName').value = it.n;
  $('#iCat').textContent = grp ? `${d.cat} · part of a set of ${groupOf(it).length}` : d.cat;
  $('#iW').value = cm(it.w); $('#iD').value = cm(it.d); $('#iH').value = cm(it.h); $('#iY').value = cm(it.y);
  $('#iR').value = deg(it.rot); $('#iRs').value = deg(it.rot);
  $('#ungroup').hidden = !grp;
  $$('#iSw button').forEach(b => b.setAttribute('aria-pressed', it.c === b.dataset.c));
}
function editSel(fn, rebuild) {
  if (!selected) return; const prev = snapshot();
  fn(selected); if (rebuild) renderItem(selected); else placeObj(selected);
  refreshSelection(); commit(prev);
}
const numIn = (id, k, min, rebuild) => $(id).addEventListener('change', e => { const v = parseFloat(e.target.value); if (!isFinite(v)) return fillInspector(); editSel(it => { it[k] = Math.max(min, v) / 100; }, rebuild); });
numIn('#iW', 'w', 1, true); numIn('#iD', 'd', 1, true); numIn('#iH', 'h', 1, true); numIn('#iY', 'y', 0, false);
$('#iName').addEventListener('change', e => editSel(it => { it.n = e.target.value.trim() || ITEM[it.k].name; }, false));
function rotateSel(byDeg, abs) {
  if (!selected) return; const prev = snapshot();
  const items = groupOf(selected);
  const b = groupBox(items); const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
  const delta = abs != null ? (abs * Math.PI / 180 - selected.rot) : byDeg * Math.PI / 180;
  const c = Math.cos(delta), s = Math.sin(delta);
  for (const it of items) {
    if (items.length > 1) { const dx = it.x - cx, dz = it.z - cz; it.x = cx + dx * c + dz * s; it.z = cz - dx * s + dz * c; }
    it.rot += delta; placeObj(it);
  }
  refreshSelection(); fillInspector(); commit(prev);
}
$('#iR').addEventListener('change', e => rotateSel(0, parseFloat(e.target.value) || 0));
$('#iRs').addEventListener('input', e => { $('#iR').value = e.target.value; });
$('#iRs').addEventListener('change', e => rotateSel(0, parseFloat(e.target.value)));
$('#rL').onclick = () => rotateSel(90); $('#rR').onclick = () => rotateSel(-90); $('#r15').onclick = () => rotateSel(15);
$('#iClose').onclick = () => select(null);
$('#dup').onclick = () => {
  if (!selected) return; const prev = snapshot();
  const items = groupOf(selected); const g = items.length > 1 ? 'g' + state.next : undefined; let first;
  for (const it of items) { const c = { ...it, id: state.next++, x: clampX(it.x + 0.4), z: clampZ(it.z + 0.4), g }; state.items.push(c); renderItem(c); if (it === selected) first = c; }
  select(first); commit(prev);
};
$('#del').onclick = () => deleteSel();
function deleteSel() {
  if (!selected) return; const prev = snapshot();
  const ids = new Set(groupOf(selected).map(i => i.id));
  state.items = state.items.filter(i => !ids.has(i.id));
  ids.forEach(id => { const o = objs.get(id); if (o) W.groups.items.remove(o); objs.delete(id); });
  select(null); commit(prev);
}
$('#ungroup').onclick = () => { if (!selected) return; const prev = snapshot(); groupOf(selected).forEach(i => delete i.g); refreshSelection(); fillInspector(); commit(prev); };
const SW = ['#5f7552', '#4f6b4a', '#c49a2c', '#b3392f', '#2f4f7a', '#6d6a64', '#3a3836', '#8a5a36', '#c8a882', '#e8e2d6', '#f4f4f2', '#111214'];
SW.forEach(c => { const b = document.createElement('button'); b.style.background = c; b.dataset.c = c; b.title = c; b.setAttribute('aria-label', 'Colour ' + c); b.onclick = () => setColor(c); $('#iSw').appendChild(b); });
$('#iC').addEventListener('change', e => setColor(e.target.value));
$('#iCreset').onclick = () => setColor(null);
function setColor(c) { editSel(it => { it.c = c; }, true); fillInspector(); }

/* ======================= picking & dragging ======================= */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function setRay(e) { const r = W.renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, W.cam); }
function pick(e) {
  setRay(e);
  const hits = ray.intersectObjects(W.groups.items.children, true);
  for (const h of hits) { let o = h.object; while (o && o.userData.id == null) o = o.parent; if (o) return getItem(o.userData.id); }
  return null;
}
function floorAt(e) { setRay(e); const p = new THREE.Vector3(); return ray.ray.intersectPlane(plane, p) ? p : null; }
const clampX = v => Math.min(PLOT.x1, Math.max(PLOT.x0, v)), clampZ = v => Math.min(PLOT.z1, Math.max(PLOT.z0, v));

// wall snapping: back of item flush against the nearest wall face, item turned to face the room
function wallSnap(it, x, z) {
  const d = ITEM[it.k]; if (!snapOn || !d.wall || it.g) return null;
  let best = null, bestScore = 0.45;
  for (const f of faces) {
    const along = f.axis === 'x' ? x : z, perp = f.axis === 'x' ? z : x;
    if (along < f.a - 0.05 || along > f.b + 0.05) continue;
    const dist = (perp - f.pos) * f.n;            // >0 when on the open side of the face
    if (dist < -0.1) continue;
    const score = Math.abs(dist - it.d / 2);
    if (score < bestScore) { bestScore = score; best = f; }
  }
  if (!best) return null;
  const off = best.pos + best.n * (it.d / 2 + 0.003);
  const rot = best.axis === 'x' ? (best.n > 0 ? 0 : Math.PI) : (best.n > 0 ? Math.PI / 2 : -Math.PI / 2);
  // keep the item's extent within the wall span
  const half = it.w / 2; let along = best.axis === 'x' ? x : z;
  if (best.b - best.a > it.w) along = Math.min(best.b - half, Math.max(best.a + half, along));
  return best.axis === 'x' ? { x: along, z: off, rot } : { x: off, z: along, rot };
}

let down = null, drag = null;
stage.addEventListener('pointerdown', e => {
  if (e.target !== W.renderer.domElement || view === 'walk' || e.button > 0) return;
  down = { x: e.clientX, y: e.clientY };
  if (measureOn) return;
  const it = pick(e);
  if (it) {
    if (selected !== it) select(it);
    const p = floorAt(e); if (!p) return;
    const items = groupOf(it);
    drag = { items, start: items.map(i => ({ x: i.x, z: i.z, rot: i.rot })), p0: p, prev: snapshot(), moved: false };
    W.orbit.enabled = W.plan.enabled = false;
    stage.classList.add('dragging');
  }
}, { capture: true });
window.addEventListener('pointermove', e => {
  if (!drag) { hoverCursor(e); return; }
  const p = floorAt(e); if (!p) return;
  const dx = p.x - drag.p0.x, dz = p.z - drag.p0.z;
  if (!drag.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4) return;
  drag.moved = true;
  if (drag.items.length === 1) {
    const it = drag.items[0], s0 = drag.start[0];
    let x = clampX(s0.x + dx), z = clampZ(s0.z + dz);
    const sn = e.altKey ? null : wallSnap(it, x, z);
    if (sn) { it.x = sn.x; it.z = sn.z; it.rot = sn.rot; } else { it.x = Math.round(x * 100) / 100; it.z = Math.round(z * 100) / 100; it.rot = s0.rot; }
    placeObj(it);
  } else drag.items.forEach((it, i) => { it.x = clampX(drag.start[i].x + dx); it.z = clampZ(drag.start[i].z + dz); placeObj(it); });
  refreshSelection(); fillInspector();
});
window.addEventListener('pointerup', e => {
  if (drag) {
    if (drag.moved) commit(drag.prev);
    drag = null; W.orbit.enabled = view === 'orbit'; W.plan.enabled = view === 'plan'; stage.classList.remove('dragging'); down = null; return;
  }
  if (!down || e.target !== W.renderer.domElement) { down = null; return; }
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6; down = null; if (moved) return;
  if (measureOn) { const p = floorAt(e); if (p) addMeasure(p); return; }
  if (!pick(e)) select(null);
});
let lastHover = 0;
function hoverCursor(e) {
  if (e.pointerType !== 'mouse' || view === 'walk' || e.target !== W.renderer.domElement) return;
  const now = performance.now(); if (now - lastHover < 60) return; lastHover = now;
  stage.style.cursor = measureOn ? 'crosshair' : pick(e) ? 'grab' : '';
}

/* catalogue drag & drop onto the stage (desktop) */
stage.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('text/item')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
stage.addEventListener('drop', e => { const k = e.dataTransfer.getData('text/item'); if (!k) return; e.preventDefault(); const p = floorAt(e); if (p) addItem(k, p.x, p.z); });

function addItem(k, x, z) {
  const prev = snapshot(); const d = ITEM[k];
  if (x == null) {
    const t = focusedRoom ? { x: (focusedRoom.r[0] + focusedRoom.r[2]) / 2, z: (focusedRoom.r[1] + focusedRoom.r[3]) / 2 } : { x: W.ctrl.target.x, z: W.ctrl.target.z };
    x = t.x; z = t.z;
  }
  x = clampX(x); z = clampZ(z);
  let added;
  if (d.set) { added = expandSet(k, x, z, 0); state.items.push(...added); }
  else {
    const it = mk(k, x, z, 0); const sn = wallSnap(it, x, z); if (sn) Object.assign(it, sn);
    added = [it]; state.items.push(it);
  }
  added.forEach(renderItem);
  select(added[0]); commit(prev);
  toast(`Added ${d.name}. Drag it to place it${d.wall ? '; it snaps to walls' : ''}.`);
}

/* ======================= measure ======================= */
const mGroup = new THREE.Group(); W.groups.helpers.add(mGroup); let mStart = null; const mLabels = [];
function addMeasure(p) {
  p.x = Math.round(p.x * 100) / 100; p.z = Math.round(p.z * 100) / 100;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), new THREE.MeshBasicMaterial({ color: accent, depthTest: false })); dot.position.set(p.x, 0.04, p.z); dot.renderOrder = 22; mGroup.add(dot);
  if (!mStart) { mStart = p.clone(); hint('Tap the second point'); return; }
  const a = mStart; mStart = null;
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x, 0.04, a.z), new THREE.Vector3(p.x, 0.04, p.z)]), new THREE.LineBasicMaterial({ color: accent, depthTest: false })); l.renderOrder = 22; mGroup.add(l);
  const dist = Math.hypot(p.x - a.x, p.z - a.z);
  dimLabel(`${dist.toFixed(2)} m · ${(dist * 3.28084).toFixed(2)} ft`, new THREE.Vector3((a.x + p.x) / 2, 0.1, (a.z + p.z) / 2), 'measure');
  mLabels.push(dimLabels[dimLabels.length - 1]);
  hint(`${dist.toFixed(2)} m (${cm(dist)} cm). Tap two more points, or turn Measure off to clear.`);
}
function clearMeasure() { mGroup.clear(); mLabels.forEach(d => { d.el.remove(); dimLabels = dimLabels.filter(x => x !== d); }); mLabels.length = 0; mStart = null; }
$('#measure').onclick = e => {
  measureOn = !measureOn; e.currentTarget.setAttribute('aria-pressed', measureOn);
  if (measureOn) { select(null); hint('Measure: tap two points on the floor'); } else { clearMeasure(); hint(); }
};

/* ======================= views ======================= */
function setView(v) {
  if (view === 'walk' && v !== 'walk') exitWalk();
  view = v;
  $$('#views button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
  if (v === 'walk') { enterWalk(); return; }
  setCamera(v);
  rebuildWalls();
  hint();
}
$$('#views button').forEach(b => b.onclick = () => setView(b.dataset.v));
const WALL_LABEL = { auto: 'Walls: cutaway', full: 'Walls: full', low: 'Walls: low', off: 'Walls: off' };
$('#walls').onclick = () => { wallMode = { auto: 'full', full: 'low', low: 'off', off: 'auto' }[wallMode]; $('#walls').textContent = WALL_LABEL[wallMode]; rebuildWalls(); };
$('#snap').onclick = e => { snapOn = !snapOn; e.currentTarget.setAttribute('aria-pressed', snapOn); toast(snapOn ? 'Wall snap on' : 'Wall snap off. Hold Alt while dragging to skip it once.'); };
$('#labelsBtn').onclick = e => { labelsOn = !labelsOn; e.currentTarget.setAttribute('aria-pressed', labelsOn); };
$('#quality').onclick = e => { W.useAO = !W.useAO; e.currentTarget.setAttribute('aria-pressed', W.useAO); toast(W.useAO ? 'Soft shadows (ambient occlusion) on. Turn off if it feels slow.' : 'Ambient occlusion off'); };

let focusedRoom = null;
function frameRect([x0, z0, x1, z1], instant) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
  const dist = Math.max(w, d) * 1.35 + 3.2;
  flyTo(new THREE.Vector3(cx, 0, cz), new THREE.Vector3(cx + dist * 0.38, dist * 1.05, cz + dist * 0.5), instant);
  W.plan.target.set(cx, 0, cz); W.ortho.position.set(cx, 80, cz + 0.001);
  const asp = stage.clientWidth / stage.clientHeight || 1; W.ortho.zoom = Math.max(0.4, Math.min(30 * asp / (w + 1.2), 30 / (d + 1.2))); W.ortho.updateProjectionMatrix(); W.plan.update();
}
let fly = null;
function flyTo(target, pos, instant) {
  if (instant) { W.orbit.target.copy(target); W.persp.position.copy(pos); W.orbit.update(); return; }
  fly = { t: 0, t0: W.orbit.target.clone(), p0: W.persp.position.clone(), t1: target, p1: pos };
}
function focusRoom(id) {
  focusedRoom = id ? ROOMS.find(r => r.id === id) : null;
  if (view === 'walk') setView('orbit');
  frameRect(focusedRoom ? focusedRoom.r : [0, 0, PLOT.x1, PLOT.z1]);
  rebuildWalls(); showRoomDetail(focusedRoom);
  $$('.room-card').forEach(c => c.setAttribute('aria-current', c.dataset.id === id));
}

/* ======================= walk mode ======================= */
const walk = { yaw: 0, pitch: 0, keys: {}, joy: null, look: null, pos: new THREE.Vector3() };
function enterWalk() {
  select(null); setCamera('orbit'); W.orbit.enabled = false; rebuildWalls(); W.ceiling.visible = true;
  const r = focusedRoom && focusedRoom.id !== '1' && !focusedRoom.sky ? focusedRoom : ROOMS.find(q => q.id === '3');
  walk.pos.set((r.r[0] + r.r[2]) / 2, 1.6, (r.r[1] + r.r[3]) / 2); walk.yaw = Math.PI; walk.pitch = 0;
  W.persp.fov = 65; W.persp.updateProjectionMatrix();
  stage.classList.add('walking'); $('#walkUI').hidden = false;
  hint(isPhone() ? 'Left thumb: move · drag right side: look around' : 'Click the view to look with the mouse · WASD or arrow keys to move · Esc to stop');
}
function exitWalk() {
  W.ceiling.visible = false; stage.classList.remove('walking'); $('#walkUI').hidden = true;
  if (document.pointerLockElement) document.exitPointerLock();
  W.persp.fov = 45; W.persp.updateProjectionMatrix();
  W.persp.position.copy(walk.pos).add(new THREE.Vector3(6, 12, 9)); W.orbit.target.set(walk.pos.x, 0, walk.pos.z); W.orbit.update();
}
function collides(x, z) {
  const r = 0.22;
  for (const p of W.pieces) {
    if (p.y0 > 1.0) continue;
    const h = p.t / 2;
    const [ax0, ax1, az0, az1] = p.axis === 'x' ? [p.a, p.b, p.fixed - h, p.fixed + h] : [p.fixed - h, p.fixed + h, p.a, p.b];
    if (x > ax0 - r && x < ax1 + r && z > az0 - r && z < az1 + r) return true;
  }
  for (const o of OPENINGS) {
    if (o.kind !== 'fixed' && o.kind !== 'window') continue;
    const [ax0, ax1, az0, az1] = o.axis === 'x' ? [o.a, o.b, o.at - 0.1, o.at + 0.1] : [o.at - 0.1, o.at + 0.1, o.a, o.b];
    if (x > ax0 - r && x < ax1 + r && z > az0 - r && z < az1 + r) return true;
  }
  const ots = ROOMS.find(q => q.sky); if (ots && x > ots.r[0] && x < ots.r[2] && z > ots.r[1] && z < ots.r[3]) return true;
  return x < 0.1 || x > 10.4 || z < 0.1 || z > 25.65;
}
function stepWalk(dt) {
  let f = 0, s = 0;
  if (walk.keys.KeyW || walk.keys.ArrowUp) f += 1; if (walk.keys.KeyS || walk.keys.ArrowDown) f -= 1;
  if (walk.keys.KeyA || walk.keys.ArrowLeft) s -= 1; if (walk.keys.KeyD || walk.keys.ArrowRight) s += 1;
  if (walk.joy) { f += -walk.joy.y; s += walk.joy.x; }
  const len = Math.hypot(f, s);
  if (len > 0.01) {
    const sp = (walk.keys.ShiftLeft ? 3.2 : 1.6) * dt / Math.max(1, len);
    const fx = -Math.sin(walk.yaw), fz = -Math.cos(walk.yaw), rx = Math.cos(walk.yaw), rz = -Math.sin(walk.yaw);
    const nx = walk.pos.x + (fx * f + rx * s) * sp, nz = walk.pos.z + (fz * f + rz * s) * sp;
    if (!collides(nx, walk.pos.z)) walk.pos.x = nx;
    if (!collides(walk.pos.x, nz)) walk.pos.z = nz;
  }
  W.persp.position.copy(walk.pos);
  W.persp.rotation.set(walk.pitch, walk.yaw, 0, 'YXZ');
}
window.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (view === 'walk') { walk.keys[e.code] = true; if (e.code === 'Escape' && !document.pointerLockElement) setView('orbit'); if (e.code.startsWith('Arrow')) e.preventDefault(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); (e.shiftKey ? $('#redo') : $('#undo')).click(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); $('#redo').click(); return; }
  if (!selected) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSel(); }
  else if (e.key === 'r' || e.key === 'R') rotateSel(e.shiftKey ? -90 : 90);
  else if (e.key === 'Escape') select(null);
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); $('#dup').click(); }
  else if (e.key.startsWith('Arrow')) {
    e.preventDefault(); const st = e.shiftKey ? 0.1 : 0.01; const prev = snapshot();
    const dx = e.key === 'ArrowLeft' ? -st : e.key === 'ArrowRight' ? st : 0, dz = e.key === 'ArrowUp' ? -st : e.key === 'ArrowDown' ? st : 0;
    groupOf(selected).forEach(it => { it.x = clampX(it.x + dx); it.z = clampZ(it.z + dz); placeObj(it); }); refreshSelection(); fillInspector(); commit(prev);
  }
});
window.addEventListener('keyup', e => { walk.keys[e.code] = false; });
W.renderer.domElement.addEventListener('click', () => { if (view === 'walk' && !isPhone() && W.renderer.domElement.requestPointerLock) W.renderer.domElement.requestPointerLock(); });
document.addEventListener('mousemove', e => { if (view === 'walk' && document.pointerLockElement === W.renderer.domElement) { walk.yaw -= e.movementX * 0.0022; walk.pitch = Math.max(-1.3, Math.min(1.3, walk.pitch - e.movementY * 0.0022)); } });
// touch / pointer look + joystick
const joy = $('#joy'), knob = $('#knob');
joy.addEventListener('pointerdown', e => { joy.setPointerCapture(e.pointerId); walk.joyId = e.pointerId; moveJoy(e); });
joy.addEventListener('pointermove', e => { if (e.pointerId === walk.joyId) moveJoy(e); });
const endJoy = e => { if (e.pointerId === walk.joyId) { walk.joy = null; walk.joyId = null; knob.style.transform = ''; } };
joy.addEventListener('pointerup', endJoy); joy.addEventListener('pointercancel', endJoy);
function moveJoy(e) { const r = joy.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } walk.joy = { x, y }; knob.style.transform = `translate(${x * 32}px,${y * 32}px)`; }
stage.addEventListener('pointerdown', e => { if (view !== 'walk' || e.target !== W.renderer.domElement || e.pointerType === 'mouse') return; walk.look = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
stage.addEventListener('pointermove', e => { if (!walk.look || e.pointerId !== walk.look.id) return; walk.yaw += (e.clientX - walk.look.x) * 0.005; walk.pitch = Math.max(-1.2, Math.min(1.2, walk.pitch + (e.clientY - walk.look.y) * 0.004)); walk.look.x = e.clientX; walk.look.y = e.clientY; });
stage.addEventListener('pointerup', e => { if (walk.look && e.pointerId === walk.look.id) walk.look = null; });
stage.addEventListener('pointermove', e => { if (view === 'walk' && e.pointerType === 'mouse' && e.buttons === 1 && !document.pointerLockElement) { walk.yaw -= e.movementX * 0.004; walk.pitch = Math.max(-1.2, Math.min(1.2, walk.pitch - e.movementY * 0.004)); } });
$('#walkExit').onclick = () => setView('orbit');

/* ======================= catalogue UI ======================= */
const thumbs = {};
function thumbSrc(k) { const d = ITEM[k]; if (d.m) return `models/thumbs/${d.m}.jpg`; return thumbs[k] || ''; }
let cat = 'All';
function renderChips() {
  const c = $('#chips'); c.innerHTML = '';
  CATEGORIES.forEach(n => { const b = document.createElement('button'); b.textContent = n; b.setAttribute('aria-pressed', n === cat); b.onclick = () => { cat = n; renderChips(); renderGrid(); }; c.appendChild(b); });
}
function renderGrid() {
  const q = $('#q').value.trim().toLowerCase(); const g = $('#grid'); g.innerHTML = '';
  const list = ITEMS.filter(d => (cat === 'All' || d.cat === cat) && (!q || (d.name + ' ' + d.cat + ' ' + d.id).toLowerCase().includes(q)));
  if (!list.length) { g.innerHTML = `<p class="empty">Nothing matches "${q.replace(/</g, '&lt;')}". Try "custom block" and set your own size.</p>`; return; }
  for (const d of list) {
    const b = document.createElement('button'); b.className = 'card'; b.draggable = true; b.dataset.k = d.id;
    b.innerHTML = `<span class="ph"><img alt="" loading="lazy" src="${thumbSrc(d.id)}"></span><b></b><small>${cm(d.size[0])}×${cm(d.size[1])}${d.set ? '' : '×' + cm(d.size[2])} cm</small>`;
    b.querySelector('b').textContent = d.name;
    b.onclick = () => addItem(d.id);
    b.addEventListener('dragstart', e => { e.dataTransfer.setData('text/item', d.id); e.dataTransfer.effectAllowed = 'copy'; });
    g.appendChild(b);
  }
}
$('#q').addEventListener('input', renderGrid);

// thumbnails for procedural items and sets, rendered once in the browser
async function makeThumbs() {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
  r.setSize(216, 174); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  const sc = new THREE.Scene(); sc.environment = W.scene.environment;
  sc.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1.2)); const dl = new THREE.DirectionalLight(0xffffff, 2); dl.position.set(3, 5, 4); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(30, 216 / 174, 0.01, 100);
  for (const d of ITEMS) {
    if (d.m) continue;
    const g = new THREE.Group();
    const parts = d.set ? expandSetPreview(d) : [{ k: d.id, x: 0, z: 0, rot: 0, y: d.y ? 0 : 0, w: d.size[0], d: d.size[1], h: d.size[2], c: null, id: -1 }];
    for (const p of parts) g.add(await buildItem(p));
    sc.add(g);
    const box = new THREE.Box3().setFromObject(g); const s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const rad = Math.max(s.x, s.y, s.z) * 0.62 + 0.05;
    cam.position.set(c.x + rad * 1.6, c.y + rad * 1.25, c.z + rad * 2.1); cam.lookAt(c);
    r.render(sc, cam); thumbs[d.id] = r.domElement.toDataURL('image/png');
    sc.remove(g);
  }
  r.dispose(); renderGrid();
}
function expandSetPreview(d) {
  return d.set.map(([pk, px, pz, pr, py]) => { const s = ITEM[pk]; return { k: pk, x: px, z: pz, rot: (pr || 0) * Math.PI / 180, y: py || 0, w: s.size[0], d: s.size[1], h: s.size[2], c: null, id: -1 }; });
}

/* ======================= rooms panel ======================= */
function renderRooms() {
  const host = $('#roomList'); host.innerHTML = '';
  for (const r of ROOMS) {
    const b = document.createElement('button'); b.className = 'room-card'; b.dataset.id = r.id;
    const n = state.items.filter(i => roomAt(i.x, i.z)?.id === r.id).length;
    b.innerHTML = `<span class="no">${r.id}</span><span class="t"><b>${r.name}</b><small>${r.dim}</small></span><span class="cnt">${n || ''}</span>`;
    b.onclick = () => focusRoom(r.id);
    host.appendChild(b);
  }
}
function showRoomDetail(r) {
  const el = $('#roomDetail');
  if (!r) { el.hidden = true; return; }
  el.hidden = false;
  const [x0, z0, x1, z1] = r.r;
  const curFloor = r.floor ? (state.rooms[r.id]?.floor || r.floor) : (state.hallFloor || 'marble');
  el.innerHTML = `<div class="rd-head"><span class="no big">${r.id}</span><div><h3>${r.name}</h3><p>Brochure: ${r.dim} · drawn ${(x1 - x0).toFixed(2)} × ${(z1 - z0).toFixed(2)} m · ${((x1 - x0) * (z1 - z0) * 10.7639).toFixed(0)} sq ft</p></div></div>
    <div class="lbl">Floor${r.floor ? '' : ' (shared hall: lounge, dining, passages)'}</div><div class="floors" id="floorPick"></div>
    ${r.walls ? `<div class="lbl">Wall paint</div><div class="paints" id="paintPick"></div>` : ''}
    <div class="row"><button class="btn" id="rdTop">Plan view of this room</button><button class="btn" id="rdWalk">Walk in</button><button class="btn" id="rdSvg">Export room SVG</button></div>`;
  const fp = $('#floorPick');
  for (const [k, label] of Object.entries(FLOOR_TYPES)) {
    const b = document.createElement('button'); b.className = 'fsw'; b.title = label; b.setAttribute('aria-pressed', k === curFloor);
    b.innerHTML = `<i style="background-image:url(${floorThumb(k)})"></i><span>${label}</span>`;
    b.onclick = () => { const prev = snapshot(); if (r.floor) { state.rooms[r.id] = { ...state.rooms[r.id], floor: k }; setFloor(r.id, k); } else { state.hallFloor = k; const hm = W.floors.hall; hm.material.dispose(); hm.material = floorMaterial(k, 10.26, 21.79); } commit(prev); showRoomDetail(r); };
    fp.appendChild(b);
  }
  if (r.walls) {
    const pp = $('#paintPick'); const cur = state.rooms[r.id]?.paint || r.paint || '#f2efe9';
    for (const c of PAINTS) { const b = document.createElement('button'); b.style.background = c; b.title = c; b.setAttribute('aria-pressed', c === cur); b.onclick = () => setPaint(r, c); pp.appendChild(b); }
    const ci = document.createElement('input'); ci.type = 'color'; ci.value = cur; ci.title = 'Any colour'; ci.addEventListener('change', e => setPaint(r, e.target.value)); pp.appendChild(ci);
  }
  $('#rdTop').onclick = () => { setView('plan'); frameRect(r.r); };
  $('#rdWalk').onclick = () => { focusedRoom = r; setView('walk'); };
  $('#rdSvg').onclick = () => openExport(r.id);
}
function setPaint(r, c) { const prev = snapshot(); state.rooms[r.id] = { ...state.rooms[r.id], paint: c }; rebuildWalls(); commit(prev); showRoomDetail(r); }
const fthumb = {};
function floorThumb(k) {
  if (fthumb[k]) return fthumb[k];
  const m = floorMaterial(k, 1, 1); const img = m.map.image; const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(img, 0, 0, img.width / 3, img.height / 3, 0, 0, 64, 64);
  return (fthumb[k] = c.toDataURL());
}

/* ======================= item list ======================= */
function renderList() {
  const host = $('#itemList'); if (!host) return;
  const by = {};
  for (const it of state.items) { const r = roomAt(it.x, it.z); const key = r ? `${r.id} · ${r.name}` : 'Outside'; (by[key] = by[key] || []).push(it); }
  const keys = Object.keys(by).sort((a, b) => parseInt(a) - parseInt(b));
  $('#listCount').textContent = `${state.items.length} items`;
  host.innerHTML = keys.length ? '' : '<p class="empty">No furniture yet. Add some from the Furniture tab.</p>';
  for (const k of keys) {
    const sec = document.createElement('section'); sec.innerHTML = `<h4>${k}</h4>`;
    for (const it of by[k]) {
      const b = document.createElement('button'); b.className = 'li';
      b.innerHTML = `<img alt="" src="${thumbSrc(it.k)}"><span><b></b><small>${cm(it.w)} × ${cm(it.d)} × ${cm(it.h)} cm</small></span>`;
      b.querySelector('b').textContent = it.n;
      b.onclick = () => { select(it); const r = roomAt(it.x, it.z); if (r) frameRect(r.r); };
      sec.appendChild(b);
    }
    host.appendChild(sec);
  }
  renderRooms();
}

/* ======================= tabs & sheets ======================= */
function openTab(name) {
  $$('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === name));
  $$('.pane').forEach(p => p.hidden = p.id !== 'pane-' + name);
  if (isPhone()) { $('#side').classList.add('open'); }
}
function closeSheet() { $('#side').classList.remove('open'); }
$$('.tab').forEach(t => t.onclick = () => openTab(t.dataset.tab));
$$('[data-sheet-close]').forEach(b => b.onclick = closeSheet);
$$('#mobileBar button[data-tab]').forEach(b => b.onclick = () => { openTab(b.dataset.tab); });
$('#mTools').onclick = () => $('header').classList.toggle('tools-open');

/* ======================= hint / toast ======================= */
function hint(t) {
  $('#hint').textContent = t || (view === 'plan' ? 'Drag to pan · pinch or scroll to zoom · drag furniture to move it' : 'Drag to orbit · right-drag or two fingers to pan · tap furniture to edit · drag it to move');
}
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3200); }

/* ======================= modal: export, help, reset ======================= */
const modal = $('#modal');
function openModal(html) { modal.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; modal.hidden = false; modal.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal); }
function closeModal() { modal.hidden = true; modal.innerHTML = ''; }
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
function download(name, data, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function openExport(scope) {
  const opts = `<option value="all">Whole floor</option>` + ROOMS.map(r => `<option value="${r.id}">${r.id} · ${r.name}</option>`).join('');
  openModal(`<h2>Export</h2>
    <p>SVG plans are drawn to scale at 1 unit = 1 cm, with walls, doors, windows, room names and every piece of furniture. They open in Figma, Illustrator, Inkscape, AutoCAD (via import) or any browser.</p>
    <label class="lbl" for="scope">Plan to export</label><select id="scope" class="btn">${opts}</select>
    <div class="preview" id="pv"></div>
    <div class="row"><button class="btn primary" id="xSvg">Download SVG</button><button class="btn" id="xPng">Snapshot of current view (PNG)</button><button class="btn" id="xCsv">Furniture list (CSV)</button></div>
    <div class="lbl">Your design</div>
    <div class="row"><button class="btn" id="xJson">Save design file</button><button class="btn" id="xLoad">Open design file</button><button class="btn" id="xShare">Copy share link</button><button class="btn danger" id="xReset">Start over</button></div>
    <div class="status" id="st"></div>
    <div class="row end"><button class="btn" data-close>Close</button></div>`);
  const sc = $('#scope'); sc.value = scope || (focusedRoom ? focusedRoom.id : 'all');
  const upd = () => { $('#pv').innerHTML = buildSVG(state, sc.value); }; sc.onchange = upd; upd();
  const fname = () => 'G1-22-' + (sc.value === 'all' ? 'floor-plan' : ROOMS.find(r => r.id === sc.value).name.replace(/[^a-z0-9]+/gi, '-') + '-' + sc.value) + '.svg';
  $('#xSvg').onclick = () => { download(fname(), buildSVG(state, sc.value), 'image/svg+xml'); $('#st').textContent = 'Downloaded ' + fname(); };
  $('#xPng').onclick = () => { render(); W.renderer.domElement.toBlob(b => { download('G1-22-view.png', b); $('#st').textContent = 'Downloaded G1-22-view.png'; }, 'image/png'); };
  $('#xCsv').onclick = () => {
    const rows = [['Room', 'Item', 'Width cm', 'Depth cm', 'Height cm', 'Off floor cm']];
    for (const it of state.items) { const r = roomAt(it.x, it.z); rows.push([r ? `${r.id} ${r.name}` : 'Outside', it.n, cm(it.w), cm(it.d), cm(it.h), cm(it.y)]); }
    download('G1-22-furniture.csv', rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv'); $('#st').textContent = 'Downloaded G1-22-furniture.csv';
  };
  $('#xJson').onclick = () => { download('G1-22-design.json', JSON.stringify(state, null, 1), 'application/json'); $('#st').textContent = 'Saved G1-22-design.json'; };
  $('#xLoad').onclick = () => $('#fileIn').click();
  $('#xShare').onclick = async () => {
    const url = location.origin + location.pathname + '#d=' + await encodeShare(state);
    try { await navigator.clipboard.writeText(url); $('#st').textContent = 'Share link copied. Anyone who opens it sees this design.'; }
    catch (e) { $('#st').innerHTML = 'Copy this link: <input class="btn" style="width:100%" readonly value="' + url + '">'; }
  };
  $('#xReset').onclick = () => {
    openModal(`<h2>Start over?</h2><p>Choose what to reset. Save a design file first if you want to keep this version.</p>
      <div class="row"><button class="btn primary" id="rsSeed">Example furniture</button><button class="btn" id="rsEmpty">Empty house</button><button class="btn" data-close>Cancel</button></div>`);
    $('#rsSeed').onclick = async () => { const prev = snapshot(); seed(); await applyAll(); select(null); commit(prev); closeModal(); };
    $('#rsEmpty').onclick = async () => { const prev = snapshot(); state = { v: 2, items: [], next: 1, rooms: {}, hallFloor: 'marble' }; await applyAll(); select(null); commit(prev); closeModal(); };
  };
}
$('#exportBtn').onclick = () => openExport();
$('#fileIn').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = async () => {
    try { const s = JSON.parse(rd.result); if (s.v !== 2 || !Array.isArray(s.items)) throw 0; s.items = s.items.filter(i => ITEM[i.k]); const prev = snapshot(); state = s; await applyAll(); select(null); commit(prev); const st = $('#st'); if (st) st.textContent = `Opened ${s.items.length} items.`; }
    catch (err) { const st = $('#st'); if (st) st.textContent = 'That file is not a G1-22 design file.'; }
  };
  rd.readAsText(f); e.target.value = '';
};
async function encodeShare(s) {
  const bytes = new TextEncoder().encode(JSON.stringify(s));
  const cs = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const buf = new Uint8Array(await new Response(cs).arrayBuffer());
  let bin = ''; buf.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function decodeShare(h) {
  try {
    const bin = atob(h.replace(/-/g, '+').replace(/_/g, '/')); const buf = Uint8Array.from(bin, c => c.charCodeAt(0));
    const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    const s = JSON.parse(await new Response(ds).text()); return s.v === 2 ? s : null;
  } catch (e) { return null; }
}
$('#helpBtn2').onclick = () => $('#helpBtn').click();
$('#helpBtn').onclick = () => openModal(`<h2>How to use</h2>
  <ul class="help">
    <li><b>Add furniture</b>: tap an item in the Furniture tab, or drag it onto the house (desktop). It drops into the room you are focused on.</li>
    <li><b>Move</b>: drag any piece. Beds, sofas, wardrobes, TVs, ACs, kitchen and bath fittings snap flat against the nearest wall and turn to face the room. Hold Alt to skip snapping.</li>
    <li><b>Edit</b>: tap a piece to set its exact size in cm, height off the floor, rotation and colour. Dashed lines show the gap to each wall.</li>
    <li><b>Rooms</b>: pick a room to zoom in, change its floor and wall paint, walk in, or export its plan.</li>
    <li><b>Views</b>: 3D to orbit, Plan for a flat to-scale layout, Walk to stroll through at eye level.</li>
    <li><b>Keys</b>: R rotate · Shift+R rotate back · arrows nudge 1 cm (Shift for 10 cm) · Delete remove · Ctrl+D duplicate · Ctrl+Z undo.</li>
    <li><b>Saving</b>: your design saves in this browser automatically. Use Export to save a file, share a link, or download SVG plans.</li>
  </ul>
  <p>Room positions are traced from the DLF / Bhagwati brochure; labels show the brochure sizes. Furniture models: Kenney Furniture Kit (CC0).</p>
  <div class="row end"><button class="btn primary" data-close>Got it</button></div>`);

/* ======================= loop ======================= */
const ro = new ResizeObserver(() => resize(stage.clientWidth, stage.clientHeight)); ro.observe(stage);
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (fly) {
    fly.t = Math.min(1, fly.t + dt / 0.7); const e = 1 - Math.pow(1 - fly.t, 3);
    W.orbit.target.lerpVectors(fly.t0, fly.t1, e); W.persp.position.lerpVectors(fly.p0, fly.p1, e);
    if (fly.t >= 1) fly = null;
  }
  if (view === 'walk') stepWalk(dt); else { W.ctrl.update(); maybeRebuildWalls(); }
  render(); updateLabels();
}

/* ======================= boot ======================= */
(async () => {
  renderChips(); renderGrid(); renderRooms(); hint(); updateUndo();
  if (isPhone()) { $('#side').classList.remove('open'); W.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); }
  await load();
  if (isPhone()) { W.orbit.target.set(5.25, 0, 12.9); W.persp.position.set(5.25 + 3, 38, 12.9 + 21); W.orbit.update(); }
  rebuildWalls();
  requestAnimationFrame(loop);
  await applyAll(); save();
  $('#loading').hidden = true;
  makeThumbs();
  if (!localStorage.getItem('g122-help-seen')) { try { localStorage.setItem('g122-help-seen', '1'); } catch (e) { } setTimeout(() => $('#helpBtn').click(), 600); }
})();
window.__planner = { state: () => state, W, select: id => select(getItem(id)), setView, focusRoom };
