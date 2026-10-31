// The drawings of the machines described as data (build/desk.ts): the same pieces as the mesh, each drawn over the one before it, so a spec lists its pieces from the back to the front.
import { type DeskSpec, eachOfMark, facePoint, faceAxes, type Mark, type MarkKind, type Piece, type Ring } from "../build/desk.ts";
import type { Material, Vec3 } from "../build/kit.ts";
import { HOLE } from "./common.ts";
import { type Drawing, type ShapeStyle, type SolidStyle } from "./drawing.ts";
import { homePicture } from "./pictures.ts";

const LINE = "#8fa1b8";
/** How a material's solid looks in a drawing: its top, its front and its side. Anything not listed is a dark solid. */
const LOOK: Partial<Record<Material, SolidStyle>> = {
  alu: { top: "url(#top)", front: "url(#metal)", side: "#1b2433" },
  "shell-silver": { top: "url(#top)", front: "url(#metal)", side: "#1b2433" },
  steel: { top: "url(#metal)", front: "url(#metal)", side: "#1b2433" },
  "alu-dark": { top: "#232e40", front: "#1b2433", side: "#141c2a" },
  clear: { top: "none", front: "none", side: "none" },
  "shell-space-grey": { top: "#232e40", front: "#1b2433", side: "#141c2a" },
  "plastic-white": { top: "#2c3a50", front: "#243042", side: "#1b2433" },
  "plastic-beige": { top: "#39382f", front: "#2e2d26", side: "#23231d" },
  "plastic-platinum": { top: "#383a38", front: "#2d2f2e", side: "#222424" },
  "plastic-bondi": { top: "#1d4f59", front: "#173f48", side: "#113139" },
  "plastic-blue": { top: "#274a78", front: "#1f3d64", side: "#18304f" },
  "plastic-graphite": { top: "#1b2433", front: "#141c2a", side: "#0f1622" },
};
const lookOf = (mat: Material): SolidStyle => LOOK[mat] ?? { top: "#141c2a", front: "#111a2a", side: "#0b111c" };

const MARK_STYLE: Readonly<Record<Exclude<MarkKind, "light" | "louvre" | "perf">, ShapeStyle>> = {
  screen: { fill: "#0d1a2e", stroke: LINE, sw: 1 },
  lcd: { fill: "#26364c", stroke: LINE, sw: 1 },
  dark: HOLE,
  panel: { fill: "#111a2a", stroke: LINE, sw: 1 },
  slot: { fill: "#05080e" },
  key: { fill: "#232e40", stroke: LINE, sw: 0.7 },
  metal: { fill: "url(#metal)", stroke: LINE, sw: 0.7 },
  shell: { fill: "#1b2433", stroke: LINE, sw: 0.7 },
};


function ringPoints(ring: Ring, corner = 2): Vec3[] {
  const pts: Vec3[] = [];
  const hw = ring.w / 2;
  const hh = ring.h / 2;
  const r = Math.min(ring.r, hw - 0.01, hh - 0.01);
  const rb = Math.min(ring.rb ?? ring.r, hw - 0.01, hh - 0.01);
  for (const [cx, cy, a0, radius] of [
    [hw - r, hh - r, 0, r],
    [-hw + r, hh - r, 90, r],
    [-hw + rb, -hh + rb, 180, rb],
    [hw - rb, -hh + rb, 270, rb],
  ])
    for (let k = 0; k <= corner; k++) {
      const a = ((a0 + (90 * k) / corner) * Math.PI) / 180;
      pts.push([cx + radius * Math.cos(a), ring.y + cy + radius * Math.sin(a), ring.z]);
    }
  return pts;
}

