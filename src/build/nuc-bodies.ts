// The table of the NUC line's bodies: one row per body, read by its mesh (nuc.ts) and its drawing (draw/nuc.ts). Sizes are the published ones in millimetres, width by depth by height; where
// a socket sits was read from photographs of the real thing and placed by hand. A row names what a body has, never how it looks on anyone's page. No word on any of it.
import type { Material } from "./kit.ts";

export type SocketKind = "usb-a" | "usb-blue" | "usb-amber" | "usb-c" | "hdmi" | "hdmi-mini" | "dp" | "dp-mini" | "rj45" | "vga" | "serial" | "audio" | "sd" | "ir" | "dc" | "dc-rect" | "iec" | "power" | "pill" | "led" | "lock" | "antenna";

/** Width and height of each socket's opening. */
export const SOCKET_SIZE: Readonly<Record<SocketKind, readonly [number, number]>> = {
  "usb-a": [13.4, 5.8],
  "usb-blue": [13.4, 5.8],
  "usb-amber": [13.4, 5.8],
  "usb-c": [8.6, 3.1],
  hdmi: [15, 5.6],
  "hdmi-mini": [10.5, 3.2],
  dp: [16, 5.4],
  "dp-mini": [7.4, 4.6],
  rj45: [12.4, 10],
  vga: [15.4, 8.2],
  serial: [15.4, 8.2],
  audio: [3.6, 3.6],
  sd: [24, 2.2],
  ir: [6, 6],
  dc: [8, 8],
  "dc-rect": [10, 6],
  iec: [18, 18],
  power: [9, 9],
  pill: [14, 6],
  led: [2, 2],
  lock: [7, 3.2],
  antenna: [6, 6],
};

/** [kind, across the face from its middle as you look at it, up from the body's underside (on the top: away from the viewer), turned on its side]. */
export type Socket = readonly [SocketKind, number, number, 1?];
export type FaceId = "front" | "back" | "left" | "right" | "top";
export type Faces<T> = Partial<Record<FaceId, readonly T[]>>;

export interface Plate {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  m: Material;
  raised?: number;
}

export interface Vent {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Cut slits, wider bars, or a field of holes the viewer paints. */
  kind: "slits" | "bars" | "mesh" | "hex";
  n?: number;
  m?: Material;
}

export interface NucBox {
  form: "box";
  size: readonly [number, number, number];
  shell: Material;
  corner?: number;
  edge?: number;
  /** Corners cut straight instead of round. */
  chamfer?: number;
  lid?: { h: number; m: Material; inset?: number; edge?: number; dots?: number };
  foot?: number;
  /** Stands upright on a low stand, this high. The size's height leaves it out. */
  stand?: { h: number };
  /** Cooling fins in place of a lid. */
  fins?: { n: number; h: number; along?: "x" | "z"; inset?: number };
  /** A strip of another colour round the body. */
  band?: { y: number; h: number; m: Material };
  sockets: Faces<Socket>;
  plates?: Faces<Plate>;
  vents?: Faces<Vent>;
}

export interface CardBody {
  form: "card";
  size: readonly [number, number, number];
}

export interface BladeBody {
  form: "blade";
  size: readonly [number, number, number];
  shroud?: Material;
  sockets: readonly Socket[];
}

export interface BoardBody {
  form: "board";
  size: readonly [number, number, number];
  pcb?: Material;
  /** The fan's height over the board; 0 for none. */
  blower: number;
  /** On a steel tray, with a heat plate up to its full height. */
  tray?: boolean;
  sockets: Faces<Socket>;
}

export interface LaptopBody {
  form: "laptop";
  size: readonly [number, number, number];
  shell: Material;
  screen: readonly [number, number];
  u: number;
}

export type NucBody = NucBox | CardBody | BladeBody | BoardBody | LaptopBody;

// the looks that repeat
const GLOSS = { h: 4, m: "plastic-gloss", edge: 1.2 } as const;
const MATTE = { h: 2.4, m: "plastic-black", inset: 1.4, edge: 0.6 } as const;
const side = (H: number, n = 16): Vent => ({ x: 0, y: H / 2 + 2, w: 70, h: Math.max(8, H * 0.42), kind: "slits", n });
const meshSide = (H: number): Vent => ({ x: 0, y: H / 2, w: 84, h: H - 16, kind: "mesh", n: 34 });
const teeth = (y: number, n = 16, w = 96): Vent => ({ x: 0, y, w, h: 5.6, kind: "bars", n });

/** A row of the long-lived small box: one call for one size and its sockets. */
const small = (W: number, D: number, H: number, shell: Material, lid: NucBox["lid"], sockets: Faces<Socket>, more: Partial<NucBox> = {}): NucBox => ({ form: "box", size: [W, D, H], shell, lid, sockets, corner: 7, ...more });

// the first black boxes: their sockets at the back, one at the front
const first = (back: readonly Socket[], front: readonly Socket[], lid: Material = "plastic-grey"): NucBox =>
  small(116.6, 112, 39, "plastic-black", { h: 6, m: lid, edge: 2.2 }, { front, back }, { corner: 12, vents: { left: [side(30, 14)], right: [side(30, 14)] } });

// silver with a black glass lid, a dark window at the front: Haswell to Skylake
const silver = (W: number, D: number, H: number, sockets: Faces<Socket>, win = 66): NucBox =>
  small(W, D, H, "alu", GLOSS, sockets, {
    vents: { left: [side(H)], right: [side(H)], back: [teeth(H - 11, 14, 88)] },
    plates: { front: [{ x: 0, y: H * 0.44, w: win, h: Math.min(16, H * 0.42), r: 6, m: "plastic-gloss" }] },
  });

