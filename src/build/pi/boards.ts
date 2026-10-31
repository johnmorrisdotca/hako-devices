// The boards themselves, from their published drawings (85 by 56 mm, 65 by 56 mm for the A+, 65 by 30 mm for the small one, 160 by 90 mm for the module's IO board) and
// photographs for where the parts sit. No logo, no text. `detail` leaves out what a hat or a case hides, so a covered board costs little.
import { box, type Box, cyl, disc, rbox, ring, roundedSquare, slab } from "../kit.ts";
import { at, audioJack, board, boardLeds, chip, ethernet, frontSocket, header, headerPads, lidChip, ribbon, sdCard, silk, sprinkle, T, usbStack } from "./pieces.ts";

export interface BoardContext {
  /** "full": everything. "under": the sockets and the larger chips, for a hat over it. "edges": only what reaches the edges, for a case round it. */
  detail: "full" | "under" | "edges";
  /** A cooler sits on its system chip. */
  cooled: boolean;
  /** A header soldered on a board that comes with bare holes. */
  soldered: boolean;
}

const POE_PINS = [
  [0, 0],
  [2.54, 0],
  [0, 2.54],
  [2.54, 2.54],
];

function poePins(m: Box, D: number) {
  const p = at(D);
  for (const [dx, dz] of POE_PINS) m.add("gold", box(0.64, 6, 0.64), p(64 + dx, T + 3, 47 + dz));
  m.add("plastic-black", box(5.08, 2.5, 5.08), p(65.27, T + 1.25, 48.27));
}

/** The USB-C full-size board. */
export function pi4(m: Box, { detail }: BoardContext) {
  const D = 56;
  const W = 85;
  const p = at(D);
  board(m, W, D, "pcb-green");
  header(m, D);
  ethernet(m, W, D, 45.75);
  usbStack(m, W, D, 27, "usb-blue");
  usbStack(m, W, D, 9, "plastic-black");
  frontSocket(m, D, 3.5 + 7.7, { w: 9, h: 3.3, depth: 7.5, mouth: [8, 2.4], r: 1.2, tongue: "plastic-black" });
  frontSocket(m, D, 26, { w: 7.5, h: 3.2, depth: 7, mouth: [6.2, 2.2] });
  frontSocket(m, D, 39.5, { w: 7.5, h: 3.2, depth: 7, mouth: [6.2, 2.2] });
  audioJack(m, D, 53.5);
  sdCard(m, D, 28);
  if (detail === "edges") return;
  lidChip(m, D, 29, 32, 14);
  chip(m, D, 46, 32, 14, 10, 1.1);
  chip(m, D, 63, 26, 9, 9, 1);
  ribbon(m, D, 45, 11.5, 22);
  ribbon(m, D, 3.5, 28, 20);
  if (detail === "under") return;
  chip(m, D, 60, 42, 6, 6, 0.9);
  // the radio's metal can and its antenna
  m.add("steel", rbox(12, 1.6, 10, 0.3, 1), p(10, T + 0.8, 43));
  m.add("gold", box(5, 0.1, 2), p(5, T + 0.05, 36));
  poePins(m, D);
  boardLeds(m, D, 1.8, 8);
  silk(m, D, 32.5, D - 0.8, 52, 0.25);
  silk(m, D, 32.5, D - 6.2, 52, 0.25);
  silk(m, D, 29, 23.5, 16, 0.25);
  sprinkle(m, W, D, 90, 4, [
    [6, 49, 59, 56],
    [56, 0, 88, 56],
    [20, 23, 54, 40],
    [0, 0, 60, 12],
    [3, 37, 17, 49],
    [0, 17, 7, 39],
    [41, 0, 50, 23],
    [62, 44, 68, 51],
  ]);
}

/** Micro USB power and the full HDMI socket and sound jack of the classic shape. */
function classicFront(m: Box, D: number) {
  frontSocket(m, D, 10.6, { w: 8, h: 3, depth: 6, mouth: [6.8, 1.9], r: 0.6, tongue: "plastic-black" });
  frontSocket(m, D, 32, { w: 15, h: 6, depth: 11.5, mouth: [13.6, 4.4], r: 0.5, tongue: "plastic-black" });
  audioJack(m, D, 53.5);
}

/** The camera and display ribbons. */
function classicRibbons(m: Box, D: number) {
  ribbon(m, D, 45, 11.5, 22);
  ribbon(m, D, 3.5, 28, 20);
}

