// The small pictures on the drawn screens: the hero and tiles of a desktop, the card and tiles of a phone.
import type { Vec3 } from "../build/kit.ts";
import { AMBER, type PictureAt } from "./common.ts";
import type { Drawing, ShapeStyle } from "./drawing.ts";

type PictureBox = (u0: number, v0: number, u1: number, v1: number, fill: string) => void;
const boxes = (d: Drawing, at: PictureAt, normal: Vec3, layer: number): PictureBox => {
  let order = 0;
  return (u0, v0, u1, v1, fill) => {
    const style: ShapeStyle = { fill };
    d.flat([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)], normal, style, layer + order++ * 0.01);
  };
};

/** A hero and three tiles in brighter colours, for a style with big pictures. */
function bigPicture(d: Drawing, at: PictureAt, normal: Vec3, layer: number) {
  const box = boxes(d, at, normal, layer);
  box(0, 0, 1, 1, "url(#glass)");
  box(0.08, 0.14, 0.92, 0.55, "#2f6ea8");
  ["#a13e6f", "#3f9a73", "#b98a35"].forEach((tint, i) => box(0.08 + i * 0.29, 0.66, 0.34 + i * 0.29, 0.88, tint));
  return d;
}

/** The small desktop picture. `at(u, v)` gives the point of the screen at u across and v down (0 to 1); `normal` is the way the screen looks. */
export function homePicture(d: Drawing, at: PictureAt, normal: Vec3, layer = 5) {
  if (d.style.pictures === "big") return bigPicture(d, at, normal, layer);
  const box = boxes(d, at, normal, layer);
  box(0, 0, 1, 1, "url(#glass)");
  box(0, 0, 0.07, 1, "#0e1522");
  box(0.11, 0.1, 0.77, 0.55, "#182131");
  box(0.11, 0.1, 0.36, 0.55, "#1d3550");
  box(0.79, 0.1, 1, 0.55, "#2a4a7a");
  ["#2a4a7a", "#5a2a4a", "#2a5a4a", "#5a4a2a", "#3a2a6a"].forEach((tint, i) => box(0.11 + i * 0.17, 0.68, 0.26 + i * 0.17, 0.85, tint));
  d.flat([at(0.02, 0.05), at(0.05, 0.05), at(0.05, 0.1), at(0.02, 0.1)], normal, { fill: AMBER }, layer + 0.5);
  return d;
}

/** The phone's picture: its name line, the card, four tiles. */
export function phonePicture(d: Drawing, at: PictureAt, normal: Vec3, layer = 4) {
  const box = boxes(d, at, normal, layer);
  if (d.style.pictures === "big") {
    box(0, 0, 1, 1, "url(#glass)");
    box(0.1, 0.1, 0.9, 0.42, "#2f6ea8");
    box(0.1, 0.48, 0.9, 0.66, "#a13e6f");
    box(0.1, 0.72, 0.9, 0.9, "#3f9a73");
    return d;
  }
  box(0, 0, 1, 1, "url(#glass)");
  box(0.08, 0.1, 0.55, 0.14, "#6cd0ff");
  box(0.08, 0.17, 0.75, 0.21, "#eef2f8");
  box(0.07, 0.25, 0.93, 0.47, "#1d3550");
  ["#2a4a7a", "#5a2a4a", "#2a5a4a", "#5a4a2a"].forEach((tint, i) =>
    box(0.07 + (i % 2) * 0.45, 0.52 + Math.floor(i / 2) * 0.17, 0.48 + (i % 2) * 0.45, 0.67 + Math.floor(i / 2) * 0.17, tint),
  );
  return d;
}
