// Which catalogue key a real machine is: a board by its model line and the little screen on it, a NAS by its series' drive bays, a desktop or laptop by its hardware identifier,
// a small PC by its product name. A machine that does not say gets its family's plain key or `unknown`, never a guess. Pure: any odd input gives `unknown`, never an exception.
// The tables below are facts about what machines report: product names as plain words.

export type PanelFace = "pitft" | "oled" | "";

export interface DeviceFacts {
  /** `darwin`, `linux` or anything else. */
  platform: string;
  /** True inside a container: the platform is then the container's, never the machine it runs on. */
  container: boolean;
  /** The board's own model line (/proc/device-tree/model), such as "Raspberry Pi 4 Model B Rev 1.4", or "". */
  model: string;
  /** A model someone wrote down, such as "DS1515+", or "". */
  toldModel: string;
  /** A hardware identifier (`sysctl hw.model`), such as "Mac13,1" or "Macmini9,1", or "". */
  macModel: string;
  /** /sys/class/dmi/id/product_name, such as "NUC8i5BEH", or "". */
  dmiProduct: string;
  panel: PanelFace;
}

const text = (value: unknown): string => (typeof value === "string" ? value.replace(/\0/g, " ").trim() : "");

/** A panel's word: one of the two screens, else "". */
export function cleanPanelFace(value: unknown): PanelFace {
  const word = text(value).toLowerCase();
  return word === "pitft" || word === "oled" ? word : "";
}

type PiBoard = "zero" | "zero-w" | "1b-plus" | "2b" | "3a-plus" | "3b-plus" | "3" | "4" | "400" | "5" | "500" | "cm4";

/** The board from a model line, as exactly as the line says; "3" is the plain answer for an older or a smaller board with no picture of its own. Null when it is not one. */
export function piBoard(model: string): PiBoard | null {
  const line = text(model);
  if (!/^Raspberry Pi\b/i.test(line)) return null;
  if (/^Raspberry Pi Zero W\b/i.test(line)) return "zero-w";
  if (/^Raspberry Pi Zero\b/i.test(line)) return "zero";
  if (/^Raspberry Pi 400\b/i.test(line)) return "400";
  if (/^Raspberry Pi 500\b/i.test(line)) return "500";
  if (/^Raspberry Pi Compute Module 4\b/i.test(line)) return "cm4";
  if (/^Raspberry Pi Model B Plus\b/i.test(line)) return "1b-plus";
  if (/^Raspberry Pi 2 Model B\b/i.test(line)) return "2b";
  if (/^Raspberry Pi 3 Model A Plus\b/i.test(line)) return "3a-plus";
  if (/^Raspberry Pi 3 Model B Plus\b/i.test(line)) return "3b-plus";
  const number = /^Raspberry Pi (?:Compute Module )?(\d)/i.exec(line)?.[1];
  if (number === "5") return "5";
  if (number === "4") return "4";
  return "3";
}

const PI_KEYS: Record<PiBoard, string> = {
  zero: "pi-zero",
  "zero-w": "pi-zero-w",
  "1b-plus": "pi1b-plus",
  "2b": "pi2b",
  "3a-plus": "pi3a-plus",
  "3b-plus": "pi3b-plus",
  "3": "pi3b",
  "4": "pi4",
  "400": "pi400",
  "5": "pi5",
  "500": "pi500",
  cm4: "cm4-io",
};

/** The boards that keep their own picture whatever a panel says. */
const NO_HAT_PICTURE: readonly PiBoard[] = ["zero", "zero-w", "400", "500", "5"];

/** A board's key from its model line and the screen found on it. */
export function piKey(model: string, panel: unknown = ""): string | null {
  const board = piBoard(model);
  if (!board) return null;
  const face = cleanPanelFace(panel);
  if (!NO_HAT_PICTURE.includes(board)) {
    if (face === "oled") return "pi3b-oled";
    if (face === "pitft") return "pi4-pitft";
  }
  return PI_KEYS[board];
}

/** A NAS series' picture: its bays. A number is its series then a two-digit year (DS1515+ is series 15). A 6- or 8-bay shows the 5-bay one; a series not listed the 4-bay one. */
const SERIES_BAYS: Readonly<Record<string, number>> = { "1": 1, "2": 2, "3": 2, "4": 4, "6": 5, "7": 2, "8": 5, "9": 4, "10": 5, "15": 5, "16": 5, "18": 5 };

