// The desktop and laptop computers in brushed metal, from their published sizes. A plain lid: no mark. Fine perforations are painted by the viewer from a node named
// perf-<across>-<down>-<dot %>, so a field of thousands of holes costs four corners here.
import * as THREE from "three";
import { type Box, box, cyl, disc, type Material, plane, rbox, roundedSquare, slab, type Vec3 } from "./kit.ts";
import { litScreen } from "./screens.ts";

/** A port mouth on a face looking along +Z (front) or -Z (back): a dark rounded hole `w` by `h` at (x, y). */
export function mouth(m: Box, face: number, x: number, y: number, w: number, h: number, r = Math.min(w, h) / 2 - 0.05) {
  const back = face < 0;
  m.add("hole", rbox(w, h, 1, Math.max(0.05, r), 3), [x, y, face + (back ? 0.32 : -0.32)]);
}

/** A field of perforations painted by the viewer: `across` by `down` holes on a w by h rectangle at `at`, looking along `turn`. */
export function perforation(m: Box, name: string, at: Vec3, turn: Vec3, w: number, h: number, across: number, down: number, dot: number, material: Material = "alu") {
  const id = `perf-${across}-${down}-${dot}-${name}`;
  const node = m.node(id, at, { uv: true });
  m.add(material, plane(w, h), [0, 0, 0], turn, { node });
}

/** A band of perforations round a foot (a cylinder's side). */
function perforatedBand(m: Box, name: string, y: number, r: number, h: number, across: number, down: number, dot: number) {
  const id = `perf-${across}-${down}-${dot}-${name}`;
  const node = m.node(id, [0, y, 0], { uv: true });
  m.add("alu", new THREE.CylinderGeometry(r, r, h, 96, 1, true), [0, 0, 0], [0, 0, 0], { node });
}

/** The rounded square aluminium box both desktop Macs are: a body on an inset round foot. */
export function macBlock(m: Box, { w, h, r, edge, foot, footR }: { w: number; h: number; r: number; edge: number; foot: number; footR: number }) {
  m.add("alu", slab(roundedSquare(w, w, r, 16), h - foot, edge, { curve: 16, bevelSeg: 5 }), [0, foot, 0]);
  m.add("alu", cyl(footR, foot - 0.6, 96), [0, (foot - 0.6) / 2 + 0.6, 0]);
  m.add("rubber", cyl(footR - 2, 0.6, 64), [0, 0.3, 0]);
  perforatedBand(m, "foot", foot / 2 + 0.3, footR + 0.06, foot - 1.6, Math.round((2 * Math.PI * footR) / 2.2), 3, 64);
}

/** A tall square desktop: 197 by 197 by 95 mm. */
export function macStudio(m: Box) {
  const w = 197;
  const h = 95;
  const F = w / 2;
  macBlock(m, { w, h, r: 31, edge: 4.5, foot: 7.5, footR: 86 });
  m.printFace("lid", [0, h + 0.04, 0], [-90, 0, 0], 90, 18);
  // front: two USB-C and the SD card slot on the left, the power light on the right
  const y = 27;
  mouth(m, F, -61, y, 8.6, 3.1);
  mouth(m, F, -50, y, 8.6, 3.1);
  mouth(m, F, -33, y, 24, 2.4, 0.6);
  m.add("led-white", disc(0.9, 16), [62, y, F + 0.02]);
  // back: the field of fine holes over the upper part, the ports along the bottom (left to right as seen from behind, so x runs the other way)
  perforation(m, "back", [0, 64, -F - 0.04], [0, 180, 0], 132, 48, 66, 24, 72);
  const b = -F;
  const at = (seen: number) => -seen;
  for (const seen of [-60, -51, -42, -33]) mouth(m, b, at(seen), 24, 8.6, 3.1);
  mouth(m, b, at(-20), 23.5, 12, 9.4, 1);
  m.add("plastic-black", box(5, 2.2, 0.6), [at(-20), 18.4, b + 0.1]);
  // the power inlet: a rounded socket with the two lobes of the plug
  mouth(m, b, at(-3), 24, 14, 12, 4.5);
  m.add("steel", cyl(1.2, 1.2, 12), [at(-6), 25, b + 0.4], [90, 0, 0]);
  m.add("steel", cyl(1.2, 1.2, 12), [at(0), 25, b + 0.4], [90, 0, 0]);
  mouth(m, b, at(13), 24, 5.2, 12.6, 0.6);
  mouth(m, b, at(21), 24, 5.2, 12.6, 0.6);
  mouth(m, b, at(35), 24, 15, 5.6, 1.2);
  m.add("hole", disc(1.9, 20), [at(47), 24, b - 0.05], [0, 180, 0]);
  m.add("alu", cyl(4.2, 1, 40), [at(59), 24, b - 0.2], [90, 0, 0]);
  m.add("hole", disc(4.4, 40), [at(59), 24, b + 0.32], [0, 180, 0]);
  return m;
}

/** A small square desktop: 127 by 127 by 50 mm, the power button underneath at the back left. */
export function macMini(m: Box) {
  const w = 127;
  const h = 50;
  const F = w / 2;
  macBlock(m, { w, h, r: 22, edge: 3.5, foot: 5, footR: 54 });
  m.printFace("lid", [0, h + 0.04, 0], [-90, 0, 0], 60, 12);
  const y = 16;
  mouth(m, F, -42, y, 8.6, 3.1);
  mouth(m, F, -32, y, 8.6, 3.1);
  m.add("hole", disc(1.9, 20), [-22, y, F + 0.05]);
  m.add("led-white", disc(0.8, 16), [44, y, F + 0.02]);
  const b = -F;
  const at = (seen: number) => -seen;
  for (const seen of [-38, -29, -20]) mouth(m, b, at(seen), 18, 8.6, 3.1);
  mouth(m, b, at(-6), 18, 15, 5.6, 1.2);
  mouth(m, b, at(10), 17.5, 12, 9.4, 1);
  mouth(m, b, at(30), 18, 13, 11, 4);
  perforation(m, "back", [0, 34, -F - 0.04], [0, 180, 0], 76, 18, 40, 10, 66);
  return m;
}

