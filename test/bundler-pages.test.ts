// The bundler guide holds the Vite and webpack files word for word.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();

test("the bundler guide holds the Vite and webpack files word for word", () => {
  const guide = read("docs/guides/with-a-bundler.md");
  for (const file of ["examples/vite/index.html", "examples/vite/main.ts", "examples/webpack/src/index.js", "examples/webpack/webpack.config.mjs"]) {
    assert.ok(guide.includes(read(file)), file);
  }
});
