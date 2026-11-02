// The demo in a real browser: no console or policy error, the gallery, the styles, the builder, the lineup, the live screen, and every device reaching its 3D view.
import { expect, type Page, test } from "@playwright/test";
import { allItems, drawingKey, itemById } from "../demo/gallery-model.ts";
import { DEVICES } from "../src/catalogue.ts";
import { catalogue, catalogueCounts, COVERED, PLANNED } from "../src/index.ts";
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

const kindRow = (page: Page, id: string) => page.locator(`[data-testid="gallery-card"][data-group="${id}"]`);
const tileOf = (page: Page, key: string) => page.locator(`[data-testid="tile"][data-key="${key}"]`);
const count = (page: Page) => page.locator('[data-testid="gallery-count"]');
/** A small PC, and the family it sits in. */
const PC = allItems().filter((item) => item.kind === "pcs" && item.family !== null)[3] as { key: string; family: string };

test("the gallery opens on a few machines beside the kinds, one click from any kind's machines", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  const counts = catalogueCounts();
  expect(counts.total).toBeGreaterThan(1000);
  await expect(count(page)).toHaveText(`${counts.built} of ${counts.total} built`);
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(10);
  for (const family of ["pi-boards", "pi-dressed", "desktops", "laptops", "tablets-phones", "pcs", "nas", "classics", "clients", "parts"]) await expect(kindRow(page, family)).toBeAttached();
  expect(await kindRow(page, "pi-boards").locator("img").count()).toBeGreaterThan(1);
  await kindRow(page, "pi-boards").click();
  await expect(tileOf(page, "rpi-zero")).toContainText("Raspberry Pi Zero");
  await expect(tileOf(page, "nas-rack")).toHaveCount(0);
  await kindRow(page, "parts").click();
  await expect(page.locator('[data-testid="part-tile"]').first()).toBeVisible();
  // every machine still to come is on a shelf
  await page.locator('[data-testid="filter-planned"]').click();
  const shelved = await page.locator('[data-testid="gallery-card"][data-shelf]').evaluateAll((nodes) => nodes.filter((node) => !(node as HTMLElement).hidden).map((node) => Number((node as HTMLElement).dataset.count)));
  expect(shelved.reduce((sum, one) => sum + one, 0)).toBe(counts.planned);
  const first = PLANNED.find((entry) => entry.shelf === "consoles" && entry.family === "DS") ?? PLANNED[0];
  const item = itemById(first.key);
  await kindRow(page, first.shelf).click();
  await page.locator(`[data-testid="gallery-family"][data-family="${item?.family}"]`).click();
  await expect(tileOf(page, first.key)).toContainText(first.name);
  await expect(tileOf(page, first.key)).toContainText("Coming soon");
  // one picture for every machine still to come
  const sources = await page.evaluate(() => new Set([...document.querySelectorAll<HTMLImageElement>('[data-status="planned"] img')].map((image) => image.getAttribute("src"))).size);
  expect(sources).toBe(1);
  // and a machine with no shape yet still opens, as that one picture under its own name
  await tileOf(page, first.key).click();
  await expect(page.locator("hako-device#hero")).toHaveAttribute("data-view", "planned");
  await expect(page.locator('[data-testid="device-name"]')).toHaveText(first.name);
  await expect(page.locator('[data-testid="device-status"]')).toHaveText("Coming soon");
  await page.locator('[data-testid="filter-built"]').click();
  // the search looks through everything, under its other names too
  await page.locator('[data-testid="gallery-search"]').fill("rack nas");
  await expect(tileOf(page, "nas-rack")).toBeVisible();
  await page.locator('[data-testid="gallery-search"]').fill("trash-can");
  await expect(tileOf(page, "mac-pro-late-2013")).toBeVisible();
  await page.locator('[data-testid="gallery-search"]').fill("nothing has this name");
  await expect(page.locator('[data-testid="tile"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="gallery-models"]')).toContainText("Nothing matches.");
  expect(problems).toEqual([]);
});

test("every machine and part can be reached: a kind, a family, a machine", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desk", "one browser is enough for this long walk");
  test.setTimeout(240_000);
  const problems = watch(page);
  await page.goto(`${URL}?show=all`);
  // walked in the page itself, because there are hundreds of families: real clicks on the real buttons, and a real scroll for the machines drawn only when scrolled to
  const reached = await page.evaluate(async () => {
    const all = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];
    const seen: { key: string; part: boolean; kind: string; family: string }[] = [];
    const collect = async (kind: string, family: string) => {
      const scroller = document.querySelector('[data-testid="gallery-models"]') as HTMLElement;
      const total = Number(scroller.dataset.total);
      for (let round = 0; round < 200 && all("#gallery-tiles button").length < total; round++) {
        scroller.scrollTo(0, scroller.scrollHeight);
        await new Promise((done) => setTimeout(done, 30));
      }
      for (const tile of all("#gallery-tiles button")) seen.push({ key: tile.dataset.key ?? "", part: tile.dataset.testid === "part-tile", kind, family });
    };
    for (const row of all('[data-testid="gallery-card"]')) {
      const kind = row.dataset.group ?? "";
      if (kind === "start") continue;
      row.click();
      const families = all('[data-testid="gallery-family"]').map((chip) => chip.dataset.family ?? "");
      if (families.length === 0) await collect(kind, "");
      for (const family of families) {
        document.querySelector<HTMLElement>(`[data-testid="gallery-family"][data-family="${CSS.escape(family)}"]`)?.click();
        await collect(kind, family);
      }
    }
    return seen;
  });
  const key = (one: { key: string; part: boolean }) => `${one.part ? "part:" : ""}${one.key}`;
  // each exactly once, under the kind and family it belongs to
  expect(reached.map(key).sort()).toEqual(allItems().map((item) => item.id).sort());
  for (const one of reached) {
    const item = itemById(key(one));
    expect(one.family, item?.id).toBe(item?.family ?? "");
  }
  expect(problems).toEqual([]);
});