/** The shield of the radio, a plain metal square. */
function radioCan(m: Box, D: number, bx: number, bz: number) {
  m.add("steel", rbox(13, 1.7, 10, 0.3, 1), at(D)(bx, T + 0.85, bz));
}

/** One USB socket on the right-hand edge. */
function usbOne(m: Box, w: number, d: number, bz: number, tongue: "plastic-black") {
  const p = at(d);
  const depth = 15;
  m.add("steel", rbox(depth, 7.4, 14.6, 0.5, 2), p(w - depth / 2 + 2.5, T + 3.7, bz));
  m.add("hole", box(0.6, 5.4, 12.6), p(w + 2.55, T + 3.7, bz));
  m.add(tongue, box(0.6, 1.8, 11), p(w + 2.2, T + 2.9, bz));
}

function boardText(m: Box, D: number) {
  silk(m, D, 32.5, D - 0.8, 52, 0.25);
  silk(m, D, 32.5, D - 6.2, 52, 0.25);
  silk(m, D, 29, 23.5, 16, 0.25);
}

/** The 3 Model B, the plain one of the classic shape. */
export function pi3b(m: Box, { detail }: BoardContext) {
  const D = 56;
  const W = 85;
  const p = at(D);
  board(m, W, D, "pcb-green");
  header(m, D);
  ethernet(m, W, D, 10.25);
  usbStack(m, W, D, 29, "plastic-black");
  usbStack(m, W, D, 47, "plastic-black");
  frontSocket(m, D, 10.6, { w: 8, h: 3, depth: 6, mouth: [6.8, 1.9], r: 0.6, tongue: "plastic-black" });
  frontSocket(m, D, 32, { w: 15, h: 6, depth: 11.5, mouth: [13.6, 4.4], r: 0.5, tongue: "plastic-black" });
  audioJack(m, D, 53.5);
  sdCard(m, D, 28);
  if (detail === "edges") return;
  chip(m, D, 29, 32, 14, 14, 1.2);
  chip(m, D, 59, 20, 9, 9, 1);
  ribbon(m, D, 45, 11.5, 22);
  ribbon(m, D, 3.5, 28, 20);
  if (detail === "under") return;
  m.add("plastic-white", box(2.2, 1.2, 6), p(2.5, T + 0.6, 45));
  boardLeds(m, D, 1.8, 6);
  boardText(m, D);
  sprinkle(m, W, D, 80, 3, [
    [6, 49, 59, 56],
    [60, 0, 88, 56],
    [21, 24, 37, 40],
    [0, 0, 60, 12],
    [0, 17, 7, 39],
    [41, 0, 50, 23],
    [53, 14, 64, 26],
    [0, 40, 5, 50],
  ]);
}

/** The 1 B+ and the 2 share a board: no radio, the network chip by the USB sockets. */
function classicBoard(m: Box, soc: () => void, seed: number, detail: BoardContext["detail"]) {
  const D = 56;
  const W = 85;
  board(m, W, D, "pcb-green");
  header(m, D);
  ethernet(m, W, D, 10.25);
  usbStack(m, W, D, 29, "plastic-black");
  usbStack(m, W, D, 47, "plastic-black");
  classicFront(m, D);
  sdCard(m, D, 28);
  if (detail === "edges") return;
  classicRibbons(m, D);
  soc();
  chip(m, D, 59, 20, 9, 9, 1);
  if (detail === "under") return;
  boardLeds(m, D, 1.8, 6);
  boardText(m, D);
  sprinkle(m, W, D, 70, seed, [
    [6, 49, 59, 56],
    [60, 0, 88, 56],
    [21, 24, 37, 40],
    [0, 0, 60, 12],
    [0, 17, 7, 39],
    [41, 0, 50, 23],
    [53, 14, 64, 26],
    [7, 24, 21, 42],
  ]);
}

/** The 1 B+: its memory sits on the system chip, so a thick black square. */
export function pi1bPlus(m: Box, { detail }: BoardContext) {
  classicBoard(m, () => chip(m, 56, 29, 32, 12, 12, 1.9), 11, detail);
}

/** The 2 B: a flatter system chip, its memory under the board. */
export function pi2b(m: Box, { detail }: BoardContext) {
  classicBoard(m, () => chip(m, 56, 29, 32, 14, 14, 1.05), 12, detail);
  m.add("chip", rbox(12, 1, 12, 0.25, 1), at(56)(29, -0.5, 32));
}

