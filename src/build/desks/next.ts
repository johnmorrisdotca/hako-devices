// The NeXT machines, from their published sizes and from where the parts sit in photographs of each. Plain geometry, nothing traced: the cube's badge and the printing on it are left off.
import { block, type DeskSpec, lean, onFace, type Piece } from "../desk.ts";

const S = 305;
const FEET = 5;
const front = onFace("front", S / 2);
const back = onFace("back", -S / 2);

/** Six plates round the cube's waist, standing proud of its core, as in the photographs of its side. */
const cubeFins = (): Piece[] => {
  const out: Piece[] = [block("case-matte", 0, -7, S - 14, 86, FEET + 7, S - 7, { fine: true })];
  for (let i = 0; i < 6; i++) out.push(block("case-matte", 0, -50 + 8 + i * 14 + 1, S, 8, FEET, S, { fine: true }));
  return out;
};

/** The cube: a one-foot magnesium cube, a block in front, six plates round its waist, a block behind, on four small feet. */
export const NEXT_CUBE: DeskSpec = {
  pieces: [
    ...[
      [-S / 2 + 26, -S / 2 + 26],
      [S / 2 - 26, -S / 2 + 26],
      [-S / 2 + 26, S / 2 - 26],
      [S / 2 - 26, S / 2 - 26],
    ].map(([x, z]): Piece => block("rubber", x, z, 16, 16, 0, FEET)),
    block("case-matte", 0, -101.25, S, 102.5, FEET, S),
    ...cubeFins(),
    block("case-matte", 0, 94.25, S, 116.5, FEET, S),
    // the front: the grille with the drive behind it
    front.mark("louvre", 0, 208, 147, 140, { slats: 20 }),
    front.mark("slot", 0, 270, 120, 3.5, { over: 2 }),
    front.mark("slot", 0, 148, 120, 3.5, { over: 2 }),
    // the back, measured off a photograph of it: card slots either side, the vent over the plate with the power inlet, the sockets down the fourth slot
    back.mark("slot", -129, 155, 22, 243),
    back.mark("slot", -94, 155, 22, 243),
    back.mark("louvre", 0, 216, 153, 124, { slats: 18 }),
    back.mark("panel", 0, 92, 156, 109),
    back.port(0, 56, 31, 21.6, 2, { over: 2 }),
    back.mark("panel", 95, 155, 23, 243),
    back.mark("slot", 130, 155, 22, 243),
    back.port(95, 251, 15, 35, 3, { over: 2 }),
    back.jack(95, 227, 11),
    back.jack(95, 210, 11),
    back.port(95, 175, 10, 46, 2, { over: 2 }),
    back.port(95, 130, 13, 28, 3, { over: 2 }),
    back.port(95, 100, 12, 12, 1, { over: 2 }),
    back.jack(95, 88, 11),
    back.port(95, 57, 14, 38, 3, { over: 2 }),
    // four screws at the corners of the back
    back.mark("metal", 0, 155, 5, 5, { round: true, cols: 2, rows: 2, gap: 225, gapY: 250 }),
  ],
  prints: [{ id: "front", at: [0, 70, S / 2 + 0.1], turn: [0, 0, 0], w: 200, h: 40 }],
};

const SW = 398;
const SD = 365;
const SH = 64;
const sFront = onFace("front", SD / 2);
const sBack = onFace("back", -SD / 2);
const sRight = onFace("right", SW / 2);
const sLeft = onFace("left", -SW / 2);