test("a PC takes three clicks, and it and its options are on the screen together", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await kindRow(page, "pcs").click();
  await page.locator(`[data-testid="gallery-family"][data-family="${PC.family}"]`).click();
  const tower = page.locator(`[data-testid="tile"][data-key="${PC.key}"]`);
  const key = PC.key;
  await tower.click();
  await expect(page.locator("hako-device#hero")).toHaveAttribute("key", key);
  await expect(page.locator('[data-testid="device-facts"]')).toContainText(key);
  await expect(page.locator('[data-testid="embed-code"]')).toContainText(`key="${key}"`);
  expect(problems).toEqual([]);
});

test("every drawing the gallery can ask for loads, in thin and in thick, and the tiles change with the choice", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  // each drawing once: a tile is drawn only when it is scrolled to, so asking for them is the whole check
  const files = [...new Set(allItems().flatMap((item) => (drawingKey(item) ? [`assets/${item.part ? "parts/" : ""}${drawingKey(item)}.svg`, `assets/${item.part ? "parts/" : ""}${drawingKey(item)}.thick.svg`] : [])))];
  expect(files.length).toBeGreaterThan(300);
  const bad = await page.evaluate(async (list) => {
    const failed: string[] = [];
    for (let at = 0; at < list.length; at += 40) {
      await Promise.all(
        list.slice(at, at + 40).map(async (file) => {
          if (!(await fetch(file)).ok) failed.push(file);
        }),
      );
    }
    return failed;
  }, files);
  expect(bad).toEqual([]);
  const loaded = async () =>
    page.evaluate(async () => {
      const images = [...document.querySelectorAll<HTMLImageElement>("#gallery-tiles img")];
      for (const image of images) image.loading = "eager";
      await Promise.all(images.map((image) => image.decode().catch(() => null)));
      return { total: images.length, bad: images.filter((image) => image.naturalWidth === 0).map((image) => image.src), thick: images.filter((image) => image.src.endsWith(".thick.svg")).length };
    });
  await kindRow(page, "desktops").click();
  const thin = await loaded();
  expect(thin.bad).toEqual([]);
  expect(thin.total).toBeGreaterThan(5);
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

test.describe("on a desk", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the page stays inside the window, whatever is open, and nothing folds", async ({ page }, info) => {
    test.skip(info.project.name !== "chromium-desk");
    const problems = watch(page);
    await page.goto(URL);
    const fits = async (where: string) => {
      const sizes = await page.evaluate(() => ({ page: document.documentElement.scrollHeight, window: innerHeight, sideways: document.documentElement.scrollWidth - innerWidth, folds: document.querySelectorAll("details, summary").length }));
      expect(sizes.page, where).toBeLessThanOrEqual(sizes.window);
      expect(sizes.sideways, where).toBeLessThanOrEqual(0);
      expect(sizes.folds, where).toBe(0);
    };
    const onScreen = async (selector: string, where: string) => {
      const box = await page.locator(selector).boundingBox();
      expect(box, where).not.toBeNull();
      if (box) expect(box.y + box.height, `${where}: ${selector}`).toBeLessThanOrEqual(900);
    };
    await fits("the first screen");
    // the longest lists there are: the longest kind, every machine, and each filter
    await kindRow(page, "mini-pcs").click();
    await fits("the longest kind");
    await page.locator('[data-testid="filter-all"]').click();
    await kindRow(page, "phones").click();
    await fits("the most families");
    await page.locator('[data-testid="tile"]').first().click();
    await fits("a machine chosen");
    await page.locator('[data-testid="filter-built"]').click();
    await kindRow(page, "laptops").click();
    await tileOf(page, "macbook-pro-14").click();
    for (const part of ["hako-device#hero", '[data-testid="view-bar"]', '[data-testid="device-options"]', '[data-testid="device-facts"]', '[data-testid="embed-copy"]', '[data-testid="tile"][aria-pressed="true"]']) await onScreen(part, "a machine and its options");
    await page.locator('[data-testid="gallery-filters"]').click();
    await fits("the filters");
    for (const box of ["year-from", "year-to"]) await onScreen(`[data-testid="${box}"]`, "the filters");
    for (const facet of ["maker", "cpu", "ram", "generation"]) {
      await page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"]`).click();
      await fits(`the filter ${facet}`);
    }
    await page.locator('[data-testid="gallery-kinds"]').click();
    for (const view of ["builder", "lineup", "screen"]) {
      await page.locator(`.links a[data-view="${view}"]`).click();
      await expect(page.locator(`#${view}`)).toBeVisible();
      await fits(`the view ${view}`);
    }
    expect(problems).toEqual([]);
  });
});

