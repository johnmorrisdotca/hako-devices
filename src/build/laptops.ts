// The laptops with a notch, from their published sizes,
// open at a natural angle. No marks. The screens are painted by the viewer (screens.ts).
import * as THREE from "three";
import { type Box, cyl, disc, type Material, rbox, roundedSquare, slab } from "./kit.ts";
import { perforation } from "./macs.ts";
import { litScreen } from "./screens.ts";

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
  // A notch of 0: an older screen, the camera in the black glass above the picture.
  if (notch > 0) m.add("bezel", rbox(notch, 0.4, 6.4, 2.6, 2), [0, -1, L - 3.2 - 2], [0, 0, 0], { frame });
  m.add("hole", disc(1.1, 16), [0, -1.25, L - 5], [90, 0, 0], { frame });
  return m;
}

/** A laptop of no notch and plain sides, for a body drawn only from its size. */
export const laptopNoNotch = (m: Box, { w, d, h, shell, screen, u }: { w: number; d: number; h: number; shell: Material; screen: readonly [number, number]; u: number }) =>
  macbookNotch(m, { w, d, h, shell, pro: false, screen: [screen[0], screen[1]], radius: 6, lid: 5, u, notch: 0 });

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

/** The same laptops in their other colours. */
export const macbookAir13Silver = (m: Box) => macbookNotch(m, { w: 304.1, d: 215, h: 11.3, shell: "alu", pro: false, screen: [287, 180], radius: 13, u: 18.6 });
export const macbookPro14Silver = (m: Box) => macbookNotch(m, { w: 312.6, d: 221.2, h: 15.5, shell: "alu", pro: true, screen: [302, 196], radius: 12, lid: 6, u: 18.3 });
export const macbookPro16Black = (m: Box) => macbookNotch(m, { w: 355.7, d: 248.1, h: 16.8, shell: "shell-graphite", pro: true, screen: [345, 223], radius: 13, lid: 6, u: 18.8 });

/** The old 17-inch laptop: 392 by 265 by 25.9 mm, silver, no notch. */
export const macbookPro17 = (m: Box) => macbookNotch(m, { w: 392, d: 265, h: 25.9, shell: "alu", pro: true, screen: [367, 229], radius: 8, lid: 6, u: 18.8, notch: 0 });
