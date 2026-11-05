// Builds the static demo for GitHub Pages into ./site: the page, its styles, its scripts bundled with three.js, the shipped assets and the docs. Every address in it is relative, so it
// works at the Pages address (https://johnmorrisdotca.github.io/hako-devices/) and anywhere else. `pnpm site` builds first.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { renderDocs } from "./docs-site.ts";
import { publishThumbnails, thumbnailHead } from "./family-thumbnail.mjs";
import { familyBoot, renderIndex } from "./page.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
// The demo's page, with the family's card in its <head> (og:image, twitter:image, the icon), published beside it.
const ALT = "Hako Devices: a laptop, a Raspberry Pi with its touch screen, a two-bay NAS and an early compact Mac, in 3D.";
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
writeFileSync(join(site, "index.html"), renderIndex().replace("  </head>", `    ${thumbnailHead(pkg, { alt: ALT })}\n  </head>`));
writeFileSync(join(site, "family-boot.js"), familyBoot());
publishThumbnails(root, site);
cpSync(join(root, "demo", "embed.html"), join(site, "embed.html"));
cpSync(join(root, "demo", "demo.css"), join(site, "demo.css"));
cpSync(join(root, "demo", "family.css"), join(site, "family.css"));
cpSync(join(root, "dist", "assets"), join(site, "assets"), { recursive: true });
cpSync(join(root, "dist", "machines.json"), join(site, "machines.json"));
await build({
  entryPoints: { demo: join(root, "demo", "demo.ts"), embed: join(root, "demo", "embed.ts"), "react-check": join(root, "demo", "react-check.ts"), "element-check": join(root, "demo", "element-check.ts") },
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
writeFileSync(join(site, "kazoku-parts.src.js"), `import "@johnmorrisdotca/kazoku-ui/language-picker/define";\nimport "@johnmorrisdotca/kazoku-ui/theme-switch/define";\n`);
await build({ entryPoints: [join(site, "kazoku-parts.src.js")], outfile: join(site, "kazoku-parts.js"), bundle: true, format: "esm", minify: true, logLevel: "warning", absWorkingDir: root });
rmSync(join(site, "kazoku-parts.src.js"));
cpSync(join(root, "demo", "react-check.html"), join(site, "react-check.html"));
cpSync(join(root, "demo", "element-check.html"), join(site, "element-check.html"));
renderDocs(root, join(site, "docs"));
writeFileSync(join(site, ".nojekyll"), "");
console.log("site/ is ready");
