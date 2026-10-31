// The whole NUC line, from one table of bodies (nuc-bodies.ts): a body, its lid, what is cut into it and the sockets on each face. A body is plain geometry placed by its
// published size; where a socket sits comes from looking at photographs of the real thing. Nothing traced, and no mark on anything.
import * as THREE from "three";
import { type Box, box, cyl, disc, type Material, rbox, ring, roundedSquare, slab } from "./kit.ts";
import { laptopNoNotch } from "./laptops.ts";
import { perforation } from "./macs.ts";
import { faceFrame } from "./nuc-frames.ts";
import { type BoardBody, type BladeBody, type CardBody, type FaceId, type LaptopBody, type NucBody, type NucBox, type Plate, SOCKET_SIZE, type Socket, type Vent } from "./nuc-bodies.ts";


/** A plan with its corners cut straight, for the long flat bodies. */
export function chamfered(w: number, d: number, c: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = w / 2;
  const z = d / 2;
  s.moveTo(x, z - c);
  s.lineTo(x - c, z);
  s.lineTo(-x + c, z);
  s.lineTo(-x, z - c);
  s.lineTo(-x, -z + c);
  s.lineTo(-x + c, -z);
  s.lineTo(x - c, -z);
  s.lineTo(x, -z + c);
  s.closePath();
  return s;
}

function mouth(m: Box, x: number, y: number, w: number, h: number, r: number, material: Material = "hole") {
  m.add(material, rbox(w, h, 1, Math.max(0.05, r), 1), [x, y, -0.3]);
}

/** One socket on the face in force. */
export function socket(m: Box, [kind, x, y, up]: Socket) {
  const [sw, sh] = SOCKET_SIZE[kind];
  const w = up ? sh : sw;
  const h = up ? sw : sh;
  const tongue = (material: Material) => {
    const across = up ? 2 : w - 2;
    const high = up ? h - 2 : 2;
    m.add(material, box(across, high, 0.2), [x + (up ? 0.8 : 0), y - (up ? 0 : 0.8), 0.25]);
  };
  if (kind === "audio") {
    m.add("hole", disc(sw / 2, 14), [x, y, 0.05]);
    m.add("steel", ring(sw / 2, sw / 2 + 0.35, 14), [x, y, 0.06]);
  } else if (kind === "usb-a" || kind === "usb-blue" || kind === "usb-amber") {
    mouth(m, x, y, w, h, 0.4);
    tongue(kind === "usb-blue" ? "usb-blue" : kind === "usb-amber" ? "usb-amber" : "plastic-grey");
  } else if (kind === "usb-c") mouth(m, x, y, w, h, Math.min(w, h) / 2 - 0.05);
  else if (kind === "hdmi" || kind === "hdmi-mini" || kind === "dp" || kind === "dp-mini") mouth(m, x, y, w, h, 0.9);
  else if (kind === "rj45") {
    mouth(m, x, y, w, h, 0.5);
    m.add("led-amber", box(1.4, 1, 0.1), [x - 4.2, y + h / 2 - 1.1, 0.25]);
    m.add("led-power", box(1.4, 1, 0.1), [x + 4.2, y + h / 2 - 1.1, 0.25]);
  } else if (kind === "vga" || kind === "serial") {
    m.add(kind === "vga" ? "plastic-grey" : "plastic-black", rbox(w + 7, h + 1.6, 1, 0.8, 1), [x, y, -0.25]);
    mouth(m, x, y, w, h, 1.2);
  } else if (kind === "sd") mouth(m, x, y, w, h, 0.3);
  else if (kind === "ir") m.add("plastic-gloss", rbox(w, h, 0.4, 0.4, 1), [x, y, 0]);
  else if (kind === "dc") {
    m.add("plastic-black", cyl(sw / 2 + 0.8, 1.2, 18), [x, y, 0.1], [90, 0, 0]);
    m.add("hole", disc(sw / 2 - 1, 16), [x, y, 0.74]);
  } else if (kind === "dc-rect") mouth(m, x, y, w, h, 1);
  else if (kind === "iec") {
    m.add("plastic-black", rbox(w + 4, h + 4, 1, 1, 1), [x, y, -0.2]);
    mouth(m, x, y, w, h, 2);
  } else if (kind === "power") {
    m.add("plastic-gloss", cyl(sw / 2, 0.8, 22), [x, y, 0.1], [90, 0, 0]);
    m.add("led-white", ring(sw / 2 - 1, sw / 2 - 0.5, 22), [x, y, 0.52]);
  } else if (kind === "pill") {
    m.add("plastic-char", rbox(w, h, 0.8, 1.2, 1), [x, y, 0]);
    m.add("led-white", disc(1.1, 12), [x, y, 0.42]);
  } else if (kind === "led") m.add("led-white", disc(sw / 2, 10), [x, y, 0.06]);
  else if (kind === "lock") mouth(m, x, y, w, h, 0.6);
  else if (kind === "antenna") {
    m.add("gold", cyl(3.2, 5, 12), [x, y, 2.4], [90, 0, 0]);
    m.add("plastic-black", cyl(3.6, 34, 12, 2.6), [x, y + 17, 5]);
  } else mouth(m, x, y, w, h, 0.5);
}

