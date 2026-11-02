// The demo must never ask a lot of the machine. Played in headless Chromium, these fail on a draw loop that asks for more than one frame at a time or runs when nothing moves, on WebGL contexts or graphics
// memory (buffers, vertex arrays, textures) that grow with each change, on a canvas past its pixel budget on a 5K screen, and on a view out of sight that still draws.
import { expect, type Page, test } from "@playwright/test";
import { MAX_PIXELS, MAX_SIDE } from "../src/pixels.ts";

const URL = "/hako-devices/";
const hero = (page: Page) => page.locator("hako-device#hero");
const bar = (page: Page) => page.locator('[data-testid="view-bar"]');
type Bar = HTMLElement & { play(): void; pause(): void; set(next: object): void };

test.use({ reducedMotion: "no-preference" });
test.beforeEach(({ browserName }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "chromium-desk", "WebGL is drawn in the desk Chromium here");
});

/** Counts what the page asks of the graphics card and of the frame clock, from before any script runs. */
const COUNT = () => {
  type Ctx = (WebGLRenderingContext | WebGL2RenderingContext) & { isContextLost(): boolean };
  const seen = { contexts: [] as Ctx[], counts: new Map<Ctx, { made: Record<string, number>; freed: Record<string, number> }>(), frames: 0, pending: new Set<number>(), peak: 0 };
  const getContext = HTMLCanvasElement.prototype.getContext;
  // @ts-expect-error a wrapper with the same overloads is not worth writing out
  HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
    const context = getContext.call(this, type, ...(rest as []));
    if (context && /webgl/.test(type) && !seen.contexts.includes(context as Ctx)) seen.contexts.push(context as Ctx);
    return context;
  };
  for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype] as unknown as Record<string, (...args: unknown[]) => unknown>[]) {
    for (const kind of ["Buffer", "Texture", "VertexArray", "Program", "Framebuffer", "Renderbuffer"]) {
      for (const verb of ["create", "delete"] as const) {
        const original = proto[verb + kind];
        if (!original) continue;
        proto[verb + kind] = function (this: unknown, ...args: unknown[]) {
          // counted by context: a context that was let go takes what it held with it, so only a live one counts
          const own = seen.counts.get(this as Ctx) ?? { made: {}, freed: {} };
          seen.counts.set(this as Ctx, own);
          const into = verb === "create" ? own.made : own.freed;
          into[kind] = (into[kind] ?? 0) + 1;
          return original.apply(this, args);
        };
      }
    }
  }
  // frames, not callbacks: callbacks of one frame share a time; and how many callbacks wait at once
  let last = -1;
  const frame = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => {
    const id: number = frame((time) => {
      seen.pending.delete(id);
      if (time !== last) seen.frames++;
      last = time;
      callback(time);
    });
    seen.pending.add(id);
    seen.peak = Math.max(seen.peak, seen.pending.size);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    seen.pending.delete(id);
    cancel(id);
  };
  Object.assign(window, { __seen: seen });
};

type Seen = { contexts: { isContextLost(): boolean }[]; counts: Map<{ isContextLost(): boolean }, { made: Record<string, number>; freed: Record<string, number> }>; frames: number; pending: Set<number>; peak: number };
const usage = (page: Page) =>
  page.evaluate(() => {
    const seen = (window as unknown as { __seen: Seen }).__seen;
    const live = (kind: string) => [...seen.counts].filter(([context]) => !context.isContextLost()).reduce((sum, [, own]) => sum + (own.made[kind] ?? 0) - (own.freed[kind] ?? 0), 0);
    return { contexts: seen.contexts.filter((context) => !context.isContextLost()).length, buffers: live("Buffer"), arrays: live("VertexArray"), textures: live("Texture"), pageFrames: seen.frames, pending: seen.pending.size, peak: seen.peak };
  });
const drawn = (page: Page) => hero(page).evaluate((node) => Number(node.shadowRoot?.querySelector("canvas")?.dataset.frames ?? 0));
const reach3d = (page: Page) => expect(hero(page)).toHaveAttribute("data-view", "3d", { timeout: 90_000 });
const settle = (page: Page, ms: number) => page.waitForTimeout(ms);
/** Draws and page frames over a stretch long enough for `frames` of the page's own: a slow machine (software WebGL on a runner) has few in a second. */
const measure = async (page: Page, frames = 12) => {
  const start = { drawn: await drawn(page), page: (await usage(page)).pageFrames };
  await expect.poll(async () => (await usage(page)).pageFrames - start.page, { timeout: 90_000 }).toBeGreaterThanOrEqual(frames);
  const end = { drawn: await drawn(page), page: (await usage(page)).pageFrames };
  return { drew: end.drawn - start.drawn, frames: end.page - start.page };
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(COUNT);
});

