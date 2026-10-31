// The Macs before the iMac, and the specials: each from its published size, its parts placed from photographs of it. Many models share these bodies. Plain geometry, nothing traced, no mark.
import { lean, type DeskSpec, block, onFace, type Piece, sliced } from "../desk.ts";
import type { Material } from "../kit.ts";

type Face = ReturnType<typeof onFace>;

const BEIGE: Material = "plastic-beige";
const PLATINUM: Material = "plastic-platinum";

/** A row of upright ribs along a base, as most of the beige Macs have. */
const ribs = (f: Face, y: number, w: number, h: number): Piece => f.mark("dark", 0, y, 1.4, h, { cols: Math.floor(w / 5), gap: 3.6 });

/** The back of a beige Mac as a list of its sockets, left to right as seen from behind. */
const sockets = (b: Face, y: number, list: readonly (readonly [string, number])[]): Piece[] =>
  list.map(([kind, x]) => {
    if (kind === "db") return b.port(x, y, 34, 9, 2);
    if (kind === "din") return b.jack(x, y, 10);
    if (kind === "jack") return b.jack(x, y, 6);
    if (kind === "ac") return b.port(x, y, 28, 20, 2);
    if (kind === "net") return b.port(x, y, 13, 12, 1);
    if (kind === "scsi") return b.port(x, y, 46, 10, 2);
    return b.port(x, y, 12, 8, 1);
  });

interface Compact {
  W: number;
  D: number;
  H: number;
  mat: Material;
  plinth: number;
  bezel: readonly [number, number];
  picture: readonly [number, number];
  y: number;
  front: (f: Face) => Piece[];
  back: (b: Face) => Piece[];
  /** Rounder corners, on the later ones. */
  r?: number;
}

/** A compact Mac: an upright box tapering a little to its back, the handle in its top, the picture in a recess, the sockets low in its back. */
function compact({ W, D, H, mat, plinth, bezel, picture, y, front, back, r = 6 }: Compact): DeskSpec {
  const F = D / 2;
  const body = H - plinth;
  const f = onFace("front", F);
  const b = onFace("back", -F + 3);
  return {
    pieces: [
      block(mat, 0, 0, W - 8, D - 10, 0, plinth + 4),
      {
        is: "loft",
        mat,
        rings: [
          { z: F, w: W, h: body, y: plinth + body / 2, r },
          { z: F - 90, w: W, h: body, y: plinth + body / 2, r: r + 2 },
          { z: -F + 3, w: W - 12, h: body - 10, y: plinth + body / 2 - 3, r: r + 6 },
        ],
      },
      f.mark("panel", 0, y, bezel[0], bezel[1], { r: 6, mat: "plastic-grey" }),
      { is: "screen", at: [0, y, F + 0.3], w: picture[0], h: picture[1], radius: 10, kind: "panel" },
      ...front(f),
      // the grip in its top
      onFace("top", H - 6.5).mark("slot", 0, -F + 50, 130, 16, { r: 7 }),
      ...back(b),
    ],
    prints: [{ id: "front", at: [0, plinth + 18, F + 0.3], turn: [0, 0, 0], w: W * 0.5, h: 14 }],
  };
}

const oldBack = (b: Face): Piece[] => [
  b.mark("dark", 0, 300, 180, 2, { rows: 5, gapY: 4 }),
  b.mark("dark", 0, 100, 180, 2, { rows: 4, gapY: 4 }),
  ...sockets(b, 42, [["ac", -82], ["din", -52], ["db", -26], ["din", 6], ["din", 22], ["db", 52]]),
];

export const MAC_128K = compact({
  W: 243.8,
  D: 276.9,
  H: 345.4,
  mat: BEIGE,
  plinth: 12,
  bezel: [205, 165],
  picture: [175, 130],
  y: 240,
  front: (f) => [f.mark("dark", 0, 130, 225, 1.4), f.mark("slot", 42, 82, 92, 5, { r: 2 }), f.mark("dark", 0, 28, 225, 1.4)],
  back: oldBack,
});

export const MAC_SE = compact({
  W: 246.1,
  D: 276.9,
  H: 345.4,
  mat: PLATINUM,
  plinth: 22,
  bezel: [205, 165],
  picture: [175, 130],
  y: 240,
  front: (f) => [
    ribs(f, 11, 200, 18),
    // two drive slots among four long grooves, as in the photograph
    f.mark("slot", 42, 128, 92, 4, { r: 1 }),
    f.mark("slot", 42, 72, 92, 4, { r: 1 }),
    f.mark("dark", 0, 100, 220, 1.2, { rows: 4, gapY: 9 }),
    f.round("dark", 98, 128, 3),
    f.round("dark", 98, 72, 3),
  ],
  back: (b) => [
    b.mark("dark", 0, 300, 180, 2, { rows: 6, gapY: 4 }),
    ...sockets(b, 50, [["ac", -82], ["din", -52], ["din", -36], ["scsi", -4], ["din", 30], ["din", 46], ["jack", 62], ["din", 80]]),
  ],
});

export const MAC_CLASSIC = compact({
  W: 246.4,
  D: 284.5,
  H: 335.3,
  mat: PLATINUM,
  plinth: 8,
  bezel: [205, 165],
  picture: [175, 130],
  y: 232,
  r: 12,
  front: (f) => [f.mark("slot", 44, 98, 92, 4, { r: 1 }), f.mark("dark", 0, 62, 220, 1.2, { rows: 3, gapY: 9 }), f.round("dark", 100, 98, 3)],
  back: (b) => [b.mark("dark", 0, 298, 180, 2, { rows: 5, gapY: 4 }), ...sockets(b, 48, [["ac", -82], ["din", -48], ["din", -32], ["scsi", 0], ["din", 36], ["din", 54], ["jack", 72]])],
});

