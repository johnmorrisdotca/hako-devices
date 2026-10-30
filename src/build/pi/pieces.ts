// The pieces every board is made of, from the boards' published outline sizes (85 by 56 mm, 65 by 30 mm for the small one; holes 3.5 mm in from the corners; the 40-pin
// header at 2.54 mm). No logo, no text. Board coordinates: bx along the long edge from the corner by the power socket, bz in from the edge with the video sockets, up
// from the board's underside. That edge faces the viewer (+Z) and the network and USB sockets are on the right (+X).
import { box, type Box, cyl, disc, type Material, plane, rbox, ring, roundedSquare, seeded, slab, type Vec3 } from "../kit.ts";

export const T = 1.4; // board thickness

/** A point on a board of depth `d` in world millimetres: x from the left edge, z towards the viewer. */
export const at = (d: number) => (bx: number, y: number, bz: number): Vec3 => [bx, y, d / 2 - bz];

export function board(m: Box, w: number, d: number, material: Material, y0 = 0) {
  m.add(material, slab(roundedSquare(w, d, 3, 6), T, 0.15, { curve: 6, bevelSeg: 1 }), [w / 2, y0, 0]);
  const p = at(d);
  for (const [hx, hz] of [
    [3.5, 3.5],
    [w === 85 ? 61.5 : w - 3.5, 3.5],
    [3.5, d - 3.5],
    [w === 85 ? 61.5 : w - 3.5, d - 3.5],
  ]) {
    m.add("gold", ring(1.4, 3, 20), p(hx, y0 + T + 0.02, hz), [-90, 0, 0]);
    m.add("hole", disc(1.38, 16), p(hx, y0 + T + 0.03, hz), [-90, 0, 0]);
  }
}

/** The 2 by 20 pin header, centred at bx 32.5 on a board of depth d, its plastic `base` mm tall and pins standing `pins` mm above it. */
export function header(m: Box, d: number, { y0 = T, base = 2.5, pins = 6, plastic = "plastic-black" as Material, pinMaterial = "gold" as Material, z = d - 3.5 } = {}) {
  const p = at(d);
  m.add(plastic, rbox(50.8, base, 5.08, 0.3, 1), p(32.5, y0 + base / 2, z));
  for (let i = 0; i < 20; i++)
    for (const row of [-1.27, 1.27])
      m.add(pinMaterial, box(0.64, pins, 0.64), p(32.5 + (i - 9.5) * 2.54, y0 + base + pins / 2 - 0.5, z + row));
}

/** Plated holes where a header would go (the bare Zero). */
export function headerPads(m: Box, d: number, z: number) {
  const p = at(d);
  for (let i = 0; i < 20; i++)
    for (const row of [-1.27, 1.27]) {
      const c = p(32.5 + (i - 9.5) * 2.54, T + 0.02, z + row);
      m.add("gold", ring(0.5, 0.95, 12), c, [-90, 0, 0]);
      m.add("hole", disc(0.5, 10), [c[0], c[1] + 0.01, c[2]], [-90, 0, 0]);
    }
}

/** A socket on the front edge (towards the viewer), its mouth facing +Z. */
export function frontSocket(m: Box, d: number, bx: number, { w, h, depth, over = 1.2, mouth = [w - 1.4, h - 1.2], r = 0.6, tongue = null }: { w: number; h: number; depth: number; over?: number; mouth?: number[]; r?: number; tongue?: Material | null }) {
  const p = at(d);
  m.add("steel", rbox(w, h, depth, r, 2), p(bx, T + h / 2, depth / 2 - over));
  m.add("hole", rbox(mouth[0], mouth[1], 0.6, Math.min(r, mouth[1] / 2 - 0.05), 2), p(bx, T + h / 2, -over - 0.05));
  if (tongue) m.add(tongue, box(mouth[0] * 0.62, mouth[1] * 0.3, 0.4), p(bx, T + h / 2 - mouth[1] * 0.12, -over + 0.25));
}

/** A stack of two USB sockets on the right edge, `tongue` the colour of their tongues. */
export function usbStack(m: Box, w: number, d: number, bz: number, tongue: Material) {
  const p = at(d);
  const depth = 17.5;
  const cx = w - depth / 2 + 2.5;
  m.add("steel", rbox(depth, 15.6, 13.2, 0.5, 2), p(cx, T + 7.8, bz));
  for (const y of [4.2, 11.4]) {
    m.add("hole", box(0.6, 5.4, 12), p(w + 2.55, T + y, bz));
    m.add(tongue, box(0.6, 1.8, 11), p(w + 2.2, T + y - 0.8, bz));
  }
  // the little spring tabs on the top
  for (const dz of [-3.5, 3.5]) m.add("steel", box(5, 0.3, 1.2), p(cx + 4, T + 15.7, bz + dz));
}

