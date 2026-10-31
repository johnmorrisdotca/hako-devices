import assert from "node:assert/strict";
import { test } from "node:test";
import { catalogue, catalogueCounts, check, DEVICES, deviceByKey, FAMILIES, FINISHES, groupLayout, groupSample, PLANNED, PRESETS, statusOf } from "../src/index.ts";
import { buildDevice } from "../src/build/index.ts";

test("every device has a unique key, a name, a known family and a known status", () => {
  const keys = new Set<string>();
  for (const device of DEVICES) {
    assert.ok(!keys.has(device.key), device.key);
    keys.add(device.key);
    assert.ok(device.name.length > 0, device.key);
    assert.ok(FAMILIES.some((family) => family.id === device.family), device.key);
    assert.equal(device.status, "built");
    assert.equal(deviceByKey(device.key), device);
  }
  assert.ok(DEVICES.length >= 55);
});

test("every family has something in it", () => {
  for (const family of FAMILIES) assert.ok(DEVICES.some((device) => device.family === family.id), family.id);
});

test("every device's parts go together, with no warning", () => {
  for (const device of DEVICES) {
    const report = check(device.parts);
    assert.ok(report.ok, `${device.key}: ${JSON.stringify(report.issues)}`);
    assert.deepEqual(report.issues.filter((issue) => issue.level === "warning"), [], device.key);
  }
});

test("every preset goes together and builds", () => {
  for (const preset of PRESETS) {
    const report = check(preset.description);
    assert.ok(report.ok, `${preset.id}: ${JSON.stringify(report.issues)}`);
    assert.ok(buildDevice !== undefined);
  }
  assert.ok(PRESETS.some((preset) => preset.description.board === "pi4" && preset.description.case === "armor" && preset.description.hat === "pitft-28"));
  assert.ok(PRESETS.some((preset) => preset.description.board === "pi3b" && preset.description.hat === "oled-bonnet"));
  assert.ok(PRESETS.some((preset) => preset.description.board === "pi-zero-2w" && preset.description.case === "unipi"));
});

test("each mesh is near the device's published width and height or depth", () => {
  // the stick's entry is the stick; its mesh has the remote beside it
  const notTheSame = new Set(["client-firetv"]);
  for (const device of DEVICES) {
    if (!device.size || notTheSame.has(device.key)) continue;
    const { size } = buildDevice(device.key);
    const allowed = Math.max(10, device.size[0] * 0.12);
    assert.ok(Math.abs(size[0] - device.size[0]) <= allowed, `${device.key}: mesh ${size[0]}, published ${device.size[0]}`);
  }
});

test("ports are positive counts", () => {
  for (const device of DEVICES) for (const port of device.ports) assert.ok(port.count > 0, `${device.key} ${port.kind}`);
});

test("the catalogue says built or planned", () => {
  assert.equal(statusOf("pi4"), "built");
  assert.equal(statusOf("not-a-device-at-all"), null);
  const counts = catalogueCounts();
  assert.ok(counts.built >= DEVICES.length);
  assert.equal(counts.total, catalogue().length);
  assert.equal(counts.planned, counts.total - counts.built);
  for (const entry of PLANNED) {
    if (deviceByKey(entry.key)) continue;
    assert.equal(statusOf(entry.key), "planned", entry.key);
    assert.equal(entry.status, "planned");
  }
});

test("a group's picture takes up to four, the first in front; a sample shows the range", () => {
  assert.equal(groupLayout(0).length, 0);
  assert.equal(groupLayout(1).length, 1);
  assert.equal(groupLayout(9).length, 4);
  const [front, ...rest] = groupLayout(4);
  for (const place of rest) assert.ok(front.order > place.order);
  assert.deepEqual(groupSample([1, 2, 3, 4, 5, 6, 7]), [1, 3, 5, 7]);
  assert.deepEqual(groupSample([1, 1, 2]), [1, 2]);
});

test("every colour of a machine is a device of its own", () => {
  for (const [key, options] of Object.entries(FINISHES)) {
    assert.ok(options.some((option) => option.key === key), key);
    for (const option of options) assert.ok(deviceByKey(option.key), option.key);
  }
});
