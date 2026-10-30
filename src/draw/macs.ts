// The drawings of the desktops and laptops (macs.ts, laptops.ts). A plain lid: no mark.
import * as THREE from "three";
import type { Box, Vec3 } from "../build/kit.ts";
import { AMBER, HOLE, METAL } from "./common.ts";
import { type Drawing, NZ, type ShapeStyle, type SolidStyle, X, Y, Z } from "./drawing.ts";
import { homePicture } from "./pictures.ts";

/** Mac Studio and Mac mini: the rounded block on its round foot, the ports and light in front. */
function mac(d: Drawing, { w, h, r, foot, footR, ports, light }: { w: number; h: number; r: number; foot: number; footR: number; ports: number[][]; light: number[] }) {
  d.cylinder(0, 0, footR, 0, foot, { front: "#0b111c", side: "#0b111c", sw: 1.4 }, 32);
  d.rounded(0, 0, w, w, r, foot, h, { layer: 1 }, 6);
  for (const [x, y, pw, ph] of ports) d.rect([x, y, w / 2 + 0.2], X, Y, pw, ph, HOLE, 2, Math.min(pw, ph) / 2);
  d.light([light[0], light[1], w / 2 + 0.2], "#f4f7ff", 1.4, 3, Z);
  return d;
}

export function macStudio(d: Drawing) {
  return mac(d, {
    w: 197,
    h: 95,
    r: 31,
    foot: 7.5,
    footR: 86,
    ports: [
      [-61, 27, 8.6, 3.1],
      [-50, 27, 8.6, 3.1],
      [-33, 27, 24, 2.4],
    ],
    light: [62, 27],
  });
}

export function macMini(d: Drawing) {
  return mac(d, {
    w: 127,
    h: 50,
    r: 22,
    foot: 5,
    footR: 54,
    ports: [
      [-42, 16, 8.6, 3.1],
      [-32, 16, 8.6, 3.1],
      [-22, 16, 3.8, 3.8],
    ],
    light: [44, 16],
  });
}

/** The laptop, its lid open and a picture on its screen. */
export function macbook(d: Drawing, model: Box) {
  const D = 215;
  d.rounded(0, 0, 304, D, 14, 0, 11.3, {}, 4);
  d.rect([0, 11.4, -D / 2 + 82], X, NZ, 282, 118, { fill: "#0c1320", stroke: "#8fa1b8", sw: 0.8 }, 1, 3);
  for (let row = 0; row < 5; row++)
    d.line(
      [
        [-130, 11.5, -D / 2 + 49 + row * 19],
        [130, 11.5, -D / 2 + 49 + row * 19],
      ],
      { stroke: "#8fa1b8", sw: 0.5, opacity: 0.4 },
      2,
    );
  d.rect([0, 11.4, D / 2 - 52], X, NZ, 135, 85, { stroke: "#8fa1b8", sw: 1 }, 1, 6);
  // the lid, from the same hinge and angle as the 3D one
  const frame = model.lidFrame as THREE.Matrix4;
  const lid = (x: number, y: number, z: number): Vec3 => new THREE.Vector3(x, y, z).applyMatrix4(frame).toArray();
  const L = D - 4;
  const corners = [
    [-152, 0, 0],
    [152, 0, 0],
    [152, 0, L],
    [-152, 0, L],
  ];
  d.flat(
    corners.map(([x, , z]) => lid(x, 4.6, z)),
    [0, 0, -1],
    { fill: "url(#top)", stroke: "#8fa1b8", sw: 2 },
    3,
  );
  d.flat(
    corners.map(([x, , z]) => lid(x, 0, z)),
    [0, 0.3, 1],
    { fill: "#0b111c", stroke: "#8fa1b8", sw: 2 },
    3,
  );
  const screen = [
    [-142, -0.6, 10],
    [142, -0.6, 10],
    [142, -0.6, L - 10],
    [-142, -0.6, L - 10],
  ].map(([x, y, z]) => lid(x, y, z));
  d.flat(screen, [0, 0.3, 1], { fill: "url(#glass)", stroke: "#8fa1b8", sw: 1 }, 4);
  const at = (u: number, v: number) => lid(-142 + 284 * u, -0.7, 10 + (L - 20) * (1 - v));
  const box = (u0: number, v0: number, u1: number, v1: number, style: ShapeStyle) => d.flat([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)], [0, 0.3, 1], style, 5);
  box(0.12, 0.12, 0.92, 0.55, { fill: "#182131" });
  box(0.12, 0.12, 0.42, 0.55, { fill: "#1d3550" });
  for (let i = 0; i < 5; i++)
    box(0.12 + i * 0.165, 0.68, 0.26 + i * 0.165, 0.85, { fill: ["#2a4a7a", "#5a2a4a", "#2a5a4a", "#5a4a2a", "#3a2a6a"][i] });
  d.light(at(0.04, 0.08), AMBER, 1.6, 6);
  return d;
}


