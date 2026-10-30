// The builder: one description into one mesh and one drawing. Works in Node and in a browser; needs three.js.
import { deviceByKey } from "../catalogue.ts";
import { build, BASE_KEYS, buildPart, type Built, FitError, measure } from "./assemble.ts";

/** A catalogue device, built. */
export function buildDevice(key: string): Built {
  const entry = deviceByKey(key);
  if (!entry) throw new Error(`There is no built device "${key}".`);
  return build(entry.parts);
}

export { BASE_KEYS, build, buildPart, FitError, measure };
export type { Built };
export { Box, MATERIALS } from "./kit.ts";
export type { Material, MaterialSpec, PrintFace, Vec3 } from "./kit.ts";
export { toGlb } from "./glb.ts";
export type { Glb } from "./glb.ts";
export { Drawing } from "../draw/drawing.ts";
