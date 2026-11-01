import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { aliasProblems, readAliases } from "../scripts/wishlist-read.ts";
import { aliasesOf, catalogue, findMachine } from "../src/index.ts";
import { ALIAS_DATA } from "../src/alias-data.ts";

const raw = (): { key: string; aliases: string[] }[] => JSON.parse(readFileSync("data/wishlist.json", "utf8"));

test("every alias is lowercase kebab-case ASCII, and belongs to one machine and is no machine's key", () => {
  assert.deepEqual(aliasProblems(raw()), []);
});

test("a clash and a malformed alias are caught", () => {
  const rows = [
    { key: "one", aliases: ["same"] },
    { key: "two", aliases: ["same", "one", "Upper", "under_score", "-lead", "double--dash", "trail-", "café", "has space", "ok-1", "ok-1"] },
    { key: "three", aliases: ["three"] },
  ];
  const problems = aliasProblems(rows);
  assert.equal(problems.length, 11);
  assert.match(problems.join("\n"), /two: "same" is also an alias of one/);
  assert.match(problems.join("\n"), /two: "one" is the key of another machine/);
  assert.match(problems.join("\n"), /three: "three" is its own key/);
  assert.match(problems.join("\n"), /two: "ok-1" is also an alias of two/);
  assert.deepEqual(aliasProblems([{ key: "a", aliases: ["fine-1", "b2"] }, { key: "b" }]), []);
});

test("src/alias-data.ts is made from data/wishlist.json (run pnpm wishlist)", () => {
  assert.deepEqual(ALIAS_DATA, readAliases(raw()));
});

test("every machine on the list has an aliases field, and the catalogue gives the same", () => {
  for (const row of raw()) assert.ok(Array.isArray(row.aliases), row.key);
  for (const entry of catalogue()) assert.deepEqual(aliasesOf(entry.key), raw().find((row) => row.key === entry.key)?.aliases, entry.key);
});

test("findMachine takes a key or an alias, and says nothing for what it does not know", () => {
  for (const entry of catalogue()) {
    assert.equal(findMachine(entry.key), entry, entry.key);
    for (const alias of aliasesOf(entry.key)) assert.equal(findMachine(alias), entry, alias);
  }
  assert.equal(findMachine("rpi-zero")?.name, "Raspberry Pi Zero");
  assert.equal(findMachine("raspberry-pi-zero")?.key, "rpi-zero");
  for (const name of ["trash-can", "trashcan-mac-pro", "mac-pro-2013", "mac-pro-cylinder"]) assert.equal(findMachine(name)?.key, "mac-pro-late-2013", name);
  assert.equal(findMachine("  Trash Can ")?.key, "mac-pro-late-2013");
  assert.equal(findMachine("Trash_Can")?.key, "mac-pro-late-2013");
  assert.equal(findMachine("no-such-machine"), undefined);
  assert.equal(findMachine(""), undefined);
  assert.equal(findMachine("constructor"), undefined);
  assert.deepEqual(aliasesOf("no-such-machine"), []);
});

test("the well-known nicknames find their machines", () => {
  const nicknames: Record<string, string> = {
    "cheese-grater-mac-pro": "mac-pro-mid-2006",
    "lampshade-imac": "imac-flat-panel-15-inch",
    "bondi-blue-imac": "imac-1998",
    "toilet-seat-ibook": "ibook-1999",
    "g4-cube": "power-mac-g4-cube",
    wallstreet: "powerbook-g3-series",
    pismo: "powerbook-firewire",
    lisa: "apple-lisa",
    "fat-mac": "macintosh-512k",
    "rpi-4": "pi4",
    "pi-5": "pi5",
    "jetson-nano": "nvidia-jetson-nano",
    nuc5i5ryk: "intel-nuc5i5ryk",
    "rock-canyon-slim": "nuc-rock-canyon-slim",
    "ps2-slim": "playstation-2-slim",
    "xbox-360-slim": "xbox-360-s",
    gba: "game-boy-advance-agb-001",
    n64: "nintendo-64",
  };
  for (const [alias, key] of Object.entries(nicknames)) assert.equal(findMachine(alias)?.key, key, alias);
});