// dark grey with the same lid: Kaby Lake to Comet Lake
const grey = (W: number, D: number, H: number, sockets: Faces<Socket>, win = 72): NucBox =>
  small(W, D, H, "plastic-grey", GLOSS, sockets, {
    vents: { left: [side(H)], right: [side(H)], back: [teeth(H - 11, 14, 88)] },
    plates: { front: [{ x: 0, y: H * 0.44, w: win, h: Math.min(16, H * 0.42), r: 6, m: "plastic-gloss" }] },
  });

// black all over, a thin lid, a vented side, the sockets in a shallow panel: the Pro kits from 2021
const pro = (D: number, H: number, sockets: Faces<Socket>, more: Partial<NucBox> = {}): NucBox =>
  small(117, D, H, "plastic-black", MATTE, sockets, {
    corner: 5,
    vents: { left: [meshSide(H)], right: [meshSide(H)], back: [teeth(H - 8, 18, 100)] },
    plates: { front: [{ x: -14, y: H * 0.38, w: 64, h: 13, r: 2, m: "plastic-char", raised: 0 }] },
    ...more,
  });

const proFront = (y: number): readonly Socket[] => [
  ["usb-blue", -34, y],
  ["usb-blue", -14, y],
  ["audio", 8, y],
  ["pill", 40, y],
];
const proBack = (y: number): readonly Socket[] => [
  ["dc", -47, y],
  ["hdmi", -29, y - 3],
  ["usb-c", -29, y + 4],
  ["rj45", -9, y],
  ["usb-blue", 9, y + 3.6],
  ["usb-a", 9, y - 3.6],
  ["usb-c", 30, y + 4],
  ["hdmi", 30, y - 3],
];

/** The ASUS years: the lid inset in a thin seam, a Copilot-era pill of a power button, USB-C first at the front. */
const asusFront = (y: number): readonly Socket[] => [
  ["usb-c", -40, y],
  ["usb-blue", -24, y],
  ["usb-blue", -6, y],
  ["pill", 36, y],
];

/** The long flat bodies: straight-cut corners, a low dark band of air holes all round. */
const longFlat = (W: number, D: number, H: number, sockets: Faces<Socket>, band: number): NucBox => ({
  form: "box",
  size: [W, D, H],
  shell: "plastic-black",
  chamfer: 12,
  edge: 1,
  foot: 1.6,
  lid: { h: 1.6, m: "matte-black", dots: 70, edge: 0.4, inset: 1 },
  sockets,
  vents: {
    left: [{ x: 0, y: band / 2 + 1, w: D - 40, h: band, kind: "hex", n: 26 }],
    right: [{ x: 0, y: band / 2 + 1, w: D - 40, h: band, kind: "hex", n: 26 }],
    back: [{ x: 0, y: H - 8, w: W - 50, h: 5, kind: "hex", n: 44 }],
  },
});

/** A slab standing on its stand: mesh down both big faces, sockets up its narrow ends. */
const upright = (W: number, D: number, H: number, sockets: Faces<Socket>, shell: Material = "plastic-black", ledge = 0.72): NucBox => ({
  form: "box",
  size: [W, D, H],
  shell,
  corner: 6,
  edge: 1.4,
  stand: { h: 14 },
  sockets,
  vents: {
    left: [{ x: -D * 0.1, y: H * 0.46, w: D * 0.46, h: H * ledge, kind: "mesh", n: 32 }],
    right: [{ x: D * 0.1, y: H * 0.46, w: D * 0.46, h: H * ledge, kind: "mesh", n: 32 }],
    back: [{ x: 0, y: H * 0.9, w: W - 16, h: H * 0.1, kind: "bars", n: 7 }],
  },
  plates: {
    left: [{ x: D * 0.3, y: H * 0.6, w: 8, h: H * 0.6, r: 3, m: "plastic-gloss" }],
    right: [{ x: -D * 0.3, y: H * 0.6, w: 8, h: H * 0.6, r: 3, m: "plastic-gloss" }],
  },
});

/** A tower of black steel with mesh sides. */
const tower = (W: number, D: number, H: number, sockets: Faces<Socket>, plates: Faces<Plate>, vents: Faces<Vent> = {}): NucBox => ({
  form: "box",
  size: [W, D, H],
  shell: "plastic-black",
  corner: 7,
  edge: 2,
  foot: 4,
  sockets,
  plates,
  vents: {
    left: [{ x: 0, y: H / 2, w: D - 26, h: H - 26, kind: "mesh", n: 72 }],
    right: [{ x: 0, y: H / 2, w: D - 26, h: H - 26, kind: "mesh", n: 72 }],
    top: [{ x: 0, y: 0, w: W - 22, h: D - 26, kind: "mesh", n: 28 }],
    ...vents,
  },
});

const finned = (W: number, D: number, H: number, fins: NonNullable<NucBox["fins"]>, sockets: Faces<Socket>, foot = 3.4): NucBox => ({ form: "box", size: [W, D, H], shell: "case-black", corner: 3, edge: 0.8, foot, fins, sockets });

const LAPTOP_15: Pick<LaptopBody, "form" | "shell" | "screen" | "u"> = { form: "laptop", shell: "shell-graphite", screen: [345, 194], u: 18 };

const board4 = (W: number, D: number, H: number, sockets: Faces<Socket>, blower = 12): BoardBody => ({ form: "board", size: [W, D, H], blower, sockets });

