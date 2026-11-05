// The CDN pages in the guide are the files in examples/, word for word, so a reader copies what is kept.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim();

test("the CDN guide holds the two pages word for word", () => {
  const guide = read("docs/guides/from-a-cdn.md");
  for (const file of ["examples/cdn-jsdelivr.html", "examples/cdn-unpkg.html"]) assert.ok(guide.includes(read(file)), file);
});
