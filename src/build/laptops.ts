// More computers from their published sizes: the flat small desktop, the tall tower with its lattice, the all-in-one on its stand, and the laptops with a notch,
// open at a natural angle. No marks. The screens are painted by the viewer (screens.ts).
import * as THREE from "three";
import { type Box, box, cyl, disc, holes, type Material, rbox, roundedSquare, slab, tube, type Vec3 } from "./kit.ts";
import { mouth, perforation } from "./macs.ts";
import { litScreen } from "./screens.ts";

/** A flat small desktop: 197 by 197 by 36 mm, a black disc under it, a dark vent over the ports at the back, one light in front. */
export function macMiniFlat(m: Box) {
  const w = 197;
  const h = 36;
  const F = w / 2;
  m.add("alu", slab(roundedSquare(w, w, 28, 16), h - 2, 3, { curve: 16, bevelSeg: 5 }), [0, 2, 0]);
  m.add("plastic-black", cyl(84, 2, 96), [0, 1, 0]);
  m.printFace("lid", [0, h + 0.04, 0], [-90, 0, 0], 90, 18);
  m.add("led-white", disc(0.9, 16), [86, 14, F + 0.02]);
  const b = -F;
  const seen = (x: number) => -x;
  // the vent, then the ports along the bottom of the back
  m.add("plastic-black", rbox(170, 8, 0.6, 2, 2), [0, 27, b - 0.05]);
  perforation(m, "vent", [0, 27, b - 0.4], [0, 180, 0], 164, 6, 110, 4, 60, "alu-dark");
  mouth(m, b, seen(-82), 14, 14, 12, 4.5);
  for (const x of [-52, -36]) mouth(m, b, seen(x), 14, 8.6, 3.1);
  mouth(m, b, seen(-66), 14, 12, 9.4, 1);
  mouth(m, b, seen(-16), 14, 15, 5.6, 1.2);
  for (const x of [6, 26]) {
    mouth(m, b, seen(x), 14, 13.4, 5.8, 0.4);
  }
  m.add("hole", disc(1.9, 20), [seen(46), 14, b - 0.05], [0, 180, 0]);
  return m;
}

/** A tall workstation: 218 wide, 450 deep, 529 tall, a lattice front and back, steel handles on top and steel feet. */
export function macPro(m: Box) {
  const W = 218;
  const L = 450;
  const foot = 26;
  const top = 500;
  const H = top - foot;
  const F = L / 2;
  m.add("alu", slab(roundedSquare(W, L, 18, 10), H, 4, { curve: 10, bevelSeg: 4 }), [0, foot, 0]);
  // a rounded steel foot at each corner
  for (const [x, z] of [
    [-W / 2 + 34, -F + 50],
    [W / 2 - 34, -F + 50],
    [-W / 2 + 34, F - 50],
    [W / 2 - 34, F - 50],
  ]) {
    m.add("steel", cyl(16, foot - 8, 28, 18), [x, (foot - 8) / 2 + 8, z]);
    m.add("steel", cyl(22, 7, 32, 16), [x, 4.5, z]);
    m.add("rubber", cyl(21, 1, 24), [x, 0.5, z]);
  }
  // the lattice: rows of round holes, each with a little steel showing inside
  const lattice = (z: number, turn: Vec3) => {
    const at: Vec3 = [0, foot + H / 2, z];
    const cols = 13;
    const pitch: [number, number] = [15.4, 13.3];
    const rows = Math.floor((H - 18) / pitch[1]);
    const keep = (x: number) => Math.abs(x) < W / 2 - 10;
    holes(m, { at, turn, cols, rows, pitch, r: 6.1, stagger: true, keep, seg: 8 });
    // the steel showing inside a hole, on the front only: the back is seen far less
    if (z > 0)
      holes(m, { at: [at[0], at[1] + 1.8, z + 0.1], turn, cols, rows, pitch, r: 2.1, stagger: true, keep, material: "alu-dark", seg: 5 });
  };
  lattice(F + 0.03, [0, 0, 0]);
  lattice(-F - 0.03, [0, 180, 0]);
  // two steel handles across the top, the latch and the two ports between them
  for (const z of [-F + 70, F - 70]) {
    const bar: Vec3[] = [
      [-W / 2 + 22, top - 2, z],
      [-W / 2 + 22, top + 20, z],
      [-W / 2 + 36, top + 29, z],
      [W / 2 - 36, top + 29, z],
      [W / 2 - 22, top + 20, z],
      [W / 2 - 22, top - 2, z],
    ];
    m.add("steel", tube(bar, 7.5, 28, 10), [0, 0, 0]);
  }
  m.add("steel", cyl(28, 2, 40), [0, top + 1, 0]);
  m.add("alu-dark", box(44, 2, 6), [0, top + 2.4, 0]);
  m.add("hole", rbox(9, 1, 3.4, 1.4, 2), [-56, top - 0.1, 0]);
  m.add("hole", rbox(9, 1, 3.4, 1.4, 2), [-42, top - 0.1, 0]);
  m.add("steel", cyl(4, 1, 20), [58, top + 0.3, 0]);
  // the right-hand side
  m.printFace("side", [W / 2 + 0.2, foot + H / 2, 0], [0, 90, 0], 180, 36);
  return m;
}

