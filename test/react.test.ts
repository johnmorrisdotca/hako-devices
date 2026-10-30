import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { HakoDevice } from "../src/react.ts";

test("the wrapper renders the element with the element's own attributes", () => {
  const html = renderToString(createElement(HakoDevice, { device: "pi4", drawingStyle: "thick", scale: "real", unit: "2px/mm", ruler: true, build: undefined }));
  assert.match(html, /<hako-device/);
  assert.match(html, /device="pi4"/);
  assert.match(html, /drawing-style="thick"/);
  assert.match(html, /scale="real"/);
  assert.match(html, /unit="2px\/mm"/);
  assert.match(html, /ruler=""/);
  assert.ok(!/ key=/.test(html));
});

test("a machine from parts goes through as JSON", () => {
  const html = renderToString(createElement(HakoDevice, { build: { board: "pi4", case: "armor", hat: "pitft-28" } }));
  assert.match(html, /build="\{&quot;board&quot;:&quot;pi4&quot;/);
});
