// What a device's screen shows until a caller paints their own: the same few words laid out for each kind of screen. A one-bit bitmap for a small OLED, drawing steps for a canvas for
// the rest. Pure: the drawing is in the viewer. No device or product name of its own: every word comes from the caller.
import { ELLIPSIS, glyph, PRESS, textWidth } from "./font.ts";

/** A screen's words. Everything is optional; a screen with none shows only its shapes. */
export interface ScreenContent {
  /** The big line. */
  title?: string;
  /** A small line above it. */
  subtitle?: string;
  /** Status lines. */
  lines?: readonly string[];
  /** "good", "warn" or "bad": a coloured dot or a word's colour. */
  status?: "good" | "warn" | "bad";
  /** A short word in the corner: "OK". */
  badge?: string;
  /** "14:13". */
  clock?: string;
  /** The buttons of a touch panel, or the hints of an OLED. */
  buttons?: readonly string[];
}

// ---------------------------------------------------------------------------------------------------------------------------------
// A small OLED: one-bit pixels.

export const OLED_W = 128;
export const OLED_H = 64;
const HINT_Y = OLED_H - 9;

export class Bitmap {
  readonly width: number;
  readonly height: number;
  readonly px: Uint8Array;
  /** The text drawn, for the tests: [x, y, text, scale]. */
  readonly texts: [number, number, string, number][] = [];

  constructor(width = OLED_W, height = OLED_H) {
    this.width = width;
    this.height = height;
    this.px = new Uint8Array(width * height);
  }

