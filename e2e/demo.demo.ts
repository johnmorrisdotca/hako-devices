// The demo in a real browser: no console or policy error, the gallery, the styles, the builder, the lineup, the live screen, and every device reaching its 3D view.
import { expect, type Page, test } from "@playwright/test";
import { DEVICES } from "../src/catalogue.ts";
import { catalogueCounts, COVERED, PLANNED } from "../src/index.ts";

const URL = "/hako-devices/";

/** Fails the test on any console error, page error, failed request or content security policy report. */
function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`page: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
  });
  void page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => console.error(`policy: ${event.violatedDirective} ${event.blockedURI}`));
  });
  return problems;
}

const is3d = (browserName: string) => browserName === "chromium";

test("the page loads clean, every address under the site's own path", async ({ page }) => {
  const problems = watch(page);
  const addresses: string[] = [];
  page.on("request", (request) => addresses.push(request.url()));
  await page.goto(URL);
  await expect(page.locator('[data-testid="tile"]').first()).toBeVisible();
  await page.waitForTimeout(800);
  expect(problems).toEqual([]);
  expect(addresses.length).toBeGreaterThan(5);
  for (const address of addresses) expect(new globalThis.URL(address).pathname.startsWith("/hako-devices/")).toBe(true);
});

test("the gallery shows every built device by family, and what is coming", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  const counts = catalogueCounts();
  expect(counts.total).toBeGreaterThan(1000);
  await expect(page.locator('[data-testid="tile"][data-status="built"]')).toHaveCount(counts.built);
  await expect(page.locator('[data-testid="gallery-count"]')).toHaveText(`${counts.built} of ${counts.total} built`);
  await expect(page.locator('[data-testid="part-tile"]').first()).toBeVisible();
  for (const family of ["pi-boards", "pi-dressed", "desktops", "laptops", "tablets-phones", "pcs", "nas", "clients"]) await expect(page.locator(`[data-testid="gallery-group"][data-family="${family}"]`)).toBeVisible();
  await page.locator('[data-testid="filter-planned"]').click();
  await expect(page.locator('[data-testid="tile"][data-status="built"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="tile"][data-status="planned"]')).toHaveCount(counts.planned);
  // one picture for every machine still to come, its own name under it
  const sources = await page.evaluate(() => new Set([...document.querySelectorAll<HTMLImageElement>('[data-status="planned"] img')].map((image) => image.getAttribute("src"))).size);
  expect(sources).toBe(1);
  await expect(page.locator(`[data-testid="tile"][data-key="${PLANNED[0].key}"]`)).toContainText(PLANNED[0].name);
  await expect(page.locator(`[data-testid="tile"][data-key="${PLANNED[0].key}"]`)).toContainText("Coming soon");
  await page.locator('[data-testid="filter-all"]').click();
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(counts.total);
  await page.locator('[data-testid="filter-built"]').click();
  await page.locator('[data-testid="gallery-search"]').fill("rack nas");
  await expect(page.locator('[data-testid="tile"][data-key="nas-rack"]')).toBeVisible();
  await page.locator('[data-testid="gallery-search"]').fill("nothing has this name");
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("every drawing in the gallery loads, in thin, in thick and in both", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  const loaded = async () =>
    page.evaluate(async () => {
      const images = [...document.querySelectorAll<HTMLImageElement>("#gallery img")];
      for (const image of images) image.loading = "eager";
      await Promise.all(images.map((image) => image.decode().catch(() => null)));
      return { total: images.length, bad: images.filter((image) => image.naturalWidth === 0).map((image) => image.src), thick: images.filter((image) => image.src.endsWith(".thick.svg")).length };
    });
  const thin = await loaded();
  expect(thin.bad).toEqual([]);
  expect(thin.thick).toBe(0);
  await page.locator('[data-testid="style-thick"]').click();
  const thick = await loaded();
  expect(thick.bad).toEqual([]);
  expect(thick.thick).toBe(thin.total);
  await page.locator('[data-testid="style-both"]').click();
  const both = await loaded();
  expect(both.bad).toEqual([]);
  expect(both.total).toBe(thin.total * 2);
  expect(problems).toEqual([]);
});

test("every device reaches its 3D view", async ({ page, browserName }, info) => {
  test.skip(!is3d(browserName) || info.project.name !== "chromium-desk", "one browser is enough for this long walk");
  test.setTimeout(300_000);
  const problems = watch(page);
  await page.goto(URL);
  const hero = page.locator("hako-device#hero");
  await hero.scrollIntoViewIfNeeded();
  for (const { key } of DEVICES) {
    await page.evaluate((k) => document.getElementById("hero")?.setAttribute("key", k), key);
    await expect(hero, key).toHaveAttribute("data-view", "3d", { timeout: 30_000 });
    const frames = await page.evaluate(async () => {
      const node = document.getElementById("hero") as HTMLElement;
      const canvas = node.shadowRoot?.querySelector("canvas");
      for (let i = 0; i < 60 && !canvas?.dataset.frames; i++) await new Promise((r) => setTimeout(r, 50));
      return Number(canvas?.dataset.frames ?? 0);
    });
    expect(frames, key).toBeGreaterThan(0);
  }
  expect(problems).toEqual([]);
});

test("the drawing stays when there is no WebGL", async ({ page }) => {
  const problems = watch(page);
  await page.addInitScript(() => {
    const real = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) {
      if (/webgl/.test(kind)) return null;
      return (real as (...a: unknown[]) => unknown).call(this, kind, ...rest);
    } as typeof real;
  });
  await page.goto(URL);
  const hero = page.locator("hako-device#hero");
  await expect(hero).toHaveAttribute("data-view", "fallback");
  await expect(hero).toHaveAttribute("data-why", "no-webgl");
  expect(await page.evaluate(() => document.getElementById("hero")?.shadowRoot?.querySelector("canvas") ?? null)).toBeNull();
  const width = await page.evaluate(() => (document.getElementById("hero")?.shadowRoot?.querySelector("img") as HTMLImageElement).naturalWidth);
  expect(width).toBeGreaterThan(0);
  expect(problems).toEqual([]);
});

test("Save-Data keeps the drawing too", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
  await page.goto(URL);
  await expect(page.locator("hako-device#hero")).toHaveAttribute("data-why", "reduced-data");
});

test("drag and keys turn the view; Home brings it back", async ({ page, browserName }, info) => {
  test.skip(!is3d(browserName) || info.project.name !== "chromium-desk");
  await page.goto(URL);
  const hero = page.locator("hako-device#hero");
  await expect(hero).toHaveAttribute("data-view", "3d", { timeout: 30_000 });
  const azimuth = () => page.evaluate(() => Number((document.getElementById("hero") as HTMLElement).shadowRoot?.querySelector("canvas")?.dataset.azimuth ?? "NaN"));
  await page.waitForTimeout(300);
  await hero.locator("canvas").focus();
  const before = await azimuth();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  const after = await azimuth();
  expect(Math.abs(after - before)).toBeGreaterThan(0.1);
  const box = await hero.boundingBox();
  if (!box) throw new Error("no box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  expect(Math.abs((await azimuth()) - after)).toBeGreaterThan(0.1);
  await page.keyboard.press("Home");
  await page.waitForTimeout(900);
  expect(Math.abs((await azimuth()) - before)).toBeLessThan(0.15);
});

test("the builder checks the fit and writes the code", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  const issues = page.locator('[data-testid="builder-issues"]');
  await expect(issues).toContainText("It all fits.");
  await page.locator('[data-testid="pick-case"]').selectOption("argon");
  await expect(issues.locator('li[data-code="case-covers-header"]')).toBeVisible();
  await page.locator('[data-testid="pick-hat"]').selectOption("");
  await expect(issues).toContainText("It all fits.");
  await page.locator('[data-testid="pick-board"]').selectOption("pi-zero-2w");
  await expect(issues.locator('li[data-code="case-wrong-board"]')).toBeVisible();
  await page.locator('[data-testid="pick-case"]').selectOption("unipi");
  await expect(issues).toContainText("It all fits.");
  await expect(page.locator('[data-testid="builder-code"]')).toContainText('"case":"unipi"');
  await page.locator('[data-testid="pick-case"]').selectOption("");
  await page.locator('[data-testid="pick-hat"]').selectOption("oled-bonnet");
  await expect(issues.locator('li[data-code="header-not-soldered"]')).toBeVisible();
  await page.locator('[data-testid="pick-solder"]').check();
  await expect(issues).toContainText("It all fits.");
  await expect(page.locator('[data-testid="builder-device"]')).toHaveAttribute("data-view", /picture|loading|3d/);
  expect(problems).toEqual([]);
});

test("a hostile print stays text, in the drawing and on the page", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await page.locator('[data-testid="pick-case"]').selectOption("");
  await page.locator('[data-testid="pick-hat"]').selectOption("pitft-28");
  await page.locator('[data-testid="pick-print"]').fill('<img src=x onerror=alert(1)>');
  await page.locator('[data-testid="pick-print"]').blur();
  await page.waitForTimeout(600);
  const inserted = await page.evaluate(() => (document.querySelector('[data-testid="builder-device"]') as HTMLElement).shadowRoot?.querySelectorAll("image, img").length ?? -1);
  expect(inserted).toBe(0);
  expect(problems).toEqual([]);
});

test("the lineup is to scale, on one baseline, its lines one width", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  const measured = async () =>
    page.evaluate(async () => {
      const host = document.querySelector('[data-testid="lineup"]') as HTMLElement;
      const devices = [...(host.shadowRoot?.querySelectorAll("hako-device") ?? [])] as HTMLElement[];
      for (let i = 0; i < 100 && devices.some((d) => !d.dataset.widthPx); i++) await new Promise((r) => setTimeout(r, 50));
      return devices.map((d) => {
        const svg = d.shadowRoot?.querySelector("svg");
        const lines = [...(svg?.querySelectorAll("[vector-effect='non-scaling-stroke']") ?? [])];
        const widths = lines.map((line) => Number(line.getAttribute("stroke-width")));
        const frame = d.shadowRoot?.querySelector(".frame") as HTMLElement;
        const rect = frame.getBoundingClientRect();
        return { key: d.getAttribute("key"), w: Number(d.dataset.widthPx), mm: Number(d.dataset.mmPerUnit), bottom: rect.bottom, left: rect.left, right: rect.right, lines: lines.length, maxLine: Math.max(...widths), effect: lines[0] ? getComputedStyle(lines[0]).getPropertyValue("vector-effect") : "" };
      });
    });
  const one = await measured();
  const by = (key: string) => {
    const found = one.find((d) => d.key === key);
    if (!found) throw new Error(key);
    return found;
  };
  // a tiny board is smaller than a full one, smaller than a NAS
  expect(by("pi-zero-bare").w).toBeLessThan(by("pi5").w);
  expect(by("pi5").w).toBeLessThan(by("nas-2bay").w + 50);
  // nine asked for, nine there, each wholly inside the lineup: what does not fit wraps
  const keys = (await page.locator('[data-testid="lineup"]').getAttribute("keys"))?.split(",") ?? [];
  expect(keys.length).toBe(9);
  expect(one.map((d) => d.key)).toEqual(keys);
  const box = await page.locator('[data-testid="lineup"]').boundingBox();
  if (!box) throw new Error("no lineup");
  for (const d of one) {
    expect(d.right, String(d.key)).toBeLessThanOrEqual(box.x + box.width + 1);
    expect(d.left, String(d.key)).toBeGreaterThanOrEqual(box.x - 1);
    expect(d.bottom, String(d.key)).toBeLessThanOrEqual(box.y + box.height + 1);
  }
  // one shared baseline in each row
  const rows = new Map<number, number[]>();
  for (const d of one) {
    const row = [...rows.keys()].find((at) => Math.abs(at - d.bottom) < 120) ?? d.bottom;
    rows.set(row, [...(rows.get(row) ?? []), d.bottom]);
  }
  for (const bottoms of rows.values()) for (const bottom of bottoms) expect(Math.abs(bottom - bottoms[0])).toBeLessThan(1);
  // the ruler's numbers do not run into each other
  const labels = await page.evaluate(() =>
    [...((document.querySelector('[data-testid="lineup"]') as HTMLElement).shadowRoot?.querySelectorAll(".ruler text") ?? [])].map((text) => {
      const r = text.getBoundingClientRect();
      return [r.left, r.right];
    }),
  );
  expect(labels.length).toBeGreaterThan(1);
  for (let i = 1; i < labels.length; i++) expect(labels[i][0]).toBeGreaterThanOrEqual(labels[i - 1][1]);
  // the lines are the style's width on the smallest and the largest
  expect(by("pi-zero-bare").lines).toBeGreaterThan(5);
  expect(by("nas-2bay").lines).toBeGreaterThan(5);
  expect(by("pi-zero-bare").maxLine).toBe(by("nas-2bay").maxLine);
  expect(by("nas-2bay").effect).toBe("non-scaling-stroke");
  // twice the unit, twice the size
  await page.locator('[data-testid="lineup-unit"]').selectOption("2");
  await page.waitForTimeout(500);
  const two = await measured();
  expect(two.find((d) => d.key === "pi5")?.w).toBeCloseTo(by("pi5").w * 2, 0);
  await expect(page.locator('[data-testid="lineup"]')).toBeVisible();
  expect(problems).toEqual([]);
});

test("a real-scale 3D view takes the mesh's millimetres", async ({ page, browserName }, info) => {
  test.skip(!is3d(browserName) || info.project.name !== "chromium-desk");
  await page.goto(URL);
  await page.evaluate(() => {
    const d = document.createElement("hako-device");
    d.id = "real3d";
    d.setAttribute("key", "pi5");
    d.setAttribute("scale", "real");
    d.setAttribute("unit", "2px/mm");
    document.body.prepend(d);
  });
  const d = page.locator("#real3d");
  await expect(d).toHaveAttribute("data-view", "3d", { timeout: 30_000 });
  const sizes = await page.evaluate(() => {
    const host = document.getElementById("real3d") as HTMLElement;
    const canvas = host.shadowRoot?.querySelector("canvas") as HTMLCanvasElement;
    return { canvas: canvas.getBoundingClientRect().width, mm: Number(host.dataset.mmPerUnit) };
  });
  // the canvas is the whole picture, 320 units, at 2 pixels a millimetre
  expect(sizes.canvas).toBeCloseTo(320 * sizes.mm * 2, 0);
});

test("a live screen takes words and a canvas", async ({ page, browserName }, info) => {
  test.skip(!is3d(browserName) || info.project.name !== "chromium-desk");
  const problems = watch(page);
  await page.goto(URL);
  const device = page.locator('[data-testid="screen-device"]');
  await device.scrollIntoViewIfNeeded();
  await expect(device).toHaveAttribute("data-view", "3d", { timeout: 30_000 });
  await page.waitForTimeout(400);
  const words = await device.screenshot();
  await page.locator('[data-testid="screen-title-input"]').fill("Something else entirely");
  await page.waitForTimeout(400);
  const changed = await device.screenshot();
  expect(Buffer.compare(words, changed)).not.toBe(0);
  await page.locator('[data-testid="screen-canvas"]').click();
  await page.waitForTimeout(400);
  const painted = await device.screenshot();
  expect(Buffer.compare(changed, painted)).not.toBe(0);
  expect(problems).toEqual([]);
});

test("a tile opens one device large; Close and Back take it away", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await page.locator('[data-testid="tile"][data-key="pi4"]').click();
  const dialog = page.locator('[data-testid="device-dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-testid="dialog-device"]')).toHaveAttribute("key", "pi4");
  await expect(dialog).toContainText("85 by 56 by 17 mm");
  await page.locator('[data-testid="dialog-close"]').click();
  await expect(dialog).toBeHidden();
  await page.locator('[data-testid="part-tile"][data-key="armor"]').click();
  await expect(dialog.locator('[data-testid="dialog-device"]')).toHaveAttribute("part", "armor");
  expect(problems).toEqual([]);
});

test("no sideways scroll at a phone's width", async ({ page }, info) => {
  test.skip(info.project.name === "chromium-desk");
  await page.goto(URL);
  await expect(page.locator('[data-testid="tile"]').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the docs open at their relative address", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}docs/index.html`);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(problems).toEqual([]);
});

