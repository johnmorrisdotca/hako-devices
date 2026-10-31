// One description, one mesh and one drawing: the parts are placed by the same frames in both, so they can never disagree. `check` says first whether it fits.
import * as THREE from "three";
import * as drawBoards from "../draw/boards.ts";
import * as drawCases from "../draw/cases.ts";
import { Drawing } from "../draw/drawing.ts";
import * as drawClients from "../draw/clients.ts";
import * as drawHats from "../draw/hats.ts";
import * as drawMachines from "../draw/machines.ts";
import * as drawMacs from "../draw/macs.ts";
import * as drawNas from "../draw/nas.ts";
import * as drawPc from "../draw/pc.ts";
import * as drawTablets from "../draw/tablets.ts";
import { check } from "../catalogue.ts";
import type { Description, FitReport } from "../fit.ts";
import { BOARDS, CASES, HATS, HAT_STACK, PARTS, type BoardId, type DriveId, type CaseId, type HatId, type Part, type ScreenId } from "../parts.ts";
import { DEFAULT_STYLE, STYLES, type StyleName } from "../styles.ts";
import { hdd35, ssd25 } from "./parts-extra.ts";
import * as clients from "./clients.ts";
import { type Glb, toGlb } from "./glb.ts";
import { Box, extent, moved, rbox, turnY, type Vec3 } from "./kit.ts";
import * as laptops from "./laptops.ts";
import { MACHINES, machine } from "./machines.ts";
import * as macs from "./macs.ts";
import * as nas from "./nas.ts";
import * as pc from "./pc.ts";
import * as boards from "./pi/boards.ts";
import type { BoardContext } from "./pi/boards.ts";
import * as cases from "./pi/cases.ts";
import * as hats from "./pi/hats.ts";
import { pi400, pi500 } from "./pi/keyboards.ts";
import { at, T } from "./pi/pieces.ts";
import * as tablets from "./tablets.ts";
import { artMetrics, type ArtMetrics, plantMetrics } from "../scale.ts";
import { W as PICTURE_W, H as PICTURE_H } from "../draw/drawing.ts";
import { FOV_DEG, frameFor } from "../framing.ts";

interface BoardArt {
  mesh: (m: Box, ctx: BoardContext) => void;
  draw: (d: Drawing, ctx: BoardContext) => void;
}

const BOARD_ART: Record<BoardId, BoardArt> = {
  pi4: { mesh: boards.pi4, draw: drawBoards.pi4 },
  pi3b: { mesh: boards.pi3b, draw: drawBoards.pi3b },
  pi5: { mesh: boards.pi5, draw: drawBoards.pi5 },
  "pi1b-plus": { mesh: boards.pi1bPlus, draw: drawBoards.pi1bPlus },
  pi2b: { mesh: boards.pi2b, draw: drawBoards.pi2b },
  "pi3b-plus": { mesh: boards.pi3bPlus, draw: drawBoards.pi3bPlus },
  "pi3a-plus": { mesh: boards.pi3aPlus, draw: drawBoards.pi3aPlus },
  "pi-zero-2w": { mesh: boards.piZero2w, draw: drawBoards.piZero2w },
  "pi-zero-w": { mesh: boards.piZeroW, draw: drawBoards.piZeroW },
  "cm4-io": { mesh: boards.cm4Io, draw: drawBoards.cm4Io },
};

const HAT_ART: Record<HatId, { mesh: (m: Box, ctx: hats.HatContext) => void; draw: (d: Drawing) => void }> = {
  "pitft-28": { mesh: hats.pitft28, draw: drawHats.pitft28 },
  "pitft-35": { mesh: hats.pitft35, draw: drawHats.pitft35 },
  "oled-bonnet": { mesh: hats.oledBonnet, draw: drawHats.oledBonnet },
  "epaper-213": { mesh: hats.epaper213, draw: drawHats.epaper213 },
  "poe-plus": { mesh: hats.poePlus, draw: drawHats.poePlus },
  "proto-hat": { mesh: hats.protoHat, draw: drawHats.protoHat },
};

export interface BaseContext {
  drives?: readonly (DriveId | null)[];
  stand: boolean;
}
interface BaseArt {
  mesh: (m: Box, ctx: BaseContext) => void;
  draw: (d: Drawing, m: Box, ctx: BaseContext) => void;
}

