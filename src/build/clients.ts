// The things that connect to a computer: a streaming stick and its remote, a flat TV on its feet, an Android tablet and phone, a monitor and a browser window.
import * as THREE from "three";
import { type Box, box, cyl, disc, type Material, rbox, ring, roundedSquare, slab, type Vec3 } from "./kit.ts";
import { litScreen } from "./screens.ts";
import { standing, type SlabOptions } from "./tablets.ts";

const upright: Vec3 = [90, 0, 0];

/** A streaming stick lying on the desk with its HDMI plug, and its remote beside it. */
export function clientFireTv(m: Box) {
  m.add("plastic-black", slab(roundedSquare(86, 30, 8, 8), 14, 3, { curve: 8, bevelSeg: 3 }), [0, 0, -26]);
  m.add("steel", rbox(14, 4.8, 10.4, 0.5, 1), [50, 7, -26]);
  m.add("hole", box(0.4, 3.2, 8.8), [57.05, 7, -26]);
  m.add("led-white", disc(0.9, 12), [-34, 14.03, -26], [-90, 0, 0]);
  m.add("hole", rbox(1, 3, 8.6, 1.2, 1), [-43.05, 7, -26]);
  // the remote: long, with its round ring of keys and a few buttons
  const rx = -6;
  m.add("plastic-char", slab(roundedSquare(130, 38, 14, 10), 10, 2.6, { curve: 10, bevelSeg: 3 }), [rx, 0, 22]);
  const top = 10.02;
  const ringX = rx + 30;
  m.add("plastic-gloss", ring(5.5, 13, 28), [ringX, top, 22], [-90, 0, 0]);
  m.add("plastic-grey", disc(5.2, 20), [ringX, top + 0.02, 22], [-90, 0, 0]);
  for (const [x, z] of [
    [rx + 2, 13],
    [rx + 2, 22],
    [rx + 2, 31],
    [rx - 14, 13],
    [rx - 14, 22],
    [rx - 14, 31],
    [rx - 30, 22],
  ])
    m.add("plastic-gloss", cyl(3, 0.6, 16), [x, top + 0.2, z]);
  m.add("led-blue", disc(0.8, 10), [rx + 50, top + 0.02, 22], [-90, 0, 0]);
  return m;
}

/** A flat TV: 1230 by 710 mm, a very thin dark frame, two blade feet out to the sides. */
export function clientAndroidTv(m: Box) {
  const W = 1230;
  const H = 710;
  const y0 = 60;
  const T = 30;
  m.tvFacts = { W, H, y0 };
  const body = (material: Material, geometry: THREE.BufferGeometry, at: Vec3, turn: Vec3 = [0, 0, 0]) => m.add(material, geometry, at, turn);
  body("tv-frame", slab(roundedSquare(W, H, 5, 3), T, 4, { curve: 3, bevelSeg: 1 }), [0, y0 + H / 2, -T], upright);
  body("bezel", box(W - 3, H - 3, 0.6), [0, y0 + H / 2, 0.1]);
  litScreen(m, [0, y0 + H / 2, 1.6], [0, 0, 0], W - 16, (W - 16) * (9 / 16));
  for (const side of [-1, 1]) {
    const x = (side * W) / 2 - side * 170;
    // a foot: a thin bar running from behind the screen forward and out
    body("alu-dark", rbox(14, y0 + 6, 16, 2, 1), [x, (y0 + 6) / 2, -12], [12, 0, side * -10]);
    body("alu-dark", rbox(18, 8, 240, 2, 1), [x + side * 22, 4, -6], [0, side * 12, 0]);
  }
  body("led-white", disc(1.6, 12), [0, y0 + 4, 1.1]);
  return m;
}

