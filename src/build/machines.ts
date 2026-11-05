// Well-known machines, each one body with marks on its front and top: one description for its mesh and its drawing, placed from its published size. Plain geometry: no mark or logo.
import * as THREE from "three";
import { type Box, box, cyl, type Material, plate, rbox, roundedSquare, torus, tube, type Vec3 } from "./kit.ts";

export type MarkKind = "screen" | "lcd" | "dark" | "panel" | "slot" | "key" | "light";

export interface Mark {
  face: "front" | "top" | "back";
  kind: MarkKind;
  /** Across the machine from its middle. */
  x: number;
  /** Up the front from the desk, or along the top from its middle towards the viewer. */
  y: number;
  w: number;
  h: number;
  /** A round mark: `w` is its diameter. */
  round?: boolean;
  /** A mark in a material of its own. The kind still decides the drawing. */
  material?: Material;
  /** How far the mark stands out from its face, so one mark can sit on another. */
  out?: number;
  /** A block of marks, centred on (x, y). */
  cols?: number;
  rows?: number;
  gap?: number;
  /** How far the middle of a row sits below its ends, so the row smiles. */
  bow?: number;
}

export interface MachineSpec {
  size: readonly [number, number, number];
  body: Material;
  corner: number;
  marks: readonly Mark[];
  /** A rod rising from the top. The length is a drawing, not a measured axis. */
  antenna?: number;
  /** Not one block: its own shape, in its size. */
  shape?: "headphones" | "headset" | "can" | "dynatac" | "flip" | "shell";
  /** Hinge, up from the desk, on the open phone the marks were measured on. */
  hinge?: number;
  /** How far the lid leans back from upright. 20 degrees is open at about 160. */
  lean?: number;
  /** Thickness of the lower half. The size's depth is the closed phone. */
  half?: number;
  /** Thickness of the lid, when it is not the same as the lower half. */
  lidThick?: number;
  /** A thicker lip at the bottom, this tall. */
  chin?: number;
  /** How far each side tucks in at the middle, for a waisted shell. */
  waist?: number;
}

/** Points along the band over the head of a pair of headphones, or round the back of a headset. */
export function bandPoints(shape: "headphones" | "headset", w: number, d: number, h: number): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = (Math.PI * i) / 16;
    if (shape === "headphones") points.push([(w / 2 - 17) * Math.cos(t), 100 + (h - 100 - 6) * Math.sin(t), 0]);
    else points.push([(w / 2 - 6) * Math.cos(t), h / 2, -d / 6 - (d / 3 + d / 6 - 6) * Math.sin(t)]);
  }
  return points;
}

const front = (kind: MarkKind, x: number, y: number, w: number, h: number, more: Partial<Mark> = {}): Mark => ({ face: "front", kind, x, y, w, h, ...more });
const back = (kind: MarkKind, x: number, y: number, w: number, h: number, more: Partial<Mark> = {}): Mark => ({ face: "back", kind, x, y, w, h, ...more });
const top = (kind: MarkKind, x: number, y: number, w: number, h: number, more: Partial<Mark> = {}): Mark => ({ face: "top", kind, x, y, w, h, ...more });

/** A graphing calculator: a screen, one row under it, a round pad, and a block of keys. Places follow the photographs and are not measured. */
function graphing(size: readonly [number, number, number]): Mark[] {
  const [w, , h] = size;
  return [
    front("lcd", 0, h * 0.78, w * 0.68, h * 0.2),
    front("key", 0, h * 0.6, 10, 6, { cols: 5, rows: 1, gap: 3 }),
    front("key", w * 0.24, h * 0.44, 14, 14, { round: true }),
    front("key", -w * 0.06, h * 0.28, 8, 6, { cols: 5, rows: 4, gap: 2 }),
  ];
}

