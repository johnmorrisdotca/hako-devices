// Writes src/wishlist.ts from data/wishlist.json. Run it when the list changes (`pnpm wishlist`); a test keeps the two equal. The JSON is read, never edited here.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEVICES } from "../src/catalogue.ts";
import { readWishlist } from "./wishlist-read.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { planned, covered } = readWishlist(JSON.parse(readFileSync(join(root, "data", "wishlist.json"), "utf8")), new Set(DEVICES.map((device) => device.key)));
const lines = (list: readonly unknown[]) => list.map((entry) => `  ${JSON.stringify(entry)},`).join("\n");
writeFileSync(
  join(root, "src", "wishlist.ts"),
  `// The list of machines, from data/wishlist.json by scripts/make-wishlist.ts: names only. Those with no mesh yet show under one "Coming soon" picture; a real machine a built mesh
// covers shows that mesh. Do not edit: run \`pnpm wishlist\`.
export interface PlannedDevice {
  key: string;
  name: string;
  family: string;
  status: "planned";
}

export interface CoveredDevice {
  key: string;
  name: string;
  family: string;
  /** The catalogue key of the mesh that draws it. */
  mesh: string;
  status: "built";
}

export const COVERED: readonly CoveredDevice[] = [
${lines(covered)}
];

export const PLANNED: readonly PlannedDevice[] = [
${lines(planned)}
];
`,
);
console.log(`wishlist: ${planned.length} planned, ${covered.length} covered by a built mesh`);
