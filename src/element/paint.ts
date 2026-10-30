// Paints the faces of a 3D view on canvases, in the browser: a screen, a printed word, the dots of a perforated panel, a soft glow. Canvases only: no image is loaded, so a page's
// content security policy needs nothing for them.
import { type Bitmap, type DrawStep } from "../screen/picture.ts";

const SANS = '"DejaVu Sans", Verdana, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function canvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function fitText(ctx: CanvasRenderingContext2D, text: string, size: number, min: number, bold: boolean, width: number): { text: string; size: number } {
  let s = size;
  const font = (n: number) => `${bold ? "700 " : ""}${n}px ${SANS}`;
  ctx.font = font(s);
  while (s > min && ctx.measureText(text).width > width) ctx.font = font(--s);
  if (ctx.measureText(text).width <= width) return { text, size: s };
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}...`).width > width) cut = cut.slice(0, -1);
  return { text: `${cut.trimEnd()}...`, size: s };
}

/** Draws the steps of a screen at `scale` canvas pixels per screen pixel. */
export function paintSteps(steps: readonly DrawStep[], w: number, h: number, scale: number): HTMLCanvasElement {
  const c = canvas(w * scale, h * scale);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.scale(scale, scale);
  ctx.textBaseline = "middle";
  for (const step of steps) {
    if (step.kind === "rect") {
      ctx.beginPath();
      ctx.roundRect(step.box[0], step.box[1], step.box[2], step.box[3], step.radius ?? 0);
      if (step.fill) {
        ctx.fillStyle = step.fill;
        ctx.fill();
      }
      if (step.outline) {
        ctx.strokeStyle = step.outline;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (step.kind === "dot") {
      ctx.beginPath();
      ctx.arc(step.x, step.y, step.r, 0, Math.PI * 2);
      ctx.fillStyle = step.fill;
      ctx.fill();
    } else {
      const [x, y, bw, bh] = step.box;
      const fitted = fitText(ctx, step.text, step.size, step.min ?? step.size, step.bold === true, bw);
      ctx.fillStyle = step.colour;
      ctx.textAlign = step.align ?? "left";
      const tx = step.align === "center" ? x + bw / 2 : step.align === "right" ? x + bw : x;
      ctx.fillText(fitted.text, tx, y + bh / 2 + 0.5);
    }
  }
  return c;
}

/** A one-bit picture blown up so each pixel is a square with a hair of black round it, as on a real panel: lit pixels a cool white, the others true black. */
export function paintBitmap(b: Bitmap): HTMLCanvasElement {
  const s = 8;
  const c = canvas(b.width * s, b.height * s);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#e6f6ff";
  for (let y = 0; y < b.height; y++) for (let x = 0; x < b.width; x++) if (b.lit(x, y)) ctx.fillRect(x * s + 0.75, y * s + 0.75, s - 1.5, s - 1.5);
  return c;
}

/** The soft light round lit pixels: the picture blurred, for a layer added over the screen. */
export function paintHalo(picture: HTMLCanvasElement, blur: number): HTMLCanvasElement {
  const c = canvas(picture.width, picture.height);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(picture, 0, 0);
  return c;
}

/** A small panel's picture blown up four times with no smoothing so its pixels stay square, a faint grid between them and the shadow of the bezel round the edge. */
export function paintPanel(native: HTMLCanvasElement): HTMLCanvasElement {
  const s = 4;
  const c = canvas(native.width * s, native.height * s);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(native, 0, 0, c.width, c.height);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  for (let x = 0; x < c.width; x += s) ctx.fillRect(x, 0, 1, c.height);
  for (let y = 0; y < c.height; y += s) ctx.fillRect(0, y, c.width, 1);
  const edge = 14;
  for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [
    [0, 0, edge, 0, 0, 0, edge, c.height],
    [c.width, 0, c.width - edge, 0, c.width - edge, 0, edge, c.height],
    [0, 0, 0, edge, 0, 0, c.width, edge],
    [0, c.height, 0, c.height - edge, 0, c.height - edge, c.width, edge],
  ]) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(rx, ry, rw, rh);
  }
  return c;
}

/** The caller's words printed on a panel: light letters on clear. */
export function paintPrint(text: string, w: number, h: number, colour = "#e8eef7"): HTMLCanvasElement {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const fitted = fitText(ctx, text, Math.round(h * 0.78), 8, true, w * 0.96);
  ctx.font = `700 ${fitted.size}px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = colour;
  ctx.fillText(fitted.text, w / 2, h / 2);
  return c;
}

/** One cell of a perforated panel: a dark round hole `dot` (0 to 1) of the cell wide on white, which the panel's own colour then tints. */
export function paintPerforation(dot: number): HTMLCanvasElement {
  const n = 64;
  const c = canvas(n, n);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, n, n);
  const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, (n / 2) * dot);
  g.addColorStop(0, "#000");
  g.addColorStop(0.8, "#0a0a0a");
  g.addColorStop(1, "#5a5a5a");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(n / 2, n / 2, (n / 2) * dot, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/** A soft round glow (a firefly, the pool of light under a device). */
export function paintGlow(inner: string, outer: string): HTMLCanvasElement {
  const n = 128;
  const c = canvas(n, n);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, n, n);
  return c;
}
