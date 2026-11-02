// Packs the package the way it is published (`npm pack`), installs the tarball into an empty project, and uses it as somebody who installed it would: every entry imported, a device
// built that must equal the one this checkout builds, every asset there. A package whose `exports` name a file that is not in the tarball fails here, before it is published.
// `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { catalogue, DEVICES, PARTS, STYLE_NAMES, drawingFile } from "../src/index.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { name: string; version: string; main: string; types: string; files: string[]; dependencies?: Record<string, string>; exports: Record<string, string | Record<string, string>> };
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "hako-package-"));

function run(command: string, args: string[], cwd: string, viaShell = false) {
  const shell = viaShell && windows;
  const ran = spawnSync(shell && /[\\/]/.test(command) ? `"${command}"` : command, args, { cwd, encoding: "utf8", shell });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}
const fail = (message: string) => {
  console.error(`FAIL ${message}`);
  process.exit(1);
};

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true)) as { filename: string; size: number; unpackedSize: number; files: { path: string }[] }[];
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files, ${(packed[0].size / 1024 / 1024).toFixed(1)} MB packed, ${(packed[0].unpackedSize / 1024 / 1024).toFixed(1)} MB unpacked`);

// 2. Only what should ship.
const allowed = /^(dist\/|README\.md$|LICENSE$|LICENSES\/|NOTICE\.md$|CHANGELOG\.md$|package\.json$)/;
const strays = [...inTarball].filter((file) => !allowed.test(file) || /\.test\.|\.(ts|map)$/.test(file.replace(/\.d\.ts$/, ".d")));
if (strays.length) fail(`the tarball holds what should not ship: ${strays.slice(0, 10).join(", ")}`);
console.log("ok   no source, test, demo, doc or picture is in the tarball");
const pointed = [pkg.main, pkg.types, ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))].filter((file) => !file.includes("*") && !file.endsWith("package.json"));
for (const file of new Set(pointed)) if (!inTarball.has(file.replace(/^\.\//, ""))) fail(`package.json points at ${file}, which is not in the tarball`);
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);
for (const named of pkg.files) if (![...inTarball].some((file) => file === named || file.startsWith(`${named}/`))) fail(`package.json's files names ${named}, which is not in the tarball`);
if (Object.keys(pkg.dependencies ?? {}).length > 0) fail("the package has runtime dependencies; three.js is a peer");
console.log("ok   no runtime dependencies");

// 3. Every asset is there.
for (const { key } of DEVICES) {
  if (!inTarball.has(`dist/assets/${key}.glb`)) fail(`no ${key}.glb`);
  for (const style of STYLE_NAMES) if (!inTarball.has(`dist/assets/${drawingFile(key, style)}`)) fail(`no ${drawingFile(key, style)}`);
}
for (const id of Object.keys(PARTS)) {
  if (!inTarball.has(`dist/assets/parts/${id}.glb`)) fail(`no part ${id}.glb`);
  for (const style of STYLE_NAMES) if (!inTarball.has(`dist/assets/parts/${drawingFile(id, style)}`)) fail(`no part ${drawingFile(id, style)}`);
}
if (!inTarball.has("dist/assets/coming-soon.svg")) fail("no coming-soon.svg");
console.log(`ok   every device and part has its mesh and a drawing in every style (${DEVICES.length} devices, ${Object.keys(PARTS).length} parts)`);

// 4. Install it into an empty project, with its peers.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball, "three@0.186.1", "react@19", "react-dom@19"], project, true);
console.log("ok   npm install of the tarball and its peers");

// 5. Every entry, and a device that must equal this checkout's.
const local = (await import(new URL("../dist/build/index.js", import.meta.url).href)) as typeof import("../src/build/index.ts");
const machine = local.build({ board: "pi4", case: "armor", hat: "pitft-28" });
writeFileSync(
  join(project, "esm.mjs"),
  `import { check, DEVICES } from ${JSON.stringify(pkg.name)};
import { build } from ${JSON.stringify(`${pkg.name}/build`)};
import { HakoDevice } from ${JSON.stringify(`${pkg.name}/element`)};
import { embedCode } from ${JSON.stringify(`${pkg.name}/embed`)};
import { coloursOf } from ${JSON.stringify(`${pkg.name}/colours`)};
import { HakoDevice as ReactDevice } from ${JSON.stringify(`${pkg.name}/react`)};
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
if (!check({ board: "pi4" }).ok || DEVICES.length !== ${DEVICES.length}) throw new Error("the catalogue");
if (typeof HakoDevice !== "function" || typeof ReactDevice !== "function") throw new Error("the element");
if (!embedCode({ key: "pi4" }, "element").includes("<hako-device")) throw new Error("the embed");
if (coloursOf("imac-1998")[0]?.name !== "Bondi Blue") throw new Error("the colours");
const machine = build({ board: "pi4", case: "armor", hat: "pitft-28" });
if (machine.svg() !== ${JSON.stringify(machine.svg())}) throw new Error("the installed package drew another machine");
if (machine.glb().bytes.length !== ${machine.glb().bytes.length}) throw new Error("the installed package made another mesh");
const require = createRequire(import.meta.url);
const asset = require.resolve(${JSON.stringify(`${pkg.name}/assets/pi4.glb`)});
if (!asset.endsWith("pi4.glb")) throw new Error("the asset's address");
const listed = JSON.parse(readFileSync(require.resolve(${JSON.stringify(`${pkg.name}/machines.json`)}), "utf8"));
if (listed.version !== ${JSON.stringify(pkg.version)} || listed.machines.length !== ${catalogue().length}) throw new Error("the installed machine list");
console.log("ok");
`,
);
run(process.execPath, ["esm.mjs"], project);
console.log("ok   every entry imports, by ESM, and the installed package makes the same device");
writeFileSync(join(project, "cjs.cjs"), `const core = require(${JSON.stringify(pkg.name)}); if (!core.check({ board: "pi4" }).ok) throw new Error("require");`);
run(process.execPath, ["cjs.cjs"], project);
console.log("ok   the core imports by require");
