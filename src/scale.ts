// Drawing to scale. A drawing fills its own picture by default, so a small board looks as big as a tower; these numbers let a page draw machines at their true relative
// size instead. Every drawing records how many millimetres one unit of its picture is, where the device's box lies on it, and its baseline. Pure: it works on a drawing's text.
import type { DrawingStyle } from "./styles.ts";

/** A drawing's relation to millimetres. */
export interface ArtMetrics {
  /** Millimetres per unit of the picture, on the plane the camera looks at. */
  mmPerUnit: number;
  /** The device's box on the picture: x0, y0, x1, y1 in the picture's units. */
  box: readonly [number, number, number, number];
  /** The y of the ground it stands on, in the picture's units. */
  baseline: number;
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** The numbers for a camera `distance` from what it looks at, `fovDeg` top to bottom, on a picture `pictureH` units tall. Same unit for the distance as the millimetres. */
export function artMetrics(distance: number, fovDeg: number, pictureH: number, box: readonly [number, number, number, number]): ArtMetrics {
  const mmPerUnit = (2 * distance * Math.tan((fovDeg * Math.PI) / 360)) / pictureH;
  return { mmPerUnit: r3(mmPerUnit), box: [r3(box[0]), r3(box[1]), r3(box[2]), r3(box[3])], baseline: r3(box[3]) };
}

/** Writes the numbers on a drawing's root element. */
export function plantMetrics(svg: string, metrics: ArtMetrics): string {
  return svg.replace("<svg ", `<svg data-mm-per-unit="${metrics.mmPerUnit}" data-box="${metrics.box.join(" ")}" data-baseline="${metrics.baseline}" `);
}

/** Reads the numbers back from a drawing's text; null when it has none. */
export function readMetrics(svg: string): ArtMetrics | null {
  const mm = /data-mm-per-unit="([\d.]+)"/.exec(svg);
  const box = /data-box="([\d. -]+)"/.exec(svg);
  const base = /data-baseline="([\d.-]+)"/.exec(svg);
  if (!mm || !box || !base) return null;
  const parts = box[1].split(" ").map(Number);
  if (parts.length !== 4 || parts.some((v) => !Number.isFinite(v))) return null;
  return { mmPerUnit: Number(mm[1]), box: [parts[0], parts[1], parts[2], parts[3]], baseline: Number(base[1]) };
}

/** A unit as written: "2px/mm" or 2. Pixels per millimetre; `fallback` for anything else or a value out of reason. */
export function parseUnit(value: unknown, fallback = 1): number {
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  const match = /^(\d*\.?\d+)\s*(?:px\/mm)?$/i.exec(text);
  const n = match ? Number(match[1]) : NaN;
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : fallback;
}

/** How big a device comes out at `unit` pixels a millimetre, and where the whole picture must sit so the device's box starts at the top left. */
export interface RealPlacement {
  /** Pixels for one unit of the picture. */
  scale: number;
  /** The device's box in pixels. */
  width: number;
  height: number;
  /** Where the whole picture goes, relative to that box, and its size. */
  left: number;
  top: number;
  pictureWidth: number;
  pictureHeight: number;
}

export function realPlacement(metrics: ArtMetrics, unit: number, picture: readonly [number, number] = [320, 220]): RealPlacement {
  const scale = metrics.mmPerUnit * unit;
  const [x0, y0, x1, y1] = metrics.box;
  return {
    scale,
    width: (x1 - x0) * scale,
    height: (y1 - y0) * scale,
    left: -x0 * scale,
    top: -y0 * scale,
    pictureWidth: picture[0] * scale,
    pictureHeight: picture[1] * scale,
  };
}

/** Whether a line of this width in a style's drawing is a line, not a drawn shape: an outline or anything finer. A wider one (a handle) is a shape and scales with the device. */
function isLine(width: number, style: DrawingStyle): boolean {
  const near = 0.05;
  return width <= 1.6 * style.detail + near || (width >= 1.6 * style.outline - near && width <= 2.4 * style.outline + near);
}

/** A drawing at real scale: `unit` pixels a millimetre, its lines the same width whatever the scale (the width its style sets, in pixels). A dotted row keeps its shape. */
export function realScaleSvg(svg: string, unit: number, style: DrawingStyle): string {
  const metrics = readMetrics(svg);
  if (!metrics) return svg;
  const k = metrics.mmPerUnit * unit;
  const placed = svg
    // the halo belongs to a picture of its own: machines side by side share one ground
    .replace(/<ellipse cx="160" cy="110"[^>]*fill="url\(#halo\)"\/>/, "")
    .replace(/ width="320" height="220"/, ` width="${r3(320 * k)}" height="${r3(220 * k)}"`)
    .replace(/<(path|circle|ellipse|rect)\b([^>]*?)stroke-width="([\d.]+)"([^>]*?)\/>/g, (whole, tag: string, a: string, width: string, b: string) => {
      if (`${a}${b}`.includes("stroke-dasharray") || !isLine(Number(width), style)) return whole;
      return `<${tag}${a}stroke-width="${width}" vector-effect="non-scaling-stroke"${b}/>`;
    });
  return placed;
}
