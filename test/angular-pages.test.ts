// The Angular guide holds the example files word for word.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();

test("the Angular guide holds its example files word for word", () => {
  const guide = read("docs/guides/with-angular.md");
  for (const file of ["examples/angular/device-view.component.ts", "examples/angular/main.ts", "examples/angular/index.html"]) {
    assert.ok(guide.includes(read(file)), file);
  }
});
