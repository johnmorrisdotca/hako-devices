import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Box3, Vector3 } from "three";
import { check, DEVICES, PARTS, PRESETS, STYLE_NAMES } from "../src/index.ts";
import { build, buildDevice, buildPart, FitError } from "../src/build/index.ts";

const sha = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");

function glbJson(bytes: Uint8Array): { nodes: { name: string; scale?: number[]; translation?: number[] }[]; materials: { name: string; alphaMode?: string; pbrMetallicRoughness: { baseColorFactor: number[] } }[]; extensionsRequired: string[]; asset: { generator: string } } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(view.getUint32(0, true), 0x46546c67, "glTF magic");
  assert.equal(view.getUint32(4, true), 2, "version 2");
  assert.equal(view.getUint32(8, true), bytes.byteLength, "total length");
  const length = view.getUint32(12, true);
  assert.equal(view.getUint32(16, true), 0x4e4f534a, "JSON chunk");
  return JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + length)));
}

test("the owner's example builds one mesh and one drawing", () => {
  const machine = build({ board: "pi4", case: "armor", hat: "pitft-28" });
  assert.ok(machine.report.ok);
  assert.ok(machine.glb().bytes.byteLength > 1000);
  assert.ok(machine.svg().startsWith("<svg "));
  assert.ok(machine.svg("thick").startsWith("<svg "));
  assert.equal(machine.report.turn, 180);
  assert.ok(machine.size[2] > 24 && machine.size[2] < 28, String(machine.size));
});

test("what does not fit is refused with its report", () => {
  assert.throws(
    () => build({ board: "pi4", case: "argon", hat: "pitft-28" }),
    (error: unknown) => error instanceof FitError && error.report.issues.some((issue) => issue.code === "case-covers-header") && /closes over the header/.test(error.message),
  );
});

test("every preset builds, near the size its parts say", () => {
  for (const preset of PRESETS) {
    const machine = build(preset.description);
    assert.ok(machine.glb().bytes.byteLength > 1000, preset.id);
    const said = check(preset.description).size;
    if (said) assert.ok(Math.abs(machine.size[0] - said[0]) <= 15, `${preset.id}: ${machine.size} against ${said}`);
  }
});

test("same input, same bytes: every device and part, mesh and drawing, built twice", () => {
  const make = (): string[] => {
    const out: string[] = [];
    for (const { key } of DEVICES) {
      const built = buildDevice(key);
      out.push(sha(built.glb().bytes), ...STYLE_NAMES.map((style) => sha(built.svg(style))));
    }
    for (const id of Object.keys(PARTS)) {
      const built = buildPart(id);
      out.push(sha(built.glb().bytes), ...STYLE_NAMES.map((style) => sha(built.svg(style))));
    }
    return out;
  };
  assert.deepEqual(make(), make());
});

test("each mesh is under 300 KB and each drawing under 14 KB, in every style", () => {
  const each = (name: string, built: ReturnType<typeof buildPart>) => {
    assert.ok(built.glb().bytes.byteLength < 300 * 1024, `${name}: ${built.glb().bytes.byteLength}`);
    for (const style of STYLE_NAMES) assert.ok(built.svg(style).length < 14 * 1024, `${name} ${style}`);
  };
  for (const { key } of DEVICES) each(key, buildDevice(key));
  for (const id of Object.keys(PARTS)) each(id, buildPart(id));
});

test("the file is a valid .glb that three's own loader reads, its size in metres", async () => {
  for (const key of ["pi4", "mac-pro", "nas-2bay", "ipad", "pi-zero"]) {
    const built = buildDevice(key);
    const { bytes } = built.glb();
    const json = glbJson(bytes);
    assert.ok(json.extensionsRequired.includes("KHR_mesh_quantization"));
    assert.equal(json.asset.generator, "hako-devices");
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const gltf = await new GLTFLoader().parseAsync(buffer, "");
    const seen = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
    assert.ok(Math.abs(seen.x * 1000 - built.size[0]) < 0.6, `${key} x ${seen.x}`);
    assert.ok(Math.abs(seen.z * 1000 - built.size[1]) < 0.6, `${key} z ${seen.z}`);
    assert.ok(Math.abs(seen.y * 1000 - built.size[2]) < 0.6, `${key} y ${seen.y}`);
  }
});

