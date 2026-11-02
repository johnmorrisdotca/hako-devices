// The demo's picker, with no page: every machine has one place, the kinds are the list's own and a search finds what the old one found.
import assert from "node:assert/strict";
import { test } from "node:test";
import { allItems, countByKind, familiesOf, FEATURED, isNarrowed, itemById, KINDS, offeredItems, PARTS_KIND, pickedItems, readPicks, shelfKind } from "../demo/gallery-model.ts";
import { catalogue, PARTS } from "../src/index.ts";

test("every machine and every loose part is one row, in a kind that exists", () => {
  const items = allItems();
  const parts = Object.values(PARTS).filter((part) => part.kind !== "board");
  assert.equal(items.length, catalogue().length + parts.length);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  const kinds = new Set(KINDS.map((kind) => kind.id));
  assert.equal(kinds.size, KINDS.length, "two kinds share an id");
  for (const item of items) assert.ok(kinds.has(item.kind), `${item.id} is in ${item.kind}`);
  assert.equal(itemById("part:armor")?.part?.id, "armor");
  assert.equal(itemById("pi4")?.entry?.key, "pi4");
  assert.equal(itemById("no such thing"), undefined);
});

test("NeXT as a family and NeXT as a shelf are two kinds", () => {
  assert.equal(shelfKind("next"), "next-shelf");
  assert.equal(shelfKind("apple"), "apple");
});

test("the first row's machines are all drawn ones", () => {
  for (const key of FEATURED) assert.equal(itemById(key)?.status, "built", key);
});

test("a family has more than one machine or its kind is small: no step of one choice stands for a long list", () => {
  for (const kind of KINDS) {
    const members = allItems().filter((item) => item.kind === kind.id);
    const families = familiesOf(members);
    assert.notEqual(families.length, 1, `${kind.id} has one family, which is no choice`);
    if (members.length > 30) assert.ok(families.length > 1, `${kind.id} has ${members.length} machines and no families`);
    assert.ok(!families.some(([name]) => name === "undefined"));
  }
});

test("a search and the Built choice", () => {
  const items = allItems();
  const built = offeredItems(items, "built", "");
  assert.ok(built.every((item) => item.status === "built"));
  const planned = offeredItems(items, "planned", "");
  assert.ok(planned.length > 500 && planned.every((item) => item.status === "planned"));
  assert.equal(offeredItems(items, "all", "").length, items.length);
  // every word, in any order, and the other names count
  assert.ok(offeredItems(items, "built", "rack nas").some((item) => item.key === "nas-rack"));
  assert.ok(offeredItems(items, "built", "trash-can").some((item) => item.key === "mac-pro-late-2013"));
  assert.equal(offeredItems(items, "all", "nothing has this name").length, 0);
  assert.equal(isNarrowed("  ", {}), false);
  assert.equal(isNarrowed("a", {}), true);
  assert.equal(isNarrowed("", { maker: [] }), false);
  assert.equal(isNarrowed("", { maker: ["Apple"] }), true);
});

test("a filter leaves the loose parts out, and the counts add up", () => {
  const items = offeredItems(allItems(), "all", "");
  assert.ok(items.some((item) => item.kind === PARTS_KIND));
  const apple = pickedItems(items, { maker: ["Apple"] });
  assert.ok(apple.length > 100);
  assert.ok(!apple.some((item) => item.kind === PARTS_KIND));
  assert.equal([...countByKind(apple).values()].reduce((sum, one) => sum + one, 0), apple.length);
});

test("filters read from the address", () => {
  const params: Record<string, string> = { "f-maker": "Apple|Sony", "f-decade": "1990s" };
  assert.deepEqual(readPicks((name) => params[name] ?? null), { maker: ["Apple", "Sony"], decade: ["1990s"] });
});