/** The 3 B+: the system chip under a metal lid, the radio's plain shield, the four network power pins. */
export function pi3bPlus(m: Box, { detail }: BoardContext) {
  const D = 56;
  const W = 85;
  board(m, W, D, "pcb-green");
  header(m, D);
  ethernet(m, W, D, 10.25);
  usbStack(m, W, D, 29, "plastic-black");
  usbStack(m, W, D, 47, "plastic-black");
  classicFront(m, D);
  sdCard(m, D, 28);
  poePins(m, D);
  if (detail === "edges") return;
  classicRibbons(m, D);
  lidChip(m, D, 29, 32, 14);
  chip(m, D, 59, 20, 9, 9, 1);
  if (detail === "under") return;
  radioCan(m, D, 11, 43);
  boardLeds(m, D, 1.8, 6);
  boardText(m, D);
  sprinkle(m, W, D, 80, 13, [
    [6, 49, 59, 56],
    [60, 0, 88, 56],
    [20, 23, 38, 41],
    [0, 0, 60, 12],
    [0, 17, 7, 39],
    [41, 0, 50, 23],
    [53, 14, 64, 26],
    [3, 37, 19, 49],
    [41, 28, 53, 39],
    [62, 44, 69, 51],
  ]);
}

/** The 3 A+: the short board, one USB socket, no network socket, the same lid and shield as the 3 B+. */
export function pi3aPlus(m: Box, { detail }: BoardContext) {
  const D = 56;
  const W = 65;
  board(m, W, D, "pcb-green");
  header(m, D);
  usbOne(m, W, D, 31.5, "plastic-black");
  classicFront(m, D);
  sdCard(m, D, 28);
  if (detail === "edges") return;
  classicRibbons(m, D);
  lidChip(m, D, 29, 32, 14);
  if (detail === "under") return;
  radioCan(m, D, 11, 43);
  boardLeds(m, D, 1.8, 6);
  boardText(m, D);
  sprinkle(m, W, D, 48, 14, [
    [6, 49, 59, 56],
    [46, 22, 70, 40],
    [20, 23, 38, 41],
    [0, 0, 60, 12],
    [0, 17, 7, 39],
    [41, 0, 50, 23],
    [3, 37, 19, 49],
    [45, 36, 54, 46],
  ]);
}

/** The 5: two micro HDMI, USB-C, the network socket swapped to the near corner. Its cooler is a part of its own. */
export function pi5(m: Box, { detail, cooled }: BoardContext) {
  const D = 56;
  const W = 85;
  const p = at(D);
  board(m, W, D, "pcb-green");
  header(m, D);
  ethernet(m, W, D, 10.2, { leds: true });
  usbStack(m, W, D, 29.1, "usb-blue");
  usbStack(m, W, D, 47, "plastic-black");
  frontSocket(m, D, 11.2, { w: 9, h: 3.3, depth: 7.5, mouth: [8, 2.4], r: 1.2, tongue: "plastic-black" });
  frontSocket(m, D, 25.8, { w: 7.5, h: 3.2, depth: 7, mouth: [6.2, 2.2] });
  frontSocket(m, D, 39.2, { w: 7.5, h: 3.2, depth: 7, mouth: [6.2, 2.2] });
  sdCard(m, D, 28);
  if (detail === "edges") return;
  // two small ribbon sockets for cameras and screens, the PCIe ribbon on the left, the fan socket, the power button
  ribbon(m, D, 47.5, 10, 14, { body: "plastic-black", latch: "plastic-grey" });
  ribbon(m, D, 53, 10, 14, { body: "plastic-black", latch: "plastic-grey" });
  ribbon(m, D, 2.6, 28, 16, { body: "plastic-black", latch: "plastic-grey" });
  m.add("plastic-white", box(5.5, 3.2, 3), p(70, T + 1.6, 45.5));
  m.add("steel", box(3.6, 1.6, 3), p(1.2, T + 0.8, 14));
  m.add("plastic-black", cyl(0.9, 0.6, 12), p(0.4, T + 0.8, 14), [0, 0, 90]);
  chip(m, D, 62, 29, 11, 11, 1);
  if (!cooled) lidChip(m, D, 29, 30, 14);
  if (detail === "under") return;
  boardLeds(m, D, 1.8, 6.5);
  silk(m, D, 32.5, D - 0.8, 52, 0.25);
  silk(m, D, 32.5, D - 6.2, 52, 0.25);
  sprinkle(m, W, D, 70, 5, [
    [6, 49, 59, 56],
    [60, 0, 88, 56],
    [6, 13, 58, 47],
    [0, 0, 58, 12],
    [0, 18, 6, 38],
    [66, 42, 74, 49],
  ]);
}

