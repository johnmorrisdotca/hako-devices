// The catalogue: every device with its name, family, real size in millimetres, ports and the parts it is assembled from. Names are plain descriptive words; all trademarks belong to
// their owners, and this project is not affiliated with any of them. Pure data.
import { type BaseInfo, checkWith, type Description, type FitReport } from "./fit.ts";
import type { Size } from "./parts.ts";

export type FamilyId = "pi-boards" | "pi-dressed" | "desktops" | "laptops" | "tablets-phones" | "pcs" | "nas" | "classics" | "other" | "clients";

export const FAMILIES: readonly { id: FamilyId; title: string }[] = [
  { id: "pi-boards", title: "Single-board computers" },
  { id: "pi-dressed", title: "Boards with hats and cases" },
  { id: "desktops", title: "Desktops" },
  { id: "laptops", title: "Laptops" },
  { id: "tablets-phones", title: "Tablets and phones" },
  { id: "pcs", title: "Small PCs and towers" },
  { id: "nas", title: "NAS boxes" },
  { id: "classics", title: "Classics" },
  { id: "other", title: "Other" },
  { id: "clients", title: "Things that connect" },
];

export type PortKind =
  | "usb-a"
  | "usb-c"
  | "usb-micro"
  | "hdmi"
  | "hdmi-micro"
  | "hdmi-mini"
  | "ethernet"
  | "audio"
  | "gpio-40"
  | "sd-card"
  | "power"
  | "thunderbolt"
  | "esata"
  | "pcie";

export interface Port {
  kind: PortKind;
  count: number;
}

export interface Device {
  key: string;
  name: string;
  family: FamilyId;
  /** Published size in millimetres: width, depth, height. Null for what has no real size. */
  size: Size | null;
  ports: readonly Port[];
  /** What it is assembled from; `build` takes this. */
  parts: Description;
  status: "built";
}

const ports = (spec: Partial<Record<PortKind, number>>): Port[] => Object.entries(spec).map(([kind, count]) => ({ kind: kind as PortKind, count: count as number }));

const FULL_USBC = ports({ "usb-a": 4, ethernet: 1, "hdmi-micro": 2, "usb-c": 1, audio: 1, "gpio-40": 1, "sd-card": 1 });
const CLASSIC = ports({ "usb-a": 4, ethernet: 1, hdmi: 1, "usb-micro": 1, audio: 1, "gpio-40": 1, "sd-card": 1 });
const ZERO = ports({ "hdmi-mini": 1, "usb-micro": 2, "sd-card": 1 });

const device = (key: string, name: string, family: FamilyId, size: Size | null, portList: readonly Port[], parts: Description): Device => ({ key, name, family, size, ports: portList, parts, status: "built" });
const whole = (key: string, name: string, family: FamilyId, size: Size | null, portList: readonly Port[]): Device => device(key, name, family, size, portList, { base: key });

