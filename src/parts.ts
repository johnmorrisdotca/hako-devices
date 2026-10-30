// The parts a machine is assembled from, and how they fit: pure data in real millimetres, no drawing. A board offers mounts (a 40-pin header, four network power
// pins); a case says which board shapes it takes and whether the header stays reachable; a hat says what it needs and what it covers. `check` in fit.ts reads
// this table, and so does the builder in build/. Board coordinates: bx along the long edge from the corner by the power socket, bz in from the edge with the
// video sockets, y up from the underside of the board. Names are plain descriptive words: all trademarks belong to their owners.

/** A rectangle on a board: bx0, bz0, bx1, bz1. */
export type Rect = readonly [number, number, number, number];
/** Width, depth, height in millimetres. */
export type Size = readonly [number, number, number];

export type BoardShape = "b-classic" | "b-usbc" | "b-pi5" | "a-plus" | "zero" | "cm4-io";

/** Something tall on a board that a hat over it would meet. */
export interface TallZone {
  what: string;
  rect: Rect;
  top: number;
}

export interface HeaderMount {
  /** "soldered": pins stand ready. "pads": bare holes, a header must be soldered first. */
  kind: "soldered" | "pads";
  /** The header's middle on the board. */
  bx: number;
  bz: number;
}

export interface BoardPart {
  id: string;
  kind: "board";
  name: string;
  /** Published outline, and the height of its tallest part above the underside. */
  size: Size;
  shape: BoardShape;
  header: HeaderMount;
  /** Four network power pins beside the header. */
  poePins: boolean;
  /** The screw holes, [bx, bz]. */
  holes: readonly (readonly [number, number])[];
  tall: readonly TallZone[];
}

export interface CasePart {
  id: string;
  kind: "case";
  name: string;
  /** The case's own outside size. */
  size: Size;
  /** The board shapes whose sockets line up with its openings. Null: any, it is only a plate. */
  fits: readonly BoardShape[] | null;
  /** The biggest board that goes in, width and depth. */
  inner: readonly [number, number];
  /** How far it reaches below the board's underside. */
  below: number;
  /** The height a hat's underside sits at on the case's raised header; null when the case closes over the header. */
  headerTop: number | null;
  /** Nothing of the board shows, so it is not drawn. */
  hidesBoard: boolean;
  /** The top of the case over the board, what a hat must clear. */
  top: number;
  /** Where the case covers the board. */
  covers: Rect | null;
}

export interface ScreenInfo {
  /** Which picture the viewer paints: its own layout for each. */
  kind: "panel" | "oled" | "paper" | "desktop";
  pixels: readonly [number, number];
}

export interface HatPart {
  id: string;
  kind: "hat";
  name: string;
  /** Its outline and height above its own underside. */
  size: Size;
  needs: readonly ("gpio-40" | "poe-pins")[];
  /** Its outline in the coordinates of a full-size board, whose header is at bx 32.5, bz 52.5: where it reaches round the header. */
  reach: Rect;
  /** It hides the board under it, so the board's small parts are left out. */
  covers: boolean;
  /** Which way round the device stands so a screen reads the right way up to someone at the header's side. */
  turn: 0 | 180;
  screen: ScreenInfo | null;
  /** A plain board that takes a small display module. */
  displayHeader: boolean;
}

export interface ScreenPart {
  id: string;
  kind: "screen";
  name: string;
  size: Size;
  /** "hat": on a hat's display header. "back": the board is held on the screen's back. */
  on: "display-header" | "board-back";
  /** For "back": the board shapes whose holes line up with its standoffs. */
  carries: readonly BoardShape[];
  screen: ScreenInfo;
}

export interface CoolerPart {
  id: string;
  kind: "cooler";
  name: string;
  size: Size;
  fits: readonly BoardShape[];
  /** What a hat must clear. */
  top: number;
  rect: Rect;
}

export interface DrivePart {
  id: string;
  kind: "drive";
  name: string;
  size: Size;
  /** The bays it goes in. */
  fits: readonly ("bay-35" | "bay-25")[];
}

export interface StandPart {
  id: string;
  kind: "stand";
  name: string;
  size: Size;
  /** The width range of what it holds, in millimetres. */
  holds: readonly [number, number];
}

export type Part = BoardPart | CasePart | HatPart | ScreenPart | CoolerPart | DrivePart | StandPart;

const HOLES_B: readonly (readonly [number, number])[] = [
  [3.5, 3.5],
  [61.5, 3.5],
  [3.5, 52.5],
  [61.5, 52.5],
];
const HOLES_ZERO: readonly (readonly [number, number])[] = [
  [3.5, 3.5],
  [61.5, 3.5],
  [3.5, 26.5],
  [61.5, 26.5],
];
const HEADER_B: HeaderMount = { kind: "soldered", bx: 32.5, bz: 52.5 };

