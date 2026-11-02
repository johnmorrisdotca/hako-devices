import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { attributesFromOptions, deviceFromParams, deviceToParams, optionsFromAttributes } from "../src/index.ts";
import { buildDevice } from "../src/build/index.ts";
import { EMBED_KINDS, embedCode } from "../src/embed.ts";

const OPTIONS = { key: "pi4", drawingStyle: "thick", spin: "off", fireflies: true, label: "A small computer" };

test("the root entry does not import the builder or the embed", () => {
  const source = readFileSync("src/index.ts", "utf8");
  assert.doesNotMatch(source, /from "\.\/embed\.ts"/);
  assert.doesNotMatch(source, /from "\.\/build\//);
});

test("options written as attributes and read back draw the same device", () => {
  const attributes = attributesFromOptions(OPTIONS);
  assert.equal(attributes["drawing-style"], "thick");
  assert.equal(attributes.fireflies, "");
  const back = optionsFromAttributes((name) => (name in attributes ? attributes[name] : null));
  assert.equal(embedCode(back, "svg"), embedCode(OPTIONS, "svg"));
});

test("options written as a query and read back draw the same device", () => {
  const query = deviceToParams(OPTIONS);
  assert.equal(query.get("fireflies"), "1");
  assert.equal(embedCode(deviceFromParams(new URLSearchParams(query.toString())), "svg"), embedCode(OPTIONS, "svg"));
});

test("every way of putting a device in a page gives text that holds it", () => {
  assert.deepEqual([...EMBED_KINDS], ["element", "iframe", "module", "svg", "data"]);
  const element = embedCode(OPTIONS, "element");
  assert.match(element, /<script type="module" src="[^"]*element\.js"><\/script>/);
  assert.match(element, /<hako-device\n {2}key="pi4"/);
  assert.match(element, /\n {2}fireflies\n/);
  const iframe = embedCode(OPTIONS, "iframe");
  const src = /src="([^"]+)"/.exec(iframe)?.[1] ?? "";
  assert.match(src, /^https:\/\/johnmorrisdotca\.github\.io\/hako-devices\/embed\.html\?/);
  assert.match(src, /key=pi4/);
  assert.equal(embedCode(deviceFromParams(new URL(src.replaceAll("&amp;", "&")).searchParams), "svg"), embedCode(OPTIONS, "svg"));
  const module = embedCode(OPTIONS, "module");
  assert.match(module, /import \{ build \} from /);
  assert.match(module, /\.svg\("thick"\)/);
  const svg = embedCode(OPTIONS, "svg");
  assert.equal(svg, buildDevice("pi4").svg("thick"));
  const data = embedCode(OPTIONS, "data");
  assert.ok(data.startsWith("data:image/svg+xml;charset=utf-8,"));
  assert.equal(decodeURIComponent(data.slice(data.indexOf(",") + 1)), svg);
});

test("an unknown device and a hostile value stay safe", () => {
  assert.match(embedCode({ key: "no-such-device" }, "svg"), /Coming soon/);
  const code = embedCode({ key: "pi4", print: '"><script>alert(1)</script>' }, "element");
  assert.doesNotMatch(code, /<script>alert/);
  assert.match(code, /&quot;&gt;&lt;script&gt;/);
});

test("a part on its own is that part's drawing", () => {
  assert.match(embedCode({ part: "armor" }, "module"), /buildPart\("armor"\)/);
  assert.match(embedCode({ part: "armor" }, "svg"), /^<svg /);
});
