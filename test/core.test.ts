import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanPanelFace, cleanStyle, CROSSFADE_MS, DEFAULT_STYLE, deviceKeyOf, DEVICES, deviceByKey, drawingFile, DRAWING_HOLD_MS, frameFor, inStyle, macKey, MAX_PIXELS, MAX_SIDE, nasKey, pcKey, piBoard, piKey, pixelRatioFor, REDUCED_FADE_MS, revealDelay, STYLE_NAMES, STYLES, tiltMode, tiltTurn, withHeavierLine } from "../src/index.ts";
import { buildDevice } from "../src/build/index.ts";

test("the camera: a tall device from the front, a flat board from higher up, a screen looked at", () => {
  const tall = frameFor([0, 0, 0], [100, 200, 100], null, 320 / 220);
  const flat = frameFor([0, 0, 0], [100, 5, 100], null, 320 / 220);
  const lit = frameFor([0, 0, 0], [100, 5, 100], [50, 5, 50], 320 / 220);
  const lift = (f: typeof tall) => (f.position[1] - f.target[1]) / f.distance;
  assert.ok(lift(flat) > lift(tall));
  assert.ok(lift(lit) > lift(flat));
  assert.ok(tall.distance > flat.distance);
});

test("the crossfade: the drawing holds, reduced motion does not wait", () => {
  assert.equal(revealDelay(1000, 1100, false), DRAWING_HOLD_MS - 100);
  assert.equal(revealDelay(1000, 5000, false), 0);
  assert.equal(revealDelay(1000, 1100, true), 0);
  assert.ok(CROSSFADE_MS > REDUCED_FADE_MS);
});

test("tilt: asked for only where it must be, off under reduced motion or a mouse", () => {
  const base = { reducedMotion: false, coarsePointer: true, hasOrientation: true, needsPermission: false };
  assert.equal(tiltMode(base), "on");
  assert.equal(tiltMode({ ...base, needsPermission: true }), "ask");
  assert.equal(tiltMode({ ...base, reducedMotion: true }), "off");
  assert.equal(tiltMode({ ...base, coarsePointer: false }), "off");
  assert.equal(tiltMode({ ...base, hasOrientation: false }), "off");
  assert.equal(tiltTurn({ beta: null, gamma: 0 }, { beta: 0, gamma: 0 }), null);
  const turn = tiltTurn({ beta: 10, gamma: 100 }, { beta: 0, gamma: 0 });
  assert.equal(turn?.azimuth, 25);
});

test("the canvas is held to a pixel budget, whatever the screen", () => {
  assert.equal(pixelRatioFor(620, 827, 2), 2);
  assert.equal(pixelRatioFor(620, 827, 1), 1);
  assert.equal(pixelRatioFor(620, 827, 3), 2);
  for (const [w, h, ratio] of [[2560, 1440, 2], [5120, 2880, 2], [1, 10000, 2], [10000, 10000, 2], [800, 600, Number.NaN], [800, 600, 0], [0, 0, 2], [-5, 20, 2]] as const) {
    const r = pixelRatioFor(w, h, ratio);
    assert.ok(r >= 0.25 && r <= 2, `${w}x${h} at ${ratio}: ${r}`);
    if (w > 0 && h > 0 && r > 0.25) {
      assert.ok(w * r * (h * r) <= MAX_PIXELS * 1.0001, `${w}x${h} at ${ratio}: ${r}`);
      assert.ok(Math.max(w, h) * r <= MAX_SIDE * 1.0001, `${w}x${h} at ${ratio}: ${r}`);
    }
  }
  assert.equal(pixelRatioFor(800, 600, Number.NaN), 1);
});

test("a board's model line gives its key", () => {
  assert.equal(piKey("Raspberry Pi 4 Model B Rev 1.4"), "pi4");
  assert.equal(piKey("Raspberry Pi 5 Model B Rev 1.0"), "pi5");
  assert.equal(piKey("Raspberry Pi Zero W Rev 1.1"), "pi-zero-w");
  assert.equal(piKey("Raspberry Pi Zero 2 W Rev 1.0"), "pi-zero");
  assert.equal(piKey("Raspberry Pi 400 Rev 1.0"), "pi400");
  assert.equal(piKey("Raspberry Pi 3 Model B Plus Rev 1.3"), "pi3b-plus");
  assert.equal(piKey("Raspberry Pi 4 Model B Rev 1.4", "pitft"), "pi4-pitft");
  assert.equal(piKey("Raspberry Pi 3 Model B Rev 1.2", "oled"), "pi3b-oled");
  assert.equal(piKey("Raspberry Pi 5 Model B", "oled"), "pi5");
  assert.equal(piKey("Banana"), null);
  assert.equal(piBoard("Raspberry Pi Compute Module 4 Rev 1.0"), "cm4");
  assert.equal(cleanPanelFace(" OLED "), "oled");
  assert.equal(cleanPanelFace("nope"), "");
});

