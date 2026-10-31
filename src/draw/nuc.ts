// The drawings of the NUC line, from the same table as its meshes (build/nuc-bodies.ts): the body, its lid and what shows on the faces that look towards the viewer.
import type { Box, Material } from "../build/kit.ts";
import { faceFrame } from "../build/nuc-frames.ts";
import { type BladeBody, type BoardBody, type CardBody, type FaceId, type NucBody, type NucBox, SOCKET_SIZE, type Socket } from "../build/nuc-bodies.ts";
import { GOLD, HOLE, METAL } from "./common.ts";
import { type Drawing, type SolidStyle, X, Y, Z } from "./drawing.ts";
import { macbookNotch } from "./macs.ts";

const LINE = "#8fa1b8";
const SOLIDS: Partial<Record<Material, SolidStyle>> = {
  alu: { top: "url(#top)", front: "url(#metal)", side: "#1b2433" },
  "alu-dark": { top: "#1b2433", front: "#1b2433", side: "#141c2a" },
  "plastic-grey": { top: "#1b2433", front: "#1b2433", side: "#141c2a" },
  "plastic-white": { top: "#46536a", front: "#3a475c", side: "#2c3648" },
  "plastic-gloss": { top: "#0a111d", front: "#0c1320", side: "#0b111c" },
  "lid-red": { top: "#7a2028", front: "#5c1a22", side: "#4a151c" },
  "shell-silver": { top: "url(#top)", front: "url(#metal)", side: "#1b2433" },
  "epaper-white": { top: "#46536a", front: "#3a475c", side: "#2c3648" },
};
const solidOf = (m: Material): SolidStyle => SOLIDS[m] ?? { top: "url(#top)", front: "url(#face)", side: "#0b111c" };

const LIGHTS: Partial<Record<Socket[0], string>> = { power: "#f4f7ff", pill: "#f4f7ff", led: "#f4f7ff" };

function socket(d: Drawing, [kind, x, y, up]: Socket) {
  const [sw, sh] = SOCKET_SIZE[kind];
  const w = up ? sh : sw;
  const h = up ? sw : sh;
  const c: [number, number, number] = [x, y, 0.2];
  if (kind === "audio") return void d.circle(c, X, Y, sw / 2, HOLE, 2);
  if (kind === "dc") return void d.circle(c, X, Y, sw / 2, { fill: "#05080e", stroke: LINE, sw: 0.8 }, 2);
  if (kind === "power") {
    d.circle(c, X, Y, sw / 2, { stroke: LINE, sw: 1.2 }, 2);
    return void d.light(c, LIGHTS.power as string, 0.9, 3, Z);
  }
  if (kind === "led") return void d.light(c, LIGHTS.led as string, 0.9, 3, Z);
  if (kind === "pill") {
    d.rect(c, X, Y, w, h, { stroke: LINE, sw: 1 }, 2, 1);
    return void d.light(c, LIGHTS.pill as string, 0.8, 3, Z);
  }
  if (kind === "antenna") return void d.line([c, [x, y + 34, 5]], { stroke: LINE, sw: 2.6 }, 2, Z);
  d.rect(c, X, Y, w, h, HOLE, 2, kind === "usb-a" || kind === "usb-blue" || kind === "usb-amber" ? 0.4 : Math.min(w, h) * 0.2);
  if (kind === "usb-blue") d.rect([x, y - 0.8, 0.3], X, Y, w - 2.4, 1.8, { fill: "#2160d8" }, 3);
  if (kind === "usb-amber") d.rect([x, y - 0.8, 0.3], X, Y, w - 2.4, 1.8, { fill: "#d9a21f" }, 3);
}

const FACES: readonly FaceId[] = ["front", "back", "left", "right", "top"];

