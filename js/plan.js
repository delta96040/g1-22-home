// Plot G1-22, DLF Panchkula — floor plan traced from the Bhagwati Properties brochure.
// Coordinates in metres. x runs left→right (west→east), z runs top→bottom of the brochure
// (balcony 20 at the top / north, balcony 12 at the bottom / south).
// Each room rectangle is the clear inside area; `dim` is the size printed in the brochure.

export const WALL_T = 0.14;          // interior wall thickness (drawn)
export const EXT_T = 0.24;           // exterior wall thickness
export const WALL_H = 3.0;           // floor-to-ceiling height
export const DOOR_H = 2.1;
export const PLOT = { x0: 0, z0: 0, x1: 10.5, z1: 25.75 };
export const CENTER = { x: 5.25, z: 12.9 };

export const ROOMS = [
  { id: '20', name: 'Balcony', dim: '1.80 m wide', r: [0.3, 0.12, 10.2, 1.92], floor: 'deck', rail: ['n', 'w', 'e'] },
  { id: '17', name: 'Toilet', dim: '2.32 × 2.27 m', r: [0.3, 2.0, 2.62, 4.27], floor: 'tile', walls: true, paint: '#e9ece9' },
  { id: '16', name: 'Dress', dim: '2.41 × 2.18 m', r: [0.3, 4.42, 2.71, 6.6], floor: 'wood', walls: true },
  { id: '15', name: 'Bedroom', dim: '3.65 × 4.63 m', r: [2.75, 2.0, 6.4, 6.63], floor: 'wood', walls: true },
  { id: '18', name: 'Bedroom', dim: '3.76 × 4.56 m', r: [6.44, 2.0, 10.2, 6.56], floor: 'wood', walls: true },
  { id: '6', name: 'Dress + Toilet', dim: '2.48 × 3.65 m · of Bed 5', r: [0.3, 6.75, 2.78, 10.4], floor: 'tile', walls: true, paint: '#e9ece9' },
  { id: '3', name: 'Lounge', dim: '4.55 × 3.63 m', r: [2.93, 6.72, 7.15, 10.35], floor: null, open: true },
  { id: '19', name: 'Dress + Toilet', dim: '2.91 × 3.65 m · of Bed 18', r: [7.29, 6.7, 10.2, 10.35], floor: 'tile', walls: true, paint: '#e9ece9' },
  { id: '5', name: 'Bedroom', dim: '3.81 × 3.90 m', r: [0.3, 10.57, 4.11, 14.47], floor: 'stone', walls: true },
  { id: '2', name: 'Staircase', dim: '3.70 × 4.08 m', r: [6.5, 10.5, 10.2, 14.58], floor: 'granite', walls: true, stairs: true },
  { id: '8', name: 'O.T.S.', dim: '3.81 × 2.14 m · AC duct shaft', r: [0.3, 14.62, 4.11, 16.76], floor: 'pebble', walls: true, sky: true },
  { id: '1', name: 'Lift', dim: '1.50 × 1.83 m', r: [8.6, 14.75, 10.1, 16.58], floor: 'steel', walls: true, paint: '#b9bfc2' },
  { id: '7', name: 'Dining', dim: '5.81 × 4.55 m', r: [4.26, 14.62, 8.45, 19.25], floor: null, open: true },
  { id: '14', name: 'Toilet', dim: '1.68 × 2.45 m · of Guest Bed', r: [0.3, 16.9, 1.98, 19.35], floor: 'tile', walls: true, paint: '#e9ece9' },
  { id: '9', name: 'Powder Room', dim: '2.01 × 2.17 m', r: [2.1, 16.9, 4.11, 18.45], floor: 'tile', walls: true, paint: '#e9ece9' },
  { id: '13L', name: 'Guest lobby', dim: 'closet · entry to 13', r: [2.1, 18.6, 4.11, 19.43], floor: 'stone', walls: true, noLabel: true },
  { id: '13', name: 'Guest Bedroom', dim: '3.36 × 4.15 m', r: [0.3, 19.5, 3.66, 23.65], floor: 'stone', walls: true },
  { id: '10', name: 'Drawing Room', dim: '2.67 × 4.27 m', r: [3.81, 19.38, 7.53, 23.65], floor: 'stone', walls: true },
  { id: '11', name: 'Kitchen', dim: '2.52 × 4.27 m', r: [7.68, 19.38, 10.2, 23.65], floor: 'ktile', walls: true, paint: '#eeeae2' },
  { id: '12', name: 'Balcony', dim: '1.80 m wide', r: [0.3, 23.8, 10.2, 25.6], floor: 'deck', rail: ['s', 'w', 'e'] },
];
// Shared hall floor under the open lounge / dining / passages
export const HALL = [0.12, 1.93, 10.38, 23.72];