/** A 24-inch all-in-one: 547 wide, 461 tall, 147 deep: a thin panel with its pale glass, a coloured chin under the picture, an L-shaped stand. */
export function iMac24(m: Box) {
  const W = 547;
  const PH = 392; // the panel's height: the picture, thin glass round it, the chin
  const T = 11.5;
  const y0 = 69;
  const lean = 5;
  const frame = new THREE.Matrix4().makeTranslation(0, y0, 18).multiply(new THREE.Matrix4().makeRotationX((-lean * Math.PI) / 180));
  m.panelFrame = frame;
  const add = (material: Material, geometry: THREE.BufferGeometry, at: Vec3, turn: Vec3 = [0, 0, 0]) => m.add(material, geometry, at, turn, { frame });
  const upright: Vec3 = [90, 0, 0];
  // the back and edges in the colour, then the glass over the top of the panel and the chin
  add("shell-deep-blue", slab(roundedSquare(W, PH, 12, 8), T - 0.6, 2, { curve: 8, bevelSeg: 2 }), [0, PH / 2, -T], upright);
  const chin = 73;
  m.panelSize = { W, H: PH, chin, T };
  add(
    "pale-glass",
    slab(roundedSquare(W - 2, PH - chin, 9, 6), 0.8, 0.1, { curve: 6, bevelSeg: 1 }),
    [0, chin + (PH - chin) / 2 - 0.5, -0.7],
    upright,
  );
  add("shell-deep-blue", box(W - 2, chin, 0.4), [0, chin / 2, -0.2]);
  // the picture: 4480 by 2520 pixels, 521 by 293 mm, and the camera over it
  litScreen(m, [0, chin + (PH - chin) / 2, 0.5], [0, 0, 0], 521, 293, { frame });
  add("hole", disc(1.6, 16), [0, PH - 6, 0.5]);
  // the back
  m.printFace("back", [0, PH / 2 + 12, -T - 0.04], [0, 180, 0], 160, 32, frame);
  // the stand: a flat foot on the desk, the arm up to the hinge behind the panel
  const SW = 130;
  m.add("shell-deep-blue", slab(roundedSquare(SW, 147, 8, 6), 4, 1, { curve: 6, bevelSeg: 2 }), [0, 0, 0]);
  m.add("shell-deep-blue", rbox(SW, 192, 5, 2, 2), [0, 96, -56], [-17, 0, 0]);
  m.add("shell-deep-blue", rbox(SW - 10, 30, 12, 3, 2), [0, 182, -22], [0, 0, 0]);
  m.add("hole", disc(14, 24), [0, 56, -71.5], [17, 180, 0]);
  return m;
}

