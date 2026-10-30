// The drawings of the cases and the small parts on their own. No marks.
import type { Vec3 } from "../build/kit.ts";
import { BLACK, board, GREEN, HOLE, METAL, part, RED } from "./common.ts";
import { type Drawing, NZ, X, Y, Z } from "./drawing.ts";

const D = 56;
const p = board(D);

const cut = (w: number, dz: number, c: number): [number, number][] => [
  [-w / 2 + c, -dz / 2],
  [w / 2 - c, -dz / 2],
  [w / 2, -dz / 2 + c],
  [w / 2, dz / 2 - c],
  [w / 2 - c, dz / 2],
  [-w / 2 + c, dz / 2],
  [-w / 2, dz / 2 - c],
  [-w / 2, -dz / 2 + c],
];

export const argon = (d: Drawing) => {
  const CW = 107;
  const CD = 96;
  const H = 28;
  const F = CD / 2;
  d.prism(cut(CW, CD, 9), 0, 14, { top: "#232e40", front: "url(#metal)", side: "#1b2433", layer: 0 });
  d.prism(cut(CW, CD, 9), 14, 19, { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: 1.2, layer: 1 });
  // the sloped lid, its four long facets and its top
  const low = cut(CW, CD, 9);
  const high = cut(CW - 22, CD - 22, 7);
  low.forEach(([x, z], i) => {
    const j = (i + 1) % low.length;
    const shade = ["#1f2a3c", "#141c2a", "#232e40", "#151e2d", "#2a374c", "#1c2636", "#222c3e", "#161f2e"][i];
    const mid = [(x + low[j][0]) / 2, 0, (z + low[j][1]) / 2];
    const normal: Vec3 = [mid[0], 12, mid[2]];
    d.flat([[x, 19, z], [low[j][0], 19, low[j][1]], [high[j][0], H, high[j][1]], [high[i][0], H, high[i][1]]], normal, { fill: shade, stroke: "#8fa1b8", sw: 1 }, 2);
  });
  d.flat(
    high.map(([x, z]): Vec3 => [x, H, z]),
    Y,
    { fill: "url(#top)", stroke: "#8fa1b8", sw: 1.2 },
    3,
  );
  d.line([[-(CW - 22) / 2, H, -6], [(CW - 22) / 2, H, -6]], { stroke: "#8fa1b8", sw: 0.7, opacity: 0.7 }, 3.5, Y);
  // the slots along the band
  const slots: [Vec3, Vec3][] = [];
  for (let i = 0; i < 24; i++) {
    const x = -40 + (i * 80) / 23;
    slots.push([[x, 15, F + 0.2], [x, 18, F + 0.2]]);
  }
  d.lines(slots, { stroke: "#05080e", sw: 1.2 }, 2, Z);
  // the sockets
  d.rect([-42, 8.5, F + 0.2], X, Y, 11, 3.2, HOLE, 2, 1.2);
  d.rect([-23, 9.5, F + 0.2], X, Y, 13, 4.2, HOLE, 2, 0.8);
  d.rect([-40, 4, F + 0.2], X, Y, 8.8, 2.6, HOLE, 2, 1);
  d.rect([-26, 4, F + 0.2], X, Y, 8.8, 2.6, HOLE, 2, 1);
  d.dot([-13, 5.6, F + 0.2], 2.5, HOLE, 2);
  for (const x of [5, 25, 45]) d.rect([x, 7, F + 0.2], X, Y, 16.6, 11, HOLE, 2);
};

