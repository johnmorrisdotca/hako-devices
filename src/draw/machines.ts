// The drawings of the well-known machines, from the one description their meshes use (build/machines.ts).
import * as THREE from "three";
import type { Vec3 } from "../build/kit.ts";
import { bandPoints, eachMark, type MachineSpec, type Mark, type MarkKind } from "../build/machines.ts";
import { DARK, HOLE, METAL } from "./common.ts";
import { type Drawing, type ShapeStyle, type SolidStyle, X, Y } from "./drawing.ts";

const FLAT: Vec3 = [0, 0, -1];
const SCREEN: ShapeStyle = { fill: "#0d1a2e", stroke: "#8fa1b8", sw: 1 };
const LCD: ShapeStyle = { fill: "#26364c", stroke: "#8fa1b8", sw: 1 };
const KEY: ShapeStyle = { fill: "#232e40", stroke: "#8fa1b8", sw: 0.7 };
const STYLE: Readonly<Record<Exclude<MarkKind, "light">, ShapeStyle>> = { screen: SCREEN, lcd: LCD, dark: HOLE, panel: DARK, slot: HOLE, key: KEY };
const PAINT: Readonly<Record<string, ShapeStyle>> = {
  "shell-orange": { fill: "#c9652c", stroke: "#8fa1b8", sw: 0.6 },
  "shell-silver": { fill: "#d5d8dc", stroke: "#8fa1b8", sw: 0.5 },
  alu: { fill: "#c9cdd3", stroke: "#8fa1b8", sw: 0.5 },
  "alu-dark": { fill: "#6a6e76", stroke: "#8fa1b8", sw: 0.5 },
  "plastic-grey": { fill: "#5c6370", stroke: "#8fa1b8", sw: 0.5 },
  "plastic-white": { fill: "#e7e4dc", stroke: "#8fa1b8", sw: 0.5 },
  "plastic-black": { fill: "#14161c", stroke: "#8fa1b8", sw: 0.5 },
  "pale-glass": { fill: "#c5d2c0", stroke: "#8fa1b8", sw: 0.6 },
  "pcb-green": { fill: "#1f6c40", stroke: "#8fa1b8", sw: 0.5 },
  "plastic-gloss": { fill: "#14161a", stroke: "#8fa1b8", sw: 0.5 },
  "plastic-blue": { fill: "#3f6fb0", stroke: "#8fa1b8", sw: 0.5 },
  clear: { fill: "#d5e4ef", stroke: "#8fa1b8", sw: 0.4 },
  bezel: { fill: "#14161c", stroke: "#8fa1b8", sw: 0.4 },
};
const BLUE: SolidStyle = { top: "#7aa0cc", front: "#3f6fb0", side: "#2c4f86", sw: 1.3 };

function paintOf(mark: Mark): ShapeStyle {
  if (mark.kind === "light") return { fill: "#ff5a4a", stroke: "#8fa1b8", sw: 0.5 };
  return (mark.material && PAINT[mark.material]) || STYLE[mark.kind];
}

function drawFace(d: Drawing, marks: readonly Mark[], thick: number, yShift: number) {
  for (const mark of marks) {
    if (mark.face !== "front" && mark.face !== "back") continue;
    const sign = mark.face === "front" ? 1 : -1;
    const style = paintOf(mark);
    eachMark(mark, (x, y) => {
      const c: Vec3 = [x, y + yShift, sign * (thick / 2 + 0.25 + (mark.out ?? 0))];
      const pill = mark.kind === "key" && !mark.round && mark.h > 2 && mark.w > mark.h * 1.3;
      if (mark.round && mark.w >= 12) {
        d.circle(c, X, Y, mark.w / 2, style, 4);
        d.circle(c, X, Y, mark.w / 2 - 2.2, HOLE, 3);
      } else if (mark.round) d.circle(c, X, Y, mark.w / 2, style, 4);
      else d.rect(c, X, Y, mark.w, mark.h, style, 4, pill ? mark.h / 2 : Math.min(mark.w, mark.h) * 0.22);
    });
  }
}

function drawFlip(d: Drawing, spec: MachineSpec) {
  const [w, depth, h] = spec.size;
  const hinge = spec.hinge ?? h * 0.55;
  const lean = ((spec.lean ?? 20) * Math.PI) / 180;
  const gap = 1.4;
  const lowerT = spec.half ?? depth * 0.5;
  const lidT = spec.lidThick ?? lowerT;
  const radius = Math.min(spec.corner, w / 2 - 0.4, (hinge - gap) / 2 - 0.2);
  const style = spec.body === "shell-silver" ? METAL : undefined;
  d.rounded(0, 0, w, lowerT, radius, 0, hinge - gap, style, 4);
  if (spec.chin) d.rounded(0, 0.5, w * 0.94, lowerT + 2.4, Math.min(3, spec.chin / 2 - 0.3), 0, spec.chin, style, 3);
  d.cylinder(0, 0, Math.min(lowerT, lidT) * 0.42, hinge - 1.1, hinge + 1.1, style, 12);
  const lid = spec.marks.filter((mark) => mark.y - mark.h / 2 >= hinge - 1);
  drawFace(d, spec.marks.filter((mark) => !lid.includes(mark)), lowerT, 0);
  const frame = new THREE.Matrix4().makeTranslation(0, hinge, 0).multiply(new THREE.Matrix4().makeRotationX(-lean));
  d.within(frame, () => {
    d.rounded(0, 0, w, lidT, radius, gap, h - hinge, style, 4);
    drawFace(d, lid, lidT, -hinge);
  });
  return d;
}

