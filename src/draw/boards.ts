// The drawings of the boards: the board and the tall parts as solids, the rest as flat shapes on them. No marks.
import { BLACK, type BoardPoint, GOLD, GREEN, header, HOLE, METAL, part, pcb, piEdges, RED, board } from "./common.ts";
import { BLUE } from "./common.ts";
import { type Drawing, NZ, X, Y } from "./drawing.ts";
import type { Vec3 } from "../build/kit.ts";

export interface BoardArtContext {
  detail: "full" | "under" | "edges";
  cooled: boolean;
  soldered: boolean;
}

const leds = (d: Drawing, p: BoardPoint) => d.light(p(1.8, 1.8, 6), RED, 1.1, 2).light(p(1.8, 1.8, 8.6), GREEN, 1.1, 2);
const FRONT = [
  [10.6, 8, 3],
  [32, 15, 6],
  [53.5, 7, 6],
];
const ribbonStyle = { top: "#d7d9dc", front: "#8fa1b8", side: "#8fa1b8", sw: 0.8, layer: 1 };

function classicRibbons(d: Drawing, p: BoardPoint) {
  part(d, p, [34, 56], [9.2, 13.8], 3, ribbonStyle);
  part(d, p, [1.2, 5.8], [18, 38], 3, ribbonStyle);
}

export function pi4(d: Drawing, { detail }: BoardArtContext) {
  const p = board(56);
  pcb(d, p, 85, 56);
  header(d, p, 56);
  piEdges(d, p, {
    ethernet: 45.75,
    usb: [27, 9],
    blue: [27],
    front: [
      [11.2, 9, 3.3],
      [26, 7.5, 3.2],
      [39.5, 7.5, 3.2],
      [53.5, 7, 6],
    ],
  });
  if (detail !== "full") return;
  part(d, p, [22, 36], [25, 39], 2, { ...METAL, layer: 1 });
  part(d, p, [39, 53], [27, 37], 1.1, { ...BLACK, layer: 1 });
  part(d, p, [58.5, 67.5], [21.5, 30.5], 1, { ...BLACK, layer: 1 });
  d.light(p(1.8, 1.8, 8), RED, 1.1, 2).light(p(1.8, 1.8, 10.6), GREEN, 1.1, 2);
}

export function pi3b(d: Drawing, { detail }: BoardArtContext) {
  const p = board(56);
  pcb(d, p, 85, 56);
  header(d, p, 56);
  piEdges(d, p, { ethernet: 10.25, usb: [29, 47], blue: [], front: FRONT });
  if (detail === "edges") return;
  part(d, p, [22, 36], [25, 39], 1.2, { ...BLACK, layer: 1 });
  part(d, p, [54.5, 63.5], [15.5, 24.5], 1, { ...BLACK, layer: 1 });
  leds(d, p);
}

function classic(d: Drawing, soc: (p: BoardPoint) => void, detail: BoardArtContext["detail"]) {
  const p = board(56);
  pcb(d, p, 85, 56);
  header(d, p, 56);
  piEdges(d, p, { ethernet: 10.25, usb: [29, 47], blue: [], front: FRONT });
  if (detail === "edges") return p;
  classicRibbons(d, p);
  soc(p);
  part(d, p, [54.5, 63.5], [15.5, 24.5], 1, { ...BLACK, layer: 1 });
  leds(d, p);
  return p;
}

export const pi1bPlus = (d: Drawing, { detail }: BoardArtContext) => {
  classic(d, (q) => part(d, q, [23, 35], [26, 38], 1.9, { ...BLACK, layer: 1 }), detail);
};

export const pi2b = (d: Drawing, { detail }: BoardArtContext) => {
  const p = classic(d, (q) => part(d, q, [22, 36], [25, 39], 1.05, { ...BLACK, layer: 1 }), detail);
  if (detail === "full") d.line([p(25, 2.5, 28), p(33, 2.5, 28)], { stroke: "#8fa1b8", sw: 0.5, opacity: 0.5 }, 2, Y);
};

