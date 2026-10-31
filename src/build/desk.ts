// Desktop machines described as data: one list of pieces for a machine's mesh and for its drawing (draw/desk.ts), so the two can never disagree. A piece is plain geometry placed in
// millimetres: x across, y up from the desk, z towards the viewer. A mark on a back face gives x as seen from behind, as a picture of the back is measured. No mark or logo.
import * as THREE from "three";
import { perforation } from "./macs.ts";
import { type Box, disc, type Material, roundedSquare, slab, tube, type Vec3 } from "./kit.ts";
import { litScreen, type ScreenKind } from "./screens.ts";

/** A rounded rectangle across the machine at one depth, for a body that swells or tapers from front to back. */
export interface Ring {
  z: number;
  w: number;
  h: number;
  /** The height of its middle. */
  y: number;
  r: number;
  /** Its lower corners' radius, when it differs. */
  rb?: number;
}

export type Face = "front" | "back" | "left" | "right" | "top";

export type MarkKind = "screen" | "lcd" | "dark" | "panel" | "slot" | "key" | "metal" | "shell" | "light" | "louvre" | "perf";

export interface Mark {
  /** The face, how far out it is along its axis, and the tilt it shares with its piece. */
  face: Face;
  at: number;
  frame?: THREE.Matrix4;
  kind: MarkKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Corner radius. */
  r?: number;
  round?: boolean;
  /** A block of the same mark, centred on (x, y), `gap` between them across and `gapY` up. */
  cols?: number;
  rows?: number;
  gap?: number;
  gapY?: number;
  /** A louvre's slats, or the holes of a perforated field: [across, down, dot %]. */
  slats?: number;
  holes?: readonly [number, number, number];
  mat?: Material;
  /** Sits over other marks on its face. */
  over?: number;
}

export type Piece =
  | { is: "block"; mat: Material; x?: number; z?: number; w: number; d: number; r?: number; y0: number; y1: number; edge?: number; fine?: boolean; frame?: THREE.Matrix4 }
  | { is: "loft"; mat: Material; rings: readonly Ring[]; fine?: boolean; frame?: THREE.Matrix4 }
  | { is: "side"; mat: Material; points: readonly (readonly [number, number])[]; x?: number; w: number; edge?: number; frame?: THREE.Matrix4 }
  | { is: "turned"; mat: Material; points: readonly (readonly [number, number])[]; x?: number; z?: number; seg?: number; rims?: readonly number[]; frame?: THREE.Matrix4 }
  | { is: "tube"; mat: Material; points: readonly Vec3[]; r: number; frame?: THREE.Matrix4 }
  | { is: "screen"; at: Vec3; w: number; h: number; radius?: number; kind?: ScreenKind; frame?: THREE.Matrix4 }
  | ({ is: "mark" } & Mark);

export interface DeskSpec {
  pieces: readonly Piece[];
  /** Where the caller's own words can go: its first is the main one. */
  prints?: readonly { id: string; at: Vec3; turn: Vec3; w: number; h: number; frame?: THREE.Matrix4 }[];
}

/** A turn back about the x axis through (y, z): a screen that leans `degrees` away from the viewer. */
export const lean = (degrees: number, y: number, z: number): THREE.Matrix4 =>
  new THREE.Matrix4().makeTranslation(0, y, z).multiply(new THREE.Matrix4().makeRotationX((-degrees * Math.PI) / 180)).multiply(new THREE.Matrix4().makeTranslation(0, -y, -z));

/** An upright block: `w` across, `d` deep, its plan's corners rounded by `r`. */
export const block = (mat: Material, x: number, z: number, w: number, d: number, y0: number, y1: number, more: { r?: number; edge?: number; fine?: boolean; frame?: THREE.Matrix4 } = {}): Piece => ({ is: "block", mat, x, z, w, d, y0, y1, ...more });