export const NUC_BODIES: Readonly<Record<string, NucBody>> = {
  // 2013: first the black boxes
  "nuc-deep-canyon": first(
    [
      ["dc", -44, 16],
      ["usb-a", -24, 16],
      ["hdmi", -4, 16],
      ["hdmi", 16, 16],
      ["rj45", 38, 16],
    ],
    [
      ["usb-a", -28, 16],
      ["led", 40, 16],
    ],
  ),
  "nuc-box-canyon": first(
    [
      ["dc", -44, 16],
      ["usb-a", -24, 16],
      ["hdmi", -2, 16],
      ["dp-mini", 18, 16],
    ],
    [
      ["usb-a", -28, 16],
      ["led", 40, 16],
    ],
    "lid-red",
  ),
  "nuc-horse-canyon": first(
    [
      ["dc", -46, 16],
      ["usb-a", -28, 16],
      ["hdmi", -8, 16],
      ["dp-mini", 8, 16],
      ["dp-mini", 19, 16],
      ["rj45", 38, 16],
    ],
    [
      ["usb-blue", -28, 16],
      ["led", 40, 16],
    ],
  ),
  // 2013 and 2014: silver under black glass
  "nuc-forest-canyon": silver(
    116.6,
    112,
    51.5,
    {
      front: [
        ["usb-blue", -38, 20],
        ["ir", 24, 22],
      ],
      back: [
        ["audio", -42, 22],
        ["dc", -42, 11],
        ["hdmi", -20, 18],
        ["rj45", 2, 18],
        ["usb-a", 24, 22],
        ["usb-a", 24, 13],
      ],
      left: [["lock", 40, 12]],
    },
    60,
  ),
  "nuc-thin-canyon": finned(190, 116, 40, { n: 30, h: 18, along: "z", inset: 4 }, {
    front: [
      ["usb-blue", -70, 12],
      ["power", 76, 12],
      ["led", 62, 12],
    ],
    back: [
      ["dc", -78, 12],
      ["audio", -62, 12],
      ["usb-a", -46, 12],
      ["usb-a", -28, 12],
      ["rj45", -8, 12],
      ["vga", 18, 12],
      ["hdmi", 46, 12],
    ],
  }),
  "nuc-wilson-canyon-slim": silver(116.6, 112, 34.5, wilson(14), 44),
  "nuc-wilson-canyon-tall": silver(116.6, 112, 51.5, wilson(22), 44),
  // 2015: Broadwell and Braswell
  "nuc-rock-canyon-slim": silver(115, 111, 34.5, rock(13), 58),
  "nuc-rock-canyon-tall": silver(115, 111, 49, rock(20), 58),
  "nuc-maple-canyon": silver(
    115,
    111,
    49,
    {
      front: rock(20).front,
      top: rock(20).top,
      back: [
        ["dc", -44, 15],
        ["dp-mini", -24, 15],
        ["dp-mini", -12, 15],
        ["rj45", 6, 15],
        ["usb-blue", 28, 19],
        ["usb-blue", 28, 11],
      ],
    },
    58,
  ),
  "nuc-pinnacle-canyon": silver(115, 111, 52, braswell(), 60),
  // 2015 and 2016: Skylake and Apollo Lake
  "nuc-swift-canyon-slim": silver(115, 111, 32, swift(14), 46),
  "nuc-swift-canyon-tall": silver(115, 111, 48, swift(20), 46),
  "nuc-skull-canyon": longFlat(
    211,
    116,
    28,
    {
      front: [
        ["power", -84, 12],
        ["sd", -52, 12],
        ["usb-blue", -24, 12],
        ["usb-amber", -6, 12],
        ["audio", 10, 12],
        ["ir", 26, 12],
      ],
      back: [
        ["dc", -72, 10],
        ["audio", -56, 10],
        ["rj45", -40, 10],
        ["usb-blue", -20, 10],
        ["usb-blue", -2, 10],
        ["dp-mini", 14, 10],
        ["hdmi", 34, 10],
        ["usb-c", 54, 10],
      ],
    },
    10,
  ),
  "nuc-arches-canyon": silver(115, 111, 51, braswell(), 60),
  // 2017: Kaby Lake and Gemini Lake
  "nuc-baby-canyon-slim": grey(115, 111, 35, baby(14), 46),
  "nuc-baby-canyon-tall": grey(115, 111, 51, baby(21), 46),
  "nuc-dawson-canyon-slim": pro(111, 36, dawson(14), { size: [115, 111, 36] }),
  "nuc-dawson-canyon-tall": pro(111, 52, dawson(21), { size: [115, 111, 52] }),
  "nuc-june-canyon": grey(115, 111, 51, {
    front: [
      ["usb-blue", -24, 21],
      ["usb-amber", -6, 21],
      ["audio", 12, 21],
      ["ir", 28, 21],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -44, 14],
      ["audio", -44, 26],
      ["hdmi", -24, 14],
      ["hdmi", -24, 26],
      ["rj45", -2, 16],
      ["usb-blue", 20, 21],
      ["usb-blue", 20, 12],
    ],
    left: [["sd", 0, 26]],
  }),
  // 2018 and 2019: Hades, Bean, Crimson, Islay, Provo, Chaco
  "nuc-hades-canyon": longFlat(
    221,
    142,
    39,
    {
      front: [
        ["power", -90, 20],
        ["sd", -60, 20],
        ["hdmi", -30, 20],
        ["usb-c", -12, 20],
        ["usb-blue", 4, 20],
        ["usb-amber", 22, 20],
        ["audio", 38, 20],
        ["ir", 52, 20],
      ],
      back: [
        ["dc", -92, 16],
        ["audio", -78, 16],
        ["usb-blue", -60, 21],
        ["usb-blue", -60, 11],
        ["usb-blue", -42, 21],
        ["usb-blue", -42, 11],
        ["rj45", -22, 16],
        ["rj45", -6, 16],
        ["usb-c", 10, 21],
        ["usb-c", 10, 11],
        ["hdmi", 30, 16],
        ["dp-mini", 48, 21],
        ["dp-mini", 48, 11],
      ],
    },
    14,
  ),
  "nuc-bean-canyon-slim": grey(117, 112, 36, bean(15), 46),
  "nuc-bean-canyon-tall": grey(117, 112, 51, bean(21), 46),
  "nuc-crimson-canyon": grey(117, 112, 51, {
    front: [
      ["usb-blue", -24, 21],
      ["usb-amber", -6, 21],
      ["audio", 12, 21],
      ["ir", 28, 21],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -46, 14],
      ["hdmi", -26, 14],
      ["hdmi", -26, 26],
      ["rj45", -2, 16],
      ["usb-blue", 20, 21],
      ["usb-blue", 20, 12],
    ],
  }),
  "nuc-islay-canyon": grey(117, 112, 51, {
    front: [
      ["usb-c", -28, 21],
      ["usb-blue", -10, 21],
      ["audio", 8, 21],
      ["ir", 24, 21],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -46, 14],
      ["hdmi", -26, 14],
      ["dp-mini", -26, 26],
      ["rj45", -2, 16],
      ["usb-blue", 20, 21],
      ["usb-blue", 20, 12],
    ],
  }),
  "nuc-provo-canyon-slim": pro(112, 37, provo(15)),
  "nuc-provo-canyon-tall": pro(112, 53, provo(21)),
  "nuc-chaco-canyon": finned(154, 108, 32, { n: 24, h: 8, along: "z", inset: 4 }, {
    front: [
      ["usb-blue", -56, 10],
      ["audio", -40, 10],
      ["power", 62, 10],
      ["led", 50, 10],
    ],
    back: [
      ["dc", -64, 10],
      ["usb-a", -48, 10],
      ["usb-a", -30, 10],
      ["usb-blue", -12, 10],
      ["rj45", 8, 10],
      ["hdmi", 30, 10],
      ["hdmi", 50, 10],
    ],
  }),
  // the elements
  "nuc-compute-element": { form: "card", size: [95, 65, 6] },
  "nuc-assembly-element": {
    form: "board",
    size: [117, 147, 25],
    blower: 2,
    tray: true,
    sockets: {
      front: [
        ["dc", -46, 14],
        ["usb-blue", -26, 16],
        ["usb-blue", -26, 8],
        ["usb-blue", -8, 16],
        ["usb-blue", -8, 8],
        ["rj45", 12, 12],
        ["hdmi", 34, 12],
      ],
    },
  },
  "nuc-pro-chassis-element": small(
    200,
    150,
    35,
    "alu-dark",
    { h: 1.6, m: "plastic-black", edge: 0.4, inset: 2 },
    {
      front: [
        ["usb-a", -28, 14],
        ["usb-c", -6, 14],
        ["power", 84, 14],
        ["led", 72, 14],
      ],
      back: [
        ["dc", -86, 12],
        ["audio", -70, 12],
        ["hdmi", -50, 12],
        ["hdmi", -30, 12],
        ["usb-blue", -12, 12],
        ["usb-blue", 6, 12],
        ["usb-a", 24, 12],
        ["usb-a", 42, 12],
        ["rj45", 62, 12],
      ],
    },
    { corner: 8, vents: { left: [side(35, 20)], right: [side(35, 20)], back: [{ x: -30, y: 28, w: 70, h: 6, kind: "bars", n: 18 }] } },
  ),
  "nuc-rugged-chassis-element": finned(254, 152.4, 40.8, { n: 36, h: 12, along: "z", inset: 4 }, {
    back: [
      ["antenna", -116, 14],
      ["dc", -96, 14],
      ["audio", -82, 14],
      ["usb-blue", -64, 14],
      ["usb-blue", -46, 14],
      ["rj45", -26, 14],
      ["rj45", -10, 14],
      ["hdmi", 12, 14],
      ["hdmi", 32, 14],
      ["serial", 62, 14],
      ["antenna", 116, 14],
    ],
    front: [
      ["usb-blue", -40, 14],
      ["power", 108, 14],
    ],
  }, 4.8),
  "nuc-compute-element-h": {
    form: "blade",
    size: [42, 238, 134],
    sockets: [
      ["usb-blue", 0, 110],
      ["usb-blue", 0, 92],
      ["rj45", 0, 74],
      ["hdmi", 0, 58],
      ["usb-c", 0, 46],
      ["usb-c", 0, 38],
    ],
  },
  "nuc-compute-element-shrike": {
    form: "blade",
    size: [47, 305, 137],
    sockets: [
      ["usb-blue", 0, 118],
      ["usb-blue", 0, 104],
      ["usb-blue", 0, 90],
      ["usb-blue", 0, 76],
      ["rj45", 0, 58],
      ["hdmi", 0, 42],
      ["audio", 0, 30],
    ],
  },
  // 2020: Ghost and Frost
  "nuc-ghost-canyon": tower(
    96,
    238,
    216,
    {
      front: [
        ["power", 0, 184],
        ["sd", 0, 150, 1],
        ["usb-blue", 0, 110, 1],
        ["usb-blue", 0, 88, 1],
        ["audio", 0, 68],
      ],
      back: [
        ["usb-blue", -10, 188],
        ["usb-blue", -10, 178],
        ["usb-blue", 10, 188],
        ["usb-blue", 10, 178],
        ["rj45", -10, 162],
        ["rj45", 10, 162],
        ["usb-c", -10, 148],
        ["usb-c", 10, 148],
        ["hdmi", 0, 136],
        ["audio", 0, 124],
        ["iec", -18, 26],
      ],
    },
    { back: [{ x: 0, y: 156, w: 54, h: 80, r: 2, m: "alu-dark" }] },
    { back: [{ x: 16, y: 26, w: 38, h: 38, kind: "mesh", n: 14 }, { x: 0, y: 76, w: 70, h: 40, kind: "bars", n: 10 }] },
  ),
  "nuc-frost-canyon-slim": grey(117, 112, 38, frost(15), 58),
  "nuc-frost-canyon-tall": grey(117, 112, 51, frost(21), 58),
  // 2021 and 2022: Phantom, Panther, Tiger, Atlas, Beast, Serpent, Wall Street
  "nuc-phantom-canyon": longFlat(
    221,
    142,
    42,
    {
      front: [
        ["power", -90, 20],
        ["sd", -58, 20],
        ["usb-blue", -30, 20],
        ["usb-amber", -12, 20],
        ["usb-c", 4, 20],
        ["audio", 18, 20],
        ["ir", 32, 20],
      ],
      back: [
        ["dc", -92, 16],
        ["audio", -78, 16],
        ["rj45", -60, 16],
        ["usb-blue", -40, 21],
        ["usb-blue", -40, 11],
        ["usb-blue", -22, 21],
        ["usb-blue", -22, 11],
        ["usb-c", -4, 16],
        ["hdmi", 16, 16],
        ["dp-mini", 34, 16],
      ],
    },
    16,
  ),
  "nuc-panther-canyon-slim": grey(117, 112, 38, panther(15), 58),
  "nuc-panther-canyon-tall": grey(117, 112, 51, panther(21), 58),
  "nuc-panther-canyon-pad": small(
    117,
    112,
    56,
    "plastic-grey",
    { h: 6, m: "plastic-gloss", edge: 1.2 },
    panther(21),
    {
      vents: { left: [side(56)], right: [side(56)], back: [teeth(45, 14, 88)] },
      plates: { front: [{ x: 0, y: 24, w: 58, h: 16, r: 6, m: "plastic-gloss" }], top: [{ x: 0, y: 0, w: 74, h: 74, r: 8, m: "plastic-char", raised: 0 }] },
    },
  ),
  "nuc-tiger-canyon-slim": pro(112, 37, tigerSockets(15)),
  "nuc-tiger-canyon-tall": pro(112, 54, tigerSockets(19)),
  "nuc-tiger-canyon-lan": pro(112, 54, lanBack(tigerSockets(19))),
  "nuc-atlas-canyon": small(
    135,
    115,
    36,
    "plastic-black",
    { h: 2.4, m: "plastic-black", edge: 0.6, inset: 1 },
    {
      front: [
        ["power", -54, 15],
        ["usb-blue", -32, 15],
        ["usb-blue", -12, 15],
        ["audio", 8, 15],
      ],
      back: [
        ["dc", -56, 15],
        ["usb-a", -38, 15],
        ["hdmi", -18, 15],
        ["dp", 2, 15],
        ["rj45", 22, 15],
        ["usb-blue", 40, 19],
        ["usb-blue", 40, 11],
        ["usb-a", 56, 15],
      ],
    },
    { corner: 5, vents: { back: [teeth(29, 24, 96)] } },
  ),
  "nuc-beast-canyon": tower(
    120,
    357,
    189,
    {
      front: [
        ["sd", -36, 13],
        ["usb-blue", -8, 13],
        ["usb-blue", 12, 13],
        ["usb-c", 30, 13],
        ["audio", 44, 13],
        ["power", 0, 34],
      ],
      back: [
        ["iec", 30, 166],
        ["usb-blue", -38, 134],
        ["usb-blue", -38, 124],
        ["usb-blue", -38, 114],
        ["usb-blue", -38, 104],
        ["usb-c", -38, 92],
        ["usb-c", -38, 84],
        ["rj45", -38, 70],
        ["hdmi", -38, 56],
        ["audio", -38, 44],
      ],
    },
    { front: [{ x: 0, y: 106, w: 92, h: 128, r: 6, m: "plastic-char" }], back: [{ x: -38, y: 88, w: 30, h: 110, r: 1, m: "alu-dark" }] },
    { front: [{ x: 0, y: 106, w: 86, h: 122, kind: "hex", n: 30 }], back: [{ x: 22, y: 60, w: 56, h: 84, kind: "bars", n: 8 }] },
  ),
  "nuc-serpent-canyon": upright(60, 180, 230, {
    front: [
      ["power", 0, 212],
      ["usb-c", 0, 188, 1],
      ["usb-blue", 0, 168, 1],
      ["usb-amber", 0, 148, 1],
      ["audio", 0, 130],
      ["sd", 0, 104, 1],
    ],
    back: [
      ["usb-blue", -10, 182, 1],
      ["usb-blue", 10, 182, 1],
      ["usb-blue", -10, 162, 1],
      ["usb-blue", 10, 162, 1],
      ["usb-c", 0, 144, 1],
      ["hdmi", 0, 124, 1],
      ["dp", -11, 100, 1],
      ["dp", 11, 100, 1],
      ["rj45", 0, 76],
      ["dc-rect", 0, 50],
    ],
  }),
  // the Wall Street kits keep their names
  "nuc-12-tall": pro(112, 54, tigerSockets(19)),
  "nuc-12-slim": pro(112, 37, tigerSockets(15)),
  "nuc-wall-street-canyon-lan": pro(112, 54, lanBack(tigerSockets(19))),
  // 2022 and 2023: Raptor, Arena, Vivid, Bravo
  "nuc-raptor-canyon": tower(
    129,
    337,
    318,
    {
      front: [
        ["usb-blue", -40, 16],
        ["usb-blue", -20, 16],
        ["usb-c", -4, 16],
        ["audio", 12, 16],
        ["power", 40, 16],
      ],
      back: [
        ["usb-blue", -40, 290],
        ["usb-blue", -40, 280],
        ["usb-blue", -40, 270],
        ["usb-blue", -40, 260],
        ["usb-blue", -40, 250],
        ["usb-blue", -40, 240],
        ["usb-c", -40, 228],
        ["usb-c", -40, 220],
        ["rj45", -40, 206],
        ["hdmi", -40, 192],
        ["iec", 26, 280],
      ],
    },
    { back: [{ x: -40, y: 244, w: 30, h: 110, r: 1, m: "alu-dark" }] },
    { front: [{ x: 0, y: 66, w: 80, h: 70, kind: "hex", n: 16 }], back: [{ x: 0, y: 90, w: 90, h: 130, kind: "bars", n: 7 }] },
  ),
  "nuc-arena-canyon-slim": pro(112, 37, tigerSockets(15)),
  "nuc-arena-canyon-tall": pro(112, 54, tigerSockets(19)),
  "nuc-vivid-canyon": small(117, 111, 37, "plastic-white", { h: 3, m: "plastic-white", edge: 1, inset: 0.6 }, tigerSockets(15), {
    corner: 6,
    vents: {
      left: [{ x: 0, y: 19, w: 86, h: 22, kind: "hex", n: 28, m: "plastic-white" }],
      right: [{ x: 0, y: 19, w: 86, h: 22, kind: "hex", n: 28, m: "plastic-white" }],
      back: [teeth(29, 18, 100)],
    },
  }),
  "nuc-bravo-canyon-fins": finned(174, 108, 39.2, { n: 22, h: 9, along: "z", inset: 3 }, bravo()),
  "nuc-bravo-canyon": finned(174, 108, 29.3, { n: 2, h: 0.8, along: "x", inset: 8 }, bravo()),
  // the ASUS years
  "nuc-revel-canyon-slim": small(117, 112, 37, "plastic-black", { h: 3, m: "plastic-black", edge: 0.8, inset: 1.6 }, asusSockets(15, tigerBack(15)), asusLook(37)),
  "nuc-revel-canyon-tall": small(117, 112, 54, "plastic-black", { h: 3, m: "plastic-black", edge: 0.8, inset: 1.6 }, asusSockets(19, tigerBack(19)), asusLook(54)),
  "nuc-revel-canyon-plus": small(144, 112, 41, "alu", { h: 3, m: "alu", edge: 0.8, inset: 1.6 }, asusSockets(15, wideBack(15)), asusLook(41, 112)),
  "nuc-lunar-canyon": lunar("plastic-char"),
  "nuc-lunar-canyon-plus": lunar("black-glass"),
  "nuc-mill-canyon": small(135, 115, 36, "plastic-black", { h: 2.4, m: "plastic-black", edge: 0.6, inset: 1 }, mill(15), { corner: 5, vents: { back: [teeth(29, 24, 96)] } }),
  "nuc-mill-canyon-fanless": small(135, 115, 48.2, "plastic-black", { h: 3, m: "plastic-char", edge: 0.6, inset: 1, dots: 44 }, mill(14), { corner: 8, foot: 3.2, vents: { back: [teeth(40, 24, 96)] } }),
  "nuc-scorpion-canyon": upright(60, 180, 270, rogSockets(250, ["dp", "dp"])),
  "nuc-jean-canyon": upright(56.5, 187.7, 282.4, rogSockets(262, ["hdmi", "dp"])),
  "nuc-rog-16": upright(56.5, 189.5, 282.5, rogSockets(262, ["hdmi", "dp"]), "plastic-black", 0.5),
  "nuc-cyber-canyon-slim": small(117, 112, 36.8, "plastic-black", { h: 3, m: "plastic-black", edge: 0.8, inset: 1.6 }, asusSockets(14, tigerBack(14)), asusLook(36.8)),
  "nuc-cyber-canyon-tall": small(117, 112, 54, "plastic-black", { h: 3, m: "plastic-black", edge: 0.8, inset: 1.6 }, asusSockets(19, tigerBack(19)), asusLook(54)),
  "nuc-cyber-canyon-plus": small(144, 112, 41.8, "alu", { h: 3, m: "alu", edge: 0.8, inset: 1.6 }, asusSockets(15, wideBack(15)), asusLook(41.8, 112)),
  "nuc-grand-canyon": small(144, 117, 42, "plastic-black", { h: 2, m: "plastic-black", edge: 0.6, inset: 0.4 }, grand(16, false), { corner: 8, vents: { left: [meshSide(42)], right: [meshSide(42)], back: [teeth(35, 24, 116)] } }),
  "nuc-16": small(144, 117, 42, "plastic-black", { h: 2, m: "plastic-black", edge: 0.6, inset: 0.4 }, grand(16, true), { corner: 8, vents: { left: [meshSide(42)], right: [meshSide(42)], back: [teeth(35, 24, 116)] } }),
  // bare boards
  "nuc-board": board4(101.6, 101.6, 28.8, {
    back: [
      ["dc", -40, 9],
      ["hdmi", -22, 7],
      ["rj45", -2, 9],
      ["usb-blue", 19, 13],
      ["usb-a", 19, 6],
      ["usb-c", 38, 7],
    ],
    front: [
      ["usb-blue", -26, 7],
      ["usb-blue", -8, 7],
      ["audio", 12, 7],
    ],
  }),
  "nuc-board-sbc": board4(146, 101.7, 17.39, {
    back: [
      ["dc", -62, 9],
      ["usb-a", -44, 8],
      ["usb-a", -26, 8],
      ["usb-blue", -8, 8],
      ["rj45", 12, 9],
      ["rj45", 28, 9],
      ["hdmi", 48, 7],
      ["hdmi", 64, 7],
    ],
  }, 0),
  "nuc-board-element": board4(101.6, 147, 20, {
    front: [
      ["dc", -40, 9],
      ["usb-blue", -22, 11],
      ["usb-blue", -22, 5],
      ["usb-blue", -4, 11],
      ["usb-blue", -4, 5],
      ["rj45", 16, 9],
      ["hdmi", 37, 7],
    ],
  }, 0),
  // laptops
  "nuc-queens-county": { ...LAPTOP_15, size: [356.4, 233.6, 20.5] },
  "nuc-king-county": { ...LAPTOP_15, size: [357, 235, 21.65] },
  "nuc-bishop-county": { ...LAPTOP_15, shell: "shell-silver", size: [355, 230, 14.9] },
  "nuc-p14e": { ...LAPTOP_15, shell: "shell-silver", screen: [298, 168], u: 15, size: [304, 230, 16.5] },
};

