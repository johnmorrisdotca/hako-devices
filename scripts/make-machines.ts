// Writes data/machines.json, the machine list as static JSON, from the typed model (`pnpm machines`). The build copies it to dist/machines.json and the demo site to /machines.json. A test keeps
// it equal to the model, so a machine added without running this fails `pnpm check`.
//
//   node scripts/make-machines.ts [--out <file>]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { machineList, machineText } from "./machines-read.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : join(root, "data", "machines.json");
const rows = JSON.parse(readFileSync(join(root, "data", "wishlist.json"), "utf8")) as { key: string; family: string }[];
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { name: string; version: string };
const list = machineList(rows, pkg);
writeFileSync(out, machineText(list));
console.log(`machines: ${list.machines.length} in ${out}`);