export const MACHINES: Readonly<Record<string, MachineSpec>> = {
  "game-boy-dmg-01": {
    size: [90, 32, 148],
    body: "plastic-grey",
    corner: 6,
    marks: [
      front("panel", 0, 106, 76, 62),
      front("lcd", 0, 108, 47, 43),
      front("light", -31, 110, 3, 3, { round: true }),
      front("key", -22, 54, 24, 8),
      front("key", -22, 54, 8, 24),
      front("key", 30, 62, 11, 11, { round: true }),
      front("key", 13, 54, 11, 11, { round: true }),
      front("dark", -9, 28, 12, 3),
      front("dark", 9, 28, 12, 3),
      front("dark", 29, 15, 2.4, 16, { cols: 6, rows: 1, gap: 2.2 }),
    ],
  },
  "nokia-3310": {
    size: [48, 22, 113],
    body: "plastic-char",
    corner: 9,
    marks: [front("panel", 0, 84, 38, 34), front("lcd", 0, 85, 30, 22), front("key", 0, 58, 20, 7), front("key", 0, 30, 9, 5, { cols: 3, rows: 4, gap: 3 })],
  },
  "palm-iii": {
    size: [81, 18, 119],
    body: "plastic-char",
    corner: 7,
    marks: [front("lcd", 0, 74, 58, 58), front("dark", 0, 32, 60, 18), front("key", 0, 13, 10, 6, { cols: 4, rows: 1, gap: 6 })],
  },
  // The list already assigns the axes. A straight-on photograph of this model, scaled to 120 mm tall, is 79 mm across. A dark slab, a screen, a writing panel, a green power key and four round keys around a small rocker. No word.
  "pilot-1000": {
    size: [80, 18, 120],
    body: "plastic-char",
    corner: 6,
    shape: "shell",
    marks: [
      front("screen", 0, 80, 64, 56, { out: 0.25 }),
      front("panel", 0, 50, 60, 20, { material: "pcb-green", out: 0.4 }),
      front("lcd", 0, 50, 26, 11, { material: "plastic-gloss", out: 0.55 }),
      front("key", -34, 18, 7, 7, { material: "pcb-green", out: 0.45 }),
      front("key", -22, 17, 8, 8, { round: true, material: "plastic-grey", out: 0.4 }),
      front("key", -10, 17, 8, 8, { round: true, material: "plastic-grey", out: 0.4 }),
      front("key", 2, 20, 8, 2.4, { material: "plastic-grey", out: 0.4 }),
      front("key", 2, 15, 8, 2.4, { material: "plastic-grey", out: 0.4 }),
      front("key", 14, 17, 8, 8, { round: true, material: "plastic-grey", out: 0.4 }),
      front("key", 26, 17, 8, 8, { round: true, material: "plastic-grey", out: 0.4 }),
    ],
  },
  // The list already assigns the axes. A nearly straight photograph of the black one, a little high. A dark slab, ribbed edges, a green-grey screen, four round keys and a wider centre key. No word.
  "visor-deluxe": {
    size: [76.2, 17.8, 121.9],
    body: "plastic-black",
    corner: 8,
    shape: "shell",
    marks: [
      front("slot", -35, 80, 1, 62, { cols: 3, rows: 1, gap: 1, material: "plastic-char", out: 0.35 }),
      front("slot", 35, 80, 1, 62, { cols: 3, rows: 1, gap: 1, material: "plastic-char", out: 0.35 }),
      front("screen", 0, 80, 60, 72, { material: "lcd-grey", out: 0.3 }),
      front("slot", 0, 50, 56, 0.7, { material: "plastic-char", out: 0.45 }),
      front("light", -32, 26, 3, 3, { round: true, material: "pcb-green", out: 0.5 }),
      front("key", -26, 18, 8, 8, { round: true, material: "alu", out: 0.45 }),
      front("key", -14, 18, 8, 8, { round: true, material: "alu", out: 0.45 }),
      front("key", 0, 18, 12, 7, { material: "alu", out: 0.45 }),
      front("key", 14, 18, 8, 8, { round: true, material: "alu", out: 0.45 }),
      front("key", 26, 18, 8, 8, { round: true, material: "alu", out: 0.45 }),
    ],
  },
  // The article labels height, width and depth. The list stores width, then depth, then height. A nearly straight photograph of the first one. A dark slab, a dark screen, a pen along the right edge and a speaker of small holes. No word.
  "messagepad-original-model": {
    size: [114.3, 19.1, 184.8],
    body: "plastic-black",
    corner: 10,
    shape: "shell",
    marks: [
      front("screen", 0, 112, 94, 112, { material: "black-glass", out: 0.25 }),
      front("panel", 0, 64, 86, 12, { material: "plastic-grey", out: 0.4 }),
      front("key", 62, 112, 5, 130, { material: "plastic-grey", out: 0.2 }),
      front("key", 32, 26, 2.4, 2.4, { round: true, cols: 4, rows: 3, gap: 1.8, material: "alu-dark", out: 0.4 }),
    ],
  },
  "wii-rvl-001": {
    size: [157, 197, 60],
    body: "plastic-white",
    corner: 5,
    marks: [front("slot", 0, 34, 124, 3), front("key", -68, 34, 6, 6, { round: true }), front("light", 70, 34, 3, 3, { round: true })],
  },
  "xbox-series-x": {
    size: [151, 151, 301],
    body: "plastic-black",
    corner: 5,
    marks: [top("dark", 0, 0, 130, 130, { round: true }), front("slot", -4, 250, 104, 3), front("key", 54, 272, 12, 12, { round: true }), front("dark", 56, 232, 10, 4)],
  },
  "playstation-2-fat": {
    size: [302.3, 182.9, 78.7],
    body: "matte-black",
    corner: 3,
    marks: [
      front("dark", 0, 40, 296, 2),
      front("slot", -40, 58, 180, 3),
      front("dark", -122, 20, 20, 9, { cols: 2, rows: 1, gap: 6 }),
      front("dark", -60, 20, 11, 6, { cols: 2, rows: 1, gap: 4 }),
      front("key", 132, 22, 9, 9, { round: true }),
      front("light", 118, 22, 3, 3, { round: true }),
    ],
  },
  "amiga-500": {
    size: [474, 330, 62],
    body: "plastic-white",
    corner: 6,
    marks: [
      top("key", -52, -80, 20, 14, { cols: 10, rows: 1, gap: 4 }),
      top("key", -52, 10, 20, 20, { cols: 14, rows: 5, gap: 3 }),
      top("key", 178, 10, 20, 20, { cols: 4, rows: 5, gap: 3 }),
      top("dark", 150, -110, 96, 8),
    ],
  },
  "zx-spectrum-16k-48k": {
    size: [233, 144, 30],
    body: "plastic-black",
    corner: 3,
    marks: [top("key", 0, 22, 16, 14, { cols: 10, rows: 4, gap: 6 }), top("dark", 0, -52, 214, 4)],
  },
  "airpods-1": {
    size: [44.3, 21.3, 53.5],
    body: "plastic-white",
    corner: 8,
    marks: [front("dark", 0, 38, 37, 0.6), front("light", 0, 26, 2, 2, { round: true })],
  },
  "airpods-pro-1": {
    size: [60.6, 21.7, 45.2],
    body: "plastic-white",
    corner: 9,
    marks: [front("dark", 0, 30, 52, 0.6), front("light", 0, 18, 2, 2, { round: true })],
  },
  "airpods-max": { size: [168.6, 83.4, 187.3], body: "alu", corner: 16, marks: [], shape: "headphones" },
  "apple-vision-pro": { size: [190, 120, 110], body: "alu", corner: 26, marks: [], shape: "headset" },
  "nintendo-64": {
    size: [260, 190, 73],
    body: "plastic-char",
    corner: 18,
    marks: [top("panel", 0, -30, 110, 34), top("slot", 0, -30, 84, 8), front("dark", 0, 22, 24, 14, { cols: 4, rows: 1, gap: 14 }), top("key", -96, 52, 16, 9), top("key", 96, 52, 16, 9)],
  },
  "game-boy-advance-agb-001": {
    size: [144.5, 24.5, 82],
    body: "plastic-grey",
    corner: 12,
    marks: [front("panel", 0, 44, 76, 56), front("lcd", 0, 44, 61, 41), front("key", -55, 48, 18, 6), front("key", -55, 48, 6, 18), front("key", 57, 53, 11, 11, { round: true }), front("key", 46, 41, 11, 11, { round: true }), front("dark", -56, 18, 6, 2, { cols: 2, rows: 1, gap: 8 })],
  },
  "nintendo-ds-ntr-001": {
    size: [148.7, 28.9, 84.7],
    body: "plastic-grey",
    corner: 6,
    marks: [front("lcd", 0, 42, 62, 46), front("key", -50, 44, 16, 5), front("key", -50, 44, 5, 16), front("key", 50, 44, 7, 7, { round: true, cols: 2, rows: 2, gap: 4 }), front("dark", -50, 18, 8, 2, { cols: 2, rows: 1, gap: 4 })],
  },
  "nintendo-switch": {
    size: [238, 14, 102],
    body: "plastic-black",
    corner: 6,
    marks: [front("screen", 0, 51, 150, 90), front("key", -100, 72, 16, 16, { round: true }), front("key", 100, 42, 16, 16, { round: true }), front("key", -100, 38, 7, 7, { round: true, cols: 2, rows: 2, gap: 3 }), front("key", 100, 72, 7, 7, { round: true, cols: 2, rows: 2, gap: 3 })],
  },
  "playstation-4-original": {
    size: [304.8, 274.3, 53.1],
    body: "matte-black",
    corner: 2,
    marks: [front("dark", 0, 26, 300, 4), front("slot", -30, 40, 150, 2), front("dark", -120, 14, 11, 5, { cols: 2, rows: 1, gap: 6 }), top("dark", 0, -20, 304, 1.4), top("light", 0, 110, 3, 3, { round: true })],
  },
  "playstation-5": {
    size: [104, 260, 390],
    body: "plastic-white",
    corner: 18,
    marks: [front("dark", 0, 195, 40, 370), front("slot", -36, 225, 3, 110), front("key", 36, 330, 8, 8, { round: true }), front("dark", 36, 60, 12, 5)],
  },
  "apple-tv-4k-1st-generation": {
    size: [98, 98, 35],
    body: "plastic-black",
    corner: 12,
    marks: [front("light", 40, 12, 2, 2, { round: true })],
  },
  "ipod-nano-1st-generation": {
    size: [41, 6.9, 89],
    body: "plastic-white",
    corner: 5,
    marks: [front("lcd", 0, 69, 28, 22), front("panel", 0, 30, 30, 30, { round: true }), front("key", 0, 30, 11, 11, { round: true })],
  },
  dreamcast: {
    size: [190, 195.8, 75.5],
    body: "plastic-white",
    corner: 12,
    marks: [top("panel", 0, -20, 130, 130, { round: true }), top("key", 80, 58, 10, 10, { round: true }), front("dark", 0, 22, 28, 13, { cols: 4, rows: 1, gap: 12 })],
  },
  // A 1988 unit's photograph: the screen sits at the far end of the top, and the keys are four rows of ten. Places are a regular grid, not a measured drawing. The underside, with its battery door, is left plain.
  "hp-12c": {
    size: [128, 79, 15],
    body: "plastic-char",
    corner: 2,
    marks: [
      top("lcd", 0, -26, 70, 12),
      top("key", 0, -2, 8, 6, { cols: 10, rows: 1, gap: 2 }),
      top("key", 0, 6, 8, 6, { cols: 10, rows: 1, gap: 2 }),
      top("key", -25, 14, 8, 6, { cols: 5, rows: 1, gap: 2 }),
      top("key", -25, 22, 8, 6, { cols: 5, rows: 1, gap: 2 }),
      top("key", 5, 18, 8, 14),
      top("key", 30, 14, 8, 6, { cols: 4, rows: 1, gap: 2 }),
      top("key", 30, 22, 8, 6, { cols: 4, rows: 1, gap: 2 }),
    ],
  },
  // The same unlabeled Voyager triple, assigned the same way after a photograph: display at the far end, keys towards the viewer. The key field is a grid, not the HP-12C's tall key.
  "hp-15c": {
    size: [128, 79, 15],
    body: "plastic-char",
    corner: 2,
    marks: [top("lcd", 0, -26, 70, 12), top("key", 0, 8, 7, 5, { cols: 10, rows: 4, gap: 1.5 })],
  },
  // Width 81 mm and length 150 mm from the HP-35 page. Thickness is 33 mm, the larger end of the page's 18 to 33 mm, because the page gives no single thickness.
  "hp-35": {
    size: [81, 33, 150],
    body: "plastic-char",
    corner: 3,
    marks: [front("light", 0, 128, 54, 12), front("dark", 0, 114, 16, 5), front("key", 0, 62, 10, 7, { cols: 5, rows: 5, gap: 2 })],
  },
  // Texas Instruments lists 1.0 by 3.5 by 7.3 inches as height, width and length. That is 25.4 mm thick, 88.9 mm across and 185.4 mm tall.
  "ti-83": {
    size: [88.9, 25.4, 185.4],
    body: "plastic-char",
    corner: 8,
    marks: graphing([88.9, 25.4, 185.4]),
  },
  // The size page's TI-84 Plus row matches its TI-89 Titanium row and does not match the photograph, so it is not used. 90 by 24 by 180 mm is a stand-in, not a measurement. The back photograph shows a battery door; the front is the silver-top body.
  "ti-84-plus": {
    size: [90, 24, 180],
    body: "plastic-grey",
    corner: 8,
    marks: [...graphing([90, 24, 180]), back("dark", 0, 55, 62, 78), back("slot", 0, 100, 18, 6)],
  },
  // No size was on the pages opened. The mesh is a stand-in so the red-display body can be drawn. The photograph is the early TI-30 with a red window.
  "ti-30": {
    size: [76, 22, 148],
    body: "plastic-char",
    corner: 3,
    marks: [front("light", 0, 128, 52, 12), front("key", 0, 68, 9, 6, { cols: 5, rows: 8, gap: 2 })],
  },
  // No size was on the series page. The mesh is a stand-in. The photograph shows a display, a slide, and a keypad.
  "casio-fx-82": {
    size: [78, 14, 160],
    body: "plastic-char",
    corner: 3,
    marks: [front("dark", -28, 140, 10, 5), front("lcd", 0, 118, 52, 18), front("key", 0, 55, 10, 6, { cols: 5, rows: 6, gap: 2 })],
  },
  // The infobox gives a weight and no size. 50 mm across and 80 mm tall is a stand-in. Eight slider slots follow the photograph and are not measured.
  "curta-type-i": {
    size: [50, 50, 80],
    body: "plastic-char",
    corner: 1,
    shape: "can",
    marks: [front("slot", 0, 36, 3, 22, { cols: 8, rows: 1, gap: 2 })],
  },
  // A photograph of the Pocket: a screen, a cross, two round buttons, and two small buttons. Places are not measured. Size is the list's 77.6 by 25.3 by 127.6 mm.
  "game-boy-pocket-mgb-001": {
    size: [77.6, 25.3, 127.6],
    body: "plastic-grey",
    corner: 6,
    marks: [
      front("lcd", 0, 92, 48, 40),
      front("key", -20, 52, 22, 7),
      front("key", -20, 52, 7, 22),
      front("key", 12, 48, 11, 11, { round: true }),
      front("key", 28, 48, 11, 11, { round: true }),
      front("dark", -8, 28, 10, 3),
      front("dark", 6, 28, 10, 3),
    ],
  },
  // No size on the list. 80 by 28 by 132 mm is a stand-in, not the Pocket's size. The photograph has a dark panel around the screen.
  "game-boy-color-cgb-001": {
    size: [80, 28, 132],
    body: "plastic-grey",
    corner: 8,
    marks: [
      front("panel", 0, 96, 68, 58),
      front("lcd", 6, 100, 40, 36),
      front("key", -22, 52, 20, 7),
      front("key", -22, 52, 7, 20),
      front("key", 8, 46, 10, 10, { round: true }),
      front("key", 24, 46, 10, 10, { round: true }),
    ],
  },
  // The list already stores 150 by 161 by 110 mm. A round lid on top and four round ports on the front, from a photograph. The handle is not drawn.
  "nintendo-gamecube": {
    size: [150, 161, 110],
    body: "plastic-char",
    corner: 8,
    marks: [
      top("dark", 0, -10, 70, 70, { round: true }),
      front("slot", 0, 48, 12, 12, { round: true, cols: 4, rows: 1, gap: 6 }),
    ],
  },
  // Closed size already on the list: 134 across, 22 thick, 74 tall. The photograph opened is the unit open, so the screens are not drawn on the outside. A line marks the hinge.
  "nintendo-3ds-ctr-001": {
    size: [134, 22, 74],
    body: "plastic-char",
    corner: 6,
    marks: [front("slot", 0, 37, 120, 2)],
  },
  // A collector page names 150 mm across, 220 mm deep and 60 mm tall. The red band has no red in the palette, so it is a dark stripe. Controllers are not part of the body.
  "family-computer-famicom": {
    size: [150, 220, 60],
    body: "plastic-white",
    corner: 4,
    marks: [front("dark", 0, 28, 130, 10), top("slot", 0, -40, 90, 28)],
  },
  // Nintendo of Europe lists 255 by 85 by 202 mm and names no axes. The mesh uses 255 across, 202 deep and 85 tall: the photograph is a low box, and 85 is the only figure short enough to be its height. The black band and the rear sockets follow the photograph. Places are not measured.
  "nintendo-entertainment-system-nes-001": {
    size: [255, 202, 85],
    body: "plastic-grey",
    corner: 4,
    marks: [top("panel", -80, 0, 36, 150), top("dark", -40, 0, 28, 120), back("slot", -40, 22, 8, 8), back("slot", 0, 22, 8, 8), back("slot", 40, 22, 8, 8)],
  },
  // Nintendo of Europe lists 200 by 72 by 242 mm and names no axes. The mesh uses 200 across, 242 deep and 72 tall after the photograph. A quoted 74 mm height was not used. The cartridge slot, three switches and the front ports follow the photograph. Places are not measured.
  "super-famicom": {
    size: [200, 242, 72],
    body: "plastic-grey",
    corner: 8,
    marks: [
      top("slot", 0, -20, 140, 18),
      top("key", -50, 30, 22, 12),
      top("key", 0, 30, 36, 14),
      top("key", 55, 30, 22, 12),
      front("slot", -30, 28, 28, 10),
      front("slot", 30, 28, 36, 8),
    ],
  },
  // No page opened names this body's size. 190 by 180 by 70 mm is a stand-in, not a measurement. The cartridge slot, two buttons and two front ports follow the photograph. Places are not measured. The side ribs are not drawn.
  "super-nintendo-entertainment-system-sns-001": {
    size: [190, 180, 70],
    body: "plastic-grey",
    corner: 10,
    marks: [
      top("slot", 0, -20, 120, 16),
      top("key", -50, 24, 18, 14, { round: true }),
      top("key", -50, 6, 16, 12, { round: true }),
      front("slot", -28, 22, 32, 10),
      front("slot", 28, 22, 32, 10),
    ],
  },
  // Wikipedia gives 365 by 170 by 70 mm and names no axes. The mesh uses 365 across, 170 deep and 70 tall after the photograph: a long low box. The cartridge slot, the card slot and the rear vent follow the photographs. Places are not measured. There is no red in the palette.
  "master-system-original": {
    size: [365, 170, 70],
    body: "plastic-char",
    corner: 4,
    marks: [top("slot", 60, -10, 140, 14), front("slot", 80, 22, 40, 10), back("dark", -20, 36, 180, 14), back("slot", 120, 22, 8, 8, { cols: 4, rows: 1, gap: 6 })],
  },
  // Sega names 280 mm wide, 212 mm deep and 70 mm tall. A round lid, a vent, a power switch and a reset button, from a photograph. Places are not measured.
  "mega-drive-genesis-model-1": {
    size: [280, 212, 70],
    body: "plastic-char",
    corner: 6,
    marks: [
      top("dark", 40, -16, 130, 130, { round: true }),
      top("dark", -100, -30, 36, 40),
      top("key", -80, 16, 8, 22),
      top("key", -40, 28, 18, 8),
      front("slot", 20, 20, 22, 10),
    ],
  },
  // Wikipedia names 210 mm wide, 113 mm high and 38 mm deep. A screen, a pad, two buttons and a start button, from a photograph. Places are not measured. No back photograph was opened.
  "game-gear": {
    size: [210, 38, 113],
    body: "plastic-char",
    corner: 16,
    marks: [
      front("lcd", 8, 68, 72, 50),
      front("key", -72, 52, 22, 8),
      front("key", -72, 52, 8, 22),
      front("key", 62, 46, 14, 14, { round: true }),
      front("key", 82, 40, 14, 14, { round: true }),
      front("key", 72, 68, 12, 12, { round: true }),
      front("dark", -72, 18, 28, 12),
    ],
  },
  // The manual names width 260 mm, length 230 mm and height 83 mm. A disc lid, two buttons and a front slot, from a photograph. Places are not measured. The side vents are not drawn.
  "saturn-model-1": {
    size: [260, 230, 83],
    body: "plastic-char",
    corner: 8,
    marks: [top("dark", 0, -20, 150, 100), top("key", -70, 40, 24, 8), top("key", -30, 40, 24, 8), front("slot", 0, 24, 48, 10)],
  },
  // A collector's measurement of a four-switch says about 13 5/8 in wide, 9 1/8 in deep and 3 1/2 in tall, rounded up. The list stays blank. The mesh uses 346 by 232 by 89 mm as that stand-in. The wood band has no wood tone, so it is a dark stripe. Places are not measured. No back photograph was opened.
  "atari-2600-four-switch": {
    size: [346, 232, 89],
    body: "plastic-char",
    corner: 6,
    marks: [
      front("dark", 0, 26, 300, 20),
      top("dark", 0, 40, 300, 100),
      top("slot", 0, -70, 90, 16),
      top("key", -120, -55, 8, 16, { cols: 2, rows: 1, gap: 16 }),
      top("key", 110, -55, 8, 16, { cols: 2, rows: 1, gap: 16 }),
    ],
  },
  // Wikipedia gives 13 by 15 by 4.25 in and names no axes. The mesh uses 381 mm across the silver band, 330 mm front to back and 108 mm tall after the photograph. The silver band is not drawn. Places are not measured.
  "atari-5200-four-port": {
    size: [381, 330, 108],
    body: "plastic-char",
    corner: 6,
    marks: [
      top("slot", 0, -70, 130, 28),
      top("dark", -150, -30, 40, 70),
      top("dark", 150, -30, 40, 70),
      top("key", 145, 80, 32, 14),
      front("slot", 20, 28, 36, 12),
      back("dark", 0, 32, 200, 40),
    ],
  },
  // One collector names 11.75 in wide, 9 in deep and 3.5 in tall. The list stays blank. The mesh uses 298 by 229 by 89 mm as that stand-in. The coloured stripe is not drawn. Places are not measured.
  "atari-7800": {
    size: [298, 229, 89],
    body: "plastic-char",
    corner: 6,
    marks: [
      top("slot", 20, -30, 100, 20),
      top("dark", 0, -90, 200, 12),
      top("key", -80, 80, 16, 8, { cols: 2, rows: 1, gap: 12 }),
      top("key", 70, 80, 18, 8, { cols: 2, rows: 1, gap: 10 }),
      front("slot", -40, 24, 22, 10),
      front("slot", 40, 24, 22, 10),
      back("dark", 0, 48, 220, 14),
      back("slot", -30, 22, 16, 10),
      back("slot", 40, 22, 10, 10),
    ],
  },
  // The Lynx page gives 273 by 108 by 38 mm and names no axes. The mesh uses 273 mm across, 38 mm thick and 108 mm tall: the photograph is a wide flat handheld, and 38 is the only figure thin enough. The screen figures are used the same way. Places are not measured.
  "atari-lynx": {
    size: [273, 38, 108],
    body: "plastic-char",
    corner: 16,
    marks: [
      front("lcd", 0, 62, 83, 48),
      front("key", -100, 52, 22, 8),
      front("key", -100, 52, 8, 22),
      front("key", 80, 58, 16, 16, { round: true }),
      front("key", 104, 40, 16, 16, { round: true }),
      front("dark", 92, 22, 28, 16),
      back("dark", 0, 62, 150, 48),
      back("slot", -20, 12, 6, 6, { cols: 4, rows: 1, gap: 14 }),
    ],
  },
  // A fan page names 9.5 in wide, 10 in long and 2.25 in tall, and a 4.25 in dome. Its centimetre line does not match that height, so the mesh uses the inches: 241.3 by 254 by 57.2 mm. The power button is red on the machine and is drawn as a dark key. Places are not measured.
  "atari-jaguar": {
    size: [241.3, 254, 57.2],
    body: "plastic-char",
    corner: 10,
    marks: [
      top("dark", 0, 8, 108, 108, { round: true }),
      top("slot", 0, -90, 130, 22),
      top("key", 0, 95, 18, 12, { round: true }),
      top("dark", -95, -108, 28, 14),
      top("dark", 95, -108, 28, 14),
      front("slot", -36, 18, 20, 10),
      front("slot", 36, 18, 20, 10),
      back("slot", -95, 20, 8, 8, { round: true }),
      back("dark", 0, 36, 140, 6),
      back("slot", -10, 18, 64, 14),
      back("slot", 78, 18, 12, 10),
      back("slot", 100, 18, 8, 8, { round: true }),
    ],
  },
  // One collector names 16 in wide, 9 in deep and 3 in tall. A museum page gives 39 by 23 by 7 cm and names no axes, so that triple is not stored. The mesh uses 406 by 229 by 76 mm from the named inches. The wood and the gold have no such tone, so the front band is dark. The side cartridge slot is not drawn. Places are not measured.
  intellivision: {
    size: [406, 229, 76],
    body: "plastic-char",
    corner: 6,
    marks: [
      top("key", -155, 6, 32, 32, { round: true }),
      top("key", 155, 6, 32, 32, { round: true }),
      top("key", -70, 6, 9, 7, { cols: 3, rows: 4, gap: 2 }),
      top("key", 70, 6, 9, 7, { cols: 3, rows: 4, gap: 2 }),
      top("dark", 0, 6, 40, 22),
      front("dark", 0, 26, 360, 16),
      front("key", 90, 12, 48, 8),
      back("slot", 60, 14, 6, 6),
    ],
  },
  // A Japanese hardware page names 140 mm wide, 135 mm deep and 40.4 mm tall for the PI-TG001. Wikipedia's 14 by 14 by 3.5 cm names no axes and is not the figure used. The side jack is not drawn. No back photograph of this model was opened.
  "pc-engine": {
    size: [140, 135, 40.4],
    body: "plastic-white",
    corner: 6,
    marks: [top("slot", 0, 16, 72, 8), front("key", -58, 16, 8, 14)],
  },
  // A fan page lists 304.8 by 177.8 by 76.2 mm and names no axes. Those figures are 12 by 7 by 3 inches. The list stays blank. The mesh uses 305 mm across, 178 mm deep and 76 mm tall after the photograph of a long low unit. Places are not measured.
  "turbografx-16": {
    size: [305, 178, 76],
    body: "plastic-char",
    corner: 6,
    marks: [top("slot", 70, -8, 80, 26), front("slot", 80, 22, 16, 12), back("slot", -16, 24, 78, 18)],
  },
  // Two pages give 270 by 60 by 188 mm. One calls them length, height and width. The list stays blank. The mesh uses 270 mm across the front, 188 mm deep and 60 mm tall after the photograph. Places are not measured. The controller is not part of the body.
  "playstation-scph-1000": {
    size: [270, 188, 60],
    body: "plastic-grey",
    corner: 6,
    marks: [
      top("dark", 16, -8, 110, 110, { round: true }),
      top("key", -90, 10, 22, 22, { round: true }),
      top("key", -90, 40, 12, 12, { round: true }),
      top("key", 100, 20, 22, 22, { round: true }),
      front("slot", -40, 18, 28, 10),
      front("slot", 40, 18, 28, 10),
    ],
  },
  // Wikipedia names width 325 mm, height 98 mm and depth 274 mm for the original. The curved shell is a box here. The disc slot, the front band and a row of rear ports follow the photographs. Places are not measured.
  "playstation-3-original": {
    size: [325, 274, 98],
    body: "plastic-char",
    corner: 8,
    marks: [
      front("slot", -20, 52, 160, 8),
      front("panel", 0, 36, 220, 10),
      front("dark", 0, 18, 240, 8),
      back("slot", -80, 28, 14, 8),
      back("slot", -40, 28, 18, 8),
      back("slot", 10, 28, 14, 8),
      back("slot", 50, 28, 16, 10),
      back("key", 110, 30, 16, 22),
    ],
  },
  // The article names height 74 mm, width 170 mm and depth 23 mm. A screen, a pad and face buttons, from a photograph. The back has a round door. Places are not measured. Printed names are not drawn.
  "psp-psp-1000": {
    size: [170, 23, 74],
    body: "plastic-char",
    corner: 8,
    marks: [
      front("lcd", 6, 46, 78, 44),
      front("key", -62, 48, 8, 8, { round: true, cols: 3, rows: 3, gap: 1 }),
      front("key", 62, 50, 8, 8, { round: true, cols: 3, rows: 3, gap: 1 }),
      front("key", -62, 22, 10, 10, { round: true }),
      back("dark", 0, 40, 52, 52, { round: true }),
      back("panel", 48, 36, 36, 40),
    ],
  },
  // The article names height 83.55 mm, width 182 mm and depth 18.6 mm for the PCH-1000. A screen, two sticks and buttons, from a photograph. No back photograph was opened, so the back is plain. Places are not measured.
  "playstation-vita-pch-1000": {
    size: [182, 18.6, 83.55],
    body: "plastic-char",
    corner: 8,
    marks: [
      front("lcd", 0, 46, 96, 52),
      front("key", -68, 52, 16, 16, { round: true }),
      front("key", 68, 40, 16, 16, { round: true }),
      front("key", -68, 28, 8, 8, { round: true }),
      front("key", 62, 62, 7, 7, { round: true, cols: 2, rows: 2, gap: 2 }),
    ],
  },
  // The article gives 3.1 by 13.1 by 10.8 in and names no axes. The mesh uses 333 mm across, 274 mm deep and 79 mm tall: the photograph is a low wide slab, and 79 is the only figure short enough to be the height. The ribbed half of the top follows the photograph. Places are not measured.
  "xbox-one": {
    size: [333, 274, 79],
    body: "plastic-char",
    corner: 4,
    marks: [top("dark", 80, 0, 140, 200), front("slot", -20, 28, 180, 6)],
  },
  // The article gives 15.1 by 6.5 by 27.5 cm and names no axes. The Series X on this list stands, and the photograph of the Series S is a tall thin tower, so the mesh uses 151 mm across, 65 mm deep and 275 mm tall. The list size stays blank. No back photograph was opened, so the back is plain.
  "xbox-series-s": {
    size: [151, 65, 275],
    body: "plastic-white",
    corner: 4,
    marks: [front("dark", 0, 165, 112, 112, { round: true })],
  },
  // M+ gives 13.6 by 8.9 by 2.8 cm and names no axes. The mesh stands window-forward: 136 mm across, 28 mm thick and 89 mm tall, after the photograph that lays the silver edge along the top. The body is that silver. A blue door, a cassette window with two hubs and the orange button sit on the front, and the jacks sit on the silver band above the door. Four keys and two wheels sit on the top. No rear panel was opened, so the back is plain. Places are not measured.
  "sony-tps-l2": {
    size: [136, 28, 89],
    body: "shell-silver",
    corner: 3,
    marks: [
      front("panel", 0, 36, 130, 68, { material: "plastic-blue" }),
      front("dark", 12, 38, 62, 36, { out: 0.7 }),
      front("dark", -2, 38, 8, 8, { round: true, material: "steel", out: 1.3 }),
      front("dark", 26, 38, 8, 8, { round: true, material: "steel", out: 1.3 }),
      front("key", -48, 28, 16, 12, { material: "shell-orange-panel", out: 0.7 }),
      front("slot", -40, 78, 6, 6, { round: true, out: 0.4 }),
      front("slot", -26, 78, 6, 6, { round: true, out: 0.4 }),
      top("key", -16, 4, 18, 14, { cols: 4, rows: 1, gap: 3, material: "alu-dark", out: 0.6 }),
      top("key", 48, 4, 10, 10, { round: true, material: "steel", out: 0.6 }),
      top("key", 62, 4, 10, 10, { round: true, material: "steel", out: 0.6 }),
    ],
  },
  // Radiomuseum names width 30 mm, height 109 mm and depth 80 mm. The photograph shows the control face far wider than 30 mm, so the list stays blank. The mesh uses 80 mm across, 30 mm thick and 109 mm tall, in the silver of that photograph. A cassette window with two hubs, and the keys along the right. The belt holder and the battery case are not part of the body. No back photograph was opened, so the back is plain. Places are not measured.
  "sony-wm-2": {
    size: [80, 30, 109],
    body: "shell-silver",
    corner: 4,
    marks: [
      front("panel", 28, 58, 22, 62),
      front("dark", -12, 54, 44, 50, { out: 0.6 }),
      front("dark", -22, 54, 7, 7, { round: true, material: "steel", out: 1.2 }),
      front("dark", -2, 54, 7, 7, { round: true, material: "steel", out: 1.2 }),
      front("slot", -8, 96, 5, 5, { round: true, out: 0.4 }),
      front("slot", 6, 96, 5, 5, { round: true, out: 0.4 }),
      front("key", 28, 80, 12, 12, { round: true, material: "steel", out: 0.6 }),
      front("key", 28, 62, 16, 8, { material: "alu", out: 0.6 }),
      front("key", 28, 48, 16, 8, { material: "alu", out: 0.6 }),
      front("key", 28, 34, 16, 8, { material: "alu", out: 0.6 }),
    ],
  },
  // RigPix names width 40 mm, height 195 mm and depth 80 mm, with the battery and without the antenna. The photograph shows the face wider than the side, so that width is not used and the list stays blank. The mesh is 80 mm across, 40 mm thick and 195 mm tall. The antenna is a drawing 160 mm long, thick at the base and thin at the tip; no page opened names that length. The back is three panels. Places are not measured.
  "dynatac-8000x": {
    size: [80, 40, 195],
    body: "plastic-beige",
    corner: 6,
    antenna: 160,
    shape: "dynatac",
    marks: [
      front("dark", 0, 174, 18, 18, { round: true, material: "alu-dark", out: 10.4 }),
      front("slot", 0, 174, 2.2, 2.2, { round: true, cols: 3, rows: 3, gap: 2.2, out: 11 }),
      front("light", 0, 150, 32, 7, { out: 0.8 }),
      front("key", 0, 120, 13, 9, { cols: 3, rows: 4, gap: 2.5, material: "deck-white", out: 1.6 }),
      front("key", 0, 70, 13, 8, { cols: 3, rows: 3, gap: 2.5, material: "deck-white", out: -5.8 }),
      front("key", 15.5, 80.5, 13, 8, { material: "lid-red", out: -5.4 }),
      front("slot", 0, 44, 22, 3, { out: -6.4 }),
      back("dark", -13, 98, 0.9, 170, { out: 0.5 }),
      back("dark", 13, 98, 0.9, 170, { out: 0.5 }),
    ],
  },
  // Motorola's 1997 page gives 93 x 52 x 20 mm and names no axes, so the list size stays blank. Two halves, 26.9 mm across, from a straight-on photograph of a StarTAC 8500 scaled so the long side is 93 mm. The hinge is 60 mm up. The lid leans back 20 degrees. The earpiece is on the lid. The display and the keys are on the lower half. No word.
  startac: {
    size: [26.9, 20, 93],
    body: "plastic-char",
    corner: 8,
    shape: "flip",
    hinge: 60,
    lean: 20,
    half: 11,
    lidThick: 7,
    antenna: 16,
    marks: [
      front("panel", 0, 80, 16, 12, { material: "plastic-black", out: 0.35 }),
      front("slot", 0, 81, 1.3, 1.3, { round: true, cols: 3, rows: 2, gap: 1.5, out: 0.7 }),
      front("screen", 2.2, 35.6, 12.3, 12.1, { material: "pale-glass", out: 0.4 }),
      front("light", 10.2, 42, 1.6, 1.6, { round: true, out: 0.55 }),
      front("key", 0, 18.3, 6.2, 2.8, { cols: 3, rows: 4, gap: 1.1, material: "plastic-grey", out: 0.45 }),
      front("key", 0, 8.6, 4.2, 2.6, { cols: 4, rows: 1, gap: 1, material: "plastic-grey", out: 0.45 }),
      front("key", 0, 4.7, 5, 2.4, { cols: 3, rows: 1, gap: 1.2, material: "plastic-grey", out: 0.45 }),
    ],
  },
  // The article gives 53 x 98 x 13 mm and names no axes, so the list size stays blank. John reads the 53 mm as the width and the thickness as about 14 mm closed, so each half is about 7 mm. The open phone is about 160 mm tall, from the photograph's width-to-height once the width is 53 mm. Two thin silver halves, the lid leaned back 15 degrees. A thin earpiece slot, a screen with an even border, one etched keypad plate, a round nav ring, and a chin. No mark.
  "razr-v3": {
    size: [53, 13.9, 160],
    body: "brushed-silver",
    corner: 4,
    shape: "flip",
    hinge: 78,
    lean: 15,
    half: 7,
    lidThick: 6.5,
    chin: 12,
    marks: [
      front("slot", 0, 152, 16, 1.3, { out: 0.35 }),
      front("panel", 0, 116, 46, 56, { material: "bezel", out: 0.12 }),
      front("screen", 0, 116, 40, 48, { out: 0.4 }),
      back("dark", 0, 150, 6, 6, { round: true, material: "plastic-black", out: 0.3 }),
      back("screen", 0, 128, 22, 16, { out: 0.25 }),
      back("dark", 0, 104, 11, 11, { round: true, material: "alu", out: 0.2 }),
      front("key", -14, 72, 8, 3.2, { material: "alu-dark", out: 0.45 }),
      front("key", 14, 72, 8, 3.2, { material: "alu-dark", out: 0.45 }),
      front("key", 0, 64, 16, 16, { round: true, material: "alu", out: 0.3 }),
      front("key", 0, 64, 5, 5, { round: true, material: "shell-silver", out: 0.7 }),
      front("key", -16, 64, 4.2, 4.2, { round: true, material: "pcb-green", out: 0.45 }),
      front("key", 16, 64, 4.2, 4.2, { round: true, material: "lid-red", out: 0.45 }),
      front("key", 0, 54, 7, 3.4, { material: "alu-dark", out: 0.45 }),
      front("key", 0, 32, 13, 7, { cols: 3, rows: 4, gap: 1.6, material: "alu", out: 0.5 }),
      front("slot", 0, 8, 1.2, 3, { cols: 7, rows: 1, gap: 1.1, out: 1.6 }),
    ],
  },
  // The same phone, shut. The article's 98 mm is the closed length and 13.9 mm the thickness; the list size stays blank, as on the open phone. A camera at the top rim, the external screen, a blank circle and a chin. A key past the right edge sits on the side. No mark.
  "razr-v3-shut": {
    size: [53, 13.9, 98],
    body: "brushed-silver",
    corner: 6,
    shape: "shell",
    chin: 16,
    marks: [
      front("dark", 0, 94, 6, 6, { round: true, material: "plastic-black", out: 0.55 }),
      front("panel", 0, 70, 32, 24, { material: "bezel", out: 0.2 }),
      front("screen", 0, 70, 24, 18, { out: 0.45 }),
      front("dark", 0, 44, 12, 12, { round: true, material: "alu-dark", out: 0.22 }),
      front("dark", 0, 44, 8, 8, { round: true, material: "brushed-silver", out: 0.48 }),
      front("key", 28, 72, 2, 9, { material: "plastic-black", out: 0.3 }),
      front("slot", 0, 8, 1.1, 2.2, { cols: 5, rows: 1, gap: 1.5, out: 1.8 }),
    ],
  },
  // The article's axes are already on the list. The shell is 50.8 mm across and 123.8 mm tall, from a straight-on photograph scaled so the long side is 123.8 mm. The ends are round and the middle is a little narrower. The silver cover's lower edge is a smile. The screen is a large green-grey window in the lower half of that cover. The silver bar, the C key and the rocker sit on the cover. No word.
  "nokia-3210": {
    size: [50.8, 22.5, 123.8],
    body: "plastic-grey",
    corner: 16,
    shape: "shell",
    waist: 2,
    marks: [
      front("panel", 0, 84, 46, 72, { material: "shell-silver", out: 0.15 }),
      front("slot", 0, 114, 3.2, 1.15, { cols: 5, rows: 1, gap: 1.6, out: 1.05 }),
      front("panel", 0, 74, 36, 26, { material: "bezel", out: 0.9 }),
      front("lcd", 0, 74, 32, 22, { material: "lcd-grey", out: 1.15 }),
      front("key", -18, 58, 6.5, 6.5, { round: true, material: "plastic-white", out: 1.35 }),
      front("key", 0, 56, 30, 14, { material: "alu-dark", out: 1.2 }),
      front("key", 0, 56, 26, 11, { material: "shell-silver", out: 1.5 }),
      front("slot", 0, 56, 10, 1.4, { material: "shell-blue", out: 1.75 }),
      front("key", 17.5, 56, 5.5, 13, { material: "plastic-char", out: 1.35 }),
      front("key", 0, 28, 12, 8, { cols: 3, rows: 4, gap: 3.2, material: "plastic-white", out: 0.95 }),
    ],
  },
  // The article's axes are already on the list: 66 mm across, 10.5 mm thick, 115 mm tall. A metal band, a black face, a screen, a square pad and four rows of keys. The rows are straight. No word.
  "bold-9900": {
    size: [66, 10.5, 115],
    body: "brushed-silver",
    corner: 12,
    shape: "shell",
    marks: [
      front("panel", 0, 57.5, 62, 108, { material: "plastic-black", out: 0.12 }),
      front("slot", 0, 108, 16, 1.5, { material: "alu-dark", out: 1.15 }),
      front("screen", 0, 80, 56, 46, { material: "screen-glass", out: 1.05 }),
      front("key", -22, 50, 8, 3.2, { material: "alu-dark", out: 1.25 }),
      front("panel", 0, 50, 13, 13, { material: "alu", out: 1.1 }),
      front("screen", 0, 50, 8, 8, { material: "screen-glass", out: 1.5 }),
      front("key", 16, 50, 7, 3.4, { material: "alu-dark", out: 1.25 }),
      front("key", 26, 50, 6, 6, { round: true, material: "plastic-char", out: 1.3 }),
      front("slot", 0, 42.2, 56, 0.7, { material: "alu", out: 1.55, bow: 1.3 }),
      front("key", 0, 39, 5, 3.6, { cols: 10, rows: 1, gap: 0.55, material: "plastic-grey", out: 1.3, bow: 1.3 }),
      front("slot", 0, 36, 56, 0.7, { material: "alu", out: 1.55, bow: 1.3 }),
      front("key", 0, 33, 5, 3.6, { cols: 10, rows: 1, gap: 0.55, material: "plastic-grey", out: 1.3, bow: 1.3 }),
      front("slot", 0, 30, 56, 0.7, { material: "alu", out: 1.55, bow: 1.3 }),
      front("key", 0, 27, 5, 3.6, { cols: 10, rows: 1, gap: 0.55, material: "plastic-grey", out: 1.3, bow: 1.3 }),
      front("slot", 0, 23.6, 56, 0.7, { material: "alu", out: 1.55, bow: 1.3 }),
      front("key", -22, 19.2, 10, 3.8, { material: "plastic-grey", out: 1.3, bow: 0.4 }),
      front("key", 2, 18.6, 24, 4, { material: "plastic-grey", out: 1.3 }),
      front("key", 22, 19.2, 10, 3.8, { material: "plastic-grey", out: 1.3, bow: 0.4 }),
      front("key", 35, 62, 2, 12, { material: "plastic-black", out: 0.3 }),
    ],
  },
  // The article's axes are already on the list: 60 mm across, 13.9 mm thick, 109 mm tall. A black body, a screen, a green key, a square pad, a red key and four rows. The rows are straight. No word.
  // GSMArena lists 107 x 60 x 15.5 mm, and the inches are a height, a width and a thickness. The list stores the width, the depth and the height. A silver body, a screen, a round ball in a metal ring between a green key and a red key, and four rows. No word.
  "curve-8300": {
    size: [60, 15.5, 107],
    body: "brushed-silver",
    corner: 10,
    shape: "shell",
    marks: [
      front("slot", 0, 100, 14, 1.4, { material: "alu-dark", out: 0.5 }),
      front("screen", 0, 76, 48, 36, { material: "screen-glass", out: 0.35 }),
      front("key", -24, 50, 6, 3.2, { material: "alu-dark", out: 0.55 }),
      front("key", -15, 50, 7, 4, { material: "pcb-green", out: 0.55 }),
      front("key", 0, 50, 12, 12, { round: true, material: "alu", out: 0.4 }),
      front("key", 0, 50, 6.5, 6.5, { round: true, material: "plastic-black", out: 0.7 }),
      front("key", 14, 50, 6, 3.2, { material: "alu-dark", out: 0.55 }),
      front("key", 23, 50, 6, 6, { round: true, material: "lid-red", out: 0.6 }),
      front("panel", 0, 28, 54, 30, { material: "plastic-black", out: 0.2 }),
      front("key", 0, 38, 4.4, 3.4, { cols: 10, rows: 1, gap: 0.55, material: "alu", out: 0.7 }),
      front("key", 0, 32, 4.4, 3.4, { cols: 10, rows: 1, gap: 0.55, material: "alu", out: 0.7 }),
      front("key", 0, 26, 4.4, 3.4, { cols: 10, rows: 1, gap: 0.55, material: "alu", out: 0.7 }),
      front("key", -20, 18, 9, 3.6, { material: "alu", out: 0.7 }),
      front("key", 1, 18, 20, 3.8, { material: "alu", out: 0.7 }),
      front("key", 20, 18, 9, 3.6, { material: "alu", out: 0.7 }),
    ],
  },
  "curve-8520": {
    size: [60, 13.9, 109],
    body: "plastic-black",
    corner: 12,
    shape: "shell",
    marks: [
      front("slot", 0, 102, 14, 1.4, { material: "alu-dark", out: 0.4 }),
      front("screen", 0, 76, 50, 42, { out: 0.35 }),
      front("key", -20, 48, 7, 4, { material: "pcb-green", out: 0.45 }),
      front("panel", 0, 48, 11, 11, { material: "alu", out: 0.3 }),
      front("key", 0, 48, 7, 7, { material: "plastic-char", out: 0.55 }),
      front("key", 14, 48, 6, 3.2, { material: "alu-dark", out: 0.45 }),
      front("key", 23, 48, 6, 6, { round: true, material: "lid-red", out: 0.5 }),
      front("key", 0, 37, 4.6, 4, { cols: 10, rows: 1, gap: 0.6, material: "plastic-grey", out: 0.4 }),
      front("key", 0, 31, 4.6, 4, { cols: 10, rows: 1, gap: 0.6, material: "plastic-grey", out: 0.4 }),
      front("key", 0, 25, 4.6, 4, { cols: 10, rows: 1, gap: 0.6, material: "plastic-grey", out: 0.4 }),
      front("key", -20, 18, 9, 4.2, { material: "plastic-grey", out: 0.4 }),
      front("key", 1, 18, 22, 4.4, { material: "plastic-grey", out: 0.4 }),
      front("key", 20, 18, 9, 4.2, { material: "plastic-grey", out: 0.4 }),
    ],
  },
  // The article's axes are already on the list. The shell is 43.9 mm across and 132 mm tall, from a straight-on photograph scaled so the shell's long side is 132 mm. A stub antenna of 18 mm stands on the top right. The cover is blue. A screen window, a long centre key and pale number keys. No word.
  "nokia-5110": {
    size: [43.9, 31, 132],
    body: "plastic-blue",
    corner: 14,
    shape: "shell",
    antenna: 18,
    marks: [
      front("dark", -2, 112, 14, 14, { round: true, material: "plastic-black", out: 0.4 }),
      front("light", 12, 114, 4, 4, { round: true, out: 0.55 }),
      front("panel", 0, 80, 32, 28, { material: "plastic-black", out: 0.35 }),
      front("lcd", 0, 81, 24, 18, { material: "pale-glass", out: 0.75 }),
      front("key", -11, 52, 8, 6, { material: "plastic-grey", out: 0.7 }),
      front("key", 0.5, 51, 16, 8, { material: "shell-silver", out: 0.8 }),
      front("key", 14, 52, 7, 10, { material: "shell-silver", out: 0.7 }),
      front("key", 0, 28, 10, 5.2, { cols: 3, rows: 4, gap: 2.4, material: "plastic-white", out: 0.6 }),
    ],
  },
};

