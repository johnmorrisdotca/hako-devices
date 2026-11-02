import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { catalogue, DEVICES } from "../src/index.ts";
import { TAG_DATA } from "../src/tag-data.ts";
import { nameStates, tagProblems, type TagRow } from "../scripts/tag-rules.ts";
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

test("a machine carries the rest of its facts where a source gives them", () => {
  assert.ok(tagsOf("macintosh-xl").weight?.length);
  assert.deepEqual(tagsOf("iphone-4").os, ["iOS"]);
  const third = catalogue().find((entry) => entry.name === "AirPods (3rd generation)");
  assert.ok(third);
  assert.deepEqual(tagsOf(third.key).generation, ["3"]);
});

test("the other makers' lines are on the list, each with a type", () => {
  for (const key of ["fire-tv-stick-4k", "pixel-7", "nexus-5", "jetson-nano"]) assert.ok(keys.includes(key) || keys.some((k) => k.endsWith(key)), key);
  const stick = keys.find((k) => k.endsWith("fire-tv-stick-4k"));
  assert.deepEqual(tagsOf(stick ?? "").type, ["Streaming device"]);
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
  const weights = facetOrder("weight", counts.weight);
  assert.ok(weights.indexOf("Under 1 kg") < weights.indexOf("Over 10 kg"));
  const brands = facetOrder("maker", counts.maker);
  assert.equal(brands[0], "Apple");
});

const rows = (): TagRow[] => JSON.parse(readFileSync("data/wishlist.json", "utf8"));
const row = (tags: TagRow["tags"], more: Partial<TagRow> = {}): TagRow => ({ key: "x", name: "Thing", year: 2001, dimensionsSource: null, tags, ...more });

test("every tag in the list is a known kind and names its page", () => {
  assert.deepEqual(tagProblems(rows()), []);
});

test("a tag with no source fails", () => {
  assert.deepEqual(tagProblems([row({ os: ["Windows"] })]), ["x: os has no source"]);
  assert.deepEqual(tagProblems([row({ wireless: ["Wi-Fi"] }, { tagsSource: "https://example.org/a", dimensionsSource: "https://example.org/b" })]), ["x: wireless has no source"]);
  assert.deepEqual(tagProblems([row({ colour: ["Black"], weight: ["Under 1 kg"], discontinued: ["2005"] })]), ["x: colour has no source", "x: weight has no source", "x: discontinued has no source"]);
  assert.deepEqual(tagProblems([row({ cpu: ["Z80"] })]), ["x: cpu has no source"]);
});

test("a tag with a page passes, and a source that is not a page does not", () => {
  const page = "https://example.org/spec";
  assert.deepEqual(tagProblems([row({ os: ["Windows"], discontinued: ["2005"] }, { tagSources: { os: [page], discontinued: [page] } })]), []);
  assert.deepEqual(tagProblems([row({ cpu: ["Z80"] }, { tagsSource: page })]), []);
  assert.deepEqual(tagProblems([row({ cpu: ["Z80"] }, { dimensionsSource: page })]), []);
  assert.deepEqual(tagProblems([row({ os: ["Windows"] }, { tagSources: { os: ["from memory"] } })]), ["x: os has a source that is not a page address"]);
});

test("an unknown tag kind fails", () => {
  assert.deepEqual(tagProblems([row({ flavour: ["Vanilla"] })]), ["x: flavour is not a tag kind"]);
});

test("a source for a tag the machine does not have, and a bad value, fail", () => {
  assert.deepEqual(tagProblems([row({}, { tagSources: { os: ["https://example.org/a"] } })]), ["x: tagSources names os, which the machine does not have"]);
  assert.deepEqual(tagProblems([row({ discontinued: ["soon"] }, { tagSources: { discontinued: ["https://example.org/a"] } })]), ["x: discontinued is not a four-digit year"]);
  assert.deepEqual(tagProblems([row({ os: [] }, { tagSources: { os: ["https://example.org/a"] } })]), ["x: os has no values"]);
  assert.deepEqual(tagProblems([row({ decade: ["1990s"] })]), ["x: decade is not the decade of 2001"]);
});

test("a generation or a screen size may be read from the name, and only the name", () => {
  assert.deepEqual(tagProblems([row({ generation: ["3"] }, { name: "iPad (3rd generation)" })]), []);
  assert.deepEqual(tagProblems([row({ generation: ["4"] }, { name: "iPad (3rd generation)" })]), ["x: generation has no source"]);
  assert.ok(nameStates("screen", "13-inch", "MacBook Pro (13-inch, Late 2011)"));
  assert.ok(!nameStates("screen", "13-inch", "Raspberry Pi with the 2.13-inch e-paper hat"));
});

test("a family's page is not a model's: a later revision keeps no fact its own page does not give", () => {
  for (const key of ["atari-2600-jr", "atari-lynx-ii"]) {
    const tags = tagsOf(key);
    for (const kind of ["os", "wireless", "weight", "colour", "discontinued"] as const) assert.equal(tags[kind], undefined, `${key} ${kind}`);
  }
});

test("the new kinds come with the list's facts", () => {
  assert.deepEqual(tagsOf("ipad-2").colour, ["Black", "White"]);
  assert.deepEqual(tagsOf("ipad-2").discontinued, ["2014"]);
  assert.deepEqual(tagsOf("macintosh-iifx").discontinued, ["1992"]);
  assert.deepEqual(tagsOf("macbook-air-early-2008").os, ["Mac OS X"]);
  assert.deepEqual(tagsOf("pi4").wireless, ["Wi-Fi", "Bluetooth"]);
  assert.deepEqual(tagsOf("wii-u").wireless, ["Wi-Fi", "Bluetooth"]);
  for (const id of ["discontinued", "colour"] as const) assert.ok(FACETS.some((facet) => facet.id === id), id);
  const counts = facetCounts(keys, {});
  for (const id of ["os", "wireless", "weight", "colour", "discontinued"] as const) assert.ok(counts[id].size >= 3, id);
});

test("years read in order, and every value a machine has is offered", () => {
  const counts = facetCounts(keys, {});
  const years = facetOrder("discontinued", counts.discontinued);
  assert.ok(years.indexOf("1992") < years.indexOf("2014"));
  assert.equal(years.length, counts.discontinued.size);
});