test("while it turns, one frame is asked for at a time and it draws at most once a frame", async ({ page }) => {
  await page.goto(URL);
  await hero(page).evaluate((node) => node.setAttribute("spin", "fast"));
  await reach3d(page);
  await settle(page, 1500);
  const early = await usage(page);
  const { drew, frames } = await measure(page, 30);
  // one frame is the page's own; a draw loop that doubles every frame draws hundreds of times more
  expect(drew).toBeGreaterThan(0);
  expect(drew).toBeLessThanOrEqual(frames + 3);
  // the callbacks waiting for a frame do not pile up: one or two stand in line (this view and the page's own), never a growing number
  const late = await usage(page);
  expect(late.pending).toBeLessThanOrEqual(early.pending + 2);
  expect(late.peak).toBeLessThanOrEqual(6);
});

test("a view out of sight draws nothing, even while it would turn", async ({ page }) => {
  await page.goto(URL);
  await hero(page).evaluate((node) => node.setAttribute("spin", "fast"));
  await reach3d(page);
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "6000px";
    document.body.append(spacer);
    document.getElementById("hero")?.scrollIntoView();
    window.scrollTo(0, document.body.scrollHeight);
  });
  // a slow runner takes a while to hear that the view left the screen: wait for it to stop, then it must stay stopped
  await expect
    .poll(
      async () => {
        const mark = await drawn(page);
        await settle(page, 1500);
        return (await drawn(page)) - mark;
      },
      { timeout: 60_000, intervals: [500] },
    )
    .toBe(0);
  const before = await drawn(page);
  await settle(page, 2500);
  expect(await drawn(page)).toBe(before);
});

test("changes give back what they took: contexts, buffers, vertex arrays and textures do not grow", async ({ page }) => {
  await page.goto(URL);
  await reach3d(page);
  const round = async () => {
    for (const key of ["pi5", "mac-studio", "ipad-pro-11", "nas-2bay", "pi4-pitft"]) {
      await hero(page).evaluate((node, next) => {
        (window as unknown as { __old?: Element | null }).__old = node.shadowRoot?.querySelector("canvas");
        node.setAttribute("key", next);
      }, key);
      await expect
        .poll(
          () =>
            hero(page).evaluate((node) => {
              const canvas = node.shadowRoot?.querySelector("canvas");
              return canvas !== (window as unknown as { __old?: Element | null }).__old && canvas?.dataset.ready === "true" && node.dataset.view === "3d";
            }),
          { timeout: 90_000 },
        )
        .toBe(true);
    }
    await settle(page, 600);
  };
  // the first round fills the caches that are kept on purpose
  await round();
  const first = await usage(page);
  await round();
  await round();
  const last = await usage(page);
  expect(last.contexts).toBe(1);
  expect(last.buffers).toBeLessThanOrEqual(first.buffers);
  expect(last.arrays).toBeLessThanOrEqual(first.arrays);
  expect(last.textures).toBeLessThanOrEqual(first.textures);
});

test("the controls turning it draw at most once a frame", async ({ page }) => {
  await page.goto(URL);
  await bar(page).evaluate((node) => (node as Bar).pause());
  await reach3d(page);
  await bar(page).evaluate((node) => (node as Bar).play());
  await settle(page, 1500);
  const { drew, frames } = await measure(page, 30);
  expect(drew).toBeGreaterThan(0);
  expect(drew).toBeLessThanOrEqual(frames + 3);
  expect((await usage(page)).pending).toBeLessThanOrEqual(3);
  await bar(page).evaluate((node) => (node as Bar).pause());
});