const MATERIAL: Readonly<Record<MarkKind, Material>> = { screen: "black-glass", lcd: "pale-glass", dark: "plastic-gloss", panel: "plastic-black", slot: "hole", key: "key", light: "led-red" };

/** One mark, and the marks of its block, each at the middle of where it goes. */
export function eachMark(mark: Mark, each: (x: number, y: number) => void) {
  const cols = mark.cols ?? 1;
  const rows = mark.rows ?? 1;
  const gap = mark.gap ?? 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = mark.x + (c - (cols - 1) / 2) * (mark.w + gap);
      const span = cols * (mark.w + gap) - gap;
      const along = span > 0 ? (x - mark.x) / (span / 2) : 0;
      const smile = (mark.bow ?? 0) * (1 - Math.min(1, along * along));
      const y = mark.y + ((rows - 1) / 2 - r) * (mark.h + gap) * (mark.face === "top" ? -1 : 1) - smile;
      each(x, y);
    }
  }
}

/** A rounded front, extruded by the thickness, centred on its own middle. */
function phoneShell(w: number, h: number, d: number, r: number): THREE.BufferGeometry {
  const bevel = Math.min(0.8, d / 6);
  const shape = roundedSquare(w, h, Math.min(r, w / 2 - 0.5, h / 2 - 0.5), 6);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.4, d - 2 * bevel),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.45,
    bevelSegments: 2,
    curveSegments: 6,
  });
  g.computeBoundingBox();
  const box3 = g.boundingBox;
  if (box3) g.translate(-(box3.min.x + box3.max.x) / 2, -(box3.min.y + box3.max.y) / 2, -(box3.min.z + box3.max.z) / 2);
  g.deleteAttribute("uv");
  g.computeVertexNormals();
  return g;
}