export function ethernet(m: Box, w: number, d: number, bz: number, { leds = true } = {}) {
  const p = at(d);
  const depth = 21;
  m.add("steel", rbox(depth, 13.5, 16, 0.5, 2), p(w - depth / 2 + 2.5, T + 6.75, bz));
  m.add("hole", box(0.6, 8.2, 12), p(w + 2.55, T + 5.8, bz));
  m.add("plastic-black", box(0.6, 2.2, 6), p(w + 2.4, T + 10.6, bz));
  if (leds) {
    m.add("led-power", box(0.4, 1.4, 2.4), p(w + 2.6, T + 11.6, bz - 5.6));
    m.add("led-amber", box(0.4, 1.4, 2.4), p(w + 2.6, T + 11.6, bz + 5.6));
  }
}

export function audioJack(m: Box, d: number, bx: number) {
  const p = at(d);
  m.add("plastic-black", rbox(7, 6, 12.5, 0.6, 2), p(bx, T + 3, 6.25 - 1.5));
  m.add("plastic-black", cyl(3, 2.5, 20), p(bx, T + 3, -1.5 - 1.2), [90, 0, 0]);
  m.add("hole", disc(1.75, 16), p(bx, T + 3, -1.5 - 2.5), [0, 0, 0]);
}

/** A ribbon connector (camera or display): a long plastic body with its latch, lying along bz. */
export function ribbon(m: Box, d: number, bx: number, bz: number, length: number, { body = "plastic-white" as Material, latch = "plastic-black" as Material, alongX = false } = {}) {
  const p = at(d);
  const size: Vec3 = alongX ? [length, 3, 4.6] : [4.6, 3, length];
  m.add(body, box(...size), p(bx, T + 1.5, bz));
  const lsize: Vec3 = alongX ? [length - 1, 1, 1.6] : [1.6, 1, length - 1];
  m.add(latch, box(...lsize), p(bx + (alongX ? 0 : 1.2), T + 3.4, bz + (alongX ? 1.2 : 0)));
}

export function chip(m: Box, d: number, bx: number, bz: number, w: number, dz: number, h = 1.1, material: Material = "chip") {
  m.add(material, rbox(w, h, dz, 0.25, 1), at(d)(bx, T + h / 2, bz));
}

/** A system chip with its metal lid. */
export function lidChip(m: Box, d: number, bx: number, bz: number, size: number) {
  const p = at(d);
  m.add("pcb-green", box(size + 2, 0.8, size + 2), p(bx, T + 0.4, bz));
  m.add("steel", rbox(size, 1.2, size, 0.6, 2), p(bx, T + 1.3, bz));
}

/** The little parts all over a board, kept out of the rectangles given ([x0, z0, x1, z1]). */
export function sprinkle(m: Box, w: number, d: number, count: number, seed: number, keepOut: number[][]) {
  const random = seeded(seed);
  const p = at(d);
  let placed = 0;
  for (let tries = 0; placed < count && tries < count * 20; tries++) {
    const bx = 4 + random() * (w - 8);
    const bz = 4 + random() * (d - 8);
    if (keepOut.some(([x0, z0, x1, z1]) => bx > x0 - 1 && bx < x1 + 1 && bz > z0 - 1 && bz < z1 + 1)) continue;
    const kind = random();
    const turn = random() < 0.5 ? 0 : 90;
    if (kind < 0.45) m.add("smd", box(1.6, 0.7, 0.8), p(bx, T + 0.35, bz), [0, turn, 0]);
    else if (kind < 0.8) m.add("chip", box(1.6, 0.5, 0.8), p(bx, T + 0.25, bz), [0, turn, 0]);
    else if (kind < 0.93) m.add("chip", rbox(3, 0.9, 3, 0.2, 1), p(bx, T + 0.45, bz), [0, turn, 0]);
    else m.add("steel", rbox(4, 1.6, 4, 0.3, 1), p(bx, T + 0.8, bz), [0, turn, 0]);
    placed++;
  }
}

/** A line of white silkscreen. */
export const silk = (m: Box, d: number, bx: number, bz: number, w: number, dz: number) => m.add("silk", plane(w, dz), at(d)(bx, T + 0.02, bz), [-90, 0, 0]);

export function boardLeds(m: Box, d: number, bx: number, bz: number) {
  const p = at(d);
  m.add("led-red", box(1.6, 0.7, 0.9), p(bx, T + 0.35, bz));
  m.add("led-power", box(1.6, 0.7, 0.9), p(bx, T + 0.35, bz + 2.6));
}

export function sdCard(m: Box, d: number, bz: number) {
  const p = at(d);
  m.add("steel", box(14, 1.4, 12), p(8, -0.7, bz));
  m.add("plastic-black", rbox(15, 0.8, 11, 0.3, 1), p(4.2, -0.6, bz));
}


/** A box from bx0 to bx1 and bz0 to bz1 (board millimetres), from y0 to y1. */
export const span = (m: Box, material: Material, d: number, [bx0, bx1]: number[], [y0, y1]: number[], [bz0, bz1]: number[]) =>
  m.add(material, box(bx1 - bx0, y1 - y0, bz1 - bz0), at(d)((bx0 + bx1) / 2, (y0 + y1) / 2, (bz0 + bz1) / 2));
