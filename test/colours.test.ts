import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { type ColourListRow, colourProblems, type ColourRow, colourTable, readColours } from "../scripts/colour-rules.ts";
import { readTags } from "../scripts/wishlist-read.ts";
import { MATERIALS } from "../src/build/kit.ts";
import { COLOUR_DATA, COLOUR_PAGES } from "../src/colour-data.ts";
import { colouredKeys, coloursOf, wordSwatch } from "../src/colours.ts";
import { catalogue, deviceByKey, DEVICES, FINISHES } from "../src/index.ts";
import { bodyColourValue, bodyMaterial } from "../src/element/body.ts";
import { tagsOf } from "../src/tags.ts";

const rows = JSON.parse(readFileSync("data/colours.json", "utf8")) as ColourRow[];
const list = JSON.parse(readFileSync("data/wishlist.json", "utf8")) as ColourListRow[];
const devices = new Set(DEVICES.map((device) => device.key));
const page = "https://example.org/a";
const one = (colours: ColourRow["colours"], extra: Partial<ColourRow> = {}): ColourRow => ({ keys: ["x"], source: page, colours, ...extra });
const known: ColourListRow[] = [{ key: "x", tags: {} }];

test("src/colour-data.ts is made from data/colours.json and the list (run pnpm wishlist)", () => {
  const { pages, data } = colourTable(readColours(rows, list));
  assert.deepEqual(COLOUR_PAGES, pages);
  assert.deepEqual(COLOUR_DATA, data);
});

test("data/colours.json keeps the rules", () => {
  assert.deepEqual(colourProblems(rows, list, devices), []);
});

test("the rules refuse a colour with no page, a bad value or an unknown machine", () => {
  const found = (row: ColourRow, rowsOf: ColourListRow[] = known) => colourProblems([row], rowsOf, devices);
  assert.deepEqual(found(one(["Black"])), []);
  assert.deepEqual(found(one(["Black"], { source: "from memory" })), ["x: the row's source is not a page address"]);
  assert.deepEqual(found(one([])), ["x: has no colours"]);
  assert.deepEqual(found(one([""])), ["x: a colour has no name"]);
  assert.deepEqual(found(one(["Black", "Black"])), ["x: Black is there twice"]);
  assert.deepEqual(found(one(["Black"], { keys: ["nobody"] })), ["nobody: is not on the list"]);
  assert.deepEqual(found(one(["Black"]), [{ key: "x", tags: { colour: ["Black"] } }]), ["x: already has its colours as tags in data/wishlist.json"]);
  assert.deepEqual(found(one([{ name: "Blue", swatch: "#0000ff" }])), ["x: Blue has a swatch with no page and no drawing"]);
  assert.deepEqual(found(one([{ name: "Blue", swatch: "blue", swatchSource: page }])), ["x: Blue has a swatch that is not #rrggbb in lowercase"]);
  assert.deepEqual(found(one([{ name: "Blue", swatchSource: page }])), ["x: Blue has a swatch source and no swatch"]);
  assert.deepEqual(found(one([{ name: "Blue", drawing: "no-such-device" }])), ["x: Blue names a drawing that is not a device: no-such-device"]);
  assert.deepEqual(colourProblems([one(["Black"]), one(["White"])], known, devices), ["x: is in two rows"]);
});