function faceMarks(m: Box, marks: readonly Mark[], yOf: (y: number) => number, thick: number) {
  const thin = 0.45;
  for (const mark of marks) {
    if (mark.face !== "front" && mark.face !== "back") continue;
    const sign = mark.face === "front" ? 1 : -1;
    eachMark(mark, (x, y) => {
      const at: Vec3 = [x, yOf(y), sign * (thick / 2 + (mark.out ?? 0))];
      const tone = mark.material ?? MATERIAL[mark.kind];
      const pill = mark.kind === "key" && !mark.round && mark.h > 2 && mark.w > mark.h * 1.3;
      if (mark.round && mark.w >= 12) m.add(tone, torus(mark.w / 2 - 1.2, 0.9, 28, 8), at);
      else if (mark.round) m.add(tone, cyl(mark.w / 2, thin, 20), at, [90, 0, 0]);
      else if (pill && (tone === "alu" || tone === "brushed-silver" || tone === "shell-silver")) m.add(tone, plate(mark.w, mark.h, 0.55, 0.12, 0.2), at);
      else if (pill) m.add(tone, cyl(mark.h / 2, thin, 16), at, [90, 0, 0], { scale: [mark.w / mark.h, 1, 1] });
      else m.add(tone, box(mark.w, mark.h, thin), at);
    });
  }
}

