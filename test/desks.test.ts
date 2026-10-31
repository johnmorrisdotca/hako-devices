import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { deviceByKey, deviceKeyOf, macKey } from "../src/index.ts";
import { buildDevice } from "../src/build/index.ts";
import { DESKS } from "../src/build/desks/index.ts";
import { DESK_ROWS } from "../src/desk-rows.ts";

const list = (): { key: string; name: string; status: string; notes: string; brand: string; family: string }[] => JSON.parse(readFileSync("data/wishlist.json", "utf8"));

test("every row of the data-described machines has a description, and every description a row", () => {
  assert.deepEqual(new Set(DESK_ROWS.map(([key]) => key)), new Set(Object.keys(DESKS)));
});

test("a mesh from a description is the size of its row, front to back and side to side", () => {
  // the lamp's arm moves, so Apple gives a range; the Portable's row is its closed height and the mesh has its lid up
  for (const [key, , , size] of DESK_ROWS) {
    if (!size) continue;
    const built = buildDevice(key);
    assert.ok(Math.abs(built.size[0] - size[0]) <= Math.max(6, size[0] * 0.05), `${key} width: mesh ${built.size[0]}, listed ${size[0]}`);
    if (!key.startsWith("imac-flat-panel") && !key.startsWith("imac-usb-2-0") && key !== "macintosh-portable") assert.ok(Math.abs(built.size[2] - size[2]) <= Math.max(6, size[2] * 0.05), `${key} height: mesh ${built.size[2]}, listed ${size[2]}`);
  }
});

test("a description has something on its back unless its note says it is left plain", () => {
  const notes = new Map(list().map((entry) => [entry.key, entry.notes]));
  for (const [key, spec] of Object.entries(DESKS)) {
    const onBack = spec.pieces.some((piece) => piece.is === "wrap" || (piece.is === "mark" && (piece.face === "back" || piece.face === "right")));
    if (!onBack) assert.match(notes.get(key) ?? "", /back is (left )?plain|No photograph|not modelled/, key);
  }
});

test("Mac Studio lists the chips Apple lists, and no others", () => {
  const chips = list().filter((entry) => entry.family === "Mac Studio").map((entry) => entry.name);
  for (const chip of ["M1 Max", "M1 Ultra", "M2 Max", "M2 Ultra", "M4 Max", "M3 Ultra", "M5 Max", "M5 Ultra"]) assert.ok(chips.some((name) => name.includes(chip)), chip);
  for (const chip of ["M3 Max", "M4 Ultra"]) assert.ok(!chips.some((name) => name.includes(chip)), chip);
});

test("NeXT is on the list, every model of it drawn by one of three bodies", () => {
  const next = list().filter((entry) => entry.brand === "NeXT" && entry.status === "built");
  assert.deepEqual(next.map((entry) => entry.key).sort(), ["next-computer", "next-megapixel-display", "nextcube", "nextcube-turbo", "nextstation", "nextstation-color", "nextstation-turbo", "nextstation-turbo-color"]);
  assert.equal(deviceByKey("nextcube")?.size?.[0], 305);
});

test("a Mac's hardware identifier finds its own body", () => {
  assert.equal(macKey("Mac17,15"), "mac-studio");
  assert.equal(macKey("Mac14,12"), "mac-mini-2023-m2-pro");
  assert.equal(macKey("MacPro6,1"), "mac-pro-late-2013");
  assert.equal(macKey("MacPro7,1"), "mac-pro-2019");
  assert.equal(macKey("iMac19,1"), "imac-27-inch-late-2012");
  assert.equal(deviceKeyOf({ platform: "darwin", macModel: "Mac16,2" }), "imac-24-two-ports");
});