test("every colour has its name and its page, a swatch that says where it comes from, and any drawing is a device", () => {
  const onList = new Set(catalogue().map(({ key }) => key));
  for (const key of colouredKeys()) {
    assert.ok(onList.has(key), key);
    const colours = coloursOf(key);
    assert.ok(colours.length > 0, key);
    for (const { name, sources, swatch, drawing } of colours) {
      assert.ok(name.trim(), key);
      assert.ok(sources.length > 0, `${key} ${name} has no page`);
      for (const source of sources) assert.match(source, /^https?:\/\//);
      if (swatch) {
        assert.match(swatch.value, /^#[0-9a-f]{6}$/);
        assert.ok(["page", "drawing", "word"].includes(swatch.from));
        assert.equal(swatch.source !== null, swatch.from === "page", `${key} ${name}`);
      }
      if (drawing) assert.ok(deviceByKey(drawing), drawing);
    }
  }
});

test("a machine nobody has checked says nothing, and a hostile key finds nothing", () => {
  assert.deepEqual(coloursOf("a-machine-nobody-has"), []);
  for (const key of ["__proto__", "constructor", "toString"]) assert.deepEqual(coloursOf(key), []);
});

test("the list's own colour tags come through, and the facet says what the table says", () => {
  assert.deepEqual(coloursOf("ipad-2").map(({ name }) => name), ["Black", "White"]);
  assert.ok(coloursOf("ipad-2")[0].sources.some((source) => source.includes("apple.com")));
  for (const key of colouredKeys()) assert.deepEqual(tagsOf(key).colour, coloursOf(key).map(({ name }) => name), key);
  const tags = readTags([{ key: "x", brand: "B", tags: {} }], { x: [{ name: "Teal" }] });
  assert.deepEqual(tags.x.colour, ["Teal"]);
});

test("white and black are there where the machine came in both", () => {
  for (const key of ["macbook-13-inch-mid-2006", "wii-u", "ipod-nano-1st-generation"]) {
    const names = coloursOf(key).map(({ name }) => name);
    assert.ok(names.includes("White") && names.includes("Black"), key);
  }
  assert.deepEqual(coloursOf("imac-1998").map(({ name, swatch, drawing }) => [name, swatch?.from, drawing]), [["Bondi Blue", "page", "imac-1998"]]);
  assert.deepEqual(coloursOf("imac-266-mhz").map(({ name }) => name), ["Blueberry", "Grape", "Tangerine", "Lime", "Strawberry"]);
});

test("every finish is a colour of its machine with that drawing, and FINISHES still answers", () => {
  for (const [key, options] of Object.entries(FINISHES)) {
    const drawings = coloursOf(key).map(({ drawing }) => drawing);
    for (const option of options) assert.ok(drawings.includes(option.key), `${key} ${option.key}`);
    assert.deepEqual(coloursOf(options[1].key).map(({ name }) => name), coloursOf(key).map(({ name }) => name));
  }
  assert.deepEqual(FINISHES["macbook-pro-14"].map(({ key, finish }) => [key, finish]), [["macbook-pro-14", "Black"], ["macbook-pro-14-silver", "Silver"]]);
});

test("a colour with no drawing of its own is still listed, and says so", () => {
  const starlight = coloursOf("macbook-air-m2-2022").find(({ name }) => name === "Starlight");
  assert.equal(starlight?.drawing, null);
  assert.equal(starlight?.swatch, null);
  const seven = coloursOf("imac-24-inch-m1-2021");
  assert.equal(seven.length, 7);
  assert.deepEqual(seven.filter(({ drawing }) => drawing).map(({ name, drawing }) => [name, drawing]), [["Blue", "imac-24"]]);
});

test("a swatch read from a drawing is the colour that drawing is made of", () => {
  const made = new Set<string>(Object.values(MATERIALS).map(({ color }) => color));
  for (const key of colouredKeys()) for (const { swatch } of coloursOf(key)) if (swatch?.from === "drawing") assert.ok(made.has(swatch.value), `${key} ${swatch.value}`);
});

test("a word's swatch is only ever the plain word in the name", () => {
  assert.equal(wordSwatch("Sierra Blue"), wordSwatch("Blue"));
  assert.equal(wordSwatch("(PRODUCT)RED"), wordSwatch("Red"));
  assert.equal(wordSwatch("Space Gray"), wordSwatch("Gray"));
  for (const name of ["Midnight", "Starlight", "Obsidian", "Black & Slate", "Gold/Beige", "Red and Blue", "", "__proto__", "constructor"]) assert.equal(wordSwatch(name), null, name);
});

test("the body of a mesh is its largest surface that can be one, and a colour is only ever #rrggbb", () => {
  assert.equal(bodyMaterial(new Map([["alu", 9], ["shell-blue", 12], ["front-glass", 40], ["led-power", 1]])), "shell-blue");
  assert.equal(bodyMaterial(new Map([["plastic-white", 50], ["plastic-bondi", 10]])), "plastic-bondi");
  assert.equal(bodyMaterial(new Map([["plastic-white", 50], ["alu", 10]])), "plastic-white");
  assert.equal(bodyMaterial(new Map([["front-glass", 40], ["pcb-green", 30]])), null);
  assert.equal(bodyMaterial(new Map()), null);
  assert.equal(bodyColourValue("#AABBCC"), "#aabbcc");
  for (const bad of [null, "", "red", "#abc", "#gggggg", "#aabbcc;background:url(x)", "<script>"]) assert.equal(bodyColourValue(bad), null, String(bad));
});
