// The cases, drawn round where the board sits (board coordinates, as pieces.ts). `covered`: a hat sits on it, so what only shows from above is left out.
import { type Box, box, cyl, disc, loft, rbox, ring, roundedSquare, slab, tube, type Vec3 } from "../kit.ts";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { at, span, T } from "./pieces.ts";

const D = 56;
const W = 85;
const p = at(D);

/** The outline of a case with cut corners, seen from above. */
function cutCorners(w: number, d: number, c: number, inset = 0): [number, number][] {
  const x = w / 2 - inset;
  const z = d / 2 - inset;
  return [
    [-x + c, -z],
    [x - c, -z],
    [x, -z + c],
    [x, z - c],
    [x - c, z],
    [-x + c, z],
    [-x, z - c],
    [-x, -z + c],
  ];
}

/** A faceted case: 107 by 96 by 28 mm, a grey metal base with its corners cut, a darker faceted lid, every socket on the one back wall with a row of slots above them. The back
 * wall faces the viewer here. */
export function argon(m: Box) {
  const CW = 107;
  const CD = 96;
  const H = 28;
  const base = 14;
  const c = 9;
  const F = CD / 2;
  m.add("alu-dark", loft(cutCorners(CW, CD, c), cutCorners(CW, CD, c), 0, base));
  // the dark band with its slots along the wall
  m.add("plastic-black", loft(cutCorners(CW - 0.8, CD - 0.8, c), cutCorners(CW - 0.8, CD - 0.8, c), base, base + 5));
  for (let i = 0; i < 34; i++) m.add("hole", box(1.4, 3.8, 0.5), [-(CW - 2 * c - 8) / 2 + (i * (CW - 2 * c - 8)) / 33, base + 2.6, F - 0.34]);
  // the lid: faceted down to the walls, a line across it where the two parts meet
  m.add("case-matte", loft(cutCorners(CW - 0.4, CD - 0.4, c), cutCorners(CW - 22, CD - 22, c - 2), base + 5, H));
  m.add("hole", box(CW - 22, 0.05, 0.5), [0, H + 0.03, -6]);
  m.printFace("lid", [0, H + 0.05, 14], [-90, 0, 0], 60, 12);
  // the slots on the right-hand slope
  for (let i = 0; i < 7; i++) m.add("hole", box(5.2, 0.05, 1.5), [CW / 2 - 6.2, H - 5.4, -CD / 2 + 20 + i * 3.6], [0, 0, -33]);
  // the sockets, left to right: the power key and full HDMI above, USB-C, the micro USB and the sound jack below, then the openings for USB and network
  const y0 = 8;
  m.add("plastic-black", rbox(13, 4.6, 1, 2, 2), [-42, 16, F - 0.15]);
  m.add("hole", rbox(14.6, 5.4, 1, 0.8, 2), [-23, 16, F - 0.15]);
  m.add("steel", rbox(15.4, 6.2, 0.6, 1, 2), [-23, 16, F - 0.35]);
  m.add("hole", rbox(14, 4.6, 1, 0.8, 2), [-23, 16, F - 0.05]);
  m.add("hole", rbox(8.8, 3, 1, 1.2, 2), [-40, y0 - 2, F - 0.2]);
  m.add("hole", rbox(8.8, 3, 1, 1.2, 2), [-26, y0 - 2, F - 0.2]);
  m.add("plastic-black", cyl(3.4, 1.4, 18), [-13, y0 - 2, F - 0.1], [90, 0, 0]);
  m.add("hole", disc(1.8, 14), [-13, y0 - 2, F + 0.62]);
  for (const x of [5, 25, 45]) {
    m.add("hole", box(16.6, 11, 0.6), [x, 7, F - 0.2]);
    m.add("plastic-black", box(14, 8, 0.2), [x, 7, F + 0.06]);
  }
  m.add("rubber", cyl(4, 1, 14), [-38, -0.4, -30]);
  m.add("rubber", cyl(4, 1, 14), [38, -0.4, -30]);
  m.add("rubber", cyl(4, 1, 14), [-38, -0.4, 30]);
  m.add("rubber", cyl(4, 1, 14), [38, -0.4, 30]);
}

