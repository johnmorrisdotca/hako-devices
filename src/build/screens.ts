// The lit faces of the devices with a screen: a node named screen-<kind>-<width>x<height>, its texture coordinates 0 to 1 across the face, so a caller's canvas fills it
// unstretched when it has those pixels. The viewer paints each kind's own picture on it (screen/picture.ts) until a caller paints their own.
import * as THREE from "three";
import { type Box, roundedSquare, type Vec3 } from "./kit.ts";

export type ScreenKind = "desktop" | "phone" | "paper" | "panel" | "oled";

/** A flat face `w` by `h` looking along +Z, corners of radius `radius`. Its top is +Y. */
export function pictureFace(w: number, h: number, radius = 0): THREE.BufferGeometry {
  const g = radius > 0 ? new THREE.ShapeGeometry(roundedSquare(w, h, radius, 6)) : new THREE.PlaneGeometry(w, h);
  const pos = g.getAttribute("position");
  const uv = g.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) uv.setXY(i, Math.min(1, Math.max(0, (pos.getX(i) + w / 2) / w)), Math.min(1, Math.max(0, (pos.getY(i) + h / 2) / h)));
  return g;
}

export interface LitOptions {
  radius?: number;
  kind?: ScreenKind;
  frame?: THREE.Matrix4;
  point?: Vec3;
  /** The face's pixels; left out: 1600 across for a desktop, 390 for a phone. */
  pixels?: readonly [number, number];
}

/** The node "screen-..." with a face on it. */
export function litScreen(m: Box, at: Vec3, turn: Vec3, w: number, h: number, { radius = 0, kind = "desktop", frame, point = [0, 0, 0], pixels }: LitOptions = {}): void {
  const across = kind === "phone" ? 390 : 1600;
  const [pw, ph] = pixels ?? [across, Math.round((across * h) / w)];
  const node = m.node(`screen-${kind}-${pw}x${ph}`, point, { uv: true });
  m.add("screen-face", pictureFace(w, h, radius), at, turn, { node, frame });
}