const slabArt = (options: tablets.SlabOptions, draw: (d: Drawing, m: Box) => unknown): BaseArt => ({
  mesh: (m, { stand }) => {
    tablets.standing(m, options, stand);
  },
  draw: (d, m) => {
    draw(d, m);
  },
});
const plain = (mesh: (m: Box) => unknown, draw: (d: Drawing, m: Box) => unknown): BaseArt => ({
  mesh: (m) => {
    mesh(m);
  },
  draw: (d, m) => {
    draw(d, m);
  },
});
const nasArt = (bays: number): BaseArt => ({
  mesh: (m, { drives }) => {
    nas.nas(m, bays, drives);
  },
  draw: (d, _m, { drives }) => {
    drawNas.nas(d, bays, drives);
  },
});

const BASE_ART: Record<string, BaseArt> = {
  "mac-studio": plain(macs.macStudio, drawMacs.macStudio),
  "mac-mini": plain(macs.macMini, drawMacs.macMini),
  macbook: plain(macs.macbook, drawMacs.macbook),
  "mac-mini-m1": plain(laptops.macMiniFlat, drawMacs.macMiniFlat),
  "mac-pro": plain(laptops.macPro, drawMacs.macPro),
  "imac-24": plain(laptops.iMac24, drawMacs.iMac24),
  "macbook-air-13": plain(laptops.macbookAir13, drawMacs.macbookAir13),
  "macbook-pro-14": plain(laptops.macbookPro14, drawMacs.macbookPro14),
  "macbook-pro-16": plain(laptops.macbookPro16, drawMacs.macbookPro16),
  "ipad-mini": slabArt(tablets.ipadMini, drawTablets.ipadMini),
  ipad: slabArt(tablets.ipadPlain, drawTablets.ipadPlain),
  "ipad-air": slabArt(tablets.ipadAir, drawTablets.ipadAir),
  "ipad-pro-11": slabArt(tablets.ipadPro11, drawTablets.ipadPro11),
  "ipad-pro-13": slabArt(tablets.ipadPro13, drawTablets.ipadPro13),
  iphone: { mesh: (m, { stand }) => void tablets.iphone(m, stand), draw: (d, m) => void drawTablets.iphone(d, m) },
  "nas-1bay": nasArt(1),
  "nas-2bay": nasArt(2),
  "nas-4bay": nasArt(4),
  "nas-5bay": nasArt(5),
  "nas-rack": {
    mesh: (m, { drives }) => void nas.nasRack(m, drives),
    draw: (d, _m, { drives }) => void drawNas.nasRack(d, drives),
  },
  nuc: plain(pc.nuc, drawPc.nuc),
  "nuc-12-tall": plain(pc.nuc12Tall, drawPc.nuc12Tall),
  "nuc-12-slim": plain(pc.nuc12Slim, drawPc.nuc12Slim),
  "mini-pc": plain(pc.miniPc, drawPc.miniPc),
  "pc-tower": plain(pc.pcTower, drawPc.pcTower),
  unknown: plain(pc.unknownBox, drawPc.unknownBox),
  pi400: plain(pi400, drawBoards.pi400),
  pi500: plain(pi500, drawBoards.pi500),
  "client-firetv": plain(clients.clientFireTv, drawClients.clientFireTv),
  "client-androidtv": plain(clients.clientAndroidTv, drawClients.clientAndroidTv),
  "client-ipad": slabArt(tablets.ipadPlain, drawTablets.ipadPlain),
  "client-iphone": { mesh: (m, { stand }) => void tablets.iphone(m, stand), draw: (d, m) => void drawTablets.iphone(d, m) },
  "client-android-tablet": slabArt(clients.androidTablet, drawClients.clientAndroidTablet),
  "client-android-phone": { mesh: (m, { stand }) => void clients.clientAndroidPhone(m, stand), draw: (d, m) => void drawClients.clientAndroidPhone(d, m) },
  "client-computer": plain(clients.clientComputer, drawClients.clientComputer),
  "client-browser": plain(clients.clientBrowser, drawClients.clientBrowser),
  ...Object.fromEntries(Object.entries(MACHINES).map(([key, spec]) => [key, plain((m) => machine(m, spec), (d) => drawMachines.machine(d, spec))])),
};

/** The keys a whole-device base can be. */
export const BASE_KEYS = Object.keys(BASE_ART);

/** A description that does not fit: its report says why. */
export class FitError extends Error {
  readonly report: FitReport;
  constructor(report: FitReport) {
    super(report.issues.filter((issue) => issue.level === "error").map((issue) => issue.message).join(" "));
    this.name = "FitError";
    this.report = report;
  }
}

interface Art {
  model: Box;
  paint: (d: Drawing) => void;
}