/** The rectangle of a mark on its face, its corners rounded by `r`. */
function markPoints(mark: Mark, x: number, y: number, lift: number): Vec3[] {
  const { w, h } = mark;
  const r = mark.round ? w / 2 : Math.min(mark.r ?? 0, Math.min(w, h) / 2);
  if (r <= 0) return [facePoint(mark.face, mark.at, x - w / 2, y - h / 2, lift), facePoint(mark.face, mark.at, x + w / 2, y - h / 2, lift), facePoint(mark.face, mark.at, x + w / 2, y + h / 2, lift), facePoint(mark.face, mark.at, x - w / 2, y + h / 2, lift)];
  const pts: Vec3[] = [];
  const steps = mark.round ? 3 : 2;
  for (const [cx, cy, a0] of [
    [x + w / 2 - r, y + h / 2 - r, 0],
    [x - w / 2 + r, y + h / 2 - r, 90],
    [x - w / 2 + r, y - h / 2 + r, 180],
    [x + w / 2 - r, y - h / 2 + r, 270],
  ])
    for (let k = 0; k <= steps; k++) {
      const a = ((a0 + (90 * k) / steps) * Math.PI) / 180;
      pts.push(facePoint(mark.face, mark.at, cx + r * Math.cos(a), cy + r * Math.sin(a), lift));
    }
  return pts;
}

function drawMark(d: Drawing, mark: Mark, layer: number) {
  const { n } = faceAxes(mark.face);
  if (mark.kind === "light") {
    d.light(facePoint(mark.face, mark.at, mark.x, mark.y, 0.2), "#f4f7ff", Math.max(1, mark.w / 2), layer + 0.2, n);
    return;
  }
  if (mark.kind === "louvre" || mark.kind === "perf") {
    const { x, y, w, h } = mark;
    d.flat(markPoints({ ...mark, r: 0 }, x, y, 0.1), n, mark.kind === "perf" ? { fill: "#141c2a", stroke: LINE, sw: 0.8 } : { fill: "#0b111c", stroke: LINE, sw: 1 }, layer);
    const lines = mark.kind === "perf" ? Math.min(mark.holes?.[1] ?? 8, 14) : Math.min(mark.slats ?? 8, 24);
    const rows: [Vec3, Vec3][] = [];
    for (let s = 0; s < lines; s++) {
      const yy = y + h / 2 - ((s + 0.5) * h) / lines;
      rows.push([facePoint(mark.face, mark.at, x - w / 2 + 1, yy, 0.2), facePoint(mark.face, mark.at, x + w / 2 - 1, yy, 0.2)]);
    }
    d.lines(rows, mark.kind === "perf" ? { stroke: "#05080e", sw: 1, dash: "0 2.4" } : { stroke: LINE, sw: 0.5 }, layer + 0.1, n);
    return;
  }
  const cols = mark.cols ?? 1;
  const rows = mark.rows ?? 1;
  if (!mark.round && rows === 1 && cols > 10 && mark.h > mark.w * 2) {
    // ribs: one thin line each
    const pitch = mark.w + (mark.gap ?? 0);
    const lines: [Vec3, Vec3][] = [];
    for (let c = 0; c < cols; c++) {
      const x = mark.x + (c - (cols - 1) / 2) * pitch;
      lines.push([facePoint(mark.face, mark.at, x, mark.y - mark.h / 2, 0.1), facePoint(mark.face, mark.at, x, mark.y + mark.h / 2, 0.1)]);
    }
    d.lines(lines, { stroke: "#05080e", sw: 0.7 }, layer, n);
    return;
  }
  if (!mark.round && cols === 1 && rows > 2) {
    // grooves: one thin line each
    const pitchY = mark.h + (mark.gapY ?? mark.gap ?? 0);
    const lines: [Vec3, Vec3][] = [];
    for (let row = 0; row < rows; row++) {
      const y = mark.y + ((rows - 1) / 2 - row) * pitchY;
      lines.push([facePoint(mark.face, mark.at, mark.x - mark.w / 2, y, 0.1), facePoint(mark.face, mark.at, mark.x + mark.w / 2, y, 0.1)]);
    }
    d.lines(lines, { stroke: "#05080e", sw: 0.7 }, layer, n);
    return;
  }
  if (cols * rows > 10 || (mark.round && cols * rows > 3)) {
    // a field of small marks: one dotted line a row, which costs far fewer bytes
    const pitch = mark.w + (mark.gap ?? 0);
    const pitchY = mark.h + (mark.gapY ?? mark.gap ?? 0);
    const a = d.at(facePoint(mark.face, mark.at, mark.x, mark.y, 0.1));
    const b = d.at(facePoint(mark.face, mark.at, mark.x + pitch, mark.y, 0.1));
    const px = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const lines: [Vec3, Vec3][] = [];
    for (let row = 0; row < rows; row++) {
      const y = mark.y + ((rows - 1) / 2 - row) * pitchY;
      const half = ((cols - 1) * pitch) / 2;
      lines.push([facePoint(mark.face, mark.at, mark.x - half, y, 0.1), facePoint(mark.face, mark.at, mark.x + half, y, 0.1)]);
    }
    d.lines(lines, { stroke: "#05080e", sw: Math.max(0.8, px * (mark.w / pitch)), dash: `0 ${Math.round(px * 10) / 10}` }, layer, n);
    return;
  }
  // too thin to carry a line of its own
  const style: ShapeStyle = Math.min(mark.w, mark.h) < 4 ? { fill: MARK_STYLE[mark.kind].fill } : MARK_STYLE[mark.kind];
  eachOfMark(mark, (x, y) => void d.flat(markPoints(mark, x, y, 0.1), n, style, layer));
}