test("a lost context is let go, the drawing takes over and still follows the zoom", async ({ page }) => {
  await page.goto(URL);
  await bar(page).evaluate((node) => (node as Bar).pause());
  await reach3d(page);
  await hero(page).evaluate((node) => {
    const canvas = node.shadowRoot?.querySelector("canvas");
    const gl = (canvas?.getContext("webgl2") ?? canvas?.getContext("webgl")) as WebGLRenderingContext | null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await expect(hero(page)).toHaveAttribute("data-view", "fallback", { timeout: 10_000 });
  await expect(hero(page)).toHaveAttribute("data-why", "context-lost");
  await settle(page, 500);
  expect((await usage(page)).contexts).toBe(0);
  await expect(bar(page)).toHaveAttribute("flat", "");
  await bar(page).evaluate((node) => (node as Bar).set({ zoom: 3 }));
  await expect.poll(() => hero(page).evaluate((node) => node.shadowRoot?.querySelector<HTMLElement>(".drawing")?.dataset.zoom)).toBe("3.00");
});

test.describe("on a 5K screen", () => {
  test.use({ viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 2 });

  test("the canvas stays inside its pixel budget", async ({ page }) => {
    await page.goto(URL);
    // as large as a page can make it: the whole width of the screen
    await page.locator(".hero").evaluate((node) => (node.style.gridTemplateColumns = "minmax(0, 1fr)"));
    await hero(page).evaluate((node) => {
      node.style.maxWidth = "none";
      node.style.width = "100vw";
    });
    await bar(page).evaluate((node) => (node as Bar).pause());
    await reach3d(page);
    const size = () =>
      hero(page).evaluate((node) => {
        const canvas = node.shadowRoot?.querySelector("canvas") as HTMLCanvasElement;
        return { w: canvas.width, h: canvas.height, css: canvas.clientWidth };
      });
    await expect.poll(async () => (await size()).css, { timeout: 60_000 }).toBeGreaterThan(2000);
    for (const zoom of [1, 2, 3, 4, 5]) {
      await bar(page).evaluate((node, z) => (node as Bar).set({ zoom: z }), zoom);
      await expect.poll(() => hero(page).evaluate((node) => node.shadowRoot?.querySelector("canvas")?.dataset.zoom), { timeout: 60_000 }).toBe(zoom.toFixed(2));
      // still sharp: more than the 2560 pixels the screen is wide in CSS pixels. The backing store takes its size a frame or more after the box does, so a busy machine is waited for.
      await expect.poll(async () => (await size()).w, { timeout: 60_000 }).toBeGreaterThan(2560);
      const now = await size();
      expect(now.w * now.h).toBeLessThanOrEqual(MAX_PIXELS);
      expect(Math.max(now.w, now.h)).toBeLessThanOrEqual(MAX_SIDE);
    }
  });
});

test.describe("on a 5120 x 2880 window at a scale of 2, with three 3D views", () => {
  test.use({ viewport: { width: 5120, height: 2880 }, deviceScaleFactor: 2 });

  test("each canvas stays inside its pixel budget, and the large one fills it", async ({ page }) => {
    test.setTimeout(300_000);
    await page.goto(URL);
    await bar(page).evaluate((node) => (node as Bar).pause());
    await reach3d(page);
    // the page shows one; two more over its corner are a page that shows three, each past the budget at this scale
    await page.evaluate(() => {
      for (const [at, key] of ["pi5", "mac-studio"].entries()) {
        const more = document.createElement("hako-device");
        more.setAttribute("key", key);
        more.setAttribute("spin", "off");
        more.dataset.testid = "more-3d";
        more.style.cssText = `position:fixed;left:${at * 1700}px;top:0;width:1600px;z-index:9`;
        document.body.append(more);
      }
    });
    const views = page.locator('hako-device#hero, [data-testid="more-3d"]');
    await expect.poll(() => page.locator('[data-testid="more-3d"][data-view="3d"]').count(), { timeout: 240_000 }).toBe(2);
    expect((await usage(page)).contexts).toBe(3);
    const size = (view: ReturnType<Page["locator"]>) =>
      view.evaluate((node) => {
        const canvas = node.shadowRoot?.querySelector("canvas") as HTMLCanvasElement;
        return { w: canvas.width, h: canvas.height };
      });
    const inBudget = async () => {
      const sizes = await Promise.all((await views.all()).map(size));
      expect(sizes).toHaveLength(3);
      for (const { w, h } of sizes) {
        expect(w * h).toBeLessThanOrEqual(MAX_PIXELS);
        expect(Math.max(w, h)).toBeLessThanOrEqual(MAX_SIDE);
      }
      return sizes;
    };
    await expect.poll(async () => size(hero(page)).then(({ w, h }) => w * h), { timeout: 60_000 }).toBeGreaterThan(MAX_PIXELS * 0.99);
    await inBudget();
    for (const zoom of [3, 5]) {
      await bar(page).evaluate((node, z) => (node as Bar).set({ zoom: z }), zoom);
      await expect.poll(() => hero(page).evaluate((node) => node.shadowRoot?.querySelector("canvas")?.dataset.zoom), { timeout: 60_000 }).toBe(zoom.toFixed(2));
      await inBudget();
    }
  });
});
