// The line drawings: dark gradient faces, a light outline, small glowing lights, a soft halo and shadow. Each is made from simple solids placed where the device's 3D parts
// are, seen from the very camera the 3D view starts from (framing.ts), so the drawing turns into the device without a jump. `within` places a part, as Box.within does.
import * as THREE from "three";
import { FOV_DEG, frameFor } from "../framing.ts";
import { type Box, extent, type Vec3 } from "../build/kit.ts";
import { type DrawingStyle, inStyle, STYLES } from "../styles.ts";

export const W = 320;
export const H = 220;
const LINE = "#8fa1b8";

const DEFS = `<defs>
<linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26344b"/><stop offset="1" stop-color="#18233a"/></linearGradient>
<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#162034"/><stop offset="1" stop-color="#0c1320"/></linearGradient>
<linearGradient id="pcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17352f"/><stop offset="1" stop-color="#0e2420"/></linearGradient>
<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a475c"/><stop offset="1" stop-color="#232e40"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#123150"/><stop offset="1" stop-color="#081626"/></linearGradient>
<linearGradient id="hat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d3f7a"/><stop offset="1" stop-color="#122a55"/></linearGradient>
<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#6cd0ff" stop-opacity=".16"/><stop offset="1" stop-color="#6cd0ff" stop-opacity="0"/></radialGradient>
<filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2"/></filter>
<pattern id="pins" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#d9b45a"/></pattern>
</defs>`;

const n = (v: number) => (Math.round(v * 10) / 10).toString();
type Point = [number, number];
const path = (pts: Point[]) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join("L")}Z`;

/** The convex hull of points on the picture (Andrew's monotone chain). */
function hull(points: Point[]): Point[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Point[]) => {
    const out: Point[] = [];
    for (const q of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
      out.push(q);
    }
    out.pop();
    return out;
  };
  return [...half(p), ...half([...p].reverse())];
}

export interface ShapeStyle {
  fill?: string;
  stroke?: string;
  sw?: number;
  opacity?: number;
  dash?: string;
}

export interface SolidStyle {
  top?: string;
  front?: string;
  side?: string;
  stroke?: string;
  sw?: number;
  layer?: number;
}

const attrs = ({ fill = "none", stroke, sw, opacity, dash }: ShapeStyle) =>
  `fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw ?? 1.4}"` : ""}${dash ? ` stroke-dasharray="${dash}"` : ""}${opacity !== undefined ? ` opacity="${opacity}"` : ""}`;