/** The frame of a slanted neck from (y, z) at its foot to (y, z) at its top: in it, the neck runs along z from 0 to `length`, and its back is the top face (y up). */
export function neckFrame(foot: readonly [number, number], top: readonly [number, number]): { frame: THREE.Matrix4; length: number } {
  const dy = top[0] - foot[0];
  const dz = top[1] - foot[1];
  return { frame: new THREE.Matrix4().makeTranslation(0, foot[0], foot[1]).multiply(new THREE.Matrix4().makeRotationX(Math.atan2(-dy, dz))), length: Math.hypot(dy, dz) };
}

/** How a body changes from its front (t = 0) to its back (t = 1). */
export type Across = (t: number) => { w: number; r: number; rb?: number };

/** Rings cut through a side outline ([z, y], the machine as it stands) at even steps, in the frame of a face that leans back `degrees` about (y, z). `front` and `back` are the outline's ends in that frame, or the part of them to cut. */
export function sliced(outline: readonly (readonly [number, number])[], across: Across, slices: number, { degrees = 0, pivot = [0, 0], from = 0, to = 1 }: { degrees?: number; pivot?: readonly [number, number]; from?: number; to?: number } = {}, whole: readonly (readonly [number, number])[] = outline): Ring[] {
  const a = (degrees * Math.PI) / 180;
  const inFrame = ([z, y]: readonly [number, number]): [number, number] => {
    const dy = y - pivot[0];
    const dz = z - pivot[1];
    return [pivot[1] + dz * Math.cos(a) + dy * Math.sin(a), pivot[0] + dy * Math.cos(a) - dz * Math.sin(a)];
  };
  const own = outline.map(inFrame);
  const all = whole.map(inFrame);
  const zs = all.map((p) => p[0]);
  const front = Math.max(...zs);
  const back = Math.min(...zs);
  const rings: Ring[] = [];
  for (let i = 0; i <= slices; i++) {
    const t = from + ((to - from) * i) / slices;
    // a step in from each end, so a cut always crosses the outline
    const z = front + (back - front) * Math.min(0.998, Math.max(0.002, t));
    const ys: number[] = [];
    own.forEach(([z0, y0], k) => {
      const [z1, y1] = own[(k + 1) % own.length];
      if ((z0 - z) * (z1 - z) <= 0 && z0 !== z1) ys.push(y0 + ((y1 - y0) * (z - z0)) / (z1 - z0));
    });
    if (ys.length < 2) continue;
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    const { w, r, rb } = across(t);
    rings.push({ z, w, h: Math.max(0.2, y1 - y0), y: (y0 + y1) / 2, r: Math.min(r, (y1 - y0) / 2 - 0.01), ...(rb !== undefined ? { rb: Math.min(rb, (y1 - y0) / 2 - 0.01) } : {}) });
  }
  return rings;
}

/** Marks on one face: `on(z).mark(...)`. */
export const onFace = (face: Face, at: number, frame?: THREE.Matrix4) => {
  const mark = (kind: MarkKind, x: number, y: number, w: number, h: number, more: Partial<Mark> = {}): Piece => ({ is: "mark", face, at, frame, kind, x, y, w, h, ...more });
  return {
    mark,
    /** A round mark: `d` across. */
    round: (kind: MarkKind, x: number, y: number, d: number, more: Partial<Mark> = {}): Piece => mark(kind, x, y, d, d, { round: true, ...more }),
    /** A socket: a dark rounded mouth. */
    port: (x: number, y: number, w: number, h: number, r = Math.min(w, h) * 0.2, more: Partial<Mark> = {}): Piece => mark("slot", x, y, w, h, { r, over: 1, ...more }),
    /** A USB-C or Thunderbolt socket, on its side as the small Macs have them, or standing. */
    usbc: (x: number, y: number, standing = true): Piece => mark("slot", x, y, standing ? 3.2 : 8.8, standing ? 8.8 : 3.2, { r: 1.5, over: 1 }),
    usba: (x: number, y: number, standing = false): Piece => mark("slot", x, y, standing ? 5.6 : 13, standing ? 13 : 5.6, { r: 0.6, over: 1 }),
    jack: (x: number, y: number, d = 4): Piece => mark("slot", x, y, d, d, { round: true, over: 1 }),
  };
};

