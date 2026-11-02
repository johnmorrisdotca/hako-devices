// What fits, and the nearest set that works: every board, case, hat, module and cooler, walked as a person would, can never end in an error.
import assert from "node:assert/strict";
import { test } from "node:test";
import { BOARDS, CASES, check, CHOICE_SLOTS, type ChoiceSlot, COOLERS, type Description, fillNeeded, HATS, nearestWorking, PRESETS, SCREENS, stillWorks, whatFits } from "../src/index.ts";

const noError = (d: Description) => {
  const report = check(d);
  assert.deepEqual(report.issues.filter((issue) => issue.level === "error"), [], JSON.stringify(d));
  assert.equal(report.ok, true);
};
const tables: Record<ChoiceSlot, Record<string, unknown>> = { board: BOARDS, case: CASES, hat: HATS, screen: SCREENS, cooler: COOLERS };
const optionsOf = (slot: ChoiceSlot): (string | null)[] => (slot === "board" ? Object.keys(BOARDS) : [null, ...Object.keys(tables[slot])]);
const withChoice = (d: Description, slot: ChoiceSlot, id: string | null): Description => {
  const next: Record<string, unknown> = { ...d };
  if (id === null) delete next[slot];
  else next[slot] = id;
  return next as Description;
};
const keyOf = (d: Description) => JSON.stringify([...CHOICE_SLOTS.map((slot) => d[slot] ?? null), d.solderHeader ? "soldered" : ""]);

test("a hat on a board with bare holes has its header soldered, with no question", () => {
  const { description, changes } = fillNeeded({ board: "pi-zero-2w", hat: "oled-bonnet" });
  assert.equal(description.solderHeader, true);
  assert.deepEqual(changes.map((change) => change.slot), ["header"]);
  noError(description);
  // a board with pins needs nothing, and nothing is added
  assert.deepEqual(fillNeeded({ board: "pi4", hat: "oled-bonnet" }), { description: { board: "pi4", hat: "oled-bonnet" }, changes: [] });
  assert.deepEqual(fillNeeded({ board: "pi-zero-2w" }).changes, []);
});

test("a module for a display header gets the one hat that has one", () => {
  const { description, changes } = fillNeeded({ board: "pi4", screen: "oled-module" });
  assert.equal(description.hat, "proto-hat");
  assert.deepEqual(changes.map((change) => change.slot), ["hat"]);
  noError(description);
  // "no hat", just pressed, stays no hat
  assert.equal(fillNeeded({ board: "pi4", screen: "oled-module" }, "hat").description.hat, undefined);
  // a hat already there is the person's: it is not swapped here
  assert.equal(fillNeeded({ board: "pi4", hat: "pitft-28", screen: "oled-module" }).description.hat, "pitft-28");
});

test("whatFits offers every part with its answer and changes nothing", () => {
  const d: Description = { board: "pi-zero-2w", case: "unipi" };
  const cases = whatFits(d, "case");
  assert.deepEqual(cases.map((option) => option.id), [null, ...Object.keys(CASES)]);
  assert.equal(cases[0].name, "No case");
  const armor = cases.find((option) => option.id === "armor");
  assert.equal(armor?.fits, false);
  assert.match(armor?.why ?? "", /other sockets/);
  assert.equal(cases.find((option) => option.id === "plate")?.fits, true);
  assert.equal(cases.find((option) => option.id === "plate")?.why, null);
  assert.deepEqual(d, { board: "pi-zero-2w", case: "unipi" });
  assert.equal(whatFits(d, "board").some((option) => option.id === null), false);
  // a hat counts as fitting a Zero, because its header is soldered without asking; but not under a case that closes over the header
  const hats = whatFits({ board: "pi-zero-2w" }, "hat");
  assert.equal(hats.find((option) => option.id === "oled-bonnet")?.fits, true);
  assert.equal(whatFits({ board: "pi-zero-2w", case: "unipi" }, "hat").find((option) => option.id === "oled-bonnet")?.fits, false);
  // every answer is the truth: what it calls fitting is a machine with no error
  for (const start of PRESETS.filter((preset) => preset.description.board)) {
    for (const slot of CHOICE_SLOTS) {
      for (const option of whatFits(start.description, slot)) {
        assert.equal(check(fillNeeded(withChoice(start.description, slot, option.id), slot).description).ok, option.fits, `${start.id} ${slot} ${option.id}`);
        assert.equal(option.why === null, option.fits);
      }
    }
  }
});

test("the nearest set keeps what works and what was just chosen", () => {
  assert.deepEqual(nearestWorking({ board: "pi4", case: "armor", hat: "pitft-28" }).changes, []);
  // a new board: another case that fits, like for like
  const zero = nearestWorking({ board: "pi-zero-2w", case: "armor" }, "board");
  assert.equal(zero.description.board, "pi-zero-2w");
  assert.equal(zero.description.case, "unipi");
  assert.deepEqual(zero.changes.map((change) => change.slot), ["case"]);
  assert.match(zero.changes[0].message, /case is now/);
  // a hat under a case that closes: the hat stays, because it was chosen
  const hat = nearestWorking({ board: "pi4", case: "argon", hat: "pitft-28" }, "hat");
  assert.equal(hat.description.hat, "pitft-28");
  assert.equal(hat.description.case, "armor");
  // the same two with the case just chosen: the case stays, and the hat goes
  const closed = nearestWorking({ board: "pi4", case: "argon", hat: "pitft-28" }, "case");
  assert.equal(closed.description.case, "argon");
  assert.equal(closed.description.hat, undefined);
  // a hat with its own screen and a module on the back: one has to go
  const back = nearestWorking({ board: "pi4", hat: "pitft-28", screen: "touch-7" }, "screen");
  assert.equal(back.description.screen, "touch-7");
  assert.equal(back.description.hat, undefined);
  // a cooler that fits one board moves the board, last of all, and what it needs follows
  const cooled = nearestWorking({ board: "pi4", case: "armor", cooler: "active-cooler" }, "cooler");
  assert.equal(cooled.description.cooler, "active-cooler");
  assert.equal(cooled.description.board, "pi5");
  noError(cooled.description);
  // a hat that needs pins this board lacks goes, not the board
  const pins = nearestWorking({ board: "pi3b", hat: "poe-plus" }, "board");
  assert.equal(pins.description.board, "pi3b");
  assert.equal(pins.description.hat, undefined);
  // nothing the person asked for quietly survives as an unknown id
  const unknown = nearestWorking({ board: "pi4", case: "no such case" as never });
  assert.equal(unknown.description.case, undefined);
  assert.equal(unknown.report.ok, true);
});

