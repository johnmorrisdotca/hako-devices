// The Svelte guide holds the example files word for word.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();

test("the Svelte guide holds its example files word for word", () => {
  const guide = read("docs/guides/with-svelte.md");
  for (const file of ["examples/svelte/DeviceView.svelte", "examples/svelte/index.html", "examples/svelte/main.ts"]) {
    assert.ok(guide.includes(read(file)), file);
  }
});