/** The Color Classic: a taller face with the picture in a deep wide recess, the slot and the buttons below it, a speaker in the base between two round feet. */
export const MAC_COLOR_CLASSIC: DeskSpec = (() => {
  const W = 251.5;
  const D = 320;
  const H = 368.3;
  const F = D / 2;
  const foot = 28;
  const f = onFace("front", F);
  const b = onFace("back", -F + 4);
  return {
    pieces: [
      block(PLATINUM, 0, -4, W - 10, D - 40, 0, foot + 4, { r: 30, edge: 4 }),
      { is: "loft", mat: PLATINUM, rings: [{ z: F, w: W, h: H - foot, y: foot + (H - foot) / 2, r: 6 }, { z: F - 60, w: W, h: H - foot, y: foot + (H - foot) / 2, r: 12 }, { z: -F + 4, w: W - 40, h: H - foot - 40, y: foot + (H - foot) / 2 - 8, r: 22 }] },
      f.mark("panel", 0, 232, 196, 150, { r: 6, mat: "plastic-grey" }),
      { is: "screen", at: [0, 232, F + 0.3], w: 168, h: 126, radius: 8 },
      f.mark("slot", 48, 112, 84, 4, { r: 1 }),
      f.mark("key", -56, 112, 9, 6, { cols: 2, gap: 2 }),
      f.mark("key", -16, 112, 9, 6, { cols: 2, gap: 2 }),
      f.round("light", -84, 112, 3),
      f.round("dark", 0, 16, 2.4, { cols: 14, rows: 3, gap: 4.4 }),
      onFace("top", H - 37).mark("slot", 0, -F + 62, 120, 14, { r: 6 }),
      ...sockets(b, 62, [["ac", -74], ["din", -44], ["din", -28], ["scsi", 2], ["db", 50]]),
    ],
    prints: [{ id: "front", at: [0, 60, F + 0.3], turn: [0, 0, 0], w: 100, h: 14 }],
  };
})();

/** The Lisa, and the Macintosh XL after it: wide, the picture to the left of the drive. */
export const LISA: DeskSpec = (() => {
  const W = 475;
  const D = 350.5;
  const H = 386.1;
  const F = D / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  return {
    pieces: [
      block(BEIGE, 0, 0, W, D, 0, H, { r: 8, edge: 3 }),
      ribs(f, 12, W - 20, 18),
      f.mark("panel", -82, 244, 262, 200, { r: 6, mat: "plastic-grey" }),
      { is: "screen", at: [-82, 244, F + 0.3], w: 220, h: 165, radius: 8, kind: "panel" },
      f.mark("shell", 150, 244, 110, 200, { r: 3, mat: BEIGE }),
      f.mark("slot", 150, 268, 92, 4, { r: 1, over: 1 }),
      f.round("key", 186, 60, 12),
      f.mark("dark", 0, 110, W - 20, 1.4),
      b.mark("dark", 0, 320, W - 80, 2, { rows: 6, gapY: 4 }),
      ...sockets(b, 60, [["ac", -180], ["db", -120], ["db", -70], ["din", -30], ["din", -10], ["db", 30], ["scsi", 90]]),
    ],
    prints: [{ id: "front", at: [0, 76, F + 0.3], turn: [0, 0, 0], w: 240, h: 20 }],
  };
})();

interface Box3 {
  W: number;
  D: number;
  H: number;
  mat?: Material;
  plinth?: number;
  /** How far the plinth stands in from the case. */
  inset?: number;
  r?: number;
  /** Ribs across the top and along the sides. */
  topRibs?: number;
  sideVents?: number;
  /** A curved plinth like a sledge's runners, the side of a later beige Mac. */
  runners?: boolean;
  front: (f: Face, base: number) => Piece[];
  back: (b: Face, base: number) => Piece[];
}

/** A beige box on a plinth: most of the desktop Macs from 1987 to 1998. */
function beigeBox({ W, D, H, mat = PLATINUM, plinth = 14, inset = 5, r = 2, topRibs = 0, sideVents = 0, runners = false, front, back }: Box3): DeskSpec {
  const F = D / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  const right = onFace("right", W / 2);
  const left = onFace("left", -W / 2);
  const top = onFace("top", H);
  return {
    pieces: [
      runners
        ? { is: "side", mat, w: W - inset * 2, points: [[F - 8, plinth + 1], [F - 8, 0], [F - 40, 0], [-F + 40, 0], [-F + 8, 0], [-F + 8, plinth + 1]] }
        : block(mat, 0, 0, W - inset * 2, D - inset * 2, 0, plinth + 1),
      block(mat, 0, 0, W, D, plinth, H, r > 0 ? { r, edge: 1.5 } : {}),
      ...(topRibs ? [top.mark("dark", 0, -F * 0.12, W - 60, 2, { rows: topRibs, gapY: 8 })] : []),
      ...(sideVents ? [right.mark("dark", -D * 0.12, plinth + (H - plinth) * 0.55, D * 0.55, 2, { rows: sideVents, gapY: 5 }), left.mark("dark", D * 0.12, plinth + (H - plinth) * 0.55, D * 0.55, 2, { rows: sideVents, gapY: 5 })] : []),
      ...front(f, plinth),
      ...back(b, plinth),
    ],
    prints: [{ id: "top", at: [0, H + 0.1, F * 0.3], turn: [-90, 0, 0], w: W * 0.5, h: 24 }],
  };
}

