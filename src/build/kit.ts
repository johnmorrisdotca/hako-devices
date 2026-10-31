// The parts box of the 3D views: a shared set of materials, shapes in millimetres, and the Box a device or part is drawn into. Every shape is drawn here
// from plain geometry: no file of anyone else's, no logo, no brand name.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import type { Vec3 } from "../framing.ts";

export type { Vec3 };

export interface MaterialSpec {
  /** sRGB. */
  color: string;
  metal: number;
  rough: number;
  /** A lit part's glow and its strength. */
  glow?: string;
  strength?: number;
  /** Below 1 the material blends. */
  alpha?: number;
}

/** Every material a device may use. The viewer reads the `led-` names. */
export const MATERIALS = {
  alu: { color: "#c9cdd3", metal: 1, rough: 0.3 },
  "alu-dark": { color: "#5d6168", metal: 1, rough: 0.36 },
  steel: { color: "#a4aab2", metal: 1, rough: 0.26 },
  gold: { color: "#d8ab4e", metal: 1, rough: 0.28 },
  hole: { color: "#030405", metal: 0, rough: 0.95 },
  "black-glass": { color: "#040507", metal: 0, rough: 0.05 },
  "plastic-black": { color: "#111317", metal: 0, rough: 0.55 },
  "plastic-char": { color: "#1d2026", metal: 0, rough: 0.62 },
  "plastic-gloss": { color: "#0a0b0d", metal: 0, rough: 0.14 },
  "plastic-grey": { color: "#3a3f47", metal: 0, rough: 0.5 },
  "plastic-white": { color: "#e9e8e2", metal: 0, rough: 0.48 },
  tray: { color: "#18191c", metal: 0, rough: 0.5 },
  "matte-black": { color: "#141517", metal: 0, rough: 0.72 },
  rubber: { color: "#0c0d0f", metal: 0, rough: 0.92 },
  "pcb-green": { color: "#1f6c40", metal: 0, rough: 0.5 },
  "pcb-blue": { color: "#1f55b8", metal: 0, rough: 0.5 },
  // a display's thin metal frame, silver going beige
  "frame-beige": { color: "#cbc3ad", metal: 0.55, rough: 0.38 },
  "case-matte": { color: "#141517", metal: 0, rough: 0.82 },
  "case-black": { color: "#0e0f11", metal: 0.45, rough: 0.5 },
  "pcb-black": { color: "#0d1014", metal: 0, rough: 0.85 },
  silk: { color: "#e8eee8", metal: 0, rough: 0.7 },
  chip: { color: "#16171a", metal: 0, rough: 0.42 },
  smd: { color: "#9b7a4e", metal: 0, rough: 0.5 },
  "usb-blue": { color: "#2160d8", metal: 0, rough: 0.42 },
  "usb-amber": { color: "#d9a21f", metal: 0, rough: 0.42 },
  "lid-red": { color: "#9d2428", metal: 0, rough: 0.4 },
  key: { color: "#131417", metal: 0, rough: 0.55 },
  // a keyboard computer's pale deck
  "deck-white": { color: "#ebe9e4", metal: 0, rough: 0.5 },
  "deck-well": { color: "#c9c7c1", metal: 0, rough: 0.6 },
  "band-grey": { color: "#8d9096", metal: 0, rough: 0.46 },
  // shells in their colours
  "shell-dark-blue": { color: "#2d333b", metal: 0.9, rough: 0.38 },
  "shell-sand": { color: "#d9d0bf", metal: 0.5, rough: 0.4 },
  "shell-graphite": { color: "#28292d", metal: 0.9, rough: 0.4 },
  "shell-blue": { color: "#7f9fc4", metal: 0.4, rough: 0.42 },
  "shell-violet": { color: "#a79cc2", metal: 0.4, rough: 0.42 },
  "shell-silver": { color: "#d3d5d8", metal: 0.9, rough: 0.34 },
  "shell-deep-blue": { color: "#5b84b4", metal: 0.65, rough: 0.34 },
  "pale-glass": { color: "#d6d8da", metal: 0, rough: 0.14 },
  "epaper-white": { color: "#efefe9", metal: 0, rough: 0.6 },
  "fpc-orange": { color: "#c98a2b", metal: 0.1, rough: 0.5 },
  "tv-frame": { color: "#1a1b1e", metal: 0.7, rough: 0.42 },
  "browser-bar": { color: "#2a3342", metal: 0, rough: 0.45 },
  bezel: { color: "#08090b", metal: 0, rough: 0.34 },
  "wire-red": { color: "#c8242a", metal: 0, rough: 0.55 },
  "wire-black": { color: "#17181b", metal: 0, rough: 0.55 },
  "wire-blue": { color: "#2a5fc4", metal: 0, rough: 0.55 },
  // Lights the viewer breathes (led-power), flickers (led-disk) or leaves alone.
  "led-power": { color: "#000000", metal: 0, rough: 0.3, glow: "#3ee07a", strength: 2 },
  "led-disk": { color: "#000000", metal: 0, rough: 0.3, glow: "#3ee07a", strength: 2 },
  "led-white": { color: "#000000", metal: 0, rough: 0.3, glow: "#f4f7ff", strength: 2 },
  "led-blue": { color: "#000000", metal: 0, rough: 0.3, glow: "#4aa8ff", strength: 2 },
  "led-amber": { color: "#000000", metal: 0, rough: 0.3, glow: "#fbbf24", strength: 2 },
  "led-red": { color: "#000000", metal: 0, rough: 0.3, glow: "#ff4b4b", strength: 2 },
  "led-warm": { color: "#000000", metal: 0, rough: 0.3, glow: "#fbbf24", strength: 5 },
  // A face the viewer paints at run time: black until it is painted.
  "screen-face": { color: "#000000", metal: 0, rough: 0.25, glow: "#000000", strength: 1 },
  // A face for the caller's own print: clear until it is painted, in any viewer.
  print: { color: "#000000", metal: 0, rough: 0.5, alpha: 0 },
} as const satisfies Record<string, MaterialSpec>;

