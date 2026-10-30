// What every drawing shares: the colours of its solids, and the pieces of a board. `p` turns board millimetres (bx along the long edge, bz in from the video edge) into the drawing's.
import { type Drawing, NZ, type ShapeStyle, type SolidStyle, X } from "./drawing.ts";
import type { Vec3 } from "../build/kit.ts";

export const DARK: ShapeStyle = { fill: "#111a2a", stroke: "#8fa1b8", sw: 1.2 };
export const HOLE: ShapeStyle = { fill: "#05080e", stroke: "#8fa1b8", sw: 0.8 };
export const METAL: SolidStyle = { top: "url(#metal)", front: "url(#metal)", side: "#1b2433", sw: 1.2 };
export const BLACK: SolidStyle = { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: 1.2 };
export const GOLD: ShapeStyle = { stroke: "#d9b45a", sw: 1.2 };
export const GREEN = "#4ade80";
export const BLUE = "#6cd0ff";
export const RED = "#f87171";
export const AMBER = "#fbbf24";
export const ACCENT: ShapeStyle = { stroke: "#6cd0ff", sw: 1.6 };

export type BoardPoint = (bx: number, y: number, bz: number) => Vec3;
/** The point of a screen at u across and v down (0 to 1). */
export type PictureAt = (u: number, v: number) => Vec3;

export const board =
  (D: number): BoardPoint =>
  (bx, y, bz) => [bx, y, D / 2 - bz];

export function pcb(d: Drawing, p: BoardPoint, W: number, D: number, fill = "url(#pcb)", y0 = 0, layer = 0) {
  const outline = [
    [0, 0],
    [W, 0],
    [W, D],
    [0, D],
  ].map(([bx, bz]): [number, number] => {
    const [x, , z] = p(bx, 0, bz);
    return [x, z];
  });
  d.prism(outline, y0, y0 + 1.5, { top: fill, front: "#0b111c", side: "#0b111c", sw: 1.6, layer });
  for (const [hx, hz] of [
    [3.5, 3.5],
    [W === 85 ? 61.5 : W - 3.5, 3.5],
    [3.5, D - 3.5],
    [W === 85 ? 61.5 : W - 3.5, D - 3.5],
  ])
    d.circle(p(hx, y0 + 1.55, hz), X, NZ, 2.4, GOLD, layer + 0.5);
}

/** A box on a board, from bx0 to bx1 and bz0 to bz1, h tall from the board's top. */
export function part(d: Drawing, p: BoardPoint, [bx0, bx1]: number[], [bz0, bz1]: number[], h: number, style: SolidStyle, y0 = 1.4) {
  const a = p(bx0, 0, bz0);
  const b = p(bx1, 0, bz1);
  d.box(Math.min(a[0], b[0]), Math.max(a[0], b[0]), y0, y0 + h, Math.min(a[2], b[2]), Math.max(a[2], b[2]), style);
}

/** The 40-pin header: its plastic and a field of pins on top. */
export function header(d: Drawing, p: BoardPoint, D: number, y0 = 1.4, h = 8.5, layer = 1) {
  part(d, p, [7.1, 57.9], [D - 6, D - 1], h, { ...BLACK, layer }, y0);
  const corner = (bx: number, bz: number) => p(bx, y0 + h + 0.05, bz);
  d.flat([corner(7.6, D - 5.5), corner(57.4, D - 5.5), corner(57.4, D - 1.5), corner(7.6, D - 1.5)], [0, 1, 0], { fill: "url(#pins)" }, layer + 0.5);
}

/** The sockets of a full-size board: network and USB at the right-hand end, power, video and sound along the front. */
export function piEdges(d: Drawing, p: BoardPoint, { ethernet, usb, blue, front }: { ethernet: number; usb: number[]; blue: number[]; front: number[][] }) {
  part(d, p, [64, 87.5], [ethernet - 8, ethernet + 8], 13.5, { ...METAL, layer: 1 });
  d.rect(p(87.6, 7, ethernet), NZ, [0, 1, 0], 12, 8, HOLE, 1.5);
  for (const bz of usb) {
    part(d, p, [70, 87.5], [bz - 6.6, bz + 6.6], 15.6, { ...METAL, layer: 1 });
    for (const y of [5.6, 12.8]) {
      d.rect(p(87.6, y, bz), NZ, [0, 1, 0], 12, 5, HOLE, 1.5);
      if (blue.includes(bz)) d.rect(p(87.7, y - 0.8, bz), NZ, [0, 1, 0], 10, 1.6, { fill: "#2160d8" }, 1.6);
    }
  }
  for (const [bx, w, h] of front) part(d, p, [bx - w / 2, bx + w / 2], [-1.2, 6], h, { ...METAL, layer: 1 });
}