test("only the one device on show is a live view: tiles and rows are drawings", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await kindRow(page, "tablets-phones").click();
  const live = () => page.evaluate(() => ({ devices: document.querySelectorAll("hako-device").length, canvases: document.querySelectorAll("canvas").length, hero: document.getElementById("hero")?.shadowRoot?.querySelectorAll("canvas").length ?? 0 }));
  expect(await live()).toMatchObject({ devices: 1, canvases: 0 });
  // leaving the gallery gives the other views' devices a place, and coming back takes them away
  await page.locator('.links a[data-view="builder"]').click();
  await expect(page.locator('[data-testid="builder-device"]')).toBeAttached();
  await page.locator('.links a[data-view="screen"]').click();
  await expect(page.locator('[data-testid="builder-device"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="screen-device"]')).toBeAttached();
  await page.locator('.links a[data-view="gallery"]').click();
  expect(await live()).toMatchObject({ devices: 1, canvases: 0 });
  expect(problems).toEqual([]);
});

test("the address keeps the choice: reload and Back do what you expect", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await kindRow(page, "pcs").click();
  await page.locator(`[data-testid="gallery-family"][data-family="${PC.family}"]`).click();
  const key = PC.key;
  await page.locator(`[data-testid="tile"][data-key="${key}"]`).click();
  await expect(page).toHaveURL(new RegExp(`kind=pcs.*family=.*#${key}$`));
  const pressed = (node: string) => expect(page.locator(node)).toHaveAttribute("aria-pressed", "true");
  const hero = page.locator("hako-device#hero");
  await page.reload();
  await expect(hero).toHaveAttribute("key", key);
  await pressed(`[data-testid="tile"][data-key="${key}"]`);
  await pressed('[data-testid="gallery-card"][data-group="pcs"]');
  await pressed(`[data-testid="gallery-family"][data-family="${PC.family}"]`);
  // a step along the row is a step back
  await page.goBack();
  await expect(hero).not.toHaveAttribute("key", key);
  await pressed(`[data-testid="gallery-family"][data-family="${PC.family}"]`);
  await page.goBack();
  await pressed('[data-testid="gallery-family-all"]');
  await page.goBack();
  await pressed('[data-testid="gallery-card"][data-group="start"]');
  await page.goForward();
  await pressed('[data-testid="gallery-card"][data-group="pcs"]');
  // a machine's own address finds its kind and family by itself
  await page.goto(`${URL}#macbook-pro-14`);
  await pressed('[data-testid="gallery-card"][data-group="laptops"]');
  await pressed('[data-testid="tile"][data-key="macbook-pro-14"]');
  // a search, the filters and the styles stay too, without an entry for each: the address is written a moment after the last change
  await page.goto(URL);
  await page.locator('[data-testid="filter-all"]').click();
  await page.locator('[data-testid="style-thick"]').click();
  await page.locator('[data-testid="gallery-search"]').fill("nintendo");
  await page.locator('[data-testid="gallery-filters"]').click();
  await page.locator('[data-testid="gallery-facet"][data-facet="type"]').click();
  await page.locator('[data-testid="facet-chip"][data-value="Home console"]').click();
  await expect(page).toHaveURL(/show=all/);
  await expect(page).toHaveURL(/style=thick/);
  await expect(page).toHaveURL(/q=nintendo/);
  await expect(page).toHaveURL(/f-type=Home/);
  const before = await count(page).textContent();
  await page.reload();
  await expect(page.locator('[data-testid="gallery-search"]')).toHaveValue("nintendo");
  await expect(count(page)).toHaveText(before ?? "");
  await pressed('[data-testid="facet-chip"][data-value="Home console"]');
  await pressed('[data-testid="style-thick"]');
  // the sections have addresses of their own
  await page.goto(`${URL}#lineup`);
  await expect(page.locator('[data-testid="lineup"]')).toBeVisible();
  await expect(page.locator("#gallery")).toBeHidden();
  expect(problems).toEqual([]);
});

test("the keyboard walks each row with the arrows, and each row is one Tab stop", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desk");
  const problems = watch(page);
  await page.goto(URL);
  const active = () => page.evaluate(() => { const node = document.activeElement as HTMLElement; return { group: node.dataset.group, key: node.dataset.key, family: node.dataset.family, testid: node.dataset.testid }; });
  await kindRow(page, "start").focus();
  await page.keyboard.press("ArrowDown");
  expect((await active()).group).toBe("pi-boards");
  await page.keyboard.press("End");
  expect((await active()).group).toBe("parts");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  expect((await active()).group).toBe("desktops");
  await page.keyboard.press("Enter");
  await expect(kindRow(page, "desktops")).toHaveAttribute("aria-pressed", "true");
  // one Tab from the row of kinds lands in the families, and one more in the machines
  await page.keyboard.press("Tab");
  expect((await active()).testid).toMatch(/^gallery-family/);
  await page.keyboard.press("Tab");
  const first = await active();
  expect(first.testid).toBe("tile");
  const firstKey = first.key;
  await page.keyboard.press("ArrowRight");
  expect((await active()).key).not.toBe(firstKey);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press(" ");
  const shown = (await active()).key ?? "";
  await expect(page.locator("hako-device#hero")).toHaveAttribute("key", shown);
  expect(problems).toEqual([]);
});

