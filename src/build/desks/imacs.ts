// Every iMac but the first of the coloured 24-inch ones' stand: bodies from Apple's published sizes, parts placed from Apple's identification pictures and from photographs of each model's back.
// Plain geometry, nothing traced, and no mark of any kind.
import type { Material, Vec3 } from "../kit.ts";
import { type Across, block, type DeskSpec, lean, neckFrame, onFace, type Piece, sliced } from "../desk.ts";

const lerp = (points: readonly (readonly [number, number])[], t: number) => {
  for (let i = 0; i + 1 < points.length; i++) {
    const [t0, v0] = points[i];
    const [t1, v1] = points[i + 1];
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
  }
  return points[points.length - 1][1];
};

type Outline = readonly (readonly [number, number])[];

interface G3 {
  W: number;
  outline: Outline;
  top: Outline;
  low: Outline;
  degrees: number;
  pivot: readonly [number, number];
  widths: readonly (readonly [number, number])[];
  radii: readonly (readonly [number, number])[];
  band: number;
  shell: Material;
  screenY: number;
  screen: readonly [number, number];
  front: (f: ReturnType<typeof onFace>) => Piece[];
  back: (tilted: (degrees: number, y: number, z: number) => ReturnType<typeof onFace>, b: ReturnType<typeof onFace>, right: ReturnType<typeof onFace>) => Piece[];
  feet: readonly Vec3[];
}

/** A one-piece coloured iMac: a pale band round the tube's face, the coloured shell over a pale lower shell, on small round feet. */
function g3(spec: G3): DeskSpec {
  const options = { degrees: spec.degrees, pivot: spec.pivot };
  const frame = lean(spec.degrees, spec.pivot[0], spec.pivot[1]);
  const across: Across = (t) => ({ w: lerp(spec.widths, t), r: lerp(spec.radii, t) });
  const upper: Across = (t) => ({ ...across(t), rb: 0 });
  const lower: Across = (t) => ({ w: across(t).w, r: 0, rb: across(t).r });
  const faceZ = spec.pivot[1];
  const f = onFace("front", faceZ, frame);
  const tilted = (degrees: number, y: number, z: number) => onFace("back", z, lean(degrees, y, z));
  return {
    pieces: [
      ...spec.feet.map(([x, y, z]): Piece => ({ is: "turned", mat: "steel", x, z, points: [[0, y + 8], [9, y + 8], [9, y + 2], [5, y], [0, y]], seg: 10 })),
      { is: "loft", mat: spec.shell, frame, rings: sliced(spec.top, upper, 18, { ...options, from: spec.band, to: 1 }, spec.outline) },
      { is: "loft", mat: "plastic-white", frame, rings: sliced(spec.low, lower, 18, { ...options, from: spec.band, to: 1 }, spec.outline) },
      { is: "loft", mat: "plastic-white", frame, rings: sliced(spec.outline, across, 2, { ...options, from: 0, to: spec.band }) },
      f.mark("panel", 0, spec.screenY, spec.screen[0] + 12, spec.screen[1] + 12, { r: 10, mat: "bezel" }),
      { is: "screen", frame, at: [0, spec.screenY, faceZ + 0.3], w: spec.screen[0], h: spec.screen[1], radius: 8 },
      ...spec.front(f),
      ...spec.back(tilted, onFace("back", -spec.W * 0.57), onFace("right", spec.W * 0.45)),
    ],
    prints: [{ id: "back", at: [0, 318, -60], turn: [150, 0, 180], w: 120, h: 30 }],
  };
}

// The first iMac: 386 wide, 447 deep, 401 tall. Its outline is read off a photograph of its side, its face leaning back 13 degrees.
const TRAY: Outline = [
  [223.5, 44],
  [138, 401],
  [-3, 385],
  [-113, 312],
  [-196, 223],
  [-223.5, 171],
  [-223.5, 126],
  [-203, 52],
  [-161, 22],
  [-3, 6],
  [214, 30],
];
const TRAY_SPLIT: readonly [number, number] = [214, 91];
const TRAY_SPLIT_BACK: readonly [number, number] = [-223.5, 169];

