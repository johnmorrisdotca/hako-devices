import assert from "node:assert/strict";
import { test } from "node:test";
import { desktopPicture, OLED_H, OLED_W, oledPicture, panelPicture, paperPicture, phonePicture } from "../src/index.ts";

const words = (steps: ReturnType<typeof panelPicture>) => steps.flatMap((step) => (step.kind === "text" ? [step.text] : []));

test("every picture carries only the caller's words", () => {
  const content = { title: "Kitchen", subtitle: "Home", lines: ["One", "Two"], badge: "OK", clock: "14:13", buttons: ["A", "B"] };
  for (const steps of [panelPicture(content), desktopPicture(content), phonePicture(content), paperPicture(content)]) {
    const all = words(steps);
    assert.ok(all.includes("Kitchen"));
    for (const word of all) assert.ok(["Kitchen", "Home", "One", "Two", "OK", "14:13", "A", "B"].includes(word), word);
  }
  for (const steps of [panelPicture({}), desktopPicture({}), phonePicture({}), paperPicture({})]) assert.deepEqual(words(steps), []);
});

test("a picture fills the size asked for", () => {
  const steps = desktopPicture({ title: "x" }, 800, 446);
  const ground = steps[0];
  assert.equal(ground.kind, "rect");
  if (ground.kind === "rect") assert.deepEqual(ground.box, [0, 0, 800, 446]);
  for (const step of steps) if (step.kind === "rect") assert.ok(step.box[2] > 0 && step.box[3] > 0);
});

test("an OLED's picture is one-bit, in its bounds, its words cut to fit", () => {
  const b = oledPicture({ title: "A very long name that does not fit on the little panel at all", subtitle: "Up", badge: "OK", lines: ["Line one", "Line two", "Line three"], buttons: ["Menu"] });
  assert.equal(b.px.length, OLED_W * OLED_H);
  assert.ok(b.px.every((v) => v === 0 || v === 1));
  assert.ok(b.texts.some(([, , text]) => text.endsWith("…")));
  assert.ok(!b.texts.some(([, , text]) => text === "Line three"));
  assert.ok(b.lit(OLED_W - 3, 4) || b.lit(OLED_W - 2, 2));
  assert.equal(oledPicture({}).px.some((v) => v === 1), false);
});

test("a panel has a rail of buttons only when asked", () => {
  assert.equal(panelPicture({}).filter((step) => step.kind === "rect").length, 2);
  assert.equal(panelPicture({ buttons: ["A", "B", "C", "D", "E"] }).filter((step) => step.kind === "rect" && step.outline).length, 4);
});