export const DEVICES: readonly Device[] = [
  device("pi-zero-bare", "Raspberry Pi Zero 2 W", "pi-boards", [65, 30, 5], ZERO, { board: "pi-zero-2w" }),
  device("pi-zero-w", "Raspberry Pi Zero W", "pi-boards", [65, 30, 5], ZERO, { board: "pi-zero-w" }),
  device("pi1b-plus", "Raspberry Pi 1 B+", "pi-boards", [85, 56, 17], CLASSIC, { board: "pi1b-plus" }),
  device("pi2b", "Raspberry Pi 2 B", "pi-boards", [85, 56, 17], CLASSIC, { board: "pi2b" }),
  device("pi3a-plus", "Raspberry Pi 3 A+", "pi-boards", [65, 56, 11], ports({ "usb-a": 1, hdmi: 1, "usb-micro": 1, audio: 1, "gpio-40": 1, "sd-card": 1 }), { board: "pi3a-plus" }),
  device("pi3b", "Raspberry Pi 3", "pi-boards", [85, 56, 17], CLASSIC, { board: "pi3b" }),
  device("pi3b-plus", "Raspberry Pi 3 B+", "pi-boards", [85, 56, 17], CLASSIC, { board: "pi3b-plus" }),
  device("pi4", "Raspberry Pi 4", "pi-boards", [85, 56, 17], FULL_USBC, { board: "pi4" }),
  device("pi5", "Raspberry Pi 5 with its cooler", "pi-boards", [85, 56, 20], ports({ "usb-a": 4, ethernet: 1, "hdmi-micro": 2, "usb-c": 1, "gpio-40": 1, "sd-card": 1, pcie: 1 }), { board: "pi5", cooler: "active-cooler" }),
  whole("pi400", "Raspberry Pi 400", "pi-boards", [286, 122, 23], ports({ "usb-a": 3, ethernet: 1, "hdmi-micro": 2, "usb-c": 1, "gpio-40": 1, "sd-card": 1 })),
  whole("pi500", "Raspberry Pi 500", "pi-boards", [286, 122, 23], ports({ "usb-a": 3, ethernet: 1, "hdmi-micro": 2, "usb-c": 1, "gpio-40": 1, "sd-card": 1 })),
  device("cm4-io", "Compute Module 4 on its IO board", "pi-boards", [160, 90, 17], ports({ "usb-a": 2, ethernet: 1, hdmi: 2, "usb-micro": 1, "gpio-40": 1, "sd-card": 1, pcie: 1, power: 1 }), { board: "cm4-io" }),

  device("pi-zero", "Raspberry Pi Zero 2 W in a small domed case", "pi-dressed", [82, 46, 15], ZERO, { board: "pi-zero-2w", case: "unipi" }),
  device("pi3b-oled", "Raspberry Pi 3 with the OLED bonnet", "pi-dressed", [85, 56, 25], CLASSIC, { board: "pi3b", hat: "oled-bonnet" }),
  device("pi4-pitft", "Raspberry Pi 4 in a finned case with the 2.8-inch touch screen", "pi-dressed", [89, 60, 25], FULL_USBC, { board: "pi4", case: "armor", hat: "pitft-28" }),
  device("pi4-pitft35", "Raspberry Pi 4 with the 3.5-inch touch screen", "pi-dressed", [85, 56, 25], FULL_USBC, { board: "pi4", hat: "pitft-35" }),
  device("pi4-touch7", "Raspberry Pi 4 on the 7-inch touch display", "pi-dressed", [194, 110, 20], FULL_USBC, { board: "pi4", screen: "touch-7" }),
  device("pi4-epaper", "Raspberry Pi 4 with the 2.13-inch e-paper hat", "pi-dressed", [85, 56, 18], FULL_USBC, { board: "pi4", hat: "epaper-213" }),
  device("pi4-poe", "Raspberry Pi 4 with a network power hat", "pi-dressed", [85, 56, 21], FULL_USBC, { board: "pi4", hat: "poe-plus" }),
  device("pi4-argon", "Raspberry Pi 4 in a faceted metal case", "pi-dressed", [107, 96, 28], FULL_USBC, { board: "pi4", case: "argon" }),
  device("pi4-armor", "Raspberry Pi 4 in a finned case with fans", "pi-dressed", [89, 60, 27], FULL_USBC, { board: "pi4", case: "armor" }),

  whole("mac-studio", "Mac Studio", "desktops", [197, 197, 95], ports({ thunderbolt: 6, "usb-a": 2, hdmi: 1, ethernet: 1, audio: 1, "sd-card": 1, power: 1 })),
  whole("mac-mini", "Mac mini (small)", "desktops", [127, 127, 50], ports({ thunderbolt: 3, "usb-c": 2, hdmi: 1, ethernet: 1, audio: 1, power: 1 })),
  whole("mac-mini-m1", "Mac mini (flat)", "desktops", [197, 197, 36], ports({ thunderbolt: 2, "usb-a": 2, hdmi: 1, ethernet: 1, audio: 1, power: 1 })),
  whole("mac-pro", "Mac Pro", "desktops", [218, 450, 529], ports({ thunderbolt: 2, "usb-a": 2, ethernet: 2, power: 1, pcie: 8 })),
  whole("imac-24", "iMac 24-inch", "desktops", [547, 147, 461], ports({ thunderbolt: 2, "usb-c": 2, audio: 1, power: 1 })),

  whole("macbook", "MacBook", "laptops", [304, 215, 11], ports({ "usb-c": 2, audio: 1 })),
  whole("macbook-air-13", "MacBook Air 13-inch", "laptops", [304, 215, 11], ports({ thunderbolt: 2, power: 1, audio: 1 })),
  whole("macbook-pro-14", "MacBook Pro 14-inch", "laptops", [313, 221, 16], ports({ thunderbolt: 3, hdmi: 1, "sd-card": 1, power: 1, audio: 1 })),
  whole("macbook-pro-16", "MacBook Pro 16-inch", "laptops", [356, 248, 17], ports({ thunderbolt: 3, hdmi: 1, "sd-card": 1, power: 1, audio: 1 })),

  whole("ipad-mini", "iPad mini", "tablets-phones", [195, 135, 6], ports({ "usb-c": 1 })),
  whole("ipad", "iPad", "tablets-phones", [249, 180, 7], ports({ "usb-c": 1 })),
  whole("ipad-air", "iPad Air", "tablets-phones", [248, 179, 6], ports({ "usb-c": 1 })),
  whole("ipad-pro-11", "iPad Pro 11-inch", "tablets-phones", [250, 178, 5], ports({ thunderbolt: 1 })),
  whole("ipad-pro-13", "iPad Pro 13-inch", "tablets-phones", [282, 216, 5], ports({ thunderbolt: 1 })),
  whole("iphone", "iPhone", "tablets-phones", [71, 147, 8], ports({ "usb-c": 1 })),

  whole("nuc", "Small PC", "pcs", [117, 112, 54], ports({ "usb-c": 3, "usb-a": 4, hdmi: 2, ethernet: 1, audio: 1, power: 1 })),
  whole("nuc-12-tall", "NUC 12 Pro (tall)", "pcs", [117, 112, 54], ports({ thunderbolt: 2, "usb-a": 4, "usb-c": 1, hdmi: 2, ethernet: 1, audio: 1, power: 1 })),
  whole("nuc-12-slim", "NUC 12 Pro (slim)", "pcs", [117, 112, 37], ports({ thunderbolt: 2, "usb-a": 4, "usb-c": 1, hdmi: 2, ethernet: 1, audio: 1, power: 1 })),
  whole("mini-pc", "Mini PC", "pcs", [128, 128, 48], ports({ "usb-a": 4, "usb-c": 1, hdmi: 2, ethernet: 1, audio: 1, power: 1 })),
  whole("pc-tower", "Small tower PC", "pcs", [180, 360, 380], ports({ "usb-a": 8, hdmi: 1, ethernet: 1, audio: 1, power: 1, pcie: 4 })),

  whole("nas-1bay", "One-bay NAS", "nas", [71, 224, 166], ports({ "usb-a": 2, ethernet: 1, power: 1 })),
  whole("nas-2bay", "Two-bay NAS", "nas", [105, 223, 166], ports({ "usb-a": 3, ethernet: 2, esata: 1, power: 1 })),
  whole("nas-4bay", "Four-bay NAS", "nas", [190, 223, 166], ports({ "usb-a": 3, ethernet: 2, esata: 1, power: 1 })),
  whole("nas-5bay", "Five-bay NAS", "nas", [226, 223, 166], ports({ "usb-a": 3, ethernet: 2, esata: 1, power: 1 })),
  whole("nas-rack", "Rack NAS", "nas", [482, 460, 44], ports({ "usb-a": 2, ethernet: 4, power: 2 })),

  whole("macintosh-128k", "Macintosh 128K", "classics", [243.8, 276.9, 345.4], ports({ power: 1 })),
  whole("game-boy-dmg-01", "Game Boy (DMG-01)", "classics", [90, 32, 148], ports({ audio: 1 })),
  whole("nokia-3310", "Nokia 3310", "classics", [48, 22, 113], []),
  whole("palm-iii", "Palm III", "classics", [81, 18, 119], []),
  whole("wii-rvl-001", "Wii (RVL-001)", "classics", [157, 197, 60], ports({ "usb-a": 2, power: 1 })),
  whole("xbox-series-x", "Xbox Series X", "classics", [151, 151, 301], ports({ "usb-a": 3, hdmi: 1, ethernet: 1, power: 1 })),
  whole("playstation-2-fat", "PlayStation 2 (fat)", "classics", [302.3, 182.9, 78.7], ports({ "usb-a": 2, power: 1 })),
  whole("amiga-500", "Amiga 500", "classics", [474, 330, 62], ports({ power: 1 })),
  whole("zx-spectrum-16k-48k", "ZX Spectrum 16K/48K", "classics", [233, 144, 30], ports({ audio: 2, power: 1 })),
  whole("dreamcast", "Dreamcast", "classics", [190, 195.8, 75.5], ports({ audio: 1, power: 1 })),

  whole("unknown", "A computer", "other", null, ports({ "usb-a": 2, power: 1 })),

  whole("client-firetv", "Fire TV stick", "clients", [86, 30, 14], ports({ hdmi: 1, "usb-micro": 1 })),
  whole("client-androidtv", "Android TV", "clients", [1230, 280, 771], ports({ hdmi: 3, "usb-a": 2, ethernet: 1, power: 1 })),
  whole("client-ipad", "iPad", "clients", [249, 180, 7], ports({ "usb-c": 1 })),
  whole("client-iphone", "iPhone", "clients", [71, 147, 8], ports({ "usb-c": 1 })),
  whole("client-android-tablet", "Android tablet", "clients", [254, 166, 6], ports({ "usb-c": 1 })),
  whole("client-android-phone", "Android phone", "clients", [75, 162, 8], ports({ "usb-c": 1 })),
  whole("client-computer", "Computer", "clients", [540, 170, 426], ports({ hdmi: 1, "usb-c": 1, power: 1 })),
  whole("client-browser", "Browser", "clients", null, []),
];