// the sockets of one generation; `y` is the height of their row, so a tall kit's and a slim kit's are one description
function wilson(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-blue", -38, y],
      ["usb-blue", -20, y],
      ["ir", 22, y],
    ],
    back: [
      ["dc", -44, y],
      ["hdmi-mini", -27, y],
      ["dp-mini", -12, y],
      ["rj45", 6, y],
      ["usb-blue", 28, y + 3],
      ["usb-blue", 44, y + 3],
    ],
  };
}

function rock(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-blue", -16, y],
      ["usb-amber", 2, y],
      ["audio", 18, y],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -44, y],
      ["hdmi-mini", -27, y],
      ["dp-mini", -13, y],
      ["rj45", 5, y],
      ["usb-blue", 25, y],
      ["usb-blue", 42, y],
    ],
  };
}

function braswell(): Faces<Socket> {
  return {
    front: [
      ["usb-blue", -20, 22],
      ["usb-amber", -2, 22],
      ["audio", 16, 22],
      ["ir", 30, 22],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -44, 16],
      ["audio", -44, 28],
      ["hdmi", -24, 28],
      ["vga", -24, 14],
      ["rj45", 2, 18],
      ["usb-blue", 24, 23],
      ["usb-blue", 24, 13],
    ],
    left: [["sd", 0, 28]],
  };
}

