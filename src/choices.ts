// What fits a set of choices, and the nearest set that works: what a form needs so that it never has to show an error. `check` says whether a machine goes together; this says what to offer
// and what to change. Pure, so a form can ask it on every change. "Your own print" is left alone: it is at the person's own risk, and no fit depends on it.
import { baseInfo, check } from "./catalogue.ts";
import type { Description, FitReport } from "./fit.ts";
import { BOARDS, CASES, COOLERS, HATS, type HatId, SCREENS } from "./parts.ts";

/** The choices of a machine built on a board, in the order they are usually made. */
export const CHOICE_SLOTS = ["board", "case", "hat", "screen", "cooler"] as const;
export type ChoiceSlot = (typeof CHOICE_SLOTS)[number];

export interface ChoiceOption {
  /** A part's id, or null for "none" (a board is never none). */
  id: string | null;
  name: string;
  /** Whether choosing it keeps the machine working, with what `fillNeeded` adds and the other choices as they are. */
  fits: boolean;
  /** Why it does not, in a sentence; null when it does. */
  why: string | null;
}

export interface ChoiceChange {
  /** What changed: one of the choices, the soldered header, the stacking header, or something that goes on a whole device. */
  slot: ChoiceSlot | "header" | "riser" | "stand" | "drives" | "base";
  from: string | null;
  to: string | null;
  /** A plain line: "the case is now Plain base plate on standoffs". */
  message: string;
}

export interface Settled {
  description: Description;
  /** What had to change, none when it worked as it was. */
  changes: readonly ChoiceChange[];
  /** The check of the result. A warning can still be there: "hat-overhangs" is a fact about a machine that goes together, not a fault. */
  report: FitReport;
}

const TABLES = { board: BOARDS, case: CASES, hat: HATS, screen: SCREENS, cooler: COOLERS } as const;
const WORDS: Readonly<Record<ChoiceSlot, string>> = { board: "board", case: "case", hat: "hat", screen: "screen module", cooler: "cooler" };
const NONE: Readonly<Record<Exclude<ChoiceSlot, "board">, string>> = { case: "No case", hat: "No hat", screen: "No module", cooler: "No cooler" };

const nameOf = (slot: ChoiceSlot, id: string): string => (TABLES[slot] as Readonly<Record<string, { name: string }>>)[id]?.name ?? id;
const known = (slot: ChoiceSlot, id: unknown): id is string => typeof id === "string" && Object.hasOwn(TABLES[slot], id);
const idsOf = (slot: ChoiceSlot): readonly string[] => Object.keys(TABLES[slot]);

function changeOf(slot: ChoiceSlot, from: string | null, to: string | null): ChoiceChange {
  return { slot, from, to, message: to === null ? `the ${WORDS[slot]} is off` : `the ${WORDS[slot]} is now ${nameOf(slot, to)}` };
}
const headerChange: ChoiceChange = { slot: "header", from: null, to: "soldered", message: "the header is soldered on" };

/** The hats a module on a display header can go on. */
const displayHats = (): readonly HatId[] => (Object.values(HATS) as readonly (typeof HATS)[HatId][]).filter((hat) => hat.displayHeader).map((hat) => hat.id);

/**
 * Makes the needed choices that have one answer: a hat on a board with bare holes needs the header soldered, and a module with no hat for its display header gets the one hat that has one.
 * Everything else is left as it is, and the result may still not fit. `keep` is a choice just made, so "no hat" stays no hat.
 */
export function fillNeeded(description: Description, keep?: ChoiceSlot): { description: Description; changes: readonly ChoiceChange[] } {
  const changes: ChoiceChange[] = [];
  let d = description;
  if (d.base !== undefined) return { description: d, changes };
  if (known("screen", d.screen) && SCREENS[d.screen as keyof typeof SCREENS].on === "display-header" && d.hat === undefined && keep !== "hat") {
    const hats = displayHats();
    if (hats.length === 1) {
      d = { ...d, hat: hats[0] };
      changes.push(changeOf("hat", null, hats[0]));
    }
  }
  if (known("board", d.board) && d.hat !== undefined && BOARDS[d.board as keyof typeof BOARDS].header.kind === "pads" && !d.solderHeader) {
    d = { ...d, solderHeader: true };
    changes.push(headerChange);
  }
  return { description: d, changes };
}

