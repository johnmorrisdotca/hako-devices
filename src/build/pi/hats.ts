// What goes on a 40-pin header, each from published sizes and photographs. A hat is drawn in its own place: x and z as on a full-size board, whose header is at bx 32.5, bz 52.5,
// and y up from the hat's own underside. The builder moves it onto the board's header, whatever the board. No marks and no printing: a `print` face takes the caller's words.
import * as THREE from "three";
import { box, type Box, cyl, disc, rbox, ring, roundedSquare, slab, tube } from "../kit.ts";
import { litScreen } from "../screens.ts";
import { at, span, T } from "./pieces.ts";

const D = 56;
const W = 85;
const p = at(D);

export interface HatContext {
  /** How far the hat's underside is above the top of the board under it. */
  drop: number;
}

/** Gold holes in a board's corners, at height y. */
function cornerHoles(m: Box, corners: number[][], y: number, r0 = 1.3, r1 = 2.9) {
  for (const [hx, hz] of corners) {
    m.add("gold", ring(r0, r1, 20), p(hx, y + 0.02, hz), [-90, 0, 0]);
    m.add("hole", disc(r0, 16), p(hx, y + 0.03, hz), [-90, 0, 0]);
  }
}

/** A 128 by 64 OLED bonnet with its joystick and two buttons, a little black board the size of the small computer. */
export function oledBonnet(m: Box) {
  m.add("pcb-black", slab(roundedSquare(65, 30, 3, 6), 1.6, 0.15, { curve: 6, bevelSeg: 1 }), p(32.5, 0, D - 15));
  const top = 1.6;
  cornerHoles(
    m,
    [
      [3.5, D - 3.5],
      [61.5, D - 3.5],
      [3.5, D - 26.5],
      [61.5, D - 26.5],
    ],
    top,
    1.28,
    2.7,
  );
  // the display: glass on a white carrier, 29.4 by 14.7 mm of pixels
  const [ox, , oz] = p(31, 0, D - 15.5);
  m.add("plastic-white", box(35, 1, 20.5), [ox, top + 0.5, oz]);
  m.add("black-glass", rbox(34.5, 1.4, 19, 0.2, 1), [ox, top + 1.7, oz - 0.6]);
  litScreen(m, [0, 0, 0], [-90, 0, 0], 29.42, 14.7, { kind: "oled", pixels: [128, 64], point: [ox, top + 2.42, oz - 0.6] });
  // the joystick on the left
  const [jx, , jz] = p(8.5, 0, D - 14);
  m.add("plastic-black", rbox(8.4, 3, 8.4, 0.6, 2), [jx, top + 1.5, jz]);
  m.add("steel", cyl(1.2, 2.4, 12), [jx, top + 3.8, jz]);
  m.add("rubber", cyl(3, 1.6, 24, 2.6), [jx, top + 5.6, jz]);
  m.add("plastic-grey", cyl(2.2, 0.2, 20), [jx, top + 6.45, jz]);
  // the two buttons on the right, set like a game pad's
  for (const [bx, bz] of [
    [55.5, D - 18],
    [60.5, D - 11.5],
  ]) {
    const [x, , z] = p(bx, 0, bz);
    m.add("steel", rbox(6, 1.6, 6, 0.3, 1), [x, top + 0.8, z]);
    m.add("plastic-black", cyl(1.8, 1.8, 20), [x, top + 2.2, z]);
    m.add("silk", ring(3.6, 3.85, 24), [x, top + 0.02, z], [-90, 0, 0]);
  }
}

