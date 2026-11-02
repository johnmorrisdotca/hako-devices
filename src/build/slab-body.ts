// A phone or a tablet described as a row of numbers: what is on its front, its back and its edges, in millimetres, as it is held upright. One function reads every row, so a body is data and not new code.
// The rows are in iphone-bodies.ts and its neighbours; each says where its numbers came from. No marks.
import * as THREE from "three";
import { cyl, disc, type Material, rbox, roundedSquare, slab, type Vec3 } from "./kit.ts";
import type { SlabAdd, SlabOptions } from "./tablets.ts";

/** A round thing: across, down and its radius. On the back, across runs from the left as seen from behind, with the slab upright. */
export type Spot = readonly [x: number, y: number, r: number];

/** A plateau on the back: from the left as seen from behind, from the top, its width and height, its corner radius, how far it rises, and its material when it is not the shell's. */
export type Plateau = readonly [x: number, y: number, w: number, h: number, r: number, rise: number, material?: Material];

/** A band of another material across the back: from the top, its height, its material, how far in from the sides it stops and its corner radius. */
export type BackPanel = readonly [y: number, h: number, material: Material, inset?: number, r?: number];

export type EdgeKind = "button" | "round" | "switch" | "tray" | "lightning" | "usb-c" | "dock-30" | "jack" | "micro-usb" | "grille" | "control";

/**
 * One thing on an edge: its kind, its middle measured along the edge, and its length (a round button's or a jack's, its width across). Down the left and right edges from the top; across the top and bottom
 * edges from the left as seen from the front. A socket's length is left out and comes from its kind.
 */
export type EdgePart = readonly [kind: EdgeKind, at: number, length?: number];

/** A row of small round holes on an edge: where each one's middle is, and their radius. */
export type EdgeHoles = readonly [at: readonly number[], r: number];

export interface SlabBody {
  key: string;
  shell: Material;
  /** The body's corner radius. */
  r: number;
  /** How far the back edge is rounded. */
  edge?: number;
  /** Stands long side down: the top of the slab as it is held is on the left, seen from the front. */
  landscape?: boolean;
  /** The plate in front of the picture, when it is not black glass: the plastic of an iPod's face. */
  face?: Material;
  /** The picture: width, height, from the top of the slab to its top edge, its corner radius, and how far right of the middle it sits when it is not centred. */
  screen: readonly [w: number, h: number, top: number, r: number, across?: number];
  front: {
    /** A round home button: its middle from the top, its radius. */
    home?: readonly [y: number, r: number];
    /** An iPod's wheel: its middle from the top, its radius, the radius of the button in its middle and its material. */
    wheel?: readonly [y: number, r: number, button: number, material?: Material];
    /** The dark cut in the top of the picture: its width, how far down it comes, its corner radius. */
    notch?: readonly [w: number, h: number, r: number];
    /** The dark island in the picture: its width, height and middle from the top. */
    island?: readonly [w: number, h: number, y: number];
    /** The camera: across from the left, down from the top, radius. */
    camera?: Spot;
    /** The slot of the earpiece: its width, height and middle from the top. */
    receiver?: readonly [w: number, h: number, y: number];
  };
  back: {
    plateau?: Plateau;
    /** How far the lenses stand from the back, when they do. */
    rise?: number;
    lenses: readonly Spot[];
    flash?: readonly Spot[];
    /** A flash that is a pill: its middle across and down, its length down, its width. */
    flashPill?: readonly [x: number, y: number, length: number, width: number];
    lidar?: Spot;
    mics?: readonly Spot[];
    panels?: readonly BackPanel[];
  };
  left?: readonly EdgePart[];
  right?: readonly EdgePart[];
  top?: readonly EdgePart[];
  bottom?: readonly EdgePart[];
  topHoles?: EdgeHoles;
  bottomHoles?: EdgeHoles;
}

/** The opening of each kind of socket, from the standard it follows: its length along the edge and its width. */
const SOCKET_SIZE: Readonly<Record<string, readonly [number, number]>> = { lightning: [7.7, 1.6], "usb-c": [8.4, 2.6], "dock-30": [21.3, 2.4], "micro-usb": [7.4, 1.8] };

const upright: Vec3 = [90, 0, 0];

/** The slab's own coordinates for a point given as across and down, seen from the front with the slab upright. */
export const placer = (body: SlabBody, W: number, H: number) => (body.landscape ? (u: number, v: number): [number, number] => [v - H / 2, u] : (u: number, v: number): [number, number] => [u - W / 2, H - v]);

/** Where the picture sits on the slab, and its size as it stands. */
export function picturePlace(body: SlabBody, W: number, H: number) {
  const [sw, sh, top, , off = 0] = body.screen;
  const at = placer(body, W, H)(W / 2 + off, top + sh / 2);
  return { at, size: (body.landscape ? [sh, sw] : [sw, sh]) as [number, number] };
}

/** A flat rounded shape facing the front. */
const roundedFace = (w: number, h: number, r: number, seg = 6) => new THREE.ShapeGeometry(roundedSquare(w, h, Math.min(r, w / 2 - 0.01, h / 2 - 0.01), seg));