const slot35 = (f: Face, x: number, y: number): Piece[] => [f.mark("slot", x, y, 92, 4, { r: 1 }), f.round("dark", x + 52, y, 2.5)];
const cdDoor = (f: Face, x: number, y: number, w = 134): Piece[] => [f.mark("shell", x, y, w, 26, { r: 2, mat: PLATINUM }), f.mark("dark", x, y - 8, w - 12, 1, { over: 1 }), f.round("key", x + w / 2 - 12, y - 8, 4, { over: 1 })];
const power = (f: Face, x: number, y: number): Piece[] => [f.round("key", x, y, 9)];

export const MAC_II = beigeBox({
  W: 475,
  D: 365.8,
  H: 139.7,
  mat: BEIGE,
  plinth: 22,
  inset: 4,
  topRibs: 30,
  sideVents: 6,
  front: (f, base) => [
    ribs(f, base / 2, 460, 18),
    f.mark("dark", 0, 103, 466, 1.4),
    f.mark("dark", 0, 87, 466, 1.4),
    ...slot35(f, 54, 110),
    ...slot35(f, 170, 110),
    f.mark("dark", -170, 100, 10, 2),
  ],
  back: (b) => [
    b.mark("slot", 100, 92, 18, 70, { cols: 6, gap: 12 }),
    b.mark("dark", -60, 92, 120, 40),
    ...sockets(b, 42, [["ac", -200], ["din", -160], ["din", -140], ["scsi", -96], ["din", -50], ["din", -32], ["jack", -14]]),
  ],
});

export const MAC_IICX = beigeBox({
  W: 302.3,
  D: 365.8,
  H: 139.7,
  plinth: 10,
  inset: 3,
  topRibs: 20,
  sideVents: 6,
  front: (f) => [f.mark("dark", 0, 104, 296, 1.4), f.mark("dark", 0, 86, 296, 1.4), ...slot35(f, 58, 112), f.mark("dark", -130, 96, 8, 2), ...power(f, 128, 50)],
  back: (b) => [
    // measured off a photograph of a IIci: the two power sockets, the vent, the name plate, three card slots, and the row of sockets along the foot
    b.port(-116, 110, 30, 20, 2),
    b.port(-116, 80, 30, 20, 2),
    b.mark("dark", -46, 90, 3, 66, { cols: 10, gap: 4.4 }),
    b.mark("shell", 42, 94, 54, 60, { mat: PLATINUM }),
    b.mark("shell", 74, 92, 14, 68, { r: 1, mat: PLATINUM }),
    b.mark("slot", 96, 92, 14, 68),
    b.mark("shell", 116, 92, 14, 68, { r: 1, mat: PLATINUM }),
    ...sockets(b, 22, [["jack", -122], ["db", -80], ["scsi", -24], ["db", 26], ["din", 62], ["din", 78], ["jack", 92], ["din", 106], ["din", 122]]),
  ],
});

export const MAC_IISI = beigeBox({
  W: 315,
  D: 378.5,
  H: 101.6,
  plinth: 8,
  inset: 3,
  topRibs: 16,
  sideVents: 4,
  front: (f) => [f.mark("dark", 0, 62, 308, 1.4), ...slot35(f, 60, 74), f.mark("dark", -134, 72, 8, 2), ...power(f, 134, 34)],
  back: (b) => [b.port(-120, 62, 30, 20, 2), b.mark("slot", 100, 62, 40, 36), ...sockets(b, 20, [["db", -96], ["scsi", -42], ["din", 4], ["din", 20], ["jack", 36], ["din", 52], ["db", 92]])],
});

export const MAC_LC = beigeBox({
  W: 309.9,
  D: 388.6,
  H: 73.7,
  plinth: 4,
  inset: 2,
  r: 3,
  topRibs: 10,
  front: (f) => [...slot35(f, 60, 46), f.mark("dark", -130, 44, 8, 2), f.mark("dark", 0, 22, 300, 1.2), ...power(f, 132, 24)],
  back: (b) => [b.mark("slot", 104, 44, 60, 16), ...sockets(b, 22, [["ac", -128], ["db", -86], ["scsi", -36], ["din", 8], ["din", 24], ["jack", 40], ["jack", 54], ["db", 92]])],
});

export const MAC_CENTRIS_610 = beigeBox({
  W: 414,
  D: 396.2,
  H: 86.4,
  plinth: 6,
  inset: 2,
  r: 3,
  topRibs: 8,
  front: (f) => [...slot35(f, 90, 54), f.mark("shell", -80, 48, 134, 24, { r: 2 }), f.mark("dark", 0, 20, 404, 1.2), ...power(f, 186, 28), f.mark("dark", -186, 24, 8, 2)],
  back: (b) => [b.mark("slot", 150, 46, 80, 18), b.port(-180, 46, 30, 20, 2), ...sockets(b, 22, [["db", -130], ["scsi", -80], ["din", -38], ["din", -22], ["jack", -6], ["net", 14], ["db", 64]])],
});

export const MAC_IIVX = beigeBox({
  W: 330.2,
  D: 419.1,
  H: 152.4,
  plinth: 12,
  inset: 3,
  r: 3,
  sideVents: 6,
  topRibs: 10,
  front: (f) => [...cdDoor(f, 70, 118), ...slot35(f, 70, 80), f.round("dark", -56, 62, 2.2, { cols: 14, rows: 8, gap: 3.6 }), ...power(f, 150, 26), f.mark("dark", 0, 16, 320, 1.2)],
  back: (b) => [b.mark("slot", 100, 90, 18, 64, { cols: 3, gap: 12 }), b.port(-140, 108, 30, 20, 2), b.mark("dark", -60, 110, 60, 40), ...sockets(b, 34, [["db", -116], ["scsi", -60], ["din", -14], ["din", 2], ["jack", 18], ["net", 36], ["db", 78]])],
});

