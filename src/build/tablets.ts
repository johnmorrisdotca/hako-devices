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
const lens = (add: SlabAdd, x: number, y: number, z: number, r: number, material: Material = "black-glass", ring: Material = "steel") => {
  add(ring, cyl(r + 0.5, 0.5, 20), [x, y, z - 0.25], upright);
  add(material, disc(r, 18), [x, y, z - 0.51], [0, 180, 0]);
};

/** One round thing on a tablet's back: [across, down, radius] in mm from the corner, with the tablet upright, seen from behind, and the cameras top left. */
type CameraSpot = readonly [number, number, number];

/** The iPad Pro's cameras over the years, measured off Apple's pictures of each model's back. */
export const PRO_CAMERAS: Readonly<Record<string, { square?: { inset: number; size: number; face: boolean }; lenses: readonly CameraSpot[]; marks: readonly (readonly [Material, ...CameraSpot])[] }>> = {
  // 2015: one small lens and a microphone, no flash
  lens: { lenses: [[11.5, 11.5, 3]], marks: [["hole", 18, 11.5, 0.4]] },
  // 2016
  "lens-flash-mic": {
    lenses: [[11.8, 11.8, 3.7]],
    marks: [
      ["gold", 11.8, 20.1, 1.8],
      ["hole", 18, 11.8, 0.4],
    ],
  },
  // 2017
  "lens-flash": { lenses: [[10.3, 10.8, 4]], marks: [["gold", 10.3, 18.8, 1.8]] },
  // 2018: a wider ring, the microphone between it and the flash
  "ring-lens": {
    lenses: [[14.1, 13.4, 5.6]],
    marks: [
      ["hole", 14.1, 22.7, 0.4],
      ["gold", 14.1, 28, 1.9],
    ],
  },
  // 2020 to 2022: a black square with two lenses, the flash, the LiDAR and a microphone
  "two-lenses": {
    square: { inset: 6.5, size: 26.5, face: true },
    lenses: [
      [13.4, 13.4, 4.5],
      [13.4, 25.3, 4.7],
    ],
    marks: [
      ["gold", 26.3, 11.3, 2.1],
      ["alu-dark", 26.3, 19.4, 3.7],
      ["hole", 26.3, 27.3, 0.8],
    ],
  },
  // 2024 on: the square in the tablet's own colour, one lens over the LiDAR, a light sensor, the flash and a microphone
  "one-lens-lidar": {
    square: { inset: 6.8, size: 27.7, face: false },
    lenses: [[14.5, 14.7, 4.8]],
    marks: [
      ["black-glass", 14.5, 26.7, 4.1],
      ["black-glass", 27.2, 12.6, 1.7],
      ["steel", 27.2, 20.7, 3.2],
      ["hole", 27.2, 28.6, 0.5],
    ],
  },
};

type TabletCamera = "one" | keyof typeof PRO_CAMERAS;

/** An iPad Pro's cameras. Long side down, the top left corner from behind is top right, so down runs along the slab from its end and across runs down from its top. */
function proCameras(add: SlabAdd, camera: string, shell: Material, w: number, h: number, z: number) {
  const { square, lenses, marks } = PRO_CAMERAS[camera];
  const x = (down: number) => -w / 2 + down;
  const y = (across: number) => h - across;
  let face = z;
  if (square) {
    const { inset, size } = square;
    const middle = inset + size / 2;
    face = z - 0.9;
    add(shell, slab(roundedSquare(size, size, 7.5, 6), 0.9, 0.3, { curve: 6, bevelSeg: 1 }), [x(middle), y(middle), face], upright);
    if (square.face) {
      face = z - 1;
      add("black-glass", slab(roundedSquare(size - 1.6, size - 1.6, 6.5, 6), 0.12, 0.03, { curve: 6, bevelSeg: 1 }), [x(middle), y(middle), face], upright);
    }
  }
  for (const [across, down, r] of lenses) lens(add, x(down), y(across), face + 0.1, r, "black-glass", square ? "alu-dark" : "steel");
  for (const [material, across, down, r] of marks) add(material, disc(r, 16), [x(down), y(across), face - 0.03], [0, 180, 0]);
}

