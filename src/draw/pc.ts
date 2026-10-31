// The drawings of the small PCs and the tower. A computer of no particular make keeps a warm light down its face.
import type { Vec3 } from "../build/kit.ts";
import { AMBER, BLACK, BLUE, DARK, GREEN, HOLE } from "./common.ts";
import { type Drawing, X, Y, Z } from "./drawing.ts";

/** A small PC: the dark body under a glossy lid, its ports and power button in front. */
export function nuc(d: Drawing) {
  const F = 56;
  d.rounded(0, 0, 117, 112, 8, 0, 51, { top: "#0e1420" }, 3);
  d.rounded(0, 0, 116, 111, 7.6, 51, 54, { top: "url(#top)", front: "#0b111c", sw: 1.4 }, 3);
  d.circle([-44, 26, F + 0.2], X, Y, 4.6, { stroke: "#8fa1b8", sw: 1.4 }, 2);
  d.light([-44, 26, F + 0.4], BLUE, 1.4, 3, Z);
  d.rect([-26, 26, F + 0.2], X, Y, 8.6, 3.1, HOLE, 2, 1.4);
  for (const x of [-8, 12]) d.rect([x, 26, F + 0.2], X, Y, 13.4, 5.8, HOLE, 2, 0.4);
  d.circle([36, 26, F + 0.2], X, Y, 1.9, HOLE, 2);
  return d;
}

/** A computer of no particular make: a small tower with its firefly light. */
export function unknownBox(d: Drawing) {
  const F = 100;
  d.rounded(0, 0, 90, 200, 6, 0, 210, {}, 3);
  d.rect([0, 108, F + 0.4], X, Y, 84, 196, { fill: "#0c1320", stroke: "#8fa1b8", sw: 1 }, 1, 4);
  d.line(
    [
      [31, 50, F + 1.5],
      [31, 170, F + 1.5],
    ],
    { stroke: AMBER, sw: 2.2 },
    2,
    Z,
  );
  d.light([31, 110, F + 1.5], AMBER, 1.8, 3, Z);
  d.circle([-29, 190, F + 1.4], X, Y, 5.4, { stroke: "#8fa1b8", sw: 1.4 }, 2);
  d.light([-29, 190, F + 1.6], "#f4f7ff", 1.2, 3, Z);
  for (const y of [172, 162]) d.rect([-29, y, F + 1.4], X, Y, 13.4, 5.8, HOLE, 2, 0.4);
  return d;
}


export const miniPc = (d: Drawing) => {
  const W = 128;
  const H = 48;
  const F = W / 2;
  d.rounded(0, 0, W, W, 14, 0, H, { top: "url(#top)", front: "url(#metal)", side: "#1b2433" }, 4);
  d.rect([0, H + 0.1, 0], X, [0, 0, -1], W - 16, W - 16, { fill: "#141c2a", stroke: "#8fa1b8", sw: 1 }, 1, 9);
  const dots: [Vec3, Vec3][] = [];
  for (let z = -46; z <= 46; z += 7)
    dots.push([
      [-48, H + 0.2, z],
      [48, H + 0.2, z],
    ]);
  d.lines(dots, { stroke: "#8fa1b8", sw: 1.1, dash: "0 3.4", opacity: 0.5 }, 1.5, Y);
  const y = H / 2 - 2;
  d.rect([0, y, F + 0.2], X, Y, W - 24, 22, { fill: "#05080e", stroke: "#8fa1b8", sw: 0.8 }, 2, 2);
  d.circle([-46, y, F + 0.3], X, Y, 3.8, { stroke: BLUE, sw: 1.2 }, 3);
  for (const x of [-26, -8]) d.rect([x, y, F + 0.3], X, Y, 13.4, 5.8, DARK, 3, 0.4);
  d.rect([10, y, F + 0.3], X, Y, 8.6, 3.1, DARK, 3, 1.4);
  d.light([46, y, F + 0.3], "#f4f7ff", 1.2, 4, Z);
  return d;
};

export const pcTower = (d: Drawing) => {
  const W = 180;
  const H = 380;
  const F = 180;
  d.box(-W / 2, W / 2, 0, 12, -170, 170, { ...BLACK, layer: 0 });
  d.box(-W / 2, W / 2, 12, H, -F, F + 8, { top: "url(#top)", layer: 1 });
  const front = F + 8.2;
  d.rect([0, 150, front], X, Y, W - 28, 240, { fill: "#0c1320", stroke: "#8fa1b8", sw: 1 }, 2, 2);
  const dots: [Vec3, Vec3][] = [];
  for (let y = 40; y < 270; y += 11)
    dots.push([
      [-W / 2 + 22, y, front],
      [W / 2 - 18, y, front],
    ]);
  // wider than an outline, so every style keeps these round dots as they are (styles.mjs)
  d.lines(dots, { stroke: "#8fa1b8", sw: 2.5, dash: "0 4.6", opacity: 0.55 }, 3, Z);
  d.circle([-W / 2 + 28, H - 34, front], X, Y, 9, { stroke: "#f4f7ff", sw: 1.4 }, 3);
  for (const x of [8, 28]) d.rect([x, H - 34, front], X, Y, 13.4, 5.8, HOLE, 3, 0.4);
  d.light([-W / 2 + 54, H - 34, front], GREEN, 1.3, 4, Z);
  const vents: [Vec3, Vec3][] = [];
  for (let z = -50; z < 110; z += 10)
    vents.push([
      [W / 2 + 0.2, 100, z],
      [W / 2 + 0.2, 300, z],
    ]);
  d.lines(vents, { stroke: "#8fa1b8", sw: 0.7, opacity: 0.4 }, 2, X);
  return d;
};