function box(d: Drawing, b: NucBox) {
  const [W, D, H] = b.size;
  const { corner: r = 8, chamfer, lid, shell, foot = 2.4, stand, fins } = b;
  const y0 = stand ? stand.h : foot;
  const top = H + (stand ? stand.h : 0);
  const lidH = lid?.h ?? 0;
  const finH = fins?.h ?? 0;
  const solid = (w: number, dz: number, rr: number, ya: number, yb: number, style: SolidStyle) => {
    if (chamfer) {
      const c = chamfer;
      d.prism(
        [
          [w / 2, dz / 2 - c],
          [w / 2 - c, dz / 2],
          [-w / 2 + c, dz / 2],
          [-w / 2, dz / 2 - c],
          [-w / 2, -dz / 2 + c],
          [-w / 2 + c, -dz / 2],
          [w / 2 - c, -dz / 2],
          [w / 2, -dz / 2 + c],
        ],
        ya,
        yb,
        style,
      );
    } else d.rounded(0, 0, w, dz, Math.max(0.5, rr), ya, yb, style, 3);
  };
  if (stand) d.box(-W / 2 - 5, W / 2 + 5, 0, 3, -D * 0.28, D * 0.28, { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: 1.2, layer: -1 });
  solid(W, D, r, y0, top - lidH - finH, { ...solidOf(shell), layer: 0 });
  if (lid) solid(W - (lid.inset ?? 0) * 2, D - (lid.inset ?? 0) * 2, r - (lid.inset ?? 0), top - lidH, top, { ...solidOf(lid.m), layer: 0.5, sw: 1.4 });
  if (fins) {
    const lines: [[number, number, number], [number, number, number]][] = [];
    const inset = fins.inset ?? 8;
    for (let i = 0; i < fins.n; i++) {
      const t = (i + 0.5) / fins.n - 0.5;
      if (fins.along === "z") lines.push([[t * (W - inset), top, -D / 2 + inset], [t * (W - inset), top, D / 2 - inset]]);
      else lines.push([[-W / 2 + inset, top, t * (D - inset)], [W / 2 - inset, top, t * (D - inset)]]);
    }
    if (fins.h > 2) {
      d.box(-W / 2 + inset / 2, W / 2 - inset / 2, top - finH, top, -D / 2 + inset / 2, D / 2 - inset / 2, { top: "#0c1320", front: "#0c1320", side: "#0b111c", sw: 1, layer: 0.5 });
      d.lines(lines, { stroke: LINE, sw: 1, opacity: 0.8 }, 1);
    }
  }
  if (lid?.dots) {
    const lines: [[number, number, number], [number, number, number]][] = [];
    for (let z = -D / 2 + 10; z <= D / 2 - 10; z += 7) lines.push([[-W / 2 + 12, top + 0.1, z], [W / 2 - 12, top + 0.1, z]]);
    d.lines(lines, { stroke: LINE, sw: 1.1, dash: "0 3.4", opacity: 0.5 }, 1);
  }
  for (const face of FACES) {
    d.within(faceFrame(face, W, D, top, y0), () => {
      for (const p of b.plates?.[face] ?? []) d.rect([p.x, p.y, 0.1], X, Y, p.w, p.h, { ...(p.m === "plastic-gloss" ? { fill: "#05080e" } : p.m === "epaper-white" ? { fill: "#46536a" } : { fill: "#141c2a" }), stroke: LINE, sw: 0.7 }, 1.2, Math.min(p.r ?? 1, p.w / 2, p.h / 2));
      for (const v of b.vents?.[face] ?? []) {
        if (v.kind === "slits" || v.kind === "bars") {
          const n = Math.min(v.n ?? 12, 24);
          const segments: [[number, number, number], [number, number, number]][] = [];
          for (let i = 0; i < n; i++) {
            const x = v.x - v.w / 2 + (v.w / n) * (i + 0.5);
            segments.push([[x, v.y - v.h / 2, 0.1], [x, v.y + v.h / 2, 0.1]]);
          }
          d.lines(segments, { stroke: "#05080e", sw: v.kind === "bars" ? 1.8 : 1 }, 1.4, Z);
        } else {
          const rows = Math.min(10, Math.max(2, Math.round(v.h / 6)));
          const segments: [[number, number, number], [number, number, number]][] = [];
          for (let i = 0; i < rows; i++) {
            const y = v.y - v.h / 2 + (v.h / rows) * (i + 0.5);
            segments.push([[v.x - v.w / 2, y, 0.1], [v.x + v.w / 2, y, 0.1]]);
          }
          d.lines(segments, { stroke: LINE, sw: 1.1, dash: "0 3.2", opacity: 0.55 }, 1.4, Z);
        }
      }
      for (const s of b.sockets[face] ?? []) socket(d, s);
    });
  }
}