const DEFAULT_MATERIAL: Readonly<Record<MarkKind, Material>> = {
  screen: "black-glass",
  lcd: "pale-glass",
  dark: "plastic-gloss",
  panel: "plastic-black",
  slot: "hole",
  key: "key",
  metal: "steel",
  shell: "alu",
  light: "led-white",
  louvre: "plastic-black",
  perf: "alu",
};

/** How far a mark stands off its face, so it is never lost in the face it lies on. */
export const LIFT: Readonly<Record<MarkKind, number>> = { panel: 0.12, shell: 0.12, louvre: 0.2, perf: 0.2, screen: 0.2, lcd: 0.2, dark: 0.26, metal: 0.3, slot: 0.32, key: 0.36, light: 0.4 };

/** The way a face looks, in the machine's own axes: its across, its up and its outward directions. */
export function faceAxes(face: Face): { u: Vec3; v: Vec3; n: Vec3 } {
  if (face === "front") return { u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, 1] };
  if (face === "back") return { u: [-1, 0, 0], v: [0, 1, 0], n: [0, 0, -1] };
  if (face === "right") return { u: [0, 0, -1], v: [0, 1, 0], n: [1, 0, 0] };
  if (face === "left") return { u: [0, 0, 1], v: [0, 1, 0], n: [-1, 0, 0] };
  return { u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0] };
}

/** A point on a face: `x` across it, `y` up it, `out` off it. */
export function facePoint(face: Face, at: number, x: number, y: number, out = 0): Vec3 {
  if (face === "front") return [x, y, at + out];
  if (face === "back") return [-x, y, at - out];
  if (face === "right") return [at + out, y, -x];
  if (face === "left") return [at - out, y, x];
  return [x, at + out, y];
}

const FACE_TURN: Readonly<Record<Face, Vec3>> = { front: [0, 0, 0], back: [0, 180, 0], right: [0, 90, 0], left: [0, -90, 0], top: [-90, 0, 0] };

/** Each mark of a block, at the middle of where it goes. */
export function eachOfMark(mark: Mark, each: (x: number, y: number) => void) {
  const cols = mark.cols ?? 1;
  const rows = mark.rows ?? 1;
  const gap = mark.gap ?? 0;
  const gapY = mark.gapY ?? gap;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) each(mark.x + (c - (cols - 1) / 2) * (mark.w + gap), mark.y + ((rows - 1) / 2 - r) * (mark.h + gapY));
}

/** A solid between rounded rectangles along z. */
export function ringGeometry(rings: readonly Ring[], corner = 6): THREE.BufferGeometry {
  const around = (ring: Ring): Vec3[] => {
    const pts: Vec3[] = [];
    const hw = ring.w / 2;
    const hh = ring.h / 2;
    const r = Math.min(ring.r, hw - 0.01, hh - 0.01);
    const rb = Math.min(ring.rb ?? ring.r, hw - 0.01, hh - 0.01);
    const corners = [
      [hw - r, hh - r, 0, r],
      [-hw + r, hh - r, 90, r],
      [-hw + rb, -hh + rb, 180, rb],
      [hw - rb, -hh + rb, 270, rb],
    ];
    for (const [cx, cy, a0, radius] of corners)
      for (let k = 0; k <= corner; k++) {
        const a = ((a0 + (90 * k) / corner) * Math.PI) / 180;
        pts.push([cx + radius * Math.cos(a), ring.y + cy + radius * Math.sin(a), ring.z]);
      }
    return pts;
  };
  const loops = rings.map(around);
  const n = loops[0].length;
  const front = rings[0].z > rings[rings.length - 1].z;
  const out: number[] = [];
  const tri = (a: Vec3, b: Vec3, c: Vec3) => void (front ? out.push(...a, ...c, ...b) : out.push(...a, ...b, ...c));
  for (let i = 0; i + 1 < loops.length; i++)
    for (let k = 0; k < n; k++) {
      const a = loops[i][k];
      const b = loops[i][(k + 1) % n];
      const c = loops[i + 1][(k + 1) % n];
      const d = loops[i + 1][k];
      tri(a, b, c);
      tri(a, c, d);
    }
  const cap = (loop: Vec3[], flip: boolean) => {
    const middle = loop.reduce((s, p) => s.map((v, i) => v + p[i] / loop.length) as Vec3, [0, 0, 0] as Vec3);
    for (let k = 0; k < n; k++) {
      if (flip) tri(middle, loop[(k + 1) % n], loop[k]);
      else tri(middle, loop[k], loop[(k + 1) % n]);
    }
  };
  const sides = out.length / 9;
  cap(loops[0], true);
  cap(loops[loops.length - 1], false);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  return creased(g, sides);
}