function swift(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-blue", -14, y],
      ["usb-amber", 6, y],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -44, y],
      ["dp-mini", -28, y],
      ["hdmi", -10, y],
      ["rj45", 10, y],
      ["usb-blue", 28, y + 3],
      ["usb-blue", 45, y + 3],
    ],
    left: [["sd", 0, y]],
  };
}

function baby(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-blue", -14, y],
      ["usb-amber", 6, y],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -44, y],
      ["usb-c", -28, y],
      ["hdmi", -10, y],
      ["rj45", 10, y],
      ["usb-blue", 28, y + 3],
      ["usb-blue", 45, y + 3],
    ],
    left: [["sd", 0, y]],
  };
}

function dawson(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-blue", -34, y],
      ["usb-blue", -14, y],
      ["pill", 40, y],
    ],
    back: [
      ["dc", -46, y],
      ["hdmi", -28, y],
      ["rj45", -8, y],
      ["usb-blue", 11, y + 3.4],
      ["usb-a", 11, y - 3.4],
      ["hdmi", 32, y],
    ],
  };
}

function bean(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-blue", -16, y],
      ["usb-amber", 4, y],
      ["audio", 18, y],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -46, y],
      ["hdmi", -28, y],
      ["rj45", -8, y],
      ["usb-blue", 11, y + 3.4],
      ["usb-blue", 11, y - 3.4],
      ["usb-c", 30, y],
      ["usb-blue", 45, y],
    ],
    left: [["sd", 0, y]],
  };
}

