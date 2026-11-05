import assert from "node:assert/strict";
import { test } from "node:test";
import * as THREE from "three";
import { toGlb } from "../src/build/glb.ts";
import { Box, box, lathe, plate } from "../src/build/kit.ts";

const sizeOf = (g: THREE.BufferGeometry) => {
  g.computeBoundingBox();
  return g.boundingBox?.getSize(new THREE.Vector3()) ?? new THREE.Vector3();
};

test("a lathe revolves a profile round the upright axis", () => {
  const g = lathe([[2, 0], [5, 2], [2, 4]], 12);
  const size = sizeOf(g);
  assert.ok(size.x > 9 && size.x < 11, `across ${size.x}`);
  assert.ok(size.y > 3.5 && size.y < 4.5, `tall ${size.y}`);
  assert.ok(g.getAttribute("normal"), "normals");
});

test("a plate is chamfered, and a rise domes the front", () => {
  const flat = plate(20, 12, 2, 0.5);
  const domed = plate(20, 12, 2, 0.5, 0.8);
  const flatSize = sizeOf(flat);
  const domedSize = sizeOf(domed);
  assert.ok(flatSize.z > 1.5 && flatSize.z < 3, `thick ${flatSize.z}`);
  assert.ok(domedSize.z > flatSize.z + 0.3, `dome ${domedSize.z} over ${flatSize.z}`);
});

test("brushed metal is marked for the viewer to brush, and the glb holds no picture", () => {
  const brushed = new Box("brushed");
  brushed.add("brushed-silver", box(4, 2, 1));
  const plain = new Box("plain");
  plain.add("matte-plastic", box(4, 2, 1));
  const read = (built: ReturnType<typeof toGlb>) => {
    const view = new DataView(built.bytes.buffer, built.bytes.byteOffset, built.bytes.byteLength);
    return new TextDecoder().decode(built.bytes.subarray(20, 20 + view.getUint32(12, true)));
  };
  const brushedJson = read(toGlb(brushed));
  const plainJson = read(toGlb(plain));
  assert.ok(brushedJson.includes('"extras":{"brush":"line"}'), brushedJson.slice(0, 200));
  assert.ok(!plainJson.includes("brush"));
  for (const json of [brushedJson, plainJson]) {
    const parsed = JSON.parse(json);
    assert.equal(parsed.images, undefined);
    assert.equal(parsed.textures, undefined);
    assert.equal(parsed.samplers, undefined);
    assert.ok(!json.includes("normalTexture") && !json.includes("image/png"));
  }
});