/** A phone widens its layout to fit what overflows, so the page's own width says nothing: this measures against the screen. */
const sideways = (page: Page) => page.evaluate(() => ({ layout: innerWidth - visualViewport!.width, page: document.documentElement.scrollWidth - visualViewport!.width }));

test("a finger reaches a machine, and nothing scrolls the page sideways", async ({ page }, info) => {
  test.skip(info.project.name === "chromium-desk");
  const problems = watch(page);
  await page.goto(URL);
  // on a phone each row scrolls sideways inside itself
  const row = kindRow(page, "laptops");
  await row.scrollIntoViewIfNeeded();
  await row.tap();
  await tileOf(page, "macbook-pro-14").tap();
  await expect(page.locator("hako-device#hero")).toHaveAttribute("key", "macbook-pro-14");
  await expect(page.locator("hako-device#hero")).toBeInViewport();
  // the longest rows there are, each in turn
  for (const address of ["", "?kind=phones&show=all", "?kind=apple", "?pane=filters&facet=cpu", "#macbook-pro-14", "#builder", "#lineup", "#screen"]) {
    await page.goto(`${URL}${address}`);
    await expect(page.locator(".links")).toBeVisible();
    await page.waitForTimeout(300);
    expect(await sideways(page), address).toEqual({ layout: 0, page: 0 });
  }
  // the first screen holds the device, the search, the kinds and the first machines
  await page.goto(URL);
  for (const part of ['[data-testid="hero-device"]', '[data-testid="gallery-search"]', '[data-testid="gallery-card"][data-group="start"]', '[data-testid="tile"]']) await expect(page.locator(part).first()).toBeInViewport();
  expect(problems).toEqual([]);
});

test("the options change the device and the code to copy", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}#pi5`);
  const hero = page.locator("hako-device#hero");
  const code = page.locator('[data-testid="embed-code"]');
  await page.locator('[data-testid="option-look-drawing"]').click();
  await expect(hero).toHaveAttribute("mode", "drawing");
  await expect(code).toContainText('mode="drawing"');
  await page.locator('[data-testid="option-ground-off"]').click();
  await expect(hero).toHaveAttribute("no-ground", "");
  await expect(code).toContainText("no-ground");
  await page.locator('[data-testid="style-thick"]').click();
  await expect(hero).toHaveAttribute("drawing-style", "thick");
  await expect(code).toContainText('drawing-style="thick"');
  // a covered machine's drawing is its mesh's
  await page.goto(`${URL}#${COVERED[0].key}`);
  await page.locator('[data-testid="tab-svg"]').click();
  await expect(code).toContainText("<svg");
  await expect(code).not.toContainText("Coming soon");
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
  // Front puts the turn back; it is behind More
  await bar.locator('[data-b="more"]').click();
  await bar.locator('[data-b="front"]').click();
  await expect.poll(() => bar.evaluate((node) => (node as Bar).state.yaw)).toBeCloseTo(0, 0);
  expect(problems).toEqual([]);
});