/** A 2.8-inch capacitive touch hat: a blue board, the display in its thin frame taking most of it, four buttons down one edge, the header's pins along another, a blank margin. */
export function pitft28(m: Box) {
  m.add("pcb-blue", slab(roundedSquare(W, D, 3, 6), 1.6, 0.15, { curve: 6, bevelSeg: 1 }), p(W / 2, 0, D / 2));
  const face = 1.6;
  cornerHoles(
    m,
    [
      [3.5, 3.5],
      [W - 3.5, 3.5],
      [3.5, D - 3.5],
      [W - 3.5, D - 3.5],
    ],
    face,
    1.28,
  );
  // the header's pins along the bottom edge of the picture
  m.add("plastic-black", rbox(51, 2.2, 5.2, 0.3, 1), p(32.5, face + 1.1, D - 3.5));
  for (let i = 0; i < 20; i++) for (const row of [-1.27, 1.27]) m.add("gold", box(0.64, 2.2, 0.64), p(32.5 + (i - 9.5) * 2.54, face + 2.6, D - 3.5 + row));
  // the display in its thin frame, the screen a little below the frame's edge
  const fx0 = 9.6;
  const fx1 = 76.2;
  const fz0 = 1.4;
  const fz1 = 48.6;
  const ft = face + 3.4;
  span(m, "plastic-white", D, [fx0 + 0.6, fx1 - 0.6], [face, ft - 0.6], [fz0 + 0.6, fz1 - 0.6]);
  const rim = 2.1;
  span(m, "frame-beige", D, [fx0, fx1], [face + 0.4, ft], [fz0, fz0 + rim]);
  span(m, "frame-beige", D, [fx0, fx1], [face + 0.4, ft], [fz1 - rim, fz1]);
  span(m, "frame-beige", D, [fx0, fx0 + rim], [face + 0.4, ft], [fz0, fz1]);
  span(m, "frame-beige", D, [fx1 - rim, fx1], [face + 0.4, ft], [fz0, fz1]);
  span(m, "black-glass", D, [fx0 + rim, fx1 - rim], [ft - 0.8, ft - 0.4], [fz0 + rim, fz1 - rim]);
  // 320 by 240 pixels, 57.6 by 43.2 mm; the picture's top towards the video side, read from the header's side
  const [sx, , sz] = p((fx0 + fx1) / 2, 0, (fz0 + fz1) / 2 - 0.4);
  litScreen(m, [0, 0, 0], [-90, 0, 180], 57.6, 43.2, { kind: "panel", pixels: [320, 240], point: [sx, ft - 0.38, sz] });
  // four buttons down the edge at the card end
  for (let i = 0; i < 4; i++) {
    const bz = 9 + i * 10.6;
    m.add("plastic-black", box(3.6, 1.8, 6.2), p(5, face + 0.9, bz));
    m.add("plastic-grey", box(1.4, 0.9, 3.4), p(5, face + 2.2, bz));
  }
  // the blank margin at the network end
  m.printFace("board", p(81, face + 0.03, 28), [-90, 0, 90], 44, 5);
}

/** A 3.5-inch touch hat, 480 by 320: a blue board nearly filled by the display in its white frame, the ears with gold holes at the corners. */
export function pitft35(m: Box) {
  m.add("pcb-blue", slab(roundedSquare(W, D, 3, 6), 1.6, 0.15, { curve: 6, bevelSeg: 1 }), p(W / 2, 0, D / 2));
  const face = 1.6;
  cornerHoles(
    m,
    [
      [3, 3],
      [W - 3, 3],
      [3, D - 3],
      [W - 3, D - 3],
    ],
    face,
  );
  // the display's metal back, the white frame on it, the black glass and the picture
  const ft = face + 3.8;
  span(m, "steel", D, [6.5, 79], [face, ft - 1], [0.5, 55.5]);
  span(m, "plastic-white", D, [5.5, 79.5], [ft - 1, ft], [0.2, 2.2]);
  span(m, "plastic-white", D, [5.5, 79.5], [ft - 1, ft], [53.8, 55.8]);
  span(m, "plastic-white", D, [5.5, 7.5], [ft - 1, ft], [0.2, 55.8]);
  span(m, "plastic-white", D, [77.5, 79.5], [ft - 1, ft], [0.2, 55.8]);
  span(m, "black-glass", D, [7.5, 77.5], [ft - 0.8, ft - 0.4], [2.2, 53.8]);
  const [sx, , sz] = p(42.5, 0, 28);
  // turned round with the device, so the picture's top is towards the sockets, away from the viewer
  litScreen(m, [0, 0, 0], [-90, 0, 180], 68.4, 47.5, { point: [sx, ft - 0.38, sz], pixels: [480, 320] });
  // the flexible strip of the display at its left edge
  span(m, "fpc-orange", D, [4.2, 6.4], [face + 0.1, ft - 0.4], [16, 28]);
}