function assembleBoard(description: Description, report: FitReport): Art {
  const boardId = description.board as BoardId;
  const part = BOARDS[boardId];
  const [W, D] = part.size;
  const caseId = description.case as CaseId | undefined;
  const casePart = caseId ? CASES[caseId] : undefined;
  const hatId = description.hat as HatId | undefined;
  const hatPart = hatId ? HATS[hatId] : undefined;
  const screenId = description.screen as ScreenId | undefined;
  const back = screenId === "touch-7";
  const cooled = description.cooler !== undefined;
  const soldered = description.solderHeader === true;
  const detail: BoardContext["detail"] = back || casePart?.covers ? "edges" : hatPart?.covers ? "under" : "full";
  const ctx: BoardContext = { detail, cooled, soldered };
  const art = BOARD_ART[boardId];
  const model = new Box("device");
  const turn = report.turn;
  const under = report.stack?.under ?? HAT_STACK;
  const place = new THREE.Matrix4();
  if (turn) place.multiply(turnY(turn));
  // the hat's own place on this board's header
  const dx = part.header.bx - 32.5;
  const dz = D / 2 - part.header.bz + 24.5;
  const hatFrame = moved(dx, under, dz);
  const p = at(D);
  const carried = new THREE.Matrix4();
  const hatDrop = under - (T + 2.5);
  model.within(place, () => {
    if (back) {
      hats.touch7(model, (frame) => {
        carried.copy(frame);
        model.within(frame, () => art.mesh(model, ctx));
      });
    } else if (!casePart?.hidesBoard) art.mesh(model, ctx);
    if (caseId === "armor") cases.armor(model, hatPart !== undefined);
    if (caseId === "argon") cases.argon(model);
    if (caseId === "unipi") cases.unipi(model);
    if (caseId === "plate") cases.plate(model, W, D, part.holes);
    if (cooled) boards.activeCooler(model);
    if (hatPart && hatId) {
      // the header carried up to the hat
      model.add("plastic-black", rbox(51, hatDrop, 5.2, 0.4, 1), p(part.header.bx, (under + T + 2.5) / 2, part.header.bz));
      model.within(hatFrame, () => {
        HAT_ART[hatId].mesh(model, { drop: under - T });
        if (screenId === "oled-module") model.within(moved(hats.DISPLAY_HEADER.bx, hats.DISPLAY_HEADER.top, 28 - hats.DISPLAY_HEADER.bz), () => hats.oledModule(model));
      });
    }
  });
  return {
    model,
    paint: (d) => {
      d.within(place, () => {
        if (back) {
          drawHats.touch7(d, model);
        } else if (!casePart?.hidesBoard) art.draw(d, ctx);
        if (caseId === "armor") drawCases.armor(d, hatPart !== undefined);
        if (caseId === "argon") drawCases.argon(d);
        if (caseId === "unipi") drawCases.unipi(d);
        if (caseId === "plate") drawCases.plate(d, W, D, part.holes);
        if (cooled) drawBoards.activeCooler(d);
        if (hatPart && hatId) {
          d.within(hatFrame, () => {
            HAT_ART[hatId].draw(d);
            if (screenId === "oled-module") d.within(moved(hats.DISPLAY_HEADER.bx, hats.DISPLAY_HEADER.top, 28 - hats.DISPLAY_HEADER.bz), () => drawHats.oledModule(d));
          });
        }
      });
    },
  };
}

function assembleBase(description: Description, report: FitReport): Art {
  const key = description.base as string;
  const art = BASE_ART[key];
  const ctx: BaseContext = { drives: description.drives, stand: description.stand !== null };
  const model = new Box("device");
  const place = report.turn ? turnY(report.turn) : new THREE.Matrix4();
  model.within(place, () => art.mesh(model, ctx));
  return {
    model,
    paint: (d) => d.within(place, () => art.draw(d, model, ctx)),
  };
}

/** The finished machine: one mesh and one drawing from one description. */
export interface Built {
  description: Description;
  report: FitReport;
  /** The mesh in millimetres, for adding to or looking at. */
  model: Box;
  /** The mesh's size in millimetres: width, depth, height. */
  size: Vec3;
  /** The .glb file's bytes. */
  glb(): Glb;
  /** The drawing's text, in a style, with its own print. */
  svg(style?: StyleName): string;
  /** How the drawing relates to millimetres: its scale, the device's box on the picture, its baseline. */
  metrics(): ArtMetrics;
  /** The print areas of this device, in the order the first one is the main one. */
  printAreas(): string[];
}

