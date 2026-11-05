// One key builder. A layout is data: rows of unit widths, a gap, and an optional smile, in the spirit of a keyboard-layout file. The cap shape is built once per profile and scaled onto each key. No letters.
import * as THREE from "three";
import { type Box, box, type Material } from "./kit.ts";

export type CapProfile = "flat" | "domed" | "dished" | "sculpted";
export type CapStuff = "rubber" | "plastic" | "metal";

export interface KeyFret {
  y: number;
  w: number;
  h: number;
}

export interface KeyRow {
  y: number;
  h: number;
  gap: number;
  /** Widths in units of `u`. */
  keys: number[];
  smile?: number;
  profile?: CapProfile;
  stuff?: CapStuff;
}

export interface KeyLayout {
  /** Millimetres in one unit of width. */
  u: number;
  rows: KeyRow[];
  frets?: KeyFret[];
}

export interface PlacedKey {
  x: number;
  y: number;
  w: number;
  h: number;
  profile: CapProfile;
  stuff: CapStuff;
}

const PROFILES: readonly CapProfile[] = ["flat", "domed", "dished", "sculpted"];
const STUFF: Readonly<Record<CapStuff, Material>> = { rubber: "rubber", plastic: "plastic-grey", metal: "alu" };

const caps = new Map<CapProfile, THREE.BufferGeometry>();

function heightAt(profile: CapProfile, x: number, y: number): number {
  const r = Math.min(1, Math.hypot(x / 0.5, y / 0.5));
  const rim = r > 0.78 ? 0.08 * ((r - 0.78) / 0.22) : 0;
  if (profile === "flat") return 0.16 - rim;
  if (profile === "domed") return 0.1 + 0.18 * Math.max(0, 1 - r * r) - rim;
  if (profile === "dished") return 0.26 - 0.12 * Math.max(0, 1 - r * r) - rim;
  return 0.08 + 0.2 * (y + 0.5) + 0.05 * Math.max(0, 1 - r * r) - rim;
}

/** A unit cap, one millimetre across, facing up the Z axis. Built once. */
function unitCap(profile: CapProfile): THREE.BufferGeometry {
  const kept = caps.get(profile);
  if (kept) return kept;
  const cols = 6;
  const rows = 4;
  const pos: number[] = [];
  const idx: number[] = [];
  const id = (i: number, j: number, front: boolean) => (front ? 0 : (cols + 1) * (rows + 1)) + j * (cols + 1) + i;
  for (const front of [true, false]) {
    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= cols; i++) {
        const x = -0.5 + i / cols;
        const y = -0.5 + j / rows;
        pos.push(x, y, front ? heightAt(profile, x, y) : -0.12);
      }
    }
  }
  const quad = (a: number, b: number, c: number, d: number) => idx.push(a, b, c, a, c, d);
  for (const front of [true, false]) {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = id(i, j, front);
        const b = id(i + 1, j, front);
        const c = id(i + 1, j + 1, front);
        const d = id(i, j + 1, front);
        if (front) quad(a, b, c, d);
        else quad(a, d, c, b);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  caps.set(profile, g);
  return g;
}

function isProfile(value: unknown): value is CapProfile {
  return typeof value === "string" && PROFILES.includes(value as CapProfile);
}

function isStuff(value: unknown): value is CapStuff {
  return value === "rubber" || value === "plastic" || value === "metal";
}

/** Reads a layout object. A bad field is refused, so a file cannot quietly drop a row. */
export function parseLayout(raw: unknown): KeyLayout {
  if (!raw || typeof raw !== "object") throw new Error("a layout is an object");
  const body = raw as { u?: unknown; rows?: unknown; frets?: unknown };
  if (typeof body.u !== "number" || body.u <= 0) throw new Error("a layout needs a unit size");
  if (!Array.isArray(body.rows) || body.rows.length === 0) throw new Error("a layout needs rows");
  const rows: KeyRow[] = body.rows.map((row, index) => {
    if (!row || typeof row !== "object") throw new Error(`row ${index} is not an object`);
    const item = row as Partial<KeyRow>;
    if (typeof item.y !== "number" || typeof item.h !== "number" || item.h <= 0) throw new Error(`row ${index} needs a height`);
    if (typeof item.gap !== "number" || item.gap < 0) throw new Error(`row ${index} needs a gap`);
    if (!Array.isArray(item.keys) || item.keys.length === 0 || item.keys.some((key) => typeof key !== "number" || key <= 0)) throw new Error(`row ${index} needs widths`);
    if (item.profile !== undefined && !isProfile(item.profile)) throw new Error(`row ${index} has a bad profile`);
    if (item.stuff !== undefined && !isStuff(item.stuff)) throw new Error(`row ${index} has a bad material`);
    return { y: item.y, h: item.h, gap: item.gap, keys: item.keys, smile: item.smile, profile: item.profile, stuff: item.stuff };
  });
  return { u: body.u, rows, frets: Array.isArray(body.frets) ? (body.frets as KeyFret[]) : undefined };
}

/** Every key's place, centred, with the smile already in the y. */
export function keyPlacements(layout: KeyLayout): PlacedKey[] {
  const placed: PlacedKey[] = [];
  for (const row of layout.rows) {
    const widths = row.keys.map((key) => key * layout.u);
    const span = widths.reduce((sum, width) => sum + width, 0) + row.gap * (widths.length - 1);
    let x = -span / 2;
    for (const width of widths) {
      const center = x + width / 2;
      const along = span > 0 ? center / (span / 2) : 0;
      const smile = (row.smile ?? 0) * (1 - Math.min(1, along * along));
      placed.push({ x: center, y: row.y - smile, w: width, h: row.h, profile: row.profile ?? "domed", stuff: row.stuff ?? "plastic" });
      x += width + row.gap;
    }
  }
  return placed;
}

/** Why a layout will not sit on a body this wide. Empty means it fits and nothing overlaps. */
export function layoutProblems(layout: KeyLayout, bodyWidth: number): string[] {
  const problems: string[] = [];
  const placed = keyPlacements(layout);
  if (placed.length === 0) problems.push("no keys");
  for (const key of placed) {
    if (Math.abs(key.x) + key.w / 2 > bodyWidth / 2 + 0.2) problems.push(`a key at ${key.x.toFixed(1)} hangs off the body`);
  }
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i];
      const b = placed[j];
      if (!a || !b) continue;
      const clear = Math.abs(a.x - b.x) > (a.w + b.w) / 2 - 0.05 || Math.abs(a.y - b.y) > (a.h + b.h) / 2 - 0.05;
      if (!clear) problems.push(`keys at ${a.y.toFixed(1)} and ${b.y.toFixed(1)} overlap`);
    }
  }
  return problems;
}

/** Puts the layout on a body. One cap mesh per profile, scaled onto each key. */
export function placeKeys(target: Box, layout: KeyLayout, z: number): void {
  for (const key of keyPlacements(layout)) {
    target.add(STUFF[key.stuff], unitCap(key.profile), [key.x, key.y, z], [0, 0, 0], { scale: [key.w, key.h, 1.6] });
  }
  for (const fret of layout.frets ?? []) target.add("alu", box(fret.w, fret.h, 0.3), [0, fret.y, z + 0.15]);
}
