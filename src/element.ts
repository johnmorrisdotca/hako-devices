// The viewer: `<hako-device key="pi4">` in any page. The drawing first, then, when it comes on screen and the browser can draw WebGL, the 3D view crossfading in over it; drag to turn,
// keyboard, tilt on phones, reduced motion, and the drawing stays on no WebGL, Save-Data or any failure. `<hako-lineup keys="...">` draws machines at their true relative size.
// Importing this file defines both elements. three.js is loaded only when a 3D view is wanted.
import { deviceByKey } from "./catalogue.ts";
import { PARTS } from "./parts.ts";
import { CROSSFADE_MS, REDUCED_FADE_MS, revealDelay } from "./crossfade.ts";
import type { Description } from "./fit.ts";
import { COMING_SOON_SVG } from "./placeholder.ts";
import { type ArtMetrics, parseUnit, readMetrics, realPlacement, realScaleSvg } from "./scale.ts";
import type { ScreenContent } from "./screen/picture.ts";
import { cleanStyle, drawingFile, STYLE_NAMES, STYLES, type StyleName } from "./styles.ts";
import { type Reading, tiltMode, tiltTurn } from "./tilt.ts";
import type { ViewChoice } from "./framing.ts";
import type { DeviceViewer, Painter, Spin } from "./element/scene.ts";

export type { Painter };
export type HakoView = "picture" | "loading" | "3d" | "fallback" | "planned";

const HTMLBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

/** Seconds a view out of sight keeps its WebGL canvas before letting it go (a browser allows only a few at a time). */
const RELEASE_MS = 30_000;
const DEFAULT_SPIN: Spin = { seconds: 180, way: "cw" };

let assetBase: string | null = null;
/** Where the shipped .glb and .svg files are, for every element with no `assets` attribute of its own. Left unset: beside this module, in ./assets/. */
export function setAssetBase(url: string): void {
  assetBase = url.endsWith("/") ? url : `${url}/`;
}
const defaultBase = () => assetBase ?? new URL("./assets/", import.meta.url).href;

const CSS = `
:host { display: block; position: relative; color: inherit; }
:host([hidden]) { display: none; }
.frame { position: relative; margin: 0; }
.picture { position: relative; width: 100%; aspect-ratio: 320 / 220; margin: 0; }
.drawing, .drawing svg, img.drawing { display: block; width: 100%; height: 100%; }
.drawing, .canvas { transition: opacity var(--hako-fade, 1500ms) ease-in-out, transform var(--hako-fade, 1500ms) ease-in-out, filter var(--hako-fade, 1500ms) ease-in-out; }
:host([data-driven]) .picture { overflow: hidden; }
:host([data-driven]) .drawing { transition: opacity var(--hako-fade, 1500ms) ease-in-out, filter var(--hako-fade, 1500ms) ease-in-out; }
.stage { position: absolute; inset: 0; }
.canvas { display: block; width: 100%; height: 100%; opacity: 0; transform: scale(0.97); filter: blur(3px); cursor: grab; border-radius: inherit; }
.canvas:active { cursor: grabbing; }
.canvas:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
.picture[data-view="3d"] .drawing { opacity: 0; transform: scale(1.03); filter: blur(2px); }
.picture[data-view="3d"] .canvas { opacity: 1; transform: none; filter: none; }
.picture[data-flipped] .drawing { rotate: 180deg; }
.tilt { position: absolute; right: 0.5rem; bottom: 0.5rem; min-height: 2rem; padding: 0.25rem 0.75rem; border: 1px solid currentColor; border-radius: 1rem; background: transparent; color: inherit; font: inherit; font-size: 0.8rem; cursor: pointer; }
:host([scale="real"]) { display: inline-block; vertical-align: bottom; }
:host([scale="real"]) .picture { position: absolute; aspect-ratio: auto; }
.drawing svg { overflow: visible; }
.ruler { display: block; margin-top: 0.5rem; overflow: visible; color: inherit; }
.ruler line { stroke: currentColor; stroke-width: 1; vector-effect: non-scaling-stroke; opacity: 0.7; }
.ruler text { fill: currentColor; font: 11px system-ui, sans-serif; opacity: 0.8; }
@media (prefers-reduced-motion: reduce) {
  .drawing, .canvas { transform: none !important; filter: none !important; transition: opacity var(--hako-fade, 400ms) ease; }
}
`;