function lidAndCan(d: Drawing, p: BoardPoint) {
  part(d, p, [22, 36], [25, 39], 2, { ...METAL, layer: 1 });
  part(d, p, [4.5, 17.5], [38, 48], 1.7, { ...METAL, layer: 1 });
}

export const pi3bPlus = (d: Drawing, { detail }: BoardArtContext) => {
  const p = board(56);
  pcb(d, p, 85, 56);
  header(d, p, 56);
  piEdges(d, p, { ethernet: 10.25, usb: [29, 47], blue: [], front: FRONT });
  if (detail === "edges") return;
  classicRibbons(d, p);
  lidAndCan(d, p);
  part(d, p, [54.5, 63.5], [15.5, 24.5], 1, { ...BLACK, layer: 1 });
  part(d, p, [62.7, 67.8], [45.7, 50.8], 6, { ...BLACK, layer: 1 });
  leds(d, p);
};

export const pi3aPlus = (d: Drawing, { detail }: BoardArtContext) => {
  const p = board(56);
  pcb(d, p, 65, 56);
  header(d, p, 56);
  part(d, p, [52.5, 67.5], [24.2, 38.8], 7.4, { ...METAL, layer: 1 });
  d.rect(p(67.6, 5, 31.5), NZ, Y, 12.6, 5.4, HOLE, 1.5);
  for (const [bx, w, h] of FRONT) part(d, p, [bx - w / 2, bx + w / 2], [-1.2, 6], h, { ...METAL, layer: 1 });
  if (detail === "edges") return;
  classicRibbons(d, p);
  lidAndCan(d, p);
  leds(d, p);
};

export function pi5(d: Drawing, { detail, cooled }: BoardArtContext) {
  const p = board(56);
  pcb(d, p, 85, 56);
  header(d, p, 56);
  piEdges(d, p, {
    ethernet: 10.2,
    usb: [29.1, 47],
    blue: [29.1],
    front: [
      [11.2, 9, 3.3],
      [25.8, 7.5, 3.2],
      [39.2, 7.5, 3.2],
    ],
  });
  if (!cooled && detail !== "edges") part(d, p, [22, 36], [23, 37], 2, { ...METAL, layer: 1 });
}

/** The cooler: fins on the left, the fan's shroud on the right. */
export function activeCooler(d: Drawing) {
  const p = board(56);
  part(d, p, [5, 59], [13, 47], 9.6, { ...METAL, layer: 1 }, 4.2);
  for (let i = 0; i < 9; i++) d.line([p(7 + i * 2.6, 13.9, 14), p(7 + i * 2.6, 13.9, 46)], { stroke: "#8fa1b8", sw: 0.7, opacity: 0.6 }, 1.5, Y);
  part(d, p, [31, 59], [13, 47], 7.4, { ...BLACK, layer: 1.6 }, 7.4);
  d.circle(p(45, 14.9, 30), X, NZ, 12, { fill: "#05080e", stroke: "#8fa1b8", sw: 1.2 }, 2);
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    d.line([p(45, 15, 30), p(45 + Math.cos(a) * 9, 15, 30 + Math.sin(a) * 9)], { stroke: BLUE, sw: 1.6 }, 2.5, Y);
  }
}

function zeroCommon(d: Drawing, p: BoardPoint, soldered: boolean) {
  const D = 30;
  pcb(d, p, 65, D);
  if (soldered) header(d, p, D);
  else {
    const corner = (bx: number, bz: number) => p(bx, 1.55, bz);
    d.flat([corner(7.6, D - 5.5), corner(57.4, D - 5.5), corner(57.4, D - 1.5), corner(7.6, D - 1.5)], Y, { fill: "url(#pins)" }, 0.6);
  }
}

const ZERO_FRONT = [
  [12.4, 11.2],
  [41.4, 8],
  [54, 8],
];