/** A NAS's key from its model name ("DS923+", "RS820RP+"), with or without its maker's name; null when it is not one. */
export function nasKey(name: string): string | null {
  const model = text(name).replace(/^synology\s+/i, "").toUpperCase();
  if (!/^(DS|RS)\d{2,4}[A-Z+]*$/.test(model)) return null;
  if (model.startsWith("RS")) return "nas-rack";
  const digits = /^DS(\d{3,4})/.exec(model)?.[1];
  const bays = digits ? SERIES_BAYS[digits.slice(0, -2)] : undefined;
  if (bays === 1) return "nas-1bay";
  if (bays === 5) return "nas-5bay";
  if (bays === 2) return "nas-2bay";
  return "nas-4bay";
}

const MAC_LISTS: readonly (readonly [readonly string[], string])[] = [
  [["Mac13,1", "Mac13,2", "Mac14,13", "Mac14,14", "Mac15,14", "Mac16,9"], "mac-studio"],
  [["Mac16,10", "Mac16,11"], "mac-mini"],
  [["Mac14,3", "Mac14,12"], "mac-mini-m1"],
  [["MacPro7,1", "Mac14,8"], "mac-pro"],
  [["iMac21,1", "iMac21,2", "Mac15,4", "Mac15,5", "Mac16,2", "Mac16,3"], "imac-24"],
  [["MacBookAir10,1", "Mac14,2", "Mac15,12", "Mac16,12"], "macbook-air-13"],
  [["MacBookPro18,3", "MacBookPro18,4", "Mac14,5", "Mac14,9", "Mac15,3", "Mac15,6", "Mac15,8", "Mac15,10", "Mac16,1", "Mac16,6", "Mac16,8"], "macbook-pro-14"],
  [["MacBookPro18,1", "MacBookPro18,2", "Mac14,6", "Mac14,10", "Mac15,7", "Mac15,9", "Mac15,11", "Mac16,5", "Mac16,7"], "macbook-pro-16"],
  [["Mac14,7", "Mac14,15", "Mac15,13", "Mac16,13"], "macbook"],
];

/** A desktop or laptop's key by its hardware identifier, exactly as listed; else by its prefix; an identifier nobody has listed yet shows the small desktop. */
export function macKey(macModel: string): string {
  const id = text(macModel);
  const listed = MAC_LISTS.find(([list]) => list.includes(id));
  if (listed) return listed[1];
  if (/^Macmini/i.test(id)) return "mac-mini-m1";
  if (/^MacBook/i.test(id)) return "macbook";
  return "mac-mini";
}

