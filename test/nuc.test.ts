// The NUC line: one table of bodies, one mesh and one drawing for each, and every real model on the list pointing at one.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { COVERED, deviceByKey, DEVICES, meshOf, pcKey } from "../src/index.ts";
import { buildDevice } from "../src/build/index.ts";
import { type FaceId, NUC_BODIES, SOCKET_SIZE, type Socket } from "../src/build/nuc-bodies.ts";

const list = (): { key: string; name: string; brand: string; year: number | null; tags: Record<string, string[]>; notes: string; status: string; formFactorGroup: string }[] => JSON.parse(readFileSync("data/wishlist.json", "utf8"));

test("every body of the table is a device of that size, and every device named for the line has a body", () => {
  for (const [key, body] of Object.entries(NUC_BODIES)) assert.deepEqual(deviceByKey(key)?.size, [...body.size], key);
  for (const { key } of DEVICES) if (key.startsWith("nuc-")) assert.ok(NUC_BODIES[key], key);
});

test("a body's mesh is its published size, near enough on all three sides", () => {
  for (const [key, body] of Object.entries(NUC_BODIES)) {
    if (body.form === "laptop") continue;
    const { size } = buildDevice(key);
    body.size.forEach((side, i) => {
      // a stand, the feet, an antenna or a socket standing proud may add a little
      const allowed = Math.max(8, side * 0.14) + (body.form === "box" && body.sockets && Object.values(body.sockets).flat().some((s) => s[0] === "antenna") && i === 2 ? 36 : 0);
      assert.ok(Math.abs(size[i] - side) <= allowed, `${key} side ${i}: mesh ${size[i]}, published ${side}`);
    });
  }
});

test("sockets sit on their face and do not run into each other", () => {
  const faces = (key: string): [FaceId | "bracket", readonly Socket[]][] => {
    const body = NUC_BODIES[key];
    if (body.form === "box" || body.form === "board") return Object.entries(body.sockets) as [FaceId, readonly Socket[]][];
    return body.form === "blade" ? [["bracket", body.sockets]] : [];
  };
  for (const key of Object.keys(NUC_BODIES)) {
    const [W, D, H] = NUC_BODIES[key].size;
    for (const [face, sockets] of faces(key)) {
      const across = face === "left" || face === "right" ? D : W;
      const up = face === "top" ? D : H;
      const boxes = sockets.map(([kind, x, y, turned]) => {
        const [w, h] = SOCKET_SIZE[kind];
        return { kind, x, y, w: turned ? h : w, h: turned ? w : h };
      });
      for (const s of boxes) {
        assert.ok(Math.abs(s.x) + s.w / 2 <= across / 2 + 0.01, `${key} ${face} ${s.kind} past the side, at ${s.x}`);
        if (face === "top") assert.ok(Math.abs(s.y) + s.h / 2 <= up / 2 + 0.01, `${key} ${face} ${s.kind}, at ${s.y}`);
        else if (s.kind !== "antenna") assert.ok(s.y - s.h / 2 >= -0.01 && s.y + s.h / 2 <= up + 0.01, `${key} ${face} ${s.kind} past the height, at ${s.y}`);
      }
      boxes.forEach((a, i) => {
        for (const b of boxes.slice(i + 1)) {
          const apart = Math.abs(a.x - b.x) >= (a.w + b.w) / 2 || Math.abs(a.y - b.y) >= (a.h + b.h) / 2;
          assert.ok(apart, `${key} ${face}: ${a.kind} at ${a.x},${a.y} runs into ${b.kind} at ${b.x},${b.y}`);
        }
      });
    }
  }
});

test("what a body's catalogue entry counts is what its sockets show", () => {
  const COUNT: Record<string, string> = { "usb-a": "usb-a", "usb-blue": "usb-a", "usb-amber": "usb-a", hdmi: "hdmi", "hdmi-mini": "hdmi-mini", rj45: "ethernet", vga: "vga", audio: "audio", sd: "sd-card" };
  for (const [key, body] of Object.entries(NUC_BODIES)) {
    if (body.form !== "box" && body.form !== "board") continue;
    const seen: Record<string, number> = {};
    for (const [kind] of Object.values(body.sockets).flat() as Socket[]) if (COUNT[kind]) seen[COUNT[kind]] = (seen[COUNT[kind]] ?? 0) + 1;
    for (const [kind, count] of Object.entries(seen)) assert.equal(deviceByKey(key)?.ports.find((port) => port.kind === kind)?.count, count, `${key} ${kind}`);
  }
});

test("every model of the line is on the list and draws a body, with a believable year", () => {
  const line = list().filter((entry) => entry.key.startsWith("intel-nuc") || entry.key.startsWith("asus-nuc") || entry.key.startsWith("asus-rog-nuc"));
  assert.ok(line.length > 350, String(line.length));
  for (const entry of line) if (entry.status === "built") assert.ok(meshOf(entry.key), entry.key);
  const bodies = new Set(COVERED.map((machine) => machine.mesh));
  for (const key of Object.keys(NUC_BODIES)) if (!["nuc-12-tall", "nuc-12-slim"].includes(key)) assert.ok(bodies.has(key), `${key} draws no model`);
});

test("a year is a real year on the whole list, and its decade tag follows it", () => {
  const thisYear = new Date().getFullYear();
  for (const entry of list()) {
    if (entry.year === null) continue;
    assert.ok(entry.year >= 1950 && entry.year <= thisYear + 1, `${entry.key}: ${entry.year}`);
    const decade = entry.tags?.decade;
    if (decade) assert.ok(decade.includes(`${Math.floor(entry.year / 10) * 10}s`), `${entry.key}: ${entry.year} ${decade.join()}`);
  }
});

test("a product code finds its body", () => {
  const cases: [string, string][] = [
    ["NUC5i3RYK", "nuc-rock-canyon-slim"],
    ["NUC7i7DNHE", "nuc-dawson-canyon-tall"],
    ["NUC8i7HVK", "nuc-hades-canyon"],
    ["NUC9i9QNX", "nuc-ghost-canyon"],
    ["NUC10i7FNKN", "nuc-frost-canyon-slim"],
    ["NUC11TNHi30L", "nuc-tiger-canyon-lan"],
    ["NUC11BTMi9", "nuc-beast-canyon"],
    ["NUC12DCMi7", "nuc-beast-canyon"],
    ["NUC13RNGi9", "nuc-raptor-canyon"],
    ["NUC15CRSU7", "nuc-cyber-canyon-plus"],
    ["LAPKC71E", "nuc-king-county"],
  ];
  for (const [code, key] of cases) {
    assert.equal(pcKey(code), key, code);
    assert.ok(deviceByKey(key), key);
  }
});