export function piZero2w(d: Drawing, { soldered }: BoardArtContext) {
  const p = board(30);
  zeroCommon(d, p, soldered);
  part(d, p, [24, 36], [9, 21], 1.2, { ...BLACK, layer: 1 });
  for (const [bx, w] of ZERO_FRONT) part(d, p, [bx - w / 2, bx + w / 2], [-1.2, 6], 3, { ...METAL, layer: 1 });
  d.light(p(57.5, 1.8, 6.5), GREEN, 1.1, 2);
}

export function piZero1(d: Drawing, { soldered }: BoardArtContext) {
  const p = board(30);
  zeroCommon(d, p, soldered);
  part(d, p, [24, 36], [9, 21], 1.3, { ...BLACK, layer: 1 });
  for (const [bx, w] of ZERO_FRONT) part(d, p, [bx - w / 2, bx + w / 2], [-1.2, 6], 3, { ...METAL, layer: 1 });
  d.light(p(57.5, 1.8, 6.5), GREEN, 1.1, 2);
}

export function piZeroW(d: Drawing, { soldered }: BoardArtContext) {
  const p = board(30);
  zeroCommon(d, p, soldered);
  part(d, p, [24, 36], [9, 21], 1.3, { ...BLACK, layer: 1 });
  part(d, p, [40.5, 45.5], [13.5, 18.5], 0.8, { ...BLACK, layer: 1 });
  d.line([p(46, 1.5, 17), p(54, 1.5, 17), p(50, 1.5, 11), p(46, 1.5, 17)], GOLD, 1, Y);
  for (const [bx, w] of ZERO_FRONT) part(d, p, [bx - w / 2, bx + w / 2], [-1.2, 6], 3, { ...METAL, layer: 1 });
  d.light(p(57.5, 1.8, 6.5), GREEN, 1.1, 2);
}

export function cm4Io(d: Drawing) {
  const D = 90;
  const p = board(D);
  pcb(d, p, 160, D);
  const y = 1.4;
  part(d, p, [7, 17], [-1, 13], 11, { ...BLACK, layer: 1 });
  d.dot(p(12, y + 5.5, -1.1), 3, HOLE, 1.5);
  part(d, p, [25, 41], [-2.5, 18.5], 13.5, { ...METAL, layer: 1 });
  d.rect(p(33, y + 5.8, -2.6), X, Y, 12.4, 8.2, HOLE, 1.5);
  part(d, p, [48.4, 61.6], [-2.5, 15], 15.6, { ...METAL, layer: 1 });
  for (const h of [4.2, 11.4]) d.rect(p(55, y + h, -2.6), X, Y, 12, 5.4, HOLE, 1.5);
  for (const [bx, w, h] of [
    [77, 15, 6],
    [95, 15, 6],
    [112, 8, 3],
  ]) {
    part(d, p, [bx - w / 2, bx + w / 2], [-1.2, 8], h, { ...METAL, layer: 1 });
    d.rect(p(bx, y + h / 2, -1.3), X, Y, w - 1.4, h - 1.4, HOLE, 1.5);
  }
  // the header, the slot, the coin cell, the module with its metal lid
  part(d, p, [10, 61], [D - 6, D - 1], 7.5, { ...BLACK, layer: 1 });
  const corner = (bx: number, bz: number): Vec3 => p(bx, y + 7.6, bz);
  d.flat([corner(10.5, D - 5.5), corner(60.5, D - 5.5), corner(60.5, D - 1.5), corner(10.5, D - 1.5)], Y, { fill: "url(#pins)" }, 1.5);
  part(d, p, [12, 52], [28, 36], 7, { ...BLACK, layer: 1 });
  const [coinX, , coinZ] = p(14, 0, 60);
  d.cylinder(coinX, coinZ, 10.5, y, y + 3, { ...METAL, layer: 1 }, 16);
  part(d, p, [72.5, 127.5], [36, 76], 4.8, { top: "url(#pcb)", front: "#1d4d33", side: "#1d4d33", sw: 1.4, layer: 1.5 });
  part(d, p, [85, 99], [49, 63], 7, { ...METAL, layer: 2 }, 3.6);
  const dark = { fill: "#111a2a", stroke: "#8fa1b8", sw: 0.8 };
  d.rect(p(110.5, 6.8, 48.5), X, NZ, 11, 9, dark, 2);
  d.rect(p(110.5, 6.7, 63.5), X, NZ, 9, 9, dark, 2);
  const white = { fill: "#d7d9dc", stroke: "#8fa1b8", sw: 0.6 };
  d.rect(p(155, 4.4, 22), X, NZ, 4.5, 20, white, 2);
  d.rect(p(155, 4.4, 56), X, NZ, 4.5, 20, white, 2);
  d.light(p(4, 1.8, 40), RED, 1.1, 2).light(p(4, 1.8, 42.6), GREEN, 1.1, 2);
}