function plate(m: Box, { x, y, w, h, r = 1, m: material, raised = 0.3 }: Plate) {
  m.add(material, rbox(w, h, 0.5 + raised, Math.min(r, w / 2 - 0.01, h / 2 - 0.01), 2), [x, y, raised / 2 - 0.25]);
}

function vent(m: Box, v: Vent, id: string) {
  const { x, y, w, h, kind, n = 12, m: material = "plastic-char" } = v;
  if (kind === "slits" || kind === "bars") {
    const pitch = w / n;
    const wide = kind === "bars" ? pitch * 0.7 : Math.min(pitch * 0.5, 1.8);
    for (let i = 0; i < n; i++) m.add("hole", box(wide, h, 0.4), [x - w / 2 + pitch * (i + 0.5), y, 0.02]);
    return;
  }
  // the viewer paints a field of holes on these: `across` by `down` by the size of the field
  const down = Math.max(2, Math.round((n * h) / w));
  perforation(m, id, [x, y, 0.06], [0, 0, 0], w, h, n, down, kind === "hex" ? 74 : 58, material);
}

function feetOf(m: Box, W: number, D: number, h: number) {
  const r = Math.min(7, W * 0.07);
  for (const [x, z] of [
    [-W / 2 + 13, -D / 2 + 13],
    [W / 2 - 13, -D / 2 + 13],
    [-W / 2 + 13, D / 2 - 13],
    [W / 2 - 13, D / 2 - 13],
  ])
    m.add("rubber", cyl(r, h, 14), [x, h / 2, z]);
}

const faces: readonly FaceId[] = ["front", "back", "left", "right", "top"];

