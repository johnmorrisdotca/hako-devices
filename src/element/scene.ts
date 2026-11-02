// The 3D view (three.js, MIT), loaded only when the element comes on screen. One WebGL canvas per element in view: the device lit like a studio with a warm rim light behind it, turning
// until someone takes it: drag (mouse, finger, pen), pinch or the wheel once it has the focus, the arrow keys, double-click to put it back. It draws only while something moves, never
// while out of view or the tab is hidden, and settles after a while with no one touching it.
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Box3,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  Spherical,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  type Texture,
  Timer,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FOV_DEG, frameFor } from "../framing.ts";
import { pixelRatioFor } from "../pixels.ts";
import { desktopPicture, oledPicture, panelPicture, paperPicture, phonePicture, type ScreenContent } from "../screen/picture.ts";
import { canvas, paintBitmap, paintGlow, paintHalo, paintPanel, paintPerforation, paintPrint, paintSteps } from "./paint.ts";

export type Painter = ScreenContent | HTMLCanvasElement | ((ctx: CanvasRenderingContext2D, width: number, height: number) => void);

export interface ViewerOptions {
  label: string;
  reducedMotion: boolean;
  onLost: () => void;
  /** The pool of light under the device. */
  ground: boolean;
  /** Three little lights drifting round it. */
  fireflies: boolean;
}

export interface Spin {
  /** Seconds a turn, 0 for not at all. */
  seconds: number;
  way: "cw" | "ccw";
}

/** What a screen shows until a caller paints it: the device's own name and a few plain words. */
const sampleWords = (label: string): ScreenContent => ({
  subtitle: "Ready",
  title: label.split(" in ")[0].split(" with ")[0].split(" on ")[0],
  lines: ["Everything is running", "2 screens are on", "Nothing playing"],
  status: "good",
  badge: "OK",
  clock: "12:30",
  buttons: ["Home", "Menu", "Info", "Sleep"],
});

const IDLE_STOP_MS = 90_000;
const AMBIENT_FPS = 30;

/** A turn's speed for OrbitControls: an autoRotateSpeed of 1 is a turn in 60 s, and a positive one moves the camera clockwise from above. */
const autoRotateOf = (spin: Spin): number => (spin.seconds <= 0 ? 0 : (60 / spin.seconds) * (spin.way === "cw" ? -1 : 1));

