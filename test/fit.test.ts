import assert from "node:assert/strict";
import { test } from "node:test";
import { check, type Description, type FitCode } from "../src/index.ts";

const codes = (d: Description) => check(d).issues.map((issue) => issue.code);
const fails = (d: Description, code: FitCode) => {
  const report = check(d);
  assert.equal(report.ok, false, JSON.stringify(d));
  assert.ok(report.issues.some((issue) => issue.code === code && issue.level === "error"), `${code} in ${JSON.stringify(report.issues)}`);
  assert.equal(report.size, null);
};
const warns = (d: Description, code: FitCode) => {
  const report = check(d);
  assert.equal(report.ok, true, JSON.stringify(report.issues));
  assert.ok(report.issues.some((issue) => issue.code === code && issue.level === "warning"), `${code} in ${JSON.stringify(report.issues)}`);
};

test("the owner's three machines fit", () => {
  assert.deepEqual(codes({ board: "pi4", case: "armor", hat: "pitft-28" }), []);
  assert.deepEqual(codes({ board: "pi3b", hat: "oled-bonnet" }), []);
  assert.deepEqual(codes({ board: "pi-zero-2w", case: "unipi" }), []);
});

test("a machine needs one start", () => {
  fails({}, "nothing");
  fails({ board: "pi4", base: "mac-studio" }, "board-and-base");
});

test("an unknown part is said by name, even a hostile one", () => {
  fails({ board: "nope" as never }, "unknown-part");
  fails({ board: "__proto__" as never }, "unknown-part");
  fails({ board: "pi4", case: "constructor" as never }, "unknown-part");
  fails({ board: "pi4", hat: "nope" as never }, "unknown-part");
  fails({ base: "nope" }, "unknown-part");
});

test("a case fits only the sockets it is cut for", () => {
  fails({ board: "pi3b", case: "armor" }, "case-wrong-board");
  fails({ board: "pi5", case: "argon" }, "case-wrong-board");
  fails({ board: "pi4", case: "unipi" }, "case-wrong-board");
  fails({ board: "cm4-io", case: "armor" }, "case-too-small");
  assert.ok(check({ board: "pi3b", case: "plate" }).ok);
  assert.ok(check({ board: "cm4-io", case: "plate" }).ok);
});

test("a closed case keeps a hat off the header", () => {
  fails({ board: "pi4", case: "argon", hat: "pitft-28" }, "case-covers-header");
  fails({ board: "pi-zero-2w", case: "unipi", hat: "oled-bonnet", solderHeader: true }, "case-covers-header");
});

test("bare header holes must be soldered first", () => {
  fails({ board: "pi-zero-2w", hat: "oled-bonnet" }, "header-not-soldered");
  assert.ok(check({ board: "pi-zero-2w", hat: "oled-bonnet", solderHeader: true }).ok);
});

test("the network power hat needs its four pins", () => {
  fails({ board: "pi3b", hat: "poe-plus" }, "no-poe-pins");
  fails({ board: "pi2b", hat: "poe-plus" }, "no-poe-pins");
  assert.ok(check({ board: "pi4", hat: "poe-plus" }).ok);
  assert.ok(check({ board: "pi3b-plus", hat: "poe-plus" }).ok);
});

test("a big hat on a small board overhangs, and says by how much", () => {
  warns({ board: "pi-zero-2w", hat: "pitft-28", solderHeader: true }, "hat-overhangs");
});

test("a hat over tall sockets is raised by real sizes", () => {
  const raised = check({ board: "pi4", hat: "pitft-28" });
  assert.ok(raised.ok);
  assert.equal(raised.stack?.riser, 6.2);
  assert.equal(raised.stack?.under, 16.6);
  assert.ok(raised.issues.some((issue) => issue.code === "hat-raised" && issue.level === "note"));
  // a small bonnet clears them on the same header
  assert.equal(check({ board: "pi4", hat: "oled-bonnet" }).stack?.riser, 0);
});