/** A 13-inch laptop, open a little past upright, a picture on its screen. */
export function macbook(m: Box) {
  const W = 304;
  const D = 215;
  const H = 11.3;
  m.add("alu", slab(roundedSquare(W, D, 14, 10), H, 2.6, { curve: 10, bevelSeg: 4 }), [0, 0, 0]);
  for (const [x, z] of [
    [-128, -86],
    [128, -86],
    [-128, 86],
    [128, 86],
  ])
    m.add("rubber", cyl(4, 0.8, 16), [x, -0.3, z]);
  // the keyboard: a dark well and its keys
  const top = H;
  const kz = -D / 2 + 82;
  m.add("plastic-black", rbox(282, 0.4, 118, 2, 1), [0, top - 0.1, kz]);
  const u = 19.05;
  const rows = [
    { z: -50, h: 9.5, keys: Array(14).fill(1.035) },
    { z: -33, h: 16.4, keys: [...Array(13).fill(1), 1.5] },
    { z: -14, h: 16.4, keys: [1.5, ...Array(13).fill(1)] },
    { z: 5, h: 16.4, keys: [1.8, ...Array(11).fill(1), 1.7] },
    { z: 24, h: 16.4, keys: [2.3, ...Array(10).fill(1), 2.2] },
    { z: 43, h: 16.4, keys: [1, 1, 1, 1.25, 5.2, 1.25, 1, 3] },
  ];
  for (const row of rows) {
    const total = row.keys.reduce((a, b) => a + b, 0) * u;
    let x = -total / 2;
    for (const k of row.keys) {
      const kw = k * u;
      if (k === 3 && row === rows[5]) {
        // the arrow keys: left and right full height, up and down halves
        const third = kw / 3;
        m.add("key", rbox(third - 2.6, 1, row.h, 1.6, 1), [x + third / 2, top + 0.6, kz + row.z]);
        m.add("key", rbox(third - 2.6, 1, row.h / 2 - 1.3, 1.2, 1), [x + third * 1.5, top + 0.6, kz + row.z - row.h / 4]);
        m.add("key", rbox(third - 2.6, 1, row.h / 2 - 1.3, 1.2, 1), [x + third * 1.5, top + 0.6, kz + row.z + row.h / 4]);
        m.add("key", rbox(third - 2.6, 1, row.h, 1.6, 1), [x + third * 2.5, top + 0.6, kz + row.z]);
      } else m.add("key", rbox(kw - 2.6, 1, row.h, 1.6, 1), [x + kw / 2, top + 0.6, kz + row.z]);
      x += kw;
    }
  }
  // the power key's ring, top right
  m.add("steel", rbox(16.5, 1.02, 9.6, 1.6, 2), [124, top + 0.62, kz - 50]);
  // the trackpad, a hair lower than the deck, and the finger notch
  m.add("hole", rbox(136, 0.2, 86, 6, 2), [0, top + 0.02, D / 2 - 52]);
  m.add("alu", rbox(135, 0.3, 85, 5.6, 2), [0, top + 0.06, D / 2 - 52]);
  m.add("hole", rbox(52, 3, 2, 1, 2), [0, H / 2, D / 2 - 0.4]);
  // side ports: two USB-C on the left and the headphone jack on the right
  for (const z of [-60, -46]) m.add("hole", rbox(1, 3, 8.6, 1.4, 2), [-W / 2 + 0.3, H / 2, z]);
  m.add("hole", disc(1.8, 16), [W / 2 + 0.05, H / 2, -60], [0, 90, 0]);

  // the lid, drawn closed and turned open about the hinge
  const frame = new THREE.Matrix4()
    .makeTranslation(0, H + 0.4, -D / 2 + 3)
    .multiply(new THREE.Matrix4().makeRotationX((-108 * Math.PI) / 180));
  // the drawing opens its lid the same way
  m.lidFrame = frame;
  const LT = 4.6;
  m.add("alu", slab(roundedSquare(W, D - 4, 14, 10), LT, 1.6, { curve: 10, bevelSeg: 3 }), [0, 0, (D - 4) / 2], [0, 0, 0], { frame });
  m.add("black-glass", rbox(W - 2, 0.6, D - 6, 12, 2), [0, -0.2, (D - 4) / 2], [0, 0, 0], { frame });
  // the outside of the lid, upright to someone behind it
  m.printFace("lid", [0, LT + 0.04, (D - 4) / 2], [90, 180, 0], 110, 22, frame);
  m.add("alu-dark", cyl(4.2, W - 40, 24), [0, 0.2, 2], [0, 0, 90], { frame });
  // the screen and its notch: 287 by 179 mm of picture
  litScreen(m, [0, -0.52, (D - 4) / 2 + 4], [90, 0, 0], 284, 178, { frame });
  m.add("black-glass", rbox(32, 0.4, 6, 2.5, 2), [0, -0.62, D - 4 - 5], [0, 0, 0], { frame });
  m.add("hole", disc(1.1, 16), [0, -0.84, D - 4 - 5.2], [90, 0, 0], { frame });
  return m;
}
