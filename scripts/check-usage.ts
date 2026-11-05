// Every way of using the package that the guides show, run against the package as npm packs it. The files in examples/ are copied beside a copy of the packed
// package (.usage/node_modules/@johnmorrisdotca/hako-devices) and each one is built or opened in a browser, which must draw a device. The guides, English and
// Japanese, must hold these files' text, word for word. `pnpm test:usage` builds the package and the site first. One browser, one page at a time.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium, type Browser, type Page } from "@playwright/test";
import { build as esbuild } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const at = (...parts: string[]) => join(root, ...parts);
const usage = at(".usage");
const NAME = "@johnmorrisdotca/hako-devices";

const only = process.argv.slice(2);
const results: string[] = [];
const failures: string[] = [];
const step = async (name: string, run: () => Promise<void> | void): Promise<void> => {
  if (only.length > 0 && !only.includes(name)) return;
  const started = Date.now();
  try {
    await run();
    results.push(`ok   ${name} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
    results.push(`FAIL ${name}`);
  }
  console.log(results[results.length - 1]);
};

rmSync(usage, { recursive: true, force: true });
mkdirSync(usage, { recursive: true });
const packed = JSON.parse(execFileSync("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", usage], { cwd: root, encoding: "utf8" })) as { filename: string }[];
const tarball = join(usage, packed[0]?.filename ?? "");
writeFileSync(join(usage, "package.json"), JSON.stringify({ private: true, type: "module" }));
const installed = join(usage, "node_modules", "@johnmorrisdotca", "hako-devices");
mkdirSync(installed, { recursive: true });
execFileSync("tar", ["-xzf", tarball, "-C", installed, "--strip-components=1"]);
cpSync(at("examples"), join(usage, "examples"), { recursive: true });
const examples = (name: string) => join(usage, "examples", name);

const TYPES: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".glb": "model/gltf-binary", ".jpg": "image/jpeg" };
const typeOf = (file: string) => TYPES[extname(file)] ?? "application/octet-stream";
const assetFile = (pathname: string): string => {
  const name = decodeURIComponent(pathname.split("/").pop() ?? "");
  for (const file of [join(installed, "dist", "assets", name), join(installed, "dist", "assets", "parts", name)]) if (name !== "" && existsSync(file)) return file;
  return "";
};

const serve = async (page: Page, origin: string, folder: string, prefix = ""): Promise<void> => {
  await page.route(`${origin}${prefix}/**`, (route) => {
    const pathname = new URL(route.request().url()).pathname.slice(prefix.length);
    const file = join(folder, decodeURIComponent(pathname.endsWith("/") ? `${pathname}index.html` : pathname));
    const found = existsSync(file) ? file : assetFile(pathname);
    if (found === "") return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(found), contentType: typeOf(found) });
  });
};

const opened = async (browser: Browser, run: (page: Page) => Promise<void>): Promise<void> => {
  const context = await browser.newContext({ viewport: { width: 800, height: 700 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  try {
    await run(page);
  } finally {
    await context.close();
  }
  if (errors.length > 0) throw new Error(`the page reported errors:\n${errors.join("\n")}`);
};

const seesDevice = async (page: Page, selector = "hako-device"): Promise<void> => {
  await page.locator(selector).first().waitFor({ state: "attached", timeout: 20_000 });
  await page.waitForFunction((css) => {
    const shadow = document.querySelector(css)?.shadowRoot;
    const img = shadow?.querySelector("img.drawing");
    if (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) return true;
    return (shadow?.querySelectorAll("svg path, svg polyline, svg line").length ?? 0) > 5;
  }, selector, { timeout: 30_000 });
};

const pageOf = (file: string) => readFileSync(file, "utf8");
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

const cdnFile = (pathname: string, prefix: string): { body: Buffer; type: string } | null => {
  const own = new RegExp(`^${prefix}/@johnmorrisdotca/hako-devices@[^/]+/(.+)$`).exec(pathname);
  const three = new RegExp(`^${prefix}/three@[^/]+/(.+)$`).exec(pathname);
  const rel = own?.[1] ?? three?.[1] ?? "";
  if (rel === "") return null;
  const file = own ? join(installed, rel) : join(root, "node_modules", "three", rel);
  return existsSync(file) ? { body: readFileSync(file), type: typeOf(file) } : null;
};

await step("cdn-jsdelivr", async () => {
  await opened(browser, async (page) => {
    await page.route("https://cdn.jsdelivr.net/**", (route) => {
      const found = cdnFile(new URL(route.request().url()).pathname, "/npm");
      const headers = { "access-control-allow-origin": "*" };
      return found ? route.fulfill({ body: found.body, headers: { ...headers, "content-type": found.type } }) : route.fulfill({ status: 404, body: "", headers });
    });
    await page.route("https://page.test/**", (route) => route.fulfill({ body: pageOf(join(examples(""), "cdn-jsdelivr.html")), contentType: "text/html" }));
    await page.goto("https://page.test/");
    await seesDevice(page);
    if ((await page.locator("hako-device").getAttribute("key")) !== "pi4") throw new Error("the element lost its key");
  });
});

await step("cdn-unpkg", async () => {
  await opened(browser, async (page) => {
    await page.route("https://unpkg.com/**", (route) => {
      const found = cdnFile(new URL(route.request().url()).pathname, "");
      const headers = { "access-control-allow-origin": "*" };
      return found ? route.fulfill({ body: found.body, headers: { ...headers, "content-type": found.type } }) : route.fulfill({ status: 404, body: "", headers });
    });
    await page.route("https://page.test/**", (route) => route.fulfill({ body: pageOf(join(examples(""), "cdn-unpkg.html")), contentType: "text/html" }));
    await page.goto("https://page.test/");
    await seesDevice(page);
  });
});

await step("iframe", async () => {
  if (!existsSync(at("site", "embed.html"))) throw new Error("site/ is not built: pnpm test:usage builds it");
  await opened(browser, async (page) => {
    await serve(page, "https://johnmorrisdotca.github.io", at("site"), "/hako-devices");
    await page.route("https://page.test/**", (route) => route.fulfill({ body: pageOf(join(examples(""), "iframe.html")), contentType: "text/html" }));
    await page.goto("https://page.test/");
    const frame = page.frameLocator("iframe");
    await frame.locator("hako-device").waitFor({ state: "attached", timeout: 20_000 });
    await frame.locator("hako-device").evaluate((element) => new Promise<void>((done, reject) => {
      const start = Date.now();
      const look = () => {
        const shadow = element.shadowRoot;
        const img = shadow?.querySelector("img.drawing");
        if (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) return done();
        if ((shadow?.querySelectorAll("svg path").length ?? 0) > 5) return done();
        if (Date.now() - start > 20_000) return reject(new Error("the embed did not draw"));
        setTimeout(look, 100);
      };
      look();
    }));
    if ((await frame.locator("hako-device").getAttribute("key")) !== "pi4") throw new Error("the embed ignored the key");
  });
});

const { build: viteBuild, loadConfigFromFile } = await import("vite");
const viteApp = async (name: string, plugins: unknown[] = []): Promise<void> => {
  const dir = examples(name);
  const out = join(usage, "out", name);
  await viteBuild({ root: dir, plugins: plugins as never[], logLevel: "warn", build: { outDir: out, emptyOutDir: true }, base: "./", configFile: false });
  await opened(browser, async (page) => {
    await serve(page, "https://app.test", out);
    await page.goto("https://app.test/");
    await seesDevice(page);
  });
};

await step("vite", () => viteApp("vite"));
await step("webpack", async () => {
  const { default: webpack } = await import("webpack");
  const dir = examples("webpack");
  const config = (await import(pathToFileURL(join(dir, "webpack.config.mjs")).href)).default as Record<string, unknown>;
  const stats = await new Promise<import("webpack").Stats>((resolve, reject) => {
    webpack({ ...config, context: dir, output: { ...(config["output"] as object), path: join(usage, "out", "webpack") } } as import("webpack").Configuration, (error, result) => (error || !result ? reject(error ?? new Error("no result")) : resolve(result)));
  });
  if (stats.hasErrors()) throw new Error(stats.toString({ colors: false, errors: true }));
  const out = join(usage, "out", "webpack");
  writeFileSync(join(out, "index.html"), "<!doctype html><html><body><script src=\"main.js\"></script></body></html>");
  await opened(browser, async (page) => {
    await serve(page, "https://app.test", out);
    await page.goto("https://app.test/");
    await seesDevice(page);
  });
});

await step("vue", async () => {
  const loaded = await loadConfigFromFile({ command: "build", mode: "production" }, join(examples("vue"), "vite.config.ts"), examples("vue"));
  if (!loaded) throw new Error("examples/vue/vite.config.ts did not load");
  await viteApp("vue", [...(loaded.config.plugins ?? [])]);
});

await step("svelte", async () => viteApp("svelte", [(await import("@sveltejs/vite-plugin-svelte")).svelte()]));

await step("angular", async () => {
  const dir = examples("angular");
  const out = join(usage, "out", "angular");
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "esnext", experimentalDecorators: true, useDefineForClassFields: false } }));
  await esbuild({ entryPoints: [join(dir, "main.ts")], outdir: out, bundle: true, splitting: true, format: "esm", tsconfig: join(dir, "tsconfig.json"), absWorkingDir: root, logLevel: "silent", minify: true });
  writeFileSync(join(out, "index.html"), readFileSync(join(dir, "index.html")));
  await opened(browser, async (page) => {
    await serve(page, "https://app.test", out);
    await page.goto("https://app.test/");
    await seesDevice(page);
  });
});

await browser.close();

const everything = only.length === 0;
const FILES: Record<string, string[]> = {
  "cdn-jsdelivr.html": ["docs/guides/from-a-cdn.md", "docs/guides/ja/from-a-cdn.md"],
  "cdn-unpkg.html": ["docs/guides/from-a-cdn.md", "docs/guides/ja/from-a-cdn.md"],
  "iframe.html": ["docs/guides/in-an-iframe.md", "docs/guides/ja/in-an-iframe.md"],
  "vite/index.html": ["docs/guides/with-a-bundler.md", "docs/guides/ja/with-a-bundler.md"],
  "vite/main.ts": ["docs/guides/with-a-bundler.md", "docs/guides/ja/with-a-bundler.md"],
  "webpack/src/index.js": ["docs/guides/with-a-bundler.md", "docs/guides/ja/with-a-bundler.md"],
  "webpack/webpack.config.mjs": ["docs/guides/with-a-bundler.md", "docs/guides/ja/with-a-bundler.md"],
  "vue/DeviceView.vue": ["docs/guides/with-vue.md", "docs/guides/ja/with-vue.md"],
  "vue/index.html": ["docs/guides/with-vue.md", "docs/guides/ja/with-vue.md"],
  "vue/main.ts": ["docs/guides/with-vue.md", "docs/guides/ja/with-vue.md"],
  "vue/vite.config.ts": ["docs/guides/with-vue.md", "docs/guides/ja/with-vue.md"],
  "svelte/DeviceView.svelte": ["docs/guides/with-svelte.md", "docs/guides/ja/with-svelte.md"],
  "svelte/index.html": ["docs/guides/with-svelte.md", "docs/guides/ja/with-svelte.md"],
  "svelte/main.ts": ["docs/guides/with-svelte.md", "docs/guides/ja/with-svelte.md"],
  "angular/device-view.component.ts": ["docs/guides/with-angular.md", "docs/guides/ja/with-angular.md"],
  "angular/main.ts": ["docs/guides/with-angular.md", "docs/guides/ja/with-angular.md"],
  "angular/index.html": ["docs/guides/with-angular.md", "docs/guides/ja/with-angular.md"],
};
const normal = (text: string) => text.replace(/\r\n/g, "\n").trim();
for (const [file, places] of everything ? Object.entries(FILES) : []) {
  const code = normal(readFileSync(at("examples", file), "utf8"));
  for (const place of places) if (!normal(readFileSync(at(place), "utf8")).includes(code)) failures.push(`${place} does not hold examples/${file} word for word`);
}
const unlisted = (folder: string): string[] => readdirSync(at("examples", folder), { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? unlisted(join(folder, entry.name)) : [relative("", join(folder, entry.name)).split("\\").join("/")]));
const known = new Set(Object.keys(FILES));
for (const file of everything ? unlisted("") : []) if (!known.has(file)) failures.push(`examples/${file} is not listed in scripts/check-usage.ts`);

console.log(failures.length === 0 ? `\nusage ok: ${results.length} ways to use ${NAME}` : `\n${failures.length} failure${failures.length === 1 ? "" : "s"}:\n- ${failures.join("\n- ")}`);
if (failures.length > 0) process.exit(1);