/** Two halves on a hinge, the lid leaning back. Mark heights are from the open, flat photograph. */
function flipPhone(m: Box, spec: MachineSpec) {
  const [w, , h] = spec.size;
  const hinge = spec.hinge ?? h * 0.55;
  const lean = spec.lean ?? 20;
  const gap = 1.4;
  const lowerH = hinge - gap;
  const lidH = h - hinge - gap;
  const lowerT = spec.half ?? spec.size[1] * 0.5;
  const lidT = spec.lidThick ?? lowerT;
  const radius = Math.min(spec.corner, w / 2 - 0.4);
  m.add(spec.body, phoneShell(w, lowerH, lowerT, radius), [0, lowerH / 2, 0]);
  if (spec.chin) m.add(spec.body, phoneShell(w * 0.94, spec.chin, lowerT + 2.4, Math.min(radius, spec.chin / 2 - 0.3)), [0, spec.chin / 2, 0.5]);
  m.add(spec.body, cyl(2.4, w * 0.72, 18), [0, hinge, 1.4], [0, 0, 90]);
  if (spec.antenna) m.add("rubber", cyl(1.1, spec.antenna, 10), [w / 2 + 0.8, hinge - 1, -1]);
  const lidMarks = spec.marks.filter((mark) => mark.y - mark.h / 2 >= hinge - 1);
  faceMarks(m, spec.marks.filter((mark) => !lidMarks.includes(mark)), (y) => y, lowerT);
  const frame = new THREE.Matrix4().makeTranslation(0, hinge, -1.6).multiply(new THREE.Matrix4().makeRotationX((-lean * Math.PI) / 180));
  m.within(frame, () => {
    m.add(spec.body, phoneShell(w, lidH, lidT, radius), [0, lidH / 2, 0]);
    faceMarks(m, lidMarks, (y) => y - hinge, lidT);
  });
  return m;
}

