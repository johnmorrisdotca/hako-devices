// The drawings of the tablets and phones (tablets.ts): the same style as the rest. No marks.
import * as THREE from "three";
import type { Box, Vec3 } from "../build/kit.ts";
import { homeButtonX } from "../build/tablets.ts";
import type { Drawing } from "./drawing.ts";
import { homePicture, phonePicture } from "./pictures.ts";

/** The points of a rounded rectangle in a slab's own coordinates (x across, y up), at z, placed by the frame. */
export function roundedOn(frame: THREE.Matrix4, w: number, h: number, r: number, z: number, y0 = 0): Vec3[] {
  const pts: Vec3[] = [];
  const corners = [
    [w / 2 - r, y0 + h - r, 0],
    [-w / 2 + r, y0 + h - r, 90],
    [-w / 2 + r, y0 + r, 180],
    [w / 2 - r, y0 + r, 270],
  ];
  for (const [cx, cy, a0] of corners)
    for (let k = 0; k <= 3; k++) {
      const a = ((a0 + 30 * k) * Math.PI) / 180;
      pts.push(new THREE.Vector3(cx + r * Math.cos(a), cy + r * Math.sin(a), z).applyMatrix4(frame).toArray());
    }
  return pts;
}

/** A slab on its stand with its picture. `picture(d, at, out, layer)` draws on the screen. */
export function slabOnStand(d: Drawing, model: Box, { shell = "#232e40", sw = 2, picture = homePicture, standSw = 1.2, edge = "#8fa1b8" }: { shell?: string; sw?: number; picture?: typeof homePicture; standSw?: number; edge?: string } = {}) {
  const { w, h, t, r, screen, frame, foot, stand: onStand, screenAt = [0, h / 2] } = model.slabFacts as NonNullable<Box["slabFacts"]>;
  const out: Vec3 = new THREE.Vector3(0, 0, 1).transformDirection(frame).toArray();
  const stand = Math.min(w * 0.46, 120);
  if (onStand) {
    d.box(-stand / 2, stand / 2, 0, 4.4, -45, 13, { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: standSw, layer: 0 });
    d.box(-stand / 2, stand / 2, 0, foot + 5, 9, 13, { top: "#232e40", front: "url(#metal)", side: "#1b2433", sw: standSw, layer: 3 });
  }
  // the edge first, the glass over it
  d.flat(roundedOn(frame, w, h, r, -t), out, { fill: shell, stroke: "#8fa1b8", sw }, 1);
  d.flat(roundedOn(frame, w, h, r, 0), out, { fill: "#0b111c", stroke: edge, sw }, 2);
  const [sx, sy] = screen;
  const at = (u: number, v: number): Vec3 => new THREE.Vector3(screenAt[0] - sx / 2 + u * sx, screenAt[1] + sy / 2 - v * sy, 0.2).applyMatrix4(frame).toArray();
  picture(d, at, out, 4);
  return d;
}

const metalShell = { shell: "url(#metal)" };
export const ipadMini = (d: Drawing, model: Box) => slabOnStand(d, model, { shell: "#6d6657" });
export const ipadPlain = (d: Drawing, model: Box) => slabOnStand(d, model, { shell: "#3e5f8a" });
export const ipadAir = (d: Drawing, model: Box) => slabOnStand(d, model, { shell: "#5e5583" });
export const ipadPro11 = (d: Drawing, model: Box) => slabOnStand(d, model, { shell: "#141c2a" });
export const ipadPro13 = (d: Drawing, model: Box) => slabOnStand(d, model, metalShell);

/** An older iPad Pro: the wide border and the round home button beside the picture. */
export const ipadProHome = (d: Drawing, model: Box) => {
  slabOnStand(d, model, { shell: "#141c2a" });
  const { w, h, screen, frame } = model.slabFacts as NonNullable<Box["slabFacts"]>;
  const out: Vec3 = new THREE.Vector3(0, 0, 1).transformDirection(frame).toArray();
  const x = homeButtonX(w, screen[0]);
  const ring: Vec3[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    ring.push(new THREE.Vector3(x + 5.5 * Math.cos(a), h / 2 + 5.5 * Math.sin(a), 0.2).applyMatrix4(frame).toArray());
  }
  d.flat(ring, out, { fill: "#05080e", stroke: "#8fa1b8", sw: 1 }, 5);
  return d;
};

export const iphone = (d: Drawing, model: Box) => {
  slabOnStand(d, model, { shell: "#3e5f8a", picture: phonePicture });
  const { h, frame } = model.slabFacts as NonNullable<Box["slabFacts"]>;
  const out: Vec3 = new THREE.Vector3(0, 0, 1).transformDirection(frame).toArray();
  const p = (x: number, y: number): Vec3 => new THREE.Vector3(x, y, 0.3).applyMatrix4(frame).toArray();
  d.flat([p(-10, h - 5.5), p(10, h - 5.5), p(10, h - 11.5), p(-10, h - 11.5)], out, { fill: "#05080e" }, 5);
  return d;
};