export const IMAC_G3_TRAY: DeskSpec = g3({
  W: 386,
  outline: TRAY,
  top: [TRAY_SPLIT, [138, 401], [-3, 385], [-113, 312], [-196, 223], TRAY_SPLIT_BACK],
  low: [TRAY_SPLIT, TRAY_SPLIT_BACK, [-223.5, 126], [-203, 52], [-161, 22], [-3, 6], [214, 30]],
  degrees: 13.4,
  pivot: [44, 223.5],
  widths: [[0, 386], [0.3, 372], [0.6, 330], [0.85, 240], [1, 90]],
  radii: [[0, 22], [0.3, 40], [0.7, 80], [1, 40]],
  band: 0.06,
  shell: "plastic-bondi",
  screenY: 258,
  screen: [281, 222],
  feet: [[-120, 0, 150], [120, 0, 150], [0, 0, -120]],
  front: (f) => [
    // under the picture: the tray in the middle, the round speakers at the corners, the jacks in the right one and the power button beside it
    f.mark("shell", -22, 86, 150, 30, { r: 3 }),
    f.mark("slot", -22, 86, 40, 2, { r: 0.5 }),
    f.round("shell", -162, 76, 42, { mat: "plastic-bondi" }),
    f.round("shell", 162, 76, 42, { mat: "plastic-bondi" }),
    f.jack(162, 84, 5),
    f.jack(162, 68, 5),
    f.round("key", 118, 78, 10),
  ],
  back: (tilted, low, right) => {
    const slope = tilted(-56, 353, -57);
    const handle = tilted(-47, 268, -155);
    return [
      // three vents on the upper slope, the handle on the lower one
      slope.mark("slot", 0, 360, 150, 7, { rows: 3, gap: 0, gapY: 12, r: 3 }),
      handle.mark("shell", 0, 268, 165, 95, { r: 44 }),
      handle.mark("slot", 0, 288, 130, 26, { r: 13, over: 1 }),
      handle.mark("slot", 0, 248, 130, 26, { r: 13, over: 1 }),
      // the round opening low on the back
      low.mark("slot", 30, 104, 46, 24, { r: 12 }),
      // the door over the sockets on the right side, and its round catch
      right.mark("shell", 30, 66, 118, 78, { r: 6 }),
      right.round("shell", 30, 72, 26, { mat: "plastic-bondi", over: 1 }),
      right.jack(30, 72, 15),
    ];
  },
});

// The slot-loading iMac: 381 wide, 435 deep, 381 tall, a smoother shell with no tray and the sockets in a dish in its back.
const SLOT: Outline = [
  [217.5, 42],
  [140, 381],
  [-10, 368],
  [-120, 300],
  [-195, 215],
  [-217.5, 150],
  [-205, 60],
  [-150, 18],
  [-3, 4],
  [208, 26],
];
const SLOT_SPLIT: readonly [number, number] = [206, 80];
const SLOT_SPLIT_BACK: readonly [number, number] = [-217.5, 170];

export const IMAC_G3_SLOT: DeskSpec = g3({
  W: 381,
  outline: SLOT,
  top: [SLOT_SPLIT, [140, 381], [-10, 368], [-120, 300], [-195, 215], SLOT_SPLIT_BACK],
  low: [SLOT_SPLIT, SLOT_SPLIT_BACK, [-205, 60], [-150, 18], [-3, 4], [208, 26]],
  degrees: 13,
  pivot: [42, 217.5],
  widths: [[0, 381], [0.3, 368], [0.6, 330], [0.85, 250], [1, 110]],
  radii: [[0, 26], [0.3, 44], [0.7, 84], [1, 50]],
  band: 0.05,
  shell: "plastic-blue",
  screenY: 240,
  screen: [281, 215],
  feet: [[-120, 0, 150], [120, 0, 150], [0, 0, -120]],
  front: (f) => [
    // the slot in its coloured strip in the middle, the speakers at the corners, the power button and the two jacks
    f.mark("shell", 0, 76, 110, 12, { r: 6, mat: "plastic-blue" }),
    f.mark("slot", 0, 76, 92, 2.4, { r: 1, over: 1 }),
    f.round("shell", -150, 74, 40, { mat: "plastic-blue" }),
    f.round("shell", 150, 74, 40, { mat: "plastic-blue" }),
    f.jack(-92, 72, 5),
    f.jack(-78, 72, 5),
    f.round("key", 92, 72, 10),
  ],
  back: (tilted, low) => {
    const handle = tilted(-47, 262, -150);
    return [
      handle.mark("shell", 0, 262, 160, 90, { r: 42 }),
      handle.mark("slot", 0, 282, 120, 24, { r: 12, over: 1 }),
      handle.mark("slot", 0, 242, 120, 24, { r: 12, over: 1 }),
      // the dish of sockets low down on the left, the round opening beside it
      low.mark("panel", -56, 70, 74, 32, { r: 10 }),
      low.port(-76, 70, 7, 16, 1, { over: 1 }),
      low.port(-66, 70, 7, 16, 1, { over: 1 }),
      low.port(-55, 70, 7, 16, 1, { over: 1 }),
      low.port(-43, 70, 7, 16, 1, { over: 1 }),
      low.port(-30, 70, 11, 9, 1, { over: 1 }),
      low.mark("slot", 18, 96, 42, 26, { r: 13 }),
    ];
  },
});