export type Material = keyof typeof MATERIALS;

const deg = (d: number) => (d * Math.PI) / 180;

interface BoxNode {
  at: Vec3;
  /** The turn of the frame the node was made in, which its parts take too. */
  linear: THREE.Matrix4;
  uv: boolean;
  parts: Map<Material, THREE.BufferGeometry[]>;
}

export interface PrintFace {
  /** "lid", "front", "side", "board" ... */
  id: string;
  /** From the face's own plane (x along the text, y up it, facing +z) to the device's millimetres. */
  world: THREE.Matrix4;
  w: number;
  h: number;
}

export interface AddOptions {
  node?: string;
  scale?: Vec3;
  frame?: THREE.Matrix4;
}

/** A device in the making: parts by node (a node the viewer may move) and by material, all in millimetres. `within` places what a function draws. */
export class Box {
  readonly name: string;
  readonly nodes = new Map<string, BoxNode>();
  readonly prints: PrintFace[] = [];
  /** What a device's drawing reads for the same numbers as its mesh. */
  lidFrame?: THREE.Matrix4;
  lidLength?: number;
  lidScreen?: { w: number; h: number; z: number };
  panelFrame?: THREE.Matrix4;
  panelSize?: { W: number; H: number; T: number; chin: number };
  slabFacts?: { w: number; h: number; t: number; r: number; screen: [number, number]; frame: THREE.Matrix4; foot: number; stand: boolean };
  tvFacts?: { W: number; H: number; y0: number };
  windowSize?: { W: number; H: number; y0: number; bar: number };
  private frame = new THREE.Matrix4();

  constructor(name: string) {
    this.name = name;
    this.nodes.set("body", { at: [0, 0, 0], linear: new THREE.Matrix4(), uv: false, parts: new Map() });
  }

  /** Everything `draw` adds is placed by `frame`, inside any frame already in force. */
  within<T>(frame: THREE.Matrix4, draw: () => T): T {
    const before = this.frame;
    this.frame = before.clone().multiply(frame);
    try {
      return draw();
    } finally {
      this.frame = before;
    }
  }

  /** A node of its own, placed at `at`; parts added with { node } are drawn around that point. Returns its name, made unique. */
  node(name: string, at: Vec3, { uv = false }: { uv?: boolean } = {}): string {
    let id = name;
    for (let n = 2; this.nodes.has(id); n++) id = `${name}-${n}`;
    const point = new THREE.Vector3(...at).applyMatrix4(this.frame);
    const linear = new THREE.Matrix4().extractRotation(this.frame);
    this.nodes.set(id, { at: [point.x, point.y, point.z], linear, uv, parts: new Map() });
    return id;
  }

