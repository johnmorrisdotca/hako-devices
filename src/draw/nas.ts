// The drawings of the NAS boxes. No printing.
import type { Vec3 } from "../build/kit.ts";
import type { DriveId } from "../parts.ts";
import { BLUE, DARK, GREEN, METAL } from "./common.ts";
import { type Drawing, X, Y, Z } from "./drawing.ts";

/** A NAS: the near-black tower, its trays, the column of lights and buttons; seen from the front three-quarter like the 3D view. A bay with no drive shows its dark mouth. */
export function nas(d: Drawing, bays: number, drives: readonly (DriveId | null)[] | undefined) {
  const H = 166;
  const D = 223;
  const TRAY = 33.6;
  const W = bays === 1 ? 71 : bays === 2 ? 105 : bays * (TRAY + 2) + 26 + 22;
  const F = D / 2;
  d.rounded(0, 0, W, D, 7, 0, H, {}, 3);
  const columnLeft = bays > 2;
  const x0 = columnLeft ? -W / 2 + 32 : -W / 2 + 5;
  const cx = columnLeft ? -W / 2 + 18 : W / 2 - 17;
  for (let i = 0; i < bays; i++) {
    const x = x0 + TRAY / 2 + i * (TRAY + 2);
    if (drives !== undefined && (drives[i] ?? null) === null) {
      d.rect([x, 84, F + 0.5], X, Y, TRAY, 150, { fill: "#05080e", stroke: "#8fa1b8", sw: 1.4 }, 1, 2);
      continue;
    }
    d.rect([x, 84, F + 0.5], X, Y, TRAY, 150, { fill: "#111a2a", stroke: "#8fa1b8", sw: 1.4 }, 1, 2);
    d.rect([x, 82, F + 0.8], X, Y, TRAY - 7, 117, { stroke: "#8fa1b8", sw: 0.6, opacity: 0.5 }, 2, 2);
    d.circle([x, 17, F + 0.8], X, Y, 2.6, { stroke: "#8fa1b8", sw: 1 }, 2);
    d.light([x, 150, F + 1], GREEN, 1.6, 3, Z);
  }
  for (let i = 0; i < 2 + Math.min(bays, 5); i++) d.light([cx, 152 - i * 9, F + 0.2], GREEN, 1.3, 3, Z);
  const y1 = 152 - (2 + Math.min(bays, 5)) * 9 - 8;
  d.rect([cx, y1, F + 0.2], X, Y, 9, 7, DARK, 2, 1.4);
  d.rect([cx, y1 - 26, F + 0.2], X, Y, 6, 13, { fill: "#05080e", stroke: "#8fa1b8", sw: 1 }, 2, 1);
  d.rect([cx - 0.9, y1 - 26, F + 0.4], X, Y, 1.8, 11, { fill: "#2160d8" }, 3);
  d.circle([cx, 26, F + 0.2], X, Y, 5.4, { stroke: "#8fa1b8", sw: 1.4 }, 2);
  d.light([cx, 26, F + 0.4], BLUE, 1.6, 3, Z);
  return d;
}


export const nasRack = (d: Drawing, drives: readonly (DriveId | null)[] | undefined) => {
  const W = 430;
  const H = 44;
  const F = 230;
  d.box(-W / 2, W / 2, 0, H, -F, F, { top: "url(#top)", layer: 0 });
  for (const side of [-1, 1])
    d.box(side * (W / 2) - (side > 0 ? 0 : 26), side * (W / 2) + (side > 0 ? 26 : 0), 0, H, F - 2, F, { ...METAL, layer: 1 });
  const x0 = -W / 2 + 6 + 47.5;
  for (let i = 0; i < 4; i++) {
    const x = x0 + i * 96;
    if (drives !== undefined && (drives[i] ?? null) === null) {
      d.rect([x, H / 2, F + 0.2], X, Y, 95, H - 8, { fill: "#05080e", stroke: "#8fa1b8", sw: 1 }, 2, 1);
      continue;
    }
    d.rect([x, H / 2, F + 0.2], X, Y, 95, H - 8, { fill: "#111a2a", stroke: "#8fa1b8", sw: 1 }, 2, 1);
    d.light([x + 40, H - 10, F + 0.4], GREEN, 1, 3, Z);
  }
  d.circle([W / 2 - 14, 16, F + 0.2], X, Y, 4.4, { stroke: BLUE, sw: 1.2 }, 2);
  d.light([W / 2 - 33, H - 11, F + 0.2], GREEN, 1, 3, Z);
  d.line(
    [
      [-W / 2 + 2, H + 0.1, -40],
      [W / 2 - 2, H + 0.1, -40],
    ],
    { stroke: "#8fa1b8", sw: 0.8, opacity: 0.7 },
    1,
    Y,
  );
  const vents: [Vec3, Vec3][] = [];
  for (let z = -190; z < -70; z += 11)
    vents.push([
      [-185, H + 0.1, z],
      [185, H + 0.1, z],
    ]);
  d.lines(vents, { stroke: "#8fa1b8", sw: 1.2, dash: "0 5", opacity: 0.45 }, 1, Y);
  return d;
};
