// Every English guide has a Japanese twin, and the twin keeps every fenced block.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");

test("every English guide has a Japanese twin that keeps the code", () => {
  const english = readdirSync("docs/guides").filter((name) => name.endsWith(".md"));
  assert.ok(english.length >= 7);
  for (const name of english) {
    const twin = read(`docs/guides/ja/${name}`);
    for (const fence of read(`docs/guides/${name}`).match(/```[\s\S]*?```/g) ?? []) assert.ok(twin.includes(fence), `${name} lost a block`);
  }
});