  /** Adds a shape of one material, moved to `at` and turned by `turn` (degrees, X then Y then Z). */
  add(material: Material, geometry: THREE.BufferGeometry, at: Vec3 = [0, 0, 0], turn: Vec3 = [0, 0, 0], options: AddOptions = {}): this {
    const { node = "body", scale, frame } = options;
    const holder = this.nodes.get(node);
    if (!holder) throw new Error(`no node ${node}`);
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    for (const name of Object.keys(g.attributes))
      if (name !== "position" && name !== "normal" && !(holder.uv && name === "uv")) g.deleteAttribute(name);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(turn[0]), deg(turn[1]), deg(turn[2]), "XYZ")),
      new THREE.Vector3(...(scale ?? ([1, 1, 1] as Vec3))),
    );
    g.applyMatrix4(m);
    if (frame) g.applyMatrix4(frame);
    g.applyMatrix4(node === "body" ? this.frame : holder.linear);
    const bucket = holder.parts;
    const list = bucket.get(material);
    if (list) list.push(g);
    else bucket.set(material, [g]);
    return this;
  }

  /** A face for the caller's print: clear until painted, `w` along its text and `h` up it, looking along `turn` (a plane faces +Z before turning). */
  printFace(id: string, at: Vec3, turn: Vec3, w: number, h: number, frame?: THREE.Matrix4): this {
    const local = new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(turn[0]), deg(turn[1]), deg(turn[2]), "XYZ")),
      new THREE.Vector3(1, 1, 1),
    );
    if (frame) local.premultiply(frame);
    const point = new THREE.Vector3().setFromMatrixPosition(local);
    const node = this.node(`print-${id}`, [point.x, point.y, point.z], { uv: true });
    const plain = new THREE.PlaneGeometry(w, h);
    plain.applyMatrix4(new THREE.Matrix4().extractRotation(local));
    this.add("print", plain, [0, 0, 0], [0, 0, 0], { node });
    this.prints.push({ id, world: this.frame.clone().multiply(local), w, h });
    return this;
  }
}

/** The frame that turns a device by `degrees` round the upright axis. */
export const turnY = (degrees: number) => new THREE.Matrix4().makeRotationY(deg(degrees));
/** The frame that moves a part. */
export const moved = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);

// ---------------------------------------------------------------------------------------------------------------------------------
// Shapes (millimetres). Each returns a geometry centred on its own middle unless said otherwise.

export const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const rbox = (w: number, h: number, d: number, r: number, seg = 3) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01));
/** An upright cylinder (along Y). */
export const cyl = (r: number, h: number, seg = 24, rTop = r) => new THREE.CylinderGeometry(rTop, r, h, seg);
/** A flat disc facing +Z. */
export const disc = (r: number, seg = 16) => new THREE.CircleGeometry(r, seg);
/** A flat rectangle facing +Z. */
export const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
/** A ring facing +Z. */
export const ring = (inner: number, outer: number, seg = 32) => new THREE.RingGeometry(inner, outer, seg);
/** A round wire through points in millimetres. */
export const tube = (points: Vec3[], r: number, seg = 18, sides = 5) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), seg, r, sides, false);
export const torus = (r: number, tubeR: number, seg = 32, sides = 6) => new THREE.TorusGeometry(r, tubeR, sides, seg);

/** A squircle-ish rounded square path with true circular corners. */
export function roundedSquare(w: number, d: number, r: number, seg = 12): THREE.Shape {
  const s = new THREE.Shape();
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  const corners = [
    [hw, hd, 0],
    [-hw, hd, 90],
    [-hw, -hd, 180],
    [hw, -hd, 270],
  ];
  corners.forEach(([cx, cy, start], i) => {
    for (let k = 0; k <= seg; k++) {
      const a = deg(start + (90 * k) / seg);
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0 && k === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
  });
  s.closePath();
  return s;
}

/** A slab of `shape` (in the XZ plane, seen from above) `height` tall standing on y = 0, with rounded top and bottom edges and smooth normals. */
export function slab(shape: THREE.Shape, height: number, edge: number, { curve = 12, bevelSeg = 5 }: { curve?: number; bevelSeg?: number } = {}) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: height - 2 * edge,
    bevelEnabled: edge > 0,
    bevelThickness: edge,
    bevelSize: edge,
    bevelOffset: -edge,
    bevelSegments: bevelSeg,
    curveSegments: curve,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, edge, 0);
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  return toCreasedNormals(g, deg(35));
}

