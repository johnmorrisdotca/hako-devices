import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { keyPlacements, layoutProblems, parseLayout } from "../src/build/keys.ts";
import { curve8300Layout } from "../src/build/layouts/curve-8300.ts";

test("the 8300 layout is the file, and it fits a 60 mm body", () => {
  const fromFile = parseLayout(JSON.parse(readFileSync(new URL("../src/build/layouts/curve-8300.json", import.meta.url), "utf8")));
  assert.deepEqual(keyPlacements(fromFile), keyPlacements(curve8300Layout));
  assert.equal(keyPlacements(curve8300Layout).length, 33);
  assert.deepEqual(layoutProblems(curve8300Layout, 60), []);
});

test("a row that is too wide is refused", () => {
  const wide = parseLayout({ u: 10, rows: [{ y: 10, h: 4, gap: 1, keys: [1, 1, 1, 1, 1, 1, 1] }] });
  assert.ok(layoutProblems(wide, 60).length > 0);
});

test("two keys on the same spot overlap", () => {
  const piled = parseLayout({ u: 8, rows: [{ y: 10, h: 6, gap: 0, keys: [1, 1] }, { y: 10, h: 6, gap: 0, keys: [1] }] });
  assert.ok(layoutProblems(piled, 80).some((problem) => problem.includes("overlap")));
});