test("the bar shows one true zoom number, and More holds tilt, Front and moving it", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  const bar = page.locator('[data-testid="view-bar"]');
  const number = bar.locator('[data-b="level"]');
  const zoom = () => bar.evaluate((node) => (node as Bar).state.zoom);
  await expect(number).toHaveText("1×");
  // no preset that reads like a second number
  await expect(bar.locator('[data-b="two"]')).toHaveCount(0);
  await expect(bar.locator('[data-b="in"]')).toBeVisible();
  // the number follows the buttons, the page's own call and the address
  await bar.locator('[data-b="in"]').click();
  await expect.poll(zoom).toBeGreaterThan(1);
  await expect(number).toHaveText(`${Math.round((await zoom()) * 10) / 10}×`);
  await bar.evaluate((node) => (node as Bar).set({ zoom: 2.5 }));
  await expect(number).toHaveText("2.5×");
  await expect.poll(() => page.url()).toMatch(/zoom=2\.5/);
  await page.reload();
  await expect(number).toHaveText("2.5×");
  // pressing it goes back to the whole device
  await number.click();
  await expect(number).toHaveText("1×");
  // the rest is one press away, and the angle is there without it
  const angle = bar.locator("#yaw");
  const tilt = bar.locator("#tilt");
  const front = bar.locator('[data-b="front"]');
  await expect(angle).toBeVisible();
  await expect(tilt).toBeHidden();
  await expect(front).toBeHidden();
  await bar.locator('[data-b="more"]').click();
  await expect(tilt).toBeVisible();
  await expect(front).toBeVisible();
  // the buttons that move it come once there is room to move it
  await bar.evaluate((node) => (node as Bar).set({ zoom: 2 }));
  await expect(bar.locator('[data-b="left"]')).toBeVisible();
  await bar.locator('[data-b="more"]').click();
  await expect(tilt).toBeHidden();
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
  const hero = page.locator("hako-device#hero");
  for (const [address, attribute, value] of [
    ["#pi4", "key", "pi4"],
    ["#part:armor", "part", "armor"],
    ["?yaw=30&tilt=8&zoom=2#pi4", "key", "pi4"],
  ] as const) {
    await page.goto(`${URL}${address}`, { waitUntil: "domcontentloaded" });
    await expect(hero).toHaveAttribute(attribute, value, { timeout: 60_000 });
    await expect(page.locator('[data-testid="view-bar"]')).toBeVisible();
    await expect(hero).toHaveAttribute("data-driven", "true");
  }
  // the bar opened at what the address said, and another machine keeps it
  const bar = page.locator('[data-testid="view-bar"]');
  await expect.poll(() => bar.evaluate((node) => (node as Bar).state.yaw)).toBeCloseTo(30, 0);
  expect(await bar.evaluate((node) => (node as Bar).state.zoom)).toBeCloseTo(2, 1);
  await kindRow(page, "start").click();
  await tileOf(page, "pi5").click();
  await expect(hero).toHaveAttribute("key", "pi5");
  expect(page.url()).toMatch(/\?.*yaw=30/);
  expect(problems).toEqual([]);
});

const pick = (page: Page, slot: string, value: string) => page.locator(`[data-testid="pick-option"][data-slot="${slot}"][data-value="${value}"]`);
const noFaults = async (page: Page) => {
  await expect(page.locator('[data-testid="builder-issues"] [data-level="error"]')).toHaveCount(0);
  await expect(page.locator("#builder")).not.toContainText("does not go together");
};
/** What the builder's code says, and what its device was given: the same, always. */
const built = (page: Page) =>
  page.evaluate(() => ({
    code: JSON.parse(/build='(.*)'/.exec(document.querySelector('[data-testid="builder-code"]')?.textContent ?? "")?.[1] ?? "{}") as Record<string, unknown>,
    shown: (document.querySelector('[data-testid="builder-device"]') as HTMLElement & { description: Record<string, unknown> }).description,
  }));

test("the builder keeps it working: pick anything, and the other parts change to ones that fit", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}#builder`);
  const changed = page.locator('[data-testid="builder-changed"]');
  await expect(page.locator('[data-testid="builder-issues"]')).toBeVisible();
  // a closed case under a hat: the case was just chosen, so the hat goes, and one quiet line says so
  await pick(page, "case", "argon").click();
  await expect(pick(page, "case", "argon")).toHaveAttribute("aria-pressed", "true");
  await expect(pick(page, "hat", "")).toHaveAttribute("aria-pressed", "true");
  await expect(changed).toHaveText(/^Changed to fit: the hat is off\.$/);
  await noFaults(page);
  // a new board: another case that fits it
  await pick(page, "board", "pi-zero-2w").click();
  await expect(pick(page, "case", "unipi")).toHaveAttribute("aria-pressed", "true");
  await expect(changed).toContainText("case is now");
  await expect(page.locator('[data-testid="builder-code"]')).toContainText('"case":"unipi"');
  await noFaults(page);
  // a hat on bare holes: the header is the one answer, so it is soldered without asking, and the closed case goes
  await pick(page, "hat", "oled-bonnet").click();
  await expect(page.locator('[data-testid="pick-solder"]')).toBeChecked();
  await expect(page.locator('[data-testid="pick-solder"]')).toBeDisabled();
  await expect(changed).toContainText("the header is soldered on");
  await noFaults(page);
  // and no hat, no need: it comes off again
  await pick(page, "hat", "").click();
  await expect(page.locator('[data-testid="pick-solder"]')).not.toBeChecked();
  // a module for a display header brings the one hat that has one
  await pick(page, "board", "pi4").click();
  await pick(page, "screen", "oled-module").click();
  await expect(pick(page, "hat", "proto-hat")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="builder-device"]')).toHaveAttribute("data-view", /picture|loading|3d/);
  expect(problems).toEqual([]);
});

test("a hat past the board's edge is a fact said quietly, with no alarm colour", async ({ page }) => {
  await page.goto(`${URL}#builder`);
  await pick(page, "board", "pi-zero-2w").click();
  await pick(page, "hat", "pitft-28").click();
  const fact = page.locator('[data-testid="builder-issues"] [data-code="hat-overhangs"]');
  await expect(fact).toContainText("past the edge");
  const colour = await fact.evaluate((node) => getComputedStyle(node).color);
  expect(colour).toBe(await page.locator('[data-testid="builder-size"]').evaluate((node) => getComputedStyle(node).color));
});