let sheet: CSSStyleSheet | null = null;
function adopt(root: ShadowRoot, css: string): void {
  try {
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
    }
    root.adoptedStyleSheets = [sheet];
  } catch {
    const style = document.createElement("style");
    style.textContent = css;
    root.appendChild(style);
  }
}

const media = (query: string): boolean => typeof matchMedia === "function" && matchMedia(query).matches;

let webgl: boolean | null = null;
/** Whether this browser draws WebGL at all, asked once per page on a canvas that is let go at once. */
function webglWorks(): boolean {
  if (webgl !== null) return webgl;
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    webgl = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

/** Why the 3D view is not shown, or "" when it may be. */
function whyNot(mode: string): string {
  if (mode === "drawing") return "off";
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData || media("(prefers-reduced-data: reduce)")) return "reduced-data";
  if (!webglWorks()) return "no-webgl";
  return "";
}

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };

/** A ruler in millimetres at `unit` pixels a millimetre, a tick every 10 mm and a number at every 50 mm or more. */
function rulerSvg(mm: number, unit: number): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  const width = mm * unit;
  svg.setAttribute("class", "ruler");
  svg.setAttribute("part", "ruler");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", "26");
  svg.setAttribute("viewBox", `0 0 ${width} 26`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `A ruler ${mm} millimetres long`);
  const add = (name: string, attrs: Record<string, string | number>, text?: string) => {
    const node = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text) node.textContent = text;
    svg.appendChild(node);
  };
  add("line", { x1: 0, y1: 1, x2: width, y2: 1 });
  const step = mm <= 200 ? 10 : mm <= 600 ? 50 : 100;
  // a number needs about 36 pixels of room
  const label = [50, 100, 200, 500, 1000].find((value) => value % step === 0 && value * unit >= 36) ?? 1000;
  for (let at = 0; at <= mm; at += step) {
    const big = at % label === 0;
    add("line", { x1: at * unit, y1: 1, x2: at * unit, y2: big ? 9 : 5 });
    if (big && at < mm) add("text", { x: at * unit, y: 22, "text-anchor": at === 0 ? "start" : "middle" }, String(at));
  }
  add("line", { x1: width, y1: 1, x2: width, y2: 9 });
  add("text", { x: width + 6, y: 12 }, `${mm} mm`);
  return svg;
}

export class HakoDevice extends HTMLBase {
  static readonly observedAttributes = ["key", "device", "part", "build", "style", "drawing-style", "mode", "assets", "spin", "way", "label", "print", "scale", "unit", "ruler", "fireflies", "no-ground", "flipped"];

  /** A machine built from parts, as a property: the same as the `build` attribute's JSON. */
  private descriptionValue: Description | null = null;
  private screenValue: Painter | null = null;
  private frameNode: HTMLElement | null = null;
  private picture: HTMLElement | null = null;
  private holder: HTMLElement | null = null;
  private viewer: DeviceViewer | null = null;
  private watch: IntersectionObserver | null = null;
  private cleanups: (() => void)[] = [];
  private release = 0;
  private revealTimer = 0;
  private generation = 0;
  private built: Promise<import("./build/index.ts").Built> | null = null;
  private renderQueued = false;
  private currentView: HakoView = "picture";
  private driven: ViewChoice | null = null;

  /** What is showing now. */
  get view(): HakoView {
    return this.currentView;
  }

  get description(): Description | null {
    return this.descriptionValue;
  }
  set description(value: Description | null) {
    this.descriptionValue = value;
    this.queue();
  }

