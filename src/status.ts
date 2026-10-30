// Built or planned: the catalogue with the wishlist beside it. A planned machine has a name and a family, and no shape.
import { DEVICES, deviceByKey, type Device } from "./catalogue.ts";
import { PLANNED, type PlannedDevice } from "./wishlist.ts";

export type CatalogueEntry = Device | PlannedDevice;

/** Every machine: the built ones, then those on the list. */
export const catalogue = (): readonly CatalogueEntry[] => [...DEVICES, ...PLANNED.filter((entry) => !deviceByKey(entry.key))];

/** "built", "planned", or null for a key on neither list. */
export function statusOf(key: string): "built" | "planned" | null {
  if (deviceByKey(key)) return "built";
  return PLANNED.some((entry) => entry.key === key) ? "planned" : null;
}

export function catalogueCounts(): { built: number; planned: number; total: number } {
  const all = catalogue();
  const built = all.filter((entry) => entry.status === "built").length;
  return { built, planned: all.length - built, total: all.length };
}
