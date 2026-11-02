// The demo in a real browser: no console or policy error, the gallery, the styles, the builder, the lineup, the live screen, and every device reaching its 3D view.
import { expect, type Page, test } from "@playwright/test";
import { DEVICES } from "../src/catalogue.ts";
import { catalogue, catalogueCounts, COVERED, headingOf, PLANNED } from "../src/index.ts";
import { inYears, matchesPicks, type Picks } from "../src/tags.ts";

const URL = "/hako-devices/";

/** Fails the test on any console error, page error, failed request or content security policy report. */
function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    // WebKit's own <select> styles itself, and the policy reports that against the page: its plain message is dropped here, and the report below names the element
    if (message.type() === "error" && !message.text().startsWith("Refused to apply a stylesheet")) problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`page: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
  });
  void page.addInitScript(() => {
    document.addEventListener(
      "securitypolicyviolation",
      (event) => {
        if ((event.target as Element | null)?.nodeName !== "SELECT") console.error(`policy: ${event.violatedDirective} ${event.blockedURI} ${(event.target as Element | null)?.nodeName}`);
      },
      true,
    );
  });
  return problems;
}

const is3d = (browserName: string) => browserName === "chromium";

test("the page loads clean, every address under the site's own path", async ({ page }) => {
  const problems = watch(page);
  const addresses: string[] = [];
  page.on("request", (request) => addresses.push(request.url()));
  await page.goto(URL);
  await expect(page.locator('[data-testid="gallery-card"]').first()).toBeVisible();
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
  // it opens on the groups, each a bunch of its machines, not on every machine
  const card = (id: string) => page.locator(`[data-testid="gallery-card"][data-group="${id}"]`);
  await expect(page.locator('[data-testid="gallery-count"]')).toHaveText(`${counts.built} of ${counts.total} built`);
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(0);
  for (const family of ["pi-boards", "pi-dressed", "desktops", "laptops", "tablets-phones", "pcs", "nas", "classics", "clients", "parts"]) await expect(card(family)).toBeVisible();
  expect(await card("pi-boards").locator("img").count()).toBeGreaterThan(1);
  await card("pi-boards").click();
  await expect(page.locator('[data-testid="tile"][data-key="rpi-zero"]')).toContainText("Raspberry Pi Zero");
  await expect(page.locator('[data-testid="tile"][data-key="nas-rack"]')).toHaveCount(0);
  await page.locator('[data-testid="group-back"]').click();
  await card("parts").click();
  await expect(page.locator('[data-testid="part-tile"]').first()).toBeVisible();
  await page.locator('[data-testid="group-back"]').click();
  await page.locator('[data-testid="filter-planned"]').click();
  // every machine still to come is on a shelf
  const shelved = await page.locator('[data-testid="gallery-card"][data-shelf]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.count)));
  expect(shelved.reduce((sum, count) => sum + count, 0)).toBe(counts.planned);
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(0);
  const first = PLANNED.find((entry) => entry.shelf === "consoles" && entry.family === "DS") ?? PLANNED[0];
  await card(first.shelf).click();
  const shelf = page.locator(`[data-testid="gallery-shelf"][data-shelf="${first.shelf}"]`);
  const family = shelf.locator('[data-testid="gallery-family"]').filter({ hasText: headingOf(first) }).first();
  await family.locator("summary").click();
  await expect(family.locator(`[data-testid="tile"][data-key="${first.key}"]`)).toContainText(first.name);
  await expect(family.locator(`[data-testid="tile"][data-key="${first.key}"]`)).toContainText("Coming soon");
  // one picture for every machine still to come
  const sources = await page.evaluate(() => new Set([...document.querySelectorAll<HTMLImageElement>('[data-status="planned"] img')].map((image) => image.getAttribute("src"))).size);
  expect(sources).toBe(1);
  // what was open stays open across a change of filter
  await page.locator('[data-testid="filter-all"]').click();
  await expect(page.locator(`[data-testid="tile"][data-key="${first.key}"]`)).toBeVisible();
  await page.locator('[data-testid="group-back"]').click();
  await page.locator('[data-testid="filter-built"]').click();
  await page.locator('[data-testid="gallery-search"]').fill("rack nas");
  await expect(page.locator('[data-testid="tile"][data-key="nas-rack"]')).toBeVisible();
  await page.locator('[data-testid="gallery-search"]').fill("trash-can");
  await expect(page.locator('[data-testid="tile"][data-key="mac-pro-late-2013"]')).toBeVisible();
  await page.locator('[data-testid="gallery-search"]').fill("nothing has this name");
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("every drawing in the gallery loads, in thin, in thick and in both", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  // a blank search narrows to everything: every tile on one page
  await page.locator('[data-testid="gallery-search"]').fill(" ");
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

// The walk is split into parts so that no one test grows with the catalogue: each part takes every SHARDS-th device and has the whole timeout to itself.
const SHARDS = 6;
for (let part = 0; part < SHARDS; part++) {
  test(`every device reaches its 3D view, part ${part + 1} of ${SHARDS}`, async ({ page, browserName }, info) => {
    test.skip(!is3d(browserName) || info.project.name !== "chromium-desk", "one browser is enough for this long walk");
    test.setTimeout(process.env.CI ? 900_000 : 600_000);
    const problems = watch(page);
    await page.goto(URL);
    const hero = page.locator("hako-device#hero");
    await hero.scrollIntoViewIfNeeded();
    for (const { key } of DEVICES.filter((_, index) => index % SHARDS === part)) {
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
}

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

type Bar = HTMLElement & { pause(): void; set(next: object): void; state: { yaw: number; tilt: number; zoom: number } };

test("the family's view controls turn, tip, zoom and move the device, and another device keeps the view", async ({ page, browserName }, info) => {
  test.skip(!is3d(browserName) || info.project.name !== "chromium-desk");
  const problems = watch(page);
  await page.goto(URL);
  const hero = page.locator("hako-device#hero");
  const bar = page.locator('[data-testid="view-bar"]');
  await expect(hero).toHaveAttribute("data-view", "3d", { timeout: 90_000 });
  await bar.evaluate((node) => (node as Bar).pause());
  await expect(hero).toHaveAttribute("data-driven", "true");
  const canvas = (name: string) => hero.evaluate((node, n) => node.shadowRoot?.querySelector("canvas")?.dataset[n] ?? "", name);
  const azimuth = async () => Number(await canvas("azimuth"));
  const before = await azimuth();
  await bar.evaluate((node) => (node as Bar).set({ yaw: 60, tilt: 10, zoom: 2.5 }));
  // The view writes its angle when it draws a frame, which can be slow on a busy machine or with no graphics card: wait for the turn, not for a time.
  await expect.poll(async () => Math.abs((await azimuth()) - before), { timeout: 15_000 }).toBeGreaterThan(0.5);
  await expect.poll(() => canvas("zoom")).toBe("2.50");
  await bar.evaluate((node) => (node as Bar).set({ panX: 30, panY: -20 }));
  await expect.poll(() => canvas("pan")).not.toBe("0,0");
  // its own hands stand down and the controls' take over: an arrow key turns it by the controls' step, in the controls' state and in the address
  await hero.locator("canvas").focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => bar.evaluate((node) => (node as Bar).state.yaw)).toBeCloseTo(75, 0);
  await expect.poll(() => page.url()).toMatch(/yaw=75/);
  expect(page.url()).toMatch(/zoom=2\.5/);
  await bar.evaluate((node) => (node as Bar).set({ yaw: 60 }));
  // another device keeps the view
  await page.evaluate(() => {
    const node = document.getElementById("hero") as HTMLElement;
    (window as unknown as { __old?: Element | null }).__old = node.shadowRoot?.querySelector("canvas");
    node.setAttribute("key", "pi5");
  });
  await expect
    .poll(() =>
      hero.evaluate((node) => {
        const made = node.shadowRoot?.querySelector("canvas");
        return made !== (window as unknown as { __old?: Element | null }).__old && made?.dataset.ready === "true" && node.dataset.view === "3d";
      }),
    )
    .toBe(true);
  expect(await canvas("zoom")).toBe("2.50");
  expect(await bar.evaluate((node) => (node as Bar).state.yaw)).toBeCloseTo(60, 0);
  // Front puts the turn back
  await bar.locator("button", { hasText: /^Front$/ }).click();
  await expect.poll(() => bar.evaluate((node) => (node as Bar).state.yaw)).toBeCloseTo(0, 0);
  expect(problems).toEqual([]);
});

test("the flat drawing, with no WebGL, still zooms and moves", async ({ page }) => {
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
  const bar = page.locator('[data-testid="view-bar"]');
  await expect(hero).toHaveAttribute("data-why", "no-webgl");
  await expect(bar).toHaveAttribute("flat", "");
  await bar.evaluate((node) => (node as Bar).set({ zoom: 3 }));
  const drawing = () => hero.evaluate((node) => ({ zoom: node.shadowRoot?.querySelector<HTMLElement>(".drawing")?.dataset.zoom, transform: node.shadowRoot?.querySelector<HTMLElement>(".drawing")?.style.transform }));
  await expect.poll(drawing).toMatchObject({ zoom: "3.00", transform: expect.stringContaining("scale(3)") });
  expect(problems).toEqual([]);
});

test("a device opened by its old address still opens, and the view in the address is read beside it", async ({ page, browserName }, info) => {
  test.skip(!is3d(browserName) || info.project.name !== "chromium-desk");
  test.setTimeout(240_000);
  const problems = watch(page);
  const dialog = page.locator('[data-testid="device-dialog"]');
  for (const [address, attribute, value] of [
    ["#pi4", "key", "pi4"],
    ["#part:armor", "part", "armor"],
    ["?yaw=30&tilt=8&zoom=2#pi4", "key", "pi4"],
  ] as const) {
    await page.goto(`${URL}${address}`, { waitUntil: "domcontentloaded" });
    await expect(dialog).toBeVisible({ timeout: 60_000 });
    await expect(dialog.locator('[data-testid="dialog-device"]')).toHaveAttribute(attribute, value);
    // the dialog has its own view controls, and they drive its device
    await expect(dialog.locator('[data-testid="dialog-view-bar"]')).toBeVisible();
    await expect(dialog.locator('[data-testid="dialog-device"]')).toHaveAttribute("data-driven", "true");
  }
  // the page's own bar opened at what the address said, and closing the dialog keeps it
  const bar = page.locator('[data-testid="view-bar"]');
  await expect.poll(() => bar.evaluate((node) => (node as Bar).state.yaw)).toBeCloseTo(30, 0);
  expect(await bar.evaluate((node) => (node as Bar).state.zoom)).toBeCloseTo(2, 1);
  await page.locator('[data-testid="dialog-close"]').click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => page.url()).not.toContain("#");
  expect(page.url()).toMatch(/\?.*yaw=30/);
  expect(problems).toEqual([]);
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
  for (const key of ["pi-zero-bare", "nas-2bay"]) {
    expect(by(key).maxLine).toBeGreaterThanOrEqual(1.6);
    expect(by(key).maxLine).toBeLessThanOrEqual(2.4);
  }
  // and as drawn: a tiny board's outline and a big box's are the same number of pixels on screen
  const drawn = await page.evaluate(() => {
    const host = document.querySelector('[data-testid="lineup"]') as HTMLElement;
    const out: Record<string, { ctm: number; width: number }> = {};
    for (const device of host.shadowRoot?.querySelectorAll("hako-device") ?? []) {
      const line = device.shadowRoot?.querySelector("[vector-effect='non-scaling-stroke'][stroke-width='1.6']") as SVGGraphicsElement | null;
      const key = device.getAttribute("key") ?? "";
      if (line) out[key] = { ctm: line.getScreenCTM()?.a ?? 0, width: Number(line.getAttribute("stroke-width")) };
    }
    return out;
  });
  expect(drawn["pi-zero-bare"].width).toBe(drawn["nas-2bay"].width);
  // the two are drawn at very different scales, so a scaling line would differ by that much
  expect(Math.abs(drawn["nas-2bay"].ctm / drawn["pi-zero-bare"].ctm)).toBeGreaterThan(2);
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

test("a from and to year narrow the gallery and clear", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await page.locator('[data-testid="filter-all"]').click();
  await page.locator('[data-testid="year-to"]').fill("1985");
  const expected = catalogue().filter((entry) => inYears(entry.key, { to: 1985 }));
  expect(expected.length).toBeGreaterThan(10);
  await expect(page.locator('[data-testid="gallery-count"]')).toContainText(`${expected.length} of`);
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(expected.length);
  await page.locator('[data-testid="year-from"]').fill("1984");
  await expect(page.locator('[data-testid="gallery-count"]')).toContainText(`${expected.filter((entry) => inYears(entry.key, { from: 1984 })).length} of`);
  await page.locator('[data-testid="year-from"]').fill("");
  await page.locator('[data-testid="year-to"]').fill("");
  await expect(page.locator('[data-testid="gallery-count"]')).toContainText("built");
  expect(problems).toEqual([]);
});

test("filters by brand, CPU maker and decade narrow the whole catalogue, and clear", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await page.locator('[data-testid="filter-all"]').click();
  await page.locator('[data-testid="gallery-filters"] > summary').click();
  const open = (facet: string) => page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"] summary`).click();
  const chip = (facet: string, value: string) => page.locator(`[data-testid="facet-chip"][data-facet="${facet}"][data-value="${value}"]`);
  await open("maker");
  await chip("maker", "Apple").click();
  await open("cpuMaker");
  await chip("cpuMaker", "Motorola").click();
  const picks = { maker: ["Apple"], cpuMaker: ["Motorola"] };
  const expected = catalogue().filter((entry) => matchesPicks(entry.key, picks));
  expect(expected.length).toBeGreaterThan(10);
  await expect(page.locator('[data-testid="gallery-count"]')).toContainText(`${expected.length} of`);
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(expected.length);
  await expect(chip("maker", "Apple")).toHaveAttribute("aria-pressed", "true");
  // another brand stays on offer, so a second can be added
  await expect(chip("maker", "Raspberry Pi")).toHaveCount(0);
  await page.locator('[data-testid="facet-clear"]').click();
  await expect(page.locator('[data-testid="facet-clear"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="gallery-count"]')).toContainText("built");
  // the filters stay open after a clear
  await open("type");
  await chip("type", "Single-board computer").click();
  await expect(page.locator('[data-testid="tile"][data-key="rpi-zero"]')).toContainText("Raspberry Pi Zero");
  expect(problems).toEqual([]);
});