  /** What the device's screen shows: words, a canvas, or a function that draws on one. */
  get screen(): Painter | null {
    return this.screenValue;
  }
  set screen(value: Painter | null) {
    this.screenValue = value;
    this.viewer?.paintScreen(value);
  }

  /** Paints the device's screen now, and whenever its 3D view is made. */
  paintScreen(painter: Painter | ScreenContent): void {
    this.screen = painter;
  }

  /** Lets a page choose the turn, tip, zoom and pan, as the family's `<kazoku-view-controls>` reports them in `kazoku-viewchange` (`element.drive(event.detail)`): the element's own drag, wheel, keys and spin stand down, and the 3D view follows. The drawing, which is one flat picture, follows the zoom and the pan. `null` takes the hands back. */
  drive(choice: Partial<ViewChoice> | null): void {
    const before = this.driven;
    if (choice === null) {
      this.driven = null;
      delete this.dataset.driven;
    } else {
      const number = (value: unknown, fallback: number, lo: number, hi: number) => (typeof value === "number" && Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : fallback);
      this.driven = {
        yaw: number(choice.yaw, this.driven?.yaw ?? 0, -3600, 3600),
        tilt: number(choice.tilt, this.driven?.tilt ?? 0, -90, 90),
        zoom: number(choice.zoom, this.driven?.zoom ?? 1, 0.25, 8),
        panX: number(choice.panX, this.driven?.panX ?? 0, -5000, 5000),
        panY: number(choice.panY, this.driven?.panY ?? 0, -5000, 5000),
      };
      this.dataset.driven = "true";
    }
    const now = this.driven;
    if (before && now && (Object.keys(now) as (keyof ViewChoice)[]).every((key) => before[key] === now[key])) return;
    this.viewer?.drive(this.driven);
    this.place();
  }

  /** The flat drawing, zoomed and moved to the chosen view: a transform only, so nothing is drawn again. The 3D view moves its own camera. */
  private place(): void {
    const drawing = this.shadowRoot?.querySelector<HTMLElement>(".drawing");
    if (!drawing) return;
    const { zoom = 1, panX = 0, panY = 0 } = this.driven ?? {};
    drawing.style.transform = this.currentView === "3d" || (zoom === 1 && panX === 0 && panY === 0) ? "" : `translate(${panX}px, ${panY}px) scale(${zoom})`;
    drawing.dataset.zoom = zoom.toFixed(2);
    drawing.dataset.pan = `${Math.round(panX)},${Math.round(panY)}`;
  }

