// Every Mac mini and Mac Studio: Apple's published sizes and the parts placed from Apple's pictures of each model's front and back. Plain geometry, no mark.
import type { Material } from "../kit.ts";
import { block, type DeskSpec, onFace, type Piece } from "../desk.ts";

type Socket = "power" | "ac" | "net" | "fw" | "hdmi" | "mdp" | "tb" | "usb" | "usbv" | "card" | "jack" | "dvi" | "phone" | "dc";

const socket = (b: ReturnType<typeof onFace>, kind: Socket, x: number, y: number): Piece[] => {
  if (kind === "power") return [b.round("key", x, y, 10)];
  if (kind === "ac") return [b.port(x, y, 18, 9, 4.2)];
  if (kind === "net") return [b.port(x, y, 13, 10, 1)];
  if (kind === "fw") return [b.port(x, y, 6.3, 10, 1)];
  if (kind === "hdmi") return [b.port(x, y, 14.6, 5, 1)];
  if (kind === "mdp") return [b.port(x, y, 7, 4.6, 0.8)];
  if (kind === "tb") return [b.usbc(x, y, false)];
  if (kind === "usb") return [b.usba(x, y)];
  if (kind === "usbv") return [b.usba(x, y, true)];
  if (kind === "card") return [b.mark("slot", x, y, 27, 3, { r: 1, over: 1 })];
  if (kind === "dvi") return [b.port(x, y, 28, 8, 1.5)];
  if (kind === "phone") return [b.mark("metal", x, y, 11, 10, { r: 1, over: 1 })];
  if (kind === "dc") return [b.port(x, y, 7, 13, 3.4)];
  return [b.jack(x, y, 4.6)];
};

type SocketAt = readonly [Socket, number, number];

interface Tall {
  front: (f: ReturnType<typeof onFace>) => Piece[];
  sockets: readonly SocketAt[];
  vents: number;
  panelH: number;
}

/** The first mini: 165 square, 51 tall, a white top over a metal band, its sockets on a white plate in its back. */
function polyMini({ sockets, vents, front }: Tall): DeskSpec {
  const W = 165.1;
  const H = 50.8;
  const F = W / 2;
  const b = onFace("back", -F);
  return {
    pieces: [
      block("alu", 0, 0, W, W, 0, H - 4, { r: 14, edge: 1 }),
      block("plastic-white", 0, 0, W - 1, W - 1, H - 7, H, { r: 14, edge: 2.5 }),
      ...front(onFace("front", F)),
      b.mark("shell", 0, 22, 142, 34, { r: 4, mat: "plastic-white" }),
      b.mark("slot", -62 + 66, 32, 3.2, 10, { cols: vents, gap: 5.6, over: 1 }),
      ...sockets.flatMap(([kind, x, y]) => socket(b, kind, x, y)),
    ],
    prints: [{ id: "lid", at: [0, H + 0.04, 0], turn: [-90, 0, 0], w: 90, h: 20 }],
  };
}

const tallFront = (slot: boolean) => (f: ReturnType<typeof onFace>): Piece[] => [
  ...(slot ? [f.mark("slot", 0, 38, 136, 2.6, { over: 1 })] : []),
  f.mark("light", 60, 10, 1.6, 1.6, { round: true }),
];

export const MAC_MINI_G4 = polyMini({
  front: tallFront(true),
  vents: 14,
  panelH: 34,
  sockets: [["power", -62, 32], ["dc", -60, 13], ["net", -46, 13], ["phone", -30, 13], ["dvi", 2, 13], ["usbv", 24, 13], ["usbv", 34, 13], ["fw", 45, 13], ["jack", 60, 13]],
});

export const MAC_MINI_INTEL = polyMini({
  front: tallFront(true),
  vents: 10,
  panelH: 34,
  sockets: [["power", -62, 32], ["jack", 52, 32], ["jack", 62, 32], ["dc", -60, 13], ["net", -46, 13], ["fw", -30, 13], ["dvi", -6, 13], ["usbv", 22, 13], ["usbv", 32, 13], ["usbv", 42, 13], ["usbv", 52, 13]],
});

