// The Mac Pro in each of its shapes and the Power Mac G5 before it: Apple's published sizes, and the parts placed from Apple's pictures of each front and back. Plain geometry, no mark.
import type { Material } from "../kit.ts";
import { block, type DeskSpec, onFace, type Piece } from "../desk.ts";

/** The alloy tower: two side sheets with a handle's gap cut in the middle of their tops and bottoms, a bar across each end, and a perforated front and back. */
function alloy(front: (f: ReturnType<typeof onFace>) => Piece[], back: (b: ReturnType<typeof onFace>) => Piece[]): DeskSpec {
  const W = 206;
  const D = 475;
  const H = 511;
  const F = D / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  const sheet = (x: number): Piece => ({
    is: "side",
    mat: "alu",
    x,
    w: 5,
    edge: 0.8,
    points: [[F, 0], [F, H], [F - 62, H], [F - 90, H - 42], [-F + 90, H - 42], [-F + 62, H], [-F, H], [-F, 0], [-F + 62, 0], [-F + 90, 42], [F - 90, 42], [F - 62, 0]],
  });
  const bar = (z: number, y: number): Piece => block("alu", 0, z, W - 6, 14, y, y + 12, { r: 3, edge: 1 });
  return {
    pieces: [
      sheet(-W / 2 + 2.5),
      bar(-F + 8, H - 12),
      bar(-F + 8, 0),
      block("alu", 0, 0, W - 8, D - 4, 42, H - 42),
      bar(F - 8, H - 12),
      bar(F - 8, 0),
      sheet(W / 2 - 2.5),
      f.mark("perf", 0, H / 2, W - 22, H - 90, { holes: [58, 120, 64] }),
      b.mark("perf", 0, H / 2, W - 22, H - 90, { holes: [58, 120, 64] }),
      ...front(f),
      ...back(b),
    ],
    prints: [{ id: "side", at: [W / 2 + 0.1, H / 2, 0], turn: [0, 90, 0], w: 240, h: 50 }],
  };
}

/** The back of the alloy tower: the card slots high on the right, the two big fans below them, the column of sockets and the power inlet at the foot. */
const alloyBack = (sockets: (b: ReturnType<typeof onFace>) => Piece[]) => (b: ReturnType<typeof onFace>): Piece[] => [
  b.mark("panel", 20, 355, 150, 118, { r: 2 }),
  b.mark("shell", 20, 355, 136, 12, { rows: 4, gapY: 15, mat: "alu-dark" }),
  b.round("panel", -6, 226, 134),
  b.round("slot", -6, 226, 124, { over: 1 }),
  b.round("panel", -6, 94, 134),
  b.round("slot", -6, 94, 124, { over: 1 }),
  b.port(-6, 26, 34, 24, 3),
  b.mark("shell", -70, 410, 22, 80, { r: 3 }),
  ...sockets(b),
];

/** The Power Mac G5: one optical slot high on its front, a few sockets beside the power button. */
export const POWER_MAC_G5 = alloy(
  (f) => [
    f.mark("panel", 0, 448, 180, 12, { r: 2, mat: "alu-dark" }),
    f.mark("slot", 0, 448, 150, 2.6, { over: 1 }),
    f.round("key", -74, 400, 11),
    f.jack(-74, 378, 6),
    f.usba(-74, 362, false),
    f.port(-74, 344, 12, 5.5, 1),
  ],
  alloyBack((b) => [
    ...[192, 178].map((y) => b.jack(56, y, 6)),
    ...[162, 148].map((y) => b.port(56, y, 11, 10, 1)),
    ...[130, 118].map((y) => b.jack(56, y, 6)),
    ...[102, 92, 82].map((y) => b.usba(56, y, false)),
    ...[68, 56].map((y) => b.port(56, y, 11, 8, 1)),
    b.port(56, 44, 12, 11, 1),
  ]),
);

