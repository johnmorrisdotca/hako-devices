// The drawing of a phone or tablet that is a row of numbers: what shows on its front, from the same row as its mesh.
import * as THREE from "three";
import type { Box, Vec3 } from "../build/kit.ts";
import { placer, type SlabBody } from "../build/slab-body.ts";
import type { Drawing } from "./drawing.ts";
import { homePicture, phonePicture } from "./pictures.ts";
import { slabOnStand } from "./tablets.ts";

/** The colour of the shell's edge in a drawing, by its material. */
const EDGE_COLOUR: Readonly<Record<string, string>> = { alu: "#5d6b80", "shell-silver": "#5d6b80", "shell-white": "#6b7688", "plastic-white": "#6b7688" };

export function drawSlabBody(d: Drawing, model: Box, body: SlabBody) {
  const portrait = !body.landscape;
  slabOnStand(d, model, { shell: EDGE_COLOUR[body.shell] ?? "#3e5f8a", picture: portrait ? phonePicture : homePicture });
  const { w, h, frame } = model.slabFacts as NonNullable<Box["slabFacts"]>;
  const [W, H] = portrait ? [w, h] : [h, w];
  const out: Vec3 = new THREE.Vector3(0, 0, 1).transformDirection(frame).toArray();
  const at = placer(body, W, H);
  const lift = (x: number, y: number): Vec3 => new THREE.Vector3(x, y, 0.3).applyMatrix4(frame).toArray();
  const pill = (cu: number, cv: number, pw: number, ph: number, r: number, layer: number) => {
    const [cx, cy] = at(cu, cv);
    const [a, b] = portrait ? [pw, ph] : [ph, pw];
    const pts: Vec3[] = [];
    const round = Math.min(r, a / 2, b / 2);
    for (const [sx, sy, a0] of [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]] as const)
      for (let k = 0; k <= 3; k++) {
        const angle = ((a0 + 30 * k) * Math.PI) / 180;
        pts.push(lift(cx + sx * (a / 2 - round) + round * Math.cos(angle), cy + sy * (b / 2 - round) + round * Math.sin(angle)));
      }
    d.flat(pts, out, { fill: "#05080e", stroke: "#8fa1b8", sw: 0.6 }, layer);
  };
  const { home, notch, island, receiver } = body.front;
  if (home) pill(W / 2, home[0], home[1] * 2, home[1] * 2, home[1], 5);
  if (notch) pill(W / 2, body.screen[2] + notch[1] / 2 - 1, notch[0], notch[1] + 2, notch[2], 5);
  if (island) pill(W / 2, island[2], island[0], island[1], island[1] / 2, 5);
  if (receiver) pill(W / 2, receiver[2], receiver[0], receiver[1], receiver[1] / 2, 5);
  return d;
}
