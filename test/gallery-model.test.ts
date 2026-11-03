// The demo's picker, with no page: every machine has one place, the kinds are the list's own and a search finds what the old one found.
import assert from "node:assert/strict";
import { test } from "node:test";
import { allItems, countByKind, familiesOf, FEATURED, filtersOn, isNarrowed, itemById, kindOf, KINDS, offeredItems, PARTS_KIND, pickedItems, readPicks, readYear, readYears, YEAR_FROM, YEAR_TO, yearHints, yearItems, yearsSet } from "../demo/gallery-model.ts";
import { catalogue, PARTS } from "../src/index.ts";
import { inYears, tagsOf, yearOf, yearSpan } from "../src/tags.ts";

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

test("a machine's kind comes from what it is, whichever list it was written on", () => {
  assert.equal(kindOf("pi4"), "sbc");
  assert.equal(kindOf("rpi-zero"), "sbc");
  assert.equal(kindOf("mac-studio"), "desktops");
  assert.equal(kindOf("nextcube-turbo"), "desktops");
  assert.equal(kindOf("macbook-pro-14"), "laptops");
  assert.throws(() => kindOf("pi4-no-such-thing"), /no kind holds that type/);
});

test("a kind is named for a kind of device: none stands for a maker or a product line", () => {
  const makers = new Set(allItems().flatMap((item) => (item.part ? [] : (tagsOf(item.key).maker ?? []))));
  for (const kind of KINDS) {
    for (const maker of makers) assert.ok(!kind.title.toLowerCase().includes(maker.toLowerCase()), `${kind.title} is named for ${maker}`);
    assert.equal(new Set(kind.types).size, kind.types.length, `${kind.id} lists a type twice`);
  }
  const types = KINDS.flatMap((kind) => kind.types);
  assert.equal(new Set(types).size, types.length, "a type is named by two kinds");
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

test("a year in a box or an address is four digits, and anything else is no limit", () => {
  assert.equal(readYear("1984"), 1984);
  assert.equal(readYear(" 1984 "), 1984);
  for (const raw of [null, "", "198", "19845", "soon", "1e3", "-198", "19.5"]) assert.equal(readYear(raw), null, String(raw));
  const params: Record<string, string> = { [YEAR_FROM]: "1990", [YEAR_TO]: "19" };
  assert.deepEqual(
    readYears((name) => params[name] ?? null),
    { from: 1990, to: null },
  );
});

test("a from and to year narrow the list as the facets do, and leave out a part and an unknown year", () => {
  const items = offeredItems(allItems(), "all", "");
  // no limit leaves everything, parts and unknown years too
  assert.equal(yearItems(items, {}).length, items.length);
  assert.equal(yearItems(items, { from: null, to: null }).length, items.length);
  const unknown = items.find((item) => item.part === null && yearOf(item.key) === null);
  assert.ok(unknown, "a machine of unknown year");
  const years = { from: 1984, to: 1990 };
  const left = yearItems(items, years);
  assert.ok(left.length > 10);
  assert.deepEqual(
    left.map((item) => item.id),
    items.filter((item) => item.part === null && inYears(item.key, years)).map((item) => item.id),
  );
  assert.ok(left.every((item) => item.part === null && (yearOf(item.key) as number) >= 1984 && (yearOf(item.key) as number) <= 1990));
  assert.ok(!left.includes(unknown));
  // one end alone is a limit, and so an unknown year still goes
  assert.ok(!yearItems(items, { to: 3000 }).includes(unknown));
  assert.ok(!yearItems(items, { to: 3000 }).some((item) => item.part !== null));
  // the wrong way round leaves nothing rather than guessing
  assert.equal(yearItems(items, { from: 1990, to: 1984 }).length, 0);
  // with a facet, what is left is what both say
  const apple = pickedItems(left, { maker: ["Apple"] });
  assert.ok(apple.length > 0 && apple.length < left.length);
});

test("a year limit narrows and counts in Filters: N on", () => {
  assert.equal(yearsSet({}), 0);
  assert.equal(yearsSet({ from: null, to: null }), 0);
  assert.equal(yearsSet({ from: 1984 }), 1);
  assert.equal(yearsSet({ from: 1984, to: 1990 }), 2);
  assert.equal(isNarrowed("", {}, { from: null, to: null }), false);
  assert.equal(isNarrowed("", {}, { to: 1990 }), true);
  assert.equal(filtersOn({}, {}), 0);
  assert.equal(filtersOn({ maker: ["Apple", "Sony"], type: ["Laptop"] }, { from: 1984, to: null }), 4);
});

test("the year boxes hint at the machines' own first and last year", () => {
  assert.deepEqual(yearHints(), yearSpan(catalogue().map((entry) => entry.key)));
});
