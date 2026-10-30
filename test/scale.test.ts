import assert from "node:assert/strict";
import { test } from "node:test";
import { DEVICES, parseUnit, plantMetrics, readMetrics, realPlacement, realScaleSvg, STYLES } from "../src/index.ts";
import { build, buildDevice } from "../src/build/index.ts";

test("every drawing records its scale, box and baseline", () => {
  for (const { key } of DEVICES) {
    const built = buildDevice(key);
    const svg = built.svg();
    const metrics = readMetrics(svg);
    assert.ok(metrics, key);
    assert.deepEqual(metrics, built.metrics(), key);
    assert.ok(svg.includes(`data-mm-per-unit="${metrics.mmPerUnit}"`));
    assert.ok(metrics.mmPerUnit > 0);
    assert.ok(metrics.box[0] < metrics.box[2] && metrics.box[1] < metrics.box[3], key);
    assert.equal(metrics.baseline, metrics.box[3]);
  }
});

test("the box's width at real scale follows the device's real width", () => {
  const widthAt = (key: string, unit = 1) => {
    const metrics = readMetrics(buildDevice(key).svg());
    if (!metrics) throw new Error(key);
    return realPlacement(metrics, unit).width;
  };
  const zero = widthAt("pi-zero-bare");
  const five = widthAt("pi5");
  const tower = widthAt("pc-tower");
  const rack = widthAt("nas-rack");
  // the Zero to the 5, in their three-quarter views: 65 by 30 against 85 by 56 mm
  assert.ok(zero < five && five < tower && tower < rack);
  assert.ok(Math.abs(zero / five - 0.7) < 0.12, String(zero / five));
  // twice the unit, twice the size
  assert.ok(Math.abs(widthAt("pi5", 2) - five * 2) < 1e-6);
  // a device's projected width is within reach of its real plan: never a picture filled regardless
  assert.ok(zero > 60 && zero < 95, String(zero));
  assert.ok(five > 80 && five < 125, String(five));
});

test("a whole picture at real scale hangs from the device's box", () => {
  const place = realPlacement({ mmPerUnit: 0.5, box: [10, 20, 110, 80], baseline: 80 }, 2);
  assert.equal(place.scale, 1);
  assert.equal(place.width, 100);
  assert.equal(place.height, 60);
  assert.equal(place.left, -10);
  assert.equal(place.top, -20);
  assert.equal(place.pictureWidth, 320);
  assert.equal(place.pictureHeight, 220);
});

test("lines keep their style's width whatever the scale: a tiny board and a big tower alike", () => {
  const widths = (svg: string) => [...svg.matchAll(/stroke-width="([\d.]+)" vector-effect="non-scaling-stroke"/g)].map((m) => Number(m[1]));
  for (const name of ["thin", "thick"] as const) {
    const style = STYLES[name];
    const zero = realScaleSvg(buildDevice("pi-zero-bare").svg(name), 2, style);
    const tower = realScaleSvg(buildDevice("pc-tower").svg(name), 2, style);
    assert.ok(widths(zero).length > 5);
    assert.ok(widths(tower).length > 5);
    // the outline of each is a width the style sets: 1.6 to 2.4, by 1 in thin and by 3.5 in thick
    const outline = (list: number[]) => list.filter((w) => w >= 1.6 * style.outline && w <= 2.4 * style.outline);
    assert.ok(outline(widths(zero)).length > 0, `${name} ${widths(zero).join()}`);
    assert.ok(outline(widths(tower)).length > 0, `${name} ${widths(tower).join()}`);
  }
});

test("a dotted row and a drawn handle stay shapes, scaling with the device", () => {
  const svg = realScaleSvg(buildDevice("mac-pro").svg(), 1, STYLES.thin);
  for (const match of svg.matchAll(/<[a-z]+\b[^>]*stroke-dasharray[^>]*\/>/g)) assert.ok(!match[0].includes("vector-effect"), match[0]);
  assert.ok(svg.includes('stroke-width="5"'));
  for (const match of svg.matchAll(/<[a-z]+\b[^>]*stroke-width="5"[^>]*\/>/g)) assert.ok(!match[0].includes("vector-effect"));
});

test("the default stays fit-to-frame: no scaling attribute in a plain drawing", () => {
  const svg = buildDevice("pi4").svg();
  assert.ok(!svg.includes("vector-effect"));
  assert.ok(svg.includes('width="320" height="220"'));
});

test("at real scale the picture has its true size, and its halo is gone", () => {
  const svg = buildDevice("pi4").svg();
  const metrics = readMetrics(svg);
  if (!metrics) throw new Error("no metrics");
  const real = realScaleSvg(svg, 2, STYLES.thin);
  assert.ok(real.includes(`width="${Math.round(320 * metrics.mmPerUnit * 2 * 1000) / 1000}"`));
  assert.ok(!real.includes('url(#halo)"/>'));
});

test("a built machine records the same numbers", () => {
  const machine = build({ board: "pi4", case: "armor", hat: "pitft-28" });
  assert.deepEqual(readMetrics(machine.svg()), machine.metrics());
  assert.deepEqual(readMetrics(machine.svg("thick")), machine.metrics());
});

test("a unit is read as written, and nonsense falls back", () => {
  assert.equal(parseUnit("2px/mm"), 2);
  assert.equal(parseUnit("1.5 px/mm"), 1.5);
  assert.equal(parseUnit(3), 3);
  assert.equal(parseUnit("3"), 3);
  assert.equal(parseUnit(".5"), 0.5);
  assert.equal(parseUnit("nope"), 1);
  assert.equal(parseUnit("-2"), 1);
  assert.equal(parseUnit("0"), 1);
  assert.equal(parseUnit("1000"), 1);
  assert.equal(parseUnit(null, 4), 4);
});

test("metrics plant and read back; a drawing without them has none", () => {
  const metrics = { mmPerUnit: 1.25, box: [1, 2, 3, 4] as const, baseline: 4 };
  assert.deepEqual(readMetrics(plantMetrics('<svg width="320">', metrics)), metrics);
  assert.equal(readMetrics("<svg></svg>"), null);
  assert.equal(realScaleSvg("<svg></svg>", 2, STYLES.thin), "<svg></svg>");
});