const firstError = (report: FitReport): string | null => report.issues.find((issue) => issue.level === "error")?.message ?? null;
const withChoice = (d: Description, slot: ChoiceSlot, id: string | null): Description => {
  const next: Record<string, unknown> = { ...d };
  if (id === null) delete next[slot];
  else next[slot] = id;
  return next as Description;
};

/** Every part of one slot, "none" first, each saying whether it would work with the other choices as they are, and why not. Nothing is changed. */
export function whatFits(description: Description, slot: ChoiceSlot): readonly ChoiceOption[] {
  const ids: readonly (string | null)[] = slot === "board" ? idsOf(slot) : [null, ...idsOf(slot)];
  return ids.map((id) => {
    const report = check(fillNeeded(withChoice(description, slot, id), slot).description);
    return { id, name: id === null ? NONE[slot as Exclude<ChoiceSlot, "board">] : nameOf(slot, id), fits: report.ok, why: firstError(report) };
  });
}

// What a change costs, so that the nearest set keeps as much as it can. A board is the last thing to change. A case is like for like: another case that fits is nearer than none. A hat, a module or a
// cooler each does a job of its own, so another one is further than none at all, and adding one nobody chose is the furthest of the three.
const COST = {
  board: 100,
  swap: { case: 2, hat: 5, screen: 5, cooler: 5, board: 100 },
  drop: { case: 3, hat: 4, screen: 4, cooler: 4, board: 100 },
  add: 6,
};

function costOf(slot: ChoiceSlot, from: string | null, to: string | null): number {
  if (from === to) return 0;
  if (from === null) return COST.add;
  return to === null ? COST.drop[slot] : COST.swap[slot];
}

/** A machine on a whole device takes no board parts, and only the stand and drives that fit it. */
function settleBase(d: Description): Settled {
  const changes: ChoiceChange[] = [];
  const next: Record<string, unknown> = { ...d };
  for (const slot of ["case", "hat", "screen", "cooler"] as const) {
    if (next[slot] !== undefined) {
      changes.push(changeOf(slot, String(next[slot]), null));
      delete next[slot];
    }
  }
  if (next.riser !== undefined) {
    changes.push({ slot: "riser", from: String(next.riser), to: null, message: "the stacking header is off" });
    delete next.riser;
  }
  if (next.solderHeader !== undefined) delete next.solderHeader;
  const info = baseInfo(String(d.base));
  if (d.stand !== undefined && !check({ base: d.base, stand: d.stand }).ok) {
    changes.push({ slot: "stand", from: d.stand, to: null, message: "the stand is off" });
    delete next.stand;
  }
  if (d.drives !== undefined && !check({ base: d.base, drives: d.drives }).ok) {
    const room = info?.bays?.count ?? 0;
    const kept = d.drives.slice(0, room).map((drive) => (drive !== null && check({ base: d.base, drives: [drive] }).ok ? drive : null));
    changes.push({ slot: "drives", from: d.drives.join(","), to: kept.join(",") || null, message: room ? "the drives are ones that fit its bays" : "the drives are out" });
    if (room) next.drives = kept;
    else delete next.drives;
  }
  const description = next as Description;
  return { description, changes, report: check(description) };
}

interface Best {
  description: Description;
  cost: number;
  changes: ChoiceChange[];
}