export const MAC_630 = beigeBox({
  W: 320,
  D: 419.1,
  H: 109.2,
  plinth: 14,
  inset: 1,
  r: 3,
  topRibs: 12,
  sideVents: 5,
  runners: true,
  front: (f, base) => [...cdDoor(f, -62, 72, 120), ...slot35(f, 62, 78), f.mark("key", 138, 62, 7, 5, { cols: 2, gap: 1 }), f.mark("panel", 138, 84, 18, 10), ...power(f, 138, 44), f.round("dark", 40, base + 4, 2, { cols: 18, gap: 2 })],
  back: (b) => [b.port(-130, 62, 28, 20, 2), b.mark("slot", 104, 62, 80, 22), ...sockets(b, 28, [["db", -96], ["scsi", -42], ["din", 4], ["din", 20], ["jack", 36], ["jack", 50], ["db", 88]])],
});

export const MAC_7200 = beigeBox({
  W: 365,
  D: 430,
  H: 156.2,
  plinth: 20,
  inset: 1,
  r: 3,
  topRibs: 8,
  sideVents: 6,
  runners: true,
  front: (f, base) => [...slot35(f, 90, 128), ...cdDoor(f, 90, 90, 140), f.round("dark", -116, 80, 2.2, { cols: 10, rows: 8, gap: 3.6 }), ...power(f, -140, base - 8), f.mark("dark", 0, base + 2, 355, 1.2)],
  back: (b) => [b.mark("slot", 110, 96, 18, 70, { cols: 3, gap: 12 }), b.port(-150, 112, 30, 20, 2), ...sockets(b, 40, [["db", -130], ["scsi", -76], ["din", -30], ["din", -14], ["jack", 2], ["net", 20], ["db", 62]])],
});

export const MAC_4400 = beigeBox({
  W: 384,
  D: 441.2,
  H: 137.9,
  plinth: 10,
  inset: 2,
  r: 3,
  topRibs: 8,
  front: (f) => [...cdDoor(f, -60, 86), ...slot35(f, 90, 92), f.round("dark", -150, 60, 2, { cols: 10, rows: 5, gap: 3.4 }), ...power(f, 170, 40), f.mark("dark", 0, 22, 370, 1.2)],
  back: (b) => [b.mark("slot", 120, 84, 60, 44), b.port(-160, 84, 30, 20, 2), ...sockets(b, 30, [["db", -130], ["scsi", -76], ["din", -30], ["din", -14], ["jack", 2], ["net", 20], ["db", 62]])],
});

/** The beige G3 desktop, from a photograph: a drive and zip door under a sloping top, a speaker to the left, ribs on its sides. */
export const MAC_G3_DESKTOP = beigeBox({
  W: 365.8,
  D: 429.3,
  H: 160,
  plinth: 18,
  inset: 1,
  r: 3,
  topRibs: 10,
  sideVents: 7,
  runners: true,
  front: (f, base) => [
    ...slot35(f, 88, 128),
    f.mark("shell", 88, 88, 174, 44, { r: 2 }),
    f.mark("shell", -26, 76, 110, 56, { r: 2 }),
    f.mark("dark", 88, 96, 150, 1.4, { over: 1 }),
    f.round("key", 152, 76, 6, { over: 1 }),
    ...slot35(f, -26, 84).slice(0, 1),
    f.round("dark", -130, 80, 2.2, { cols: 10, rows: 6, gap: 3.6 }),
    ...power(f, -130, base - 2),
    f.mark("dark", 0, base + 8, 356, 1.2),
  ],
  back: (b) => [b.mark("slot", 110, 100, 18, 80, { cols: 3, gap: 12 }), b.port(-150, 116, 30, 20, 2), ...sockets(b, 44, [["db", -130], ["scsi", -76], ["din", -30], ["din", -14], ["jack", 2], ["net", 20], ["db", 62]])],
});

interface Upright {
  W: number;
  D: number;
  H: number;
  mat?: Material;
  plinth?: number;
  front: (f: Face, base: number) => Piece[];
  back: (b: Face) => Piece[];
  sideVent?: boolean;
}

/** A beige tower: bays over a plain door, a strip beside them, on a plinth. */
function tower({ W, D, H, mat = PLATINUM, plinth = 12, front, back, sideVent }: Upright): DeskSpec {
  const F = D / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  const right = onFace("right", W / 2);
  return {
    pieces: [
      block(mat, 0, 0, W - 6, D - 8, 0, plinth + 1),
      block(mat, 0, 0, W, D, plinth, H, { r: 3, edge: 1.5 }),
      ...(sideVent ? [right.mark("dark", -D * 0.2, plinth + 30, D * 0.45, 2, { rows: 6, gapY: 5 })] : []),
      ...front(f, plinth),
      ...back(b),
    ],
    prints: [{ id: "side", at: [W / 2 + 0.1, H / 2, 0], turn: [0, 90, 0], w: D * 0.5, h: 40 }],
  };
}

const towerBack = (b: Face, H: number, base = 40): Piece[] => [
  b.mark("slot", 46, H - 120, 80, 12, { rows: 6, gapY: 8 }),
  b.port(-58, H - 60, 30, 20, 2),
  b.round("dark", -58, H - 130, 2.2, { cols: 12, rows: 12, gap: 4 }),
  ...sockets(b, base, [["db", -66], ["scsi", -14], ["din", 30], ["din", 46], ["jack", 62], ["net", 78]]),
];

export const MAC_QUADRA_800 = tower({
  W: 195.6,
  D: 400,
  H: 355.6,
  plinth: 10,
  front: (f) => [...cdDoor(f, -6, 318, 150), f.mark("dark", 0, 298, 186, 1.2), ...slot35(f, -6, 276), f.mark("dark", 0, 254, 186, 1.2), ...power(f, -78, 24), f.round("dark", -6, 60, 2.2, { cols: 18, rows: 4, gap: 3.6 })],
  back: (b) => towerBack(b, 355.6),
});

