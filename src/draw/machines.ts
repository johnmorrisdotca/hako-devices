// The drawings of the well-known machines, from the one description their meshes use (build/machines.ts).
import type { Vec3 } from "../build/kit.ts";
import { bandPoints, eachMark, type MachineSpec, type MarkKind } from "../build/machines.ts";
import { DARK, HOLE } from "./common.ts";
import { type Drawing, type ShapeStyle, X, Y } from "./drawing.ts";

const FLAT: Vec3 = [0, 0, -1];
const SCREEN: ShapeStyle = { fill: "#0d1a2e", stroke: "#8fa1b8", sw: 1 };
const LCD: ShapeStyle = { fill: "#26364c", stroke: "#8fa1b8", sw: 1 };
const KEY: ShapeStyle = { fill: "#232e40", stroke: "#8fa1b8", sw: 0.7 };
const STYLE: Readonly<Record<Exclude<MarkKind, "light">, ShapeStyle>> = { screen: SCREEN, lcd: LCD, dark: HOLE, panel: DARK, slot: HOLE, key: KEY };

export function machine(d: Drawing, spec: MachineSpec) {
  const [w, depth, h] = spec.size;
  const band: ShapeStyle = { stroke: "#8fa1b8", sw: 3 };
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