/** The cheapest way to make a board work with these boards tried, `keep` staying as it is. */
function search(d: Description, boards: readonly string[], keep: ChoiceSlot | undefined): Best | null {
  const offered = (slot: Exclude<ChoiceSlot, "board">): readonly (string | null)[] => {
    const now = known(slot, d[slot]) ? (d[slot] as string) : null;
    return keep === slot ? [now] : [now, null, ...idsOf(slot)].filter((id, at, all) => all.indexOf(id) === at);
  };
  const was = (slot: ChoiceSlot): string | null => (known(slot, d[slot]) ? (d[slot] as string) : null);
  let best: Best | null = null;
  const risers = d.riser === undefined ? [undefined] : [d.riser, undefined];
  for (const board of boards) {
    for (const caseId of offered("case")) {
      for (const hat of offered("hat")) {
        for (const screen of offered("screen")) {
          for (const cooler of offered("cooler")) {
            const cost = costOf("board", was("board"), board) + costOf("case", was("case"), caseId) + costOf("hat", was("hat"), hat) + costOf("screen", was("screen"), screen) + costOf("cooler", was("cooler"), cooler);
            if (best && cost >= best.cost) continue;
            for (const riser of risers) {
              const next: Record<string, unknown> = { ...d, board };
              for (const [slot, id] of [
                ["case", caseId],
                ["hat", hat],
                ["screen", screen],
                ["cooler", cooler],
              ] as const) {
                if (id === null) delete next[slot];
                else next[slot] = id;
              }
              if (riser === undefined) delete next.riser;
              else next.riser = riser;
              const filled = fillNeeded(next as Description, keep);
              if (!check(filled.description).ok) continue;
              const changes: ChoiceChange[] = [];
              for (const [slot, id] of [
                ["board", board],
                ["case", caseId],
                ["hat", hat],
                ["screen", screen],
                ["cooler", cooler],
              ] as const) {
                if (was(slot) !== id) changes.push(changeOf(slot, was(slot), id));
              }
              if (d.riser !== undefined && riser === undefined) changes.push({ slot: "riser", from: String(d.riser), to: null, message: "the stacking header is the height it needs" });
              for (const change of filled.changes) if (!changes.some((one) => one.slot === change.slot)) changes.push(change);
              best = { description: filled.description, cost, changes };
              break;
            }
          }
        }
      }
    }
  }
  return best;
}

/**
 * The nearest set of choices that works. Given one that works, it comes back as it is, with what `fillNeeded` adds. Otherwise the fewest and smallest changes are made, and `keep`, the choice the person
 * has just made, stays. A choice that cannot work with its board moves the board last of all. `print` is never touched.
 */
export function nearestWorking(description: Description, keep?: ChoiceSlot): Settled {
  if (description.base !== undefined && (description.board === undefined || keep === undefined) && baseInfo(description.base)) {
    const base: Record<string, unknown> = { ...description };
    delete base.board;
    return settleBase(base as Description);
  }
  const d: Record<string, unknown> = { ...description };
  const lost: ChoiceChange[] = [];
  if (d.base !== undefined) {
    lost.push({ slot: "base", from: String(d.base), to: null, message: `there is no device ${String(d.base)}` });
    delete d.base;
  }
  for (const [field, word] of [
    ["stand", "stand"],
    ["drives", "drives"],
  ] as const) {
    if (d[field] !== undefined) {
      lost.push({ slot: field, from: String(d[field]), to: null, message: `a ${word} goes on a whole device, so it is off` });
      delete d[field];
    }
  }
  // what is on no list is not a choice to keep
  for (const slot of CHOICE_SLOTS) {
    if (d[slot] !== undefined && !known(slot, d[slot])) {
      if (slot !== "board") lost.push(changeOf(slot, String(d[slot]), null));
      delete d[slot];
    }
  }
  const asked = d as Description;
  const was = known("board", asked.board) ? [asked.board as string] : [];
  const others = idsOf("board").filter((id) => !was.includes(id));
  const best = (was.length ? search(asked, was, keep) : null) ?? search(asked, others, keep);
  if (!best) {
    // nothing fits with `keep` held still: every part fits some board, so this is only a hand-written combination with a riser or the like
    const plain = { board: (was[0] ?? idsOf("board")[0]) as Description["board"], ...(d.print !== undefined ? { print: d.print as Description["print"] } : {}) };
    return { description: plain, changes: [...lost, { slot: "board", from: null, to: plain.board ?? null, message: "it is back to the board alone" }], report: check(plain) };
  }
  return { description: best.description, changes: [...lost, ...best.changes], report: check(best.description) };
}

/** Whether a set of choices would come back from `nearestWorking` unchanged but for what `fillNeeded` adds. */
export const stillWorks = (description: Description): boolean => check(fillNeeded(description).description).ok;
