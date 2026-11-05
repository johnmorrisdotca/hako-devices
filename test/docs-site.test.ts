// The family's documentation generator, copied unchanged. This test reads the files and builds nothing: the pages are written by `pnpm docs:site`.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const pkg = JSON.parse(read("package.json")) as { description: string; scripts: Record<string, string> };

const RECORDED = {
  "scripts/docs-site.mjs": "8c827fce376b6a4622d610f325e0f92936208a68566d9abed8d96ccdace8096a",
  "e2e/docs-site.demo.mjs": "915d74e4017cf117f8322b712ab2f1fa55058d654ff0fca0e476af85bce5fbf6",
};

test("the generator and its browser test are the recorded files, byte for byte", () => {
  for (const path of ["scripts/docs-site.mjs", "e2e/docs-site.demo.mjs"] as const) assert.equal(sha(path), RECORDED[path], path);
});

test("docs/site.json names the job, and the description carries those words", () => {
  const site = JSON.parse(read("docs/site.json")) as { job?: string };
  assert.equal(typeof site.job, "string");
  assert.ok((site.job ?? "").length > 12);
  assert.ok(pkg.description.includes(site.job ?? "\0"));
});

test("a guide is in place, and the generator is a script", () => {
  assert.ok(existsSync("docs/guides/getting-started.md"));
  assert.equal(pkg.scripts["docs:site"], "pnpm build && node scripts/docs-site.mjs build");
  assert.equal(pkg.scripts["docs:check"], "pnpm build && node scripts/docs-site.mjs check");
});
