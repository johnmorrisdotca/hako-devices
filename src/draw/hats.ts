// The drawings of what goes on a header, in the same place as hats.ts: x and z as on a full-size board, y up from the hat's own underside. No printing.
import * as THREE from "three";
import type { Box, Vec3 } from "../build/kit.ts";
import { DISPLAY_HEADER } from "../build/pi/hats.ts";
import { ACCENT, AMBER, BLACK, board, BLUE, GOLD, GREEN, METAL, part, pcb } from "./common.ts";
import { type Drawing, NZ, X, Y } from "./drawing.ts";
import { homePicture } from "./pictures.ts";

const D = 56;
const p = board(D);

/** The OLED bonnet: the little screen, the joystick and the two buttons. */
export function oledBonnet(d: Drawing) {
  part(d, p, [0, 65], [26, 56], 1.6, { top: "#141c2a", front: "#0b111c", side: "#0b111c", sw: 1.6, layer: 2 }, 0);
  const top = 1.6;
  part(d, p, [13.5, 48.5], [31, 50], 2.4, { top: "#05080e", front: "#0b111c", side: "#0b111c", sw: 1.2, layer: 3 }, top);
  const face = top + 2.5;
  for (const [bz, w] of [
    [37.5, 16],
    [41, 22],
    [44, 20],
  ])
    d.line([p(31 - w / 2, face, bz), p(31 + w / 2, face, bz)], ACCENT, 4, Y);
  d.light(p(42, face, 36), "#d6f1ff", 1, 4.5);
  d.circle(p(8.5, top + 0.1, 42), X, NZ, 4.2, { fill: "#111a2a", stroke: "#8fa1b8", sw: 1.2 }, 3);
  d.circle(p(8.5, top + 5, 42), X, NZ, 2.8, { fill: "#1b2433", stroke: "#8fa1b8", sw: 1 }, 3.5);
  for (const [bx, bz] of [
    [55.5, 38],
    [60.5, 44.5],
  ])
    d.circle(p(bx, top + 3, bz), X, NZ, 1.9, { fill: "#111a2a", stroke: "#8fa1b8", sw: 1 }, 3.5);
}

/** The 2.8-inch hat: a blue board, its display in a thin pale frame, a picture on it, four buttons down the edge, the header's pins along the front. */
export function pitft28(d: Drawing) {
  pcb(d, p, 85, D, "url(#hat)", 0, 2);
  const face = 1.6;
  const corner = (bx: number, bz: number, y = face + 3.4): Vec3 => p(bx, y, bz);
  d.flat([corner(9.6, 1.4), corner(76.2, 1.4), corner(76.2, 48.6), corner(9.6, 48.6)], Y, { fill: "#d9d2bf", stroke: "#8fa1b8", sw: 1.2 }, 3);
  d.flat([corner(11.7, 3.5), corner(74.1, 3.5), corner(74.1, 46.5), corner(11.7, 46.5)], Y, { fill: "url(#glass)" }, 3.5);
  const screen = (u0: number, v0: number, u1: number, v1: number, style: { fill: string; stroke?: string; sw?: number; opacity?: number }) =>
    d.flat([corner(71 - u0 * 57.6, 4.6 + v0 * 43.2), corner(71 - u1 * 57.6, 4.6 + v0 * 43.2), corner(71 - u1 * 57.6, 4.6 + v1 * 43.2), corner(71 - u0 * 57.6, 4.6 + v1 * 43.2)], Y, style, 4);
  screen(0, 0, 0.7, 0.11, { fill: "#16233a" });
  for (let i = 0; i < 4; i++) screen(0.75, 0.05 + i * 0.235, 0.98, 0.25 + i * 0.235, { fill: "#16233a", stroke: "#4a5a7a", sw: 0.6 });
  screen(0.04, 0.22, 0.24, 0.5, { fill: "#e8eef7" });
  for (let i = 0; i < 3; i++) screen(0.28, 0.24 + i * 0.09, 0.62, 0.29 + i * 0.09, { fill: i === 0 ? GREEN : "#9aa6b8", opacity: 0.8 });
  d.light(corner(71 - 0.05 * 57.6, 4.6 + 0.055 * 43.2, face + 3.5), GREEN, 1, 5);
  for (let i = 0; i < 4; i++) d.rect(p(5, face + 0.05, 9 + i * 10.6), X, [0, 0, 1], 3.6, 6.2, { fill: "#05080e", stroke: "#8fa1b8", sw: 0.8 }, 3);
  const pin = (bx: number, bz: number) => p(bx, face + 2.3, bz);
  part(d, p, [7.1, 57.9], [D - 6, D - 1], 2.2, { ...BLACK, layer: 3 }, face);
  d.flat([pin(7.6, D - 5.5), pin(57.4, D - 5.5), pin(57.4, D - 1.5), pin(7.6, D - 1.5)], Y, { fill: "url(#pins)" }, 3.5);
}