/** A 2.13-inch e-paper hat: a 65 by 30 mm blue board, the white panel on it with its 250 by 122 picture and the orange strip round one end. */
export function epaper213(m: Box) {
  const cz = D - 15.1;
  m.add("pcb-blue", slab(roundedSquare(65, 30.2, 2.5, 6), 1.6, 0.15, { curve: 6, bevelSeg: 1 }), p(32.5, 0, cz));
  const face = 1.6;
  span(m, "epaper-white", D, [3.4, 62.6], [face, face + 1.1], [cz - 14.6, cz + 14.6]);
  const [sx, , sz] = p(29.8, 0, cz);
  // 48.55 by 23.71 mm, the top of the words towards the back
  litScreen(m, [0, 0, 0], [-90, 0, 180], 48.55, 23.71, { point: [sx, face + 1.13, sz], kind: "paper", pixels: [500, 244] });
  span(m, "plastic-grey", D, [55.5, 56.3], [face + 1.1, face + 1.14], [cz - 7, cz + 7]);
  span(m, "chip", D, [57.8, 60.8], [face + 1.1, face + 1.2], [cz + 8, cz + 11]);
  span(m, "fpc-orange", D, [62.6, 65.4], [face + 0.3, face + 0.9], [cz - 9, cz + 9]);
  span(m, "fpc-orange", D, [65, 65.4], [-1.2, face + 0.9], [cz - 9, cz + 9]);
  cornerHoles(
    m,
    [
      [1.8, cz - 12.4],
      [63.2, cz + 12.4],
    ],
    face,
    0.8,
    1.3,
  );
}