test("only what fits: what cannot work is greyed with its reason and cannot be chosen", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}#builder`);
  await page.locator('[data-testid="builder-way-fits"]').click();
  await expect(page).toHaveURL(/fit=fits/);
  // the first machine has a hat on a Pi 4 in the finned case
  const closed = pick(page, "case", "argon");
  await expect(closed).toHaveAttribute("aria-disabled", "true");
  // a greyed part can still be pressed, by finger or by key, to hear why: `force` because a test tool will not press what says it is disabled
  await closed.click({ force: true });
  await expect(closed).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator('[data-testid="builder-why"]')).toContainText("closes over the header");
  await noFaults(page);
  // what fits still can be
  await pick(page, "case", "").click();
  await expect(pick(page, "case", "")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="builder-changed"]')).toHaveText("");
  // the address is written a moment after the last change
  await expect(page).toHaveURL(/parts=pi4%2C%2C/);
  await page.reload();
  await expect(page.locator('[data-testid="builder-way-fits"]')).toHaveAttribute("aria-pressed", "true");
  await expect(pick(page, "case", "")).toHaveAttribute("aria-pressed", "true");
  expect(problems).toEqual([]);
});

test("every board, case, hat, module and cooler, pressed in both ways, ends with no error and the picture of what is chosen", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desk", "one browser is enough for this walk");
  test.setTimeout(240_000);
  const problems = watch(page);
  await page.goto(`${URL}#builder`);
  for (const way of ["working", "fits"]) {
    await page.locator(`[data-testid="builder-way-${way}"]`).click();
    const options = await page.locator('[data-testid="pick-option"]').evaluateAll((nodes) => nodes.map((node) => ({ slot: (node as HTMLElement).dataset.slot ?? "", value: (node as HTMLElement).dataset.value ?? "" })));
    expect(options.length).toBeGreaterThan(20);
    for (const { slot, value } of options) {
      const option = pick(page, slot, value);
      const greyed = (await option.getAttribute("aria-disabled")) === "true";
      await option.click({ force: greyed });
      if (way === "working") await expect(option).toHaveAttribute("aria-pressed", "true");
      if (greyed) await expect(option).toHaveAttribute("aria-pressed", "false");
      await noFaults(page);
      const { code, shown } = await built(page);
      expect(shown, `${way} ${slot} ${value}`).toEqual(code);
    }
  }
  expect(problems).toEqual([]);
});

test("a hostile print stays text, in the drawing and on the page", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}#builder`);
  await pick(page, "case", "").click();
  await pick(page, "hat", "pitft-28").click();
  await page.locator('[data-testid="pick-print"]').fill('<img src=x onerror=alert(1)>');
  await page.locator('[data-testid="pick-print"]').blur();
  await page.waitForTimeout(600);
  const inserted = await page.evaluate(() => (document.querySelector('[data-testid="builder-device"]') as HTMLElement).shadowRoot?.querySelectorAll("image, img").length ?? -1);
  expect(inserted).toBe(0);
  expect(problems).toEqual([]);
});

test("the lineup is to scale, on one baseline, its lines one width", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}#lineup`);
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
  await page.goto(`${URL}#screen`);
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

test("a from and to year sit in the filters, narrow like a facet, stay in the address and clear", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  const tab = page.locator('[data-testid="gallery-filters"]');
  const from = page.locator('[data-testid="year-from"]');
  const to = page.locator('[data-testid="year-to"]');
  const models = page.locator('[data-testid="gallery-models"]');
  await expect(from).toHaveCount(0);
  await page.locator('[data-testid="filter-all"]').click();
  await tab.click();
  await expect(from).toBeVisible();
  await expect(to).toBeVisible();
  // a year half typed narrows nothing, the whole year does, and the box keeps the focus while the list changes
  await to.click();
  await page.keyboard.type("198");
  await expect(count(page)).toContainText("built");
  await expect(tab).toHaveText("Filters");
  await page.keyboard.type("5");
  const upTo = catalogue().filter((entry) => inYears(entry.key, { to: 1985 }));
  expect(upTo.length).toBeGreaterThan(10);
  await expect(count(page)).toContainText(`${upTo.length} of`);
  await expect(models).toHaveAttribute("data-total", String(upTo.length));
  await expect(tab).toHaveText("Filters: 1 on");
  await expect(to).toBeFocused();
  await expect(to).toHaveValue("1985");
  await from.fill("1984");
  const span = upTo.filter((entry) => inYears(entry.key, { from: 1984 }));
  await expect(count(page)).toContainText(`${span.length} of`);
  await expect(tab).toHaveText("Filters: 2 on");
  // it works with the facets, and they count only what it left
  const apple = page.locator('[data-testid="facet-chip"][data-facet="maker"][data-value="Apple"]');
  const both = span.filter((entry) => matchesPicks(entry.key, { maker: ["Apple"] }));
  expect(both.length).toBeGreaterThan(0);
  await expect(apple).toContainText(String(both.length));
  await apple.click();
  await expect(count(page)).toContainText(`${both.length} of`);
  await expect(tab).toHaveText("Filters: 3 on");
  // the address keeps it
  await expect(page).toHaveURL(/year-from=1984/);
  await expect(page).toHaveURL(/year-to=1985/);
  await expect(page).toHaveURL(/f-maker=Apple/);
  await page.reload();
  await expect(from).toHaveValue("1984");
  await expect(to).toHaveValue("1985");
  await expect(count(page)).toContainText(`${both.length} of`);
  await expect(tab).toHaveText("Filters: 3 on");
  await apple.click();
  // the kinds go on being narrowed, and the boxes come back as they were
  await page.locator('[data-testid="gallery-kinds"]').click();
  await expect(from).toHaveCount(0);
  await expect(count(page)).toContainText(`${span.length} of`);
  await expect(tab).toHaveText("Filters: 2 on");
  await tab.click();
  await expect(from).toHaveValue("1984");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  // an address that holds no year is no limit
  await page.goto(`${URL}?pane=filters&year-from=soon&year-to=19`);
  await expect(from).toHaveValue("");
  await expect(tab).toHaveText("Filters");
  await expect(count(page)).toContainText("built");
  // emptying a box and Clear filters both take a limit off
  await to.fill("1985");
  await to.fill("");
  await expect(tab).toHaveText("Filters");
  await to.fill("1985");
  await page.locator('[data-testid="facet-clear"]').click();
  await expect(to).toHaveValue("");
  await expect(count(page)).toContainText("built");
  await expect(page).not.toHaveURL(/year-to/);
  expect(problems).toEqual([]);
});