function card(d: Drawing, { size: [W, D, H] }: CardBody) {
  d.box(-W / 2, W / 2, 0, 1.2, -D / 2, D / 2, { top: "url(#pcb)", front: "#0b111c", side: "#0b111c", sw: 1.4 });
  d.box(-W / 2 + 1.5, W / 2 - 1.5, 1.2, H, -D / 2 + 1.5, D / 2 - 5.5, { ...METAL, layer: 1 });
  const fingers: [[number, number, number], [number, number, number]][] = [];
  for (let x = -W / 2 + 6; x < W / 2 - 6; x += 2.2) fingers.push([[x, 1.3, D / 2 - 4.4], [x, 1.3, D / 2 - 0.3]]);
  d.lines(fingers, GOLD, 2);
}

function blade(d: Drawing, b: BladeBody) {
  const [W, D, H] = b.size;
  d.box(-W / 2 + 3, W / 2 - 3, 12, H, -D / 2 + 3, D / 2 - 2, { top: "url(#top)", front: "url(#face)", side: "#0b111c", sw: 1.8 });
  d.box(-W / 2, W / 2, 6, H, D / 2 - 1.2, D / 2, { ...METAL, layer: 1 });
  d.circle([0, H + 0.1, -D / 8], X, [0, 0, -1], W * 0.34, { fill: "#05080e", stroke: LINE, sw: 1 }, 2);
  d.within(faceFrame("front", W, D, H), () => {
    for (const s of b.sockets) socket(d, s);
  });
}

function board(d: Drawing, b: BoardBody) {
  const [W, D, H] = b.size;
  const deck = H - b.blower - 12;
  d.box(-W / 2, W / 2, deck - 1.6, deck, -D / 2, D / 2, { top: "url(#pcb)", front: "#0b111c", side: "#0b111c", sw: 1.6 });
  for (const [face, list] of Object.entries(b.sockets) as [FaceId, readonly Socket[]][]) {
    const z = face === "front" ? D / 2 : -D / 2;
    for (const s of list) {
      const [w, h] = SOCKET_SIZE[s[0]];
      const x = face === "front" ? s[1] : -s[1];
      if (s[0] !== "led" && s[0] !== "audio" && s[0] !== "power") d.box(x - w / 2 - 0.8, x + w / 2 + 0.8, s[2] - h / 2 - 0.8, s[2] + h / 2 + 0.8, z > 0 ? z - 12 : z, z > 0 ? z : z + 12, { ...METAL, layer: 1, sw: 0.8 });
    }
    d.within(faceFrame(face, W, D, H), () => {
      for (const s of list) socket(d, s);
    });
  }
  if (b.tray) d.box(-W * 0.07, W * 0.23, deck, H, -D * 0.33, -D * 0.07, { top: "#3a475c", front: "#3a475c", side: "#2c3648", sw: 1, layer: 1 });
  if (b.blower > 0) d.cylinder(W * 0.12, D * 0.08, W * 0.2, deck, H, { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: 1.2, layer: 1 }, 14);
  d.box(-W * 0.39, W * 0.23, deck, deck + 5, D * 0.39, D * 0.45, { top: "#141c2a", front: "#111a2a", side: "#0b111c", sw: 1, layer: 1 });
  d.circle([-W * 0.3, deck + 0.1, -D * 0.02], X, [0, 0, -1], 5, { stroke: LINE, sw: 1 }, 1.5);
}

/** Draws any body of the table. */
export function nucBody(d: Drawing, model: Box, b: NucBody) {
  if (b.form === "box") box(d, b);
  else if (b.form === "card") card(d, b);
  else if (b.form === "blade") blade(d, b);
  else if (b.form === "board") board(d, b);
  else macbookNotch(d, model, { w: b.size[0], dz: b.size[1], h: b.size[2], shell: { ...solidOf(b.shell), sw: 1.8 }, keysFill: "#05080e", pad: [130, 80], notch: false });
  return d;
}
