import { ROOMS, OPENINGS, STAIR, buildWallPieces } from './plan.js';
import { ITEM } from './catalog.js';

const FILL = { wood: '#ead9c2', walnut: '#cdb59a', marble: '#f3f2ee', stone: '#ece7df', tile: '#e1e5e6', ktile: '#e5ded3', black: '#c9c9cc', terrazzo: '#ece8e0', deck: '#ddcbb4', granite: '#bdbdc2', pebble: '#dad6ce', steel: '#d3d6d8', carpet: '#d8d3ca' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const k = v => +(v * 100).toFixed(1);

export function buildSVG(state, scope) {
  const room = scope === 'all' ? null : ROOMS.find(r => r.id === scope);
  const [x0, z0, x1, z1] = room ? room.r : [0.12, 0.12, 10.38, 25.6];
  const pad = room ? 0.85 : 0.5;
  const vx = (x0 - pad) * 100, vz = (z0 - pad) * 100, vw = (x1 - x0 + 2 * pad) * 100, vh = (z1 - z0 + 2 * pad) * 100 + 80;
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vz} ${vw} ${vh}" width="${vw}" height="${vh}" font-family="Helvetica, Arial, sans-serif">`);
  o.push(`<title>Plot G1-22 DLF Panchkula${room ? ' – ' + esc(room.id + ' ' + room.name) : ''}</title><desc>Units: 1 = 1 cm. Room labels show brochure sizes; walls and furniture are drawn to scale.</desc>`);
  o.push(`<rect x="${vx}" y="${vz}" width="${vw}" height="${vh}" fill="#ffffff"/>`);
  // floors
  o.push(`<g id="floors"><rect x="12" y="193" width="1026" height="2179" fill="${FILL[state.hallFloor] || FILL.marble}"/>`);
  for (const r of ROOMS) { if (!r.floor) continue; const t = state.rooms[r.id]?.floor || r.floor; o.push(`<rect id="floor-${r.id}" x="${k(r.r[0])}" y="${k(r.r[1])}" width="${k(r.r[2] - r.r[0])}" height="${k(r.r[3] - r.r[1])}" fill="${FILL[t]}"/>`); }
  o.push('</g>');
  // stairs
  o.push('<g id="stairs" stroke="#8c8c90" stroke-width="1.2" fill="none">');
  for (let i = 0; i <= 9; i++) o.push(`<line x1="${k(STAIR.f1.x0)}" y1="${k(STAIR.f1.zStart - i * STAIR.run)}" x2="${k(STAIR.f1.x1)}" y2="${k(STAIR.f1.zStart - i * STAIR.run)}"/><line x1="${k(STAIR.f2.x0)}" y1="${k(STAIR.f2.zStart + i * STAIR.run)}" x2="${k(STAIR.f2.x1)}" y2="${k(STAIR.f2.zStart + i * STAIR.run)}"/>`);
  o.push(`<path d="M ${k(7.2)} ${k(14.4)} L ${k(7.2)} ${k(11.2)} L ${k(9.5)} ${k(11.2)} L ${k(9.5)} ${k(14.4)}" stroke="#555" marker-end="url(#arr)"/></g>`);
  o.push('<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#555"/></marker></defs>');
  // walls (pieces that touch the floor)
  o.push('<g id="walls" fill="#24292a">');
  for (const p of buildWallPieces()) {
    if (p.y0 > 0.05) continue;
    if (p.axis === 'x') o.push(`<rect x="${k(p.a)}" y="${k(p.fixed - p.t / 2)}" width="${k(p.b - p.a)}" height="${k(p.t)}"/>`);
    else o.push(`<rect x="${k(p.fixed - p.t / 2)}" y="${k(p.a)}" width="${k(p.t)}" height="${k(p.b - p.a)}"/>`);
  }
  o.push('</g>');
  // openings: windows, sliders, door swings
  o.push('<g id="openings" fill="none">');
  for (const op of OPENINGS) {
    const line = (a, b, off, st, w) => op.axis === 'x' ? `<line x1="${k(a)}" y1="${k(op.at + off)}" x2="${k(b)}" y2="${k(op.at + off)}" stroke="${st}" stroke-width="${w}"/>` : `<line x1="${k(op.at + off)}" y1="${k(a)}" x2="${k(op.at + off)}" y2="${k(b)}" stroke="${st}" stroke-width="${w}"/>`;
    if (op.kind === 'window') { o.push(line(op.a, op.b, -0.05, '#3b8fbf', 2), line(op.a, op.b, 0.05, '#3b8fbf', 2), line(op.a, op.b, 0, '#3b8fbf', 1)); }
    if (op.kind === 'slide') { const m = (op.a + op.b) / 2; o.push(line(op.a, m + 0.1, -0.03, '#3b8fbf', 3), line(m - 0.1, op.b, 0.03, '#3b8fbf', 3)); }
    if (op.kind === 'door') {
      const L = op.b - op.a, h = op.hinge === 'a' ? op.a : op.b, far = op.hinge === 'a' ? op.b : op.a;
      if (op.axis === 'x') {
        const ex = h, ez = op.at + op.swing * L;
        o.push(`<line x1="${k(h)}" y1="${k(op.at)}" x2="${k(ex)}" y2="${k(ez)}" stroke="#24292a" stroke-width="2"/><path d="M ${k(far)} ${k(op.at)} A ${k(L)} ${k(L)} 0 0 ${(op.hinge === 'a') === (op.swing > 0) ? 1 : 0} ${k(ex)} ${k(ez)}" stroke="#7a7f80" stroke-width="1" stroke-dasharray="4 3"/>`);
      } else {
        const ex = op.at + op.swing * L, ez = h;
        o.push(`<line x1="${k(op.at)}" y1="${k(h)}" x2="${k(ex)}" y2="${k(ez)}" stroke="#24292a" stroke-width="2"/><path d="M ${k(op.at)} ${k(far)} A ${k(L)} ${k(L)} 0 0 ${(op.hinge === 'a') === (op.swing > 0) ? 0 : 1} ${k(ex)} ${k(ez)}" stroke="#7a7f80" stroke-width="1" stroke-dasharray="4 3"/>`);
      }
    }
  }
  o.push('</g>');
  // balcony railings
  o.push('<g id="railings" stroke="#5f5c57" stroke-width="5">');
  for (const r of ROOMS) { if (!r.rail) continue; const [a, b, c, d] = r.r.map(k); for (const s of r.rail) o.push({ n: `<line x1="${a}" y1="${b}" x2="${c}" y2="${b}"/>`, s: `<line x1="${a}" y1="${d}" x2="${c}" y2="${d}"/>`, w: `<line x1="${a}" y1="${b}" x2="${a}" y2="${d}"/>`, e: `<line x1="${c}" y1="${b}" x2="${c}" y2="${d}"/>` }[s]); }
  o.push('</g>');
  // room labels
  o.push('<g id="room-labels" text-anchor="middle" fill="#8a6420">');
  for (const r of ROOMS) {
    if (room && r !== room) continue;
    const cx = k((r.r[0] + r.r[2]) / 2), cz = k((r.r[1] + r.r[3]) / 2), fs = room ? 18 : Math.max(9, Math.min(20, k(r.r[2] - r.r[0]) / 9));
    o.push(`<text x="${cx}" y="${cz - fs * 0.2}" font-size="${fs}" font-weight="700" opacity=".5">${esc(r.id + ' · ' + r.name.toUpperCase())}</text><text x="${cx}" y="${cz + fs}" font-size="${fs * 0.75}" opacity=".5">${esc(r.dim)}</text>`);
  }
  o.push('</g>');
  // furniture
  o.push('<g id="furniture">');
  const sorted = [...state.items].sort((a, b) => a.y - b.y);
  for (const it of sorted) {
    if (it.x < x0 - 0.2 || it.x > x1 + 0.2 || it.z < z0 - 0.2 || it.z > z1 + 0.2) continue;
    const w = k(it.w), d = k(it.d), rot = +(-it.rot * 180 / Math.PI).toFixed(2), up = it.y > 0.5;
    const col = it.c || colorFor(it.k);
    const name = esc(it.n), dims = `${Math.round(it.w * 100)}×${Math.round(it.d * 100)}`;
    const fs = Math.max(5, Math.min(14, w / (Math.max(it.n.length, dims.length) * 0.6)));
    const rug = ITEM[it.k]?.id?.startsWith('rug');
    o.push(`<g id="item-${it.id}" data-name="${name}" transform="translate(${k(it.x)} ${k(it.z)}) rotate(${rot})">` +
      `<rect x="${-w / 2}" y="${-d / 2}" width="${w}" height="${d}" rx="${rug ? 6 : 2}" fill="${col}" fill-opacity="${up ? 0.08 : rug ? 0.18 : 0.35}" stroke="${col}" stroke-width="${up ? 1.5 : 2}"${up ? ' stroke-dasharray="6 4"' : ''}/>` +
      `<line x1="${-w / 2 + 2}" y1="${d / 2 - 2}" x2="${w / 2 - 2}" y2="${d / 2 - 2}" stroke="${col}" stroke-width="3"/>` +
      (rug ? '' : d >= fs * 2.4 ? `<text y="${-fs * 0.15}" font-size="${fs}" text-anchor="middle" fill="#1b2220" transform="rotate(${-rot})">${name}</text><text y="${fs * 0.95}" font-size="${fs * 0.8}" text-anchor="middle" fill="#5b6662" transform="rotate(${-rot})">${dims}</text>` : `<text y="${fs * 0.35}" font-size="${fs * 0.8}" text-anchor="middle" fill="#1b2220" transform="rotate(${-rot})">${name}</text>`) + `</g>`);
  }
  o.push('</g>');
  // dimensions for a single room
  if (room) {
    const [a, b, c, d] = [x0, z0, x1, z1].map(k), ty = b - 50, lx = a - 50;
    const L = (p, q, r, s) => `<line x1="${p}" y1="${q}" x2="${r}" y2="${s}"/>`;
    o.push(`<g id="dimensions" stroke="#1b2220" stroke-width="1.5" font-size="16" fill="#1b2220">${L(a, ty, c, ty)}${L(a, ty - 9, a, ty + 9)}${L(c, ty - 9, c, ty + 9)}${L(lx, b, lx, d)}${L(lx - 9, b, lx + 9, b)}${L(lx - 9, d, lx + 9, d)}` +
      `<text x="${(a + c) / 2}" y="${ty - 9}" text-anchor="middle" stroke="none">${(x1 - x0).toFixed(2)} m</text><text transform="translate(${lx - 11} ${(b + d) / 2}) rotate(-90)" text-anchor="middle" stroke="none">${(z1 - z0).toFixed(2)} m</text></g>`);
  }
  // north arrow + title block
  const by = vz + vh - 40;
  o.push(`<rect x="${vx}" y="${vz + vh - 72}" width="${vw}" height="72" fill="#ffffff"/>`);
  o.push(`<g id="title" fill="#1b2220" font-size="16"><text x="${vx + 24}" y="${by}" font-weight="700">PLOT G1-22 · DLF PANCHKULA · ${room ? esc(room.id + ' ' + room.name.toUpperCase()) : 'FLOOR PLAN'}</text>` +
    `<text x="${vx + 24}" y="${by + 22}" font-size="12" fill="#5b6662">1 unit = 1 cm · solid = floor-standing · dashed = wall-mounted · thick edge = front${room ? ' · brochure size ' + esc(room.dim) : ''}</text></g>`);
  // scale bar 1 m
  o.push(`<g id="scale" font-size="12" fill="#1b2220"><rect x="${vx + vw - 150}" y="${by - 6}" width="100" height="8" fill="#1b2220"/><rect x="${vx + vw - 100}" y="${by - 6}" width="50" height="8" fill="#fff" stroke="#1b2220"/><text x="${vx + vw - 150}" y="${by + 18}">0</text><text x="${vx + vw - 58}" y="${by + 18}">1 m</text></g>`);
  o.push('</svg>');
  return o.join('');
}
const CAT_COL = { Living: '#5f7552', Bedroom: '#4f6b8a', 'Dining & Bar': '#8a5a36', Study: '#7a6a2f', Kitchen: '#4a6a72', Bath: '#3b8fbf', 'Storage & Entry': '#6d6a64', 'Lighting & AC': '#a07a20', Decor: '#9a5a6a', Sets: '#5f7552' };
function colorFor(id) { return CAT_COL[ITEM[id]?.cat] || '#6d6a64'; }