const xmlText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class Drawing {
  readonly camera: THREE.PerspectiveCamera;
  readonly eye: THREE.Vector3;
  readonly bounds: THREE.Box3;
  readonly style: DrawingStyle;
  private items: { layer: number; depth: number; svg: string }[] = [];
  private frame = new THREE.Matrix4();

  /** A drawing of `model`, seen from the camera its 3D view starts from, in a style. */
  constructor(model: Box, style: DrawingStyle = STYLES.thin) {
    this.style = style;
    const { bounds, screen } = extent(model);
    const f = frameFor(bounds.min.toArray(), bounds.max.toArray(), screen ? screen.toArray() : null, W / H);
    this.camera = new THREE.PerspectiveCamera(FOV_DEG, W / H, 1, 1e6);
    this.camera.position.set(...f.position);
    this.camera.lookAt(new THREE.Vector3(...f.target));
    this.camera.updateMatrixWorld();
    this.camera.updateProjectionMatrix();
    this.eye = this.camera.position.clone();
    this.bounds = bounds;
  }

  /** Everything `draw` adds is placed by `frame` (a turn round the upright axis and a move, for the solids), inside any frame already in force. */
  within<T>(frame: THREE.Matrix4, draw: () => T): T {
    const before = this.frame;
    this.frame = before.clone().multiply(frame);
    try {
      return draw();
    } finally {
      this.frame = before;
    }
  }

  private world(v: Vec3): THREE.Vector3 {
    return new THREE.Vector3(...v).applyMatrix4(this.frame);
  }

  /** A point in millimetres to the picture: [x, y]. */
  at(v: Vec3): Point {
    const p = this.world(v).project(this.camera);
    return [((p.x + 1) / 2) * W, ((1 - p.y) / 2) * H];
  }

  facing(centre: Vec3, normal: Vec3): boolean {
    return new THREE.Vector3(...normal).transformDirection(this.frame).dot(this.eye.clone().sub(this.world(centre))) > 0;
  }

  private depth(v: Vec3): number {
    return this.eye.distanceTo(this.world(v));
  }

  private push(layer: number, ref: Vec3, svg: string): void {
    this.items.push({ layer, depth: this.depth(ref), svg });
  }

  /** An upright solid: `outline` is its plan ([x, z] points, convex) from y0 to y1. The faces towards the viewer are filled, its outline drawn. */
  prism(outline: Point[], y0: number, y1: number, { top = "url(#top)", front = "url(#face)", side = "#0b111c", stroke = LINE, sw = 2, layer = 0 }: SolidStyle = {}): this {
    const cx = outline.reduce((s, p) => s + p[0], 0) / outline.length;
    const cz = outline.reduce((s, p) => s + p[1], 0) / outline.length;
    const lo = outline.map(([x, z]) => this.at([x, y0, z]));
    const hi = outline.map(([x, z]) => this.at([x, y1, z]));
    const parts: string[] = [];
    // the sides, in runs of the same fill: a face looking mostly forward is the front, the rest are sides
    const kind = outline.map(([x0, z0], i) => {
      const [x1, z1] = outline[(i + 1) % outline.length];
      let nx = z1 - z0;
      let nz = -(x1 - x0);
      if (nx * ((x0 + x1) / 2 - cx) + nz * ((z0 + z1) / 2 - cz) < 0) [nx, nz] = [-nx, -nz];
      const mid: Vec3 = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
      if (!this.facing(mid, [nx, 0, nz])) return null;
      const seen = new THREE.Vector3(nx, 0, nz).applyMatrix4(new THREE.Matrix4().extractRotation(this.frame));
      return seen.z > Math.abs(seen.x) ? front : side;
    });
    for (let i = 0; i < outline.length; i++) {
      if (!kind[i] || kind[(i - 1 + outline.length) % outline.length] === kind[i]) continue;
      let j = i;
      while (kind[(j + 1) % outline.length] === kind[i] && (j + 1) % outline.length !== i) j++;
      const idx: number[] = [];
      for (let k = i; k <= j + 1; k++) idx.push(k % outline.length);
      const pts = [...idx.map((k) => lo[k]), ...idx.reverse().map((k) => hi[k])];
      parts.push(`<path d="${path(pts)}" ${attrs({ fill: kind[i] ?? undefined, stroke: kind[i] ?? undefined, sw: 0.6 })}/>`);
    }
    if (kind.every((k) => k)) parts.push(`<path d="${path(lo)}" fill="${front}"/>`);
    const above = this.eye.y > this.world([cx, y1, cz]).y;
    if (above) parts.push(`<path d="${path(hi)}" ${attrs({ fill: top })}/>`);
    // the creases where a front meets a side
    for (let i = 0; i < outline.length; i++) {
      const before = kind[(i - 1 + outline.length) % outline.length];
      if (before && kind[i] && before !== kind[i]) parts.push(`<path d="M${n(lo[i][0])} ${n(lo[i][1])}L${n(hi[i][0])} ${n(hi[i][1])}" stroke="${stroke}" stroke-width="${sw * 0.7}"/>`);
    }
    parts.push(`<path d="${path(hull([...lo, ...hi]))}" ${attrs({ stroke, sw })}/>`);
    if (above) parts.push(`<path d="${path(hi)}" ${attrs({ stroke, sw: sw * 0.8 })}/>`);
    this.push(layer, [cx, (y0 + y1) / 2, cz], parts.join(""));
    return this;
  }

  box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, style?: SolidStyle): this {
    return this.prism(
      [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0, z1],
      ],
      y0,
      y1,
      style,
    );
  }

  /** A rounded rectangle plan, `w` across x and `d` across z, corners of radius r. */
  rounded(cx: number, cz: number, w: number, d: number, r: number, y0: number, y1: number, style?: SolidStyle, seg = 5): this {
    const pts: Point[] = [];
    const corners = [
      [w / 2 - r, d / 2 - r, 0],
      [-w / 2 + r, d / 2 - r, 90],
      [-w / 2 + r, -d / 2 + r, 180],
      [w / 2 - r, -d / 2 + r, 270],
    ];
    for (const [x, z, a0] of corners)
      for (let k = 0; k <= seg; k++) {
        const a = ((a0 + (90 * k) / seg) * Math.PI) / 180;
        pts.push([cx + x + r * Math.cos(a), cz + z + r * Math.sin(a)]);
      }
    return this.prism(pts, y0, y1, style);
  }

  cylinder(cx: number, cz: number, r: number, y0: number, y1: number, style?: SolidStyle, seg = 24): this {
    const pts: Point[] = [];
    for (let k = 0; k < seg; k++) pts.push([cx + r * Math.cos((k * 2 * Math.PI) / seg), cz + r * Math.sin((k * 2 * Math.PI) / seg)]);
    return this.prism(pts, y0, y1, style);
  }

  /** A flat shape on a face: corners in millimetres, `normal` the way the face looks (drawn only when it looks towards the viewer). */
  flat(points: Vec3[], normal: Vec3, style: ShapeStyle, layer = 1): this {
    const centre = points.reduce((s, p) => s.map((v, i) => v + p[i] / points.length) as Vec3, [0, 0, 0] as Vec3);
    if (!this.facing(centre, normal)) return this;
    this.push(layer, centre, `<path d="${path(points.map((p) => this.at(p)))}" ${attrs(style)}/>`);
    return this;
  }

  /** A rectangle w by h centred at c on a face spanned by the directions u and v (unit vectors), looking along u x v. Corners rounded by r. */
  rect(c: Vec3, u: Vec3, v: Vec3, w: number, h: number, style: ShapeStyle, layer = 1, r = 0): this {
    const pts: Vec3[] = [];
    const corner = (su: number, sv: number, a0: number) => {
      const steps = r > 0 ? 2 : 0;
      for (let k = 0; k <= steps; k++) {
        const a = ((a0 + (steps ? (90 * k) / steps : 0)) * Math.PI) / 180;
        const du = su * (w / 2 - r) + (r ? r * Math.cos(a) : 0);
        const dv = sv * (h / 2 - r) + (r ? r * Math.sin(a) : 0);
        pts.push(c.map((x, i) => x + u[i] * du + v[i] * dv) as Vec3);
      }
    };
    corner(1, 1, 0);
    corner(-1, 1, 90);
    corner(-1, -1, 180);
    corner(1, -1, 270);
    const normal: Vec3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    return this.flat(pts, normal, style, layer);
  }

  circle(c: Vec3, u: Vec3, v: Vec3, r: number, style: ShapeStyle, layer = 1): this {
    return this.rect(c, u, v, 2 * r, 2 * r, style, layer, r);
  }

  /** A box in its own coordinates, placed by `frame`: every face that looks towards the viewer, for a lid or a leaning panel. `fills` names the faces: front (+Z),
   * back (-Z), top (+Y), bottom (-Y), side (the X faces). */
  placed(
    frame: THREE.Matrix4,
    [x0, x1]: [number, number],
    [y0, y1]: [number, number],
    [z0, z1]: [number, number],
    { fills = {}, stroke = LINE, sw = 1.6, layer = 1 }: { fills?: { front?: string; back?: string; top?: string; bottom?: string; side?: string }; stroke?: string; sw?: number; layer?: number } = {},
  ): this {
    const pt = (x: number, y: number, z: number): Vec3 => new THREE.Vector3(x, y, z).applyMatrix4(frame).toArray();
    const way = (x: number, y: number, z: number): Vec3 => new THREE.Vector3(x, y, z).transformDirection(frame).toArray();
    const faces: [string, Vec3, Vec3[]][] = [
      [fills.front ?? "url(#face)", [0, 0, 1], [pt(x0, y0, z1), pt(x1, y0, z1), pt(x1, y1, z1), pt(x0, y1, z1)]],
      [fills.back ?? "#0b111c", [0, 0, -1], [pt(x0, y0, z0), pt(x1, y0, z0), pt(x1, y1, z0), pt(x0, y1, z0)]],
      [fills.top ?? "url(#top)", [0, 1, 0], [pt(x0, y1, z0), pt(x1, y1, z0), pt(x1, y1, z1), pt(x0, y1, z1)]],
      [fills.bottom ?? "#0b111c", [0, -1, 0], [pt(x0, y0, z0), pt(x1, y0, z0), pt(x1, y0, z1), pt(x0, y0, z1)]],
      [fills.side ?? "#0b111c", [1, 0, 0], [pt(x1, y0, z0), pt(x1, y1, z0), pt(x1, y1, z1), pt(x1, y0, z1)]],
      [fills.side ?? "#0b111c", [-1, 0, 0], [pt(x0, y0, z0), pt(x0, y1, z0), pt(x0, y1, z1), pt(x0, y0, z1)]],
    ];
    for (const [fill, normal, points] of faces) this.flat(points, way(...normal), { fill, stroke, sw }, layer);
    return this;
  }

  /** A small round mark, cheap in bytes: an SVG circle at c, `r` millimetres across as seen along X. */
  dot(c: Vec3, r: number, style: ShapeStyle, layer = 1): this {
    const [x, y] = this.at(c);
    const [ex] = this.at([c[0] + r, c[1], c[2]]);
    this.push(layer, c, `<circle cx="${n(x)}" cy="${n(y)}" r="${n(Math.max(0.5, Math.abs(ex - x)))}" ${attrs(style)}/>`);
    return this;
  }

  /** A light: a glow and a dot, `r` picture pixels. */
  light(c: Vec3, colour: string, r = 2, layer = 2, normal: Vec3 | null = null): this {
    if (normal && !this.facing(c, normal)) return this;
    const [x, y] = this.at(c);
    this.push(layer, c, `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r * 2.2)}" fill="${colour}" opacity=".45" filter="url(#glow)"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${colour}"/>`);
    return this;
  }

  /** A line through points in millimetres. */
  line(points: Vec3[], style: ShapeStyle, layer = 1, normal: Vec3 | null = null): this {
    const centre = points.reduce((s, p) => s.map((v, i) => v + p[i] / points.length) as Vec3, [0, 0, 0] as Vec3);
    if (normal && !this.facing(centre, normal)) return this;
    const pts = points.map((p) => this.at(p));
    this.push(layer, centre, `<path d="M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join("L")}" ${attrs(style)}/>`);
    return this;
  }

  /** Many separate lines as one path, which costs far fewer bytes: `segments` is a list of [from, to]. */
  lines(segments: [Vec3, Vec3][], style: ShapeStyle, layer = 1, normal: Vec3 | null = null): this {
    const ends = segments.flat();
    const centre = ends.reduce((s, p) => s.map((v, i) => v + p[i] / ends.length) as Vec3, [0, 0, 0] as Vec3);
    if (normal && !this.facing(centre, normal)) return this;
    const d = segments
      .map(([a, b]) => {
        const [ax, ay] = this.at(a);
        const [bx, by] = this.at(b);
        return `M${n(ax)} ${n(ay)}L${n(bx)} ${n(by)}`;
      })
      .join("");
    this.push(layer, centre, `<path d="${d}" ${attrs(style)}/>`);
    return this;
  }

  /** The caller's own words on a print face, skewed to lie on it, its text escaped. Nothing when the face looks away. */
  text(world: THREE.Matrix4, w: number, h: number, words: string, layer = 8): this {
    const ch = (x: number, y: number) => {
      const p = new THREE.Vector3(x, y, 0).applyMatrix4(world);
      const out = p.project(this.camera);
      return [((out.x + 1) / 2) * W, ((1 - out.y) / 2) * H];
    };
    const centre = new THREE.Vector3().setFromMatrixPosition(world);
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(world);
    if (normal.dot(this.eye.clone().sub(centre)) <= 0 || !words) return this;
    const size = Math.min(h * 0.8, (w / Math.max(1, [...words].length)) * 1.6);
    const [ox, oy] = ch(0, 0);
    const [ax, ay] = ch(1, 0);
    const [bx, by] = ch(0, -1);
    const f = (v: number) => (Math.round(v * 1000) / 1000).toString();
    this.items.push({
      layer,
      depth: this.eye.distanceTo(centre),
      svg: `<text transform="matrix(${f(ax - ox)} ${f(ay - oy)} ${f(bx - ox)} ${f(by - oy)} ${f(ox)} ${f(oy)})" font-family="system-ui,sans-serif" font-size="${f(size)}" font-weight="600" text-anchor="middle" dominant-baseline="central" fill="#dfe6f0" opacity=".85">${xmlText(words)}</text>`,
    });
    return this;
  }

  svg(): string {
    const b = this.bounds;
    const foot = [
      [b.min.x, b.min.y, b.min.z],
      [b.max.x, b.min.y, b.min.z],
      [b.max.x, b.min.y, b.max.z],
      [b.min.x, b.min.y, b.max.z],
    ].map((p) => {
      const q = new THREE.Vector3(...(p as Vec3)).project(this.camera);
      return [((q.x + 1) / 2) * W, ((1 - q.y) / 2) * H];
    });
    const xs = foot.map((p) => p[0]);
    const ys = foot.map((p) => p[1]);
    const shadow = `<ellipse cx="${n((Math.min(...xs) + Math.max(...xs)) / 2)}" cy="${n(Math.max(...ys) - 4)}" rx="${n((Math.max(...xs) - Math.min(...xs)) * 0.45)}" ry="9" fill="#000" opacity=".55" filter="url(#soft)"/>`;
    const body = [...this.items].sort((a, c) => a.layer - c.layer || c.depth - a.depth).map((item) => item.svg);
    const text = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" stroke-linejoin="round" stroke-linecap="round">${DEFS}<ellipse cx="160" cy="110" rx="150" ry="100" fill="url(#halo)"/>${shadow}${body.join("")}</svg>\n`;
    return inStyle(text, this.style);
  }
}

// directions for faces
export const X: Vec3 = [1, 0, 0];
export const Y: Vec3 = [0, 1, 0];
export const Z: Vec3 = [0, 0, 1];
export const NX: Vec3 = [-1, 0, 0];
export const NZ: Vec3 = [0, 0, -1];