/** The fan and fins cooler: an aluminium plate, fins on the left, the fan in a black shroud on the right. Its fan is a node that spins. */
export function activeCooler(m: Box) {
  const D = 56;
  const p = at(D);
  const cx = 32;
  const cz = 30;
  const top = T + 2.8;
  m.add("alu", rbox(54, 1.6, 34, 0.5, 2), p(cx, top + 0.8, cz));
  for (let i = 0; i < 12; i++) m.add("alu", box(0.9, 6.5, 32), p(cx - 25.5 + i * 2.2, top + 1.6 + 3.25, cz));
  m.add("plastic-black", rbox(28, 7.2, 34, 1.4, 2), p(cx + 13, top + 1.6 + 3.6, cz));
  m.add("hole", disc(12.5, 40), p(cx + 13, top + 1.6 + 7.25, cz), [-90, 0, 0]);
  // spring pins through the board
  for (const [dx, dz] of [
    [-24, -14],
    [24, 14],
  ]) {
    m.add("plastic-white", cyl(1.6, 4, 12), p(cx + dx, top + 1.2, cz + dz));
    m.add("plastic-white", cyl(2.2, 0.8, 12), p(cx + dx, top + 3.2, cz + dz));
  }
  const node = m.node("spin-y", p(cx + 13, top + 1.6 + 6.6, cz));
  m.add("plastic-black", cyl(4.2, 1.4, 24), [0, 0, 0], [0, 0, 0], { node });
  m.add("plastic-grey", cyl(2.4, 0.2, 20), [0, 0.75, 0], [0, 0, 0], { node });
  for (let i = 0; i < 9; i++) {
    const a = (i * 360) / 9;
    const r = 8;
    m.add("plastic-black", box(8.6, 0.5, 3.6), [Math.cos((a * Math.PI) / 180) * r, 0, -Math.sin((a * Math.PI) / 180) * r], [24, a, 0], { node });
  }
}

/** The small board: mini HDMI, two micro USB, header holes bare unless a header was soldered. */
function zeroBoard(m: Box, soldered: boolean) {
  const D = 30;
  const W = 65;
  board(m, W, D, "pcb-green");
  if (soldered) header(m, D);
  else headerPads(m, D, D - 3.5);
  frontSocket(m, D, 12.4, { w: 11.2, h: 3.2, depth: 7.6, mouth: [10, 2.2], r: 0.4, tongue: "plastic-black" });
  frontSocket(m, D, 41.4, { w: 8, h: 3, depth: 5.6, mouth: [6.8, 1.9], r: 0.6, tongue: "plastic-black" });
  frontSocket(m, D, 54, { w: 8, h: 3, depth: 5.6, mouth: [6.8, 1.9], r: 0.6, tongue: "plastic-black" });
  return { D, W, p: at(D) };
}

/** The Zero 2 W: the system-in-package under its metal can. */
export function piZero2w(m: Box, { soldered, detail }: BoardContext) {
  const { D, W, p } = zeroBoard(m, soldered);
  chip(m, D, 30, 15, 12, 12, 1.2);
  m.add("steel", rbox(8, 1.2, 7, 0.3, 1), p(44, T + 0.6, 15));
  ribbon(m, D, 63, 15, 17, { body: "plastic-black", latch: "plastic-grey" });
  m.add("steel", box(12, 1.4, 11), p(7, T + 0.7, 15));
  m.add("plastic-black", rbox(11, 0.8, 11, 0.3, 1), p(4, T + 1.8, 15));
  if (detail !== "full") return;
  m.add("led-power", box(1.6, 0.7, 0.9), p(57.5, T + 0.35, 6.5));
  silk(m, D, 32.5, D - 1, 52, 0.22);
  silk(m, D, 32.5, D - 6, 52, 0.22);
  sprinkle(m, W, D, 34, 7, [
    [5, 23, 60, 30],
    [0, 0, 60, 8],
    [22, 7, 50, 23],
    [57, 4, 65, 26],
    [0, 8, 13, 22],
  ]);
}