function provo(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-c", -34, y],
      ["usb-blue", -18, y],
      ["audio", 0, y],
      ["pill", 40, y],
    ],
    back: [
      ["dc", -46, y],
      ["hdmi", -28, y],
      ["usb-c", -28, y + 6],
      ["rj45", -8, y],
      ["usb-blue", 11, y + 3.4],
      ["usb-a", 11, y - 3.4],
      ["hdmi", 32, y],
    ],
  };
}

function frost(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-c", -22, y],
      ["usb-blue", -6, y],
      ["audio", 10, y],
      ["ir", 22, y],
    ],
    top: [["power", -44, -42]],
    back: [
      ["dc", -46, y],
      ["hdmi", -28, y],
      ["rj45", -8, y],
      ["usb-blue", 11, y + 3.4],
      ["usb-blue", 11, y - 3.4],
      ["usb-c", 30, y],
    ],
    left: [["sd", 0, y]],
  };
}

function panther(y: number): Faces<Socket> {
  return {
    front: [
      ["usb-c", -22, y],
      ["usb-blue", -6, y],
      ["audio", 10, y],
      ["ir", 22, y],
    ],
    top: [["power", -46, -44]],
    back: [
      ["dc", -46, y],
      ["hdmi", -28, y],
      ["dp-mini", -28, y + 8],
      ["rj45", -8, y],
      ["usb-blue", 11, y + 3.4],
      ["usb-blue", 11, y - 3.4],
      ["usb-c", 30, y],
    ],
    left: [["sd", 0, y]],
  };
}