/** An Android tablet: 254 by 166 by 6 mm, 16 by 10, dark, a camera in the long edge. */
export const androidTablet: SlabOptions = {
  w: 254,
  h: 166,
  t: 6.2,
  r: 9,
  shell: "shell-dark-blue",
  screen: [239, 149],
  glassR: 3,
  back: (add, { w, h, t }) => {
    add("shell-graphite", slab(roundedSquare(12, 24, 5, 6), 1, 0.3, { curve: 6, bevelSeg: 1 }), [-w / 2 + 16, h - 18, -t - 1], upright);
    add("black-glass", disc(3.4, 16), [-w / 2 + 16, h - 13, -t - 1.02], [0, 180, 0]);
    add("black-glass", disc(3.4, 16), [-w / 2 + 16, h - 23, -t - 1.02], [0, 180, 0]);
  },
};

/** An Android phone: 162 by 75 by 8 mm, the round front camera in the middle at the top, a strip of cameras on the back. */
export const androidPhone: SlabOptions = {
  w: 75,
  h: 162,
  t: 8,
  r: 8,
  shell: "plastic-grey",
  screen: [71, 153.8],
  kind: "phone",
  lean: 16,
  glassR: 5,
  back: (add, { w, h, t }) => {
    add("shell-graphite", slab(roundedSquare(14, 40, 6, 6), 1, 0.3, { curve: 6, bevelSeg: 1 }), [-w / 2 + 13, h - 28, -t - 1], upright);
    for (const dy of [-13, 0, 13]) add("black-glass", disc(4, 16), [-w / 2 + 13, h - 28 + dy, -t - 1.02], [0, 180, 0]);
  },
};

export function clientAndroidPhone(m: Box, stand = true) {
  standing(m, androidPhone, stand);
  m.add("hole", disc(1.8, 14), [0, androidPhone.h - 6, 0.32], [0, 0, 0], { frame: m.slabFacts?.frame });
  return m;
}

/** A computer's monitor: 24 inches, a thin dark frame on a plain stand. */
export function clientComputer(m: Box) {
  const W = 540;
  const H = 322;
  const T = 16;
  const y0 = 105;
  const frame = new THREE.Matrix4().makeTranslation(0, y0, 20).multiply(new THREE.Matrix4().makeRotationX((-4 * Math.PI) / 180));
  m.panelFrame = frame;
  m.panelSize = { W, H, T, chin: 0 };
  const add = (material: Material, geometry: THREE.BufferGeometry, at: Vec3, turn: Vec3 = [0, 0, 0]) => m.add(material, geometry, at, turn, { frame });
  add("tv-frame", slab(roundedSquare(W, H, 5, 4), T, 3, { curve: 4, bevelSeg: 1 }), [0, H / 2, -T], upright);
  add("bezel", box(W - 2, H - 2, 0.5), [0, H / 2, 0.1]);
  litScreen(m, [0, H / 2 + 3, 1], [0, 0, 0], W - 14, (W - 14) * (9 / 16), { frame });
  m.add("alu-dark", slab(roundedSquare(220, 170, 12, 6), 8, 1.2, { curve: 6, bevelSeg: 1 }), [0, 0, 0]);
  m.add("alu-dark", rbox(70, 200, 22, 4, 2), [0, 100, -30], [-6, 0, 0]);
  m.add("led-white", disc(1.2, 10), [W / 2 - 16, y0 + 3.2, 21], [0, 0, 0]);
  return m;
}

/** A browser window, standing on nothing: the frame with its three dots, the address bar and a page. */
export function clientBrowser(m: Box) {
  const W = 300;
  const H = 210;
  const y0 = 4;
  const bar = 22;
  m.windowSize = { W, H, y0, bar };
  m.add("browser-bar", slab(roundedSquare(W, H, 9, 6), 4, 1, { curve: 6, bevelSeg: 1 }), [0, y0 + H / 2, -4], upright);
  for (const [i, led] of (["led-red", "led-amber", "led-power"] as const).entries())
    m.add(led, disc(3, 14), [-W / 2 + 15 + i * 12, y0 + H - bar / 2, 0.05]);
  m.add("plastic-black", rbox(W - 96, 11, 0.4, 3.5, 2), [24, y0 + H - bar / 2, 0.15]);
  litScreen(m, [0, y0 + (H - bar) / 2 + 4, 0.4], [0, 0, 0], W - 8, H - bar - 8, { radius: 5 });
  return m;
}

