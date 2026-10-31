// Well-known machines, each one body with marks on its front and top: one description for its mesh and its drawing, placed from its published size. Plain geometry: no mark or logo.
import { type Box, box, cyl, type Material, rbox, tube, type Vec3 } from "./kit.ts";

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
  /** A block of marks, centred on (x, y). */
  cols?: number;
  rows?: number;
  gap?: number;
}

export interface MachineSpec {
  size: readonly [number, number, number];
  body: Material;
  corner: number;
  marks: readonly Mark[];
  /** Not one block: its own shape, in its size. */
  shape?: "headphones" | "headset" | "can";
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
  // No page opened names this body's size. 190 by 180 by 70 mm is a stand-in, not a measurement. The cartridge slot, two buttons and two front ports follow the photograph. Places are not measured.
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
      const y = mark.y + ((rows - 1) / 2 - r) * (mark.h + gap) * (mark.face === "top" ? -1 : 1);
      each(x, y);
    }
  }
}

export function machine(m: Box, spec: MachineSpec) {
  const [w, d, h] = spec.size;
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
  } else m.add(spec.body, rbox(w, h, d, Math.min(spec.corner, Math.min(w, d, h) / 2 - 0.1), 4), [0, h / 2, 0]);
  const thin = 0.5;
  for (const mark of spec.marks) {
    eachMark(mark, (x, y) => {
      const onTop = mark.face === "top";
      const z = mark.face === "back" ? -d / 2 + thin / 2 - 0.05 : d / 2 - thin / 2 + 0.05;
      const at: [number, number, number] = onTop ? [x, h - thin / 2 + 0.05, y] : [x, y, z];
      if (mark.round) m.add(MATERIAL[mark.kind], cyl(mark.w / 2, thin, 24), at, onTop ? [0, 0, 0] : [90, 0, 0]);
      else if (onTop) m.add(MATERIAL[mark.kind], box(mark.w, thin, mark.h), at);
      else m.add(MATERIAL[mark.kind], box(mark.w, mark.h, thin), at);
    });
  }
  return m;
}