/** The first Mac Pro: two optical bays behind slots high on its front, a column of sockets low on the left of it. */
export const MAC_PRO_TOWER = alloy(
  (f) => [
    f.mark("metal", 0, 417, 176, 19),
    f.mark("metal", 0, 367, 176, 19),
    f.mark("slot", 0, 417, 150, 2.6, { over: 1 }),
    f.mark("slot", 0, 367, 150, 2.6, { over: 1 }),
    f.mark("panel", -74, 176, 16, 96, { r: 3 }),
    f.round("key", -74, 218, 10, { over: 1 }),
    f.jack(-74, 202, 5),
    f.port(-74, 188, 10, 7, 1, { over: 2 }),
    f.port(-74, 174, 10, 7, 1, { over: 2 }),
    f.port(-74, 160, 10, 5, 1, { over: 2 }),
    f.port(-74, 148, 10, 5, 1, { over: 2 }),
  ],
  alloyBack((b) => [
    ...[192, 178].map((y) => b.jack(56, y, 6)),
    ...[162, 148].map((y) => b.port(56, y, 11, 10, 1)),
    ...[130, 118].map((y) => b.port(56, y, 11, 8, 1)),
    ...[102, 92, 82].map((y) => b.usba(56, y, false)),
    ...[68, 52].map((y) => b.port(56, y, 13, 12, 1)),
  ]),
);

const R = 83.8;
const CH = 251.5;

/** The cylinder: a deep polished tube on a vented foot, an opening in its top, and its sockets in one lit panel on its back. */
export const MAC_PRO_CYLINDER: DeskSpec = (() => {
  const shell: Material = "shell-graphite";
  const b = onFace("back", -R - 0.4);
  return {
    pieces: [
      block(shell, 0, -R + 7, 70, 14, 56, 212, { r: 3 }),
      { is: "band", mat: "alu-dark", r0: R - 3, r1: R - 1, y0: 0, y1: 13, holes: [120, 4, 60] },
      { is: "turned", mat: "plastic-black", points: [[0, 0], [R - 4, 0], [R - 4, 1], [0, 1]] },
      {
        is: "turned",
        mat: shell,
        seg: 64,
        rims: [247],
        points: [[0, 244], [58, 244], [66, 250], [76, CH], [80, CH - 1], [83, CH - 5], [R, CH - 14], [R, 14], [R - 2, 13], [0, 13]],
      },
      b.mark("panel", 0, 134, 62, 150, { r: 6 }),
      // the sockets as Apple's specification lists them: audio, four USB, six Thunderbolt, two Ethernet and one HDMI, from the top down
      b.jack(-10, 198, 5),
      b.jack(10, 198, 5),
      b.mark("slot", 0, 176, 13, 5.6, { cols: 2, rows: 2, gap: 8, gapY: 6, r: 0.6, over: 1 }),
      b.mark("slot", 0, 138, 8.8, 3.2, { cols: 2, rows: 3, gap: 12, gapY: 7, r: 1.4, over: 1 }),
      b.mark("slot", 0, 100, 13, 12, { cols: 2, gap: 7, r: 1, over: 1 }),
      b.port(0, 76, 15, 5, 1, { over: 1 }),
      // the power inlet and button at the foot
      b.port(0, 34, 26, 16, 2),
      b.round("key", -28, 34, 9),
    ],
    prints: [{ id: "front", at: [0, CH / 2, R + 0.1], turn: [0, 0, 0], w: 70, h: 20 }],
  };
})();

const TW = 218;
const TD = 450;
const FOOT = 41;
const TOP = 476;

