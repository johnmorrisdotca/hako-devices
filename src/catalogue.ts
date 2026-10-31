// The catalogue: every device with its name, family, real size in millimetres, ports and the parts it is assembled from. Names are plain descriptive words; all trademarks belong to
// their owners, and this project is not affiliated with any of them. Pure data.
import { DESK_ROWS } from "./desk-rows.ts";
import { type BaseInfo, checkWith, type Description, type FitReport } from "./fit.ts";
import type { Size } from "./parts.ts";
import { SLAB_ROWS } from "./slab-rows.ts";

export type FamilyId = "pi-boards" | "pi-dressed" | "desktops" | "next" | "classic-macs" | "laptops" | "tablets-phones" | "pcs" | "nas" | "classics" | "other" | "clients";

export const FAMILIES: readonly { id: FamilyId; title: string }[] = [
  { id: "pi-boards", title: "Single-board computers" },
  { id: "pi-dressed", title: "Boards with hats and cases" },
  { id: "desktops", title: "Desktops" },
  { id: "next", title: "NeXT" },
  { id: "classic-macs", title: "Classic Macs" },
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
  | "pcie"
  | "displayport"
  | "vga"
  | "serial"
  | "lightning"
  | "dock-30";

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
  device("rpi-zero", "Raspberry Pi Zero", "pi-boards", [65, 30, 5], ZERO, { board: "pi-zero-1" }),
  device("rpi-zero-wh", "Raspberry Pi Zero WH", "pi-boards", [65, 30, 13], ZERO, { board: "pi-zero-w", solderHeader: true }),
  device("rpi-zero-2-wh", "Raspberry Pi Zero 2 WH", "pi-boards", [65, 30, 13], ZERO, { board: "pi-zero-2w", solderHeader: true }),
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


  whole("macbook", "MacBook", "laptops", [304, 215, 11], ports({ "usb-c": 2, audio: 1 })),
  whole("macbook-air-13", "MacBook Air 13-inch", "laptops", [304, 215, 11], ports({ thunderbolt: 2, power: 1, audio: 1 })),
  whole("macbook-pro-14", "MacBook Pro 14-inch", "laptops", [313, 221, 16], ports({ thunderbolt: 3, hdmi: 1, "sd-card": 1, power: 1, audio: 1 })),
  whole("macbook-pro-16", "MacBook Pro 16-inch", "laptops", [356, 248, 17], ports({ thunderbolt: 3, hdmi: 1, "sd-card": 1, power: 1, audio: 1 })),
  whole("macbook-air-13-silver", "MacBook Air 13-inch, silver", "laptops", [304, 215, 11], ports({ thunderbolt: 2, power: 1, audio: 1 })),
  whole("macbook-pro-14-silver", "MacBook Pro 14-inch, silver", "laptops", [313, 221, 16], ports({ thunderbolt: 3, hdmi: 1, "sd-card": 1, power: 1, audio: 1 })),
  whole("macbook-pro-16-black", "MacBook Pro 16-inch, black", "laptops", [356, 248, 17], ports({ thunderbolt: 3, hdmi: 1, "sd-card": 1, power: 1, audio: 1 })),
  whole("macbook-pro-17-inch", "MacBook Pro 17-inch", "laptops", [392, 265, 25.9], ports({ "usb-a": 3, power: 1, audio: 1, "sd-card": 1 })),

  whole("ipad-mini", "iPad mini", "tablets-phones", [195, 135, 6], ports({ "usb-c": 1 })),
  whole("ipad", "iPad", "tablets-phones", [249, 180, 7], ports({ "usb-c": 1 })),
  whole("ipad-air", "iPad Air", "tablets-phones", [248, 179, 6], ports({ "usb-c": 1 })),
  whole("ipad-pro-11", "iPad Pro 11-inch (M4 and M5)", "tablets-phones", [250, 178, 5], ports({ thunderbolt: 1 })),
  whole("ipad-pro-13", "iPad Pro 13-inch (M4 and M5)", "tablets-phones", [282, 216, 5], ports({ thunderbolt: 1 })),
  whole("ipad-pro-12-9-inch", "iPad Pro (12.9-inch), 2015", "tablets-phones", [305.7, 220.6, 6.9], []),
  whole("ipad-pro-9-7-inch", "iPad Pro (9.7-inch), 2016", "tablets-phones", [240, 169.5, 6.1], []),
  whole("ipad-pro-10-5-inch", "iPad Pro (10.5-inch), 2017", "tablets-phones", [250.6, 174.1, 6.1], []),
  whole("ipad-pro-12-9-inch-2nd-generation", "iPad Pro 12.9-inch (2nd generation), 2017", "tablets-phones", [305.7, 220.6, 6.9], []),
  whole("ipad-pro-11-inch", "iPad Pro 11-inch (1st generation), 2018", "tablets-phones", [247.6, 178.5, 5.9], ports({ "usb-c": 1 })),
  whole("ipad-pro-12-9-inch-3rd-generation", "iPad Pro 12.9-inch (3rd generation), 2018", "tablets-phones", [280.6, 214.9, 5.9], ports({ "usb-c": 1 })),
  whole("ipad-pro-11-inch-2nd-generation", "iPad Pro 11-inch (2nd to 4th generation), 2020 to 2022", "tablets-phones", [247.6, 178.5, 5.9], ports({ "usb-c": 1 })),
  whole("ipad-pro-12-9-inch-4th-generation", "iPad Pro 12.9-inch (4th generation), 2020", "tablets-phones", [280.6, 214.9, 5.9], ports({ "usb-c": 1 })),
  whole("ipad-pro-12-9-inch-5th-generation", "iPad Pro 12.9-inch (5th and 6th generation), 2021 and 2022", "tablets-phones", [280.6, 214.9, 6.4], ports({ thunderbolt: 1 })),
  whole("iphone", "iPhone", "tablets-phones", [71, 147, 8], ports({ "usb-c": 1 })),
  ...SLAB_ROWS.map(([key, name, size, sockets]) => whole(key, name, "tablets-phones", [...size], ports(sockets))),

  whole("nuc", "Small PC", "pcs", [117, 112, 54], ports({ "usb-c": 3, "usb-a": 4, hdmi: 2, ethernet: 1, audio: 1, power: 1 })),
  whole("mini-pc", "Mini PC", "pcs", [128, 128, 48], ports({ "usb-a": 4, "usb-c": 1, hdmi: 2, ethernet: 1, audio: 1, power: 1 })),
  whole("nuc-deep-canyon", "NUC with Celeron or Core i3 (Deep Canyon, Ice Canyon)", "pcs", [116.6, 112, 39], ports({ "usb-a": 2, power: 1, hdmi: 2, ethernet: 1 })),
  whole("nuc-box-canyon", "NUC with Thunderbolt and a red lid (Box Canyon)", "pcs", [116.6, 112, 39], ports({ "usb-a": 2, power: 1, hdmi: 1, thunderbolt: 1 })),
  whole("nuc-horse-canyon", "NUC with Core i5 (Horse Canyon)", "pcs", [116.6, 112, 39], ports({ "usb-a": 2, power: 1, hdmi: 1, displayport: 2, ethernet: 1 })),
  whole("nuc-forest-canyon", "NUC with Celeron (Forest Canyon)", "pcs", [116.6, 112, 51.5], ports({ "usb-a": 3, audio: 1, power: 1, hdmi: 1, ethernet: 1 })),
  whole("nuc-thin-canyon", "Fanless NUC with Atom (Thin Canyon)", "pcs", [190, 116, 40], ports({ "usb-a": 3, power: 1, audio: 1, ethernet: 1, vga: 1, hdmi: 1 })),
  whole("nuc-wilson-canyon-slim", "NUC, 4th generation, slim (Wilson Canyon)", "pcs", [116.6, 112, 34.5], ports({ "usb-a": 4, power: 1, "hdmi-mini": 1, displayport: 1, ethernet: 1 })),
  whole("nuc-wilson-canyon-tall", "NUC, 4th generation, tall (Wilson Canyon)", "pcs", [116.6, 112, 51.5], ports({ "usb-a": 4, power: 1, "hdmi-mini": 1, displayport: 1, ethernet: 1 })),
  whole("nuc-rock-canyon-slim", "NUC, 5th generation, slim (Rock Canyon)", "pcs", [115, 111, 34.5], ports({ "usb-a": 4, audio: 1, power: 1, "hdmi-mini": 1, displayport: 1, ethernet: 1 })),
  whole("nuc-rock-canyon-tall", "NUC, 5th generation, tall (Rock Canyon)", "pcs", [115, 111, 49], ports({ "usb-a": 4, audio: 1, power: 1, "hdmi-mini": 1, displayport: 1, ethernet: 1 })),
  whole("nuc-maple-canyon", "NUC, 5th generation, two Mini DisplayPorts (Maple Canyon)", "pcs", [115, 111, 49], ports({ "usb-a": 4, audio: 1, power: 1, displayport: 2, ethernet: 1 })),
  whole("nuc-pinnacle-canyon", "NUC with Celeron or Pentium, 5th generation (Pinnacle Canyon, Grass Canyon)", "pcs", [115, 111, 52], ports({ "usb-a": 4, audio: 2, power: 1, hdmi: 1, vga: 1, ethernet: 1, "sd-card": 1 })),
  whole("nuc-swift-canyon-slim", "NUC, 6th generation, slim (Swift Canyon)", "pcs", [115, 111, 32], ports({ "usb-a": 4, power: 1, displayport: 1, hdmi: 1, ethernet: 1, "sd-card": 1 })),
  whole("nuc-swift-canyon-tall", "NUC, 6th generation, tall (Swift Canyon)", "pcs", [115, 111, 48], ports({ "usb-a": 4, power: 1, displayport: 1, hdmi: 1, ethernet: 1, "sd-card": 1 })),
  whole("nuc-skull-canyon", "NUC 6 long and flat (Skull Canyon)", "pcs", [211, 116, 28], ports({ "sd-card": 1, "usb-a": 4, audio: 2, power: 1, ethernet: 1, displayport: 1, hdmi: 1, thunderbolt: 1 })),
  whole("nuc-arches-canyon", "NUC with Celeron, 6th generation (Arches Canyon)", "pcs", [115, 111, 51], ports({ "usb-a": 4, audio: 2, power: 1, hdmi: 1, vga: 1, ethernet: 1, "sd-card": 1 })),
  whole("nuc-baby-canyon-slim", "NUC 7, slim (Baby Canyon)", "pcs", [115, 111, 35], ports({ "usb-a": 4, power: 1, hdmi: 1, ethernet: 1, "sd-card": 1, thunderbolt: 1 })),
  whole("nuc-baby-canyon-tall", "NUC 7, tall (Baby Canyon)", "pcs", [115, 111, 51], ports({ "usb-a": 4, power: 1, hdmi: 1, ethernet: 1, "sd-card": 1, thunderbolt: 1 })),
  whole("nuc-dawson-canyon-slim", "NUC 7 for business, slim (Dawson Canyon)", "pcs", [115, 111, 36], ports({ "usb-a": 4, power: 1, hdmi: 2, ethernet: 1 })),
  whole("nuc-dawson-canyon-tall", "NUC 7 for business, tall (Dawson Canyon)", "pcs", [115, 111, 52], ports({ "usb-a": 4, power: 1, hdmi: 2, ethernet: 1 })),
  whole("nuc-june-canyon", "NUC 7 Essential (June Canyon)", "pcs", [115, 111, 51], ports({ "usb-a": 4, audio: 2, power: 1, hdmi: 2, ethernet: 1, "sd-card": 1 })),
  whole("nuc-hades-canyon", "NUC 8 long and flat (Hades Canyon)", "pcs", [221, 142, 39], ports({ "sd-card": 1, hdmi: 2, "usb-c": 1, "usb-a": 6, audio: 2, power: 1, ethernet: 2, displayport: 2, thunderbolt: 2 })),
  whole("nuc-bean-canyon-slim", "NUC 8, slim (Bean Canyon)", "pcs", [117, 112, 36], ports({ "usb-a": 5, audio: 1, power: 1, hdmi: 1, ethernet: 1, "sd-card": 1, thunderbolt: 1 })),
  whole("nuc-bean-canyon-tall", "NUC 8, tall (Bean Canyon)", "pcs", [117, 112, 51], ports({ "usb-a": 5, audio: 1, power: 1, hdmi: 1, ethernet: 1, "sd-card": 1, thunderbolt: 1 })),
  whole("nuc-crimson-canyon", "NUC 8 Home (Crimson Canyon)", "pcs", [117, 112, 51], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1 })),
  whole("nuc-islay-canyon", "NUC 8 Mainstream-G (Islay Canyon)", "pcs", [117, 112, 51], ports({ "usb-c": 1, "usb-a": 3, audio: 1, power: 1, hdmi: 1, displayport: 1, ethernet: 1 })),
  whole("nuc-provo-canyon-slim", "NUC 8 Pro, slim (Provo Canyon)", "pcs", [117, 112, 37], ports({ "usb-c": 1, "usb-a": 3, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 1 })),
  whole("nuc-provo-canyon-tall", "NUC 8 Pro, tall (Provo Canyon)", "pcs", [117, 112, 53], ports({ "usb-c": 1, "usb-a": 3, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 1 })),
  whole("nuc-chaco-canyon", "NUC 8 Rugged (Chaco Canyon)", "pcs", [154, 108, 32], ports({ "usb-a": 4, audio: 1, power: 1, ethernet: 1, hdmi: 2 })),
  whole("nuc-compute-element", "NUC Compute Element, U series", "pcs", [95, 65, 6], []),
  whole("nuc-assembly-element", "NUC Assembly Element", "pcs", [117, 147, 25], ports({ power: 1, "usb-a": 4, ethernet: 1, hdmi: 1 })),
  whole("nuc-pro-chassis-element", "NUC Pro Chassis Element", "pcs", [200, 150, 35], ports({ "usb-a": 5, "usb-c": 1, power: 1, audio: 1, hdmi: 2, ethernet: 1 })),
  whole("nuc-rugged-chassis-element", "NUC Rugged Chassis Element", "pcs", [254, 152.4, 40.8], ports({ power: 1, audio: 1, "usb-a": 3, ethernet: 2, hdmi: 2, serial: 1 })),
  whole("nuc-compute-element-h", "NUC Compute Element, on a card", "pcs", [39, 202, 131], ports({ "usb-a": 2, ethernet: 1, hdmi: 1, thunderbolt: 2 })),
  whole("nuc-compute-element-shrike", "NUC 13 Extreme Compute Element", "pcs", [47, 305, 137], ports({ "usb-a": 4, ethernet: 1, hdmi: 1, audio: 1 })),
  whole("nuc-ghost-canyon", "NUC 9 Extreme or Pro (Ghost Canyon, Quartz Canyon)", "pcs", [96, 238, 216], ports({ "sd-card": 1, "usb-a": 6, audio: 2, ethernet: 2, hdmi: 1, power: 1, thunderbolt: 2 })),
  whole("nuc-frost-canyon-slim", "NUC 10 Performance, slim (Frost Canyon)", "pcs", [117, 112, 38], ports({ "usb-c": 1, "usb-a": 3, audio: 1, power: 1, hdmi: 1, ethernet: 1, "sd-card": 1, thunderbolt: 1 })),
  whole("nuc-frost-canyon-tall", "NUC 10 Performance, tall (Frost Canyon)", "pcs", [117, 112, 51], ports({ "usb-c": 1, "usb-a": 3, audio: 1, power: 1, hdmi: 1, ethernet: 1, "sd-card": 1, thunderbolt: 1 })),
  whole("nuc-phantom-canyon", "NUC 11 Enthusiast (Phantom Canyon)", "pcs", [221, 142, 42], ports({ "sd-card": 1, "usb-a": 6, audio: 2, power: 1, ethernet: 1, hdmi: 1, displayport: 1, thunderbolt: 2 })),
  whole("nuc-panther-canyon-slim", "NUC 11 Performance, slim (Panther Canyon)", "pcs", [117, 112, 38], ports({ "usb-a": 3, audio: 1, power: 1, hdmi: 1, displayport: 1, ethernet: 1, "sd-card": 1, thunderbolt: 2 })),
  whole("nuc-panther-canyon-tall", "NUC 11 Performance, tall (Panther Canyon)", "pcs", [117, 112, 51], ports({ "usb-a": 3, audio: 1, power: 1, hdmi: 1, displayport: 1, ethernet: 1, "sd-card": 1, thunderbolt: 2 })),
  whole("nuc-panther-canyon-pad", "NUC 11 Performance with a charging lid (Panther Canyon)", "pcs", [117, 112, 56], ports({ "usb-a": 3, audio: 1, power: 1, hdmi: 1, displayport: 1, ethernet: 1, "sd-card": 1, thunderbolt: 2 })),
  whole("nuc-tiger-canyon-slim", "NUC 11 Pro, slim (Tiger Canyon)", "pcs", [117, 112, 37], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-tiger-canyon-tall", "NUC 11 Pro, tall (Tiger Canyon)", "pcs", [117, 112, 54], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-tiger-canyon-lan", "NUC 11 Pro with a second network socket (Tiger Canyon)", "pcs", [117, 112, 54], ports({ "usb-a": 6, audio: 1, power: 1, hdmi: 2, ethernet: 2, thunderbolt: 2 })),
  whole("nuc-atlas-canyon", "NUC 11 Essential (Atlas Canyon)", "pcs", [135, 115, 36], ports({ "usb-a": 6, audio: 1, power: 1, hdmi: 1, displayport: 1, ethernet: 1 })),
  whole("nuc-beast-canyon", "NUC 11 or 12 Extreme (Beast Canyon, Dragon Canyon)", "pcs", [120, 357, 189], ports({ "sd-card": 1, "usb-a": 6, "usb-c": 1, audio: 2, power: 1, ethernet: 1, hdmi: 1, thunderbolt: 2 })),
  whole("nuc-serpent-canyon", "NUC 12 Enthusiast (Serpent Canyon)", "pcs", [60, 180, 230], ports({ "usb-a": 6, audio: 1, "sd-card": 1, hdmi: 1, displayport: 2, ethernet: 1, power: 1, thunderbolt: 2 })),
  whole("nuc-12-tall", "NUC 12 Pro (tall)", "pcs", [117, 112, 54], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-12-slim", "NUC 12 Pro (slim)", "pcs", [117, 112, 37], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-wall-street-canyon-lan", "NUC 12 Pro with a second network socket (Wall Street Canyon)", "pcs", [117, 112, 54], ports({ "usb-a": 6, audio: 1, power: 1, hdmi: 2, ethernet: 2, thunderbolt: 2 })),
  whole("nuc-raptor-canyon", "NUC 13 Extreme (Raptor Canyon)", "pcs", [129, 337, 318], ports({ "usb-a": 8, "usb-c": 1, audio: 1, ethernet: 1, hdmi: 1, power: 1, thunderbolt: 2 })),
  whole("nuc-arena-canyon-slim", "NUC 13 Pro, slim (Arena Canyon)", "pcs", [117, 112, 37], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-arena-canyon-tall", "NUC 13 Pro, tall (Arena Canyon)", "pcs", [117, 112, 54], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-vivid-canyon", "NUC 13 Pro Desk Edition (Vivid Canyon)", "pcs", [117, 111, 37], ports({ "usb-a": 4, audio: 1, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-bravo-canyon-fins", "NUC 13 Rugged with its heatsink outside (Bravo Canyon)", "pcs", [174, 108, 39.2], ports({ power: 1, "usb-a": 3, ethernet: 2, hdmi: 2 })),
  whole("nuc-bravo-canyon", "NUC 13 Rugged (Bravo Canyon)", "pcs", [174, 108, 29.3], ports({ power: 1, "usb-a": 3, ethernet: 2, hdmi: 2 })),
  whole("nuc-revel-canyon-slim", "NUC 14 Pro, slim (Revel Canyon)", "pcs", [117, 112, 37], ports({ "usb-c": 1, "usb-a": 4, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-revel-canyon-tall", "NUC 14 Pro, tall (Revel Canyon)", "pcs", [117, 112, 54], ports({ "usb-c": 1, "usb-a": 4, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-revel-canyon-plus", "NUC 14 Pro+ (Revel Canyon)", "pcs", [144, 112, 41], ports({ "usb-c": 1, "usb-a": 4, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-lunar-canyon", "NUC 14 Pro AI (Lunar Canyon)", "pcs", [130, 130, 34], ports({ audio: 1, "usb-a": 4, power: 1, hdmi: 1, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-lunar-canyon-plus", "NUC 14 Pro AI+ (Lunar Canyon)", "pcs", [130, 130, 34], ports({ audio: 1, "usb-a": 4, power: 1, hdmi: 1, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-mill-canyon", "NUC 14 Essential (Mill Canyon)", "pcs", [135, 115, 36], ports({ "usb-c": 2, "usb-a": 5, audio: 1, power: 1, hdmi: 1, displayport: 1, ethernet: 1 })),
  whole("nuc-mill-canyon-fanless", "NUC 14 Essential Fanless", "pcs", [135, 115, 48.2], ports({ "usb-c": 2, "usb-a": 5, audio: 1, power: 1, hdmi: 1, displayport: 1, ethernet: 1 })),
  whole("nuc-scorpion-canyon", "ROG NUC or NUC 14 Performance (Scorpion Canyon)", "pcs", [60, 180, 270], ports({ "usb-a": 6, "usb-c": 1, audio: 1, displayport: 4, ethernet: 1, power: 1, thunderbolt: 1 })),
  whole("nuc-jean-canyon", "ROG NUC 2025 or NUC 15 Performance (Jean Canyon)", "pcs", [56.5, 187.7, 282.4], ports({ "usb-a": 6, "usb-c": 1, audio: 1, hdmi: 2, displayport: 2, ethernet: 1, power: 1, thunderbolt: 1 })),
  whole("nuc-rog-16", "ROG NUC 16", "pcs", [56.5, 189.5, 282.5], ports({ "usb-a": 6, "usb-c": 1, audio: 1, hdmi: 2, displayport: 2, ethernet: 1, power: 1, thunderbolt: 1 })),
  whole("nuc-cyber-canyon-slim", "NUC 15 Pro, slim (Cyber Canyon)", "pcs", [117, 112, 36.8], ports({ "usb-c": 1, "usb-a": 4, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-cyber-canyon-tall", "NUC 15 Pro, tall (Cyber Canyon)", "pcs", [117, 112, 54], ports({ "usb-c": 1, "usb-a": 4, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-cyber-canyon-plus", "NUC 15 Pro+ (Cyber Canyon)", "pcs", [144, 112, 41.8], ports({ "usb-c": 1, "usb-a": 4, power: 1, hdmi: 2, ethernet: 1, thunderbolt: 2 })),
  whole("nuc-grand-canyon", "NUC 16 Pro (Grand Canyon)", "pcs", [144, 117, 42], ports({ "usb-a": 4, "usb-c": 1, power: 1, hdmi: 2, ethernet: 2, thunderbolt: 2 })),
  whole("nuc-16", "NUC 16", "pcs", [144, 117, 42], ports({ audio: 1, "usb-a": 4, "usb-c": 1, power: 1, hdmi: 2, ethernet: 2, thunderbolt: 1 })),
  whole("nuc-board", "NUC board, 4 by 4 inches", "pcs", [101.6, 101.6, 28.8], ports({ power: 1, hdmi: 1, ethernet: 1, "usb-a": 4, "usb-c": 1, audio: 1 })),
  whole("nuc-board-sbc", "NUC board, 146 by 102 mm", "pcs", [146, 101.7, 17.39], ports({ power: 1, "usb-a": 3, ethernet: 2, hdmi: 2 })),
  whole("nuc-board-element", "NUC Board Element", "pcs", [110, 80, 16.21], ports({ power: 1, "usb-a": 4, ethernet: 1, hdmi: 1 })),
  whole("nuc-queens-county", "NUC 9 Extreme Laptop Kit (Queens County)", "pcs", [356.4, 233.6, 20.5], ports({ thunderbolt: 2, "usb-a": 2, hdmi: 1, audio: 1, power: 1 })),
  whole("nuc-king-county", "NUC X15 Laptop Kit (King County, Alder County)", "pcs", [357, 235, 21.65], ports({ thunderbolt: 2, "usb-a": 2, hdmi: 1, audio: 1, power: 1 })),
  whole("nuc-bishop-county", "NUC M15 Laptop Kit (Bishop County, Rooks County)", "pcs", [355, 230, 14.9], ports({ thunderbolt: 2, "usb-a": 2, hdmi: 1, audio: 1, power: 1 })),
  whole("nuc-p14e", "NUC P14E Laptop Element", "pcs", [304, 230, 16.5], ports({ thunderbolt: 2, "usb-a": 2, hdmi: 1, audio: 1, power: 1 })),
  whole("pc-tower", "Small tower PC", "pcs", [180, 360, 380], ports({ "usb-a": 8, hdmi: 1, ethernet: 1, audio: 1, power: 1, pcie: 4 })),

  whole("nas-1bay", "One-bay NAS", "nas", [71, 224, 166], ports({ "usb-a": 2, ethernet: 1, power: 1 })),
  whole("nas-2bay", "Two-bay NAS", "nas", [105, 223, 166], ports({ "usb-a": 3, ethernet: 2, esata: 1, power: 1 })),
  whole("nas-4bay", "Four-bay NAS", "nas", [190, 223, 166], ports({ "usb-a": 3, ethernet: 2, esata: 1, power: 1 })),
  whole("nas-5bay", "Five-bay NAS", "nas", [226, 223, 166], ports({ "usb-a": 3, ethernet: 2, esata: 1, power: 1 })),
  whole("nas-rack", "Rack NAS", "nas", [482, 460, 44], ports({ "usb-a": 2, ethernet: 4, power: 2 })),

  whole("game-boy-dmg-01", "Game Boy (DMG-01)", "classics", [90, 32, 148], ports({ audio: 1 })),
  whole("nokia-3310", "Nokia 3310", "classics", [48, 22, 113], []),
  whole("palm-iii", "Palm III", "classics", [81, 18, 119], []),
  whole("wii-rvl-001", "Wii (RVL-001)", "classics", [157, 197, 60], ports({ "usb-a": 2, power: 1 })),
  whole("xbox-series-x", "Xbox Series X", "classics", [151, 151, 301], ports({ "usb-a": 3, hdmi: 1, ethernet: 1, power: 1 })),
  whole("playstation-2-fat", "PlayStation 2 (fat)", "classics", [302.3, 182.9, 78.7], ports({ "usb-a": 2, power: 1 })),
  whole("amiga-500", "Amiga 500", "classics", [474, 330, 62], ports({ power: 1 })),
  whole("zx-spectrum-16k-48k", "ZX Spectrum 16K/48K", "classics", [233, 144, 30], ports({ audio: 2, power: 1 })),
  whole("dreamcast", "Dreamcast", "classics", [190, 195.8, 75.5], ports({ audio: 1, power: 1 })),
  whole("hp-12c", "HP-12C", "classics", [128, 79, 15], []),
  whole("hp-15c", "HP-15C", "classics", [128, 79, 15], []),
  whole("hp-35", "HP-35", "classics", [81, 33, 150], []),
  whole("ti-83", "TI-83", "classics", [88.9, 25.4, 185.4], []),
  whole("ti-84-plus", "TI-84 Plus", "classics", [90, 24, 180], []),
  whole("ti-30", "TI-30", "classics", [76, 22, 148], []),
  whole("casio-fx-82", "Casio fx-82", "classics", [78, 14, 160], []),
  whole("curta-type-i", "Curta Type I", "classics", [50, 50, 80], []),
  whole("game-boy-pocket-mgb-001", "Game Boy Pocket (MGB-001)", "classics", [77.6, 25.3, 127.6], []),
  whole("game-boy-color-cgb-001", "Game Boy Color (CGB-001)", "classics", [80, 28, 132], []),
  whole("nintendo-gamecube", "Nintendo GameCube", "classics", [150, 161, 110], []),
  whole("nintendo-3ds-ctr-001", "Nintendo 3DS (CTR-001)", "classics", [134, 22, 74], []),
  whole("family-computer-famicom", "Family Computer (Famicom)", "classics", [150, 220, 60], []),
  whole("nintendo-entertainment-system-nes-001", "Nintendo Entertainment System (NES-001)", "classics", [255, 202, 85], []),
  whole("super-famicom", "Super Famicom", "classics", [200, 242, 72], []),
  whole("super-nintendo-entertainment-system-sns-001", "Super Nintendo Entertainment System (SNS-001)", "classics", [190, 180, 70], []),
  whole("master-system-original", "Master System (original)", "classics", [365, 170, 70], []),
  whole("mega-drive-genesis-model-1", "Mega Drive / Genesis (model 1)", "classics", [280, 212, 70], []),
  whole("game-gear", "Game Gear", "classics", [210, 38, 113], []),
  whole("saturn-model-1", "Saturn (model 1)", "classics", [260, 230, 83], []),
  whole("atari-2600-four-switch", "Atari 2600 (four-switch)", "classics", [346, 232, 89], []),
  whole("atari-5200-four-port", "Atari 5200 (four-port)", "classics", [381, 330, 108], []),
  whole("atari-7800", "Atari 7800", "classics", [298, 229, 89], []),
  whole("atari-lynx", "Atari Lynx", "classics", [273, 38, 108], []),
  whole("atari-jaguar", "Atari Jaguar", "classics", [241.3, 254, 57.2], []),
  whole("intellivision", "Intellivision", "classics", [406, 229, 76], []),
  whole("pc-engine", "PC Engine", "classics", [140, 135, 40.4], []),
  whole("turbografx-16", "TurboGrafx-16", "classics", [305, 178, 76], []),

  whole("nintendo-64", "Nintendo 64", "classics", [260, 190, 73], ports({ power: 1 })),
  whole("game-boy-advance-agb-001", "Game Boy Advance (AGB-001)", "classics", [144.5, 24.5, 82], ports({ audio: 1 })),
  whole("nintendo-ds-ntr-001", "Nintendo DS (NTR-001)", "classics", [148.7, 28.9, 84.7], ports({ audio: 1 })),
  whole("nintendo-switch", "Nintendo Switch", "classics", [238, 14, 102], ports({ "usb-c": 1, audio: 1 })),
  whole("playstation-4-original", "PlayStation 4 (original)", "classics", [304.8, 274.3, 53.1], ports({ "usb-a": 2, hdmi: 1, ethernet: 1, power: 1 })),
  whole("playstation-5", "PlayStation 5", "classics", [104, 260, 390], ports({ "usb-c": 1, "usb-a": 3, hdmi: 1, ethernet: 1, power: 1 })),
  whole("apple-tv-4k-1st-generation", "Apple TV 4K", "classics", [98, 98, 35], ports({ hdmi: 1, ethernet: 1, power: 1 })),
  whole("ipod-nano-1st-generation", "iPod nano (1st generation)", "classics", [41, 6.9, 89], ports({ audio: 1 })),
  whole("airpods-1", "AirPods (1st generation), in their case", "classics", [44.3, 21.3, 53.5], []),
  whole("airpods-pro-1", "AirPods Pro (1st generation), in their case", "classics", [60.6, 21.7, 45.2], []),
  whole("airpods-max", "AirPods Max", "classics", [168.6, 83.4, 187.3], []),
  whole("apple-vision-pro", "Apple Vision Pro", "classics", null, []),

  ...DESK_ROWS.map(([key, name, family, size, sockets]) => whole(key, name, family, size ? [...size] : null, ports(sockets))),

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

/** The same machine in its other colours: a page can offer them as a choice. Each key is a device of its own. */
export const FINISHES: Readonly<Record<string, readonly { key: string; finish: string }[]>> = {
  "macbook-air-13": [
    { key: "macbook-air-13", finish: "Midnight" },
    { key: "macbook-air-13-silver", finish: "Silver" },
  ],
  "macbook-pro-14": [
    { key: "macbook-pro-14", finish: "Black" },
    { key: "macbook-pro-14-silver", finish: "Silver" },
  ],
  "macbook-pro-16": [
    { key: "macbook-pro-16", finish: "Silver" },
    { key: "macbook-pro-16-black", finish: "Black" },
  ],
};

const BY_KEY = new Map(DEVICES.map((entry) => [entry.key, entry]));

/** A built device by its key. */
export const deviceByKey = (key: string): Device | undefined => BY_KEY.get(key);

const SLAB_WIDTHS: Record<string, number> = {
  "ipad-mini": 195.4,
  ipad: 248.6,
  "ipad-air": 247.6,
  "ipad-pro-11": 249.7,
  "ipad-pro-13": 281.6,
  "ipad-pro-12-9-inch": 305.7,
  "ipad-pro-9-7-inch": 240,
  "ipad-pro-10-5-inch": 250.6,
  "ipad-pro-12-9-inch-2nd-generation": 305.7,
  "ipad-pro-11-inch": 247.6,
  "ipad-pro-12-9-inch-3rd-generation": 280.6,
  "ipad-pro-11-inch-2nd-generation": 247.6,
  "ipad-pro-12-9-inch-4th-generation": 280.6,
  "ipad-pro-12-9-inch-5th-generation": 280.6,
  iphone: 70.6,
  "client-ipad": 248.6,
  "client-iphone": 70.6,
  "client-android-tablet": 254,
  "client-android-phone": 75,
};
for (const [key, , [across]] of SLAB_ROWS) SLAB_WIDTHS[key] = across;
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