function drawFront(add: SlabAdd, body: SlabBody, W: number, H: number) {
  const at = placer(body, W, H);
  const across = (w: number, h: number): [number, number] => (body.landscape ? [h, w] : [w, h]);
  const { home, wheel, notch, island, camera, receiver } = body.front;
  if (wheel) {
    const [x, y] = at(W / 2, wheel[0]);
    add("alu-dark", disc(wheel[1] + 0.35, 48), [x, y, 0.15]);
    add(wheel[3] ?? "plastic-white", disc(wheel[1], 48), [x, y, 0.16]);
    add("alu-dark", disc(wheel[2] + 0.35, 32), [x, y, 0.18]);
    add(wheel[3] ?? "plastic-white", disc(wheel[2], 32), [x, y, 0.2]);
  }
  if (home) {
    const [x, y] = at(W / 2, home[0]);
    add("steel", disc(home[1], 28), [x, y, 0.16]);
    add("black-glass", disc(home[1] - 0.4, 28), [x, y, 0.18]);
  }
  if (notch) {
    const [w, h] = across(notch[0], notch[1] + 2);
    const [x, y] = at(W / 2, body.screen[2] + notch[1] / 2 - 1);
    add("bezel", roundedFace(w, h, notch[2]), [x, y, 0.2]);
  }
  if (island) {
    const [w, h] = across(island[0], island[1]);
    const [x, y] = at(W / 2, island[2]);
    add("hole", roundedFace(w, h, island[1] / 2, 10), [x, y, 0.2]);
  }
  if (receiver) {
    const [w, h] = across(receiver[0], receiver[1]);
    const [x, y] = at(W / 2, receiver[2]);
    add("hole", roundedFace(w, h, receiver[1] / 2), [x, y, 0.22]);
  }
  if (camera) {
    const [x, y] = at(camera[0], camera[1]);
    add("alu-dark", disc(camera[2], 14), [x, y, 0.23]);
    add("black-glass", disc(camera[2] * 0.6, 12), [x, y, 0.24]);
  }
}

/** The lens of a back camera: its ring, its glass and a dark eye in the glass. */
function drawLens(add: SlabAdd, x: number, y: number, z: number, r: number, stand: number, ring: Material) {
  const height = Math.max(0.3, stand);
  add(ring, cyl(r, height, 28), [x, y, z - height / 2 + 0.02], upright);
  add("black-glass", disc(r - Math.min(0.9, r * 0.14), 24), [x, y, z - height - 0.002], [0, 180, 0]);
  add("alu-dark", disc(r * 0.34, 14), [x, y, z - height - 0.012], [0, 180, 0]);
}

function drawBack(add: SlabAdd, body: SlabBody, W: number, H: number, t: number) {
  const at = placer(body, W, H);
  const fromBehind = (x: number, y: number) => at(W - x, y);
  const across = (w: number, h: number): [number, number] => (body.landscape ? [h, w] : [w, h]);
  const { plateau, rise, lenses, flash, flashPill, lidar, mics, panels } = body.back;
  let face = -t;
  for (const [y, h, material, inset, r] of panels ?? []) {
    const [cx, cy] = at(W / 2, y + h / 2);
    const [pw, ph] = across(W - 2 * (inset ?? Math.min(body.edge ?? 0.6, 1.5)), h);
    add(material, roundedFace(pw, ph, r ?? 0.01, r ? 8 : 1), [cx, cy, face - 0.04], [0, 180, 0]);
  }
  if (plateau) {
    const [x, y, w, h, r, up, material = body.shell] = plateau;
    const [cx, cy] = fromBehind(x + w / 2, y + h / 2);
    const [pw, ph] = across(w, h);
    face = -t - up;
    add(material, slab(roundedSquare(pw, ph, Math.min(r, pw / 2 - 0.01, ph / 2 - 0.01), 8), up + 0.05, Math.min(0.5, up / 2), { curve: 8, bevelSeg: 2 }), [cx, cy, -t + 0.05], upright);
  }
  const onPlateau = (x: number, y: number) => !plateau || (x >= plateau[0] && x <= plateau[0] + plateau[2] && y >= plateau[1] && y <= plateau[1] + plateau[3]);
  const surface = (x: number, y: number) => (onPlateau(x, y) ? face : -t);
  const stand = rise === undefined ? 0.45 : rise - (plateau ? plateau[5] : 0);
  for (const [x, y, r] of lenses) {
    const [cx, cy] = fromBehind(x, y);
    drawLens(add, cx, cy, face, r, stand, plateau?.[6] ?? (plateau ? "alu-dark" : "steel"));
  }
  for (const [x, y, r] of flash ?? []) {
    const [cx, cy] = fromBehind(x, y);
    add("pale-glass", disc(r, 16), [cx, cy, surface(x, y) - 0.02], [0, 180, 0]);
  }
  if (flashPill) {
    const [cx, cy] = fromBehind(flashPill[0], flashPill[1]);
    const [pw, ph] = across(flashPill[3], flashPill[2]);
    add("pale-glass", roundedFace(pw, ph, flashPill[3] / 2), [cx, cy, face - 0.02], [0, 180, 0]);
  }
  if (lidar) {
    const [cx, cy] = fromBehind(lidar[0], lidar[1]);
    add("black-glass", disc(lidar[2], 18), [cx, cy, face - 0.02], [0, 180, 0]);
    add("alu-dark", disc(lidar[2] * 0.5, 12), [cx, cy, face - 0.03], [0, 180, 0]);
  }
  for (const [x, y, r] of mics ?? []) {
    const [cx, cy] = fromBehind(x, y);
    add("hole", disc(r, 8), [cx, cy, surface(x, y) - 0.02], [0, 180, 0]);
  }
}