export const MAC_9500 = tower({
  W: 195.6,
  D: 400,
  H: 429.3,
  plinth: 10,
  sideVent: true,
  front: (f) => [...cdDoor(f, -10, 392, 150), f.mark("dark", -10, 372, 164, 1.2), ...slot35(f, -10, 348), f.mark("dark", -10, 322, 164, 1.2), f.mark("dark", -10, 278, 164, 1.2), f.mark("dark", 74, 216, 1.2, 412), ...power(f, 84, 34), f.round("light", 84, 56, 2)],
  back: (b) => towerBack(b, 429.3),
});

export const MAC_9600 = tower({
  W: 246.4,
  D: 439.4,
  H: 439.4,
  plinth: 12,
  sideVent: true,
  front: (f) => [...cdDoor(f, 0, 400, 150), f.mark("dark", 0, 380, 200, 1.2), ...slot35(f, 0, 356), f.mark("dark", 0, 328, 200, 1.2), ...power(f, 100, 40), f.round("dark", 0, 70, 2.2, { cols: 18, rows: 5, gap: 3.6 })],
  back: (b) => towerBack(b, 439.4),
});

export const MAC_6400 = tower({
  W: 198.1,
  D: 429.3,
  H: 406.4,
  plinth: 18,
  front: (f) => [...cdDoor(f, 0, 356, 140), ...slot35(f, 0, 316), f.mark("shell", 0, 262, 140, 36, { r: 4 }), f.round("dark", 0, 110, 2.2, { cols: 14, rows: 12, gap: 3.6 }), ...power(f, 78, 36)],
  back: (b) => towerBack(b, 406.4),
});

export const MAC_G3_TOWER = tower({
  W: 243.8,
  D: 452.1,
  H: 386.1,
  plinth: 14,
  front: (f) => [...cdDoor(f, 0, 350, 150), ...slot35(f, 0, 312), f.mark("shell", 0, 268, 150, 40, { r: 3 }), f.round("dark", -70, 60, 2.2, { cols: 10, rows: 6, gap: 3.6 }), ...power(f, 100, 34)],
  back: (b) => towerBack(b, 386.1),
});

/** The Quadra 900 and 950, from a photograph: a tall case, the key and two buttons in a strip beside the door, the drive high up and a grille at its foot. */
export const MAC_QUADRA_900 = tower({
  W: 226.1,
  D: 523.2,
  H: 472.4,
  plinth: 8,
  front: (f) => [
    f.mark("dark", -74, 240, 1.4, 460),
    f.mark("dark", 20, 362, 180, 1.4),
    ...slot35(f, 26, 410),
    f.mark("dark", 20, 388, 180, 1.4),
    f.round("key", -92, 384, 18),
    f.round("key", -92, 310, 10),
    f.round("key", -92, 284, 10),
    f.mark("dark", 20, 60, 176, 2, { rows: 17, gapY: 3.4 }),
  ],
  back: (b) => towerBack(b, 472.4, 44),
});

/** An all-in-one with a tube over a base of drives: the LC 520 and its kin, and in black the Macintosh TV. */
function allInOne(mat: Material): DeskSpec {
  const W = 342.9;
  const D = 419.1;
  const H = 454.7;
  const F = D / 2;
  const baseH = 150;
  const f = onFace("front", F);
  const b = onFace("back", -F + 2);
  return {
    pieces: [
      block(mat, 0, 0, W - 30, D - 30, 0, 20, { r: 16, edge: 2 }),
      {
        is: "loft",
        mat,
        rings: [
          { z: F, w: W, h: H - 20, y: 20 + (H - 20) / 2, r: 8 },
          { z: F - 90, w: W, h: H - 20, y: 20 + (H - 20) / 2, r: 12 },
          { z: -F + 90, w: W - 70, h: H - 100, y: 90 + (H - 100) / 2 - 20, r: 40 },
          { z: -F + 2, w: W - 120, h: H - 180, y: 160 + (H - 180) / 2 - 60, r: 50 },
        ],
      },
      f.mark("panel", 0, 320, 300, 226, { r: 8, mat: "plastic-grey" }),
      { is: "screen", at: [0, 320, F + 0.3], w: 272, h: 204, radius: 10 },
      ...cdDoor(f, -66, baseH - 44, 124),
      ...slot35(f, 76, baseH - 38),
      f.round("dark", 0, 40, 2.2, { cols: 34, rows: 4, gap: 3.8 }),
      ...power(f, 150, 80),
      ...sockets(b, 52, [["ac", -74], ["db", -36], ["scsi", 14], ["din", 58], ["din", 74]]),
    ],
    prints: [{ id: "front", at: [0, 66, F + 0.3], turn: [0, 0, 0], w: 120, h: 14 }],
  };
}

export const MAC_LC_520 = allInOne(PLATINUM);
export const MAC_TV = allInOne("plastic-char");