export const macMiniFlat = (d: Drawing) => {
  const w = 197;
  const h = 36;
  d.cylinder(0, 0, 84, 0, 2, { front: "#0b111c", side: "#0b111c", sw: 1.2 }, 32);
  d.rounded(0, 0, w, w, 28, 2, h, { layer: 1 }, 6);
  d.light([86, 14, w / 2 + 0.2], "#f4f7ff", 1.4, 3, Z);
  return d;
};

export const macPro = (d: Drawing) => {
  const W = 218;
  const L = 450;
  const foot = 26;
  const top = 500;
  const F = L / 2;
  for (const [x, z] of [
    [-W / 2 + 34, -F + 50],
    [W / 2 - 34, -F + 50],
    [-W / 2 + 34, F - 50],
    [W / 2 - 34, F - 50],
  ])
    d.cylinder(x, z, 19, 0, foot, { ...METAL, layer: 0 }, 12);
  d.rounded(0, 0, W, L, 18, foot, top, { layer: 1, top: "url(#top)", front: "#0c1320", side: "url(#metal)" }, 4);
  // the lattice: rows of holes, staggered
  const dots: [Vec3, Vec3][] = [];
  for (let r = 0; r < 30; r++) {
    const y = foot + 12 + r * 15.4;
    dots.push([
      [-W / 2 + 14 + (r % 2 ? 9 : 0), y, F + 0.2],
      [W / 2 - 12, y, F + 0.2],
    ]);
  }
  // round dots: a dash of nothing, its round caps left
  d.lines(dots, { stroke: "#05080e", sw: 3.4, dash: "0 5.6" }, 2, Z);
  // the handles
  for (const z of [-F + 70, F - 70]) {
    d.line(
      [
        [-W / 2 + 22, top, z],
        [-W / 2 + 22, top + 20, z],
        [-W / 2 + 36, top + 29, z],
        [W / 2 - 36, top + 29, z],
        [W / 2 - 22, top + 20, z],
        [W / 2 - 22, top, z],
      ],
      { stroke: "#8fa1b8", sw: 5 },
      3,
    );
    d.line(
      [
        [-W / 2 + 22, top, z],
        [-W / 2 + 22, top + 20, z],
        [-W / 2 + 36, top + 29, z],
        [W / 2 - 36, top + 29, z],
        [W / 2 - 22, top + 20, z],
        [W / 2 - 22, top, z],
      ],
      { stroke: "#1b2433", sw: 2.4 },
      3.1,
    );
  }
  return d;
};

export const iMac24 = (d: Drawing, model: Box) => {
  const frame = model.panelFrame as THREE.Matrix4;
  const { W, H: PH, chin, T } = model.panelSize as NonNullable<Box["panelSize"]>;
  const pt = (x: number, y: number, z: number): Vec3 => new THREE.Vector3(x, y, z).applyMatrix4(frame).toArray();
  const out: Vec3 = new THREE.Vector3(0, 0, 1).transformDirection(frame).toArray();
  const blue = "#2c5a8e";
  // the foot and the arm
  d.box(-65, 65, 0, 4, -73.5, 73.5, { top: blue, front: "#1f4066", side: "#1a3554", sw: 1.4, layer: 0 });
  d.flat(
    [
      [-65, 2, -56],
      [65, 2, -56],
      [65, 182, -18],
      [-65, 182, -18],
    ],
    [0, 0.3, 1],
    { fill: "#1f4066", stroke: "#8fa1b8", sw: 1.2 },
    0.5,
  );
  d.placed(frame, [-W / 2, W / 2], [0, PH], [-T, 0], { fills: { front: "#c9ced6", top: blue, side: "#1f4066" }, sw: 2, layer: 1 });
  d.flat(
    [pt(-W / 2, 0, 0.1), pt(W / 2, 0, 0.1), pt(W / 2, chin, 0.1), pt(-W / 2, chin, 0.1)],
    out,
    { fill: blue, stroke: "#8fa1b8", sw: 1.4 },
    2,
  );
  const sy0 = chin + 13;
  const sw = 260.5;
  homePicture(d, (u, v) => pt(-sw + u * 2 * sw, sy0 + 293 - v * 293, 0.15), out, 3);
  return d;
};

