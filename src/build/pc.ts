// The small PCs: a palm-sized box (a dark grey body under a glossy lid, the ports and power button in front, vents on the sides), a mini PC, a tower, and the box shown
// when a device does not say what it is: a small tower with a warm light down its face.
import { box, type Box, cyl, disc, type Material, rbox, ring, roundedSquare, slab } from "./kit.ts";
import { perforation } from "./macs.ts";

const mouth = (m: Box, z: number, x: number, y: number, w: number, h: number, r = Math.min(w, h) / 2 - 0.05, material: Material = "hole") =>
  m.add(material, rbox(w, h, 1, Math.max(0.05, r), 2), [x, y, z + (z < 0 ? 0.3 : -0.3)]);

/** A small PC: 117 by 112 by 54 mm. */
export function nuc(m: Box) {
  const W = 117;
  const D = 112;
  const H = 54;
  const F = D / 2;
  m.add("plastic-char", slab(roundedSquare(W, D, 8, 8), H - 3, 2, { curve: 8, bevelSeg: 3 }), [0, 3, 0]);
  m.add("plastic-gloss", slab(roundedSquare(W - 1, D - 1, 7.6, 8), 3.4, 1.2, { curve: 8, bevelSeg: 2 }), [0, H - 2.4, 0]);
  m.add("rubber", slab(roundedSquare(W - 10, D - 10, 5, 6), 3, 0.8), [0, 0, 0]);
  m.printFace("lid", [0, H + 1.04, 0], [-90, 0, 0], 70, 14);
  // front: the power button with its light, a USB-C, two USB-A, the headphone socket
  const y = 26;
  m.add("plastic-gloss", cyl(4.4, 1, 32), [-44, y, F + 0.2], [90, 0, 0]);
  m.add("led-blue", ring(4.4, 5, 32), [-44, y, F + 0.06]);
  mouth(m, F, -26, y, 8.6, 3.1);
  for (const x of [-8, 12]) {
    mouth(m, F, x, y, 13.4, 5.8, 0.4);
    m.add("usb-blue", rbox(11.4, 2, 0.6, 0.2, 1), [x, y - 0.8, F - 0.2]);
  }
  m.add("hole", disc(1.9, 20), [36, y, F + 0.05]);
  m.add("plastic-grey", disc(0.8, 12), [48, y, F + 0.05]);
  // back: two HDMI, two USB-C, network, two USB-A, the power socket
  const b = -F;
  const at = (seen: number) => -seen;
  mouth(m, b, at(-44), 20, 15, 5.6, 1.2);
  mouth(m, b, at(-26), 20, 15, 5.6, 1.2);
  mouth(m, b, at(-10), 22, 8.6, 3.1);
  mouth(m, b, at(-10), 15, 8.6, 3.1);
  mouth(m, b, at(6), 20, 12.4, 10, 0.6);
  mouth(m, b, at(22), 22, 13.4, 5.8, 0.4);
  mouth(m, b, at(22), 13, 13.4, 5.8, 0.4);
  m.add("plastic-black", cyl(4.6, 1.4, 24), [at(44), 20, b - 0.5], [90, 0, 0]);
  m.add("hole", disc(2.6, 20), [at(44), 20, b - 1.25], [0, 180, 0]);
  perforation(m, "back", [0, 40, b - 0.04], [0, 180, 0], 96, 12, 40, 5, 62, "plastic-char");
  // vents on both sides
  perforation(m, "left", [-W / 2 - 0.04, 24, 0], [0, -90, 0], 80, 26, 34, 11, 62, "plastic-char");
  perforation(m, "right", [W / 2 + 0.04, 24, 0], [0, 90, 0], 80, 26, 34, 11, 62, "plastic-char");
  return m;
}

/** A computer of no particular make: 90 by 210 by 200 mm, a warm light down its face. */
export function unknownBox(m: Box) {
  const W = 90;
  const D = 200;
  const H = 210;
  const F = D / 2;
  m.add("plastic-char", slab(roundedSquare(W, D, 6, 8), H - 6, 3, { curve: 8, bevelSeg: 3 }), [0, 6, 0]);
  for (const [x, z] of [
    [-W / 2 + 10, -F + 14],
    [W / 2 - 10, -F + 14],
    [-W / 2 + 10, F - 14],
    [W / 2 - 10, F - 14],
  ])
    m.add("rubber", cyl(6, 6, 20), [x, 3, z]);
  m.add("plastic-gloss", rbox(W - 6, H - 14, 2, 4, 3), [0, 6 + (H - 6) / 2, F + 0.4]);
  m.add("led-warm", rbox(2.2, 120, 0.6, 1, 2), [W / 2 - 14, 110, F + 1.5]);
  m.add("plastic-grey", ring(5, 5.8, 32), [-W / 2 + 16, H - 20, F + 1.45]);
  m.add("led-white", disc(1, 16), [-W / 2 + 16, H - 20, F + 1.46]);
  mouth(m, F + 1.4, -W / 2 + 16, H - 38, 13.4, 5.8, 0.4);
  mouth(m, F + 1.4, -W / 2 + 16, H - 48, 13.4, 5.8, 0.4);
  perforation(m, "side", [W / 2 + 0.04, 110, -10], [0, 90, 0], 150, 150, 50, 50, 62, "plastic-char");
  m.add("hole", disc(40, 48), [0, 130, -F - 0.05], [0, 180, 0]);
  return m;
}