test("filters by brand, CPU maker and decade narrow the whole catalogue, and clear", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await page.locator('[data-testid="filter-all"]').click();
  await page.locator('[data-testid="gallery-filters"]').click();
  const open = (facet: string) => page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"]`).click();
  const chip = (facet: string, value: string) => page.locator(`[data-testid="facet-chip"][data-facet="${facet}"][data-value="${value}"]`);
  await open("maker");
  await chip("maker", "Apple").click();
  await open("cpuMaker");
  await chip("cpuMaker", "Motorola").click();
  const picks = { maker: ["Apple"], cpuMaker: ["Motorola"] };
  const expected = catalogue().filter((entry) => matchesPicks(entry.key, picks));
  expect(expected.length).toBeGreaterThan(10);
  await expect(count(page)).toContainText(`${expected.length} of`);
  await expect(page.locator('[data-testid="gallery-models"]')).toHaveAttribute("data-total", String(expected.length));
  await open("maker");
  await expect(chip("maker", "Apple")).toHaveAttribute("aria-pressed", "true");
  // another brand stays on offer only when it would show something
  await expect(chip("maker", "Raspberry Pi")).toHaveCount(0);
  await page.locator('[data-testid="facet-clear"]').click();
  await expect(page.locator('[data-testid="facet-clear"]')).toHaveCount(0);
  await expect(count(page)).toContainText("built");
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
  await page.locator('[data-testid="gallery-filters"]').click();
  const picks: Picks = { os: ["Mac OS X"], wireless: ["Wi-Fi"], weight: ["3 to 10 kg"], colour: ["Black"], discontinued: ["2014"] };
  for (const [facet, values] of Object.entries(picks)) {
    await expect(page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"]`)).toHaveCount(1);
    await page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"]`).click();
    for (const value of values) await expect(page.locator(`[data-testid="facet-chip"][data-facet="${facet}"][data-value="${value}"]`)).toHaveCount(1);
  }
  for (const facet of ["os", "wireless"] as const) {
    const value = picks[facet]?.[0] ?? "";
    await page.locator(`[data-testid="gallery-facet"][data-facet="${facet}"]`).click();
    await page.locator(`[data-testid="facet-chip"][data-facet="${facet}"][data-value="${value}"]`).click();
  }
  const expected = catalogue().filter((entry) => matchesPicks(entry.key, { os: picks.os, wireless: picks.wireless }));
  expect(expected.length).toBeGreaterThan(5);
  await expect(count(page)).toContainText(`${expected.length} of`);
  expect(problems).toEqual([]);
});

