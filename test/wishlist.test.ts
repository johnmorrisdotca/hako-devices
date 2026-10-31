import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { readWishlist } from "../scripts/wishlist-read.ts";
import { catalogue, catalogueCounts, COMING_SOON_SVG, COVERED, DEVICES, deviceByKey, headingOf, meshOf, PLANNED, SHELVES, statusOf } from "../src/index.ts";

const raw = (): { key: string; status: string; dimensionsMm: number[] | null; dimensionsSource: string | null }[] => JSON.parse(readFileSync("data/wishlist.json", "utf8"));

test("src/wishlist.ts is made from data/wishlist.json (run pnpm wishlist)", () => {
  const { planned, covered } = readWishlist(raw(), new Set(DEVICES.map((device) => device.key)));
  assert.deepEqual(PLANNED, planned);
  assert.deepEqual(COVERED, covered);
});

test("the count is the list's", () => {
  const list = raw();
  const counts = catalogueCounts();
  assert.equal(counts.total, list.length);
  assert.equal(counts.built, list.filter((entry) => entry.status === "built").length);
  assert.equal(counts.planned, list.filter((entry) => entry.status === "planned").length);
  assert.equal(catalogue().length, list.length);
});

test("every built device is on the list, and every machine a mesh covers draws a device", () => {
  const keys = new Set(raw().map((entry) => entry.key));
  for (const device of DEVICES) assert.ok(keys.has(device.key), device.key);
  for (const machine of COVERED) {
    assert.ok(deviceByKey(machine.mesh), machine.key);
    assert.equal(meshOf(machine.key), machine.mesh);
    assert.equal(statusOf(machine.key), "built");
  }
  assert.equal(meshOf(PLANNED[0].key), null);
  assert.equal(statusOf(PLANNED[0].key), "planned");
});

test("a size in the list always names where it came from", () => {
  for (const entry of raw()) if (entry.dimensionsMm) assert.ok(entry.dimensionsSource, entry.key);
});

test("the published package carries names only, none of the list's sizes", () => {
  assert.ok(!existsSync("src/wishlist.json"));
  assert.ok(!/dimensions|wikipedia/i.test(readFileSync("src/wishlist.ts", "utf8")));
  const files = JSON.parse(readFileSync("package.json", "utf8")).files as string[];
  assert.ok(!files.includes("data"));
});

test("a planned machine has a key, a name and its place on a shelf, and no shape", () => {
  const keys = new Set<string>();
  for (const entry of PLANNED) {
    assert.ok(entry.key && entry.name && entry.family, JSON.stringify(entry));
    assert.ok(!keys.has(entry.key), `twice: ${entry.key}`);
    keys.add(entry.key);
    assert.equal(entry.status, "planned");
    assert.deepEqual(Object.keys(entry).sort(), ["family", "key", "maker", "name", "shelf", "status"]);
    assert.equal(deviceByKey(entry.key), undefined);
  }
});

test("the catalogue lists a machine once, built before planned", () => {
  const keys = catalogue().map((entry) => entry.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const device of DEVICES) assert.ok(keys.includes(device.key));
});

test("there is one placeholder, in words and with no machine's shape", () => {
  assert.match(COMING_SOON_SVG, /Coming soon/);
  assert.equal([...COMING_SOON_SVG.matchAll(/<svg /g)].length, 1);
});

test("every machine on the list is on a known shelf, under a heading that names its maker", () => {
  const shelves = new Set(SHELVES.map((shelf) => shelf.id));
  for (const entry of [...PLANNED, ...COVERED]) assert.ok(shelves.has(entry.shelf), entry.key);
  const ds = PLANNED.find((entry) => entry.maker === "Nintendo" && entry.family === "DS");
  assert.equal(ds && headingOf(ds), "Nintendo DS");
  const mac = COVERED.find((entry) => entry.shelf === "apple" && entry.family === "Power Mac");
  assert.equal(mac && headingOf(mac), "Power Mac");
});