function nucBox(m: Box, b: NucBox) {
  const [W, D, H] = b.size;
  const { corner: r = 8, chamfer, lid, shell, foot = 2.4, band, stand } = b;
  const edge = b.edge ?? Math.min(2, r * 0.3, (H - foot) / 6);
  const plan = (w: number, d: number, rr: number) => (chamfer ? chamfered(w, d, chamfer) : roundedSquare(w, d, Math.max(0.5, rr), 6));
  const lidH = lid?.h ?? 0;
  const y0 = stand ? stand.h : foot;
  const finsH = b.fins?.h ?? 0;
  const top = H + (stand ? stand.h : 0);
  m.add(shell, slab(plan(W, D, r), top - y0 - lidH - finsH + (lid ? 0.6 : 0), edge, { curve: 6, bevelSeg: 2 }), [0, y0, 0]);
  if (stand) {
    m.add("plastic-black", rbox(W + 10, 3, D * 0.56, 1.2, 1), [0, 1.5, 0]);
    m.add("plastic-black", slab(roundedSquare(W + 8, D * 0.4, 3, 3), stand.h - 2, 0.6, { curve: 3, bevelSeg: 1 }), [0, 2, 0]);
  } else if (foot > 0) feetOf(m, W, D, foot + 0.4);
  if (lid) {
    const inset = lid.inset ?? 0;
    m.add(lid.m, slab(plan(W - inset * 2, D - inset * 2, r - inset), lidH, Math.min(lid.edge ?? 1.2, lidH / 3), { curve: 6, bevelSeg: 2 }), [0, top - lidH, 0]);
    if (lid.dots) perforation(m, "lid", [0, top + 0.05, 0], [-90, 0, 0], W - inset * 2 - 16, D - inset * 2 - 16, lid.dots, Math.round((lid.dots * (D - inset * 2 - 16)) / (W - inset * 2 - 16)), 50, lid.m);
  }
  if (b.fins) {
    const { n, h, along = "x", inset = 8 } = b.fins;
    const y = top - h / 2;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n - 0.5;
      if (along === "x") m.add(shell, box(W - inset * 2, h, Math.min(1.6, (D / n) * 0.45)), [0, y, t * (D - inset)]);
      else m.add(shell, box(Math.min(1.6, (W / n) * 0.45), h, D - inset * 2), [t * (W - inset), y, 0]);
    }
  }
  if (band) m.add(band.m, slab(plan(W + 0.2, D + 0.2, r), band.h, 0, { curve: 6, bevelSeg: 1 }), [0, y0 + band.y, 0]);
  m.printFace(H > W ? "side" : "lid", H > W ? [W / 2 + 0.08, y0 + (H * 2) / 3, 0] : [0, top + 0.1, 0], H > W ? [0, 90, 0] : [-90, 0, 0], Math.min(W, D) * 0.6, 14);
  for (const face of faces) {
    const frame = faceFrame(face, W, D, top, y0);
    m.within(frame, () => {
      for (const p of b.plates?.[face] ?? []) plate(m, p);
      (b.vents?.[face] ?? []).forEach((v, i) => vent(m, v, `${face}-${i}`));
      for (const s of b.sockets[face] ?? []) socket(m, s);
    });
  }
}

/** A compute element: a thin metal plate on a board, its gold edge along one long side. */
function nucCard(m: Box, b: CardBody) {
  const [W, D, H] = b.size;
  m.add("pcb-green", box(W, 1.2, D), [0, 0.6, 0]);
  m.add("alu", rbox(W - 3, H - 1.2, D - 7, 0.6, 1), [0, (H + 1.2) / 2, -2]);
  m.add("gold", box(W - 8, 0.3, 4.4), [0, 1.25, D / 2 - 2.2]);
  m.add("gold", box(W - 8, 0.3, 4.4), [0, -0.05, D / 2 - 2.2]);
  for (const [x, z] of [
    [-W / 2 + 3, -D / 2 + 3],
    [W / 2 - 3, -D / 2 + 3],
  ])
    m.add("hole", cyl(1.4, 0.2, 10), [x, 1.3, z]);
  m.printFace("lid", [0, H + 0.08, -2], [-90, 0, 0], W * 0.6, 14);
}

/** A compute element on a card: the fan and its shroud on a board, a bracket of sockets at one end, gold fingers along the bottom. */
function nucBlade(m: Box, b: BladeBody) {
  const [W, D, H] = b.size;
  const Z = D / 2;
  m.add(b.shroud ?? "plastic-black", slab(roundedSquare(W - 6, D - 3, 4, 3), H - 12, 1.4, { curve: 3, bevelSeg: 1 }), [0, 12, -1.5]);
  m.add("pcb-green", box(W - 3, 1.6, D - 3), [0, 11.2, -1.5]);
  m.add("gold", box(W * 0.5, 7, 1.2), [0, 7, -D / 4]);
  m.add("hole", cyl(W * 0.34, 0.4, 28), [0, H + 0.05, -D / 8]);
  m.add("plastic-grey", cyl(W * 0.09, 0.8, 16), [0, H + 0.3, -D / 8]);
  m.add("steel", box(W, H - 6, 1.2), [0, (H + 6) / 2, Z - 0.6]);
  perforation(m, "side", [W / 2 - 3 + 0.06, (H + 12) / 2, -D / 4], [0, 90, 0], D * 0.4, H - 22, 18, 8, 60, b.shroud ?? "plastic-black");
  m.within(faceFrame("front", W, D, H), () => {
    for (const s of b.sockets) socket(m, s);
  });
}