// Which body a NUC's product code names. The code's letters say the family and, where a family has two heights, H is tall and K is slim. Case does not matter; a code may start with the retail R.
const NUC_BODY_CODES: readonly [RegExp, string][] = [
  [/DCCP847|DC3217I/, "nuc-deep-canyon"],
  [/DC3217BY/, "nuc-box-canyon"],
  [/DC53427/, "nuc-horse-canyon"],
  [/DN2820FYKH/, "nuc-forest-canyon"],
  [/DE3815TYK/, "nuc-thin-canyon"],
  [/D\d+WYKH/, "nuc-wilson-canyon-tall"],
  [/D\d+WYK/, "nuc-wilson-canyon-slim"],
  [/NUC5\w*RYK/, "nuc-rock-canyon-slim"],
  [/NUC5\w*RYH/, "nuc-rock-canyon-tall"],
  [/NUC5\w*MYH/, "nuc-maple-canyon"],
  [/NUC5(CP|PP|PG)YH/, "nuc-pinnacle-canyon"],
  [/NUC6\w*SYK/, "nuc-swift-canyon-slim"],
  [/NUC6\w*SYH/, "nuc-swift-canyon-tall"],
  [/NUC6I7KYK/, "nuc-skull-canyon"],
  [/NUC6CAY[HS]/, "nuc-arches-canyon"],
  [/NUC7\w*BNK/, "nuc-baby-canyon-slim"],
  [/NUC7\w*BNH/, "nuc-baby-canyon-tall"],
  [/NUC7\w*DNK/, "nuc-dawson-canyon-slim"],
  [/NUC7\w*DNH/, "nuc-dawson-canyon-tall"],
  [/NUC7[CP]JY[HS]/, "nuc-june-canyon"],
  [/NUC8I7H[VN]K/, "nuc-hades-canyon"],
  [/NUC8\w*BEK/, "nuc-bean-canyon-slim"],
  [/NUC8\w*BEH/, "nuc-bean-canyon-tall"],
  [/NUC8I3CYS/, "nuc-crimson-canyon"],
  [/NUC8\w*INH/, "nuc-islay-canyon"],
  [/NUC8\w*PNK/, "nuc-provo-canyon-slim"],
  [/NUC8\w*PNH/, "nuc-provo-canyon-tall"],
  [/NUC8CCHK/, "nuc-chaco-canyon"],
  [/NUC9\w*QNX/, "nuc-ghost-canyon"],
  [/NUC9\w*QNB|NUC11DBB|NUC12EDB/, "nuc-compute-element-h"],
  [/NUC13SBB/, "nuc-compute-element-shrike"],
  [/NUC10\w*FNK/, "nuc-frost-canyon-slim"],
  [/NUC10\w*FNH/, "nuc-frost-canyon-tall"],
  [/NUC11PHK/, "nuc-phantom-canyon"],
  [/NUC11PAK/, "nuc-panther-canyon-slim"],
  [/NUC11PAH/, "nuc-panther-canyon-tall"],
  [/NUC11PAQ/, "nuc-panther-canyon-pad"],
  [/NUC11TNK/, "nuc-tiger-canyon-slim"],
  [/NUC11TNH\w*0L/, "nuc-tiger-canyon-lan"],
  [/NUC11TNH/, "nuc-tiger-canyon-tall"],
  [/NUC11ATK/, "nuc-atlas-canyon"],
  [/NUC11BTM|NUC12DCM/, "nuc-beast-canyon"],
  [/NUC12SNK/, "nuc-serpent-canyon"],
  [/NUC12WSK/, "nuc-12-slim"],
  [/NUC12WSH\w*0L/, "nuc-wall-street-canyon-lan"],
  [/NUC12WSH/, "nuc-12-tall"],
  [/NUC13RNG/, "nuc-raptor-canyon"],
  [/NUC13(AN|L3|L5|LC)K/, "nuc-arena-canyon-slim"],
  [/NUC13(AN|L3|LC)H/, "nuc-arena-canyon-tall"],
  [/NUC13VYK/, "nuc-vivid-canyon"],
  [/NUC13BR[F]/, "nuc-bravo-canyon-fins"],
  [/NUC13BRK/, "nuc-bravo-canyon"],
  [/NUC14RVS/, "nuc-revel-canyon-plus"],
  [/NUC14RVK/, "nuc-revel-canyon-slim"],
  [/NUC14RVH/, "nuc-revel-canyon-tall"],
  [/NUC14LNS/, "nuc-lunar-canyon-plus"],
  [/NUC14LNK/, "nuc-lunar-canyon"],
  [/NUC14MNK/, "nuc-mill-canyon"],
  [/NUC14SRK/, "nuc-scorpion-canyon"],
  [/NUC15JNK/, "nuc-jean-canyon"],
  [/NUC16JNK/, "nuc-rog-16"],
  [/NUC15CRS/, "nuc-cyber-canyon-plus"],
  [/NUC15CRK/, "nuc-cyber-canyon-slim"],
  [/NUC15CRH/, "nuc-cyber-canyon-tall"],
  [/NUC16GD[K]/, "nuc-grand-canyon"],
  [/LAPQC/, "nuc-queens-county"],
  [/LAP(KC|AC)/, "nuc-king-county"],
  [/LAP(BC|RC)/, "nuc-bishop-county"],
  [/\b(CM8|CM11|B?ELM1)/, "nuc-compute-element"],
];

/** A PC's key by its product name: a NUC by its product code, one whose code is not known the plain small PC, else `unknown`. */
export function pcKey(dmiProduct: string): string {
  const name = text(dmiProduct).toUpperCase();
  const found = NUC_BODY_CODES.find(([code]) => code.test(name));
  if (found) return found[1];
  return /\bR?NUC/.test(name) ? "nuc" : "unknown";
}

/** One key for a machine. Order: a board, a NAS someone named, a Mac (not in a container), a small PC, else `unknown`. */
export function deviceKeyOf(facts: Partial<DeviceFacts> | null | undefined): string {
  const f = facts ?? {};
  const board = piKey(text(f.model), f.panel) ?? piKey(text(f.toldModel), f.panel);
  if (board) return board;
  const nas = nasKey(text(f.toldModel));
  if (nas) return nas;
  if (f.platform === "darwin" && f.container !== true) return macKey(text(f.macModel));
  return pcKey(text(f.dmiProduct));
}