/** A cover outline: round at the top, and a smile along the bottom (the middle hangs lower than the sides). Points sit around the middle. */
export function smileOutline(w: number, h: number, dip: number): [number, number][] {
  const r = Math.min(10, w / 4);
  const hw = w / 2;
  const hh = h / 2;
  const pts: [number, number][] = [[-hw, -hh + dip], [-hw, hh - r]];
  for (let k = 0; k <= 5; k++) {
    const a = Math.PI - (Math.PI / 2) * (k / 5);
    pts.push([-hw + r + r * Math.cos(a), hh - r + r * Math.sin(a)]);
  }
  for (let k = 0; k <= 5; k++) {
    const a = Math.PI / 2 - (Math.PI / 2) * (k / 5);
    pts.push([hw - r + r * Math.cos(a), hh - r + r * Math.sin(a)]);
  }
  pts.push([hw, -hh + dip]);
  for (let i = 1; i < 16; i++) {
    const x = hw - (i / 16) * w;
    const u = x / hw;
    pts.push([x, -hh + dip * u * u]);
  }
  return pts;
}

/** The silver cover: the smile outline, extruded a little and centred. */
function smileCover(w: number, h: number, d: number, dip: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  smileOutline(w, h, dip).forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 4 });
  g.computeBoundingBox();
  const box3 = g.boundingBox;
  if (box3) g.translate(-(box3.min.x + box3.max.x) / 2, -(box3.min.y + box3.max.y) / 2, -(box3.min.z + box3.max.z) / 2);
  g.deleteAttribute("uv");
  g.computeVertexNormals();
  return g;
}