function tigerSockets(y: number): Faces<Socket> {
  return { front: proFront(y), back: proBack(y), left: [["lock", 44, y - 8]] };
}

function tigerBack(y: number): readonly Socket[] {
  return proBack(y);
}

function lanBack(s: Faces<Socket>): Faces<Socket> {
  return {
    ...s,
    back: [
      ...(s.back ?? []),
      ["rj45", 0, 37],
      ["usb-a", 24, 38],
      ["usb-a", -24, 38],
    ],
  };
}

function asusSockets(y: number, back: readonly Socket[]): Faces<Socket> {
  return { front: asusFront(y), back, left: [["lock", 44, y - 8]] };
}

function asusLook(H: number, W = 117): Partial<NucBox> {
  return { corner: 4, vents: { left: [meshSide(H)], right: [meshSide(H)], back: [teeth(H - 8, Math.round(W / 6), W - 17)] } };
}

function wideBack(y: number): readonly Socket[] {
  return [
    ["dc", -58, y],
    ["hdmi", -38, y - 3],
    ["usb-c", -38, y + 4],
    ["rj45", -14, y],
    ["usb-blue", 8, y + 3.6],
    ["usb-a", 8, y - 3.6],
    ["usb-c", 34, y + 4],
    ["hdmi", 34, y - 3],
    ["lock", 58, y],
  ];
}