export const pitft35 = (d: Drawing) => {
  pcb(d, p, 85, D, "url(#hat)", 0, 2);
  const ft = 1.6 + 3.8;
  part(d, p, [6.5, 79], [0.5, 55.5], 3.8, { ...METAL, layer: 2.5 }, 1.6);
  const c = (bx: number, bz: number) => p(bx, ft + 0.02, bz);
  d.flat([c(5.5, 0.2), c(79.5, 0.2), c(79.5, 55.8), c(5.5, 55.8)], Y, { fill: "#d9d2bf", stroke: "#8fa1b8", sw: 1.2 }, 3);
  homePicture(d, (u, v) => c(76.7 - u * 68.4, 4.2 + v * 47.5), Y, 4);
  d.flat([c(4.2, 16), c(6.4, 16), c(6.4, 28), c(4.2, 28)], Y, { fill: "#c98a2b" }, 3);
};

export const epaper213 = (d: Drawing) => {
  const cz = D - 15.1;
  part(d, p, [0, 65], [cz - 15.1, cz + 15.1], 1.6, { top: "url(#hat)", front: "#0b111c", side: "#0b111c", sw: 1.6, layer: 2 }, 0);
  const face = 1.6;
  part(d, p, [3.4, 62.6], [cz - 14.6, cz + 14.6], 1.1, { top: "#dfe2e6", front: "#8fa1b8", side: "#8fa1b8", sw: 1, layer: 3 }, face);
  const c = (bx: number, bz: number) => p(bx, face + 1.15, bz);
  d.flat([c(5.5, cz - 11.9), c(54.1, cz - 11.9), c(54.1, cz + 11.9), c(5.5, cz + 11.9)], Y, { fill: "#eeeee6", stroke: "#8fa1b8", sw: 0.6 }, 4);
  // the words, black on paper; the top of them is towards the sockets
  const line = (x1: number, x0: number, bz: number, sw: number) => d.line([c(x1, bz), c(x0, bz)], { stroke: "#16171a", sw }, 5, Y);
  d.flat([c(52, cz - 10.5), c(7.5, cz - 10.5), c(7.5, cz - 6.5), c(52, cz - 6.5)], Y, { fill: "#16171a" }, 5);
  line(50, 22, cz - 1.6, 3);
  line(50, 28, cz + 4, 1.3);
  line(50, 30, cz + 7.5, 1.3);
  d.flat([c(62.6, cz - 9), c(65.3, cz - 9), c(65.3, cz + 9), c(62.6, cz + 9)], Y, { fill: "#c98a2b" }, 4);
};