export function macbookNotch(d: Drawing, model: Box, { w, dz, h, shell, keysFill, pad }: { w: number; dz: number; h: number; shell: SolidStyle; keysFill: string; pad: [number, number] }) {
  const frame = model.lidFrame as THREE.Matrix4;
  const L = model.lidLength as number;
  const { w: sw, h: sh, z: sz } = model.lidScreen as NonNullable<Box["lidScreen"]>;
  const pt = (x: number, y: number, z: number): Vec3 => new THREE.Vector3(x, y, z).applyMatrix4(frame).toArray();
  const inward: Vec3 = new THREE.Vector3(0, -1, 0).transformDirection(frame).toArray();
  d.rounded(0, 0, w, dz, 13, 0, h, shell, 4);
  const kz = -dz / 2 + 74;
  d.rect([0, h + 0.1, kz], X, [0, 0, -1], w * 0.86, 116, { fill: keysFill, stroke: "#8fa1b8", sw: 0.8 }, 1, 3);
  const rows: [Vec3, Vec3][] = [];
  for (let r = 0; r < 5; r++)
    rows.push([
      [-w * 0.42, h + 0.2, kz - 40 + r * 19],
      [w * 0.42, h + 0.2, kz - 40 + r * 19],
    ]);
  for (let c = 1; c < 14; c++) {
    const x = -w * 0.42 + (c * w * 0.84) / 14;
    rows.push([
      [x, h + 0.2, kz - 52],
      [x, h + 0.2, kz + 52],
    ]);
  }
  d.lines(rows, { stroke: "#8fa1b8", sw: 0.5, opacity: 0.5 }, 2);
  d.rect([0, h + 0.1, dz / 2 - pad[1] / 2 - 8], X, [0, 0, -1], pad[0], pad[1], { stroke: "#8fa1b8", sw: 1 }, 1, 6);
  // the lid: its back, its edge, then the screen on its inside
  d.placed(frame, [-w / 2, w / 2], [-0.5, 5], [0, L], { fills: { bottom: "#0b111c", top: "url(#top)", side: "#1b2433" }, sw: 2, layer: 3 });
  const y = -0.7;
  const corners = [pt(-sw / 2, y, sz - sh / 2), pt(sw / 2, y, sz - sh / 2), pt(sw / 2, y, sz + sh / 2), pt(-sw / 2, y, sz + sh / 2)];
  d.flat(corners, inward, { fill: "url(#glass)", stroke: "#8fa1b8", sw: 0.8 }, 4);
  homePicture(d, (u, v) => pt(-sw / 2 + u * sw, y - 0.1, sz + sh / 2 - v * sh), inward, 5);
  // the notch
  const n = [pt(-14, y - 0.2, L - 2), pt(14, y - 0.2, L - 2), pt(14, y - 0.2, L - 8.4), pt(-14, y - 0.2, L - 8.4)];
  d.flat(n, inward, { fill: "#05080e", stroke: "#8fa1b8", sw: 0.5 }, 6);
  return d;
}

export const macbookAir13 = (d: Drawing, model: Box) =>
  macbookNotch(d, model, {
    w: 304.1,
    dz: 215,
    h: 11.3,
    shell: { top: "#1b2433", front: "#141c2a", side: "#0f1622" },
    keysFill: "#0c1320",
    pad: [134, 82],
  });
export const macbookPro14 = (d: Drawing, model: Box) =>
  macbookNotch(d, model, {
    w: 312.6,
    dz: 221.2,
    h: 15.5,
    shell: { top: "#141c2a", front: "#111a2a", side: "#0b111c" },
    keysFill: "#05080e",
    pad: [148, 92],
  });
export const macbookPro16 = (d: Drawing, model: Box) =>
  macbookNotch(d, model, {
    w: 355.7,
    dz: 248.1,
    h: 16.8,
    shell: { top: "url(#top)", front: "url(#metal)", side: "#1b2433" },
    keysFill: "#05080e",
    pad: [168, 92],
  });