interface Lamp {
  W: number;
  H: number;
  screen: readonly [number, number];
  y: number;
}

/** The lamp: a white dome, a steel arm from its top to the middle of the panel's back, the white panel in a clear rim. */
function lamp({ W, H, screen, y }: Lamp): DeskSpec {
  const degrees = 12;
  const z = 26;
  const frame = lean(degrees, y, z);
  const f = onFace("front", z, frame);
  const chinFree = (H - screen[1]) / 2;
  const hingeY = y - 6;
  const hingeZ = z - 58;
  return {
    pieces: [
      {
        is: "turned",
        mat: "plastic-white",
        seg: 48,
        rims: [],
        points: [[0, 170], [34, 168], [78, 156], [112, 132], [131, 96], [135, 50], [132, 22], [122, 8], [106, 0], [0, 0]],
      },
      // the arm, its joint and the short neck into the panel
      { is: "tube", mat: "steel", points: [[0, 156, -24], [0, 220, -30], [0, hingeY - 30, hingeZ + 2], [0, hingeY, hingeZ]], r: 18 },
      { is: "tube", mat: "steel", points: [[0, hingeY, hingeZ], [0, hingeY + 6, hingeZ + 30]], r: 12 },
      // the rim and the white panel in front of it
      { is: "loft", mat: "pale-glass", frame, rings: [{ z: z - 24, w: W, h: H, y, r: 20 }, { z: z - 30, w: W, h: H, y, r: 20 }] },
      { is: "loft", mat: "plastic-white", frame, rings: [{ z, w: W - 16, h: H - 16, y, r: 16 }, { z: z - 40, w: W - 40, h: H - 40, y, r: 26 }] },
      f.mark("panel", 0, y + 6, screen[0] + 6, screen[1] + 6, { mat: "bezel" }),
      { is: "screen", frame, at: [0, y + 6, z + 0.3], w: screen[0], h: screen[1] },
      // the speaker holes on top of the dome
      onFace("top", 170).round("slot", 0, -6, 2.2, { cols: 12, rows: 4, gap: 3.4, gapY: 3.4 }),
    ],
    prints: [{ id: "back", at: [0, y + chinFree / 4, z - 40.2], turn: [0, 180, 0], w: 110, h: 28, frame }],
  };
}

export const IMAC_G4_15 = lamp({ W: 415, H: 318, screen: [304, 228], y: 330 });
export const IMAC_G4_17 = lamp({ W: 449, H: 305, screen: [367, 229], y: 330 });
export const IMAC_G4_20 = lamp({ W: 514, H: 345, screen: [433, 271], y: 350 });

interface Panel {
  W: number;
  D: number;
  H: number;
  /** The panel's own height, its thickness, the chin under the picture, and the picture. */
  P: number;
  T: number;
  chin: number;
  screen: readonly [number, number];
  shell: Material;
  rear: Material;
  glass?: boolean;
  camera?: boolean;
  neck: readonly [number, number];
  /** How deep the back swells behind a thin edge; none: an even slab. */
  thin?: number;
  /** The slit along the top of the back, this far below the top; none: no slit. */
  vent?: number;
  /** The power button on the back, seen from behind. */
  power?: readonly [number, number];
  sockets: (b: ReturnType<typeof onFace>, y0: number) => Piece[];
  /** A hole through the stand for the cables. */
  hole?: boolean;
  foot?: Material;
}

