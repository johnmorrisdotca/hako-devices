// Does this machine go together? One description of a machine, checked against the parts' real sizes and mount types. Pure, so a form can ask it on every change;
// the builder asks it first and refuses what does not fit.
import {
  BOARDS,
  CASES,
  COOLERS,
  DRIVES,
  FIT_TOLERANCE,
  HATS,
  HAT_STACK,
  MAX_RISER,
  type BoardId,
  type CaseId,
  type CoolerId,
  type DriveId,
  type HatId,
  type Rect,
  type ScreenId,
  SCREENS,
  type Size,
  type StandId,
  STANDS,
} from "./parts.ts";

/** Text to print on a device, at the caller's own risk: one string for its main area, or by area ("lid", "front", "side", "board"). */
export type Print = string | Readonly<Record<string, string>>;

/** One machine. Either a `board` with what goes on it, or a `base` (a whole device from the catalogue) with what goes on that. */
export interface Description {
  board?: BoardId;
  case?: CaseId;
  hat?: HatId;
  screen?: ScreenId;
  cooler?: CoolerId;
  /** Millimetres of stacking header under the hat. Left out: as much as it takes to clear what is under the hat. */
  riser?: number;
  /** A header soldered on a board that comes with bare holes. */
  solderHeader?: boolean;
  /** A whole device by its catalogue key. */
  base?: string;
  /** What holds a tablet or phone; null: it lies flat. Left out: the desk stand. */
  stand?: StandId | null;
  /** The drives in a NAS's bays, in order, null for an empty bay. Left out: all full. */
  drives?: readonly (DriveId | null)[];
  print?: Print;
  /** Which way round it stands. Left out: the way its hat reads best. */
  turn?: 0 | 180;
}

export type FitCode =
  | "nothing"
  | "board-and-base"
  | "unknown-part"
  | "case-wrong-board"
  | "case-too-small"
  | "case-covers-header"
  | "case-on-screen"
  | "header-not-soldered"
  | "no-poe-pins"
  | "hat-overhangs"
  | "hat-meets-part"
  | "hat-raised"
  | "riser-too-tall"
  | "riser-without-hat"
  | "cooler-wrong-board"
  | "cooler-in-closed-case"
  | "screen-needs-header"
  | "screen-wrong-board"
  | "two-screens"
  | "stand-wrong-base"
  | "stand-wrong-size"
  | "drives-wrong-base"
  | "too-many-drives"
  | "drive-wrong-bay"
  | "part-on-base";

export interface FitIssue {
  code: FitCode;
  /** "error" stops the build. "warning" builds, but something is off. "note" says what the check decided. */
  level: "error" | "warning" | "note";
  message: string;
}

export interface FitReport {
  ok: boolean;
  issues: readonly FitIssue[];
  /** Millimetres of stacking header the hat gets, and the height of its underside; null with no hat. */
  stack: { riser: number; under: number } | null;
  turn: 0 | 180;
  /** The machine's size in millimetres, from the parts' real sizes; null when it does not fit or the size is not known here. */
  size: Size | null;
}

const has = <T extends object>(table: T, key: unknown): key is keyof T => typeof key === "string" && Object.hasOwn(table, key);
const overlaps = (a: Rect, b: Rect) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

export interface BaseInfo {
  /** The device's own size. */
  size: Size | null;
  /** The bays, when it has any. */
  bays?: { count: number; type: "bay-35" | "bay-25" };
  /** Width of a slab that stands, when it is one. */
  slabWidth?: number;
}

/** What a base needs saying about itself, handed in so the core keeps one table of them (catalogue.ts). */
export type BaseLookup = (key: string) => BaseInfo | undefined;