/** The plain Zero: the same board with no radio and no antenna. */
export function piZero1(m: Box, { soldered, detail }: BoardContext) {
  const { D, p } = zeroBoard(m, soldered);
  chip(m, D, 30, 15, 12, 12, 1.3);
  ribbon(m, D, 63, 15, 17, { body: "plastic-black", latch: "plastic-grey" });
  m.add("steel", box(12, 1.4, 11), p(7, T + 0.7, 15));
  m.add("plastic-black", rbox(11, 0.8, 11, 0.3, 1), p(4, T + 1.8, 15));
  if (detail !== "full") return;
  m.add("led-power", box(1.6, 0.7, 0.9), p(57.5, T + 0.35, 6.5));
  silk(m, D, 32.5, D - 1, 52, 0.22);
  silk(m, D, 32.5, D - 6, 52, 0.22);
}

/** The Zero W: a bare black system chip, no shield, the radio's chip and its etched antenna. */
export function piZeroW(m: Box, { soldered, detail }: BoardContext) {
  const { D, W, p } = zeroBoard(m, soldered);
  chip(m, D, 30, 15, 12, 12, 1.3);
  chip(m, D, 43, 16, 5, 5, 0.8);
  // the antenna: a thin gold triangle etched in the board
  for (const [dx, dz, w, turn] of [
    [0, 3, 8, 0],
    [-2, 0, 8, 60],
    [2, 0, 8, -60],
  ])
    m.add("gold", box(w, 0.04, 0.45), p(50 + dx, T + 0.02, 14 + dz), [0, turn, 0]);
  ribbon(m, D, 63, 15, 17, { body: "plastic-black", latch: "plastic-grey" });
  m.add("steel", box(12, 1.4, 11), p(7, T + 0.7, 15));
  m.add("plastic-black", rbox(11, 0.8, 11, 0.3, 1), p(4, T + 1.8, 15));
  if (detail !== "full") return;
  m.add("led-power", box(1.6, 0.7, 0.9), p(57.5, T + 0.35, 6.5));
  silk(m, D, 32.5, D - 1, 52, 0.22);
  silk(m, D, 32.5, D - 6, 52, 0.22);
  sprinkle(m, W, D, 30, 15, [
    [5, 23, 60, 30],
    [0, 0, 60, 8],
    [22, 7, 56, 23],
    [57, 4, 65, 26],
    [0, 8, 13, 22],
  ]);
}

/** A socket standing on the front edge, big enough to see into: the metal shell and its mouth. */
function frontBlock(m: Box, D: number, bx: number, w: number, h: number, depth: number, mouth: [number, number, number], over = 2.5) {
  const p = at(D);
  m.add("steel", rbox(w, h, depth, 0.5, 2), p(bx, T + h / 2, depth / 2 - over));
  m.add("hole", box(mouth[0], mouth[1], 0.6), p(bx, T + mouth[2], -over - 0.05));
}

/** The compute module on its IO board: the wide board with two full HDMI, stacked USB, the network and 12 V sockets along the front, the PCIe slot and coin cell, the
 * 40-pin header at the back, and the small module on top with its metal lid. */
