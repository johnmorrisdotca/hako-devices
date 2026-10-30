// The drawings of the things that connect to a computer, made exactly as the machines' are: the same thin line, dark gradient faces and camera, from the sizes of their 3D parts.
// In the thin style what tells Android apart is a small detail, its round camera. The other styles are styles.ts.
import * as THREE from "three";
import type { Box, Vec3 } from "../build/kit.ts";
import { METAL } from "./common.ts";
import { type Drawing, type ShapeStyle, X, Z } from "./drawing.ts";
import { homePicture, phonePicture } from "./pictures.ts";
import { roundedOn, slabOnStand } from "./tablets.ts";

const FLAT: Vec3 = [0, 0, -1];
const DETAIL: ShapeStyle = { fill: "#05080e", stroke: "#8fa1b8", sw: 0.8 };

/** A dark dot on the glass of a slab on its stand, at (x, y) in the slab's own millimetres. */
function glassDot(d: Drawing, model: Box, x: number, y: number, r: number) {
  const { frame } = model.slabFacts as NonNullable<Box["slabFacts"]>;
  d.dot(new THREE.Vector3(x, y, 0.3).applyMatrix4(frame).toArray(), r, DETAIL, 6);
  return d;
}

export const clientFireTv = (d: Drawing) => {
  // the stick and its plug, then the remote beside it with its ring of keys
  d.box(43, 58, 3, 11, -31, -21, { ...METAL, layer: 0 });
  d.rounded(0, -26, 86, 30, 8, 0, 14, { layer: 1 }, 3);
  d.rounded(-6, 22, 130, 38, 14, 0, 10, { layer: 2 }, 3);
  d.circle([24, 10.1, 22], X, FLAT, 13, { fill: "#05080e", stroke: "#8fa1b8", sw: 1.2 }, 3);
  d.circle([24, 10.2, 22], X, FLAT, 5.2, { fill: "#232e40", stroke: "#8fa1b8", sw: 0.8 }, 4);
  for (const [x, z] of [
    [-4, 13],
    [-4, 22],
    [-4, 31],
    [-20, 13],
    [-20, 22],
    [-20, 31],
    [-36, 22],
  ])
    d.dot([x, 10.2, z], 2.6, { fill: "#05080e", stroke: "#8fa1b8", sw: 0.6 }, 3);
  d.light([44, 10.2, 22], "#4aa8ff", 1, 4);
  return d;
};

/** The flat TV: a very thin frame, the picture nearly to its edge, two blade feet. */
export const clientAndroidTv = (d: Drawing, model: Box) => {
  const { W, H, y0 } = model.tvFacts as NonNullable<Box["tvFacts"]>;
  const foot = { ...METAL, layer: 0 };
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - 170);
    // a blade along the desk, turned a little outward, and the post up to the screen
    const a = (s * 12 * Math.PI) / 180;
    const c = x + s * 22;
    const corner = (dx: number, dz: number): [number, number] => [c + dx * Math.cos(a) + dz * Math.sin(a), -6 - dx * Math.sin(a) + dz * Math.cos(a)];
    d.prism([corner(-9, -120), corner(9, -120), corner(9, 120), corner(-9, 120)], 0, 8, foot);
    d.box(x - 7, x + 7, 8, y0 + 6, -20, -4, foot);
  }
  d.box(-W / 2, W / 2, y0, y0 + H, -30, 0, { front: "#0b111c", layer: 1 });
  const pw = W - 16;
  const ph = pw * (9 / 16);
  const at = (u: number, v: number): Vec3 => [-pw / 2 + u * pw, y0 + H / 2 + ph / 2 - v * ph, 0.6];
  homePicture(d, at, Z, 3);
  return d;
};


/** An Android slab's edge and line: its own dark colours, unless the style gives Android its own (styles.mjs). */
const androidSlab = (d: Drawing, shell: string) => ({ shell: d.style.androidShell ?? shell, ...(d.style.androidEdge ? { edge: d.style.androidEdge } : {}) });

/** Android's tablet: dark, a thin even bezel, its round camera in the long edge. */
export const clientAndroidTablet = (d: Drawing, model: Box) => {
  slabOnStand(d, model, androidSlab(d, "#1b2433"));
  const { h, screen } = model.slabFacts as NonNullable<Box["slabFacts"]>;
  return glassDot(d, model, 0, h - (h - screen[1]) / 4, 1.6);
};

/** Android's phone: the picture almost to its edges, the round camera at the top of the glass. */
export const clientAndroidPhone = (d: Drawing, model: Box) => {
  slabOnStand(d, model, { ...androidSlab(d, "#3a475c"), picture: phonePicture });
  return glassDot(d, model, 0, (model.slabFacts as NonNullable<Box["slabFacts"]>).h - 6, 1.9);
};

/** A computer's monitor on its stand. */
export const clientComputer = (d: Drawing, model: Box) => {
  const frame = model.panelFrame as THREE.Matrix4;
  const { W, H, T } = model.panelSize as NonNullable<Box["panelSize"]>;
  const out: Vec3 = new THREE.Vector3(0, 0, 1).transformDirection(frame).toArray();
  d.rounded(0, 0, 220, 170, 12, 0, 8, { ...METAL, layer: 0 }, 3);
  d.box(-35, 35, 8, 160, -38, -16, { ...METAL, layer: 0.5 });
  d.placed(frame, [-W / 2, W / 2], [0, H], [-T, 0], { fills: { front: "#0b111c" }, sw: 2, layer: 1 });
  const pw = W - 14;
  const ph = pw * (9 / 16);
  const at = (u: number, v: number): Vec3 => new THREE.Vector3(-pw / 2 + u * pw, H / 2 + 3 + ph / 2 - v * ph, 0.5).applyMatrix4(frame).toArray();
  homePicture(d, at, out, 3);
  return d;
};

/** A browser window: its bar with three small dots and the address, the page under it. */
export const clientBrowser = (d: Drawing, model: Box) => {
  const { W, H, y0, bar } = model.windowSize as NonNullable<Box["windowSize"]>;
  const plain = new THREE.Matrix4();
  d.flat(roundedOn(plain, W, H, 9, -4, y0), Z, { fill: "#1b2433", stroke: "#8fa1b8", sw: 2 }, 1);
  d.flat(roundedOn(plain, W, H, 9, 0, y0), Z, { fill: "url(#face)", stroke: "#8fa1b8", sw: 2 }, 2);
  const p = (x: number, y: number): Vec3 => [x, y0 + y, 0.2];
  const mid = H - bar / 2;
  ["#f87171", "#fbbf24", "#4ade80"].forEach((fill, i) => d.dot(p(-W / 2 + 15 + i * 12, mid), 3, { fill }, 3));
  d.flat([p(-W / 2 + 52, mid - 5.5), p(W / 2 - 4, mid - 5.5), p(W / 2 - 4, mid + 5.5), p(-W / 2 + 52, mid + 5.5)], Z, DETAIL, 3);
  const pw = W - 8;
  const ph = H - bar - 8;
  const at = (u: number, v: number) => p(-pw / 2 + u * pw, 4 + (H - bar) / 2 + ph / 2 - v * ph);
  homePicture(d, at, Z, 3);
  return d;
};