test("a NAS's name gives its bays", () => {
  assert.equal(nasKey("DS718+"), "nas-2bay");
  assert.equal(nasKey("synology ds1515+"), "nas-5bay");
  assert.equal(nasKey("DS218"), "nas-2bay");
  assert.equal(nasKey("DS118"), "nas-1bay");
  assert.equal(nasKey("DS923+"), "nas-4bay");
  assert.equal(nasKey("RS820RP+"), "nas-rack");
  assert.equal(nasKey("not a nas"), null);
});

test("an identifier gives its desktop or laptop", () => {
  assert.equal(macKey("Mac13,1"), "mac-studio");
  assert.equal(macKey("Mac16,10"), "mac-mini");
  assert.equal(macKey("Macmini9,1"), "mac-mini-m1");
  assert.equal(macKey("MacBookPro18,3"), "macbook-pro-14");
  assert.equal(macKey("MacBookAir7,2"), "macbook");
  assert.equal(macKey(""), "mac-mini");
  assert.equal(pcKey("NUC12WSHi7"), "nuc-12-tall");
  assert.equal(pcKey("NUC12WSKi5"), "nuc-12-slim");
  assert.equal(pcKey("NUC8i5BEH"), "nuc-bean-canyon-tall");
  assert.equal(pcKey("RNUC12WSHI70000"), "nuc-12-tall");
  assert.equal(pcKey("NUC6i7KYK"), "nuc-skull-canyon");
  assert.equal(pcKey("NUC14RVHU5"), "nuc-revel-canyon-tall");
  assert.equal(pcKey("D54250WYK"), "nuc-wilson-canyon-slim");
  assert.equal(pcKey("NUC99ZZZ"), "nuc");
  assert.equal(pcKey("Dell"), "unknown");
});

test("one key from any facts, never an exception", () => {
  assert.equal(deviceKeyOf(null), "unknown");
  assert.equal(deviceKeyOf({ model: "Raspberry Pi 4 Model B", panel: "pitft" }), "pi4-pitft");
  assert.equal(deviceKeyOf({ toldModel: "DS718+" }), "nas-2bay");
  assert.equal(deviceKeyOf({ platform: "darwin", macModel: "Mac13,1" }), "mac-studio");
  assert.equal(deviceKeyOf({ platform: "darwin", container: true, dmiProduct: "NUC8" }), "nuc");
  assert.equal(deviceKeyOf({ model: 3 as unknown as string }), "unknown");
});

test("every key the mapping can give is in the catalogue", () => {
  for (const key of ["pi-zero", "pi-zero-w", "pi1b-plus", "pi2b", "pi3a-plus", "pi3b-plus", "pi3b", "pi4", "pi400", "pi5", "pi500", "cm4-io", "pi3b-oled", "pi4-pitft", "nas-1bay", "nas-2bay", "nas-4bay", "nas-5bay", "nas-rack", "mac-studio", "mac-mini", "mac-mini-m1", "mac-pro", "imac-24", "macbook", "macbook-air-13", "macbook-pro-14", "macbook-pro-16", "nuc", "nuc-12-tall", "nuc-12-slim", "unknown"])
    assert.ok(deviceByKey(key), key);
});

test("a style is one table entry: thin is the default, thick the same shapes with a heavier line", () => {
  assert.equal(DEFAULT_STYLE, "thin");
  assert.deepEqual(STYLE_NAMES, ["thin", "thick"]);
  assert.equal(cleanStyle("thick"), "thick");
  assert.equal(cleanStyle("constructor"), "thin");
  assert.equal(cleanStyle(undefined), "thin");
  assert.equal(drawingFile("pi4"), "pi4.svg");
  assert.equal(drawingFile("pi4", "thick"), "pi4.thick.svg");
  const shapes = (svg: string) => [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
  for (const { key } of DEVICES.filter((device) => device.family === "pi-boards" || device.family === "nas")) {
    const built = buildDevice(key);
    assert.deepEqual(shapes(built.svg("thick")), shapes(built.svg("thin")), key);
  }
  assert.equal(inStyle('<path stroke="#8fa1b8" stroke-width="2"/>', STYLES.thick), '<path stroke="#b4c2d4" stroke-width="7"/>');
  assert.equal(inStyle('<path stroke-width="1"/>', STYLES.thick), '<path stroke-width="1.8"/>');
  // a drawn shape keeps its width
  assert.equal(inStyle('<path stroke-width="5"/>', STYLES.thick), '<path stroke-width="5"/>');
  assert.equal(withHeavierLine('<path stroke-width="2"/>', 2.6), '<path stroke-width="5.2"/>');
});

test("a new style needs no drawing code: a table entry is enough", () => {
  const pale = { line: "#ffffff", outline: 2, detail: 1, fills: { "#0b111c": "#222222" }, pictures: "fine" as const, androidEdge: null, androidShell: null, small: null };
  const text = inStyle('<path fill="#0b111c" stroke="#8fa1b8" stroke-width="2"/>', pale);
  assert.equal(text, '<path fill="#222222" stroke="#ffffff" stroke-width="4"/>');
});