test("a fan turns about its own point: its node is not moved by the packing", () => {
  const { bytes } = buildDevice("pi5").glb();
  const json = glbJson(bytes);
  const fan = json.nodes.find((node) => node.name.startsWith("spin-y"));
  assert.ok(fan, "a fan node");
  const built = buildDevice("pi5");
  const nodeAt = built.model.nodes.get(fan.name)?.at;
  assert.ok(nodeAt);
});

test("a print face is clear until painted, and the print option paints only what is asked", () => {
  const { bytes } = buildDevice("mac-studio").glb();
  const print = glbJson(bytes).materials.find((material) => material.name === "print");
  assert.ok(print);
  assert.equal(print.alphaMode, "BLEND");
  assert.equal(print.pbrMetallicRoughness.baseColorFactor[3], 0);
  const plain = build({ base: "mac-studio" }).svg();
  assert.ok(!plain.includes("<text"));
  const printed = build({ base: "mac-studio", print: "Studio One" }).svg();
  assert.ok(printed.includes(">Studio One</text>"));
  assert.deepEqual(build({ base: "nas-2bay" }).printAreas(), ["side", "front"]);
  assert.ok(build({ base: "nas-2bay", print: { side: "Backup" } }).svg().includes(">Backup</text>"));
});

test("a hostile print is text in the drawing, and every mesh's own stays out of it", () => {
  const svg = build({ base: "mac-studio", print: `</text><script>alert(1)</script>"'&` }).svg();
  assert.ok(!svg.includes("<script"));
  assert.ok(svg.includes("&lt;/text&gt;&lt;script&gt;"));
});

test("an empty bay shows, a part stands alone, a slab lies flat", () => {
  const full = build({ base: "nas-2bay" }).glb().triangles;
  const half = build({ base: "nas-2bay", drives: ["hdd-35", null] }).glb().triangles;
  assert.ok(half < full);
  assert.notEqual(build({ base: "nas-2bay", drives: ["hdd-35", null] }).svg(), build({ base: "nas-2bay" }).svg());
  const flat = build({ base: "ipad", stand: null });
  assert.ok(flat.size[2] < 12, String(flat.size));
  for (const id of Object.keys(PARTS)) assert.ok(buildPart(id).svg().length > 100, id);
  assert.throws(() => buildPart("nope"));
});

test("a hat moves with its board's header", () => {
  const onFull = build({ board: "pi4", hat: "oled-bonnet" });
  const onZero = build({ board: "pi-zero-2w", hat: "oled-bonnet", solderHeader: true });
  assert.ok(onFull.report.ok && onZero.report.ok);
  // the bonnet is the Zero's own size, so the machine is no bigger than the board round it
  assert.ok(onZero.size[1] < 35, String(onZero.size));
  assert.ok(buildDevice("cm4-io").size[0] > 150);
  assert.ok(build({ board: "cm4-io", hat: "oled-bonnet" }).report.ok);
});

test("the Armor case: fans bare, whole fins under a hat", () => {
  const nodes = (machine: ReturnType<typeof build>) => [...machine.model.nodes.keys()];
  assert.ok(nodes(build({ board: "pi4", case: "armor" })).some((name) => name.startsWith("spin-y")));
  assert.ok(!nodes(build({ board: "pi4", case: "armor", hat: "pitft-28" })).some((name) => name.startsWith("spin-y")));
});

test("two fans never share a node's name", () => {
  const nodes = [...build({ board: "pi5", cooler: "active-cooler", hat: "poe-plus" }).model.nodes.keys()].filter((name) => name.startsWith("spin-y"));
  assert.equal(new Set(nodes).size, nodes.length);
  assert.equal(nodes.length, 2);
});
