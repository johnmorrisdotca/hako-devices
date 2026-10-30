// Tablets and phones, from their published sizes: a thin slab in its colour, black glass with the picture on it, the cameras on the back, on a slight lean on a plain
// little stand, or lying flat with no stand. No marks.
import * as THREE from "three";
import { type Box, box, cyl, disc, type Material, rbox, roundedSquare, slab, type Vec3 } from "./kit.ts";
import { litScreen, type ScreenKind } from "./screens.ts";

const upright: Vec3 = [90, 0, 0];

export type SlabAdd = (material: Material, geometry: THREE.BufferGeometry, at: Vec3, turn?: Vec3) => void;
export type SlabBack = (add: SlabAdd, facts: { w: number; h: number; t: number }, m: Box, frame: THREE.Matrix4) => void;

export interface SlabOptions {
  w: number;
  h: number;
  t: number;
  r: number;
  shell: Material;
  screen: [number, number];
  kind?: ScreenKind;
  lean?: number;
  glassR?: number;
  back?: SlabBack;
}

/** The desk stand: a low rail along the desk with a lip, and a leg behind. */
export function deskStand(m: Box, w: number, h: number, lean: number, foot: number) {
  const sw = Math.min(w * 0.46, 120);
  m.add("alu-dark", rbox(sw, 4.4, 58, 1.4, 2), [0, 2.2, -16]);
  m.add("alu-dark", rbox(sw, foot + 5, 3.6, 1.2, 2), [0, (foot + 5) / 2, 11]);
  m.add("alu-dark", rbox(sw * 0.8, h * 0.42, 3, 1.2, 2), [0, h * 0.2 + 2, -26], [-lean - 8, 0, 0]);
  m.add("rubber", box(sw - 4, 0.8, 50), [0, 0.3, -16]);
}

/**
 * A slab on a stand, or with `stand` false lying flat on its back. w across, h up the screen; glass with the picture `screen` [w, h]; `back` draws what is on its back.
 * The drawing reads m.slabFacts for the same numbers.
 */
export function standing(m: Box, { w, h, t, r, shell, screen, kind = "desktop", lean = 15, glassR, back }: SlabOptions, stand = true) {
  const foot = stand ? 5 : 0;
  const frame = stand
    ? new THREE.Matrix4().makeTranslation(0, foot, 6).multiply(new THREE.Matrix4().makeRotationX((-lean * Math.PI) / 180))
    : new THREE.Matrix4().makeTranslation(0, t, h / 2).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  m.slabFacts = { w, h, t, r, screen, frame, foot, stand };
  const add: SlabAdd = (material, geometry, at, turn = [0, 0, 0]) => m.add(material, geometry, at, turn, { frame });
  add(shell, slab(roundedSquare(w, h, r, 10), t - 0.5, Math.min(1, t / 3), { curve: 10, bevelSeg: 3 }), [0, h / 2, -t], upright);
  add("bezel", slab(roundedSquare(w - 0.8, h - 0.8, r - 0.4, 10), 0.5, 0.1, { curve: 10, bevelSeg: 1 }), [0, h / 2, -0.5], upright);
  litScreen(m, [0, h / 2, 0.14], [0, 0, 0], screen[0], screen[1], { frame, radius: glassR ?? Math.max(2, r - 5), kind });
  if (back) back(add, { w, h, t }, m, frame);
  if (stand) deskStand(m, w, h, lean, foot);
  return m;
}

/** A round lens in its ring, on the back. */
const lens = (add: SlabAdd, x: number, y: number, z: number, r: number, material: Material = "black-glass") => {
  add("steel", cyl(r + 0.5, 0.5, 20), [x, y, z - 0.25], upright);
  add(material, disc(r, 18), [x, y, z - 0.51], [0, 180, 0]);
};

/** The back of a tablet: its one camera, the top button and the USB-C on the side. */
const tabletBack =
  (camera: "one" | "wide"): SlabBack =>
  (add, { w, h, t }, m, frame) => {
    const z = -t;
    const cx = w / 2 - 15;
    const cy = h - 15;
    if (camera === "wide") {
      add("shell-graphite", slab(roundedSquare(33, 15, 6, 6), 0.9, 0.3, { curve: 6, bevelSeg: 1 }), [0, cy, z - 0.9], upright);
      lens(add, -8, cy, z - 0.6, 4);
      lens(add, 3, cy, z - 0.6, 3);
      add("hole", disc(1.6, 12), [11, cy, z - 0.92], [0, 180, 0]);
    } else lens(add, -cx, cy, z, 4.4);
    m.printFace("back", [0, h / 2, z - 0.05], [0, 180, 0], w * 0.5, w * 0.1, frame);
    // the top button and the volume keys, along the top edge
    add("alu-dark", rbox(19, 1.4, Math.max(2.6, t - 2), 0.5, 1), [w / 2 - 28, h + 0.1, -t / 2]);
    add("alu-dark", rbox(24, 1.4, Math.max(2.6, t - 2), 0.5, 1), [-w / 2 + 34, h + 0.1, -t / 2]);
    // the USB-C on the right-hand side
    add("hole", rbox(1, 3, 8.6, 1.3, 2), [w / 2 + 0.05, h / 2, -t / 2], [0, 0, 0]);
  };

/** The tablets' sizes and colours, long side down. */
const tablet = (w: number, h: number, t: number, r: number, shell: Material, screen: [number, number], camera: "one" | "wide" = "one"): SlabOptions => ({ w, h, t, r, shell, screen, back: tabletBack(camera) });

export const ipadMini = tablet(195.4, 134.8, 6.3, 15, "shell-sand", [177, 123]);
export const ipadPlain = tablet(248.6, 179.5, 7, 18, "shell-blue", [227, 158]);
export const ipadAir = tablet(247.6, 178.5, 6.1, 18, "shell-violet", [230, 160]);
export const ipadPro11 = tablet(249.7, 177.5, 5.3, 15, "shell-graphite", [233.5, 161], "wide");
export const ipadPro13 = tablet(281.6, 215.5, 5.1, 15, "shell-silver", [264.4, 198.3], "wide");

/** The back of a phone: the square of cameras in the corner. */
const phoneBack: SlabBack = (add, { w, h, t }, m, frame) => {
  const z = -t;
  add("shell-graphite", slab(roundedSquare(30, 32, 7, 6), 1.3, 0.4, { curve: 6, bevelSeg: 1 }), [w / 2 - 19, h - 21, z - 1.3], upright);
  lens(add, w / 2 - 13, h - 13, z - 1, 5.4);
  lens(add, w / 2 - 25, h - 28, z - 1, 5.4);
  add("gold", disc(1.3, 10), [w / 2 - 25, h - 13, z - 1.32], [0, 180, 0]);
  m.printFace("back", [0, h * 0.5, z - 0.05], [0, 180, 0], w * 0.6, w * 0.12, frame);
};

/** A phone: 147 by 71 by 8 mm, the picture to its edges, a dark pill at the top. */
export const iphoneSlab: SlabOptions = { w: 70.6, h: 146.6, t: 7.8, r: 11, shell: "shell-blue", screen: [64.4, 139.6], kind: "phone", lean: 16, glassR: 8, back: phoneBack };

export function iphone(m: Box, stand = true) {
  standing(m, iphoneSlab, stand);
  m.add("hole", rbox(20, 6, 0.4, 2.8, 2), [0, iphoneSlab.h - 8.5, 0.32], [0, 0, 0], { frame: m.slabFacts?.frame });
  return m;
}