export const MAC_MINI_2009 = polyMini({
  front: tallFront(true),
  vents: 8,
  panelH: 34,
  sockets: [["power", -62, 32], ["jack", 52, 32], ["jack", 64, 32], ["dc", -60, 13], ["net", -48, 13], ["fw", -29, 13], ["dvi", -13, 13], ["mdp", 3, 13], ["usbv", 17, 13], ["usbv", 27, 13], ["usbv", 37, 13], ["usbv", 47, 13], ["usbv", 57, 13]],
});

interface Flat {
  shell: Material;
  slot?: boolean;
  infrared?: boolean;
  sockets: readonly SocketAt[];
  vent: readonly [number, number];
  ventY: number;
  rowY: number;
  lightX: number;
  lightY: number;
}

/** The flat mini: 197 square, 36 tall, one piece of metal on a black disc, its sockets in a dark panel across its back over a vent. */
function flatMini({ shell, slot, infrared, sockets, vent, ventY, lightX, lightY }: Flat): DeskSpec {
  const W = 197;
  const H = 36;
  const F = W / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  return {
    pieces: [
      { is: "turned", mat: "plastic-black", seg: 48, points: [[0, 0], [84, 0], [85, 2], [0, 2]] },
      block(shell, 0, 0, W, W, 2, H, { r: 28, edge: 3 }),
      { is: "wrap", mat: "plastic-char", w: W, d: W, r: 28, half: 92, y0: 4, y1: 33 },
      ...(slot ? [f.mark("slot", 0, 26.7, 138, 2.6, { over: 1 })] : []),
      ...(infrared ? [f.round("dark", 66, 26.7, 5)] : []),
      f.mark("light", lightX, lightY, 1.6, 1.6, { round: true }),
      // a socket past the flat of the back sits back with the corner it lies on
      ...sockets.flatMap(([kind, x, y]) => {
        const past = Math.max(0, Math.abs(x) - (F - 28));
        return socket(onFace("back", -F + 28 - Math.sqrt(28 * 28 - past * past)), kind, x, y);
      }),
      b.mark("slot", vent[0], ventY, vent[1], 6, { r: 3, over: 1 }),
    ],
    prints: [{ id: "lid", at: [0, H + 0.04, 0], turn: [-90, 0, 0], w: 90, h: 18 }],
  };
}

const ROW = 19;

export const MAC_MINI_2010 = flatMini({
  shell: "alu",
  slot: true,
  vent: [0, 76],
  ventY: 7,
  rowY: ROW,
  lightX: 73,
  lightY: 26.7,
  sockets: [["power", -88, 19], ["ac", -70, ROW], ["net", -50, ROW], ["fw", -35, ROW], ["hdmi", -18, ROW], ["mdp", -1, ROW], ["usbv", 12, ROW], ["usbv", 23, ROW], ["usbv", 33, ROW], ["usbv", 44, ROW], ["card", 68, ROW], ["jack", 62, 8], ["jack", 75, 8]],
});

/** Mid 2011 and Late 2012: no drive, an infrared window instead, Thunderbolt where the mini DisplayPort was. */
export const MAC_MINI_2011 = flatMini({
  shell: "alu",
  infrared: true,
  vent: [0, 76],
  ventY: 7,
  rowY: ROW,
  lightX: 73,
  lightY: 26.7,
  sockets: [["power", -88, 19], ["ac", -70, ROW], ["net", -50, ROW], ["fw", -35, ROW], ["hdmi", -18, ROW], ["mdp", -1, ROW], ["usbv", 12, ROW], ["usbv", 23, ROW], ["usbv", 33, ROW], ["usbv", 44, ROW], ["card", 68, ROW], ["jack", 62, 8], ["jack", 75, 8]],
});

export const MAC_MINI_2014 = flatMini({
  shell: "alu",
  infrared: true,
  vent: [0, 76],
  ventY: 7,
  rowY: ROW,
  lightX: 73,
  lightY: 26.7,
  sockets: [["power", -88, 19], ["ac", -70, ROW], ["net", -50, ROW], ["mdp", -34, ROW], ["mdp", -22, ROW], ["hdmi", -6, ROW], ["usbv", 12, ROW], ["usbv", 23, ROW], ["usbv", 33, ROW], ["usbv", 44, ROW], ["card", 68, ROW], ["jack", 62, 8], ["jack", 75, 8]],
});