function finish(description: Description, report: FitReport, art: Art): Built {
  const { model, paint } = art;
  const { bounds } = extent(model);
  const size = bounds.getSize(new THREE.Vector3());
  const prints = (): [THREE.Matrix4, number, number, string][] => {
    const print = description.print;
    if (print === undefined) return [];
    const words = typeof print === "string" ? { [model.prints[0]?.id ?? ""]: print } : print;
    return model.prints.flatMap((face): [THREE.Matrix4, number, number, string][] => (typeof words[face.id] === "string" ? [[face.world, face.w, face.h, words[face.id]]] : []));
  };
  const metrics = () => measure(model);
  return {
    description,
    report,
    model,
    size: [Math.round(size.x * 10) / 10, Math.round(size.z * 10) / 10, Math.round(size.y * 10) / 10],
    glb: () => toGlb(model),
    svg: (style = DEFAULT_STYLE) => {
      const d = new Drawing(model, STYLES[style]);
      paint(d);
      for (const [world, w, h, words] of prints()) d.text(world, w, h, words);
      return plantMetrics(d.svg(), metrics());
    },
    metrics,
    printAreas: () => model.prints.map((face) => face.id),
  };
}

/** How a device's drawing relates to its millimetres: the camera's scale on the plane it looks at, and the device's box on the picture. */
export function measure(model: Box): ArtMetrics {
  const { bounds, screen } = extent(model);
  const f = frameFor(bounds.min.toArray(), bounds.max.toArray(), screen ? screen.toArray() : null, PICTURE_W / PICTURE_H);
  const camera = new THREE.PerspectiveCamera(FOV_DEG, PICTURE_W / PICTURE_H, 1, 1e6);
  camera.position.set(...f.position);
  camera.lookAt(new THREE.Vector3(...f.target));
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  const corners: Vec3[] = [];
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) corners.push([x, y, z]);
  const seen = corners.map((c) => {
    const q = new THREE.Vector3(...c).project(camera);
    return [((q.x + 1) / 2) * PICTURE_W, ((1 - q.y) / 2) * PICTURE_H];
  });
  return artMetrics(f.distance, FOV_DEG, PICTURE_H, [Math.min(...seen.map((s) => s[0])), Math.min(...seen.map((s) => s[1])), Math.max(...seen.map((s) => s[0])), Math.max(...seen.map((s) => s[1]))]);
}

/** Puts a machine together: throws a FitError when it does not fit. `build({ board: "pi4", case: "armor", hat: "pitft-28" })`. */
export function build(description: Description): Built {
  const report = check(description);
  if (!report.ok) throw new FitError(report);
  const art = description.board !== undefined ? assembleBoard(description, report) : assembleBase(description, report);
  return finish(description, report, art);
}

/** One part on its own: its mesh and drawing, as the catalogue's assets. */
export function buildPart(id: string): Built {
  const part: Part | undefined = PARTS[id];
  if (!part) throw new Error(`There is no part "${id}".`);
  if (part.kind === "board") return build({ board: id as BoardId });
  const model = new Box("part");
  let paint: (d: Drawing) => void;
  const empty: Description = {};
  const report: FitReport = { ok: true, issues: [], stack: null, turn: 0, size: part.size };
  switch (part.kind) {
    case "case": {
      const covers = id === "armor";
      if (id === "plate") {
        cases.plate(model, 85, 56, BOARDS.pi4.holes);
        paint = (d) => drawCases.plate(d, 85, 56, BOARDS.pi4.holes);
      } else if (covers) {
        cases.armor(model, false);
        paint = (d) => drawCases.armor(d, false);
      } else if (id === "argon") {
        cases.argon(model);
        paint = drawCases.argon;
      } else {
        cases.unipi(model);
        paint = drawCases.unipi;
      }
      break;
    }
    case "hat": {
      const hatId = id as HatId;
      HAT_ART[hatId].mesh(model, { drop: 4 });
      paint = HAT_ART[hatId].draw;
      break;
    }
    case "screen": {
      if (id === "touch-7") {
        hats.touch7(model, () => {});
        paint = (d) => drawHats.touch7(d, model);
      } else {
        hats.oledModule(model);
        paint = drawHats.oledModule;
      }
      break;
    }
    case "cooler": {
      boards.activeCooler(model);
      paint = drawBoards.activeCooler;
      break;
    }
    case "drive": {
      if (id === "hdd-35") {
        hdd35(model);
        paint = drawCases.hdd35;
      } else {
        ssd25(model);
        paint = drawCases.ssd25;
      }
      break;
    }
    case "stand": {
      tablets.deskStand(model, 200, 150, 15, 5);
      paint = (d) => drawCases.deskStand(d, 200, 5);
      break;
    }
  }
  return finish(empty, report, { model, paint });
}