test("the filters offer operating system, wireless, weight, colour and discontinued year", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await page.locator('[data-testid="filter-all"]').click();
  await page.locator('[data-testid="gallery-filters"] > summary').click();
  const picks: Picks = { os: ["Mac OS X"], wireless: ["Wi-Fi"], weight: ["3 to 10 kg"], colour: ["Black"], discontinued: ["2014"] };
  for (const [facet, values] of Object.entries(picks)) {
    await expect(page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"]`)).toHaveCount(1);
    await page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"] summary`).click();
    for (const value of values) await expect(page.locator(`[data-testid="facet-chip"][data-facet="${facet}"][data-value="${value}"]`)).toHaveCount(1);
  }
  for (const facet of ["os", "wireless"] as const) {
    const value = picks[facet]?.[0] ?? "";
    await page.locator(`[data-testid="facet-chip"][data-facet="${facet}"][data-value="${value}"]`).click();
  }
  const expected = catalogue().filter((entry) => matchesPicks(entry.key, { os: picks.os, wireless: picks.wireless }));
  expect(expected.length).toBeGreaterThan(5);
  await expect(page.locator('[data-testid="gallery-count"]')).toContainText(`${expected.length} of`);
  expect(problems).toEqual([]);
});

test("a tile opens one device large; Close and Back take it away", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await page.locator('[data-testid="gallery-card"][data-group="pi-boards"]').click();
  await page.locator('[data-testid="tile"][data-key="pi4"]').click();
  const dialog = page.locator('[data-testid="device-dialog"]');
  await expect(dialog).toBeVisible({ timeout: 20_000 });
  await expect(dialog.locator('[data-testid="dialog-device"]')).toHaveAttribute("key", "pi4");
  await expect(dialog).toContainText("85 by 56 by 17 mm");
  await page.locator('[data-testid="dialog-close"]').click();
  await expect(dialog).toBeHidden();
  await page.locator('[data-testid="group-back"]').click();
  await page.locator('[data-testid="gallery-card"][data-group="parts"]').click();
  await page.locator('[data-testid="part-tile"][data-key="armor"]').click();
  await expect(dialog.locator('[data-testid="dialog-device"]')).toHaveAttribute("part", "armor");
  expect(problems).toEqual([]);
});