test("the print is never touched", () => {
  const hostile = "<img src=x onerror=alert(1)>";
  assert.equal(nearestWorking({ board: "pi-zero-2w", case: "armor", print: hostile }, "board").description.print, hostile);
  assert.equal(fillNeeded({ board: "pi-zero-2w", hat: "oled-bonnet", print: hostile }).description.print, hostile);
});

test("a hat past a board's edge goes together: a fact to state, not a fault", () => {
  const settled = nearestWorking({ board: "pi-zero-2w", hat: "pitft-28" }, "hat");
  assert.equal(settled.report.ok, true);
  assert.equal(settled.description.hat, "pitft-28");
  assert.equal(settled.description.solderHeader, true);
  assert.deepEqual(settled.report.issues.filter((issue) => issue.level === "warning").map((issue) => issue.code), ["hat-overhangs"]);
});

test("every combination comes back working, with what was just chosen kept", () => {
  let walked = 0;
  for (const board of optionsOf("board")) {
    for (const caseId of optionsOf("case")) {
      for (const hat of optionsOf("hat")) {
        for (const screen of optionsOf("screen")) {
          for (const cooler of optionsOf("cooler")) {
            let d: Description = { board: board as Description["board"] };
            d = withChoice(d, "case", caseId);
            d = withChoice(d, "hat", hat);
            d = withChoice(d, "screen", screen);
            d = withChoice(d, "cooler", cooler);
            const settled = nearestWorking(d);
            noError(settled.description);
            assert.equal(settled.report.ok, true);
            // a set that worked comes back with nothing but what was needed
            if (stillWorks(d)) assert.deepEqual(settled.changes.filter((change) => change.slot !== "header" && change.slot !== "hat"), []);
            walked++;
          }
        }
      }
    }
  }
  assert.ok(walked > 500);
});

test("walking by clicks: from every set a person can reach, every choice in both ways ends with no error", () => {
  // Keep it working: anything can be pressed, and it stays
  const seen = new Set<string>();
  const queue: Description[] = PRESETS.filter((preset) => preset.description.board).map((preset) => nearestWorking(preset.description).description);
  let clicks = 0;
  while (queue.length) {
    const d = queue.pop() as Description;
    const key = keyOf(d);
    if (seen.has(key)) continue;
    seen.add(key);
    noError(d);
    for (const slot of CHOICE_SLOTS) {
      for (const id of optionsOf(slot)) {
        const settled = nearestWorking(withChoice(d, slot, id), slot);
        clicks++;
        noError(settled.description);
        // what was pressed is what is there
        if (id !== null) assert.equal(settled.description[slot], id, `${key} ${slot} ${id}`);
        else assert.equal(settled.description[slot], undefined, `${key} ${slot} none`);
        queue.push(settled.description);
      }
    }
  }
  assert.ok(clicks > 500, `${clicks} clicks`);

  // Only what fits: only what is offered can be pressed, and no set reached that way has an error or a dead end
  const fitting = new Set<string>();
  const again: Description[] = PRESETS.filter((preset) => preset.description.board).map((preset) => nearestWorking(preset.description).description);
  while (again.length) {
    const d = again.pop() as Description;
    const key = keyOf(d);
    if (fitting.has(key)) continue;
    fitting.add(key);
    noError(d);
    for (const slot of CHOICE_SLOTS) {
      const options = whatFits(d, slot);
      assert.ok(options.some((option) => option.fits), `${key}: nothing fits ${slot}`);
      for (const option of options) {
        if (!option.fits) continue;
        const next = fillNeeded(withChoice(d, slot, option.id), slot).description;
        noError(next);
        again.push(next);
      }
    }
  }
  assert.ok(fitting.size > 20);
});

test("a whole device loses what goes on a board, and keeps what fits it", () => {
  const nas = nearestWorking({ base: "nas-4bay", case: "armor", drives: ["hdd-35", null] });
  assert.equal(nas.description.case, undefined);
  assert.deepEqual(nas.description.drives, ["hdd-35", null]);
  noError(nas.description);
  noError(nearestWorking({ base: "nas-1bay", drives: ["hdd-35", "hdd-35", "hdd-35", "hdd-35", "hdd-35"] }).description);
  noError(nearestWorking({ base: "mac-mini", stand: "desk-stand", drives: ["hdd-35"] }).description);
  noError(nearestWorking({ base: "no such device" }).description);
  noError(nearestWorking({}).description);
  noError(nearestWorking({ board: "pi4", base: "ipad" }).description);
  noError(nearestWorking({ board: "pi4", drives: ["hdd-35"], stand: "desk-stand", riser: 99 }).description);
});