  /** Puts the camera back where it started. */
  resetView(): void {
    this.viewer?.reset();
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      adopt(root, CSS);
    }
    this.queue();
  }

  disconnectedCallback(): void {
    this.teardown();
  }

  attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after) return;
    if (name === "spin" || name === "way") {
      this.viewer?.setSpin(this.spin());
      return;
    }
    if (name === "flipped") {
      this.viewer?.setFlipped(this.hasAttribute("flipped"));
      this.syncFlipped();
      return;
    }
    if (name === "style" && !this.styleName(after)) return;
    this.queue();
  }

  // ---------------------------------------------------------------------------------------------------------------------------------

  private styleName(raw: string | null): StyleName | null {
    return raw !== null && (STYLE_NAMES as string[]).includes(raw) ? (raw as StyleName) : null;
  }

  /** `drawing-style`, or `style` when it names one (the global attribute, so `drawing-style` is the one that never meets a page's content security policy). */
  private drawingStyle(): StyleName {
    return this.styleName(this.getAttribute("drawing-style")) ?? this.styleName(this.getAttribute("style")) ?? cleanStyle(null);
  }

  private keyName(): string {
    return this.getAttribute("key") ?? this.getAttribute("device") ?? "";
  }

  private spin(): Spin {
    const raw = this.getAttribute("spin");
    const named: Record<string, number> = { off: 0, slow: 180, medium: 67, fast: 20 };
    const seconds = raw === null ? DEFAULT_SPIN.seconds : (named[raw] ?? (Number.isFinite(Number(raw)) ? Math.max(0, Number(raw)) : DEFAULT_SPIN.seconds));
    return { seconds, way: this.getAttribute("way") === "ccw" ? "ccw" : "cw" };
  }

  private descriptionNow(): Description | null {
    if (this.descriptionValue) return this.withPrint(this.descriptionValue);
    const raw = this.getAttribute("build");
    if (raw) {
      try {
        return this.withPrint(JSON.parse(raw) as Description);
      } catch {
        return null;
      }
    }
    const print = this.getAttribute("print");
    const entry = deviceByKey(this.keyName());
    return print && entry ? { ...entry.parts, print } : null;
  }

  private withPrint(description: Description): Description {
    const print = this.getAttribute("print");
    return print ? { ...description, print } : description;
  }

  private queue(): void {
    if (this.renderQueued) return;
    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      if (this.isConnected) void this.render();
    });
  }

  private teardown(): void {
    this.generation++;
    this.watch?.disconnect();
    this.watch = null;
    window.clearTimeout(this.release);
    window.clearTimeout(this.revealTimer);
    for (const clean of this.cleanups.splice(0)) clean();
    this.viewer?.dispose();
    this.viewer = null;
    this.built = null;
  }

  private setView(view: HakoView, why = ""): void {
    this.currentView = view;
    if (this.picture) this.picture.dataset.view = view;
    this.dataset.view = view;
    if (why) this.dataset.why = why;
    else delete this.dataset.why;
    if (this.driven) this.place();
  }

  private syncFlipped(): void {
    if (!this.picture) return;
    if (this.hasAttribute("flipped")) this.picture.dataset.flipped = "";
    else delete this.picture.dataset.flipped;
  }

  private buildNow(description: Description) {
    this.built ??= import("./build/index.ts").then(({ build }) => build(description));
    return this.built;
  }

  private async render(): Promise<void> {
    this.teardown();
    const generation = this.generation;
    const root = this.shadowRoot;
    if (!root) return;
    for (const child of [...root.childNodes]) child.remove();
    const reduced = media("(prefers-reduced-motion: reduce)");
    const frame = document.createElement("div");
    frame.className = "frame";
    frame.setAttribute("part", "frame");
    frame.style.setProperty("--hako-fade", `${reduced ? REDUCED_FADE_MS : CROSSFADE_MS}ms`);
    const picture = document.createElement("figure");
    picture.className = "picture";
    picture.setAttribute("part", "figure");
    const holder = document.createElement("div");
    holder.className = "stage";
    frame.appendChild(picture);
    root.appendChild(frame);
    this.frameNode = frame;
    this.picture = picture;
    this.holder = holder;
    this.syncFlipped();

    const partId = this.getAttribute("part");
    const part = partId !== null && Object.hasOwn(PARTS, partId) ? PARTS[partId] : undefined;
    let key = part ? part.id : this.keyName();
    const description = part ? null : this.descriptionNow();
    let entry = part ?? deviceByKey(key);
    // a real machine a built mesh covers draws that mesh, under its own name
    let ownName: string | undefined;
    if (!description && !entry) {
      const { COVERED } = await import("./wishlist.ts");
      if (generation !== this.generation) return;
      const covered = COVERED.find((machine) => machine.key === key);
      if (covered) {
        key = covered.mesh;
        ownName = covered.name;
        entry = deviceByKey(key);
      }
    }
    const real = this.getAttribute("scale") === "real";
    const style = this.drawingStyle();
    const base = `${this.getAttribute("assets") ? `${(this.getAttribute("assets") as string).replace(/\/$/, "")}/` : defaultBase()}${part ? "parts/" : ""}`;
    const label = this.getAttribute("label") ?? ownName ?? entry?.name ?? (description ? "An assembled machine" : key);

    if (!description && !entry) {
      await this.showPlanned(picture, key, generation);
      return;
    }
    this.setView("picture");

    // the drawing
    let metrics: ArtMetrics | null = null;
    try {
      if (description) {
        const built = await this.buildNow(description);
        if (generation !== this.generation) return;
        const svg = built.svg(style);
        metrics = readMetrics(svg);
        this.placeInline(picture, real ? realScaleSvg(svg, this.unit(), STYLES[style]) : svg, label);
      } else if (real) {
        const response = await fetch(`${base}${drawingFile(key, style)}`);
        if (!response.ok) throw new Error(`no drawing for ${key}`);
        const svg = await response.text();
        if (generation !== this.generation) return;
        metrics = readMetrics(svg);
        this.placeInline(picture, realScaleSvg(svg, this.unit(), STYLES[style]), label);
      } else {
        const img = document.createElement("img");
        img.className = "drawing";
        img.setAttribute("part", "drawing");
        img.src = `${base}${drawingFile(key, style)}`;
        img.alt = label;
        img.width = 320;
        img.height = 220;
        img.decoding = "async";
        picture.appendChild(img);
      }
    } catch (error) {
      if (generation !== this.generation) return;
      this.fail(error);
      this.setView("fallback", "error");
      return;
    }
    picture.appendChild(holder);
    if (real && metrics) this.applyReal(frame, picture, metrics);
    if (this.driven) this.place();

    // the 3D view: made when it first comes near the screen, paused out of it, let go after a while away
    const reason = whyNot(this.getAttribute("mode") ?? "auto");
    if (reason) {
      this.setView(reason === "off" ? "picture" : "fallback", reason);
      if (reason !== "off") this.emit("hako-fallback", { reason });
      return;
    }
    let shownAt = 0;
    let starting = false;
    const fallBack = (why: string) => {
      this.viewer?.dispose();
      this.viewer = null;
      this.setView("fallback", why);
      this.emit("hako-fallback", { reason: why });
    };
    const start = async () => {
      starting = true;
      this.setView("loading");
      try {
        const { DeviceViewer } = await import("./element/scene.ts");
        if (generation !== this.generation) return;
        const made = new DeviceViewer(holder, {
          label,
          reducedMotion: reduced,
          onLost: () => fallBack("context-lost"),
          ground: !this.hasAttribute("no-ground") && !real,
          fireflies: this.hasAttribute("fireflies"),
        });
        this.viewer = made;
        if (this.driven) made.drive(this.driven);
        if (this.screenValue) made.paintScreen(this.screenValue);
        made.setSpin(this.spin());
        made.setVisible(true);
        if (description) {
          const built = await this.buildNow(description);
          made.setPrint(description.print);
          const bytes = built.glb().bytes;
          await made.load(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
        } else await made.load(`${base}${key}.glb`);
        if (generation !== this.generation) return;
        made.setFlipped(this.hasAttribute("flipped"));
        // the drawing stays a moment, then becomes the device
        const wait = revealDelay(shownAt, performance.now(), reduced);
        this.revealTimer = window.setTimeout(() => {
          if (generation === this.generation && this.viewer === made) {
            this.setView("3d");
            this.emit("hako-ready", { frames: made.frames });
            this.startTilt();
          }
        }, wait);
      } catch (error) {
        if (generation === this.generation) {
          this.fail(error);
          fallBack("error");
        }
      } finally {
        starting = false;
      }
    };
    this.watch = new IntersectionObserver(
      ([seen]) => {
        if (seen.isIntersecting) {
          shownAt ||= performance.now();
          window.clearTimeout(this.release);
          if (this.viewer) this.viewer.setVisible(true);
          else if (!starting) void start();
        } else if (this.viewer) {
          this.viewer.setVisible(false);
          this.release = window.setTimeout(() => {
            this.viewer?.dispose();
            this.viewer = null;
            if (generation === this.generation) this.setView("picture");
          }, RELEASE_MS);
        }
      },
      { rootMargin: "200px 0px" },
    );
    this.watch.observe(this);
  }

  private unit(): number {
    return parseUnit(this.getAttribute("unit"));
  }

  private fail(error: unknown): void {
    this.emit("hako-error", { error });
  }

  private emit(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private placeInline(picture: HTMLElement, svg: string, label: string): void {
    // the HTML parser: an XML one may answer with a viewer's own styled page, which a strict policy refuses
    const template = document.createElement("template");
    template.innerHTML = svg;
    const node = template.content.firstElementChild;
    if (!node) return;
    node.setAttribute("role", "img");
    node.setAttribute("aria-label", label);
    const wrap = document.createElement("div");
    wrap.className = "drawing";
    wrap.setAttribute("part", "drawing");
    wrap.appendChild(node);
    picture.appendChild(wrap);
  }

  /** At real scale the host is the device's own box, and the whole picture hangs from it, so machines side by side share a baseline. */
  private applyReal(frame: HTMLElement, picture: HTMLElement, metrics: ArtMetrics): void {
    const unit = this.unit();
    const place = realPlacement(metrics, unit);
    frame.style.width = `${place.width}px`;
    frame.style.height = `${place.height}px`;
    picture.style.left = `${place.left}px`;
    picture.style.top = `${place.top}px`;
    picture.style.width = `${place.pictureWidth}px`;
    picture.style.height = `${place.pictureHeight}px`;
    this.dataset.mmPerUnit = String(metrics.mmPerUnit);
    this.dataset.widthPx = place.width.toFixed(1);
    this.dataset.heightPx = place.height.toFixed(1);
    if (this.hasAttribute("ruler") && this.shadowRoot) {
      const asked = Number(this.getAttribute("ruler"));
      const mm = asked > 0 ? asked : Math.max(10, Math.round(place.width / unit / 10) * 10);
      this.shadowRoot.appendChild(rulerSvg(mm, unit));
    }
  }

  /** A machine with no mesh yet shows the one "Coming soon" picture, with its name when the list knows it. */
  private async showPlanned(picture: HTMLElement, key: string, generation: number): Promise<void> {
    this.placeInline(picture, COMING_SOON_SVG, key);
    this.setView("planned", "planned");
    const { PLANNED } = await import("./wishlist.ts");
    if (generation !== this.generation) return;
    const planned = PLANNED.find((entry) => entry.key === key);
    if (!planned) this.dataset.why = "unknown-key";
    const svg = picture.querySelector("svg");
    svg?.setAttribute("aria-label", `${planned?.name ?? key}: coming soon`);
    if (planned) this.dataset.name = planned.name;
    this.emit("hako-planned", { key, name: planned?.name ?? null, known: Boolean(planned) });
  }

  private startTilt(): void {
    const Orientation = (typeof DeviceOrientationEvent === "undefined" ? undefined : DeviceOrientationEvent) as OrientationCtor | undefined;
    const mode = tiltMode({
      reducedMotion: media("(prefers-reduced-motion: reduce)"),
      coarsePointer: media("(pointer: coarse)"),
      hasOrientation: Orientation !== undefined,
      needsPermission: typeof Orientation?.requestPermission === "function",
    });
    const listen = () => {
      let rest: Reading | null = null;
      const onTilt = (event: DeviceOrientationEvent) => {
        const reading = { beta: event.beta, gamma: event.gamma };
        rest ??= reading;
        const turn = tiltTurn(reading, rest, window.screen.orientation?.angle ?? 0);
        if (turn) this.viewer?.setTilt(turn.azimuth, turn.polar);
      };
      window.addEventListener("deviceorientation", onTilt);
      this.cleanups.push(() => window.removeEventListener("deviceorientation", onTilt));
    };
    if (mode === "on") listen();
    if (mode === "ask" && this.picture) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tilt";
      button.setAttribute("part", "tilt");
      button.textContent = "Tilt to turn";
      button.addEventListener("click", async () => {
        button.remove();
        try {
          if ((await Orientation?.requestPermission?.()) === "granted") listen();
        } catch {
          // no tilt, then: the view still turns by finger
        }
      });
      this.picture.appendChild(button);
      this.cleanups.push(() => button.remove());
    }
  }
}