test("no sideways scroll at a phone's width", async ({ page }, info) => {
  test.skip(info.project.name === "chromium-desk");
  await page.goto(URL);
  await expect(page.locator('[data-testid="gallery-card"]').first()).toBeVisible();
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

test("the copy panel matches the device on screen, and the embed page draws its address", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const problems = watch(page);
  await page.goto(URL);
  const code = page.locator('[data-testid="embed-code"]');
  await expect(code).toContainText("hako-device");
  await expect(code).toContainText('key="pi4-pitft"');
  await page.locator("#hero-chips button").nth(2).click();
  await expect(code).toContainText('key="pi-zero"');
  await page.locator('[data-testid="tab-iframe"]').click();
  await expect(code).toContainText("embed.html");
  await expect(code).toContainText("pi-zero");
  await page.locator('[data-testid="embed-copy"]').click();
  await expect(page.locator("#embed-status")).toHaveText("Copied");
  await page.goto(`${URL}embed.html?key=mac-studio&drawing-style=thick&spin=off`);
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
  await expect(page.locator('[data-testid="device"]')).toHaveAttribute("key", "mac-studio");
  await expect(page.locator('[data-testid="device"]')).toHaveAttribute("drawing-style", "thick");
  expect(problems).toEqual([]);
});

test("the React wrapper draws the element", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}react-check.html`);
  const device = page.locator("hako-device#react-device");
  await expect(device).toHaveAttribute("device", "pi4");
  await expect(device.locator("img")).toHaveAttribute("src", /pi4\.svg$/);
  expect(problems).toEqual([]);
});

test("a machine's colours: a drawn colour switches, one with none says so and tints the body or does nothing", async ({ page }) => {
  await page.goto("/hako-devices/");
  const hero = page.getByTestId("hero-device");
  await expect(page.locator("#hero-colours").getByTestId("colour-note")).toContainText("nobody has checked");
  await page.locator('#hero-chips button[data-key="macbook-pro-14"]').click();
  const row = page.locator("#hero-colours").getByTestId("colour-row");
  const chip = (name: string) => row.locator(`[data-colour="${name}"]`);
  await expect(chip("Space Black")).toHaveAttribute("aria-pressed", "true");
  await expect(chip("Space Gray")).toContainText("no drawing");
  await expect(chip("Silver")).not.toContainText("no drawing");

  await chip("Silver").click();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14-silver");
  await expect(hero).not.toHaveAttribute("body-colour");
  await expect(row.getByTestId("colour-note")).toContainText("has a drawing of its own");
  await expect(row.getByRole("link", { name: "Where this comes from" })).toHaveAttribute("href", /support\.apple\.com/);

  await chip("Space Gray").click();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14");
  await expect(hero).toHaveAttribute("body-colour", /^#[0-9a-f]{6}$/);
  await expect(row.getByTestId("colour-note")).toContainText("no drawing of its own");
  await expect(row.getByTestId("colour-note")).toContainText("not the maker's paint");

  await page.locator('#hero-chips button[data-key="pi5"]').click();
  await expect(hero).not.toHaveAttribute("body-colour");
  await expect(page.locator("#hero-colours").getByTestId("colour-note")).toContainText("nobody has checked");
});

test("a colour with no value says only its name, and a covered machine switches to its finish's mesh", async ({ page }) => {
  await page.goto("/hako-devices/#macbook-air-m2-2022");
  const box = page.locator("#dialog-colours");
  await expect(box.locator('[data-colour="Midnight"]')).toHaveAttribute("aria-pressed", "true");
  await box.locator('[data-colour="Starlight"]').click();
  await expect(box.getByTestId("colour-note")).toContainText("only its name");
  await expect(page.getByTestId("dialog-device")).not.toHaveAttribute("body-colour");
  await box.locator('[data-colour="Silver"]').click();
  await expect(page.getByTestId("dialog-device")).toHaveAttribute("key", "macbook-air-13-silver");
});
