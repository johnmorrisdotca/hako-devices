// Pictures of the demo, in a real headless browser: `pnpm screenshots [folder]`. It starts the site's own server on 7802, takes the shots and stops it.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "docs/images";
mkdirSync(out, { recursive: true });
const port = 7802;
const server = spawn("node", ["scripts/dev.ts"], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
await new Promise((resolve) => setTimeout(resolve, 600));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const url = `http://127.0.0.1:${port}/hako-devices/`;
const errors: string[] = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url);
  await page.waitForSelector('[data-testid="tile"]');
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
  await page.locator('hako-device[data-testid="builder-device"][data-view="3d"]').waitFor({ timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await shoot("#builder", "builder.jpg");
  await shoot("#lineup", "lineup.jpg");
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
  await phone.waitForSelector('[data-testid="tile"]');
  await phone.waitForTimeout(1500);
  await phone.screenshot({ path: join(out, "phone.jpg"), type: "jpeg", quality: 82 });
  await phone.close();
} finally {
  await browser.close();
  server.kill();
}
if (errors.length) console.error(errors.join("\n"));
console.log(`shots in ${out}`);