export function cm4Io(m: Box, { detail }: BoardContext) {
  const D = 90;
  const W = 160;
  const p = at(D);
  board(m, W, D, "pcb-green");
  // along the front
  m.add("plastic-black", rbox(9.6, 11, 14, 0.6, 2), p(12, T + 5.5, 6));
  m.add("hole", disc(3.2, 20), p(12, T + 5.5, -1.05));
  m.add("steel", cyl(1, 0.6, 12), p(12, T + 5.5, -1), [90, 0, 0]);
  frontBlock(m, D, 33, 16, 13.5, 21, [12.4, 8.2, 5.8]);
  m.add("led-power", box(2.2, 1.4, 0.4), p(27.5, T + 11.6, -2.6));
  m.add("led-amber", box(2.2, 1.4, 0.4), p(38.5, T + 11.6, -2.6));
  frontBlock(m, D, 55, 13.2, 15.6, 17.5, [12, 5.4, 4.2]);
  m.add("hole", box(12, 5.4, 0.6), p(55, T + 11.4, -2.55));
  m.add("plastic-black", box(11, 1.8, 0.6), p(55, T + 3.4, -2.2));
  m.add("plastic-black", box(11, 1.8, 0.6), p(55, T + 10.6, -2.2));
  frontSocket(m, D, 77, { w: 15, h: 6, depth: 11.5, mouth: [13.6, 4.4], r: 0.5, tongue: "plastic-black" });
  frontSocket(m, D, 95, { w: 15, h: 6, depth: 11.5, mouth: [13.6, 4.4], r: 0.5, tongue: "plastic-black" });
  frontSocket(m, D, 112, { w: 8, h: 3, depth: 6, mouth: [6.8, 1.9], r: 0.6, tongue: "plastic-black" });
  // the 40-pin header at the back, on the left, and the fan's socket, the jumpers
  const shift = (bx: number) => bx + 3;
  m.add("plastic-black", rbox(50.8, 2.5, 5.08, 0.3, 1), p(shift(32.5), T + 1.25, D - 3.5));
  for (let i = 0; i < 20; i++) for (const row of [-1.27, 1.27]) m.add("gold", box(0.64, 6, 0.64), p(shift(32.5) + (i - 9.5) * 2.54, T + 5, D - 3.5 + row));
  m.add("plastic-white", box(9, 5, 4), p(72, T + 2.5, D - 4));
  m.add("plastic-black", rbox(14, 2.5, 5, 0.3, 1), p(88, T + 1.25, D - 4));
  // the PCIe slot, the coin cell in its holder, the ribbon sockets
  m.add("plastic-black", rbox(40, 7, 7.4, 0.5, 1), p(32, T + 3.5, 32));
  m.add("gold", box(36, 0.3, 1.6), p(32, T + 7.02, 32));
  m.add("steel", cyl(10.5, 3, 40), p(14, T + 1.5, 60));
  m.add("plastic-black", ring(7, 10.5, 32), p(14, T + 3.02, 60), [-90, 0, 0]);
  m.add("alu", disc(7, 28), p(14, T + 3.03, 60), [-90, 0, 0]);
  ribbon(m, D, 155, 22, 20);
  ribbon(m, D, 155, 56, 20);
  ribbon(m, D, 55, 53, 20, { body: "plastic-black", latch: "plastic-grey" });
  boardLeds(m, D, 4, 40);
  // the card's slot at the right-hand end
  m.add("steel", box(14, 1.6, 12), p(150, T + 0.8, 40));
  m.add("plastic-black", rbox(5, 0.8, 11, 0.3, 1), p(158, T + 1.8, 40));
  // the module: 55 by 40 mm on its two low connectors
  const mx = 100;
  const mz = 56;
  const y = T + 3.6;
  m.add("plastic-white", box(38, 3.6, 4), p(mx, T + 1.8, mz - 15));
  m.add("plastic-white", box(38, 3.6, 4), p(mx, T + 1.8, mz + 15));
  m.add("pcb-green", slab(roundedSquare(55, 40, 2.5, 5), 1.2, 0.12, { curve: 5, bevelSeg: 1 }), p(mx, y, mz));
  const top = y + 1.2;
  const q = (dx: number, h: number, dz: number) => p(mx + dx, top + h, mz + dz);
  m.add("pcb-green", box(16, 0.7, 16), q(-8, 0.35, 0));
  m.add("steel", rbox(14, 1.3, 14, 0.5, 2), q(-8, 1.3, 0));
  m.add("chip", rbox(11, 1, 9, 0.2, 1), q(10, 0.5, -8));
  m.add("chip", rbox(9, 0.9, 9, 0.2, 1), q(11, 0.45, 7));
  m.add("steel", rbox(10, 1.3, 9, 0.2, 1), q(-22, 0.65, -12));
  m.add("gold", cyl(1.1, 1, 12), q(-24.5, 0.5, 15));
  for (const [dx, dz] of [
    [-24, 16.5],
    [24, 16.5],
    [-24, -16.5],
    [24, -16.5],
  ])
    m.add("gold", ring(0.9, 1.7, 14), q(dx, 0.02, dz), [-90, 0, 0]);
  if (detail !== "full") return;
  silk(m, D, 32.5, D - 0.8, 52, 0.25);
  silk(m, D, 32, 26.6, 42, 0.3);
  sprinkle(m, W, D, 110, 16, [
    [4, 83, 95, 90],
    [0, 0, 122, 16],
    [8, 25, 56, 39],
    [2, 48, 26, 72],
    [70, 34, 130, 78],
    [146, 10, 160, 68],
    [50, 42, 60, 65],
    [0, 36, 8, 44],
  ]);
}