/** A finned case: a black plate under the board and a black finned aluminium shell over it, open where the sockets are. Bare, two fans sink in the fins with their wires over to
 * the header; `covered`, the fins run whole under whatever sits on it. */
export function armor(m: Box, covered: boolean) {
  m.add("case-black", slab(roundedSquare(W + 4, D + 4, 4, 6), 3, 0.6, { curve: 6, bevelSeg: 2 }), p(W / 2 + 1, -3.4, D / 2));
  const top = 13.2;
  const x0 = -1.6;
  const x1 = 65;
  span(m, "case-black", D, [x0, x1], [top - 1.6, top], [-1.4, D + 1.4]);
  const fans = covered
    ? []
    : [
        [15.5, 31],
        [47.5, 31],
      ];
  const r = 13.6;
  // the fins, the length of the case, each one broken where a fan sits
  for (let z = 0; z <= D; z += 3.6) {
    let from = x0;
    const breaks = fans.flatMap(([fx, fz]) => {
      const dz = Math.abs(z - fz);
      if (dz > r + 0.8) return [];
      const half = Math.sqrt(Math.max(0, (r + 0.8) ** 2 - dz ** 2));
      return [[fx - half, fx + half]];
    });
    for (const [a, b] of [...breaks, [x1, x1]]) {
      if (a > from) span(m, "case-black", D, [from, a], [top, top + 3], [z - 0.8, z + 0.8]);
      from = b;
    }
  }
  // the walls: solid at the card end and the far end and along the header side; along the video side, posts between the sockets
  span(m, "case-black", D, [x0, x0 + 2], [T, top], [-1.4, D + 1.4]);
  span(m, "case-black", D, [x1 - 2, x1], [T, top], [-1.4, D + 1.4]);
  span(m, "case-black", D, [x0, x1], [T, top], [D - 0.6, D + 1.4]);
  span(m, "case-black", D, [x0, x1], [7.6, top], [-1.4, 0.6]);
  let from = x0;
  for (const [g0, g1] of [
    [5.4, 17],
    [21.2, 30.8],
    [34.7, 44.3],
    [49, 58],
    [x1, x1],
  ]) {
    if (g0 > from) span(m, "case-black", D, [from, g0], [T, 7.6], [-1.4, 0.6]);
    from = g1;
  }
  // grooves round the outside, where the fins wrap
  for (const y of [9.6, 11.4]) {
    span(m, "hole", D, [x0 + 2, x1 - 2], [y, y + 0.5], [-1.5, -1.4]);
    if (covered) span(m, "hole", D, [x0 + 2, x1 - 2], [y, y + 0.5], [D + 1.4, D + 1.5]);
  }
  if (covered) return;
  // the fans and their screws
  fans.forEach(([fx, fz], i) => {
    m.add("hole", disc(r - 0.6, 40), p(fx, top + 0.03, fz), [-90, 0, 0]);
    m.add("plastic-black", ring(r - 1.2, r + 0.6, 40), p(fx, top + 1.4, fz), [-90, 0, 0]);
    const node = m.node(`spin-y-${i}`, p(fx, top + 1, fz));
    m.add("plastic-char", cyl(4.6, 1.2, 22), [0, 0, 0], [0, 0, 0], { node });
    for (let b = 0; b < 7; b++) {
      const a = (b * 360) / 7;
      const rad = (a * Math.PI) / 180;
      m.add("plastic-char", box(8, 0.4, 4), [Math.cos(rad) * 8.6, 0, -Math.sin(rad) * 8.6], [22, a, 0], { node });
    }
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      m.add("steel", cyl(1.3, 0.5, 10), p(fx + dx * 10.8, top + 1.7, fz + dz * 10.8));
  });
  // the wires, red and black, up from the fans and over to the header
  const wire = (material: "wire-red" | "wire-black", shift: number) =>
    m.add(material, tube([p(47.5, top + 2, 45 + shift), p(37, top + 9, 49 + shift), p(22, top + 10, 49 + shift), p(10, top + 6, 54 + shift), p(4, top + 1, D + 2)] as Vec3[], 0.55));
  wire("wire-red", 0);
  wire("wire-black", 1.3);
}

const CASE = { foot: [82, 46, 7], lid: [72, 37, 7.5], footH: 2.4, seam: 0.45, lidH: 10.5, dome: 1.6 };