const BY_KEY = new Map(DEVICES.map((entry) => [entry.key, entry]));

/** A built device by its key. */
export const deviceByKey = (key: string): Device | undefined => BY_KEY.get(key);

const SLAB_WIDTHS: Readonly<Record<string, number>> = {
  "ipad-mini": 195.4,
  ipad: 248.6,
  "ipad-air": 247.6,
  "ipad-pro-11": 249.7,
  "ipad-pro-13": 281.6,
  iphone: 70.6,
  "client-ipad": 248.6,
  "client-iphone": 70.6,
  "client-android-tablet": 254,
  "client-android-phone": 75,
};
const BAYS: Readonly<Record<string, number>> = { "nas-1bay": 1, "nas-2bay": 2, "nas-4bay": 4, "nas-5bay": 5, "nas-rack": 4 };

/** What the fit check needs to know of a whole device. */
export function baseInfo(key: string): BaseInfo | undefined {
  const entry = BY_KEY.get(key);
  if (!entry || entry.parts.base === undefined) return undefined;
  return {
    size: entry.size,
    slabWidth: SLAB_WIDTHS[key],
    bays: BAYS[key] ? { count: BAYS[key], type: "bay-35" } : undefined,
  };
}

/** Does this machine go together? Pure: a form can ask on every change. */
export const check = (description: Description): FitReport => checkWith(description, baseInfo);