const LINEUP_CSS = `
:host { display: block; }
.row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--hako-lineup-gap, 28px 24px); padding: 12px 2px; overflow: clip; }
.item { flex: none; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; max-width: 100%; }
.name { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; font-size: 0.8rem; line-height: 1.2; height: 2.4em; opacity: 0.85; width: 9rem; overflow: hidden; }
.item hako-device { max-width: 100%; }
.ruler { display: block; margin-top: 0.75rem; overflow: visible; }
.ruler line { stroke: currentColor; stroke-width: 1; vector-effect: non-scaling-stroke; opacity: 0.7; }
.ruler text { fill: currentColor; font: 11px system-ui, sans-serif; opacity: 0.8; }
`;

let lineupSheet: CSSStyleSheet | null = null;

/** Machines side by side at true relative size on one shared baseline: `<hako-lineup keys="pi-zero,pi5,nas-2bay" unit="1.5px/mm" ruler labels>`. What does not fit wraps onto
 * another row on the same scale, so nothing is ever out of sight. */
export class HakoLineup extends HTMLBase {
  static readonly observedAttributes = ["keys", "unit", "style", "drawing-style", "assets", "mode", "ruler", "labels"];

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      try {
        if (!lineupSheet) {
          lineupSheet = new CSSStyleSheet();
          lineupSheet.replaceSync(LINEUP_CSS);
        }
        root.adoptedStyleSheets = [lineupSheet];
      } catch {
        const style = document.createElement("style");
        style.textContent = LINEUP_CSS;
        root.appendChild(style);
      }
    }
    this.render();
  }

  attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before !== after && this.shadowRoot) this.render();
  }

  private render(): void {
    const root = this.shadowRoot;
    if (!root) return;
    for (const child of [...root.childNodes]) child.remove();
    const row = document.createElement("div");
    row.className = "row";
    row.setAttribute("part", "row");
    const unit = parseUnit(this.getAttribute("unit"));
    const keys = (this.getAttribute("keys") ?? "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);
    for (const key of keys) {
      const item = document.createElement("div");
      item.className = "item";
      const device = document.createElement("hako-device");
      device.setAttribute("key", key);
      device.setAttribute("scale", "real");
      device.setAttribute("unit", String(unit));
      device.setAttribute("mode", this.getAttribute("mode") ?? "drawing");
      for (const name of ["assets", "drawing-style"]) {
        const value = this.getAttribute(name);
        if (value) device.setAttribute(name, value);
      }
      const style = this.getAttribute("style");
      if (style && (STYLE_NAMES as string[]).includes(style)) device.setAttribute("drawing-style", style);
      item.appendChild(device);
      if (this.hasAttribute("labels")) {
        const name = document.createElement("div");
        name.className = "name";
        name.setAttribute("part", "name");
        name.textContent = deviceByKey(key)?.name ?? key;
        name.title = name.textContent;
        item.appendChild(name);
      }
      row.appendChild(item);
    }
    root.appendChild(row);
    if (this.hasAttribute("ruler")) {
      const raw = this.getAttribute("ruler");
      const mm = raw && Number(raw) > 0 ? Number(raw) : 200;
      root.appendChild(rulerSvg(mm, unit));
    }
  }
}

/** Defines both elements, once. Importing this module does it. */
export function defineHakoDevice(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("hako-device")) customElements.define("hako-device", HakoDevice);
  if (!customElements.get("hako-lineup")) customElements.define("hako-lineup", HakoLineup);
}

defineHakoDevice();

declare global {
  interface HTMLElementTagNameMap {
    "hako-device": HakoDevice;
    "hako-lineup": HakoLineup;
  }
}