const W = 286;
const D = 122;
const FRONT_H = 12.5;
const BACK_H = 23;
const deck = (x: number, z: number, lift = 0): Vec3 => [x, FRONT_H + ((BACK_H - FRONT_H) * (D / 2 - z)) / D + lift, z];

/** The keyboard computers: the pale deck on its slope with the band under it, the keys as a grid. */
function keyboard(d: Drawing, lights: readonly (readonly [number, string])[]) {
  const low = { top: "#4a5160", front: "#6b7280", side: "#4a5160", sw: 1.4 };
  d.rounded(0, 0, W, D, 9, 0, 3.4, low, 3);
  const corners = [
    [-W / 2, -D / 2],
    [W / 2, -D / 2],
    [W / 2, D / 2],
    [-W / 2, D / 2],
  ];
  // the body between the band and the slope: its front and right side, then the deck
  d.flat([[-W / 2, 3.4, D / 2], [W / 2, 3.4, D / 2], deck(W / 2, D / 2), deck(-W / 2, D / 2)], [0, 0, 1], { fill: "url(#face)", stroke: "#8fa1b8", sw: 1.4 }, 1);
  d.flat([[W / 2, 3.4, D / 2], [W / 2, 3.4, -D / 2], deck(W / 2, -D / 2), deck(W / 2, D / 2)], X, { fill: "#0b111c", stroke: "#8fa1b8", sw: 1.4 }, 1);
  d.flat(
    corners.map(([x, z]) => deck(x, z)),
    [0, 1, 0.08],
    { fill: "url(#top)", stroke: "#c8d2e0", sw: 1.8 },
    2,
  );
  const x0 = -135;
  const x1 = 135;
  const zs = [-46.5, -37, -22.4, -7.2, 8, 23.2, 44];
  const rows: [Vec3, Vec3][] = zs.map((z) => [deck(x0, z, 0.2), deck(x1, z, 0.2)]);
  const cols: [Vec3, Vec3][] = [];
  zs.slice(0, -1).forEach((z, r) => {
    const count = r === 5 ? 9 : 14;
    const offset = [0, 0, 4.5, 8, 11, 0][r];
    for (let i = 1; i < count; i++) {
      const x = x0 + offset + (i * (x1 - x0)) / count;
      if (r === 5 && x > -60 && x < 50) continue;
      if (x < x1) cols.push([deck(x, z, 0.2), deck(x, zs[r + 1], 0.2)]);
    }
  });
  d.lines([...rows, ...cols], { stroke: "#8fa1b8", sw: 0.9, opacity: 0.75 }, 3);
  for (const [x, colour] of lights) d.light(deck(x, -53, 0.2), colour, 1, 5);
}

export const pi400 = (d: Drawing) =>
  keyboard(d, [
    [116, GREEN],
    [122, RED],
    [128, GREEN],
  ]);
export const pi500 = (d: Drawing) => keyboard(d, [[130, GREEN]]);
