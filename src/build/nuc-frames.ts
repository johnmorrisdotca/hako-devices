// Where a face of a body lies: its mesh and its drawing place their sockets by the same frames.
import * as THREE from "three";
import { moved } from "./kit.ts";
import type { FaceId } from "./nuc-bodies.ts";

const deg = (d: number) => (d * Math.PI) / 180;

/** The frame of one face: local x across it as you look at it, y up, z out of it, the surface at z = 0. The top's y runs away from the viewer. */
export function faceFrame(face: FaceId, W: number, D: number, H: number, y0 = 0): THREE.Matrix4 {
  if (face === "front") return moved(0, y0, D / 2);
  if (face === "back") return moved(0, y0, -D / 2).multiply(new THREE.Matrix4().makeRotationY(deg(180)));
  if (face === "left") return moved(-W / 2, y0, 0).multiply(new THREE.Matrix4().makeRotationY(deg(-90)));
  if (face === "right") return moved(W / 2, y0, 0).multiply(new THREE.Matrix4().makeRotationY(deg(90)));
  return moved(0, H, 0).multiply(new THREE.Matrix4().makeRotationX(deg(-90)));
}