/** A network power hat: a green board 65 by 56.5 mm over the header end, its little black fan, the gold transformer and the grey coil, silver screws on posts at the corners. */
export function poePlus(m: Box, { drop }: HatContext) {
  // the four pins of the network power and the hat's socket on them
  m.add("plastic-black", box(5.2, drop, 5.2), p(65.2, -drop / 2, 48.3));
  m.add("pcb-green", slab(roundedSquare(65, 56.5, 3, 6), 1.5, 0.15, { curve: 6, bevelSeg: 1 }), p(32.5, 0, D / 2));
  const top = 1.5;
  for (const [hx, hz] of [
    [3.5, 3.5],
    [61.5, 3.5],
    [3.5, D - 3.5],
    [61.5, D - 3.5],
  ]) {
    m.add("steel", cyl(2.8, drop, 14), p(hx, -drop / 2, hz));
    m.add("steel", cyl(2.7, 1.1, 18), p(hx, top + 0.55, hz));
    m.add("hole", box(3.2, 0.04, 0.5), p(hx, top + 1.12, hz), [0, 35, 0]);
  }
  // the transformer: dark body, gold window, at the back on the left
  m.add("plastic-black", rbox(26, 7.6, 15, 0.6, 2), p(15, top + 3.8, 40));
  m.add("gold", box(22, 0.3, 11), p(15, top + 7.7, 40));
  // the grey coil behind the fan
  m.add("plastic-grey", rbox(11.5, 5, 11.5, 0.4, 2), p(44, top + 2.5, 45));
  // the fan: 25 mm, in its square black frame
  const fx = 37;
  const fz = 24.5;
  const fh = 7;
  const s = 25;
  m.add("plastic-black", box(s, 1.1, s), p(fx, top + 0.55 + 0.6, fz));
  m.add("plastic-black", box(s, 1.1, s), p(fx, top + fh, fz));
  for (const [dx, dz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    m.add("plastic-black", cyl(2.3, fh, 12), p(fx + (dx * s) / 2.3, top + 0.6 + fh / 2, fz + (dz * s) / 2.3));
    m.add("steel", cyl(1.1, 0.3, 10), p(fx + (dx * s) / 2.3, top + fh + 0.7, fz + (dz * s) / 2.3));
  }
  m.add("hole", disc(11.4, 40), p(fx, top + 1.8, fz), [-90, 0, 0]);
  const node = m.node("spin-y", p(fx, top + 4.4, fz));
  m.add("plastic-black", cyl(4.4, 2.8, 24), [0, 0, 0], [0, 0, 0], { node });
  for (let i = 0; i < 7; i++) {
    const a = (i * 360) / 7;
    const rad = (a * Math.PI) / 180;
    m.add("plastic-black", box(7.4, 0.5, 3.8), [Math.cos(rad) * 7.6, 0, -Math.sin(rad) * 7.6], [24, a, 0], { node });
  }
  // the fan's wires to its white socket
  m.add("plastic-white", box(5, 3, 8), p(56, top + 1.5, 39));
  const wire = (material: "wire-red" | "wire-black" | "wire-blue", off: number) => m.add(material, tube([p(48, top + 3, 33 + off), p(52, top + 5.4, 36 + off), p(55.6, top + 3.2, 37 + off)], 0.38, 10, 4));
  wire("wire-red", 0);
  wire("wire-black", 1.2);
  wire("wire-blue", 2.4);
  m.add("chip", rbox(6, 1, 6, 0.2, 1), p(45, top + 0.5, 8));
  m.add("chip", rbox(5, 1, 4, 0.2, 1), p(56, top + 0.5, 24));
  m.add("chip", rbox(5, 1, 3, 0.2, 1), p(19, top + 0.5, 6));
  m.printFace("board", p(20, top + 0.03, 20), [-90, 0, 0], 22, 5);
}

/** The point on a prototyping hat where a display module's header stands, in the hat's own place. */
export const DISPLAY_HEADER = { bx: 32.5, bz: 22, top: 1.6 + 2.5 };

/** A plain prototyping hat: a green board with a grid of plated holes and a four-pin display header. */
export function protoHat(m: Box) {
  m.add("pcb-green", slab(roundedSquare(65, 56, 3, 6), 1.6, 0.15, { curve: 6, bevelSeg: 1 }), p(32.5, 0, 28));
  const top = 1.6;
  cornerHoles(
    m,
    [
      [3.5, 3.5],
      [61.5, 3.5],
      [3.5, 52.5],
      [61.5, 52.5],
    ],
    top,
  );
  for (let i = 0; i < 18; i++) for (let j = 0; j < 12; j++) m.add("gold", ring(0.45, 0.8, 8), p(10.9 + i * 2.54, top + 0.02, 8 + j * 2.54 + (j > 6 ? 2 : 0)), [-90, 0, 0]);
  // the display header
  m.add("plastic-black", rbox(10.5, 2.5, 2.6, 0.2, 1), p(DISPLAY_HEADER.bx, top + 1.25, DISPLAY_HEADER.bz));
  m.add("plastic-black", rbox(51, 1.6, 5.2, 0.2, 1), p(32.5, -0.8, 52.5));
  m.printFace("board", p(32.5, top + 0.03, 50), [-90, 0, 0], 40, 5);
}

/** A little OLED module on its own: drawn from its pins upward, with `bz` and `bx` the place of its pins. */
export function oledModule(m: Box) {
  m.add("pcb-black", slab(roundedSquare(36, 34, 2, 4), 1.4, 0.1, { curve: 4, bevelSeg: 1 }), [0, 5, -12]);
  for (let i = 0; i < 4; i++) m.add("gold", box(0.64, 5.4, 0.64), [(i - 1.5) * 2.54, 2.7, 0]);
  const top = 6.4;
  m.add("plastic-white", box(34, 1, 23), [0, top + 0.5, -12]);
  m.add("black-glass", rbox(33.4, 1.2, 20, 0.2, 1), [0, top + 1.6, -13]);
  litScreen(m, [0, 0, 0], [-90, 0, 0], 29.42, 14.7, { kind: "oled", pixels: [128, 64], point: [0, top + 2.22, -13] });
}

/** A 7-inch touch display: 194 by 110 by 20 mm, 155 by 86 mm of picture, black glass on a metal frame with the driver board on its back, leaning on a plain folding leg. The board
 * in its back is drawn through `carry`. */
export function touch7(m: Box, carry: (frame: THREE.Matrix4) => void) {
  const DW = 194;
  const DH = 110;
  const LEAN = 14;
  const foot = 8;
  // local: x across, y up the screen, z out of the screen; the glass's face at z = 0
  const frame = new THREE.Matrix4().makeTranslation(0, foot, 8).multiply(new THREE.Matrix4().makeRotationX((-LEAN * Math.PI) / 180));
  m.panelFrame = frame;
  const add = (material: Parameters<Box["add"]>[0], geometry: THREE.BufferGeometry, place: [number, number, number], turn: [number, number, number] = [0, 0, 0]) => m.add(material, geometry, place, turn, { frame });
  const upright: [number, number, number] = [90, 0, 0];
  // the glass, then the metal tray behind it
  add("bezel", slab(roundedSquare(DW, DH, 3, 4), 1.8, 0.3, { curve: 4, bevelSeg: 1 }), [0, DH / 2, -1.8], upright);
  add("alu", slab(roundedSquare(DW - 8, DH - 8, 2, 4), 3.6, 0.4, { curve: 4, bevelSeg: 1 }), [0, DH / 2, -5.4], upright);
  litScreen(m, [0, DH / 2 + 2, 0.03], [0, 0, 0], 154.1, 85.9, { frame, pixels: [800, 446] });
  // the camera's dot at the top of the glass
  add("hole", disc(1.2, 16), [0, DH - 5.5, 0.03]);
  // the driver board on the back, four standoffs and the board on them, its sockets outward
  const back = -5.4;
  add("pcb-green", box(82, 1.2, 62).rotateX(Math.PI / 2), [0, DH / 2 + 2, back - 2.4]);
  for (const [dx, dy] of [
    [-29, -24.5],
    [29, -24.5],
    [-29, 24.5],
    [29, 24.5],
  ])
    add("steel", cyl(2.5, 16, 12), [dx, DH / 2 + 2 + dy, back - 8], upright);
  const held = new THREE.Matrix4()
    .multiply(frame)
    .multiply(new THREE.Matrix4().makeTranslation(42.5, DH / 2 + 2, back - 16.4))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
    .multiply(new THREE.Matrix4().makeRotationZ(Math.PI));
  carry(held);
  // the ribbon between the driver board and the board on it
  add("fpc-orange", box(16, 0.3, 18), [-16, 26, back - 9]);
  // the leg, folded out behind it, and the foot along the desk
  m.add("alu-dark", rbox(120, 3.4, 58, 1.2, 2), [0, 1.7, -22]);
  m.add("plastic-black", rbox(DW - 8, foot + 1, 14, 2, 2), [0, foot / 2 + 0.5, 7]);
  m.add("rubber", box(DW - 20, 1, 12), [0, 0.5, 7]);
  m.add("alu-dark", rbox(100, 3.4, 70, 1.2, 2), [0, 37, -35], [-52, 0, 0]);
}

export { T };
