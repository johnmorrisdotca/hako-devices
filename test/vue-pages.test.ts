// The Vue guide holds the example files word for word.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();

test("the Vue guide holds its example files word for word", () => {
  const guide = read("docs/guides/with-vue.md");
  for (const file of ["examples/vue/DeviceView.vue", "examples/vue/index.html", "examples/vue/main.ts", "examples/vue/vite.config.ts"]) {
    assert.ok(guide.includes(read(file)), file);
  }
});