/** A bare board: a green square, its sockets standing on the back edge in metal, its memory and drive slots and a small fan on top. */
function nucBoard(m: Box, b: BoardBody) {
  const [W, D, H] = b.size;
  const T = 1.6;
  m.add(b.pcb ?? "pcb-green", box(W, T, D), [0, H - b.blower - T / 2 - 12, 0]);
  const deck = H - b.blower - 12;
  const blockFor = (s: Socket) => {
    const [w, h] = SOCKET_SIZE[s[0]];
    return { w: w + 1.6, h: h + 1.6 };
  };
  for (const [face, list] of Object.entries(b.sockets) as [FaceId, readonly Socket[]][]) {
    m.within(faceFrame(face, W, D, H), () => {
      for (const s of list) {
        const { w, h } = blockFor(s);
        if (s[0] !== "led" && s[0] !== "audio" && s[0] !== "power") m.add("steel", box(w, h, 12), [s[1], s[2], -6]);
        else m.add("plastic-black", box(w + 2, h + 2, 8), [s[1], s[2], -4]);
        socket(m, s);
      }
    });
  }
  if (b.tray) {
    m.add("steel", box(W, 1, D), [0, 0.5, 0]);
    m.add("gold", box(W * 0.3, H - deck, D * 0.26), [W * 0.08, (H + deck) / 2, -D * 0.2]);
  }
  // its memory hangs under the board
  m.add("plastic-black", box(W * 0.62, deck - T, D * 0.5), [-W * 0.08, (deck - T) / 2, -D * 0.1]);
  // the air's way: a low heatsink and a blower
  if (b.blower > 0) {
    m.add("plastic-black", cyl(W * 0.2, H - deck, 22), [W * 0.12, (H + deck) / 2, D * 0.08]);
    m.add("plastic-grey", cyl(W * 0.07, 0.6, 14), [W * 0.12, H + 0.1, D * 0.08]);
    m.add("alu", box(W * 0.3, b.blower + 4, D * 0.14), [W * 0.1, deck + (b.blower + 4) / 2, -D * 0.19]);
  }
  m.add("plastic-black", box(W * 0.62, 5, 6), [-W * 0.08, deck + 2.5, D * 0.42]);
  m.add("hole", box(W * 0.56, 0.4, 2.2), [-W * 0.08, deck + 5, D * 0.42]);
  m.add("plastic-black", box(5, 2.6, 22), [-W * 0.4, deck + 1.3, D * 0.14]);
  m.add("steel", cyl(5, 2.4, 18), [-W * 0.3, deck + 1.2, -D * 0.02]);
  for (const [x, z] of [
    [-W / 2 + 4, D / 2 - 4],
    [W / 2 - 4, D / 2 - 4],
    [-W / 2 + 4, -D / 2 + 4],
    [W / 2 - 4, -D / 2 + 4],
  ])
    m.add("gold", ring(1.8, 2.6, 12), [x, deck + 0.05, z], [-90, 0, 0]);
}

/** A laptop kit: no maker's lid, a plain deck, keys and a 15.6-inch picture. */
function nucLaptop(m: Box, b: LaptopBody) {
  const [w, d, h] = b.size;
  laptopNoNotch(m, { w, d, h, shell: b.shell, screen: b.screen, u: b.u });
}

/** Draws any body of the table. */
export function nucBody(m: Box, b: NucBody) {
  if (b.form === "box") nucBox(m, b);
  else if (b.form === "card") nucCard(m, b);
  else if (b.form === "blade") nucBlade(m, b);
  else if (b.form === "board") nucBoard(m, b);
  else nucLaptop(m, b);
  return m;
}