  fill(x: number, y: number, w: number, h: number, on = true): void {
    for (let yy = Math.max(0, y); yy < Math.min(this.height, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(this.width, x + w); xx++) this.px[yy * this.width + xx] = on ? 1 : 0;
  }

  text(x: number, y: number, s: string, scale = 1, on = true, gap = 0): number {
    this.texts.push([x, y, s, scale]);
    let cx = x;
    for (const ch of s) {
      const rows = glyph(ch);
      rows.forEach((row, ry) => [...row].forEach((bit, rx) => bit === "#" && this.fill(cx + rx * scale, y + ry * scale, scale, scale, on)));
      cx += rows[0].length * scale + (gap || scale);
    }
    return textWidth(s, scale, gap);
  }

  fit(s: string, maxW: number, scale = 1): string {
    if (textWidth(s, scale) <= maxW) return s;
    let cut = s;
    while (cut && textWidth(cut + ELLIPSIS, scale) > maxW) cut = cut.slice(0, -1);
    return cut.trimEnd() + ELLIPSIS;
  }

  centre(y: number, s: string, scale = 1): void {
    const line = this.fit(s, this.width, scale);
    this.text(Math.floor((this.width - textWidth(line, scale)) / 2), y, line, scale);
  }

  keycap(x: number, y: number, label: string): number {
    const w = textWidth(label) + 4;
    this.fill(x, y, w, 9);
    for (const [px, py] of [
      [x, y],
      [x + w - 1, y],
      [x, y + 8],
      [x + w - 1, y + 8],
    ])
      this.fill(px, py, 1, 1, false);
    this.text(x + 2, y + 1, label, 1, false);
    return w;
  }

  lit(x: number, y: number): boolean {
    return this.px[y * this.width + x] === 1;
  }
}

/** A small OLED's picture: the subtitle and a badge along the top, the title big, two lines, the hints along the bottom. */
export function oledPicture(c: ScreenContent): Bitmap {
  const b = new Bitmap();
  let nameW = OLED_W;
  if (c.badge) {
    const capX = OLED_W - textWidth(c.badge) - 4;
    b.keycap(capX, 0, c.badge);
    nameW = capX - 4;
  }
  if (c.subtitle) b.text(0, 1, b.fit(c.subtitle, nameW));
  if (c.title) {
    if (textWidth(c.title, 2) <= OLED_W) b.centre(13, c.title, 2);
    else b.centre(17, c.title);
  }
  (c.lines ?? []).slice(0, 2).forEach((line, i) => b.centre(30 + i * 11, line));
  let x = 0;
  for (const label of (c.buttons ?? []).slice(0, 2)) {
    x += b.keycap(x, HINT_Y, PRESS) + 2;
    b.text(x, HINT_Y + 1, label);
    x += textWidth(label) + 6;
  }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Everything else: drawing steps for a canvas (sizes in the screen's own pixels; the viewer scales them up to stay sharp).

export type Box4 = [number, number, number, number];
export type DrawStep =
  | { kind: "rect"; box: Box4; fill?: string; outline?: string; radius?: number }
  | { kind: "dot"; x: number; y: number; r: number; fill: string }
  | { kind: "text"; box: Box4; text: string; size: number; min?: number; colour: string; bold?: boolean; align?: "left" | "center" | "right" };

const rgb = (r: number, g: number, b: number) => `rgb(${r} ${g} ${b})`;
const C = {
  BG: rgb(6, 9, 15),
  PANEL: rgb(22, 28, 42),
  LINE: rgb(74, 84, 108),
  INK: rgb(255, 255, 255),
  MUTED: rgb(178, 188, 208),
  ACCENT: rgb(96, 176, 255),
  GOOD: rgb(72, 208, 120),
  WARN: rgb(255, 196, 64),
  BAD: rgb(255, 100, 100),
};
const toneOf = (status: ScreenContent["status"]) => (status === "bad" ? C.BAD : status === "warn" ? C.WARN : C.GOOD);

/** A small touch panel's picture, by default 320 by 240: a header, the big line, status lines, and a rail of buttons on the right when there are any. */
export function panelPicture(c: ScreenContent, w = 320, h = 240): DrawStep[] {
  const GAP = 8;
  const RAIL_W = 80;
  const RAIL_H = 48;
  const buttons = (c.buttons ?? []).slice(0, 4);
  const wide = buttons.length ? w - GAP - RAIL_W - GAP : w;
  const steps: DrawStep[] = [{ kind: "rect", box: [0, 0, w, h], fill: C.BG }];
  steps.push({ kind: "rect", box: [0, 0, wide, 28], fill: C.PANEL });
  if (c.status) steps.push({ kind: "dot", x: 15, y: 14, r: 5, fill: toneOf(c.status) });
  const left = c.status ? 26 : 10;
  if (c.subtitle) steps.push({ kind: "text", box: [left, 0, wide - left - (c.clock ? 62 : 6), 28], text: c.subtitle, size: 15, min: 11, colour: C.INK, bold: true });
  if (c.clock) steps.push({ kind: "text", box: [wide - 56, 0, 50, 28], text: c.clock, size: 15, colour: C.INK, bold: true, align: "right" });
  if (c.title) steps.push({ kind: "text", box: [8, 34, wide - 16, 34], text: c.title, size: 26, min: 14, colour: C.INK, bold: true, align: "center" });
  (c.lines ?? []).slice(0, 6).forEach((text, i) => {
    steps.push({ kind: "text", box: [12, 78 + i * 22, wide - 24, 22], text, size: 15, min: 11, colour: i === 0 && c.status ? toneOf(c.status) : C.MUTED, bold: i === 0 });
  });
  if (c.badge) steps.push({ kind: "text", box: [8, h - 28, wide - 16, 24], text: c.badge, size: 12, colour: C.MUTED });
  const top = Math.floor((h - (buttons.length * RAIL_H + (buttons.length - 1) * GAP)) / 2);
  buttons.forEach((label, i) => {
    const box: Box4 = [w - GAP - RAIL_W, top + i * (RAIL_H + GAP), RAIL_W, RAIL_H];
    steps.push({ kind: "rect", box, fill: C.PANEL, outline: C.LINE, radius: 6 });
    steps.push({ kind: "text", box: [box[0] + 6, box[1], box[2] - 12, box[3]], text: label, size: 16, min: 11, colour: C.INK, bold: true, align: "center" });
  });
  return steps;
}

const TINTS = ["#2a4a7a", "#5a2a4a", "#2a5a4a", "#5a4a2a", "#3a2a6a"];

/** A wide screen's picture, any size: a rail, a hero card with the words, and a row of cards in the night colours. A narrower screen simply shows fewer cards. */
export function desktopPicture(c: ScreenContent, w = 1600, h = 1000): DrawStep[] {
  const u = h / 1000;
  const ground = "#070b13";
  const card = "#182131";
  const accent = "#6cd0ff";
  const steps: DrawStep[] = [{ kind: "rect", box: [0, 0, w, h], fill: ground }];
  const rail = 120 * u;
  steps.push({ kind: "rect", box: [0, 0, rail, h], fill: "#0e1522" });
  for (let i = 0; i < 5; i++) steps.push({ kind: "dot", x: 60 * u, y: (180 + i * 110) * u, r: (i === 0 ? 26 : 20) * u, fill: i === 0 ? accent : "#1f2a3c" });
  steps.push({ kind: "dot", x: 60 * u, y: 70 * u, r: 14 * u, fill: "#fbbf24" });
  const x0 = rail + 60 * u;
  const heroW = Math.min(w - x0 - 60 * u, 1060 * u);
  const pictureW = Math.min(400 * u, heroW * 0.36);
  steps.push({ kind: "rect", box: [x0, 90 * u, heroW, 470 * u], fill: card, radius: 28 * u });
  steps.push({ kind: "rect", box: [x0, 90 * u, pictureW, 470 * u], fill: "#1d3550", radius: 28 * u });
  const tx = x0 + pictureW + 40 * u;
  const tw = heroW - pictureW - 80 * u;
  if (c.subtitle) steps.push({ kind: "text", box: [tx, 150 * u, tw, 50 * u], text: c.subtitle, size: 40 * u, min: 14 * u, colour: accent, bold: true });
  if (c.title) steps.push({ kind: "text", box: [tx, 220 * u, tw, 90 * u], text: c.title, size: 72 * u, min: 26 * u, colour: "#eef2f8", bold: true });
  (c.lines ?? []).slice(0, 2).forEach((text, i) => steps.push({ kind: "text", box: [tx, (330 + i * 50) * u, tw, 50 * u], text, size: 36 * u, min: 14 * u, colour: "#9aa6b8" }));
  if (c.badge) {
    steps.push({ kind: "rect", box: [tx, 450 * u, 260 * u, 80 * u], fill: accent, radius: 40 * u });
    steps.push({ kind: "text", box: [tx, 450 * u, 260 * u, 80 * u], text: c.badge, size: 34 * u, min: 12 * u, colour: "#04202e", bold: true, align: "center" });
  }
  TINTS.forEach((tint, i) => steps.push({ kind: "rect", box: [x0 + i * 272 * u, 640 * u, 248 * u, 220 * u], fill: tint, radius: 18 * u }));
  return steps;
}

/** A phone's picture, upright: the words, a card, four tiles and a row of dots. */
export function phonePicture(c: ScreenContent, w = 390, h = 844): DrawStep[] {
  const ground = "#070b13";
  const accent = "#6cd0ff";
  const u = w / 346;
  const steps: DrawStep[] = [{ kind: "rect", box: [0, 0, w, h], fill: ground }];
  if (c.subtitle) steps.push({ kind: "text", box: [28 * u, 64 * u, w - 56 * u, 34 * u], text: c.subtitle, size: 26 * u, colour: accent, bold: true });
  if (c.title) steps.push({ kind: "text", box: [28 * u, 100 * u, w - 56 * u, 52 * u], text: c.title, size: 40 * u, min: 22 * u, colour: "#eef2f8", bold: true });
  steps.push({ kind: "rect", box: [24 * u, 170 * u, w - 48 * u, 190 * u], fill: "#182131", radius: 22 * u });
  steps.push({ kind: "rect", box: [24 * u, 170 * u, w - 48 * u, 120 * u], fill: "#1d3550", radius: 22 * u });
  const first = c.lines?.[0];
  if (first) steps.push({ kind: "text", box: [44 * u, 300 * u, w - 88 * u, 44 * u], text: first, size: 22 * u, min: 14 * u, colour: "#9aa6b8" });
  TINTS.slice(0, 4).forEach((tint, i) => steps.push({ kind: "rect", box: [(24 + (i % 2) * 154) * u, (384 + Math.floor(i / 2) * 124) * u, 144 * u, 112 * u], fill: tint, radius: 16 * u }));
  for (let i = 0; i < 4; i++) steps.push({ kind: "dot", x: (64 + i * 73) * u, y: 672 * u, r: (i === 0 ? 15 : 12) * u, fill: i === 0 ? accent : "#1f2a3c" });
  return steps;
}

/** An e-paper panel's picture: black on paper, as a two-colour panel shows it. */
export function paperPicture(c: ScreenContent, w = 500, h = 244): DrawStep[] {
  const paper = "#eeeee6";
  const ink = "#16171a";
  const steps: DrawStep[] = [{ kind: "rect", box: [0, 0, w, h], fill: paper }];
  steps.push({ kind: "rect", box: [0, 0, w, 52], fill: ink });
  if (c.subtitle) steps.push({ kind: "text", box: [18, 0, w - 150, 52], text: c.subtitle, size: 34, min: 18, colour: paper, bold: true });
  if (c.badge) steps.push({ kind: "text", box: [w - 132, 0, 114, 52], text: c.badge, size: 30, min: 16, colour: paper, bold: true, align: "right" });
  if (c.title) steps.push({ kind: "text", box: [18, 62, w - 36, 76], text: c.title, size: 62, min: 30, colour: ink, bold: true });
  (c.lines ?? []).slice(0, 2).forEach((text, i) => steps.push({ kind: "text", box: [18, 146 + i * 44, w - 36, 42], text, size: 30, min: 20, colour: ink }));
  return steps;
}