/** A shell that is narrower at the middle and round at the ends. */
function candyShell(w: number, h: number, d: number, pinch: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  const steps = 40;
  const ys: number[] = [];
  for (let i = 0; i <= steps; i++) ys.push(-h / 2 + (h * i) / steps);
  const half = (y: number) => {
    const u = (y + h / 2) / h;
    const side = w / 2 - pinch * Math.sin(Math.PI * u);
    const end = Math.min(u, 1 - u) * h;
    const r = 12;
    if (end < r) return side - r + Math.sqrt(Math.max(0.4, r * r - (r - end) * (r - end)));
    return side;
  };
  const right = ys.map((y) => [half(y), y] as const);
  const left = [...right].reverse().map(([x, y]) => [-x, y] as const);
  for (const [i, [x, y]] of [...right, ...left].entries()) {
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  const bevel = Math.min(0.8, d / 6);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.4, d - 2 * bevel),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.45,
    bevelSegments: 2,
    curveSegments: 4,
  });
  g.computeBoundingBox();
  const box3 = g.boundingBox;
  if (box3) g.translate(-(box3.min.x + box3.max.x) / 2, -(box3.min.y + box3.max.y) / 2, -(box3.min.z + box3.max.z) / 2);
  g.deleteAttribute("uv");
  g.computeVertexNormals();
  return g;
}