/** The home button's place: the middle of the wide border beside the picture, on the end the charging port is on. */
export const homeButtonX = (w: number, screenW: number) => (w + screenW) / 4;

/** The back of a tablet: its cameras, the top button and the port on the side, with a home button on the front of the older ones. */
const tabletBack =
  (camera: TabletCamera, shell: Material, homeX: number | null): SlabBack =>
  (add, { w, h, t }, m, frame) => {
    const z = -t;
    if (camera === "one") lens(add, -(w / 2 - 15), h - 15, z, 4.4);
    else proCameras(add, camera, shell, w, h, z);
    if (homeX !== null) {
      add("steel", disc(5.5, 24), [homeX, h / 2, 0.16]);
      add("black-glass", disc(5, 24), [homeX, h / 2, 0.18]);
    }
    m.printFace("back", [0, h / 2, z - 0.05], [0, 180, 0], w * 0.5, w * 0.1, frame);
    // the top button and the volume keys, along the top edge
    add("alu-dark", rbox(19, 1.4, Math.max(2.6, t - 2), 0.5, 1), [w / 2 - 28, h + 0.1, -t / 2]);
    add("alu-dark", rbox(24, 1.4, Math.max(2.6, t - 2), 0.5, 1), [-w / 2 + 34, h + 0.1, -t / 2]);
    // the USB-C on the right-hand side
    add("hole", rbox(1, 3, 8.6, 1.3, 2), [w / 2 + 0.05, h / 2, -t / 2], [0, 0, 0]);
  };

/** The tablets' sizes and colours, long side down. */
const tablet = (w: number, h: number, t: number, r: number, shell: Material, screen: [number, number], camera: TabletCamera = "one", home = false): SlabOptions => ({
  w,
  h,
  t,
  r,
  shell,
  screen,
  // the pictures with a home button beside them have square corners
  ...(home ? { glassR: 0.5 } : {}),
  back: tabletBack(camera, shell, home ? homeButtonX(w, screen[0]) : null),
});

export const ipadMini = tablet(195.4, 134.8, 6.3, 15, "shell-sand", [177, 123]);
export const ipadPlain = tablet(248.6, 179.5, 7, 18, "shell-blue", [227, 158]);
export const ipadAir = tablet(247.6, 178.5, 6.1, 18, "shell-violet", [230, 160]);
export const ipadPro11 = tablet(249.7, 177.5, 5.3, 15, "shell-graphite", [233.5, 161], "one-lens-lidar");
export const ipadPro13 = tablet(281.6, 215.5, 5.1, 15, "shell-silver", [264.4, 198.3], "one-lens-lidar");
export const ipadPro12First = tablet(305.7, 220.6, 6.9, 15, "shell-graphite", [262.9, 197.1], "lens", true);
export const ipadPro9 = tablet(240, 169.5, 6.1, 13, "shell-graphite", [197.1, 147.8], "lens-flash-mic", true);
export const ipadPro10 = tablet(250.6, 174.1, 6.1, 13, "shell-graphite", [214, 160.5], "lens-flash", true);
export const ipadPro12Second = tablet(305.7, 220.6, 6.9, 15, "shell-graphite", [262.9, 197.1], "lens-flash", true);
export const ipadPro11First = tablet(247.6, 178.5, 5.9, 15, "shell-graphite", [229.8, 160.5], "ring-lens");
export const ipadPro12Third = tablet(280.6, 214.9, 5.9, 15, "shell-graphite", [262.9, 197.1], "ring-lens");
export const ipadPro11Second = tablet(247.6, 178.5, 5.9, 15, "shell-graphite", [229.8, 160.5], "two-lenses");
export const ipadPro12Fourth = tablet(280.6, 214.9, 5.9, 15, "shell-graphite", [262.9, 197.1], "two-lenses");
export const ipadPro12Fifth = tablet(280.6, 214.9, 6.4, 15, "shell-graphite", [262.9, 197.1], "two-lenses");

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