/** A flat iMac on its bent metal foot: `W` by `H` overall, `D` the depth of the foot. */
function panel(s: Panel): DeskSpec {
  const y0 = s.H - s.P;
  const z = s.D / 2 - 34;
  const degrees = 3;
  const frame = lean(degrees, y0, z);
  const mid = y0 + s.P / 2;
  const f = onFace("front", z, frame);
  const backZ = z - (s.thin ?? s.T);
  const b = onFace("back", backZ, frame);
  // the sockets of a thin iMac lie on the slope of its back, not on the top of its swell
  const thinAt = z - (s.thin ?? 0) * 0.46;
  const low = s.thin ? onFace("back", thinAt - 1.5, frame.clone().multiply(lean(27, y0 + 34, thinAt - 1.5))) : b;
  const foot = s.foot ?? "alu";
  const footZ = -s.D / 2;
  const standTop: readonly [number, number] = [y0 + s.P * 0.42, z - (s.thin ?? s.T) + 2];
  const neck = neckFrame([0, footZ + 6], standTop);
  const body: Piece = s.thin
    ? {
        is: "loft",
        mat: s.shell,
        frame,
        rings: [
          { z, w: s.W, h: s.P, y: mid, r: 16 },
          { z: z - 5, w: s.W, h: s.P, y: mid, r: 16 },
          { z: z - s.thin * 0.35, w: s.W - 70, h: s.P - 42, y: mid, r: 60 },
          { z: z - s.thin * 0.7, w: s.W * 0.62, h: s.P * 0.72, y: mid, r: 110 },
          { z: z - s.thin, w: s.W * 0.42, h: s.P * 0.52, y: mid, r: 100 },
        ],
      }
    : {
        is: "loft",
        mat: s.shell,
        frame,
        rings: [
          { z, w: s.W, h: s.P, y: mid, r: 16 },
          { z: z - s.T + 6, w: s.W, h: s.P, y: mid, r: 16 },
          { z: z - s.T, w: s.W - 14, h: s.P - 14, y: mid, r: 14 },
        ],
      };
  const pictureY = y0 + s.chin + (s.P - s.chin) / 2;
  const glassH = s.P - s.chin;
  return {
    pieces: [
      // the foot on the desk and the bent neck rising behind the panel
      { is: "side", mat: foot, x: 0, w: s.neck[1], points: [[s.D / 2 - 18, 0], [footZ, 0], [footZ, 6], [s.D / 2 - 18, 3]] },
      { is: "loft", mat: foot, frame: neck.frame, rings: [{ z: neck.length, w: s.neck[0], h: 6, y: 0, r: 1 }, { z: 0, w: s.neck[1], h: 6, y: 0, r: 1 }] },
      body,
      ...(s.rear !== s.shell && !s.thin
        ? [{ is: "loft", mat: s.rear, frame, rings: [{ z: z - s.T + 5, w: s.W - 2, h: s.P - 2, y: mid, r: 15 }, { z: z - s.T - 0.2, w: s.W - 14, h: s.P - 14, y: mid, r: 14 }] } as Piece]
        : []),
      // the glass or the white face above the chin, and the picture
      ...(s.glass ? [f.mark("panel", 0, y0 + s.chin + glassH / 2, s.W - 1, glassH, { r: 8, mat: "black-glass" })] : []),
      { is: "screen", frame, at: [0, pictureY, z + 0.3], w: s.screen[0], h: s.screen[1] },
      ...(s.camera ? [f.round("slot", 0, y0 + s.P - (s.P - s.chin - s.screen[1]) / 2, 3, { over: 2 })] : []),
      ...(s.vent ? [b.mark("slot", 0, y0 + s.P - s.vent, s.W * 0.79, s.vent > 20 ? 9 : 5, { r: 2 })] : []),
      ...s.sockets(low, y0),
      ...(s.power ? [low.round("key", s.power[0], y0 + s.power[1], 12)] : []),
      ...(s.hole ? [onFace("top", 3, neck.frame).round("slot", 0, neck.length * 0.42, s.neck[0] * 0.42, { over: 2 })] : []),
    ],
    prints: [{ id: "back", at: [0, mid + s.P * 0.12, backZ - 0.3], turn: [0, 180, 0], w: s.W * 0.3, h: 40, frame }],
  };
}