function drawPiece(d: Drawing, piece: Piece, layer: number) {
  if (piece.is === "block") {
    const { x = 0, z = 0, w, d: depth, r = 0, y0, y1, mat } = piece;
    const style = { ...lookOf(mat), layer, ...(piece.fine ? { sw: 0.7 } : {}) };
    if (r > 0) d.rounded(x, z, w, depth, Math.min(r, Math.min(w, depth) / 2 - 0.01), y0, y1, style, 3);
    else d.box(x - w / 2, x + w / 2, y0, y1, z - depth / 2, z + depth / 2, style);
  } else if (piece.is === "loft") {
    const look = lookOf(piece.mat);
    const loops = piece.rings.map((ring) => ringPoints(ring));
    d.hullOf(loops.flat(), { fill: look.side, stroke: LINE, sw: piece.fine ? 0.7 : 1.6 }, layer);
    const first = piece.rings[0];
    const last = piece.rings[piece.rings.length - 1];
    const front = first.z > last.z ? first : last;
    const back = first.z > last.z ? last : first;
    // the top, from the front ring to the back one, then the face looking at the viewer
    const span = (ring: Ring) => [
      [-ring.w / 2 + Math.min(ring.r, ring.w / 2), ring.y + ring.h / 2, ring.z],
      [ring.w / 2 - Math.min(ring.r, ring.w / 2), ring.y + ring.h / 2, ring.z],
    ] as Vec3[];
    const [fa, fb] = span(front);
    const [ba, bb] = span(back);
    const normalUp: Vec3 = [0, front.z - back.z, -(front.y + front.h / 2 - back.y - back.h / 2)];
    d.flat([fa, fb, bb, ba], normalUp, { fill: look.top }, layer + 0.05);
    d.flat(ringPoints(front), [0, 0, 1], { fill: look.front, stroke: LINE, sw: piece.fine ? 0.7 : 1.2 }, layer + 0.1);
  } else if (piece.is === "side") {
    const look = lookOf(piece.mat);
    const x = piece.x ?? 0;
    const half = piece.w / 2;
    const n = piece.points.length;
    const point = (i: number, side: number): Vec3 => [x + side * half, piece.points[i][1], piece.points[i][0]];
    // which way the outline goes round decides which way each strip looks
    let area = 0;
    for (let i = 0; i < n; i++) area += piece.points[i][0] * piece.points[(i + 1) % n][1] - piece.points[(i + 1) % n][0] * piece.points[i][1];
    const turn = area > 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dz = piece.points[j][0] - piece.points[i][0];
      const dy = piece.points[j][1] - piece.points[i][1];
      const normal: Vec3 = [0, -dz * turn, dy * turn];
      const fill = Math.abs(normal[1]) > Math.abs(normal[2]) ? look.top : look.front;
      d.flat([point(i, -1), point(i, 1), point(j, 1), point(j, -1)], normal, { fill, stroke: LINE, sw: 0.8 }, layer);
    }
    const right = piece.points.map((_, i) => point(i, 1));
    d.flat(right, [1, 0, 0], { fill: look.side, stroke: LINE, sw: 1.4 }, layer + 0.05);
    d.flat(piece.points.map((_, i) => point(i, -1)), [-1, 0, 0], { fill: look.side, stroke: LINE, sw: 1.4 }, layer + 0.05);
  } else if (piece.is === "turned") {
    const look = lookOf(piece.mat);
    const x = piece.x ?? 0;
    const z = piece.z ?? 0;
    const ring = (r: number, y: number, seg = 20): Vec3[] => Array.from({ length: seg }, (_, k) => [x + r * Math.cos((k * 2 * Math.PI) / seg), y, z + r * Math.sin((k * 2 * Math.PI) / seg)] as Vec3);
    d.hullOf(piece.points.flatMap(([r, y]) => (r > 0.01 ? ring(r, y) : [[x, y, z] as Vec3])), { fill: look.front, stroke: LINE, sw: 1.6 }, layer);
    for (const y of piece.rims ?? []) {
      const at = piece.points.reduce((best, p) => (Math.abs(p[1] - y) < Math.abs(best[1] - y) ? p : best));
      d.flat(ring(at[0], y).reverse(), [0, 1, 0], { fill: look.top, stroke: LINE, sw: 1 }, layer + 0.05);
    }
  } else if (piece.is === "wrap") {
    // it lies on the back: the drawing looks at the front
  } else if (piece.is === "band") {
    const ring = (r: number, y: number): Vec3[] => Array.from({ length: 16 }, (_, k) => [r * Math.cos((k * Math.PI) / 8), y, r * Math.sin((k * Math.PI) / 8)] as Vec3);
    d.hullOf([...ring(piece.r0, piece.y0), ...ring(piece.r1, piece.y1)], { fill: "#0b111c", stroke: LINE, sw: 1.2 }, layer);
  } else if (piece.is === "tube") {
    const look = lookOf(piece.mat);
    const a = d.at(piece.points[0]);
    const b = d.at([piece.points[0][0] + 1, piece.points[0][1], piece.points[0][2]]);
    const px = Math.max(1.4, 2 * piece.r * Math.hypot(a[0] - b[0], a[1] - b[1]));
    const points = [...piece.points] as Vec3[];
    d.line(points, { stroke: LINE, sw: piece.drawn ?? Math.max(2.6, px + 1) }, layer);
    d.line(points, { stroke: look.front === "url(#metal)" ? "#3a475c" : "#1b2433", sw: piece.drawn ? piece.drawn * 0.5 : Math.max(2.6, px) }, layer + 0.05);
  } else if (piece.is === "screen") {
    const [cx, cy, z] = piece.at;
    const { w, h } = piece;
    homePicture(d, (u, v) => [cx - w / 2 + u * w, cy + h / 2 - v * h, z + 0.05], [0, 0, 1], layer);
  } else drawMark(d, piece, layer);
}

/** One machine's drawing from its pieces. */
export function deskDrawing(d: Drawing, spec: DeskSpec) {
  spec.pieces.forEach((piece, i) => {
    const layer = i * 0.2;
    if (piece.frame) d.within(piece.frame, () => drawPiece(d, piece, layer));
    else drawPiece(d, piece, layer);
  });
  return d;
}