function drawShell(d: Drawing, spec: MachineSpec) {
  const [w, depth, h] = spec.size;
  const r = Math.min(spec.corner, w / 2 - 0.6, h / 2 - 0.6);
  const style = spec.body === "plastic-blue" ? BLUE : undefined;
  const frame = new THREE.Matrix4().makeTranslation(0, h / 2, 0).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  d.within(frame, () => d.rounded(0, 0, w, h, r, -depth / 2, depth / 2, style, 5));
  if (spec.antenna && spec.shape === "shell") d.cylinder(w * 0.32, 0, 2.2, h - 3, h + spec.antenna, style, 10);
  for (const mark of spec.marks) {
    if (mark.face !== "front") continue;
    const paint = paintOf(mark);
    eachMark(mark, (x, y) => {
      const c: Vec3 = [x, y, depth / 2 + 0.3 + (mark.out ?? 0)];
      const oval = !mark.cols && !mark.round && mark.kind !== "panel" && mark.kind !== "slot" && mark.w > mark.h * 1.35;
      if (mark.round) d.circle(c, X, Y, mark.w / 2, paint, 4);
      else d.rect(c, X, Y, mark.w, mark.h, paint, 4, oval ? mark.h / 2 : Math.min(mark.w, mark.h) * 0.28);
    });
  }
  return d;
}

export function machine(d: Drawing, spec: MachineSpec) {
  const [w, depth, h] = spec.size;
  const band: ShapeStyle = { stroke: "#8fa1b8", sw: 3 };
  if (spec.shape === "flip") return drawFlip(d, spec);
  if (spec.shape === "shell") return drawShell(d, spec);
  if (spec.shape === "headphones") {
    d.line(bandPoints("headphones", w, depth, h), band, 1);
    for (const side of [-1, 1]) d.rounded(side * (w / 2 - 17), 0, 34, depth, spec.corner, 0, 110, { layer: 2 }, 5);
    return d;
  }
  if (spec.shape === "headset") {
    d.line(bandPoints("headset", w, depth, h), band, 0);
    d.rounded(0, depth / 4, w, depth / 2, spec.corner, 0, h, { layer: 1 }, 5);
    d.rect([0, h / 2, depth / 2 + 0.2], X, Y, w - 14, h - 14, SCREEN, 2, spec.corner - 6);
    return d;
  }
  if (spec.shape === "can") {
    d.rounded(0, 0, w, depth, Math.min(w, depth) / 2 - 0.1, 0, h * 0.78, { layer: 1 }, 5);
    d.rect([w * 0.2, h * 0.86, 0], X, Y, w * 0.5, 4, { stroke: "#8fa1b8", sw: 1 }, 2, 1);
  } else d.rounded(0, 0, w, depth, Math.min(spec.corner, Math.min(w, depth) / 2 - 0.1), 0, h, { layer: 1 }, 5);
  spec.marks.forEach((mark, i) => {
    const layer = 2 + Math.min(i, 3);
    const cols = mark.cols ?? 1;
    const rows = mark.rows ?? 1;
    // A big block of keys is one panel ruled into keys, so a keyboard stays a small file.
    if (mark.face === "top" && cols * rows > 20) {
      const gap = mark.gap ?? 0;
      const width = cols * (mark.w + gap);
      const height = rows * (mark.h + gap);
      d.rect([mark.x, h + 0.2, mark.y], X, FLAT, width, height, KEY, layer, 1);
      const rule: [Vec3, Vec3][] = [];
      for (let c = 1; c < cols; c++) rule.push([[mark.x - width / 2 + c * (mark.w + gap), h + 0.25, mark.y - height / 2], [mark.x - width / 2 + c * (mark.w + gap), h + 0.25, mark.y + height / 2]]);
      for (let r = 1; r < rows; r++) rule.push([[mark.x - width / 2, h + 0.25, mark.y - height / 2 + r * (mark.h + gap)], [mark.x + width / 2, h + 0.25, mark.y - height / 2 + r * (mark.h + gap)]]);
      d.lines(rule, { stroke: "#5f7188", sw: 0.5 }, layer + 1);
      return;
    }
    eachMark(mark, (x, y) => {
      const c: Vec3 = mark.face === "top" ? [x, h + 0.2, y] : [x, y, mark.face === "back" ? -depth / 2 - 0.2 : depth / 2 + 0.2];
      const v: Vec3 = mark.face === "top" ? FLAT : Y;
      if (mark.kind === "light" && mark.round) d.light(c, "#ff5a4a", mark.w / 2, layer + 1, mark.face === "top" ? null : [0, 0, mark.face === "back" ? -1 : 1]);
      else if (mark.kind === "light") d.rect(c, X, v, mark.w, mark.h, { fill: "#ff5a4a", stroke: "#8fa1b8", sw: 0.6 }, layer, 1);
      else if (mark.round) d.circle(c, X, v, mark.w / 2, STYLE[mark.kind], layer);
      else d.rect(c, X, v, mark.w, mark.h, STYLE[mark.kind], layer, Math.min(mark.w, mark.h) * 0.12);
    });
  });
  return d;
}
