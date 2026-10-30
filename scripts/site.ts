// Builds the static demo for GitHub Pages into ./site: the page, its styles, its scripts bundled with three.js, the shipped assets and the docs. Every address in it is relative, so it
// works at the Pages address (https://johnmorrisdotca.github.io/hako-devices/) and anywhere else. `pnpm site` builds first.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { renderDocs } from "./docs-site.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(join(root, "demo", "index.html"), join(site, "index.html"));
cpSync(join(root, "demo", "demo.css"), join(site, "demo.css"));
cpSync(join(root, "dist", "assets"), join(site, "assets"), { recursive: true });
await build({
  entryPoints: { demo: join(root, "demo", "demo.ts"), "react-check": join(root, "demo", "react-check.ts"), "element-check": join(root, "demo", "element-check.ts") },
  outdir: join(site, "js"),
  bundle: true,
  splitting: true,
  format: "esm",
  target: "es2022",
  minify: true,
  legalComments: "none",
  sourcemap: false,
  chunkNames: "chunks/[name]-[hash]",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
cpSync(join(root, "demo", "react-check.html"), join(site, "react-check.html"));
cpSync(join(root, "demo", "element-check.html"), join(site, "element-check.html"));
renderDocs(root, join(site, "docs"));
writeFileSync(join(site, ".nojekyll"), "");
console.log("site/ is ready");
