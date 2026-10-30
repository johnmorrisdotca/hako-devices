import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { catalogue, DEVICES } from "../src/index.ts";
import { TAG_DATA } from "../src/tag-data.ts";
import { facetCounts, facetOrder, FACETS, matchesPicks, tagsOf } from "../src/tags.ts";

const keys = catalogue().map((entry) => entry.key);

test("every machine has a brand and a type", () => {
  for (const key of keys) {
    const tags = tagsOf(key);
    assert.equal(tags.maker?.length, 1, `${key} brand`);
    assert.equal(tags.type?.length, 1, `${key} type`);
  }
});

test("the table holds the list's tags and nothing but what a facet names", () => {
  const facets = new Set<string>(FACETS.map((facet) => facet.id));
  for (const [key, tags] of Object.entries(TAG_DATA)) for (const facet of Object.keys(tags)) assert.ok(facets.has(facet), `${key}: ${facet}`);
  const raw = JSON.parse(readFileSync("data/wishlist.json", "utf8")) as { key: string; brand: string; tags: { type: string[] } }[];
  for (const entry of raw) {
    assert.deepEqual(TAG_DATA[entry.key]?.type, entry.tags.type, entry.key);
    assert.deepEqual(TAG_DATA[entry.key]?.maker, [entry.brand], entry.key);
  }
});

test("a machine must have one of the values picked in each facet", () => {
  assert.ok(matchesPicks("pi4", { maker: ["Raspberry Pi"], cpu: ["Cortex-A72", "Cortex-A76"] }));
  assert.ok(!matchesPicks("pi4", { maker: ["Raspberry Pi"], cpu: ["Cortex-A76"] }));
  assert.ok(matchesPicks("pi4", {}));
  assert.ok(!matchesPicks("pi4", { maker: ["Apple"] }));
});

test("a plain Pi Zero is on the list, with its facts", () => {
  assert.ok(keys.includes("rpi-zero"));
  assert.deepEqual(tagsOf("rpi-zero").cpu, ["ARM11"]);
  assert.deepEqual(tagsOf("rpi-zero").cores, ["1"]);
  assert.deepEqual(tagsOf("rpi-zero").decade, ["2010s"]);
});

test("a built device also says its ports and parts", () => {
  assert.ok(tagsOf("pi4").ports?.includes("usb-c"));
  assert.ok(tagsOf("pi4-argon").parts?.includes("Case"));
  assert.equal(tagsOf("pi4").parts, undefined);
  const device = DEVICES.find((entry) => entry.ports.length > 0);
  assert.ok(device && tagsOf(device.key).ports?.length);
});

test("a count is what picking that value would show, and a facet's own picks do not narrow it", () => {
  const picks = { maker: ["Apple"] };
  const counts = facetCounts(keys, picks);
  for (const [value, count] of counts.cpuMaker) assert.equal(count, keys.filter((key) => matchesPicks(key, { ...picks, cpuMaker: [value] })).length, value);
  assert.ok((counts.maker.get("Nintendo") ?? 0) > 0, "another brand stays on offer");
});

test("values read in a sensible order", () => {
  const counts = facetCounts(keys, {});
  const ram = facetOrder("ram", counts.ram);
  assert.ok(ram.indexOf("512 MB") < ram.indexOf("1 GB"));
  assert.ok(ram.indexOf("1 GB") < ram.indexOf("16 GB"));
  const decades = facetOrder("decade", counts.decade);
  assert.ok(decades.indexOf("1980s") < decades.indexOf("2020s"));
  const cores = facetOrder("cores", counts.cores);
  assert.ok(cores.indexOf("2") < cores.indexOf("12"));
  const brands = facetOrder("maker", counts.maker);
  assert.equal(brands[0], "Apple");
});