export const poePlus = (d: Drawing) => {
  pcb(d, p, 65, 56.5, "url(#pcb)", 0, 2);
  const top = 1.5;
  part(d, p, [2, 28], [32.5, 47.5], 7.6, { ...BLACK, layer: 3 }, top);
  const g = (bx: number, bz: number) => p(bx, top + 7.7, bz);
  d.flat([g(4, 34.5), g(26, 34.5), g(26, 45.5), g(4, 45.5)], Y, { fill: "#a98638" }, 3.5);
  d.rect(p(44, top + 5, 45), X, NZ, 12, 12, { fill: "#3a475c", stroke: "#8fa1b8", sw: 0.8 }, 3);
  part(d, p, [24.5, 49.5], [12, 37], 7.6, { ...BLACK, layer: 4 }, top);
  d.dot(g(37, 24.5), 11, { fill: "#05080e", stroke: "#8fa1b8", sw: 1 }, 4.5);
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    d.line([g(37, 24.5), g(37 + Math.cos(a) * 9, 24.5 + Math.sin(a) * 9)], { stroke: BLUE, sw: 1.2 }, 5, Y);
  }
  for (const [hx, hz] of [
    [3.5, 3.5],
    [61.5, 3.5],
    [3.5, D - 3.5],
    [61.5, D - 3.5],
  ])
    d.dot(p(hx, top + 1, hz), 2.7, { fill: "#8d98a8", stroke: "#8fa1b8", sw: 0.6 }, 3);
};

export const protoHat = (d: Drawing) => {
  pcb(d, p, 65, D, "url(#pcb)", 0, 2);
  const top = 1.6;
  const dots: [Vec3, Vec3][] = [];
  for (let j = 0; j < 12; j++) dots.push([p(10.9, top + 0.03, 8 + j * 2.54 + (j > 6 ? 2 : 0)), p(10.9 + 17 * 2.54, top + 0.03, 8 + j * 2.54 + (j > 6 ? 2 : 0))]);
  d.lines(dots, { stroke: "#d9b45a", sw: 1, dash: "0 2.2", opacity: 0.7 }, 2.5, Y);
  part(d, p, [DISPLAY_HEADER.bx - 5.2, DISPLAY_HEADER.bx + 5.2], [DISPLAY_HEADER.bz - 1.3, DISPLAY_HEADER.bz + 1.3], 2.5, { ...BLACK, layer: 3 }, top);
};

/** The little OLED module, from its pins upward. */
export const oledModule = (d: Drawing) => {
  d.box(-18, 18, 5, 6.4, -29, 5, { top: "#141c2a", front: "#0b111c", side: "#0b111c", sw: 1.6, layer: 4 });
  d.box(-16.7, 16.7, 6.4, 8.2, -23, -3, { top: "#05080e", front: "#0b111c", side: "#0b111c", sw: 1.2, layer: 5 });
  for (const [z, w] of [
    [-17, 16],
    [-13, 22],
    [-9, 20],
  ])
    d.line([[-w / 2, 8.3, z], [w / 2, 8.3, z]], ACCENT, 6, Y);
  d.light([10, 8.3, -19], "#d6f1ff", 1, 6.5);
};

/** The 7-inch display on its leg, a picture on it. */
export const touch7 = (d: Drawing, model: Box) => {
  const frame = model.panelFrame as THREE.Matrix4;
  const DW = 194;
  const DH = 110;
  const pt = (x: number, y: number, z: number): Vec3 => new THREE.Vector3(x, y, z).applyMatrix4(frame).toArray();
  const out: Vec3 = new THREE.Vector3(0, 0, 1).transformDirection(frame).toArray();
  // the leg and the foot, then the panel
  d.box(-60, 60, 0, 3.4, -50, 6, { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: 1.2, layer: 0 });
  d.box(-93, 93, 0, 9, 0, 14, { ...BLACK, layer: 1 });
  d.placed(frame, [-DW / 2, DW / 2], [0, DH], [-5.4, 0], { fills: { front: "#0b111c", top: "#3a475c", side: "#232e40" }, sw: 2, layer: 2 });
  const sx = 77;
  const sy0 = 12;
  const sy1 = 98;
  d.flat([pt(-sx, sy0, 0.1), pt(sx, sy0, 0.1), pt(sx, sy1, 0.1), pt(-sx, sy1, 0.1)], out, { fill: "url(#glass)", stroke: "#8fa1b8", sw: 0.8 }, 3);
  homePicture(d, (u, v) => pt(-sx + u * 2 * sx, sy1 - v * (sy1 - sy0), 0.15), out, 4);
  d.light(pt(0, DH - 5.5, 0.2), "#5f6f88", 0.9, 6);
};

export { AMBER, GOLD };