/** The keys, by row: `rows` of key widths, u the width of one, placed from `kz` along +z. */
function keys(m: Box, top: number, kz: number, rows: readonly KeyRow[], u: number) {
  for (const row of rows) {
    const total = row.keys.reduce((a, b) => a + b, 0) * u;
    let x = -total / 2;
    row.keys.forEach((k, index) => {
      const kw = k * u;
      if (row.arrows && index === row.keys.length - 1) {
        const third = kw / 3;
        m.add("key", rbox(third - 2.4, 1, row.h, 1.4, 1), [x + third / 2, top + 0.6, kz + row.z]);
        m.add("key", rbox(third - 2.4, 1, row.h / 2 - 1.2, 1, 1), [x + third * 1.5, top + 0.6, kz + row.z - row.h / 4]);
        m.add("key", rbox(third - 2.4, 1, row.h / 2 - 1.2, 1, 1), [x + third * 1.5, top + 0.6, kz + row.z + row.h / 4]);
        m.add("key", rbox(third - 2.4, 1, row.h, 1.4, 1), [x + third * 2.5, top + 0.6, kz + row.z]);
      } else m.add("key", rbox(kw - 2.4, 1, row.h, 1.4, 1), [x + kw / 2, top + 0.6, kz + row.z]);
      x += kw;
    });
  }
}

interface KeyRow {
  z: number;
  h: number;
  keys: number[];
  arrows?: boolean;
}

const ROWS: KeyRow[] = [
  { z: -46, h: 12.2, keys: Array<number>(14).fill(1.035) },
  { z: -31.5, h: 15.2, keys: [...Array<number>(13).fill(1), 1.5] },
  { z: -14.3, h: 15.2, keys: [1.5, ...Array<number>(13).fill(1)] },
  { z: 2.9, h: 15.2, keys: [1.8, ...Array<number>(11).fill(1), 1.7] },
  { z: 20.1, h: 15.2, keys: [2.3, ...Array<number>(10).fill(1), 2.2] },
  { z: 37.3, h: 15.2, keys: [1, 1, 1, 1.25, 5.2, 1.25, 1, 3], arrows: true },
];

/**
 * A laptop with a notch: `w`, `d`, `h` its published size, `shell` its colour. The tall kind (`pro`) has a black well and speaker grilles beside the keys; the thin kind has neither
 * and keeps its keys in the deck. Sockets as on the real ones, down the two sides. The lid opens to 112 degrees.
 */
