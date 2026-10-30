// NAS boxes, from published sizes: a matte black box, full-height drive trays with a green light at the top of each, a column of lights and buttons, and at the back a
// round fan grille over the ports. No printing: `print` puts the caller's own words on the front or the side.
import { box, type Box, cyl, disc, rbox, ring, roundedSquare, slab, torus } from "./kit.ts";
import { perforation } from "./macs.ts";
import type { DriveId } from "../parts.ts";

/** A dark port mouth on the back face (z = b, looking along -Z). */
const backHole = (m: Box, b: number, x: number, y: number, w: number, h: number, r = 0.6) => m.add("hole", rbox(w, h, 1, r, 2), [x, y, b + 0.3]);

function fan(m: Box, b: number, x: number, y: number, r: number, index: number) {
  // the grille: rings, four spokes and the hub, with the dark of the fan behind it
  m.add("hole", disc(r, 64), [x, y, b + 0.2], [0, 180, 0]);
  for (let at = 10; at <= r - 2; at += 6.4) m.add("plastic-black", torus(at, 0.85, 48, 4), [x, y, b - 0.1]);
  m.add("plastic-black", torus(r, 1.6, 48, 6), [x, y, b - 0.3]);
  for (const turn of [45, 135]) m.add("plastic-black", box(2 * r, 1.6, 1.4), [x, y, b - 0.1], [0, 0, turn]);
  m.add("plastic-black", cyl(8, 1.6, 32), [x, y, b - 0.2], [90, 0, 0]);
  for (const [dx, dy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    m.add("steel", cyl(1.6, 0.8, 12), [x + dx * (r - 3), y + dy * (r - 3), b - 0.2], [90, 0, 0]);
  // the blades, turning slowly behind the grille
  const id = m.node(`spin-z-${index}`, [x, y, b + 7]);
  m.add("plastic-grey", cyl(12, 3, 32), [0, 0, 0], [90, 0, 0], { node: id });
  for (let i = 0; i < 7; i++) {
    const a = (i * 360) / 7;
    const rad = (a * Math.PI) / 180;
    m.add("plastic-black", box(r - 14, 1, 13), [Math.cos(rad) * (r / 2 + 3), Math.sin(rad) * (r / 2 + 3), 0], [0, 28, a], { node: id });
  }
}

/** A NAS with `bays` drive trays. The two-bay one is 105 by 166 by 223 mm, its lights and buttons on the right. A bay with no drive shows its dark mouth. */
export function nas(m: Box, bays: number, drives: readonly (DriveId | null)[] | undefined) {
  const H = 166;
  const D = 223;
  const TRAY = 33.6;
  const column = 26;
  const small = bays <= 2;
  const W = bays === 1 ? 71 : bays === 2 ? 105 : bays * (TRAY + 2) + column + 22;
  const F = D / 2;
  m.add("matte-black", slab(roundedSquare(W, D, 7, 8), H, 3, { curve: 8, bevelSeg: 3 }), [0, 0, 0]);
  for (const [x, z] of [
    [-W / 2 + 14, -F + 18],
    [W / 2 - 14, -F + 18],
    [-W / 2 + 14, F - 18],
    [W / 2 - 14, F - 18],
  ])
    m.add("rubber", cyl(7, 3, 20), [x, -1.2, z]);

  // the front: trays, then the column of lights and buttons (on the right of a two-bay, on the left of the bigger ones)
  const trays = bays * (TRAY + 2) - 2;
  const columnLeft = !small;
  const x0 = columnLeft ? -W / 2 + 6 + column : -W / 2 + 5;
  const cx = columnLeft ? -W / 2 + 6 + column / 2 - 1 : W / 2 - 5 - column / 2 + 1;
  m.add("hole", rbox(trays + 2, 152, 1, 1.5, 2), [x0 + trays / 2, 84, F + 0.1]);
  for (let i = 0; i < bays; i++) {
    const x = x0 + TRAY / 2 + i * (TRAY + 2);
    if (drives !== undefined && (drives[i] ?? null) === null) continue;
    m.add("tray", rbox(TRAY, 150, 3.2, 2.2, 2), [x, 84, F + 0.9]);
    // the tray's face: a slight line round its handle, the light at the top and the latch at the bottom
    m.add("plastic-black", rbox(TRAY - 6, 118, 0.3, 2, 2), [x, 82, F + 2.55]);
    m.add("plastic-gloss", rbox(TRAY - 7, 117, 0.3, 1.8, 2), [x, 82, F + 2.62]);
    m.add("led-disk", disc(1.1, 16), [x, 150, F + 2.6]);
    m.add("plastic-black", ring(2, 3.4, 24), [x, 17, F + 2.6]);
    m.add("tray", disc(2, 20), [x, 17, F + 2.55]);
  }
  // lights: status, network, then one per disk
  const lights = ["led-power" as const, "led-disk" as const, ...Array<"led-disk">(Math.min(bays, 5)).fill("led-disk")];
  lights.forEach((led, i) => {
    m.add(led, disc(1, 16), [cx, 152 - i * 9, F + 0.08]);
    m.add("plastic-grey", box(6, 0.8, 0.2), [cx + (columnLeft ? 6 : -6), 152 - i * 9, F + 0.05]);
  });
  const y1 = 152 - lights.length * 9 - 8;
  // the copy button, the USB socket (its tongue blue), the power button with its blue light
  m.add("plastic-gloss", rbox(9, 7, 1.4, 1.4, 2), [cx, y1, F + 0.4]);
  m.add("plastic-grey", box(3, 3, 0.2), [cx, y1, F + 1.15]);
  m.add("steel", rbox(7.2, 15, 1, 0.8, 2), [cx, y1 - 26, F + 0.2]);
  m.add("hole", rbox(5.6, 13.4, 1, 0.5, 2), [cx, y1 - 26, F + 0.35]);
  m.add("usb-blue", box(1.8, 11.4, 0.8), [cx - 0.9, y1 - 26, F + 0.5]);
  m.add("plastic-gloss", cyl(5.4, 1.6, 40), [cx, 26, F + 0.6], [90, 0, 0]);
  m.add("led-blue", ring(3.2, 3.8, 32), [cx, 26, F + 1.42]);
  m.add("plastic-grey", ring(5.4, 5.9, 40), [cx, 26, F + 1.42]);
  m.printFace("side", [W / 2 + 0.06, 92, -6], [0, 90, 0], Math.min(150, D - 50), 30);
  m.printFace("front", [cx, 9, F + 0.06], [0, 0, 0], 22, 4);

  // the back: one fan for two bays, two for more, then the ports
  const b = -F;
  const fans = small ? [0] : [-W / 4 + 4, W / 4 - 4];
  fans.forEach((x, i) => fan(m, b, x, bays === 1 ? 124 : 112, bays === 1 ? 30 : 44, i));
  const seen = (x: number) => -x;
  const left = bays === 1 ? -22 : bays === 2 ? -36 : -W / 2 + 22;
  // two network sockets with their lights (one on a one-bay)
  for (const dx of bays === 1 ? [0] : [0, 15.5]) {
    const x = seen(left + dx);
    m.add("steel", rbox(15, 13.6, 1, 0.6, 2), [x, 48, b + 0.1]);
    backHole(m, b - 0.02, x, 47.4, 12.4, 9.6);
    m.add("plastic-black", box(5.6, 2.4, 0.4), [x, 53.2, b - 0.1]);
    m.add("led-power", box(2, 1.4, 0.3), [x - 4.6, 53.6, b - 0.25]);
    m.add("led-amber", box(2, 1.4, 0.3), [x + 4.6, 53.6, b - 0.25]);
  }
  // USB (blue), eSATA, the lock slot, the reset pin, the round power socket
  const ux = seen(left + (bays === 1 ? 18 : 34));
  m.add("steel", rbox(15.2, 7.6, 1, 0.6, 2), [ux, 48, b + 0.1]);
  backHole(m, b - 0.02, ux, 48, 13.4, 5.8, 0.4);
  m.add("usb-blue", box(11.4, 2, 0.6), [ux, 47.2, b - 0.2]);
  if (bays > 1) {
    const ex = seen(left + 56);
    m.add("steel", rbox(17, 6.4, 1, 0.8, 2), [ex, 44, b + 0.1]);
    backHole(m, b - 0.02, ex, 44, 15, 4.4, 0.6);
    m.add("plastic-black", box(9, 1.2, 0.4), [ex, 43.6, b - 0.25]);
    backHole(m, b, seen(left + 66), 62, 7, 3.2, 1);
  }
  m.add("hole", disc(0.9, 12), [seen(left + 22), 30, b - 0.05], [0, 180, 0]);
  const dc = seen(left + 4);
  m.add("plastic-black", cyl(5.4, 2, 32), [dc, 26, b - 0.6], [90, 0, 0]);
  m.add("hole", disc(3.4, 24), [dc, 26, b - 1.62], [0, 180, 0]);
  m.add("steel", cyl(0.9, 1, 12), [dc, 26, b - 1.7], [90, 0, 0]);
  // screws on the back panel
  for (const [x, y] of [
    [-W / 2 + 7, H - 8],
    [W / 2 - 7, H - 8],
    [-W / 2 + 7, 10],
    [W / 2 - 7, 10],
  ])
    m.add("steel", cyl(2, 0.6, 16), [x, y, b - 0.1], [90, 0, 0]);
  return m;
}

/** A rack NAS: 1U, 482 mm across its ears, 44 tall, 460 deep, four drive trays lying side by side, the lights and power button at the right. */
export function nasRack(m: Box, drives: readonly (DriveId | null)[] | undefined) {
  const W = 430;
  const H = 44;
  const D = 460;
  const F = D / 2;
  m.add("alu-dark", rbox(W, H - 1, D, 1.2, 1), [0, H / 2, 0]);
  // the ears, each with its two slots
  for (const side of [-1, 1]) {
    const x = side * (W / 2 + 13);
    m.add("alu-dark", rbox(26, H, 2.4, 0.6, 1), [x, H / 2, F - 1]);
    for (const y of [11, 33]) m.add("hole", rbox(9, 4.6, 1, 2.2, 2), [x, y, F + 0.1]);
  }
  const trays = 4;
  const TW = 95;
  const x0 = -W / 2 + 6 + TW / 2;
  m.add("hole", rbox(trays * (TW + 1) + 1, H - 6, 1, 0.6, 1), [x0 + (1.5 * (TW + 1)), H / 2, F + 0.05]);
  for (let i = 0; i < trays; i++) {
    const x = x0 + i * (TW + 1);
    if (drives !== undefined && (drives[i] ?? null) === null) continue;
    m.add("tray", rbox(TW, H - 8, 2.6, 1, 1), [x, H / 2, F + 0.9]);
    m.add("plastic-gloss", rbox(TW - 22, H - 16, 0.4, 0.6, 1), [x - 4, H / 2, F + 2.2]);
    m.add("led-disk", box(2.2, 1.2, 0.4), [x + TW / 2 - 7, H - 10, F + 2.3]);
    m.add("steel", cyl(1.8, 0.8, 12), [x + TW / 2 - 7, 12, F + 2.2], [90, 0, 0]);
  }
  const cx = W / 2 - 22;
  m.add("plastic-char", rbox(34, H - 6, 1, 0.8, 1), [cx, H / 2, F + 0.3]);
  for (const [i, led] of (["led-power", "led-disk", "led-disk"] as const).entries()) m.add(led, disc(1, 12), [cx - 11 + i * 6, H - 11, F + 0.85]);
  m.add("plastic-gloss", cyl(4.6, 1.2, 28), [cx + 8, 16, F + 0.9], [90, 0, 0]);
  m.add("led-blue", ring(2.6, 3.2, 24), [cx + 8, 16, F + 1.52]);
  // the back: two power sockets, the network and USB, the fans behind their grille
  const b = -F;
  for (const x of [170, 110]) backHole(m, b, x, H / 2, 40, 28, 2);
  for (const x of [30, 10, -10, -30]) {
    m.add("steel", rbox(15, 13.6, 1, 0.6, 1), [x, H / 2, b + 0.1]);
    backHole(m, b - 0.02, x, H / 2 - 1, 12.4, 9.6);
  }
  for (const x of [-70, -130, -190]) {
    m.add("hole", disc(17, 32), [x, H / 2, b - 0.05], [0, 180, 0]);
    m.add("plastic-black", torus(13, 0.8, 32, 4), [x, H / 2, b - 0.1]);
    m.add("plastic-black", box(34, 1.2, 0.8), [x, H / 2, b - 0.12]);
  }
  m.add("rubber", box(400, 1, 420), [0, 0.2, 0]);
  // the lid: its seam, the vents at the back of it and the screws along the front
  m.add("hole", box(W - 4, 0.1, 0.8), [0, H + 0.02, -40]);
  m.printFace("lid", [0, H + 0.06, 60], [-90, 0, 0], 180, 30);
  perforation(m, "vents", [0, H + 0.06, -130], [-90, 0, 0], W - 60, 130, 74, 22, 58, "alu-dark");
  for (const x of [-190, -95, 0, 95, 190]) m.add("steel", cyl(2.2, 0.5, 12), [x, H + 0.1, 150]);
  return m;
}