/** Checks one description. `bases` looks up whole devices: pass the catalogue's `baseInfo` (the root entry's `check` does that for you). */
export function checkWith(description: Description, bases: BaseLookup): FitReport {
  const issues: FitIssue[] = [];
  const fail = (code: FitCode, message: string) => issues.push({ code, level: "error", message });
  const warn = (code: FitCode, message: string) => issues.push({ code, level: "warning", message });
  const note = (code: FitCode, message: string) => issues.push({ code, level: "note", message });
  const d = description;
  const done = (stack: FitReport["stack"], turn: 0 | 180, size: Size | null): FitReport => {
    const ok = !issues.some((issue) => issue.level === "error");
    return { ok, issues, stack, turn, size: ok ? size : null };
  };

  if (d.board !== undefined && d.base !== undefined) {
    fail("board-and-base", "Give a board or a base, not both.");
    return done(null, 0, null);
  }
  if (d.board === undefined && d.base === undefined) {
    fail("nothing", "Give a board or a base.");
    return done(null, 0, null);
  }

  if (d.base !== undefined) {
    const info = bases(d.base);
    if (!info) {
      fail("unknown-part", `There is no device "${d.base}".`);
      return done(null, 0, null);
    }
    for (const [word, value] of [
      ["case", d.case],
      ["hat", d.hat],
      ["cooler", d.cooler],
      ["screen", d.screen],
    ] as const)
      if (value !== undefined) fail("part-on-base", `A ${word} goes on a board, and ${d.base} is a whole device.`);
    if (d.riser !== undefined) fail("riser-without-hat", "A stacking header goes under a hat.");
    if (d.stand !== undefined && d.stand !== null) {
      if (!has(STANDS, d.stand)) fail("unknown-part", `There is no stand "${d.stand}".`);
      else if (info.slabWidth === undefined) fail("stand-wrong-base", `${d.base} is not a tablet or a phone, so it takes no stand.`);
      else {
        const [low, high] = STANDS[d.stand].holds;
        if (info.slabWidth < low || info.slabWidth > high) fail("stand-wrong-size", `The stand holds ${low} to ${high} mm, and ${d.base} is ${info.slabWidth} mm wide.`);
      }
    } else if (d.stand === null && info.slabWidth === undefined) fail("stand-wrong-base", `${d.base} is not a tablet or a phone, so it takes no stand.`);
    if (d.drives !== undefined) {
      if (!info.bays) fail("drives-wrong-base", `${d.base} has no drive bays.`);
      else {
        if (d.drives.length > info.bays.count) fail("too-many-drives", `${d.base} has ${info.bays.count} bays, and ${d.drives.length} drives were given.`);
        for (const drive of d.drives) {
          if (drive === null) continue;
          if (!has(DRIVES, drive)) fail("unknown-part", `There is no drive "${drive}".`);
          else if (!(DRIVES[drive].fits as readonly string[]).includes(info.bays.type)) fail("drive-wrong-bay", `${DRIVES[drive].name} does not go in this bay.`);
        }
      }
    }
    return done(null, d.turn ?? 0, info.size);
  }

  const boardId = d.board as BoardId;
  if (!has(BOARDS, boardId)) {
    fail("unknown-part", `There is no board "${String(boardId)}".`);
    return done(null, 0, null);
  }
  const board = BOARDS[boardId];
  const caseId = d.case;
  const casePart = caseId !== undefined && has(CASES, caseId) ? CASES[caseId] : undefined;
  if (caseId !== undefined && !casePart) fail("unknown-part", `There is no case "${String(caseId)}".`);
  const hatPart = d.hat !== undefined && has(HATS, d.hat) ? HATS[d.hat] : undefined;
  if (d.hat !== undefined && !hatPart) fail("unknown-part", `There is no hat "${String(d.hat)}".`);
  const screenPart = d.screen !== undefined && has(SCREENS, d.screen) ? SCREENS[d.screen] : undefined;
  if (d.screen !== undefined && !screenPart) fail("unknown-part", `There is no screen "${String(d.screen)}".`);
  const coolerPart = d.cooler !== undefined && has(COOLERS, d.cooler) ? COOLERS[d.cooler] : undefined;
  if (d.cooler !== undefined && !coolerPart) fail("unknown-part", `There is no cooler "${String(d.cooler)}".`);
  if (d.stand !== undefined || d.drives !== undefined) fail("part-on-base", "A stand or drives go on a whole device, not a board.");

  if (casePart) {
    if (casePart.fits !== null && !(casePart.fits as readonly string[]).includes(board.shape))
      fail("case-wrong-board", `${casePart.name} is cut for other sockets than those of ${board.name}.`);
    if (board.size[0] > casePart.inner[0] || board.size[1] > casePart.inner[1])
      fail("case-too-small", `${casePart.name} takes a board up to ${casePart.inner[0]} by ${casePart.inner[1]} mm, and ${board.name} is ${board.size[0]} by ${board.size[1]} mm.`);
  }
  if (coolerPart) {
    if (!(coolerPart.fits as readonly string[]).includes(board.shape)) fail("cooler-wrong-board", `${coolerPart.name} is made for other boards than ${board.name}.`);
    if (casePart?.hidesBoard) fail("cooler-in-closed-case", `${casePart.name} closes over the board, so ${coolerPart.name} does not fit in it.`);
  }

  let stack: FitReport["stack"] = null;
  let top: number = board.size[2];
  if (hatPart) {
    const header = d.solderHeader ? "soldered" : board.header.kind;
    if (header !== "soldered") fail("header-not-soldered", `${board.name} comes with bare header holes: set solderHeader to put the pins on.`);
    if (casePart && casePart.headerTop === null) fail("case-covers-header", `${casePart.name} closes over the header, so a hat cannot reach it.`);
    if ((hatPart.needs as readonly string[]).includes("poe-pins") && !board.poePins) fail("no-poe-pins", `${hatPart.name} needs the four network power pins, and ${board.name} has none.`);
    // the hat's outline on this board, its header over the board's
    const dx = board.header.bx - 32.5;
    const dz = board.header.bz - 52.5;
    const reach: Rect = [hatPart.reach[0] + dx, hatPart.reach[1] + dz, hatPart.reach[2] + dx, hatPart.reach[3] + dz];
    const over = Math.max(-reach[0], -reach[1], reach[2] - board.size[0], reach[3] - board.size[1]);
    if (over > 1) warn("hat-overhangs", `${hatPart.name} reaches ${Math.round(over)} mm past the edge of ${board.name}.`);
    const base = casePart?.headerTop ?? HAT_STACK;
    const under: { what: string; top: number }[] = board.tall.filter((zone) => overlaps(zone.rect, reach));
    if (coolerPart && overlaps(coolerPart.rect, reach)) under.push({ what: coolerPart.name, top: coolerPart.top });
    if (casePart && casePart.covers && overlaps(casePart.covers, reach)) under.push({ what: casePart.name, top: casePart.top });
    const highest = under.reduce<{ what: string; top: number } | null>((a, b) => (a === null || b.top > a.top ? b : a), null);
    const needed = highest ? Math.max(0, highest.top - FIT_TOLERANCE - base) : 0;
    const roundUp = (v: number) => Math.ceil(v * 10) / 10;
    let riser: number;
    if (d.riser === undefined) {
      riser = roundUp(needed);
      if (riser > 0 && highest) note("hat-raised", `${hatPart.name} sits ${riser} mm higher on a stacking header, to clear ${highest.what}.`);
    } else {
      riser = d.riser;
      if (!(riser >= 0)) {
        fail("riser-too-tall", "A stacking header's height is a number of millimetres, 0 or more.");
        riser = 0;
      }
      if (highest && riser < needed - 1e-9) warn("hat-meets-part", `${hatPart.name} meets ${highest.what}: it takes a ${roundUp(needed)} mm stacking header to clear it.`);
    }
    if (riser > MAX_RISER) fail("riser-too-tall", `A stacking header is ${MAX_RISER} mm at most.`);
    stack = { riser, under: base + riser };
    top = Math.max(top, stack.under + hatPart.size[2]);
  } else if (d.riser !== undefined) fail("riser-without-hat", "A stacking header goes under a hat.");
  if (casePart) top = Math.max(top, casePart.top);
  if (coolerPart) top = Math.max(top, coolerPart.top);

  if (screenPart) {
    if (screenPart.on === "display-header") {
      if (!hatPart?.displayHeader) fail("screen-needs-header", `${screenPart.name} goes on a hat with a display header.`);
      else if (stack) top = Math.max(top, stack.under + hatPart.size[2] + screenPart.size[2]);
    } else {
      if (!(screenPart.carries as readonly string[]).includes(board.shape)) fail("screen-wrong-board", `${screenPart.name} has no standoffs for ${board.name}.`);
      if (hatPart) fail("two-screens", `${screenPart.name} holds the board on its back, with no room for a hat.`);
      if (casePart) fail("case-on-screen", `${screenPart.name} holds the board on its back, so it takes no case.`);
    }
  }
  if (hatPart?.screen && screenPart) fail("two-screens", `${hatPart.name} has its own screen.`);

  let w: number = board.size[0];
  let depth: number = board.size[1];
  let below = 0;
  if (casePart) {
    if (casePart.id === "plate") {
      w += 4;
      depth += 4;
    } else {
      w = casePart.size[0];
      depth = casePart.size[1];
    }
    below = casePart.below;
  }
  const size: Size =
    screenPart?.on === "board-back"
      ? screenPart.size
      : casePart?.hidesBoard
        ? casePart.size
        : ([Math.round(w), Math.round(depth), Math.round((top + below) * 10) / 10] as const);
  return done(stack, d.turn ?? hatPart?.turn ?? 0, size);
}
