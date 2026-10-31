// The laptop in brushed metal, from its published size, and the parts other machines share. A plain lid: no mark. Fine perforations are painted by the viewer from a node named
// perf-<across>-<down>-<dot %>, so a field of thousands of holes costs four corners here.
import * as THREE from "three";
import { type Box, cyl, disc, type Material, plane, rbox, roundedSquare, slab, type Vec3 } from "./kit.ts";
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