/** The white iMacs' sockets: a column on the left of the back, seen from behind, from a photograph of the 20-inch. */
const whiteColumn = (scale: number) => (b: ReturnType<typeof onFace>, y0: number): Piece[] => {
  const x = -195 * scale;
  const at = (fromFoot: number) => y0 + fromFoot * scale;
  return [
    b.jack(x, at(202), 6),
    b.jack(x, at(189), 6),
    b.port(x, at(177), 10, 5, 1),
    ...[164, 153, 141].map((y) => b.usba(x, at(y))),
    ...[128, 114].map((y) => b.port(x, at(y), 11, 5.5, 1)),
    b.port(x, at(99), 12, 11, 1),
    b.port(x, at(82), 13, 12, 1),
    b.round("key", x, at(51), 12),
  ];
};

const WHITE = { shell: "plastic-white" as Material, rear: "plastic-white" as Material, hole: true, vent: 44 };
export const IMAC_G5_17 = panel({ ...WHITE, W: 426, D: 173, H: 430, P: 372, T: 52, chin: 90, screen: [367, 230], neck: [90, 136], sockets: whiteColumn(0.864) });
export const IMAC_G5_20 = panel({ ...WHITE, W: 493, D: 189, H: 472, P: 406, T: 54, chin: 104, screen: [433, 271], neck: [103, 157], sockets: whiteColumn(1) });
export const IMAC_INTEL_17 = panel({ ...WHITE, W: 426, D: 173, H: 430, P: 372, T: 52, chin: 90, screen: [367, 230], camera: true, neck: [90, 136], sockets: whiteColumn(0.864) });
export const IMAC_INTEL_20 = panel({ ...WHITE, W: 493, D: 189, H: 472, P: 406, T: 54, chin: 104, screen: [433, 271], camera: true, neck: [103, 157], sockets: whiteColumn(1) });
export const IMAC_INTEL_24 = panel({ ...WHITE, W: 574, D: 207, H: 523, P: 454, T: 60, chin: 114, screen: [518, 324], camera: true, neck: [120, 180], sockets: whiteColumn(1.164) });

/** A row of sockets low on the left of the back, seen from behind, the power button at the far right of them. */
const row = (startX: number, spacing: number, y: number, kinds: readonly ("jack" | "usb" | "fw" | "tb" | "net" | "card" | "mini" | "usbc")[]) => (b: ReturnType<typeof onFace>, y0: number): Piece[] => {
  let x = startX;
  return kinds.map((kind) => {
    const at = x;
    const yy = y0 + y;
    x += spacing + (kind === "net" || kind === "card" ? 8 : 0);
    if (kind === "jack") return b.jack(at, yy, 6);
    if (kind === "usb") return b.usba(at, yy, true);
    if (kind === "fw") return b.port(at, yy, 5.5, 11, 1);
    if (kind === "tb" || kind === "mini") return b.port(at, yy, 8, 9, 1);
    if (kind === "usbc") return b.usbc(at, yy);
    if (kind === "net") return b.port(at, yy, 13, 12, 1);
    return b.mark("slot", at, yy, 3, 26, { r: 1, over: 1 });
  });
};

const ALU = { shell: "alu" as Material, rear: "plastic-black" as Material, glass: true, camera: true, hole: true, vent: 14 };
const aluSockets = row(-160, 12, 28, ["jack", "jack", "usb", "usb", "usb", "fw", "fw", "mini", "net"]);
export const IMAC_ALU_20 = panel({ ...ALU, W: 485, D: 189, H: 469, P: 399, T: 50, chin: 84, screen: [435, 278], neck: [123, 178], power: [195, 30], sockets: aluSockets });
export const IMAC_ALU_24 = panel({ ...ALU, W: 569, D: 207, H: 520, P: 450, T: 50, chin: 96, screen: [518, 324], neck: [140, 205], power: [230, 32], sockets: row(-190, 13, 30, ["jack", "jack", "usb", "usb", "usb", "fw", "fw", "mini", "net"]) });