/** The lid: a rounded slab whose top rises gently towards the middle of its width. */
function lidShape() {
  const [w, d, r] = CASE.lid;
  const edge = 3.6;
  const g = slab(roundedSquare(w, d, r, 10), CASE.lidH, edge, { curve: 10, bevelSeg: 5 });
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y <= CASE.lidH - edge) continue;
    const t = Math.min(1, ((y - (CASE.lidH - edge)) / edge) * 1.4);
    const z = pos.getZ(i) / (d / 2);
    const x = pos.getX(i) / (w / 2);
    pos.setY(i, y + CASE.dome * t * Math.max(0, 1 - z * z) * (1 - 0.25 * x * x));
  }
  g.deleteAttribute("normal");
  return toCreasedNormals(g, (35 * Math.PI) / 180);
}

/** A notch in the lid's front wall with the socket's metal face in it. */
function notch(m: Box, x: number, face: number, [w, h]: number[], [mw, mh]: number[]) {
  const y0 = CASE.footH + CASE.seam;
  m.add("hole", rbox(w + 2.6, 5.4, 1.2, 0.8, 2), [x, y0 + 2.7, face - 0.35]);
  m.add("steel", rbox(w, h, 0.6, Math.min(0.6, h / 2 - 0.05), 2), [x, y0 + 2.6, face + 0.55]);
  m.add("hole", rbox(mw, mh, 0.4, Math.min(0.5, mh / 2 - 0.05), 2), [x, y0 + 2.6, face + 0.8]);
}

/** The small domed case: a matte black base with a wide flat foot round it, the lid on top with rounded ends and a softly domed top, notches along one long side for the mini HDMI
 * and the two micro USB sockets, the card's slot at one end, and a sliver of green board at the seam. The board inside is not drawn: nothing of it shows but its sockets. */
export function unipi(m: Box) {
  const cx = 32.5;
  const [fw, fd, fr] = CASE.foot;
  const [lw, ld] = CASE.lid;
  m.add("case-matte", slab(roundedSquare(fw, fd, fr, 8), CASE.footH, 0.6, { curve: 8, bevelSeg: 2 }), [cx, 0, 0]);
  m.add("pcb-green", slab(roundedSquare(lw - 1.6, ld - 1.6, CASE.lid[2] - 0.8, 8), CASE.seam, 0, { curve: 8 }), [cx, CASE.footH, 0]);
  m.add("case-matte", lidShape(), [cx, CASE.footH + CASE.seam, 0]);
  const face = ld / 2;
  notch(m, 12.4, face, [11.2, 3.2], [10, 2.2]);
  notch(m, 41.4, face, [8, 3], [6.8, 1.9]);
  notch(m, 54, face, [8, 3], [6.8, 1.9]);
  // the card's slot at the left-hand end, a small opening at the other
  m.add("hole", rbox(1, 1.8, 13, 0.6, 2), [cx - lw / 2 - 0.2, CASE.footH + CASE.seam + 1.4, 0]);
  m.add("hole", rbox(1, 2, 7, 0.6, 2), [cx + lw / 2 + 0.2, CASE.footH + CASE.seam + 1.6, -4]);
  m.printFace("lid", [cx, CASE.footH + CASE.seam + CASE.lidH + CASE.dome + 0.05, 0], [-90, 0, 0], 40, 8);
}

/** A plain plate under any board, on four standoffs through its screw holes. */
export function plate(m: Box, w: number, d: number, holes: readonly (readonly [number, number])[]) {
  const q = at(d);
  m.add("plastic-char", slab(roundedSquare(w + 4, d + 4, 3, 6), 2, 0.4, { curve: 6, bevelSeg: 1 }), [w / 2, -6, 0]);
  for (const [hx, hz] of holes) {
    m.add("steel", cyl(1.6, 4, 12), q(hx, -2, hz));
    m.add("steel", cyl(2.4, 0.8, 14), q(hx, T + 0.4, hz));
  }
  for (const [x, z] of [
    [-w / 2 + 6, -d / 2 + 6],
    [w / 2 - 6, -d / 2 + 6],
    [-w / 2 + 6, d / 2 - 6],
    [w / 2 - 6, d / 2 - 6],
  ])
    m.add("rubber", cyl(3, 0.6, 12), [w / 2 + x, -6.2, z]);
}
