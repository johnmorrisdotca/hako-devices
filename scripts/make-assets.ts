// Makes the shipped pictures: dist/assets/<key>.glb and <key>.svg (and <key>.<style>.svg in every other style) for every device, parts/<id>.* for every part, and the "Coming soon"
// picture. The same input always gives the same bytes.
//
//   node scripts/make-assets.ts [--out <dir>] [key ...]
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { DEVICES } from "../src/catalogue.ts";
import { COMING_SOON_SVG } from "../src/placeholder.ts";
import { PARTS } from "../src/parts.ts";
import { drawingFile, STYLE_NAMES, STYLES, withHeavierLine } from "../src/styles.ts";
import { buildDevice, buildPart, type Built } from "../src/build/index.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const out = outAt >= 0 ? args[outAt + 1] : join(root, "dist", "assets");
const wanted = args.filter((arg, i) => !arg.startsWith("--") && i !== outAt + 1);
const MESH_LIMIT = 300 * 1024;
const DRAWING_LIMIT = 14 * 1024;
mkdirSync(join(out, "parts"), { recursive: true });

function write(folder: string, key: string, built: Built): string {
  const { bytes, triangles } = built.glb();
  if (bytes.byteLength > MESH_LIMIT) throw new Error(`${key}.glb is ${bytes.byteLength} bytes, over ${MESH_LIMIT}`);
  writeFileSync(join(folder, `${key}.glb`), bytes);
  const sizes: number[] = [];
  for (const name of STYLE_NAMES) {
    const svg = built.svg(name);
    if (svg.length > DRAWING_LIMIT) throw new Error(`${key} (${name}) is ${svg.length} bytes, over ${DRAWING_LIMIT}`);
    writeFileSync(join(folder, drawingFile(key, name)), svg);
    sizes.push(svg.length);
    const small: number | null = STYLES[name].small;
    if (small && key.startsWith("client-")) writeFileSync(join(folder, `${key}-small.svg`), withHeavierLine(svg, small));
  }
  return `${key.padEnd(24)} ${String(Math.round(bytes.byteLength / 1024)).padStart(4)} KB  ${String(triangles).padStart(6)} triangles  ${built.size.join(" x ")} mm  drawings ${sizes.join(", ")} bytes`;
}

let total = 0;
for (const { key } of DEVICES) {
  if (wanted.length && !wanted.includes(key)) continue;
  const line = write(out, key, buildDevice(key));
  total++;
  if (process.env.HAKO_ASSETS_LOG) console.log(line);
}
for (const id of Object.keys(PARTS)) {
  if (wanted.length && !wanted.includes(id)) continue;
  const line = write(join(out, "parts"), id, buildPart(id));
  total++;
  if (process.env.HAKO_ASSETS_LOG) console.log(line);
}
writeFileSync(join(out, "coming-soon.svg"), COMING_SOON_SVG);
console.log(`assets: ${total} devices and parts in ${out}`);