/** The lattice of the steel tower: rows of round holes, staggered, measured off Apple's picture of it. Each row skips the panel at the back when it has one. */
function lattice(face: ReturnType<typeof onFace>, keep: (y: number) => boolean): Piece[] {
  const out: Piece[] = [];
  const pitch = 22.9;
  const pitchY = 19.2;
  const rows = 22;
  for (let row = 0; row < rows; row++) {
    const y = TOP - 19 - row * pitchY;
    const even = row % 2 === 0;
    if (keep(y)) out.push(face.round("slot", 0, y, 16.5, { cols: even ? 8 : 7, gap: pitch - 16.5, seg: 8 }));
    else {
      // only the outer pair each side of the panel
      for (const side of [-1, 1]) out.push(face.round("slot", side * (even ? 80.1 : 91.6) * (even ? 1 : 0.875), y, 16.5, { cols: 2, gap: pitch - 16.5, seg: 8 }));
    }
  }
  return out;
}

/** The steel tower: a lattice front and back in a smooth steel case, tube handles on top, tube legs below. */
function steelTower(backPorts: (b: ReturnType<typeof onFace>) => Piece[]): DeskSpec {
  const F = TD / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  const leg = (x: number, z: number): Piece[] => [
    { is: "turned", mat: "steel", x, z, seg: 16, points: [[0, 0], [22, 0], [24, 3], [12, 8], [10, FOOT + 1], [0, FOOT + 1]] },
  ];
  const handle = (z: number): Piece => ({ is: "tube", mat: "steel", r: 7, drawn: 5, points: [[-72, TOP - 2, z], [-72, TOP + 34, z], [-68, TOP + 46, z], [-56, TOP + 50, z], [0, TOP + 50, z], [56, TOP + 50, z], [68, TOP + 46, z], [72, TOP + 34, z], [72, TOP - 2, z]] });
  return {
    pieces: [
      ...leg(-70, F - 32),
      ...leg(70, F - 32),
      ...leg(-70, -F + 32),
      ...leg(70, -F + 32),
      handle(F - 24),
      handle(-F + 24),
      block("alu", 0, 0, TW, TD, FOOT, TOP, { r: 8, edge: 2 }),
      ...lattice(f, () => true),
      ...lattice(b, (y) => y > 368 || y < 52),
      b.mark("panel", 0, 204, 110, 300, { r: 8 }),
      ...backPorts(b),
      // on top: the power button and two ports, the latch beside them
      onFace("top", TOP).round("key", 62, -F + 70, 13),
      onFace("top", TOP).mark("slot", 62, -F + 96, 8.8, 3.2, { rows: 2, gapY: 10, r: 1.4, over: 1 }),
      onFace("top", TOP).round("metal", -70, 0, 24),
    ],
    prints: [{ id: "side", at: [TW / 2 + 0.1, (TOP + FOOT) / 2, 0], turn: [0, 90, 0], w: 240, h: 50 }],
  };
}

/** The 2023 tower's back, measured off Apple's labelled picture: six Thunderbolt ports over the jack, two HDMI and two USB-A; two Ethernet and the power inlet at the foot. */
export const MAC_PRO_2023 = steelTower((b) => [
  ...[-40, -25.5, -8, 9, 25, 41].map((x) => b.usbc(x, 326, false)),
  b.jack(-38.6, 306, 5),
  b.port(-22, 306, 15, 5, 1),
  b.port(-1, 306, 15, 5, 1),
  b.usba(18.6, 306),
  b.usba(38, 306),
  b.mark("light", -36, 85, 2, 2, { round: true }),
  b.port(1, 82, 38, 25, 2),
  b.port(32, 88, 11, 9, 1),
  b.port(32, 69, 11, 9, 1),
  ...[1, 2, 3, 4, 5, 6].map((i) => b.mark("dark", 0, 280 - i * 28, 100, 1)),
]);