/** A CRT over a band of drives between two grilles, from a photograph of a Performa 5260, on a low swivel foot. The 5400s and 5500s are rounder and softer. */
function slabCrt({ W, D, H, soft }: { W: number; D: number; H: number; soft: boolean }): DeskSpec {
  const F = D / 2;
  const foot = 24;
  const bandTop = foot + 92;
  const f = onFace("front", F);
  const b = onFace("back", -F + 2);
  const r = soft ? 20 : 8;
  return {
    pieces: [
      block(PLATINUM, 0, 8, W - 60, D - 80, 0, foot + 2, { r: 18, edge: 2 }),
      {
        is: "loft",
        mat: PLATINUM,
        rings: [
          { z: F, w: W, h: H - foot, y: foot + (H - foot) / 2, r },
          { z: F - 70, w: W, h: H - foot, y: foot + (H - foot) / 2, r: r + 4 },
          { z: -F + 2, w: W - 120, h: H - foot - 120, y: foot + (H - foot) / 2 - 20, r: r + 24 },
        ],
      },
      f.mark("panel", 0, bandTop + 170, W - 88, 240, { r: 6, mat: "plastic-grey" }),
      { is: "screen", at: [0, bandTop + 170, F + 0.3], w: W - 108, h: 210, radius: 8 },
      f.mark("shell", 0, foot + 50, W - 90, 80, { r: 2 }),
      f.round("dark", -W / 2 + 22, foot + 50, 2, { cols: 5, rows: 8, gap: 4 }),
      f.round("dark", W / 2 - 22, foot + 50, 2, { cols: 5, rows: 8, gap: 4 }),
      ...cdDoor(f, -64, foot + 58, 124),
      ...slot35(f, 60, foot + 62),
      f.mark("key", 56, foot + 36, 7, 5, { cols: 4, gap: 1 }),
      f.mark("panel", 104, foot + 36, 24, 10),
      f.round("key", 140, foot + 36, 8),
      ...sockets(b, 76, [["ac", -74], ["db", -36], ["scsi", 14], ["din", 58], ["din", 74]]),
    ],
    prints: [{ id: "front", at: [0, foot + 18, F + 0.3], turn: [0, 0, 0], w: 110, h: 12 }],
  };
}

export const MAC_5200 = slabCrt({ W: 406.4, D: 383.5, H: 444.5, soft: false });
export const MAC_5400 = slabCrt({ W: 406.4, D: 383.5, H: 444.5, soft: true });

/** The Macintosh Portable: a heavy lid over a keyboard, open, the battery and drives under its deck. */
export const MAC_PORTABLE: DeskSpec = (() => {
  const W = 387.3;
  const D = 366.5;
  const H = 102.9;
  const F = D / 2;
  const hinge = lean(62, H - 10, -F + 76);
  const f = onFace("front", F);
  const top = onFace("top", H - 22);
  const b = onFace("back", -F);
  return {
    pieces: [
      { is: "side", mat: BEIGE, w: W, points: [[F, 0], [-F, 0], [-F, H - 10], [-F + 80, H - 10], [F - 30, 44], [F, 30]] },
      // the lid, folded back about its hinge, with its screen in it
      { is: "loft", mat: BEIGE, frame: hinge, rings: [{ z: -F + 96, w: W - 8, h: 248, y: H - 10 + 124, r: 10 }, { z: -F + 76, w: W - 8, h: 248, y: H - 10 + 124, r: 8 }] },
      onFace("front", -F + 96, hinge).mark("panel", 0, H + 120, 296, 186, { r: 4, mat: "plastic-grey" }),
      { is: "screen", frame: hinge, at: [0, H + 120, -F + 96.3], w: 254, h: 170, kind: "panel" },
      top.mark("key", 0, F - 208, 15, 15, { cols: 14, rows: 5, gap: 3 }),
      f.mark("slot", 80, 20, 92, 4, { r: 1 }),
      ...sockets(b, 40, [["ac", -150], ["db", -100], ["scsi", -40], ["din", 10], ["din", 28], ["jack", 46]]),
    ],
    prints: [{ id: "lid", at: [0, H + 120, -F + 76 - 0.2], turn: [0, 180, 0], w: 180, h: 30, frame: hinge }],
  };
})();

/** The Twentieth Anniversary Macintosh: a tall thin slab leaning back on a metal foot, its flat picture over a band of controls and the drive between its two speakers, from photographs. */
export const TAM: DeskSpec = (() => {
  const W = 419.1;
  const H = 444.5;
  const T = 42;
  const shell: Material = "shell-graphite";
  const y0 = 6;
  const z = 70;
  const tilt = lean(14, y0, z);
  const f = onFace("front", z, tilt);
  const b = onFace("back", z - T, tilt);
  const P = H - y0 + 10;
  return {
    pieces: [
      // two wide feet behind it
      { is: "side", mat: "alu", x: -150, w: 18, points: [[z - T, 0], [-127, 0], [-127, 6], [z - T - 10, 260], [z - T, 260]] },
      { is: "side", mat: "alu", x: 150, w: 18, points: [[z - T, 0], [-127, 0], [-127, 6], [z - T - 10, 260], [z - T, 260]] },
      { is: "loft", mat: shell, frame: tilt, rings: [{ z, w: W, h: P, y: y0 + P / 2, r: 4 }, { z: z - T * 0.6, w: W, h: P, y: y0 + P / 2, r: 4 }, { z: z - T, w: W - 24, h: P - 20, y: y0 + P / 2, r: 8 }] },
      // the speakers' cloth at each side, the picture's frame and the picture
      f.mark("shell", -W / 2 + 28, y0 + P / 2, 56, P - 6, { mat: "plastic-char" }),
      f.mark("shell", W / 2 - 28, y0 + P / 2, 56, P - 6, { mat: "plastic-char" }),
      f.mark("panel", 0, y0 + P * 0.68, 300, 230, { mat: "plastic-char" }),
      { is: "screen", frame: tilt, at: [0, y0 + P * 0.68, z + 0.3], w: 262, h: 196 },
      // under it: the door over the disc drive between the slider panels, the floppy's slit in the door
      f.mark("shell", 0, y0 + 90, 150, 150, { mat: "alu-dark", r: 2 }),
      f.mark("slot", 0, y0 + 40, 60, 3, { over: 1 }),
      f.mark("slot", 44, y0 + 80, 3, 40, { over: 1 }),
      f.mark("shell", -106, y0 + 90, 60, 150, { mat: "plastic-grey" }),
      f.mark("shell", 106, y0 + 90, 60, 150, { mat: "plastic-grey" }),
      f.mark("slot", -116, y0 + 130, 3, 26, { cols: 2, gap: 14, over: 1 }),
      f.mark("slot", 110, y0 + 110, 3, 42, { over: 1 }),
      f.round("dark", -116, y0 + 30, 5, { rows: 2, gap: 8 }),
      // the back and the big block behind it that holds the board
      ...[-1].flatMap(() => [b.mark("panel", 0, y0 + 170, 300, 300, { r: 10 }), b.mark("dark", 0, y0 + 260, 240, 2, { rows: 12, gapY: 6 }), b.port(0, y0 + 50, 60, 16, 3), b.port(-60, y0 + 50, 30, 16, 3), b.port(60, y0 + 50, 30, 16, 3)]),
    ],
    prints: [{ id: "back", at: [0, y0 + P * 0.85, z - T - 0.3], turn: [0, 180, 0], w: 200, h: 30, frame: tilt }],
  };
})();