// Openings. axis 'x' = wall line running along x at z=at (spans x a..b);
// axis 'z' = wall line running along z at x=at (spans z a..b).
// kind: door (with leaf), slide (glass sliding door), gap (open archway), window (sill..head)
export const OPENINGS = [
  // balcony 20 sliders
  { axis: 'x', at: 2.0, a: 3.3, b: 5.9, kind: 'slide' },
  { axis: 'x', at: 2.0, a: 7.1, b: 9.6, kind: 'slide' },
  // master suite 15
  { axis: 'x', at: 4.345, a: 1.0, b: 1.8, kind: 'door', hinge: 'a', swing: 1 },
  { axis: 'z', at: 2.73, a: 5.2, b: 6.0, kind: 'door', hinge: 'b', swing: 1 },
  { axis: 'x', at: 6.63, a: 5.45, b: 6.35, kind: 'door', hinge: 'b', swing: -1 },
  // bedroom 18
  { axis: 'x', at: 6.56, a: 6.5, b: 7.25, kind: 'door', hinge: 'a', swing: -1 },
  // 6 is reached from bedroom 5; 19 from bedroom 18
  { axis: 'x', at: 10.485, a: 1.6, b: 2.4, kind: 'door', hinge: 'a', swing: 1 },
  { axis: 'x', at: 6.63, a: 8.6, b: 9.4, kind: 'door', hinge: 'b', swing: 1 },
  // bedroom 5, OTS glass
  { axis: 'z', at: 4.11, a: 10.8, b: 11.65, kind: 'door', hinge: 'a', swing: -1 },
  { axis: 'z', at: 4.11, a: 14.85, b: 16.5, kind: 'fixed' },
  // powder room, toilet 14, guest bedroom
  { axis: 'z', at: 4.11, a: 17.35, b: 18.1, kind: 'door', hinge: 'a', swing: -1 },
  { axis: 'x', at: 19.42, a: 0.8, b: 1.55, kind: 'door', hinge: 'a', swing: 1 },
  // guest lobby: door from the dining side, closet ahead, turn left into bedroom 13
  { axis: 'z', at: 4.11, a: 18.68, b: 19.36, kind: 'door', hinge: 'a', swing: -1 },
  { axis: 'x', at: 19.47, a: 2.75, b: 3.55, kind: 'gap' },
  // south sliders to balcony 12
  { axis: 'x', at: 23.65, a: 0.8, b: 3.1, kind: 'slide' },
  { axis: 'x', at: 23.65, a: 4.3, b: 7.0, kind: 'slide' },
  { axis: 'x', at: 23.65, a: 8.3, b: 9.6, kind: 'slide' },
  // drawing room & kitchen open to dining
  { axis: 'x', at: 19.38, a: 4.8, b: 6.6, kind: 'gap' },
  { axis: 'x', at: 19.38, a: 8.0, b: 9.9, kind: 'gap' },
  // lift & stair
  { axis: 'z', at: 8.6, a: 15.2, b: 16.1, kind: 'gap', liftDoor: true },
  { axis: 'x', at: 14.58, a: 6.5, b: 8.45, kind: 'gap' },
  // windows on the long side walls
  { axis: 'z', at: 0.27, a: 2.7, b: 3.6, kind: 'window', sill: 1.5 },
  { axis: 'z', at: 0.27, a: 5.0, b: 6.0, kind: 'window', sill: 1.2 },
  { axis: 'z', at: 0.27, a: 7.8, b: 8.7, kind: 'window', sill: 1.5 },
  { axis: 'z', at: 0.27, a: 11.4, b: 13.6, kind: 'window', sill: 0.9 },
  { axis: 'z', at: 0.27, a: 17.6, b: 18.4, kind: 'window', sill: 1.5 },
  { axis: 'z', at: 0.27, a: 20.4, b: 22.6, kind: 'window', sill: 0.9 },
  { axis: 'z', at: 10.23, a: 3.3, b: 5.2, kind: 'window', sill: 0.9 },
  { axis: 'z', at: 10.23, a: 8.0, b: 8.9, kind: 'window', sill: 1.5 },
  { axis: 'z', at: 10.23, a: 11.6, b: 13.4, kind: 'window', sill: 1.2 },
  { axis: 'z', at: 10.23, a: 17.4, b: 18.6, kind: 'window', sill: 0.9 },
  { axis: 'z', at: 10.23, a: 20.6, b: 22.4, kind: 'window', sill: 1.05 },
];
const EXTERIOR = [
  { axis: 'z', fixed: 0.24, a: 1.93, b: 23.72, t: EXT_T, room: null },
  { axis: 'z', fixed: 10.26, a: 1.93, b: 23.72, t: EXT_T, room: null },
];