test("a planned key shows the one placeholder, a covered key its mesh; style= names a style", async ({ page }) => {
  await page.goto(`${URL}element-check.html`);
  const planned = page.locator("#planned");
  await expect(planned).toHaveAttribute("data-view", "planned");
  await expect(planned).toHaveAttribute("data-why", "unknown-key");
  await expect(planned.locator("svg")).toContainText("Coming soon");
  await page.evaluate(([plannedKey, coveredKey]) => {
    const add = (id: string, key: string) => {
      const d = document.createElement("hako-device");
      d.id = id;
      d.setAttribute("key", key);
      d.setAttribute("mode", "drawing");
      document.body.append(d);
    };
    add("on-the-list", plannedKey);
    add("covered", coveredKey);
  }, [PLANNED[0].key, COVERED[0].key]);
  await expect(page.locator("#on-the-list")).toHaveAttribute("data-why", "planned");
  await expect(page.locator("#on-the-list")).toHaveAttribute("data-name", PLANNED[0].name);
  await expect(page.locator("#covered img")).toHaveAttribute("src", new RegExp(`/${COVERED[0].mesh}\\.svg$`));
  await expect(page.locator("#by-style img")).toHaveAttribute("src", /pi4\.thick\.svg$/);
});

test("the React wrapper draws the element", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}react-check.html`);
  const device = page.locator("hako-device#react-device");
  await expect(device).toHaveAttribute("device", "pi4");
  await expect(device.locator("img")).toHaveAttribute("src", /pi4\.svg$/);
  expect(problems).toEqual([]);
});