/** The 2019 tower's back: the two USB-A and two Thunderbolt ports on its own card high up, the rest of the panel cards and blanks; two Ethernet and the power inlet at the foot. */
export const MAC_PRO_2019 = steelTower((b) => [
  b.usbc(-36, 326, false),
  b.usbc(-16, 326, false),
  b.usba(14, 326),
  b.usba(36, 326),
  // a graphics module's own ports below the card
  ...[-40, -25, -10, 5].map((x) => b.usbc(x, 298, false)),
  b.port(30, 298, 15, 5, 1),
  b.mark("light", -36, 85, 2, 2, { round: true }),
  b.port(1, 82, 38, 25, 2),
  b.port(32, 88, 11, 9, 1),
  b.port(32, 69, 11, 9, 1),
  ...[1, 2, 3, 4, 5, 6].map((i) => b.mark("dark", 0, 280 - i * 28, 100, 1)),
]);

const RW = 482;
const RD = 539.5;
const RH = 220.2;
const BW = 440;

/** The rack Mac Pro: five units high, handles and ears at the front, a fine perforated back round the ports, measured off Apple's labelled picture of it. */
function rackPro(backPorts: (b: ReturnType<typeof onFace>) => Piece[]): DeskSpec {
  const F = RD / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  const handle = (x: number): Piece => ({ is: "tube", mat: "steel", r: 5, points: [[x, 26, F + 2], [x + Math.sign(x) * 8, 34, F + 12], [x + Math.sign(x) * 8, RH - 34, F + 12], [x, RH - 26, F + 2]] });
  const holes: Piece[] = [];
  for (let row = 0; row < 7; row++) {
    const y = RH - 36 - row * 25;
    holes.push(f.round("slot", 0, y, 18, { cols: row % 2 ? 13 : 14, gap: 8.5, seg: 8 }));
  }
  return {
    pieces: [
      // the rail along each side
      block("alu-dark", -BW / 2 - 7, 40, 14, 340, RH / 2 - 16, RH / 2 + 16),
      block("alu", 0, 0, BW, RD, 0, RH),
      block("alu-dark", BW / 2 + 7, 40, 14, 340, RH / 2 - 16, RH / 2 + 16),
      // the ears and front plate
      block("alu", 0, F - 2, RW, 4, 0, RH),
      handle(-214),
      handle(214),
      ...holes,
      onFace("front", F).mark("metal", -226, RH / 2, 6, 6, { round: true, rows: 2, gapY: 150 }),
      onFace("front", F).mark("metal", 226, RH / 2, 6, 6, { round: true, rows: 2, gapY: 150 }),
      b.mark("perf", 0, RH / 2, 426, RH - 20, { holes: [120, 56, 62] }),
      b.mark("panel", -53.5, 109, 300, 108, { r: 8, over: 1 }),
      ...backPorts(b),
    ],
    prints: [{ id: "top", at: [0, RH + 0.1, 0], turn: [-90, 0, 0], w: 240, h: 50 }],
  };
}

const rackCommon = (b: ReturnType<typeof onFace>): Piece[] => [
  b.port(-181, 110, 28, 35, 2, { over: 2 }),
  b.mark("light", -181, 146, 2, 2, { round: true }),
  b.port(-189, 77, 11, 9, 1, { over: 2 }),
  b.port(-173, 77, 11, 9, 1, { over: 2 }),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => b.mark("dark", -165 + i * 19.5, 109, 1, 104, { over: 2 })),
];

export const MAC_PRO_RACK_2023 = rackPro((b) => [
  ...rackCommon(b),
  b.jack(47, 149, 5),
  b.port(47, 132, 5, 15, 1, { over: 2 }),
  b.port(47, 111, 5, 15, 1, { over: 2 }),
  b.usba(47, 90, true),
  b.usba(47, 71, true),
  ...[151, 135, 118, 103, 86, 69].map((y) => b.usbc(67, y)),
]);

export const MAC_PRO_RACK_2019 = rackPro((b) => [
  ...rackCommon(b),
  b.usbc(47, 150),
  b.usbc(47, 130),
  b.usba(47, 106, true),
  b.usba(47, 84, true),
  ...[151, 135, 118, 103].map((y) => b.usbc(67, y)),
  b.port(67, 82, 5, 15, 1, { over: 2 }),
]);