/** A solid between two plans at two heights, for faceted tops: outlines of the same number of [x, z] points, seen from above, going the same way round. */
export function loft(low: [number, number][], high: [number, number][], y0: number, y1: number): THREE.BufferGeometry {
  const n = low.length;
  const pts: number[] = [];
  const quad = (a: number[], b: number[], c: number[], d: number[]) => pts.push(...a, ...b, ...c, ...a, ...c, ...d);
  const clockwise = low.reduce((sum, [x, z], i) => sum + (low[(i + 1) % n][0] - x) * (low[(i + 1) % n][1] + z), 0) > 0;
  const around = clockwise ? [...Array(n).keys()] : [...Array(n).keys()].reverse();
  for (let k = 0; k < n; k++) {
    const i = around[k];
    const j = around[(k + 1) % n];
    quad([low[i][0], y0, low[i][1]], [low[j][0], y0, low[j][1]], [high[j][0], y1, high[j][1]], [high[i][0], y1, high[i][1]]);
  }
  const cx = high.reduce((s, p) => s + p[0], 0) / n;
  const cz = high.reduce((s, p) => s + p[1], 0) / n;
  for (let k = 0; k < n; k++) {
    const i = around[k];
    const j = around[(k + 1) % n];
    pts.push(high[i][0], y1, high[i][1], high[j][0], y1, high[j][1], cx, y1, cz);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.computeVertexNormals();
  return g;
}

export interface HolesOptions {
  at: Vec3;
  turn?: Vec3;
  cols: number;
  rows: number;
  pitch: [number, number];
  r: number;
  stagger?: boolean;
  keep?: (x: number, y: number, i: number, j: number) => boolean;
  material?: Material;
  seg?: number;
}

/** A grid of round holes (dark discs) on a face: centred on `at`, facing along `turn` (a disc faces +Z before turning). */
export function holes(boxModel: Box, { at, turn = [0, 0, 0], cols, rows, pitch, r, stagger = false, keep = () => true, material = "hole", seg = 10 }: HolesOptions): void {
  const placed = new THREE.Object3D();
  placed.position.set(...at);
  placed.rotation.set(deg(turn[0]), deg(turn[1]), deg(turn[2]), "XYZ");
  placed.updateMatrix();
  const parts: THREE.BufferGeometry[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x = (i - (cols - 1) / 2) * pitch[0] + (stagger && j % 2 ? pitch[0] / 2 : 0);
      const y = (j - (rows - 1) / 2) * pitch[1];
      if (!keep(x, y, i, j)) continue;
      const g = disc(r, seg);
      g.translate(x, y, 0);
      parts.push(g.toNonIndexed());
    }
  if (parts.length === 0) return;
  const g = mergeGeometries(parts);
  g.applyMatrix4(placed.matrix);
  boxModel.add(material, g);
}

/** A pseudo-random number source with a seed, so a device is the same every time it is made. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------

export interface Extent {
  bounds: THREE.Box3;
  /** The point the mesh is centred on: the middle of its footprint, on the ground. */
  centre: THREE.Vector3;
  /** The screen's middle when it has one. */
  screen: THREE.Vector3 | null;
}

/** A device's bounds in millimetres as drawn (every node at its point). */
export function extent(model: Box): Extent {
  const boundsOf = (test: (name: string) => boolean) => {
    const bounds = new THREE.Box3();
    for (const [name, node] of model.nodes)
      if (test(name))
        for (const list of node.parts.values())
          for (const g of list) {
            const c = g.clone();
            c.translate(...node.at);
            c.computeBoundingBox();
            if (c.boundingBox) bounds.union(c.boundingBox);
          }
    return bounds;
  };
  const bounds = boundsOf(() => true);
  const centre = new THREE.Vector3((bounds.min.x + bounds.max.x) / 2, bounds.min.y, (bounds.min.z + bounds.max.z) / 2);
  const hasScreen = [...model.nodes.keys()].some((name) => name.startsWith("screen-"));
  const screen = hasScreen ? boundsOf((name) => name.startsWith("screen-")).getCenter(new THREE.Vector3()) : null;
  return { bounds, centre, screen };
}