/** One rounded shell, marks on the front, and a stub antenna when the phone has one. The DynaTAC keeps its own shape. */
function shellPhone(m: Box, spec: MachineSpec) {
  const [w, d, h] = spec.size;
  const r = Math.min(spec.corner, w / 2 - 0.6);
  m.add(spec.body, spec.waist ? candyShell(w, h, d, spec.waist) : phoneShell(w, h, d, r), [0, h / 2, 0]);
  if (spec.chin) m.add("alu-dark", phoneShell(w * 0.96, spec.chin, d + 1.2, 3), [0, spec.chin / 2, 0.7]);
  if (spec.antenna) m.add(spec.body, cyl(2.2, spec.antenna + 4, 12), [w * 0.32, h + spec.antenna / 2 - 2, 0]);
  const thin = 0.45;
  for (const mark of spec.marks) {
    if (mark.face !== "front") continue;
    eachMark(mark, (x, y) => {
      const tone = mark.material ?? MATERIAL[mark.kind];
      if (Math.abs(x) > w / 2) {
        const side = x < 0 ? -1 : 1;
        m.add(tone, box(1.6, mark.h, Math.min(6, d * 0.45)), [side * (w / 2 + 0.5), y, 0]);
        return;
      }
      const at: Vec3 = [x, y, d / 2 + (mark.out ?? 0)];
      if ((mark.bow ?? 0) > 0 && !mark.cols && mark.h < 2 && mark.w > 20) {
        const steps = 12;
        for (let i = 0; i < steps; i++) {
          const t = (i + 0.5) / steps - 0.5;
          const fx = mark.x + t * mark.w;
          const fy = mark.y - (mark.bow ?? 0) * (1 - (2 * t) ** 2);
          m.add(tone, box(mark.w / steps + 0.6, mark.h, 0.35), [fx, fy, d / 2 + (mark.out ?? 0)]);
        }
        return;
      }
      const cover = mark.kind === "panel" && mark.h > 36;
      const tall = mark.kind === "key" && !mark.round && mark.h > mark.w * 1.3;
      const pill = mark.kind === "key" && !mark.round && mark.w > mark.h * 1.4;
      const cap = mark.kind === "key" && !mark.round && !pill && !tall && mark.h > 2;
      if (cover && tone === "shell-silver") m.add(tone, smileCover(mark.w, mark.h, 1.6, 6), [x, y, d / 2 + (mark.out ?? 0)]);
      else if (cover) m.add(tone, phoneShell(mark.w, mark.h, 1.6, 8), [x, y, d / 2 + (mark.out ?? 0)]);
      else if (mark.round) m.add(tone, cyl(mark.w / 2, thin, 20), at, [90, 0, 0]);
      else if (tall) m.add(tone, cyl(mark.w / 2, thin, 16), at, [90, 0, 0], { scale: [1, 1, mark.h / mark.w] });
      else if (pill) m.add(tone, cyl(mark.h / 2, thin, 28), at, [90, 0, 0], { scale: [mark.w / mark.h, 1, 1] });
      else if (cap) m.add(tone, plate(mark.w, mark.h, 0.5, 0.12, 0.2), at);
      else m.add(tone, box(mark.w, mark.h, thin), at);
    });
  }
  return m;
}

export function machine(m: Box, spec: MachineSpec) {
  const [w, d, h] = spec.size;
  if (spec.shape === "flip") return flipPhone(m, spec);
  if (spec.shape === "shell") return shellPhone(m, spec);
  if (spec.shape === "headphones") {
    for (const side of [-1, 1]) {
      m.add(spec.body, rbox(34, 110, d, spec.corner, 4), [side * (w / 2 - 17), 55, 0]);
      m.add("plastic-char", rbox(8, 92, d - 12, 12, 3), [side * (w / 2 - 38), 55, 0]);
    }
    m.add("plastic-char", tube(bandPoints("headphones", w, d, h), 6, 32, 8));
    return m;
  }
  if (spec.shape === "headset") {
    m.add(spec.body, rbox(w, h, d / 2, spec.corner, 4), [0, h / 2, d / 4]);
    m.add("black-glass", rbox(w - 10, h - 10, 2, spec.corner - 4, 3), [0, h / 2, d / 2 - 0.9]);
    m.add("plastic-grey", tube(bandPoints("headset", w, d, h), 6, 32, 8));
    return m;
  }
  if (spec.shape === "can") {
    const r = Math.min(w, d) / 2;
    m.add(spec.body, cyl(r, h * 0.78, 32), [0, h * 0.42, 0]);
    m.add(spec.body, box(r, 4, 4), [r * 0.4, h * 0.86, 0]);
    m.add(spec.body, cyl(4, 10, 16), [r * 0.85, h * 0.86, 0]);
  } else if (spec.shape === "dynatac") {
    // A dark battery along the rear, a light back of three panels, and a cream shell that steps back under the keypad.
    m.add("plastic-graphite", rbox(w - 4, h - 8, 22, 3, 2), [0, h / 2, -8]);
    m.add(spec.body, rbox(w - 2, h - 6, 6, 2, 2), [0, h / 2, -d / 2 + 2.6]);
    m.add(spec.body, rbox(w, 92, 22, 4, 2), [0, 148, 4]);
    m.add(spec.body, rbox(w - 1, 78, 16, 3, 2), [0, 62, 0]);
    m.add(spec.body, rbox(w - 2, 36, 24, 4, 2), [0, 20, 6]);
    m.add("plastic-black", rbox(56, 100, 8, 2, 2), [0, 136, 16]);
    m.add("plastic-black", cyl(14, 16, 28), [0, 174, 22], [90, 0, 0]);
    m.add("plastic-black", rbox(54, 82, 6, 2, 2), [0, 66, 10]);
  } else m.add(spec.body, rbox(w, h, d, Math.min(spec.corner, Math.min(w, d, h) / 2 - 0.1), 4), [0, h / 2, 0]);
  if (spec.antenna) {
    const len = spec.antenna;
    const x = spec.shape === "dynatac" ? 0 : -w * 0.22;
    const z = spec.shape === "dynatac" ? -3 : 0;
    m.add("rubber", cyl(7.2, 14, 16, 4.6), [x, h + 5, z]);
    m.add("rubber", cyl(4.6, len - 22, 20, 2.3), [x, h + 12 + (len - 22) / 2, z]);
    m.add("rubber", cyl(2.3, 10, 12, 1.6), [x, h + len - 8, z]);
  }
  const thin = 0.5;
  for (const mark of spec.marks) {
    eachMark(mark, (x, y) => {
      const onTop = mark.face === "top";
      const out = mark.out ?? 0;
      const depth = spec.shape === "dynatac" && mark.kind === "key" ? 2.4 : thin;
      const z = mark.face === "back" ? -d / 2 + depth / 2 - 0.05 - out : d / 2 - depth / 2 + 0.05 + out;
      const at: [number, number, number] = onTop ? [x, h - depth / 2 + 0.05 + out, y] : [x, y, z];
      const tone = mark.material ?? MATERIAL[mark.kind];
      if (mark.round) m.add(tone, cyl(mark.w / 2, depth, 24), at, onTop ? [0, 0, 0] : [90, 0, 0]);
      else if (onTop) m.add(tone, box(mark.w, depth, mark.h), at);
      else m.add(tone, box(mark.w, mark.h, depth), at);
    });
  }
  return m;
}