export function macbookNotch(m: Box, { w, d, h, shell, pro, screen, radius, lid = 5, u, notch = 30 }: { w: number; d: number; h: number; shell: Material; pro: boolean; screen: [number, number]; radius: number; lid?: number; u: number; notch?: number }) {
  m.add(shell, slab(roundedSquare(w, d, radius, 10), h, pro ? 3.4 : 2.4, { curve: 10, bevelSeg: 4 }), [0, 0, 0]);
  for (const [x, z] of [
    [-w / 2 + 24, -d / 2 + 22],
    [w / 2 - 24, -d / 2 + 22],
    [-w / 2 + 24, d / 2 - 22],
    [w / 2 - 24, d / 2 - 22],
  ])
    m.add("rubber", cyl(pro ? 7 : 4, 1, 18), [x, -0.3, z]);
  const top = h;
  const keysWide = 14.5 * u;
  const kz = -d / 2 + 76;
  m.add("plastic-black", rbox(keysWide + 8, 0.4, 118, 2.4, 1), [0, top - 0.1, kz - 2]);
  keys(m, top, kz, ROWS, u);
  // the power key is a black key; the Pro's speakers run down both sides
  if (pro) {
    const gap = w / 2 - (keysWide + 8) / 2;
    for (const [name, x] of [
      ["speakl", -w / 2 + gap / 2],
      ["speakr", w / 2 - gap / 2],
    ] as const)
      perforation(m, name, [x, top + 0.04, kz - 2], [-90, 0, 0], gap - 8, 116, 8, 66, 64, shell);
  }
  // the trackpad, a hair lower than the deck, and the notch for a finger at the front
  const padW = pro ? 148 * (w / 312.6) : 134;
  const padD = pro ? 92 : 82;
  m.add("hole", rbox(padW + 1, 0.2, padD + 1, 6, 2), [0, top + 0.02, d / 2 - padD / 2 - 8]);
  m.add(shell, rbox(padW, 0.3, padD, 5.6, 2), [0, top + 0.06, d / 2 - padD / 2 - 8]);
  m.add("hole", rbox(52, 3, 2, 1, 2), [0, h / 2, d / 2 - 0.4]);
  // sockets: MagSafe, then Thunderbolt on the left; a Pro has Thunderbolt, HDMI and the card's slot on the right, an Air the sound jack
  const side = (x: number, z: number, zw: number, zh = 3.1) => m.add("hole", rbox(1, zh, zw, Math.min(zh, zw) / 2 - 0.1, 2), [x, h / 2, z]);
  const left = -w / 2 + 0.3;
  const right = w / 2 - 0.3;
  side(left, -82, 13, 3.4);
  side(left, -62, 8.6);
  side(left, -48, 8.6);
  if (pro) {
    side(left, -34, 3.6, 3.6);
    side(right, -74, 24, 2.2);
    side(right, -46, 15, 5.2);
    side(right, -30, 8.6);
  } else m.add("hole", disc(1.8, 16), [w / 2 + 0.05, h / 2, -72], [0, 90, 0]);
  // the lid, drawn closed and turned open about the hinge
  const L = d - 3;
  const frame = new THREE.Matrix4()
    .makeTranslation(0, h + 0.4, -d / 2 + 3)
    .multiply(new THREE.Matrix4().makeRotationX((-112 * Math.PI) / 180));
  m.lidFrame = frame;
  m.lidLength = L;
  m.add(shell, slab(roundedSquare(w, L, radius, 10), lid, 1.5, { curve: 10, bevelSeg: 3 }), [0, 0, L / 2], [0, 0, 0], { frame });
  m.add("bezel", rbox(w - 2, 0.6, L - 2, radius - 1, 2), [0, -0.2, L / 2], [0, 0, 0], { frame });
  // the outside of the lid, upright to someone behind it
  m.printFace("lid", [0, lid + 0.04, L / 2], [90, 180, 0], 120, 24, frame);
  // the hinge's dark bar
  m.add("plastic-black", cyl(4, w - 60, 20), [0, 0.2, 2], [0, 0, 90], { frame });
  // the picture and its notch, the top two corners of the picture rounded with the lid
  const [sw, sh] = screen;
  const below = 10;
  litScreen(m, [0, -0.8, L - below - sh / 2 + 3], [90, 0, 0], sw, sh, { frame, radius: 5 });
  m.lidScreen = { w: sw, h: sh, z: L - below - sh / 2 + 3 };
  m.add("bezel", rbox(notch, 0.4, 6.4, 2.6, 2), [0, -1, L - 3.2 - 2], [0, 0, 0], { frame });
  m.add("hole", disc(1.1, 16), [0, -1.25, L - 5], [90, 0, 0], { frame });
  return m;
}

/** A thin 13-inch laptop: 304 by 215 by 11.3 mm, a dark blue shell, a 13.6-inch picture. */
export const macbookAir13 = (m: Box) =>
  macbookNotch(m, {
    w: 304.1,
    d: 215,
    h: 11.3,
    shell: "shell-dark-blue",
    pro: false,
    screen: [287, 180],
    radius: 13,
    u: 18.6,
  });

/** A 14-inch laptop: 312.6 by 221.2 by 15.5 mm, graphite, black keys in a black well between the speakers. */
export const macbookPro14 = (m: Box) =>
  macbookNotch(m, {
    w: 312.6,
    d: 221.2,
    h: 15.5,
    shell: "shell-graphite",
    pro: true,
    screen: [302, 196],
    radius: 12,
    lid: 6,
    u: 18.3,
  });

/** A 16-inch laptop: 355.7 by 248.1 by 16.8 mm, silver, the keys a little wider apart. */
export const macbookPro16 = (m: Box) =>
  macbookNotch(m, {
    w: 355.7,
    d: 248.1,
    h: 16.8,
    shell: "alu",
    pro: true,
    screen: [345, 223],
    radius: 13,
    lid: 6,
    u: 18.8,
  });