/** Real machines people have put together, ready to use or start from. */
export const PRESETS: readonly { id: string; name: string; description: Description }[] = [
  { id: "pi4-armor-pitft", name: 'Pi 4 in a finned case with a 2.8" touch screen', description: { board: "pi4", case: "armor", hat: "pitft-28" } },
  { id: "pi3-oled", name: "Pi 3 B with an OLED bonnet", description: { board: "pi3b", hat: "oled-bonnet" } },
  { id: "zero-case", name: "Pi Zero 2 W in a small domed case", description: { board: "pi-zero-2w", case: "unipi" } },
  { id: "zero-oled", name: "Pi Zero 2 W with a soldered header and an OLED bonnet", description: { board: "pi-zero-2w", solderHeader: true, hat: "oled-bonnet" } },
  { id: "pi5-poe", name: "Pi 5 with its cooler under a network power hat", description: { board: "pi5", cooler: "active-cooler", hat: "poe-plus" } },
  { id: "pi4-proto-oled", name: "Pi 4 with a prototyping hat and a small OLED module", description: { board: "pi4", hat: "proto-hat", screen: "oled-module" } },
  { id: "nas-half", name: "Four-bay NAS with two drives in", description: { base: "nas-4bay", drives: ["hdd-35", "hdd-35", null, null] } },
  { id: "tablet-flat", name: "A tablet lying flat", description: { base: "ipad", stand: null } },
];
