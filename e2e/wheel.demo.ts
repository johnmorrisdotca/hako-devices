import { expect, test } from "@playwright/test";

test("Ctrl and the wheel zooms the device", async ({ page }) => {
  await page.goto("/hako-devices/");
  const bar = page.getByTestId("view-bar");
  const hero = page.getByTestId("hero-device");
  await expect(bar).toBeVisible();
  await hero.scrollIntoViewIfNeeded();
  const zoom = () => bar.evaluate((el: HTMLElement & { state: { zoom: number } }) => el.state.zoom);
  await expect.poll(zoom).toBeGreaterThan(0);
  const before = await zoom();
  const box = await hero.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -240);
  await page.keyboard.up("Control");
  await expect.poll(zoom).toBeGreaterThan(before);
});