function lunar(top: Material): NucBox {
  const panel = top === "black-glass";
  return {
    form: "box",
    size: [130, 130, 34],
    shell: "plastic-black",
    corner: 22,
    edge: 2.6,
    foot: 2,
    lid: { h: 3, m: "plastic-char", edge: 1, dots: 70, inset: 1 },
    sockets: {
      front: [
        ["power", -46, 14],
        ["audio", -30, 14],
        ["usb-blue", -14, 14],
        ["usb-blue", 4, 14],
        ["usb-c", 22, 14],
      ],
      back: [
        ["dc", -46, 14],
        ["hdmi", -26, 14],
        ["usb-c", -8, 14],
        ["rj45", 10, 14],
        ["usb-blue", 28, 14],
        ["usb-blue", 46, 14],
      ],
      left: [["lock", 46, 12]],
    },
    plates: panel
      ? {
          top: [
            { x: 0, y: 0, w: 92, h: 92, r: 14, m: "plastic-black", raised: 0.1 },
            { x: 0, y: 0, w: 70, h: 54, r: 3, m: "epaper-white", raised: 0.2 },
          ],
        }
      : { top: [{ x: 40, y: 40, w: 12, h: 12, r: 6, m: "black-glass", raised: 0.1 }] },
  };
}

function mill(y: number): Faces<Socket> {
  return {
    front: [
      ["power", -54, y],
      ["usb-c", -34, y],
      ["usb-blue", -18, y],
      ["usb-blue", 0, y],
      ["audio", 18, y],
    ],
    back: [
      ["dc", -56, y],
      ["usb-a", -38, y],
      ["hdmi", -18, y],
      ["dp", 2, y],
      ["rj45", 22, y],
      ["usb-blue", 40, y + 3.4],
      ["usb-blue", 40, y - 3.4],
      ["usb-c", 56, y],
    ],
    left: [["lock", 46, y]],
  };
}

function grand(y: number, jack: boolean): Faces<Socket> {
  return {
    front: [
      ...(jack ? ([["audio", -56, y]] as Socket[]) : []),
      ["usb-blue", -40, y],
      ["usb-blue", -20, y],
      ["usb-c", -2, y],
      ["pill", 50, y],
    ],
    back: [
      ["dc", -60, y],
      ["hdmi", -40, y],
      ["usb-c", -40, y + 7],
      ["rj45", -18, y],
      ["usb-blue", 4, y + 3.4],
      ["usb-blue", 4, y - 3.4],
      ["rj45", 26, y],
      ...(jack ? ([] as Socket[]) : ([["usb-c", 48, y + 7]] as Socket[])),
      ["hdmi", 48, y],
    ],
    left: [["lock", 46, y]],
  };
}

function bravo(): Faces<Socket> {
  return {
    back: [
      ["antenna", -78, 12],
      ["dc", -62, 12],
      ["usb-a", -44, 12],
      ["usb-blue", -26, 12],
      ["usb-blue", -8, 12],
      ["rj45", 10, 12],
      ["rj45", 26, 12],
      ["hdmi", 46, 12],
      ["hdmi", 64, 12],
      ["antenna", 80, 12],
    ],
    front: [
      ["power", -70, 12],
      ["led", -58, 12],
      ["lock", 70, 12],
    ],
  };
}

function rogSockets(top: number, displays: readonly [SocketKind, SocketKind]): Faces<Socket> {
  return {
    front: [
      ["power", 0, top],
      ["usb-blue", 0, top - 22, 1],
      ["usb-blue", 0, top - 42, 1],
      ["usb-c", 0, top - 58, 1],
      ["audio", 0, top - 72],
    ],
    back: [
      ["usb-c", 0, top - 40, 1],
      ["usb-blue", -11, top - 60, 1],
      ["usb-blue", 11, top - 60, 1],
      ["usb-blue", -11, top - 80, 1],
      ["usb-blue", 11, top - 80, 1],
      [displays[0], -11, top - 104, 1],
      [displays[0], 11, top - 104, 1],
      [displays[1], -11, top - 128, 1],
      [displays[1], 11, top - 128, 1],
      ["rj45", 0, top - 150],
      ["dc-rect", 0, top - 172],
      ["lock", 0, top - 190],
    ],
  };
}