/** The tall sockets of a full-size board at the right-hand edge. */
const sockets = (ethernet: number, usb: readonly [number, number]): TallZone[] => [
  { what: "the network socket", rect: [64, ethernet - 8, 87.5, ethernet + 8], top: 14.9 },
  { what: "the USB sockets", rect: [70, usb[0] - 6.6, 87.5, usb[0] + 6.6], top: 17.1 },
  { what: "the USB sockets", rect: [70, usb[1] - 6.6, 87.5, usb[1] + 6.6], top: 17.1 },
];

export const BOARDS = {
  "pi1b-plus": { id: "pi1b-plus", kind: "board", name: "Raspberry Pi 1 Model B+", size: [85, 56, 17], shape: "b-classic", header: HEADER_B, poePins: false, holes: HOLES_B, tall: sockets(10.25, [29, 47]) },
  pi2b: { id: "pi2b", kind: "board", name: "Raspberry Pi 2 Model B", size: [85, 56, 17], shape: "b-classic", header: HEADER_B, poePins: false, holes: HOLES_B, tall: sockets(10.25, [29, 47]) },
  pi3b: { id: "pi3b", kind: "board", name: "Raspberry Pi 3 Model B", size: [85, 56, 17], shape: "b-classic", header: HEADER_B, poePins: false, holes: HOLES_B, tall: sockets(10.25, [29, 47]) },
  "pi3b-plus": { id: "pi3b-plus", kind: "board", name: "Raspberry Pi 3 Model B+", size: [85, 56, 17], shape: "b-classic", header: HEADER_B, poePins: true, holes: HOLES_B, tall: sockets(10.25, [29, 47]) },
  "pi3a-plus": {
    id: "pi3a-plus",
    kind: "board",
    name: "Raspberry Pi 3 Model A+",
    size: [65, 56, 11],
    shape: "a-plus",
    header: HEADER_B,
    poePins: false,
    holes: HOLES_B,
    tall: [{ what: "the USB socket", rect: [52.5, 24.2, 67.5, 38.8], top: 8.8 }],
  },
  pi4: { id: "pi4", kind: "board", name: "Raspberry Pi 4 Model B", size: [85, 56, 17], shape: "b-usbc", header: HEADER_B, poePins: true, holes: HOLES_B, tall: sockets(45.75, [27, 9]) },
  pi5: { id: "pi5", kind: "board", name: "Raspberry Pi 5", size: [85, 56, 17], shape: "b-pi5", header: HEADER_B, poePins: true, holes: HOLES_B, tall: sockets(10.2, [29.1, 47]) },
  "pi-zero-w": { id: "pi-zero-w", kind: "board", name: "Raspberry Pi Zero W", size: [65, 30, 5], shape: "zero", header: { kind: "pads", bx: 32.5, bz: 26.5 }, poePins: false, holes: HOLES_ZERO, tall: [] },
  "pi-zero-2w": { id: "pi-zero-2w", kind: "board", name: "Raspberry Pi Zero 2 W", size: [65, 30, 5], shape: "zero", header: { kind: "pads", bx: 32.5, bz: 26.5 }, poePins: false, holes: HOLES_ZERO, tall: [] },
  "cm4-io": {
    id: "cm4-io",
    kind: "board",
    name: "Compute Module 4 on its IO board",
    size: [160, 90, 17],
    shape: "cm4-io",
    header: { kind: "soldered", bx: 35.5, bz: 86.5 },
    poePins: false,
    holes: [
      [3.5, 3.5],
      [156.5, 3.5],
      [3.5, 86.5],
      [156.5, 86.5],
    ],
    tall: [
      { what: "the network socket", rect: [25, -2.5, 41, 18.5], top: 14.9 },
      { what: "the USB sockets", rect: [48.4, -2.5, 61.6, 15], top: 17 },
      { what: "the module", rect: [72.5, 36, 127.5, 76], top: 10 },
    ],
  },
} as const satisfies Record<string, BoardPart>;

export const CASES = {
  armor: {
    id: "armor",
    kind: "case",
    name: "Finned aluminium case (Armor style)",
    size: [89, 60, 20],
    fits: ["b-usbc"],
    inner: [85, 56],
    below: 3.4,
    headerTop: 16.8,
    hidesBoard: false,
    top: 16.2,
    covers: [-1.6, -1.4, 65, 57.4],
  },
  argon: {
    id: "argon",
    kind: "case",
    name: "Faceted metal case (Argon ONE style)",
    size: [107, 96, 28],
    fits: ["b-usbc"],
    inner: [85, 56],
    below: 1,
    headerTop: null,
    hidesBoard: true,
    top: 28,
    covers: null,
  },
  unipi: {
    id: "unipi",
    kind: "case",
    name: "Small domed case (UniPiCase Zero style)",
    size: [82, 46, 15],
    fits: ["zero"],
    inner: [65, 30],
    below: 0,
    headerTop: null,
    hidesBoard: true,
    top: 15,
    covers: null,
  },
  plate: {
    id: "plate",
    kind: "case",
    name: "Plain base plate on standoffs",
    size: [200, 120, 8],
    fits: null,
    inner: [160, 90],
    below: 6,
    headerTop: 10.4,
    hidesBoard: false,
    top: 0,
    covers: null,
  },
} as const satisfies Record<string, CasePart>;