/** The Power Mac G4 Cube: the metal cube hung in a clear case, the vent and two handles' slots in its top, its sockets on its underside. */
export const G4_CUBE: DeskSpec = (() => {
  const W = 195.6;
  const H = 248.9;
  const inner = 180;
  const y0 = 50;
  const F = inner / 2;
  const f = onFace("front", F);
  const top = onFace("top", H);
  return {
    pieces: [
      block("alu", 0, 0, inner, inner, y0, H - 12),
      top.mark("shell", 0, 0, 96, 40, { r: 20, mat: "alu" }),
      top.mark("slot", 0, 0, 90, 3, { rows: 7, gapY: 2, over: 1 }),
      top.mark("metal", -70, 0, 8, 8, { round: true }),
      top.mark("metal", 70, 0, 8, 8, { round: true }),
      top.mark("dark", 0, 70, 120, 3, { r: 1 }),
      top.mark("dark", 0, -70, 120, 3, { r: 1 }),
      f.mark("dark", 0, y0 - 0.5, inner, 0.5),
      // the clear case, last: all that is behind it shows through
      { is: "loft", mat: "clear", rings: [{ z: W / 2, w: W, h: H, y: H / 2, r: 6 }, { z: -W / 2, w: W, h: H, y: H / 2, r: 6 }] },
    ],
    prints: [{ id: "front", at: [0, (H + y0) / 2, F + 0.3], turn: [0, 0, 0], w: 90, h: 20 }],
  };
})();

const CW = 226;
const CD = 467;
const CH = 432;

interface Curved {
  shell: Material;
  panel: Material;
  handles: Material;
  front: (f: Face) => Piece[];
}

/** The tower of 1999 to 2004: a metal or plastic body between two side panels, a curved front and back, and four clear handles at its corners. */
function curvedTower({ shell, panel, handles, front }: Curved): DeskSpec {
  const F = CD / 2;
  const f = onFace("front", F - 6);
  const b = onFace("back", -F + 6);
  const handle = (z: number, y: number, out: number): Piece => ({ is: "tube", mat: handles, r: 8, points: [[-78, y, z], [-44, y + out * 8, z], [44, y + out * 8, z], [78, y, z]] });
  return {
    pieces: [
      handle(-F + 16, CH - 8, 1),
      handle(-F + 16, 8, -1),
      // the side panels, each side of the body
      { is: "side", mat: panel, x: -CW / 2 + 2, w: 4, edge: 0.8, points: [[F - 14, 10], [F - 2, 40], [F - 2, CH - 40], [F - 14, CH - 10], [-F + 14, CH - 10], [-F + 2, CH - 40], [-F + 2, 40], [-F + 14, 10]] },
      {
        is: "side",
        mat: shell,
        w: CW - 8,
        points: [[F - 6, 30], [F - 6, CH - 30], [F - 28, CH - 8], [-F + 28, CH - 8], [-F + 6, CH - 30], [-F + 6, 30], [-F + 28, 8], [F - 28, 8]],
      },
      { is: "side", mat: panel, x: CW / 2 - 2, w: 4, edge: 0.8, points: [[F - 14, 10], [F - 2, 40], [F - 2, CH - 40], [F - 14, CH - 10], [-F + 14, CH - 10], [-F + 2, CH - 40], [-F + 2, 40], [-F + 14, 10]] },
      handle(F - 16, CH - 8, 1),
      handle(F - 16, 8, -1),
      ...front(f),
      // the door's latch and the screws in the right panel
      onFace("right", CW / 2).mark("shell", 0, CH - 56, 40, 66, { r: 20, mat: "clear" }),
      onFace("right", CW / 2).round("metal", 0, CH / 2, 7, { cols: 2, rows: 2, gap: 330, gapY: 300 }),
      // measured off a photograph of the back: sockets high on the left, the fan and the power inlet on the right, the cards below
      b.mark("panel", -40, CH - 150, 54, 180, { r: 4 }),
      b.mark("slot", -44, CH - 120, 10, 7, { rows: 6, gapY: 8, over: 1 }),
      b.round("panel", 54, CH - 80, 66),
      b.round("slot", 54, CH - 80, 58, { over: 1 }),
      b.port(54, CH - 160, 28, 20, 2),
      b.round("dark", 62, 110, 2.2, { cols: 8, rows: 16, gap: 4 }),
      b.mark("shell", -30, 120, 96, 10, { rows: 4, gapY: 10, mat: "alu" }),
    ],
    prints: [{ id: "side", at: [CW / 2 + 0.2, CH / 2 - 40, 0], turn: [0, 90, 0], w: 160, h: 30 }],
  };
}

