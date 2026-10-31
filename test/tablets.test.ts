import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

const list = (): { key: string; family: string; brand: string; dimensionsMm: number[] | null; dimensionsSource: string | null; released?: string; discontinued?: string; lastUpdate?: string; factsSources?: string[] }[] => JSON.parse(readFileSync("data/wishlist.json", "utf8"));
const slabLines = (entry: { family: string }) => /^(iPhone|iPad|Galaxy Tab)/.test(entry.family);

test("a phone or tablet in the list has the longer side as its height, and it names its pages", () => {
  for (const entry of list().filter(slabLines)) {
    if (entry.dimensionsMm) {
      const [width, depth, height] = entry.dimensionsMm;
      assert.ok(height >= width && width > depth, `${entry.key}: ${entry.dimensionsMm.join(" x ")}`);
      assert.ok(entry.dimensionsSource, entry.key);
    }
  }
  const tabs = list().filter((entry) => entry.brand === "Samsung" && entry.family.startsWith("Galaxy Tab"));
  assert.equal(tabs.length, 88);
  for (const entry of tabs) assert.ok(entry.factsSources?.length, entry.key);
});

test("a date in the list is a whole date, in order", () => {
  const whole = /^\d{4}-\d{2}-\d{2}$/;
  for (const { key, released, discontinued, lastUpdate } of list()) {
    for (const date of [released, discontinued, lastUpdate]) if (date) assert.match(date, whole, key);
    if (released && discontinued) assert.ok(released <= discontinued, key);
    if (released && lastUpdate) assert.ok(released <= lastUpdate, key);
  }
});