/** The finned case. `covered`: something sits on it, so the fins, fans and wires do not show, only the grooves. */
export const armor = (d: Drawing, covered: boolean) => {
  const y = 1.4;
  part(d, p, [-1.2, 87], [-1.6, D + 1.6], 3, { ...BLACK, layer: 0 }, -3.4);
  // the finned shell
  if (covered) {
    part(d, p, [-1.6, 65], [-1.4, D + 1.4], 14.4, { ...BLACK, layer: 1.2 }, 1.4);
    for (const h of [9.6, 11.4]) d.line([p(-1.6, h, D + 1.5), p(65, h, D + 1.5)], { stroke: "#8fa1b8", sw: 0.6, opacity: 0.5 }, 1.4, Z);
    return;
  }
  part(d, p, [-1.6, 65], [-1.4, D + 1.4], 14.8, { ...BLACK, layer: 1.2 }, y);
  const top = 16.2;
  const fins: [Vec3, Vec3][] = [];
  const fans = [
    [15.5, 31],
    [47.5, 31],
  ];
  for (let z = 0; z <= D; z += 3.6) {
    let from = -1.6;
    const cuts = fans.flatMap(([fx, fz]) => {
      const dz = Math.abs(z - fz);
      if (dz > 14.4) return [];
      const half = Math.sqrt(14.4 ** 2 - dz ** 2);
      return [[fx - half, fx + half]];
    });
    for (const [a, b] of [...cuts, [65, 65]]) {
      if (a > from) fins.push([p(from, top, z), p(a, top, z)]);
      from = b;
    }
  }
  d.lines(fins, { stroke: "#8fa1b8", sw: 0.8, opacity: 0.75 }, 1.4);
  for (const [fx, fz] of fans) {
    d.circle(p(fx, top, fz), X, NZ, 13.4, { fill: "#05080e", stroke: "#8fa1b8", sw: 1.2 }, 2);
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 + 0.3;
      d.line([p(fx, top, fz), p(fx + Math.cos(a) * 11, top, fz + Math.sin(a) * 11)], { stroke: "#5f6f88", sw: 1.6 }, 2.5, Y);
    }
  }
  // the fan's wire over to the header
  d.line([p(47.5, top, 45), p(37, top + 7, 49), p(22, top + 8, 49), p(10, top + 4, 54), p(4, top, D + 1)], { stroke: RED, sw: 1.4 }, 3);
  // the sockets along the front, in their gaps
  for (const [bx, w] of [
    [11.2, 9],
    [26, 7.5],
    [39.5, 7.5],
  ])
    d.rect(p(bx, 3.2, -1.5), X, Y, w, 3.2, HOLE, 2, 0.8);
  d.dot(p(53.5, 4.2, -1.5), 2.6, HOLE, 2);
  d.light(p(2.5, 6, -1.5), GREEN, 0.9, 3, Z);
};

/** The small domed case, closed: the wide foot, the green seam, the domed lid with its notches along the front and the card's slot. */
export function unipi(d: Drawing) {
  const cx = 32.5;
  d.rounded(cx, 0, 82, 46, 7, 0, 2.4, { top: "url(#top)", front: "#0b111c", side: "#0b111c", sw: 1.6, layer: 0 }, 4);
  d.rounded(cx, 0, 70.4, 35.4, 6.7, 2.4, 2.85, { top: "url(#pcb)", front: "#2f7a4d", side: "#1d4d33", sw: 0.8, layer: 1 }, 4);
  d.rounded(cx, 0, 72, 37, 7.5, 2.85, 14.6, { layer: 2 }, 5);
  const face = 18.5;
  for (const [x, w] of [
    [12.4, 13.8],
    [41.4, 10.6],
    [54, 10.6],
  ]) {
    d.rect([x, 5.8, face + 0.1], X, Y, w, 5.4, HOLE, 3, 0.8);
    d.rect([x, 5.7, face + 0.3], X, Y, w - 2.6, w > 12 ? 3.2 : 3, { fill: "url(#metal)", stroke: "#8fa1b8", sw: 0.6 }, 4, 0.6);
  }
  d.rect([cx - 36.2, 4.5, 0], Z, Y, 13, 1.8, HOLE, 3, 0.6);
}

/** The plain plate under a board. */
export function plate(d: Drawing, w: number, depth: number, holes: readonly (readonly [number, number])[]) {
  const q = board(depth);
  d.rounded(w / 2, 0, w + 4, depth + 4, 3, -6, -4, { top: "#232e40", front: "#111a2a", side: "#0b111c", sw: 1.4, layer: 0 }, 3);
  for (const [hx, hz] of holes) d.dot(q(hx, 1.6, hz), 2.2, { fill: "#8d98a8", stroke: "#8fa1b8", sw: 0.6 }, 2);
}

/** A desk stand on its own, as the tablets' stands are. */
export function deskStand(d: Drawing, w: number, foot: number) {
  const stand = Math.min(w * 0.46, 120);
  d.box(-stand / 2, stand / 2, 0, 4.4, -45, 13, { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: 1.2, layer: 0 });
  d.box(-stand / 2, stand / 2, 0, foot + 5, 9, 13, { top: "#232e40", front: "url(#metal)", side: "#1b2433", sw: 1.2, layer: 3 });
}

export function hdd35(d: Drawing) {
  d.box(-50.8, 50.8, 1, 23, -73.5, 73.5, { ...METAL, layer: 1 });
  d.box(-46, 46, 0, 1.4, -21, 69, { top: "url(#pcb)", front: "#1d4d33", side: "#1d4d33", sw: 1, layer: 0 });
  d.rect([0, 23.7, 0], X, NZ, 97, 141, { stroke: "#8fa1b8", sw: 0.8 }, 2, 3);
  for (const [x, z] of [
    [-40, -60],
    [40, -60],
    [-40, 0],
    [40, 0],
    [-40, 60],
    [40, 60],
  ])
    d.circle([x, 23.8, z], X, NZ, 2.4, { stroke: "#8fa1b8", sw: 0.8 }, 3);
}

export function ssd25(d: Drawing) {
  d.rounded(0, 0, 69.9, 100, 1.2, 0, 7, { layer: 1 }, 2);
  d.rect([12, 3.5, 50.1], X, Y, 34, 3, HOLE, 2, 0.6);
}