export const G3_BLUE = curvedTower({
  shell: "plastic-platinum",
  panel: "plastic-blue",
  handles: "plastic-platinum",
  front: (f) => [f.mark("shell", 0, 280, 120, 22, { r: 11, mat: "plastic-blue" }), f.mark("shell", 0, 240, 120, 22, { r: 11, mat: "plastic-blue" }), f.round("key", 0, 200, 12), f.round("dark", 0, 110, 2.2, { cols: 8, rows: 6, gap: 4 })],
});

export const G4_GRAPHITE = curvedTower({
  shell: "plastic-graphite",
  panel: "plastic-graphite",
  handles: "plastic-graphite",
  front: (f) => [f.mark("shell", 0, 280, 120, 22, { r: 11, mat: "alu-dark" }), f.mark("shell", 0, 240, 120, 22, { r: 11, mat: "alu-dark" }), f.round("key", 0, 200, 12), f.round("dark", 0, 110, 2.2, { cols: 8, rows: 6, gap: 4 })],
});

export const G4_QUICKSILVER = curvedTower({
  shell: "alu",
  panel: "alu",
  handles: "clear",
  front: (f) => [f.mark("shell", 0, 300, 136, 38, { r: 19, mat: "shell-silver" }), f.mark("shell", 0, 248, 136, 38, { r: 19, mat: "shell-silver" }), f.round("key", 0, 196, 12), f.round("light", 0, 176, 2), f.round("slot", 0, 112, 36)],
});

export const G4_MDD = curvedTower({
  shell: "alu",
  panel: "alu",
  handles: "clear",
  front: (f) => [
    f.round("metal", 0, CH - 76, 30),
    f.mark("shell", 0, 240, 148, 148, { r: 6, mat: "plastic-white" }),
    f.mark("dark", 0, 232, 148, 1, { over: 1 }),
    f.round("key", 0, 296, 8, { over: 1 }),
    f.mark("slot", 0, 94, 15, 40, { cols: 4, gap: 16, r: 7 }),
  ],
});

/** The G3 All-in-One: the tube and the drives in one tall curved shell, a pale front over a teal flash of its colour. */
export const G3_ALL_IN_ONE: DeskSpec = (() => {
  const W = 408.4;
  const D = 457.2;
  const H = 506;
  const F = D / 2;
  const outline: readonly (readonly [number, number])[] = [
    [F, 14],
    [F - 60, H],
    [-40, H - 26],
    [-F + 60, H - 150],
    [-F, 240],
    [-F + 30, 60],
    [-F + 100, 0],
    [F - 20, 0],
  ];
  const f = onFace("front", F, lean(7, 14, F));
  const degrees = 7;
  return {
    pieces: [
      { is: "loft", mat: PLATINUM, frame: lean(degrees, 14, F), rings: sliced(outline, (t) => ({ w: t < 0.5 ? W : W - (t - 0.5) * 300, r: 26 + t * 70 }), 14, { degrees, pivot: [14, F] }) },
      f.mark("panel", 0, 330, 300, 240, { r: 16, mat: "plastic-grey" }),
      { is: "screen", frame: lean(degrees, 14, F), at: [0, 330, F + 0.3], w: 281, h: 215, radius: 12 },
      ...cdDoor(f, -40, 142, 130),
      ...slot35(f, 90, 150),
      f.round("dark", -160, 150, 2.2, { cols: 6, rows: 10, gap: 3.6 }),
      f.round("dark", 170, 150, 2.2, { cols: 6, rows: 10, gap: 3.6 }),
      ...power(f, 0, 76),
      ...sockets(onFace("back", -F + 2), 120, [["ac", -74], ["db", -36], ["scsi", 14], ["din", 58], ["din", 74]]),
    ],
    prints: [{ id: "front", at: [0, 84, F + 0.3], turn: [0, 0, 0], w: 120, h: 12 }],
  };
})();

/** The eMac: a white tube with a flat face, the speakers either side of a pill under the picture, the sockets in its right side. */
export const EMAC: DeskSpec = (() => {
  const W = 406;
  const D = 433;
  const H = 406;
  const F = D / 2;
  const outline: readonly (readonly [number, number])[] = [
    [F, 10],
    [F - 62, H],
    [F - 130, H - 8],
    [-50, H - 50],
    [-F + 30, 220],
    [-F, 150],
    [-F + 10, 66],
    [-F + 70, 0],
    [F - 20, 0],
  ];
  const degrees = 9;
  const frame = lean(degrees, 10, F);
  const f = onFace("front", F, frame);
  const right = onFace("right", W * 0.46);
  return {
    pieces: [
      { is: "loft", mat: "plastic-white", frame, rings: sliced(outline, (t) => ({ w: t < 0.35 ? W : W - (t - 0.35) * 420, r: 26 + t * 90 }), 16, { degrees, pivot: [10, F] }) },
      f.mark("panel", 0, 252, 330, 246, { mat: "bezel" }),
      { is: "screen", frame, at: [0, 252, F + 0.3], w: 320, h: 240 },
      f.round("dark", -130, 72, 42),
      f.round("dark", 130, 72, 42),
      f.mark("shell", 0, 72, 150, 34, { r: 17, mat: "plastic-white" }),
      right.mark("panel", -40, 86, 80, 34, { r: 6 }),
      right.port(-60, 86, 12, 10, 1),
      right.port(-40, 86, 12, 10, 1),
      right.port(-20, 86, 12, 10, 1),
    ],
    prints: [{ id: "front", at: [0, 60, F + 0.3], turn: [0, 0, 0], w: 110, h: 20 }],
  };
})();
