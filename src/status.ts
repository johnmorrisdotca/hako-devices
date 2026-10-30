// Built or planned: the catalogue with the list beside it. A planned machine has a name and a family, and no shape. A real machine a built mesh covers is built, and draws that mesh.
import { DEVICES, deviceByKey, type Device } from "./catalogue.ts";
import { COVERED, type CoveredDevice, PLANNED, type PlannedDevice } from "./wishlist.ts";

export type CatalogueEntry = Device | CoveredDevice | PlannedDevice;

/** Every machine: the built ones, the real machines they cover, then those still to come. */
export const catalogue = (): readonly CatalogueEntry[] => [...DEVICES, ...COVERED, ...PLANNED];

/** "built", "planned", or null for a key on no list. */
export function statusOf(key: string): "built" | "planned" | null {
  if (deviceByKey(key) || COVERED.some((entry) => entry.key === key)) return "built";
  return PLANNED.some((entry) => entry.key === key) ? "planned" : null;
}

/** The catalogue key of the mesh that draws a machine, or null when none does yet. */
export function meshOf(key: string): string | null {
  if (deviceByKey(key)) return key;
  return COVERED.find((entry) => entry.key === key)?.mesh ?? null;
}

export function catalogueCounts(): { built: number; planned: number; total: number } {
  const built = DEVICES.length + COVERED.length;
  return { built, planned: PLANNED.length, total: built + PLANNED.length };
}