/** Smooth normals across gentle bends, a crease at a sharp one: the same as `slab`. */
function creased(g: THREE.BufferGeometry, smooth = Infinity): THREE.BufferGeometry {
  const pos = g.getAttribute("position");
  const faces = pos.count / 3;
  const keyOf = (i: number) => `${Math.round(pos.getX(i) * 100)},${Math.round(pos.getY(i) * 100)},${Math.round(pos.getZ(i) * 100)}`;
  const normalOf: THREE.Vector3[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const byPoint = new Map<string, number[]>();
  for (let f = 0; f < faces; f++) {
    a.fromBufferAttribute(pos, f * 3);
    b.fromBufferAttribute(pos, f * 3 + 1);
    c.fromBufferAttribute(pos, f * 3 + 2);
    normalOf.push(b.clone().sub(a).cross(c.clone().sub(a)).normalize());
    for (let i = 0; i < 3; i++) {
      const key = keyOf(f * 3 + i);
      const list = byPoint.get(key);
      if (list) list.push(f);
      else byPoint.set(key, [f]);
    }
  }
  const normals = new Float32Array(pos.count * 3);
  const limit = Math.cos((35 * Math.PI) / 180);
  for (let f = 0; f < faces; f++)
    for (let i = 0; i < 3; i++) {
      const sum = new THREE.Vector3();
      // past `smooth` a face is flat: the two ends of a body keep their own plane
      if (f >= smooth) sum.copy(normalOf[f]);
      else for (const other of byPoint.get(keyOf(f * 3 + i)) ?? []) if (other < smooth && normalOf[f].dot(normalOf[other]) >= limit) sum.add(normalOf[other]);
      sum.normalize();
      normals.set([sum.x, sum.y, sum.z], (f * 3 + i) * 3);
    }
  g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  return g;
}

/** A side outline ([z, y], seen from the right) pushed across x, `w` wide, centred on `x`. */
function sideGeometry(points: readonly (readonly [number, number])[], w: number, edge: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  points.forEach(([z, y], i) => (i === 0 ? shape.moveTo(z, y) : shape.lineTo(z, y)));
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: w - 2 * edge, bevelEnabled: edge > 0, bevelThickness: edge, bevelSize: edge, bevelOffset: -edge, bevelSegments: 1, curveSegments: 1 });
  // the outline's first axis is z and its second y, and its own depth runs across x
  g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, -w / 2 + edge, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1));
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  const flat = g.index ? g.toNonIndexed() : g;
  const count = flat.getAttribute("position").count;
  const positions = flat.getAttribute("position");
  // the matrix above mirrors the shape, so each triangle turns the other way round
  for (let i = 0; i < count; i += 3) {
    const x = positions.getX(i + 1);
    const y = positions.getY(i + 1);
    const z = positions.getZ(i + 1);
    positions.setXYZ(i + 1, positions.getX(i + 2), positions.getY(i + 2), positions.getZ(i + 2));
    positions.setXYZ(i + 2, x, y, z);
  }
  return creased(flat);
}

