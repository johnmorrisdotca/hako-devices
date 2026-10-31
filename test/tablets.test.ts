import assert from "node:assert/strict";
import { test } from "node:test";
import { DEVICES } from "../src/catalogue.ts";
import { buildDevice } from "../src/build/index.ts";
import { PRO_CAMERAS } from "../src/build/tablets.ts";

test("everything in an iPad Pro's square of cameras sits inside the square", () => {
  for (const [name, { square, lenses, marks }] of Object.entries(PRO_CAMERAS)) {
    if (!square) continue;
    const spots = [...lenses, ...marks.map(([, across, down, r]) => [across, down, r] as const)];
    for (const [across, down, r] of spots) {
      for (const at of [across, down]) {
        assert.ok(at - r >= square.inset, `${name}: a part leaves the square at ${at}`);
        assert.ok(at + r <= square.inset + square.size, `${name}: a part leaves the square at ${at}`);
      }
    }
  }
});

test("every iPad Pro body is built", () => {
  const pros = DEVICES.filter((device) => device.key.startsWith("ipad-pro"));
  assert.equal(pros.length, 11);
  for (const device of pros) assert.ok(buildDevice(device.key), device.key);
});
