// The element's module in Node: importing it on a server does nothing and throws nothing, so a page rendered there can import it.
import assert from "node:assert/strict";
import { test } from "node:test";

test("the element's module imports where there is no DOM", async () => {
  const module = await import("../src/element.ts");
  assert.equal(typeof module.HakoDevice, "function");
  assert.equal(typeof module.HakoLineup, "function");
  assert.equal(typeof module.defineHakoDevice, "function");
  module.defineHakoDevice();
  module.setAssetBase("https://example.test/assets");
});