/** The slab: low and square, four grooves round its front and sides, the floppy drive in its right side, the sockets and a heat sink along its back. */
export const NEXT_STATION: DeskSpec = {
  pieces: [
    block("case-matte", 0, 0, SW, SD, 2, SH, { r: 3, edge: 1 }),
    ...[11, 21, 31, 41].flatMap((y): Piece[] => [sFront.mark("dark", 0, y, SW - 4, 1.8), sRight.mark("dark", 0, y, SD - 4, 1.8), sLeft.mark("dark", 0, y, SD - 4, 1.8)]),
    sRight.mark("slot", 72, 30, 95, 3.4, { over: 1 }),
    sRight.mark("key", 128, 30, 8, 5, { over: 1 }),
    // the back, measured off a photograph of it: a panel of three rows of holes over the sockets, the power inlet over the fins of the heat sink
    sBack.mark("panel", -44, 30, 301, 56),
    sBack.round("slot", -44, 46, 2.2, { cols: 48, rows: 3, gap: 3.6, gapY: 3.8, over: 1 }),
    sBack.port(-140, 20, 57, 15, 2, { over: 1 }),
    sBack.jack(-103, 20, 13),
    sBack.jack(-86, 20, 13),
    sBack.port(-54, 20, 40, 15, 3, { over: 1 }),
    sBack.port(-2, 20, 55, 13, 3, { over: 1 }),
    sBack.port(48, 20, 36, 13, 3, { over: 1 }),
    sBack.port(73, 20, 13, 13, 1, { over: 1 }),
    sBack.jack(95, 20, 15),
    sBack.port(143, 48, 32, 22, 2, { over: 1 }),
    sBack.mark("dark", 143, 16, 5, 26, { cols: 6, gap: 10 }),
  ],
  prints: [{ id: "top", at: [0, SH + 0.1, 0], turn: [-90, 0, 0], w: 260, h: 40 }],
};

const DW = 408;
const DD = 354;
const DH = 440;
const BASE = 84;
const tilt = lean(4, BASE, 0);
const dFront = onFace("front", DD / 2 - 26, tilt);
const dBack = onFace("back", -DD / 2 + 28, tilt);

/** The display: a deep square front, a smaller block behind it with plates between, a curved neck on a flat foot with a round bar across it. */
export const NEXT_DISPLAY: DeskSpec = {
  pieces: [
    // the foot and neck, one C seen from the side, and the round bar across the foot's front edge
    { is: "side", mat: "case-matte", w: 220, points: [[122, 0], [-60, 0], [-92, 14], [-100, 40], [-85, 66], [-55, 84], [70, 92], [70, 76], [-45, 64], [-66, 44], [-60, 28], [-40, 19], [122, 7]] },
    { is: "tube", mat: "case-matte", points: [[-165, 9, 124], [0, 9, 124], [165, 9, 124]], r: 9 },
    // the rear block, its plates, the front block with its deep bezel
    { is: "loft", mat: "case-matte", frame: tilt, rings: [{ z: -DD / 2 + 150, w: 340, h: 300, y: BASE + 175, r: 8 }, { z: -DD / 2 + 28, w: 340, h: 300, y: BASE + 175, r: 8 }] },
    ...Array.from({ length: 7 }, (_, i): Piece => ({ is: "loft", mat: "case-matte", frame: tilt, fine: true, rings: [{ z: -30 - i * 12 + 7, w: DW - 8 - i * 2, h: 340 - i * 2, y: BASE + 178, r: 8 }, { z: -30 - i * 12, w: DW - 8 - i * 2, h: 340 - i * 2, y: BASE + 178, r: 8 }] })),
    {
      is: "loft",
      mat: "case-matte",
      frame: tilt,
      rings: [
        { z: DD / 2 - 26, w: DW, h: DH - BASE, y: BASE + (DH - BASE) / 2, r: 14 },
        { z: -22, w: DW - 8, h: DH - BASE - 8, y: BASE + (DH - BASE) / 2, r: 12 },
      ],
    },
    dFront.mark("panel", 0, BASE + 188, 352, 278, { r: 6 }),
    { is: "screen", frame: tilt, at: [0, BASE + 188, DD / 2 - 26 + 0.3], w: 330, h: 248, radius: 8 },
    dFront.mark("dark", -128, BASE + 18, 11, 8),
    // the back: the name plate, and along its foot the sockets for headphones, the two line outs, the screen's cable and the keyboard
    dBack.mark("panel", 0, BASE + 190, 280, 240),
    dBack.jack(-120, BASE + 44, 7),
    dBack.jack(-92, BASE + 44, 10),
    dBack.jack(-72, BASE + 44, 10),
    dBack.port(-16, BASE + 44, 44, 16, 3),
    dBack.port(64, BASE + 44, 40, 14, 3),
  ],
  prints: [{ id: "back", at: [0, BASE + 190, -DD / 2 + 27.5], turn: [0, 180, 0], w: 240, h: 60, frame: tilt }],
};