const UNI = { shell: "alu" as Material, rear: "alu" as Material, glass: true, camera: true, hole: true, vent: 11 };
const uniSockets = (start: number, y: number) => row(start, 11, y, ["jack", "jack", "usb", "usb", "usb", "usb", "fw", "mini", "net"]);
export const IMAC_UNI_21 = panel({ ...UNI, W: 528, D: 188.5, H: 451, P: 383, T: 40, chin: 62, screen: [477, 268], neck: [125, 180], power: [191, 31], sockets: uniSockets(-167, 25) });
export const IMAC_UNI_27 = panel({ ...UNI, W: 650, D: 207, H: 517, P: 446, T: 44, chin: 66, screen: [598, 336], neck: [145, 211], power: [235, 34], sockets: uniSockets(-205, 28) });

const THIN = { shell: "alu" as Material, rear: "alu" as Material, glass: true, camera: true, hole: true };
const thinSockets = (start: number, y: number) => row(start, 11, y, ["jack", "card", "usb", "usb", "usb", "usb", "tb", "tb", "net"]);
export const IMAC_THIN_21 = panel({ ...THIN, W: 528, D: 175, H: 450, P: 381, thin: 58, T: 58, chin: 62, screen: [477, 268], neck: [125, 180], power: [191, 34], sockets: thinSockets(-167, 34) });
export const IMAC_THIN_27 = panel({ ...THIN, W: 650, D: 203, H: 516, P: 446, thin: 62, T: 62, chin: 68, screen: [598, 336], neck: [132, 197], power: [235, 34], sockets: thinSockets(-205, 34) });
export const IMAC_PRO = panel({ ...THIN, shell: "shell-space-grey", rear: "shell-space-grey", foot: "shell-space-grey", W: 650, D: 203, H: 516, P: 446, thin: 62, T: 62, chin: 68, screen: [598, 336], neck: [132, 197], power: [235, 34], sockets: row(-205, 11, 34, ["jack", "card", "usb", "usb", "usb", "usb", "tb", "tb", "tb", "tb", "net"]) });

/** The coloured iMac: a thin slab, a coloured chin under pale glass, a straight L-shaped stand, the sockets low on the left of the back. */
function imac24(sockets: number): DeskSpec {
  const W = 547;
  const H = 461;
  const y0 = 87;
  const P = H - y0;
  const T = 11.5;
  const chin = 68;
  const z = 44;
  const frame = lean(5, y0, z);
  const mid = y0 + P / 2;
  const shell: Material = "shell-deep-blue";
  const f = onFace("front", z, frame);
  const b = onFace("back", z - T, frame);
  const pictureY = y0 + chin + (P - chin) / 2;
  return {
    pieces: [
      block(shell, 0, 0, 128, 147, 0, 5, { r: 6, edge: 1 }),
      { is: "side", mat: shell, w: 128, points: [[-70, 2], [-60, 2], [z - T - 2, y0 + 70], [z - T - 10, y0 + 70]] },
      { is: "loft", mat: shell, frame, rings: [{ z, w: W, h: P, y: mid, r: 12 }, { z: z - T, w: W - 3, h: P - 3, y: mid, r: 11 }] },
      f.mark("panel", 0, y0 + chin + (P - chin) / 2, W - 2, P - chin - 1, { r: 9, mat: "pale-glass" }),
      { is: "screen", frame, at: [0, pictureY, z + 0.3], w: 521, h: 293 },
      f.round("slot", 0, y0 + P - 6.5, 3, { over: 2 }),
      // Apple's picture of the back: the ports in a row low on the left, seen from behind
      ...[-185, -170, -155, -140].slice(0, sockets).map((x) => b.usbc(x, y0 + 26)),
    ],
    prints: [{ id: "back", at: [0, mid + 40, z - T - 0.3], turn: [0, 180, 0], w: 160, h: 32, frame }],
  };
}

export const IMAC_24_FOUR = imac24(4);
export const IMAC_24_TWO = imac24(2);
