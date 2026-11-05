// The iframe guide holds the example page word for word.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();

test("the iframe guide holds the example page word for word", () => {
  assert.ok(read("docs/guides/in-an-iframe.md").includes(read("examples/iframe.html")));
});