/** A mini PC of no particular make: 128 by 128 by 48 mm, a dark metal body with soft corners, a black vented top, a glossy strip with its sockets in front. */
export function miniPc(m: Box) {
  const W = 128;
  const H = 48;
  const F = W / 2;
  m.add("alu-dark", slab(roundedSquare(W, W, 14, 10), H - 3, 2.6, { curve: 10, bevelSeg: 4 }), [0, 3, 0]);
  m.add("rubber", slab(roundedSquare(W - 12, W - 12, 8, 8), 3.2, 0.6), [0, 0, 0]);
  m.add("plastic-black", slab(roundedSquare(W - 16, W - 16, 9, 8), 1, 0.3, { curve: 8, bevelSeg: 1 }), [0, H - 0.4, 0]);
  perforation(m, "top", [0, H + 0.64, 0], [-90, 0, 0], W - 34, W - 34, 34, 34, 54, "plastic-char");
  m.add("plastic-gloss", rbox(W - 24, 22, 0.8, 2, 2), [0, H / 2 - 2, F - 0.1]);
  const y = H / 2 - 2;
  m.add("steel", cyl(3.6, 0.8, 28), [-46, y, F + 0.2], [90, 0, 0]);
  m.add("led-blue", ring(3.6, 4.2, 28), [-46, y, F + 0.34]);
  for (const x of [-26, -8]) {
    mouth(m, F + 0.6, x, y, 13.4, 5.8, 0.4);
    m.add("usb-blue", rbox(11.4, 2, 0.6, 0.2, 1), [x, y - 0.8, F + 0.4]);
  }
  mouth(m, F + 0.6, 10, y, 8.6, 3.1);
  m.add("hole", disc(1.9, 20), [26, y, F + 0.35]);
  m.add("led-white", disc(0.9, 12), [46, y, F + 0.35]);
  const b = -F;
  const seen = (x: number) => -x;
  mouth(m, b, seen(-44), 22, 12.4, 10, 0.6);
  mouth(m, b, seen(-26), 22, 15, 5.6, 1.2);
  mouth(m, b, seen(-8), 22, 15, 5.6, 1.2);
  mouth(m, b, seen(10), 22, 13.4, 5.8, 0.4);
  mouth(m, b, seen(28), 22, 13.4, 5.8, 0.4);
  m.add("plastic-black", cyl(4.6, 1.4, 24), [seen(46), 22, b - 0.5], [90, 0, 0]);
  for (const [side, name] of [
    [1, "right"],
    [-1, "left"],
  ] as const)
    perforation(m, name, [(side * W) / 2 + side * 0.05, 18, 0], [0, side * 90, 0], 90, 16, 40, 7, 58, "alu-dark");
  return m;
}

/** A small tower of no particular make: 180 by 360 by 380 mm, black steel, a mesh front, the power button and USB sockets at the top of the front, a vented side. */
export function pcTower(m: Box) {
  const W = 180;
  const H = 380;
  const D = 360;
  const F = D / 2;
  m.add("plastic-char", slab(roundedSquare(W, D, 4, 6), H - 12, 1.6, { curve: 6, bevelSeg: 2 }), [0, 12, 0]);
  for (const [x, z] of [
    [-W / 2 + 18, -F + 26],
    [W / 2 - 18, -F + 26],
    [-W / 2 + 18, F - 26],
    [W / 2 - 18, F - 26],
  ])
    m.add("rubber", cyl(13, 12, 24), [x, 6, z]);
  // the front panel: plastic, the mesh below, the strip of controls on top
  m.add("plastic-char", rbox(W, H - 10, 10, 3, 2), [0, 12 + (H - 12) / 2, F + 3]);
  const front = F + 8.1;
  perforation(m, "front", [0, 150, front], [0, 0, 0], W - 28, 240, 26, 44, 66, "plastic-char");
  m.add("plastic-gloss", cyl(9, 1.4, 36), [-W / 2 + 28, H - 34, front], [90, 0, 0]);
  m.add("led-white", ring(9, 10, 36), [-W / 2 + 28, H - 34, front - 0.3]);
  for (const x of [8, 28]) {
    mouth(m, front, x, H - 34, 13.4, 5.8, 0.4);
    m.add("usb-blue", rbox(11.4, 2, 0.6, 0.2, 1), [x, H - 34.8, front - 0.2]);
  }
  m.add("hole", disc(1.9, 16), [52, H - 34, front + 0.05]);
  m.add("led-power", disc(1.4, 12), [-W / 2 + 54, H - 34, front + 0.05]);
  // the vents on its side
  perforation(m, "side", [W / 2 + 0.05, 200, 30], [0, 90, 0], 170, 200, 44, 52, 58, "plastic-char");
  m.printFace("front", [0, 300, front + 0.06], [0, 0, 0], 120, 18);
  // the back: the power supply, its fan, the ports, the card slots
  const b = -F;
  const seen = (x: number) => -x;
  m.add("steel", rbox(150, 88, 0.8, 1, 1), [0, H - 56, b - 0.05]);
  m.add("hole", disc(36, 40), [seen(-22), H - 56, b - 0.5], [0, 180, 0]);
  mouth(m, b - 0.5, seen(50), H - 56, 30, 22, 2);
  m.add("hole", disc(44, 44), [seen(36), 230, b - 0.05], [0, 180, 0]);
  m.add("steel", rbox(46, 130, 0.8, 1, 1), [seen(-48), 210, b - 0.05]);
  for (let i = 0; i < 6; i++) mouth(m, b - 0.5, seen(-48), 260 - i * 20, 34, 10, 1);
  for (let i = 0; i < 4; i++) m.add("steel", box(130, 8, 0.8), [seen(0), 110 - i * 16, b - 0.05]);
  return m;
}
