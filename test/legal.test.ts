// No logo, no mark, no brand printing on any mesh or drawing; no private word of the project this came from. Held on the generated files and on the source that draws them.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { DEVICES, PARTS, STYLE_NAMES } from "../src/index.ts";
import { buildDevice, buildPart, MATERIALS } from "../src/build/index.ts";

const BRANDS = /apple|macbook|imac|ipad|iphone|raspberry|\bpi[- ]?red\b|synology|diskstation|adafruit|pitft|intel\b|nuc\b|argon|waveshare|fire ?tv|android|bravia|sony|google|amazon|unipi|hotaru|firefly/i;

const walk = (folder: string): string[] =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

test("no brand word is in any mesh's data or any drawing, in any style", () => {
  const each = (name: string, built: ReturnType<typeof buildPart>) => {
    const { bytes } = built.glb();
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const json = new TextDecoder().decode(bytes.subarray(20, 20 + view.getUint32(12, true)));
    assert.ok(!BRANDS.test(json), `${name}.glb: ${BRANDS.exec(json)?.[0]}`);
    for (const style of STYLE_NAMES) {
      const svg = built.svg(style);
      assert.ok(!BRANDS.test(svg), `${name} ${style}: ${BRANDS.exec(svg)?.[0]}`);
      assert.ok(!svg.includes("<text"), `${name} ${style} carries words of its own`);
      assert.ok(!svg.includes("<image"), `${name} ${style} carries a picture`);
    }
  };
  for (const { key } of DEVICES) each(key, buildDevice(key));
  for (const id of Object.keys(PARTS)) each(id, buildPart(id));
});

test("no material is named for a product or a mark", () => {
  for (const name of Object.keys(MATERIALS)) assert.ok(!BRANDS.test(name) && name !== "logo", name);
});

test("the code that draws has no mark in it", () => {
  const banned = /appleMark|appleShapes|appleDot|raspberryMark|printedBerry|flower|berry|"logo"|paintPrint\([^)]*true/;
  for (const file of [...walk("src/build"), ...walk("src/draw"), ...walk("src/element")]) {
    const text = readFileSync(file, "utf8");
    assert.ok(!banned.test(text), `${file}: ${banned.exec(text)?.[0]}`);
  }
});

test("nothing private: no project word, no owner's address, no home, in the source or the demo", () => {
  const banned = /hotaru|hotarutv|\bowner's\b|the owner|10\.0\.0\.|192\.168\.|relay's|\/Users\/john|Projects\/backups/i;
  // docs/wishlist.md and data/ come from the list's own maker, and are read as they are
  const docs = walk("docs").filter((file) => file.endsWith(".md") && !file.endsWith("wishlist.md"));
  for (const file of [...walk("src"), ...walk("demo"), ...docs, "README.md", "NOTICE.md", "CONTRIBUTING.md", "SECURITY.md"]) {
    const text = readFileSync(file, "utf8");
    assert.ok(!banned.test(text), `${file}: ${banned.exec(text)?.[0]}`);
  }
});

test("the README says whose the trademarks are", () => {
  const readme = readFileSync("README.md", "utf8");
  assert.match(readme, /All trademarks belong to their owners/);
  assert.match(readme, /not affiliated/);
});
