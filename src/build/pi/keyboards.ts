// The computers inside a keyboard: 286 by 122 by 23 mm from their published drawing: pale keys on a pale deck, a thin band round the foot, the deck sloping up to the back,
// and the sockets in a row along the back. No mark on any key.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { box, type Box, disc, rbox, roundedSquare, slab } from "../kit.ts";

const W = 286;
const D = 122;
const BACK = 23;
const FRONT = 12.5;
const SLOPE = (Math.atan2(BACK - FRONT, D) * 180) / Math.PI;

/** The body: the outline raised to the slope. */
function shell() {
  const g = slab(roundedSquare(W, D, 9, 8), BACK - 3, 2.2, { curve: 8, bevelSeg: 3 });
  const pos = g.getAttribute("position");
  const top = BACK - 3;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / top;
    const height = FRONT - 3 + ((BACK - FRONT) * (D / 2 - pos.getZ(i))) / D;
    pos.setY(i, t * height);
  }
  g.deleteAttribute("normal");
  return toCreasedNormals(g, (35 * Math.PI) / 180);
}

const ROWS: { z: number; h: number; keys: number[] }[] = [
  // the function row is shorter, as on the real ones; the sizes are key widths
  { z: -44, h: 9.8, keys: Array<number>(15).fill(1) },
  { z: -30, h: 13.6, keys: [...Array<number>(13).fill(1), 2] },
  { z: -14.8, h: 13.6, keys: [1.5, ...Array<number>(12).fill(1), 1.5] },
  { z: 0.4, h: 13.6, keys: [1.75, ...Array<number>(11).fill(1), 2.25] },
  { z: 15.6, h: 13.6, keys: [2.25, ...Array<number>(10).fill(1), 1.75, 1] },
  { z: 30.8, h: 13.6, keys: [1, 1, 1, 1, 6, 1, 1, 1, 1, 1] },
];

/** One keyboard deck, with its lights over the right-hand keys. The whole deck is drawn on the slope. */
function keyboardComputer(m: Box, { lights }: { lights: readonly (readonly [number, "led-power" | "led-red"])[] }) {
  m.add("band-grey", slab(roundedSquare(W, D, 9, 8), 3.6, 0.8, { curve: 8, bevelSeg: 2 }), [0, 0, 0]);
  m.add("deck-white", shell(), [0, 3, 0]);
  const middle = (FRONT + BACK) / 2;
  const frame = new THREE.Matrix4().makeTranslation(0, middle, 0).multiply(new THREE.Matrix4().makeRotationX((SLOPE * Math.PI) / 180));
  const u = 18.1;
  const cz = 6;
  ROWS.forEach((row) => {
    const total = row.keys.reduce((a, b) => a + b, 0) * u;
    let x = -total / 2;
    row.keys.forEach((k) => {
      const kw = k * u;
      m.add("deck-white", rbox(kw - 2.8, 2.6, row.h, 1.5, 1), [x + kw / 2, 0.7, cz + row.z], [0, 0, 0], { frame });
      x += kw;
    });
  });
  // the gap the keys stand in shows as a soft grey well
  m.add("deck-well", rbox(274, 0.3, 94, 3, 1), [0, 0.03, cz - 6.6], [0, 0, 0], { frame });
  for (const [x, material] of lights) m.add(material, disc(0.8, 12), [x, 0.08, -53], [-90, 0, 0], { frame });
  return m;
}

/** A row of the same sockets along the back, whose face is at z = -D/2. `seen` runs left to right for someone behind the box. */
function back(m: Box, list: readonly (readonly [number, number, number])[]) {
  const b = -D / 2;
  const y = 11.5;
  for (const [seen, w, h] of list) m.add("hole", rbox(w, h, 1, Math.min(w, h) / 2 - 0.1, 2), [-seen, y, b + 0.3]);
}

const SOCKETS: readonly (readonly [number, number, number])[] = [
  [-95, 52, 6], // the 40-pin header's opening
  [-48, 13, 2.2], // the card
  [-30, 7, 3.2], // two micro HDMI
  [-17, 7, 3.2],
  [-3, 9, 3.4], // USB-C
  [14, 14, 6], // USB
  [32, 14, 6],
  [50, 14, 6],
  [72, 16, 13], // network
];

/** The keyboard computer of 2020. */
export function pi400(m: Box) {
  keyboardComputer(m, {
    lights: [
      [116, "led-power"],
      [122, "led-red"],
      [128, "led-power"],
    ],
  });
  m.printFace("deck", [0, 13, D / 2 + 0.05], [0, 0, 0], 80, 6);
  back(m, SOCKETS);
  m.add("usb-blue", box(11, 1.8, 0.6), [-14, 10.6, -D / 2 - 0.1]);
  m.add("usb-blue", box(11, 1.8, 0.6), [-32, 10.6, -D / 2 - 0.1]);
  return m;
}

/** The keyboard computer of 2024. */
export function pi500(m: Box) {
  keyboardComputer(m, { lights: [[130, "led-power"]] });
  m.printFace("deck", [0, 13, D / 2 + 0.05], [0, 0, 0], 80, 6);
  back(m, SOCKETS);
  m.add("usb-blue", box(11, 1.8, 0.6), [-32, 10.6, -D / 2 - 0.1]);
  m.add("usb-blue", box(11, 1.8, 0.6), [-50, 10.6, -D / 2 - 0.1]);
  return m;
}