function cut(parts, o) {
  return parts.flatMap(([p, q]) => {
    if (o.b <= p || o.a >= q) return [[p, q]];
    const out = [];
    if (o.a > p) out.push([p, o.a]);
    if (o.b < q) out.push([o.b, q]);
    return out;
  });
}

// Returns wall pieces: full-height segments, plus partial pieces above/below openings.
// Each piece: {axis, fixed, a, b, t, y0, y1, room}
export function buildWallPieces() {
  const pieces = [];
  const lines = [];
  for (const r of ROOMS) {
    if (!r.walls) continue;
    const [x0, z0, x1, z1] = r.r, e = WALL_T / 2;
    lines.push({ axis: 'x', fixed: z0, a: x0 - e, b: x1 + e, t: WALL_T, room: r.id, side: 1 });
    lines.push({ axis: 'x', fixed: z1, a: x0 - e, b: x1 + e, t: WALL_T, room: r.id, side: -1 });
    lines.push({ axis: 'z', fixed: x0, a: z0, b: z1, t: WALL_T, room: r.id, side: 1 });
    lines.push({ axis: 'z', fixed: x1, a: z0, b: z1, t: WALL_T, room: r.id, side: -1 });
  }
  for (const ex of EXTERIOR) lines.push({ ...ex });
  for (const ln of lines) {
    let parts = [[ln.a, ln.b]];
    const hits = [];
    for (const o of OPENINGS) {
      if (o.axis !== ln.axis || Math.abs(o.at - ln.fixed) > 0.22) continue;
      if (o.b <= ln.a || o.a >= ln.b) continue;
      parts = cut(parts, o);
      hits.push(o);
    }
    for (const [p, q] of parts) if (q - p > 0.02) pieces.push({ ...ln, a: p, b: q, y0: 0, y1: WALL_H });
    for (const o of hits) {
      const a = Math.max(o.a, ln.a), b = Math.min(o.b, ln.b);
      if (o.kind === 'window') {
        pieces.push({ ...ln, a, b, y0: 0, y1: o.sill, part: 'sill' });
        pieces.push({ ...ln, a, b, y0: DOOR_H, y1: WALL_H, part: 'head' });
      } else if (o.kind !== 'gap' || o.liftDoor) {
        pieces.push({ ...ln, a, b, y0: DOOR_H, y1: WALL_H, part: 'head' });
      } else {
        pieces.push({ ...ln, a, b, y0: 2.4, y1: WALL_H, part: 'head' });
      }
    }
  }
  return pieces;
}

// Wall faces usable for snapping furniture: each face is a line with an outward normal
export function wallFaces(pieces) {
  const faces = [];
  for (const p of pieces) {
    if (p.y0 > 0.05) continue; // only pieces that touch the floor
    const h = p.t / 2;
    if (p.axis === 'x') {
      faces.push({ axis: 'x', pos: p.fixed - h, a: p.a, b: p.b, n: -1 });
      faces.push({ axis: 'x', pos: p.fixed + h, a: p.a, b: p.b, n: 1 });
    } else {
      faces.push({ axis: 'z', pos: p.fixed - h, a: p.a, b: p.b, n: -1 });
      faces.push({ axis: 'z', pos: p.fixed + h, a: p.a, b: p.b, n: 1 });
    }
  }
  return faces;
}

export function roomAt(x, z) {
  const inside = r => x >= r.r[0] && x <= r.r[2] && z >= r.r[1] && z <= r.r[3];
  return ROOMS.find(r => r.walls && inside(r)) || ROOMS.find(inside) || null;
}

// Stair geometry (U-shaped, two flights of 9 risers)
export const STAIR = { rise: 1.5 / 9, run: 0.3, f1: { x0: 6.62, x1: 7.78, zStart: 14.5 }, landing: [6.62, 10.62, 10.08, 11.8], f2: { x0: 8.92, x1: 10.08, zStart: 11.8 } };