const fourThunderbolt: readonly SocketAt[] = [["power", -88, 21], ["ac", -71, 21], ["net", -51, 20], ["tb", -33, 21], ["tb", -18, 21], ["tb", -2, 21], ["tb", 13, 21], ["hdmi", 31, 21], ["usb", 51, 21], ["usb", 69, 21], ["jack", 60, 10]];

export const MAC_MINI_2018 = flatMini({ shell: "shell-space-grey", vent: [0, 75], ventY: 9, rowY: 21, lightX: 63, lightY: 6.5, sockets: fourThunderbolt });
export const MAC_MINI_M2_PRO = flatMini({ shell: "alu", vent: [0, 75], ventY: 9, rowY: 21, lightX: 63, lightY: 6.5, sockets: fourThunderbolt });
export const MAC_MINI_M1 = flatMini({
  shell: "alu",
  vent: [0, 75],
  ventY: 9,
  rowY: 21,
  lightX: 63,
  lightY: 6.5,
  sockets: [["power", -88, 21], ["ac", -71, 21], ["net", -51, 20], ["tb", -26, 21], ["tb", -9, 21], ["hdmi", 9, 21], ["usb", 44, 21], ["usb", 66, 21], ["jack", 55, 10]],
});

/** The small mini of 2024 on: 127 square, 50 tall, on a dark perforated foot, measured off Apple's picture of its front and back. */
export const MAC_MINI_2024: DeskSpec = (() => {
  const W = 127;
  const H = 50;
  const FOOT = 6;
  const F = W / 2;
  const f = onFace("front", F);
  const b = onFace("back", -F);
  return {
    pieces: [
      { is: "band", mat: "plastic-char", r0: 50, r1: 57, y0: 0, y1: FOOT, holes: [120, 3, 58] },
      block("rubber", 0, 0, 96, 96, 0, 0.6, { r: 40 }),
      block("alu", 0, 0, W, W, FOOT, H, { r: 16, edge: 3.5 }),
      f.usbc(-37.3, 28),
      f.usbc(-21.8, 28),
      f.mark("light", 24.5, 28, 1.6, 1.6, { round: true }),
      f.jack(36.6, 28, 4.4),
      b.port(-28.6, 28, 26, 14, 6.5),
      b.port(-10, 28, 11.4, 10, 1),
      b.port(9.4, 28, 16, 6, 1),
      b.usbc(23.4, 28),
      b.usbc(32, 28),
      b.usbc(40.8, 28),
    ],
    prints: [{ id: "lid", at: [0, H + 0.04, 0], turn: [-90, 0, 0], w: 60, h: 12 }],
  };
})();

const SW = 197;
const SH = 95;
const SF = SW / 2;

/** The Mac Studio on its round perforated foot. All its models share this front and back; the two ports on the front are USB-C or Thunderbolt by the chip, and look the same. */
export const MAC_STUDIO: DeskSpec = (() => {
  const f = onFace("front", SF);
  const b = onFace("back", -SF);
  const FOOT = 7;
  return {
    pieces: [
      { is: "band", mat: "alu", r0: 74, r1: 85, y0: 0, y1: FOOT, holes: [160, 3, 62] },
      block("rubber", 0, 0, 148, 148, 0, 0.6, { r: 70 }),
      block("alu", 0, 0, SW, SW, FOOT, SH, { r: 20, edge: 4.5 }),
      // measured off Apple's picture: two ports and the card slot on the left, the light on the right
      f.usbc(-65.8, 23),
      f.usbc(-51, 23),
      f.mark("slot", -24, 23, 27, 2.4, { r: 1, over: 1 }),
      f.mark("light", 67, 23, 1.8, 1.8, { round: true }),
      // the back: the field of holes over the row of sockets
      b.mark("perf", 0, 67, 174, 50, { holes: [120, 36, 70] }),
      ...[-67.7, -58.4, -48.6, -39].map((x) => b.usbc(x, 23)),
      b.port(-24, 23, 12.8, 9, 1),
      b.port(0, 23, 22, 15, 6),
      b.usba(20.8, 23, true),
      b.usba(33.8, 23, true),
      b.port(51, 23, 15.5, 4.6, 1),
      b.jack(67.7, 23, 3.8),
      b.round("metal", 82, 23, 9),
    ],
    prints: [{ id: "lid", at: [0, SH + 0.04, 0], turn: [-90, 0, 0], w: 90, h: 18 }],
  };
})();