test("a riser that is too short is a warning that names the height", () => {
  warns({ board: "pi4", hat: "pitft-28", riser: 0 }, "hat-meets-part");
  assert.ok(check({ board: "pi4", hat: "pitft-28", riser: 0 }).issues.some((issue) => issue.message.includes("6.2 mm")));
  assert.ok(!codes({ board: "pi4", hat: "pitft-28", riser: 6.2 }).includes("hat-meets-part"));
});

test("a riser has sane limits", () => {
  fails({ board: "pi4", hat: "pitft-28", riser: 31 }, "riser-too-tall");
  fails({ board: "pi4", hat: "pitft-28", riser: -1 }, "riser-too-tall");
  fails({ board: "pi4", riser: 3 }, "riser-without-hat");
});

test("the cooler lifts a hat, and only goes where it fits", () => {
  const under = check({ board: "pi5", cooler: "active-cooler", hat: "pitft-28" });
  assert.ok((under.stack?.riser ?? 0) >= 6);
  fails({ board: "pi4", cooler: "active-cooler" }, "cooler-wrong-board");
});

test("a case's raised header keeps a hat above the case", () => {
  const report = check({ board: "pi4", case: "armor", hat: "pitft-28" });
  assert.equal(report.stack?.under, 16.8);
  assert.equal(report.stack?.riser, 0);
});

test("screens go where they are made to go", () => {
  fails({ board: "pi4", screen: "oled-module" }, "screen-needs-header");
  assert.ok(check({ board: "pi4", hat: "proto-hat", screen: "oled-module" }).ok);
  fails({ board: "pi-zero-2w", screen: "touch-7" }, "screen-wrong-board");
  fails({ board: "pi4", hat: "pitft-28", screen: "oled-module" }, "two-screens");
  fails({ board: "pi4", case: "armor", screen: "touch-7" }, "case-on-screen");
  assert.ok(check({ board: "pi3b", screen: "touch-7" }).ok);
});

test("a stand goes under a slab of the right width", () => {
  assert.ok(check({ base: "ipad", stand: "desk-stand" }).ok);
  assert.ok(check({ base: "ipad", stand: null }).ok);
  fails({ base: "mac-studio", stand: "desk-stand" }, "stand-wrong-base");
  fails({ base: "mac-studio", stand: null }, "stand-wrong-base");
});

test("drives go in bays, no more than there are", () => {
  assert.ok(check({ base: "nas-2bay", drives: ["hdd-35", null] }).ok);
  assert.ok(check({ base: "nas-2bay", drives: ["ssd-25", "hdd-35"] }).ok);
  fails({ base: "nas-2bay", drives: ["hdd-35", "hdd-35", "hdd-35"] }, "too-many-drives");
  fails({ base: "pi400", drives: ["hdd-35"] }, "drives-wrong-base");
  fails({ base: "nas-2bay", drives: ["floppy" as never] }, "unknown-part");
});

test("a part for a board does not go on a whole device, nor the other way", () => {
  fails({ base: "mac-mini", hat: "pitft-28" }, "part-on-base");
  fails({ base: "mac-mini", case: "plate" }, "part-on-base");
  fails({ board: "pi4", stand: "desk-stand" }, "part-on-base");
  fails({ board: "pi4", drives: [] }, "part-on-base");
});

test("the size comes from the parts", () => {
  assert.deepEqual(check({ board: "pi-zero-2w", case: "unipi" }).size, [82, 46, 15]);
  assert.deepEqual(check({ board: "pi4", screen: "touch-7" }).size, [194, 110, 20]);
  const stacked = check({ board: "pi4", case: "armor", hat: "pitft-28" }).size;
  assert.ok(stacked && stacked[2] > 24 && stacked[2] < 27);
});

test("a hat decides which way round it stands, and the caller may say otherwise", () => {
  assert.equal(check({ board: "pi4", hat: "pitft-28" }).turn, 180);
  assert.equal(check({ board: "pi4", hat: "pitft-28", turn: 0 }).turn, 0);
  assert.equal(check({ board: "pi4", hat: "poe-plus" }).turn, 0);
});
