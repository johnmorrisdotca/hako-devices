// The family's gesture check (kazoku-ui's checkGestures) on the demo's 3D device: the bar under it owns the hands. Every gesture is done with a real mouse, key or two fingers
// and must change the view as the family's rule says. `pnpm test:demo` builds the site and runs it.
import { checkGestures } from "@johnmorrisdotca/kazoku-ui/testing";
import { expect, test } from "@playwright/test";

test.beforeEach(({ browserName, viewport }) => {
  test.skip(browserName !== "chromium" || (viewport?.width ?? 1280) <= 640, "WebGL is drawn in Chromium here, and the gestures are the mouse's and the keyboard's");
});

test("the demo's 3D device answers every gesture", async ({ page }) => {
  // Thirteen gestures, each move photographed in software GL: 56 s measured on a busy Mac, so the local 90 s is not a budget for it. The hosted runner's is 240 s.
  test.setTimeout(240_000);
  await page.goto("/hako-devices/");
  await expect(page.locator("hako-device#hero")).toHaveAttribute("data-view", "3d", { timeout: 90_000 });
  const report = await checkGestures(page, "#hero");
  expect(report.filter((r) => r.result === "lacks")).toEqual([]);
});