export const HATS = {
  "pitft-28": {
    id: "pitft-28",
    kind: "hat",
    name: "2.8-inch touch screen hat (PiTFT Plus)",
    size: [85, 56, 5],
    needs: ["gpio-40"],
    reach: [0, 0, 85, 56],
    covers: true,
    turn: 180,
    screen: { kind: "panel", pixels: [320, 240] },
    displayHeader: false,
  },
  "pitft-35": {
    id: "pitft-35",
    kind: "hat",
    name: "3.5-inch touch screen hat (PiTFT Plus)",
    size: [85, 56, 5.4],
    needs: ["gpio-40"],
    reach: [0, 0, 85, 56],
    covers: true,
    turn: 180,
    screen: { kind: "desktop", pixels: [480, 320] },
    displayHeader: false,
  },
  "oled-bonnet": {
    id: "oled-bonnet",
    kind: "hat",
    name: "128 by 64 OLED bonnet with joystick",
    size: [65, 30, 8],
    needs: ["gpio-40"],
    reach: [0, 26, 65, 56],
    covers: false,
    turn: 0,
    screen: { kind: "oled", pixels: [128, 64] },
    displayHeader: false,
  },
  "epaper-213": {
    id: "epaper-213",
    kind: "hat",
    name: "2.13-inch e-paper hat",
    size: [65, 30.2, 2.8],
    needs: ["gpio-40"],
    reach: [0, 26, 65, 56],
    covers: false,
    turn: 180,
    screen: { kind: "paper", pixels: [250, 122] },
    displayHeader: false,
  },
  "poe-plus": {
    id: "poe-plus",
    kind: "hat",
    name: "Network power hat with fan (PoE+)",
    size: [65, 56.5, 10],
    needs: ["gpio-40", "poe-pins"],
    reach: [0, -0.25, 65, 56.25],
    covers: true,
    turn: 0,
    screen: null,
    displayHeader: false,
  },
  "proto-hat": {
    id: "proto-hat",
    kind: "hat",
    name: "Plain prototyping hat with a display header",
    size: [65, 56, 3],
    needs: ["gpio-40"],
    reach: [0, 0, 65, 56],
    covers: true,
    turn: 0,
    screen: null,
    displayHeader: true,
  },
} as const satisfies Record<string, HatPart>;

export const SCREENS = {
  "oled-module": {
    id: "oled-module",
    kind: "screen",
    name: "1.3-inch OLED module",
    size: [36, 34, 9],
    on: "display-header",
    carries: [],
    screen: { kind: "oled", pixels: [128, 64] },
  },
  "touch-7": {
    id: "touch-7",
    kind: "screen",
    name: "7-inch touch display on a folding leg",
    size: [194, 110, 20],
    on: "board-back",
    carries: ["b-classic", "b-usbc", "b-pi5"],
    screen: { kind: "desktop", pixels: [800, 480] },
  },
} as const satisfies Record<string, ScreenPart>;

export const COOLERS = {
  "active-cooler": { id: "active-cooler", kind: "cooler", name: "Fan and fins cooler", size: [54, 34, 11], fits: ["b-pi5"], top: 14.6, rect: [5, 13, 59, 47] },
} as const satisfies Record<string, CoolerPart>;

export const DRIVES = {
  "hdd-35": { id: "hdd-35", kind: "drive", name: "3.5-inch hard drive", size: [101.6, 147, 26.1], fits: ["bay-35"] },
  "ssd-25": { id: "ssd-25", kind: "drive", name: "2.5-inch solid state drive", size: [69.9, 100, 7], fits: ["bay-35", "bay-25"] },
} as const satisfies Record<string, DrivePart>;

export const STANDS = {
  "desk-stand": { id: "desk-stand", kind: "stand", name: "Low desk stand with a leg", size: [120, 60, 60], holds: [60, 300] },
} as const satisfies Record<string, StandPart>;

export type BoardId = keyof typeof BOARDS;
export type CaseId = keyof typeof CASES;
export type HatId = keyof typeof HATS;
export type ScreenId = keyof typeof SCREENS;
export type CoolerId = keyof typeof COOLERS;
export type DriveId = keyof typeof DRIVES;
export type StandId = keyof typeof STANDS;

/** Every part by its id. */
export const PARTS: Readonly<Record<string, Part>> = { ...BOARDS, ...CASES, ...HATS, ...SCREENS, ...COOLERS, ...DRIVES, ...STANDS };

/** The parts of one kind, in the table's order. */
export function partsOfKind<K extends Part["kind"]>(kind: K): Extract<Part, { kind: K }>[] {
  return Object.values(PARTS).filter((part): part is Extract<Part, { kind: K }> => part.kind === kind);
}

/** A hat's underside above the board's underside when it stands straight on the header's pins: board, header plastic, pins, the hat's own socket. */
export const HAT_STACK = 10.4;
/** A hat may touch a part this much: two parts drawn to within half a millimetre are a fit, not a collision. */
export const FIT_TOLERANCE = 0.5;
/** The tallest stacking header anyone sells. */
export const MAX_RISER = 30;