function markMesh(m: Box, mark: Mark) {
  const turn = FACE_TURN[mark.face];
  if (mark.kind === "perf" && mark.holes) {
    const [across, down, dot] = mark.holes;
    perforation(m, `${mark.face}-${Math.round(Math.abs(mark.x))}-${Math.round(mark.y)}`, facePoint(mark.face, mark.at, mark.x, mark.y, LIFT.perf), turn, mark.w, mark.h, across, down, dot, mark.mat ?? "alu");
    return;
  }
  const material = mark.mat ?? DEFAULT_MATERIAL[mark.kind];
  const lift = LIFT[mark.kind] + (mark.over ?? 0) * 0.05;
  if (mark.kind === "louvre") {
    const slats = mark.slats ?? 8;
    const pitch = mark.h / slats;
    m.add(material, new THREE.PlaneGeometry(mark.w, mark.h), facePoint(mark.face, mark.at, mark.x, mark.y, lift), turn);
    for (let s = 0; s < slats; s++) m.add("hole", new THREE.PlaneGeometry(mark.w - 2, pitch * 0.45), facePoint(mark.face, mark.at, mark.x, mark.y + mark.h / 2 - (s + 0.5) * pitch, lift + 0.08), turn);
    return;
  }
  eachOfMark(mark, (x, y) => {
    const at = facePoint(mark.face, mark.at, x, y, lift);
    if (mark.round) m.add(material, disc(mark.w / 2, mark.w > 12 ? 28 : 14), at, turn);
    else if (mark.r) {
      const g = new THREE.ShapeGeometry(roundedSquare(mark.w, mark.h, Math.min(mark.r, Math.min(mark.w, mark.h) / 2 - 0.01), 3));
      m.add(material, g, at, turn);
    } else m.add(material, new THREE.PlaneGeometry(mark.w, mark.h), at, turn);
  });
}

/** One machine's mesh from its pieces. */
export function deskMesh(m: Box, spec: DeskSpec) {
  const flat = new THREE.Matrix4();
  for (const piece of spec.pieces) {
    m.within(piece.frame ?? flat, () => {
      if (piece.is === "block") {
        const { w, d, r = 0, y0, y1, x = 0, z = 0, edge = 0 } = piece;
        if (r > 0) m.add(piece.mat, slab(roundedSquare(w, d, Math.min(r, Math.min(w, d) / 2 - 0.01), r > 8 ? 8 : 4), y1 - y0, Math.min(edge || 0.8, (y1 - y0) / 2 - 0.01), { curve: r > 8 ? 8 : 4, bevelSeg: edge > 2 ? 3 : 1 }), [x, y0, z]);
        else m.add(piece.mat, new THREE.BoxGeometry(w, y1 - y0, d), [x, (y0 + y1) / 2, z]);
      } else if (piece.is === "loft") m.add(piece.mat, ringGeometry(piece.rings));
      else if (piece.is === "side") m.add(piece.mat, sideGeometry(piece.points, piece.w, piece.edge ?? 0), [piece.x ?? 0, 0, 0]);
      else if (piece.is === "turned") {
        const g = new THREE.LatheGeometry(piece.points.map(([r, y]) => new THREE.Vector2(r, y)), piece.seg ?? 40);
        g.deleteAttribute("uv");
        m.add(piece.mat, g, [piece.x ?? 0, 0, piece.z ?? 0]);
      } else if (piece.is === "tube") m.add(piece.mat, tube([...piece.points] as Vec3[], piece.r, Math.max(10, piece.points.length * 5), 8));
      else if (piece.is === "screen") litScreen(m, piece.at, [0, 0, 0], piece.w, piece.h, { radius: piece.radius ?? 0, kind: piece.kind ?? "desktop" });
      else markMesh(m, piece);
    });
  }
  for (const print of spec.prints ?? []) m.within(print.frame ?? flat, () => m.printFace(print.id, print.at, print.turn, print.w, print.h));
  return m;
}

