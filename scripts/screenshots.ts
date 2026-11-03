// Pictures of the demo, in a real headless browser: `pnpm screenshots [folder]`. It starts the site's own server on 7802, takes the shots and stops it.
// `pnpm screenshots --thumbnail` takes only the family's thumbnail, dark thumbnail and icon (scripts/family-thumbnail.mjs).
// Chromium draws in software only (SwiftShader), never on the graphics card.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { chromium, type Page } from "@playwright/test";
import { captureDrawing, composeThumbnails } from "./family-thumbnail.mjs";

const onlyThumbnail = process.argv.includes("--thumbnail");
const out = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "docs/images";
mkdirSync(out, { recursive: true });
const port = Number(process.env.SHOTS_PORT ?? 7802);
const server = spawn("node", ["scripts/dev.ts"], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
await new Promise((resolve) => setTimeout(resolve, 600));
const browser = await chromium.launch({ args: ["--headless=new", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-gpu-compositing", "--ignore-gpu-blocklist"] });
const url = `http://127.0.0.1:${port}/hako-devices/`;
const errors: string[] = [];
// The family's thumbnail: four machines of different kinds in 3D, on the family's paper and its black cloth; the icon
// is the Raspberry Pi with its touch screen alone. No ground and no fireflies, so only the machines are drawn.
const THUMBNAIL_KEYS = ["macbook-pro-14", "pi4-pitft", "nas-2bay", "macintosh-128k"];
const stage = async (page: Page, keys: string[], size: number) => {
  await page.goto(url);
  await page.waitForSelector('[data-testid="gallery-card"]');
  await page.evaluate(
    ({ keys, size }) => {
      const row = document.createElement("div");
      row.id = "thumbnail-stage";
      row.style.cssText = "display:flex;align-items:center;padding:8px;width:max-content";
      // Each machine is framed with room around it; the squares overlap so the machines sit close.
      for (const [at, key] of keys.entries()) {
        const device = document.createElement("hako-device");
        device.setAttribute("key", key);
        device.setAttribute("no-ground", "");
        device.style.cssText = `display:block;width:${size}px;height:${size}px;background:transparent;margin-left:${at === 0 ? 0 : -size * 0.3}px`;
        row.append(device);
      }
      document.body.replaceChildren(row);
    },
    { keys, size },
  );
  for (let at = 0; at < keys.length; at += 1) await page.locator("#thumbnail-stage hako-device").nth(at).and(page.locator('[data-view="3d"]')).waitFor({ timeout: 90_000 });
  await page.waitForTimeout(2500);
  return captureDrawing(page, "#thumbnail-stage");
};
const thumbnails = async () => {
  const taken: Record<string, Buffer> = {};
  for (const [kind, scheme] of [["light", "light"], ["dark", "dark"], ["icon", "light"]] as const) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, colorScheme: scheme, reducedMotion: "reduce" });
    taken[kind] = kind === "icon" ? await stage(page, ["pi4-pitft"], 420) : await stage(page, THUMBNAIL_KEYS, 340);
    if (kind === "icon") for (const picture of await composeThumbnails({ page, light: taken.light, dark: taken.dark, icon: taken.icon, label: "Hako Devices 箱" })) console.log(picture.file, `${Math.round(picture.bytes / 1024)} KB`);
    await page.close();
  }
};
try {
  if (!onlyThumbnail) await shots();
  await thumbnails();
} finally {
  await browser.close();
  server.kill();
}
if (errors.length) console.error(errors.join("\n"));
console.log(`shots in ${out}`);

/** The README's pictures of the demo. */
async function shots() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url);
  await page.waitForSelector('[data-testid="gallery-card"]');
  await page.locator('hako-device#hero[data-view="3d"]').waitFor({ timeout: 60_000 });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: join(out, "hero.jpg"), type: "jpeg", quality: 82 });
  const shoot = async (selector: string, name: string, tallest = 1400) => {
    const node = page.locator(selector).first();
    await node.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await node.boundingBox();
    if (!box) throw new Error(`no ${selector}`);
    await page.screenshot({ path: join(out, name), type: "jpeg", quality: 82, fullPage: true, clip: { x: box.x, y: box.y + (await page.evaluate(() => scrollY)), width: box.width, height: Math.min(box.height, tallest) } });
  };
  await page.locator('.links a[data-view="builder"]').click();
  await page.locator('hako-device[data-testid="builder-device"][data-view="3d"]').waitFor({ timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await shoot("#builder", "builder.jpg");
  await page.locator('.links a[data-view="lineup"]').click();
  await shoot("#lineup", "lineup.jpg");
  await page.locator('.links a[data-view="gallery"]').click();
  const eager = () =>
    page.evaluate(async () => {
      const images = [...document.querySelectorAll<HTMLImageElement>("#gallery img")];
      for (const image of images) image.loading = "eager";
      await Promise.all(images.map((image) => image.decode().catch(() => null)));
    });
  await eager();
  await shoot("#gallery", "gallery.jpg");
  await page.locator('[data-testid="style-thick"]').click();
  await eager();
  // the large view changes its style too: wait for it to finish, or the picture catches it half way
  await page.locator('hako-device#hero[data-view="3d"]').waitFor({ timeout: 60_000 });
  await page.waitForTimeout(3000);
  await shoot("#gallery", "gallery-thick.jpg");
  await page.locator('[data-testid="style-thin"]').click();
  await page.locator('[data-testid="filter-all"]').click();
  await page.waitForTimeout(600);
  await page.locator('[data-testid="filter-planned"]').click();
  await page.waitForTimeout(600);
  await eager();
  await shoot("#gallery", "coming-soon.jpg", 900);
  await page.close();
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await phone.goto(url);
  await phone.waitForSelector('[data-testid="gallery-card"]');
  await phone.waitForTimeout(1500);
  await phone.screenshot({ path: join(out, "phone.jpg"), type: "jpeg", quality: 82 });
  await phone.close();
}