const BUTTON_OUT = 0.45;

function drawEdges(add: SlabAdd, body: SlabBody, W: number, H: number, t: number) {
  const at = placer(body, W, H);
  // which way out of the slab an edge looks, as the slab stands
  const outward = (side: "left" | "right" | "top" | "bottom"): [number, number] => {
    const standingUp: Record<string, [number, number]> = { left: [-1, 0], right: [1, 0], top: [0, 1], bottom: [0, -1] };
    const lying: Record<string, [number, number]> = { left: [0, -1], right: [0, 1], top: [-1, 0], bottom: [1, 0] };
    return (body.landscape ? lying : standingUp)[side];
  };
  const part = (side: "left" | "right" | "top" | "bottom", [kind, along, length]: EdgePart) => {
    const vertical = side === "left" || side === "right";
    const [x, y] = at(vertical ? (side === "left" ? 0 : W) : along, vertical ? along : side === "top" ? 0 : H);
    const [ox, oy] = outward(side);
    // the length runs along the edge, and the edge runs up the slab or across it as the slab stands
    const alongY = ox !== 0;
    const socket = SOCKET_SIZE[kind];
    // a round face looking out of the edge
    const facing: Vec3 = alongY ? [0, ox * 90, 0] : [-oy * 90, 0, 0];
    if (kind === "jack") {
      add("hole", disc((length ?? 3.5) / 2, 14), [x + ox * 0.03, y + oy * 0.03, -t / 2], facing);
      return;
    }
    if (kind === "round") {
      const r = (length ?? 4.8) / 2;
      const axis: Vec3 = alongY ? [0, 0, 90] : [0, 0, 0];
      add(body.shell, cyl(r, BUTTON_OUT * 2, 16), [x, y, -t / 2], axis);
      return;
    }
    if (socket || kind === "grille") {
      const [w, d] = socket ?? [length ?? 8, 1.1];
      add("hole", rbox(alongY ? 0.1 : w, alongY ? w : 0.1, d, 0.04, 1), [x, y, -t / 2]);
      return;
    }
    const size = length ?? 8;
    const flush = kind === "tray" || kind === "control";
    const thick = flush ? 0.08 : BUTTON_OUT * 2;
    const across = flush ? Math.min(t - 1.2, 3.4) : Math.min(t - 1.4, kind === "switch" ? 1.6 : 2.9);
    const dims: Vec3 = alongY ? [thick, size, across] : [size, thick, across];
    add(flush ? (kind === "control" ? "black-glass" : "alu-dark") : body.shell, rbox(dims[0], dims[1], dims[2], Math.min(0.35, thick / 2.2), 1), [x, y, -t / 2]);
  };
  for (const side of ["left", "right", "top", "bottom"] as const) for (const item of body[side] ?? []) part(side, item);
  const holes = (side: "top" | "bottom", row: EdgeHoles | undefined) => {
    if (!row) return;
    const [ox, oy] = outward(side);
    const facing: Vec3 = ox !== 0 ? [0, ox * 90, 0] : [-oy * 90, 0, 0];
    for (const along of row[0]) {
      const [x, y] = at(along, side === "top" ? 0 : H);
      add("hole", disc(row[1], 8), [x + ox * 0.02, y + oy * 0.02, -t / 2], facing);
    }
  };
  holes("top", body.topHoles);
  holes("bottom", body.bottomHoles);
}

/** The slab's options for a row: its size comes from the catalogue, as it stands. */
export function slabOptions(body: SlabBody, standing: readonly [number, number, number], kind: "phone" | "desktop"): SlabOptions {
  const [sw, sh, t] = standing;
  const [W, H] = body.landscape ? [sh, sw] : [sw, sh];
  const { at, size } = picturePlace(body, W, H);
  return {
    w: sw,
    h: sh,
    t,
    r: body.r,
    shell: body.shell,
    edge: body.edge,
    screen: size,
    screenAt: at,
    glassR: body.screen[3],
    front: body.face ?? "front-glass",
    kind,
    ...(kind === "phone" ? { lean: 16 } : {}),
    back: (add, _facts, m, frame) => {
      drawFront(add, body, W, H);
      drawBack(add, body, W, H, t);
      drawEdges(add, body, W, H, t);
      m.printFace("back", [0, sh / 2, -t - 0.05], [0, 180, 0], sw * 0.5, sw * 0.1, frame);
    },
  };
}