export class DeviceViewer {
  readonly canvas: HTMLCanvasElement;
  frames = 0;
  private holder: HTMLElement;
  private options: ViewerOptions;
  private renderer: WebGLRenderer;
  private environment: Texture;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV_DEG, 320 / 220, 0.001, 10);
  private root = new Group();
  private device: Object3D | null = null;
  private spinners: { node: Object3D; axis: "y" | "z" }[] = [];
  private leds: { material: MeshStandardMaterial; base: number; kind: string }[] = [];
  private flies: { sprite: Sprite; phase: number; radius: number; height: number; speed: number }[] = [];
  private screens: { mesh: Mesh; kind: string; pixels: [number, number]; layers: Mesh[] }[] = [];
  private prints = new Map<string, Mesh>();
  private printWords: string | Readonly<Record<string, string>> | undefined;
  private screenPainter: Painter | null = null;
  private flipped = false;
  private textures: Texture[] = [];
  private controls: OrbitControls;
  private clock = new Timer();
  private frame = 0;
  private visible = false;
  private lastActive = performance.now();
  private lastDraw = 0;
  private needsDraw = true;
  private home = { position: new Vector3(), target: new Vector3() };
  private tween: { from: Vector3; to: Vector3; start: number } | null = null;
  private tilt = { azimuth: 0, polar: 0, applied: { azimuth: 0, polar: 0 } };
  private resize: ResizeObserver;
  private disposed = false;

  constructor(holder: HTMLElement, options: ViewerOptions) {
    this.holder = holder;
    this.options = options;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.canvas = this.renderer.domElement;
    this.canvas.className = "canvas";
    this.canvas.setAttribute("part", "canvas");
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute("aria-roledescription", "3D view");
    this.canvas.setAttribute("aria-label", `3D view of ${options.label}. Drag or use the arrow keys to turn it; double-click or Home puts it back.`);
    this.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      // letting go of the renderer loses its context on purpose: that is not a failure
      if (!this.disposed) this.options.onLost();
    });
    holder.appendChild(this.canvas);

    const pmrem = new PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    this.scene.environment = this.environment;
    this.scene.environmentIntensity = 0.85;
    // a cool key light from the front right, the warm rim from behind on the left and a little below, a faint blue fill from behind on the right
    const key = new DirectionalLight("#ffffff", 1.5);
    key.position.set(3, 5, 4);
    const rim = new DirectionalLight("#fbbf24", 2.4);
    rim.position.set(-4, -0.35, -5);
    const fill = new DirectionalLight("#6cd0ff", 0.7);
    fill.position.set(5, 1, -3);
    this.scene.add(key, rim, fill, new HemisphereLight("#cfe6ff", "#0b0f18", 0.25), this.root);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.6;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI * 0.6;
    // a finger turns the device sideways and still scrolls the page up and down; two fingers pinch
    this.canvas.style.touchAction = "pan-y";
    this.controls.addEventListener("start", () => this.touched());
    this.controls.addEventListener("change", () => this.wake());
    // the wheel and the pinch zoom only once the view has the focus, so scrolling past it scrolls the page
    this.canvas.addEventListener("focus", () => (this.controls.enableZoom = true));
    this.canvas.addEventListener("blur", () => (this.controls.enableZoom = false));
    this.canvas.addEventListener("pointerdown", () => this.canvas.focus({ preventScroll: true }));
    this.canvas.addEventListener("dblclick", () => this.reset());
    this.canvas.addEventListener("keydown", (event) => this.key(event));
    document.addEventListener("visibilitychange", this.onVisibility);

    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(holder);
    this.fit();
  }

  /** Loads the device from an address or a .glb's bytes, and frames it. */
  async load(source: string | ArrayBuffer): Promise<void> {
    const loader = new GLTFLoader();
    const gltf = typeof source === "string" ? await loader.loadAsync(source) : await loader.parseAsync(source, "");
    if (this.disposed) return;
    const device = gltf.scene;
    this.device = device;
    device.traverse((node) => {
      if (/^spin-y/.test(node.name)) this.spinners.push({ node, axis: "y" });
      if (/^spin-z/.test(node.name)) this.spinners.push({ node, axis: "z" });
      if (!(node instanceof Mesh)) return;
      const material = node.material as MeshStandardMaterial;
      if (/^led-/.test(material.name) && !this.leds.some((led) => led.material === material)) this.leds.push({ material, base: material.emissiveIntensity, kind: material.name });
      const screen = /^screen-([a-z]+)-(\d+)x(\d+)/.exec(node.name);
      if (screen) this.screens.push({ mesh: node, kind: screen[1], pixels: [Number(screen[2]), Number(screen[3])], layers: [] });
      const perf = /^perf-(\d+)-(\d+)-(\d+)/.exec(node.name);
      if (perf) this.perforate(node, Number(perf[1]), Number(perf[2]), Number(perf[3]) / 100);
      const print = /^print-[a-z]+/.exec(node.name)?.[0];
      if (print) {
        this.prints.set(print.slice(6), node);
        node.visible = false;
      }
    });
    this.root.add(device);
    this.frameDevice();
    this.addGlow();
    this.paintAll();
    this.setPrint(this.printWords);
    this.applyHome();
    this.canvas.dataset.ready = "true";
    if (this.screens.length) this.canvas.dataset.screen = this.screens[0].kind;
    this.wake();
  }

  /** What the screen shows: a canvas of the caller's, a function that draws on one, or words. */
  paintScreen(painter: Painter | null): void {
    this.screenPainter = painter;
    this.paintAll();
    this.wake();
  }

  /** The caller's own print: one string for the main area, or by area. */
  setPrint(words: string | Readonly<Record<string, string>> | undefined): void {
    this.printWords = words;
    const areas = [...this.prints.keys()];
    const byArea: Record<string, string> = typeof words === "string" ? { [areas[0]]: words } : { ...words };
    for (const [area, node] of this.prints) {
      const text = byArea[area];
      if (!text) {
        node.visible = false;
        continue;
      }
      this.print(node, text);
      node.visible = true;
    }
    this.wake();
  }

  setFlipped(flipped: boolean): void {
    this.flipped = flipped;
    this.root.rotation.y = flipped ? Math.PI : 0;
    this.paintAll();
    this.wake();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible) this.wake();
  }

  /** How the device turns: a change takes effect from where it has got to. */
  setSpin(spin: Spin): void {
    this.controls.autoRotateSpeed = autoRotateOf(spin);
    this.controls.autoRotate = !this.options.reducedMotion && spin.seconds > 0;
    this.canvas.dataset.spin = `${spin.seconds}${spin.way}`;
    this.wake();
  }

  /** Tilting a phone or tablet: degrees away from where it was held when the view started. */
  setTilt(azimuthDeg: number, polarDeg: number): void {
    this.tilt.azimuth = MathUtils.degToRad(MathUtils.clamp(azimuthDeg, -25, 25));
    this.tilt.polar = MathUtils.degToRad(MathUtils.clamp(polarDeg, -12, 12));
    this.wake();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.resize.disconnect();
    this.controls.dispose();
    // everything the graphics card holds for the device: geometries, materials and every picture a material has (the model's own, not only the map)
    this.scene.traverse((node) => {
      if (!(node instanceof Mesh || node instanceof Sprite)) return;
      node.geometry.dispose();
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        for (const value of Object.values(material)) if (value && (value as Texture).isTexture) (value as Texture).dispose();
        material.dispose();
      }
    });
    for (const texture of this.textures) texture.dispose();
    this.environment.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }

  // ---------------------------------------------------------------------------------------------------------------------------------

  /** The camera where the device is seen best: a front three-quarter view, from higher up for a flat board. The same rule the drawing is made from. */
  private frameDevice(): void {
    if (!this.device) return;
    const bounds = new Box3().setFromObject(this.device);
    const screen = this.screens.length ? new Box3().setFromObject(this.screens[0].mesh).getCenter(new Vector3()).toArray() : null;
    const { target, position, distance } = frameFor(bounds.min.toArray(), bounds.max.toArray(), screen, this.camera.aspect);
    this.camera.position.set(...position);
    this.camera.near = distance / 50;
    this.camera.far = distance * 10;
    this.camera.lookAt(...target);
    this.camera.updateProjectionMatrix();
    this.home = { position: new Vector3(...position), target: new Vector3(...target) };
    this.controls.minDistance = distance * 0.55;
    this.controls.maxDistance = distance * 1.6;
  }

  private applyHome(): void {
    this.controls.target.copy(this.home.target);
    this.controls.update();
  }

  private texture(picture: HTMLCanvasElement): CanvasTexture {
    const t = new CanvasTexture(picture);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    // turned over, the panel turns its picture too, so it reads the right way up to the person in front of it
    t.center.set(0.5, 0.5);
    t.rotation = this.flipped ? Math.PI : 0;
    this.textures.push(t);
    return t;
  }

  private pictureFor(kind: string, [w, h]: [number, number]): HTMLCanvasElement {
    const painter = this.screenPainter;
    if (painter instanceof HTMLCanvasElement) return painter;
    if (typeof painter === "function") {
      const c = canvas(w, h);
      const ctx = c.getContext("2d");
      if (ctx) painter(ctx, w, h);
      return c;
    }
    const words: ScreenContent = painter ?? sampleWords(this.options.label);
    if (kind === "oled") return paintBitmap(oledPicture(words));
    if (kind === "panel") return paintPanel(paintSteps(panelPicture(words, w, h), w, h, 1));
    if (kind === "paper") return paintSteps(paperPicture(words, w, h), w, h, 1);
    if (kind === "phone") return paintSteps(phonePicture(words, w, h), w, h, 2);
    return paintSteps(desktopPicture(words, w, h), w, h, 1);
  }

  /** Each screen as a lit display: the picture glowing on its own (not lit by the room), a soft halo round an OLED's lit pixels, and a thin glass over it that catches the room's reflections. */
  private paintAll(): void {
    for (const screen of this.screens) {
      const picture = this.pictureFor(screen.kind, screen.pixels);
      for (const layer of screen.layers) {
        layer.removeFromParent();
        (layer.material as MeshBasicMaterial).map?.dispose();
        (layer.material as MeshBasicMaterial).dispose();
      }
      screen.layers = [];
      const old = screen.mesh.material as MeshBasicMaterial;
      old.map?.dispose();
      old.dispose();
      screen.mesh.material = new MeshBasicMaterial({ map: this.texture(picture), toneMapped: false });
      const { mesh } = screen;
      const normal = new Vector3().fromBufferAttribute(mesh.geometry.getAttribute("normal"), 0).normalize();
      const layer = (material: MeshBasicMaterial | MeshStandardMaterial, lift: number) => {
        const copy = new Mesh(mesh.geometry, material);
        // the mesh carries the scale its packed positions need: lift by metres, not by its own units
        copy.position.copy(normal).multiplyScalar(lift / (mesh.scale.x || 1));
        copy.renderOrder = 2;
        mesh.add(copy);
        screen.layers.push(copy);
      };
      if (screen.kind === "oled" && !(this.screenPainter instanceof HTMLCanvasElement))
        layer(new MeshBasicMaterial({ map: this.texture(paintHalo(picture, 10)), blending: AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.55 }), 0.00003);
      layer(new MeshStandardMaterial({ color: "#000000", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.28, depthWrite: false }), 0.00008);
    }
  }

  private addGlow(): void {
    if (!this.device) return;
    const bounds = new Box3().setFromObject(this.device);
    const size = bounds.getSize(new Vector3());
    const span = Math.max(size.x, size.z);
    const ground: [string, string, number, number][] = this.options.ground
      ? [
          ["rgba(108,208,255,0.18)", "rgba(108,208,255,0)", 2.2, 0.0005],
          ["rgba(0,0,0,0.6)", "rgba(0,0,0,0)", 1.25, 0.001],
        ]
      : [];
    for (const [inner, outer, scale, lift] of ground) {
      const texture = new CanvasTexture(paintGlow(inner, outer));
      this.textures.push(texture);
      const plane = new Mesh(new PlaneGeometry(span * scale, span * scale), new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
      plane.rotation.x = -Math.PI / 2;
      plane.position.set((bounds.min.x + bounds.max.x) / 2, bounds.min.y - lift, (bounds.min.z + bounds.max.z) / 2);
      this.root.add(plane);
    }
    if (!this.options.fireflies) return;
    const fly = new CanvasTexture(paintGlow("rgba(255,214,102,1)", "rgba(251,191,36,0)"));
    this.textures.push(fly);
    for (let i = 0; i < 3; i++) {
      const sprite = new Sprite(new SpriteMaterial({ map: fly, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }));
      const s = span * 0.05;
      sprite.scale.set(s, s, s);
      const entry = { sprite, phase: i * 2.1, radius: span * (0.62 + i * 0.08), height: size.y * (0.35 + i * 0.25), speed: 0.12 + i * 0.03 };
      sprite.position.set(Math.cos(entry.phase) * entry.radius, entry.height, Math.sin(entry.phase) * entry.radius);
      this.flies.push(entry);
      this.root.add(sprite);
    }
  }

  private perforate(node: Mesh, across: number, down: number, dot: number): void {
    const texture = new CanvasTexture(paintPerforation(dot));
    this.textures.push(texture);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(across, down);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const material = (node.material as MeshStandardMaterial).clone();
    material.map = texture;
    node.material = material;
  }

  private print(node: Mesh, text: string): void {
    // the face's two long sides, whichever way it lies
    const [, across, along] = new Box3()
      .setFromObject(node)
      .getSize(new Vector3())
      .toArray()
      .sort((a, b) => a - b);
    const h = 128;
    const texture = new CanvasTexture(paintPrint(text, Math.round((h * along) / Math.max(1e-6, across)), h));
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.textures.push(texture);
    (node.material as MeshStandardMaterial).dispose();
    node.material = new MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.6, metalness: 0, depthWrite: false });
  }

  private onVisibility = () => {
    if (!document.hidden) this.wake();
  };

  private touched(): void {
    this.controls.autoRotate = false;
    this.tween = null;
    this.wake();
  }

  /** Something may move: draw until it settles. */
  private wake(): void {
    this.lastActive = performance.now();
    this.needsDraw = true;
    if (!this.frame && this.visible && !document.hidden && !this.disposed) this.frame = requestAnimationFrame(this.tick);
  }

  private moving(now: number): boolean {
    if (this.options.reducedMotion) return false;
    return now - this.lastActive < IDLE_STOP_MS;
  }

  private animate(dt: number, now: number): void {
    for (const { node, axis } of this.spinners) node.rotation[axis] += dt * 7;
    const s = now / 1000;
    for (const led of this.leds) {
      if (led.kind === "led-power") led.material.emissiveIntensity = led.base * (0.72 + 0.28 * Math.sin(s * 1.6));
      else if (led.kind === "led-disk") led.material.emissiveIntensity = led.base * (Math.random() < 0.18 ? 0.25 : 1);
    }
    for (const fly of this.flies) {
      const a = fly.phase + s * fly.speed;
      fly.sprite.position.set(Math.cos(a) * fly.radius, fly.height + Math.sin(s * 0.9 + fly.phase) * fly.radius * 0.12, Math.sin(a) * fly.radius);
      (fly.sprite.material as SpriteMaterial).opacity = 0.35 + 0.35 * Math.max(0, Math.sin(s * 1.3 + fly.phase * 3));
    }
  }

  private tick = (now: number) => {
    this.frame = 0;
    if (!this.visible || document.hidden || this.disposed) return;
    this.clock.update(now);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const ambient = this.moving(now);
    // follow the tilt a little at a time
    const t = this.tilt;
    const dA = (t.azimuth - t.applied.azimuth) * 0.12;
    const dP = (t.polar - t.applied.polar) * 0.12;
    if (Math.abs(dA) > 1e-5 || Math.abs(dP) > 1e-5) {
      this.orbit(dA, dP);
      t.applied.azimuth += dA;
      t.applied.polar += dP;
      this.needsDraw = true;
    }
    if (this.tween) {
      const k = Math.min(1, (now - this.tween.start) / 600);
      const e = 1 - (1 - k) ** 3;
      this.camera.position.lerpVectors(this.tween.from, this.tween.to, e);
      if (k >= 1) this.tween = null;
      this.needsDraw = true;
    }
    if (!ambient) this.controls.autoRotate = false;
    const changed = this.controls.update(dt);
    if (ambient) this.animate(dt, now);
    const due = now - this.lastDraw >= 1000 / AMBIENT_FPS - 2;
    if (this.needsDraw || changed || this.tween || (ambient && due)) {
      this.renderer.render(this.scene, this.camera);
      this.lastDraw = now;
      this.needsDraw = false;
      this.frames++;
      this.canvas.dataset.frames = String(this.frames);
      this.canvas.dataset.azimuth = this.controls.getAzimuthalAngle().toFixed(3);
    }
    // the controls' own change event may already have asked for the next frame (wake): one frame is asked for, never two, or each frame would add another to the line
    if (!this.frame && (ambient || changed || this.tween || this.needsDraw || Math.abs(dA) > 1e-5)) this.frame = requestAnimationFrame(this.tick);
  };

  private fit(): void {
    const w = Math.max(1, this.holder.clientWidth);
    const h = Math.max(1, this.holder.clientHeight);
    this.renderer.setPixelRatio(pixelRatioFor(w, h, window.devicePixelRatio));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.wake();
  }

  private orbit(dAzimuth: number, dPolar: number): void {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const s = new Spherical().setFromVector3(offset);
    s.theta += dAzimuth;
    s.phi = MathUtils.clamp(s.phi + dPolar, this.controls.minPolarAngle, this.controls.maxPolarAngle);
    this.camera.position.copy(this.controls.target).add(new Vector3().setFromSpherical(s));
  }

  reset(): void {
    this.controls.autoRotate = false;
    this.controls.target.copy(this.home.target);
    this.tween = { from: this.camera.position.clone(), to: this.home.position.clone(), start: performance.now() };
    this.wake();
  }

  private key(event: KeyboardEvent): void {
    const step = MathUtils.degToRad(15);
    const moves: Record<string, () => void> = {
      ArrowLeft: () => this.orbit(-step, 0),
      ArrowRight: () => this.orbit(step, 0),
      ArrowUp: () => this.orbit(0, -step * 0.66),
      ArrowDown: () => this.orbit(0, step * 0.66),
      "+": () => this.zoom(0.85),
      "=": () => this.zoom(0.85),
      "-": () => this.zoom(1 / 0.85),
      Home: () => this.reset(),
      "0": () => this.reset(),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    this.touched();
    move();
    this.wake();
  }

  private zoom(factor: number): void {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const length = MathUtils.clamp(offset.length() * factor, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(this.controls.target).add(offset.setLength(length));
  }
}
