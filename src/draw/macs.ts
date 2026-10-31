// The drawings of the laptops (macs.ts, laptops.ts). A plain lid: no mark.
import * as THREE from "three";
import type { Box, Vec3 } from "../build/kit.ts";
import { AMBER } from "./common.ts";
import { type Drawing, NZ, type ShapeStyle, type SolidStyle, X } from "./drawing.ts";
import { homePicture } from "./pictures.ts";

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


export function macbookNotch(d: Drawing, model: Box, { w, dz, h, shell, keysFill, pad, notch = true }: { notch?: boolean; w: number; dz: number; h: number; shell: SolidStyle; keysFill: string; pad: [number, number] }) {
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
  if (notch) d.flat(n, inward, { fill: "#05080e", stroke: "#8fa1b8", sw: 0.5 }, 6);
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

const SILVER = { top: "url(#top)", front: "url(#metal)", side: "#1b2433" };
const GRAPHITE = { top: "#141c2a", front: "#111a2a", side: "#0b111c" };
export const macbookAir13Silver = (d: Drawing, model: Box) => macbookNotch(d, model, { w: 304.1, dz: 215, h: 11.3, shell: SILVER, keysFill: "#0c1320", pad: [134, 82] });
export const macbookPro14Silver = (d: Drawing, model: Box) => macbookNotch(d, model, { w: 312.6, dz: 221.2, h: 15.5, shell: SILVER, keysFill: "#05080e", pad: [148, 92] });
export const macbookPro16Black = (d: Drawing, model: Box) => macbookNotch(d, model, { w: 355.7, dz: 248.1, h: 16.8, shell: GRAPHITE, keysFill: "#05080e", pad: [168, 92] });
export const macbookPro17 = (d: Drawing, model: Box) => macbookNotch(d, model, { w: 392, dz: 265, h: 25.9, shell: SILVER, keysFill: "#05080e", pad: [180, 100], notch: false });
