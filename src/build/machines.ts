// Well-known machines, each one body with marks on its front and top: one description for its mesh and its drawing, placed from its published size. Plain geometry: no mark or logo.
import { type Box, box, cyl, type Material, rbox } from "./kit.ts";

export type MarkKind = "screen" | "lcd" | "dark" | "panel" | "slot" | "key" | "light";

export interface Mark {
  face: "front" | "top";
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
}

const front = (kind: MarkKind, x: number, y: number, w: number, h: number, more: Partial<Mark> = {}): Mark => ({ face: "front", kind, x, y, w, h, ...more });
const top = (kind: MarkKind, x: number, y: number, w: number, h: number, more: Partial<Mark> = {}): Mark => ({ face: "top", kind, x, y, w, h, ...more });

export const MACHINES: Readonly<Record<string, MachineSpec>> = {
  "macintosh-128k": {
    size: [243.8, 276.9, 345.4],
    body: "plastic-grey",
    corner: 8,
    marks: [front("panel", 0, 236, 205, 165), front("screen", 0, 240, 175, 130), front("dark", 0, 130, 225, 2), front("slot", 42, 82, 92, 6), front("dark", 0, 28, 225, 2)],
  },
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
  dreamcast: {
    size: [190, 195.8, 75.5],
    body: "plastic-white",
    corner: 12,
    marks: [top("panel", 0, -20, 130, 130, { round: true }), top("key", 80, 58, 10, 10, { round: true }), front("dark", 0, 22, 28, 13, { cols: 4, rows: 1, gap: 12 })],
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
      const y = mark.y + ((rows - 1) / 2 - r) * (mark.h + gap) * (mark.face === "front" ? 1 : -1);
      each(x, y);
    }
  }
}

export function machine(m: Box, spec: MachineSpec) {
  const [w, d, h] = spec.size;
  m.add(spec.body, rbox(w, h, d, Math.min(spec.corner, Math.min(w, d, h) / 2 - 0.1), 4), [0, h / 2, 0]);
  const thin = 0.5;
  for (const mark of spec.marks) {
    eachMark(mark, (x, y) => {
      if (mark.face === "front") {
        const at: [number, number, number] = [x, y, d / 2 - thin / 2 + 0.05];
        if (mark.round) m.add(MATERIAL[mark.kind], cyl(mark.w / 2, thin, 24), at, [90, 0, 0]);
        else m.add(MATERIAL[mark.kind], box(mark.w, mark.h, thin), at);
      } else {
        const at: [number, number, number] = [x, h - thin / 2 + 0.05, y];
        if (mark.round) m.add(MATERIAL[mark.kind], cyl(mark.w / 2, thin, 32), at);
        else m.add(MATERIAL[mark.kind], box(mark.w, thin, mark.h), at);
      }
    });
  }
  return m;
}