test("a tile opens one device large beside its facts; a part too", async ({ page }) => {
  const problems = watch(page);
  await page.goto(URL);
  await kindRow(page, "pi-boards").click();
  await tileOf(page, "pi4").click();
  const hero = page.locator("hako-device#hero");
  await expect(hero).toHaveAttribute("key", "pi4");
  await expect(page.locator('[data-testid="device-facts"]')).toContainText("85 by 56 by 17 mm");
  await kindRow(page, "parts").click();
  await page.locator('[data-testid="part-tile"][data-key="armor"]').click();
  await expect(hero).toHaveAttribute("part", "armor");
  await expect(hero).not.toHaveAttribute("key", /./);
  await expect(page.locator('[data-testid="embed-code"]')).toContainText('part="armor"');
  await expect(page).toHaveURL(/#part%3Aarmor$/);
  expect(problems).toEqual([]);
});

test("no sideways scroll at a phone's width", async ({ page }, info) => {
  test.skip(info.project.name === "chromium-desk");
  await page.goto(URL);
  await expect(page.locator('[data-testid="gallery-card"]').first()).toBeVisible();
  expect(await sideways(page)).toEqual({ layout: 0, page: 0 });
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
  await page.locator('[data-testid="tile"]').nth(2).click();
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
  const problems = watch(page);
  await page.goto(`${URL}#macbook-pro-14`);
  const hero = page.getByTestId("hero-device");
  const row = page.getByTestId("device-colours").getByTestId("colour-row");
  const chip = (name: string) => row.locator(`[data-colour="${name}"]`);
  await expect(chip("Space Black")).toHaveAttribute("aria-pressed", "true");
  await expect(chip("Space Gray")).toContainText("no drawing");
  await expect(chip("Silver")).not.toContainText("no drawing");

  await chip("Silver").click();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14-silver");
  await expect(hero).not.toHaveAttribute("body-colour");
  await expect(row.getByTestId("colour-note")).toContainText("has a drawing of its own");
  await expect(row.getByRole("link", { name: "Where this comes from" })).toHaveAttribute("href", /support\.apple\.com/);
  // the code to copy is for what is on the screen
  await expect(page.locator('[data-testid="embed-code"]')).toContainText('key="macbook-pro-14-silver"');

  await chip("Space Gray").click();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14");
  await expect(hero).toHaveAttribute("body-colour", /^#[0-9a-f]{6}$/);
  await expect(row.getByTestId("colour-note")).toContainText("no drawing of its own");
  await expect(row.getByTestId("colour-note")).toContainText("not the maker's paint");

  // another machine starts plain, and one nobody has checked says so
  await page.goto(`${URL}#pi5`);
  await expect(hero).not.toHaveAttribute("body-colour");
  await expect(page.getByTestId("device-colours").getByTestId("colour-note")).toContainText("nobody has checked");
  // a part has no row at all
  await page.goto(`${URL}#part:armor`);
  await expect(hero).toHaveAttribute("part", "armor");
  await expect(page.getByTestId("device-colours")).toBeHidden();
  expect(problems).toEqual([]);
});

test("the address keeps a chosen colour: reload and Back do what you expect", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}#macbook-pro-14`);
  const hero = page.getByTestId("hero-device");
  const chip = (name: string) => page.getByTestId("device-colours").locator(`[data-colour="${name}"]`);
  const pressed = (name: string) => expect(chip(name)).toHaveAttribute("aria-pressed", "true");
  await pressed("Space Black");
  await chip("Silver").click();
  await expect(page).toHaveURL(/colour=Silver.*#macbook-pro-14$/);
  await page.reload();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14-silver");
  await pressed("Silver");
  await expect(page.getByTestId("colour-note")).toContainText("has a drawing of its own");
  await expect(page.locator('[data-testid="embed-code"]')).toContainText('key="macbook-pro-14-silver"');
  // a colour with no drawing keeps its tint
  await chip("Space Gray").click();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14");
  await expect(hero).toHaveAttribute("body-colour", /^#[0-9a-f]{6}$/);
  await page.reload();
  await expect(hero).toHaveAttribute("body-colour", /^#[0-9a-f]{6}$/);
  await pressed("Space Gray");
  // each colour is a step for Back and Forward
  await page.goBack();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14-silver");
  await expect(hero).not.toHaveAttribute("body-colour");
  await pressed("Silver");
  await page.goBack();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14");
  await pressed("Space Black");
  await expect(chip("Silver")).toHaveAttribute("aria-pressed", "false");
  await page.goForward();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14-silver");
  await pressed("Silver");
  // another machine starts plain, and Back brings the colour back with its machine
  await tileOf(page, "macbook-pro-14").waitFor();
  await tileOf(page, "macbook-air-13").click();
  await expect(hero).toHaveAttribute("key", "macbook-air-13");
  await expect(page).not.toHaveURL(/colour=/);
  await page.goBack();
  await expect(hero).toHaveAttribute("key", "macbook-pro-14-silver");
  await pressed("Silver");
  // a colour this machine does not have is no colour, and a machine with its plain colour stays plain
  await page.goto(`${URL}?colour=Nothing#macbook-pro-14`);
  await expect(hero).toHaveAttribute("key", "macbook-pro-14");
  await pressed("Space Black");
  expect(problems).toEqual([]);
});

test("a colour with no value says only its name, and a covered machine switches to its finish's mesh", async ({ page }) => {
  const problems = watch(page);
  await page.goto(`${URL}#macbook-air-m2-2022`);
  const box = page.getByTestId("device-colours");
  await expect(box.locator('[data-colour="Midnight"]')).toHaveAttribute("aria-pressed", "true");
  await box.locator('[data-colour="Starlight"]').click();
  await expect(box.getByTestId("colour-note")).toContainText("only its name");
  await expect(page.getByTestId("hero-device")).not.toHaveAttribute("body-colour");
  await box.locator('[data-colour="Silver"]').click();
  await expect(page.getByTestId("hero-device")).toHaveAttribute("key", "macbook-air-13-silver");
  expect(problems).toEqual([]);
});

test("the colours stay in the side panel, one row of them, with no scroll of the page", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desk");
  await page.goto(`${URL}#macbook-pro-14`);
  await expect(page.getByTestId("colour-row")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(0);
});
