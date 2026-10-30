// The writer: a finished Box into one small .glb, in Node or a browser, with nothing but three's vertex merge. One mesh per moving part, one primitive per
// material, positions and normals packed into 16 bits (KHR_mesh_quantization). The same Box always gives the same bytes: no clock, no random, a fixed order.
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { type Box, extent, MATERIALS, type Material, type Vec3 } from "./kit.ts";

const MM = 0.001;
const SHORT = 5122;
const USHORT = 5123;
const UINT = 5125;
const ARRAY_BUFFER = 34962;
const ELEMENT_BUFFER = 34963;

interface Accessor {
  bufferView: number;
  componentType: number;
  count: number;
  type: string;
  normalized?: boolean;
  min?: number[];
  max?: number[];
}

export interface Glb {
  bytes: Uint8Array;
  triangles: number;
  /** The bounds in millimetres: x, z (depth), y (height), rounded. */
  size: Vec3;
}

const round6 = (v: number) => Math.round(v * 1e6) / 1e6;

/** Turns a device into .glb bytes: millimetres to metres, centred on the middle of its footprint, standing on y = 0. */
export function toGlb(model: Box): Glb {
  const { bounds, centre } = extent(model);
  const chunks: Uint8Array[] = [];
  let offset = 0;
  const bufferViews: Record<string, number>[] = [];
  const accessors: Accessor[] = [];

  const put = (data: Uint8Array, target: number, byteStride?: number): number => {
    const pad = (4 - (offset % 4)) % 4;
    if (pad) {
      chunks.push(new Uint8Array(pad));
      offset += pad;
    }
    chunks.push(data);
    const view: Record<string, number> = { buffer: 0, byteOffset: offset, byteLength: data.byteLength, target };
    if (byteStride) view.byteStride = byteStride;
    bufferViews.push(view);
    offset += data.byteLength;
    return bufferViews.length - 1;
  };
  const accessor = (a: Accessor): number => {
    accessors.push(a);
    return accessors.length - 1;
  };

  const materialIndex = new Map<Material, number>();
  const materials: Record<string, unknown>[] = [];
  const useMaterial = (name: Material): number => {
    const known = materialIndex.get(name);
    if (known !== undefined) return known;
    const spec: { color: string; metal: number; rough: number; glow?: string; strength?: number; alpha?: number } = MATERIALS[name];
    const lin = new THREE.Color(spec.color);
    const entry: Record<string, unknown> = {
      name,
      pbrMetallicRoughness: {
        baseColorFactor: [round6(lin.r), round6(lin.g), round6(lin.b), spec.alpha ?? 1],
        metallicFactor: spec.metal,
        roughnessFactor: spec.rough,
      },
    };
    if (spec.alpha !== undefined && spec.alpha < 1) entry.alphaMode = "BLEND";
    if (spec.glow) {
      const e = new THREE.Color(spec.glow);
      entry.emissiveFactor = [round6(e.r), round6(e.g), round6(e.b)];
      if (spec.strength !== undefined && spec.strength !== 1) entry.extensions = { KHR_materials_emissive_strength: { emissiveStrength: spec.strength } };
    }
    materials.push(entry);
    materialIndex.set(name, materials.length - 1);
    return materials.length - 1;
  };

  let triangles = 0;
  const meshes: Record<string, unknown>[] = [];
  const nodes: Record<string, unknown>[] = [];
  for (const [nodeName, node] of model.nodes) {
    if (node.parts.size === 0) continue;
    const merged: [Material, THREE.BufferGeometry][] = [];
    const span = new THREE.Box3();
    for (const [matName, list] of node.parts) {
      const g = mergeVertices(mergeGeometries(list), 1e-4);
      g.computeBoundingBox();
      if (g.boundingBox) span.union(g.boundingBox);
      merged.push([matName, g]);
    }
    // the body packs round its own middle; a node about its point, so it can turn about that point
    const body = nodeName === "body";
    const q = body ? span.getCenter(new THREE.Vector3()) : new THREE.Vector3();
    const half = Math.max(Math.abs(span.max.x - q.x), Math.abs(span.min.x - q.x), Math.abs(span.max.y - q.y), Math.abs(span.min.y - q.y), Math.abs(span.max.z - q.z), Math.abs(span.min.z - q.z), 1e-3);
    const primitives: Record<string, unknown>[] = [];
    for (const [matName, g] of merged) {
      const pos = g.getAttribute("position");
      const nor = g.getAttribute("normal");
      const uv = g.getAttribute("uv");
      const count = pos.count;
      const position = new Int16Array(count * 4);
      const normal = new Int16Array(count * 4);
      const min = [32767, 32767, 32767];
      const max = [-32767, -32767, -32767];
      const v = new THREE.Vector3();
      for (let i = 0; i < count; i++) {
        const xyz = [(pos.getX(i) - q.x) / half, (pos.getY(i) - q.y) / half, (pos.getZ(i) - q.z) / half];
        for (let c = 0; c < 3; c++) {
          const packed = Math.round(xyz[c] * 32767);
          position[i * 4 + c] = packed;
          if (packed < min[c]) min[c] = packed;
          if (packed > max[c]) max[c] = packed;
        }
        v.fromBufferAttribute(nor, i).normalize();
        normal[i * 4] = Math.round(v.x * 32767);
        normal[i * 4 + 1] = Math.round(v.y * 32767);
        normal[i * 4 + 2] = Math.round(v.z * 32767);
      }
      const attributes: Record<string, number> = {
        POSITION: accessor({ bufferView: put(new Uint8Array(position.buffer), ARRAY_BUFFER, 8), componentType: SHORT, count, type: "VEC3", normalized: true, min, max }),
        NORMAL: accessor({ bufferView: put(new Uint8Array(normal.buffer), ARRAY_BUFFER, 8), componentType: SHORT, count, type: "VEC3", normalized: true }),
      };
      if (uv) {
        const packed = new Uint16Array(count * 2);
        for (let i = 0; i < count; i++) {
          packed[i * 2] = Math.round(Math.min(1, Math.max(0, uv.getX(i))) * 65535);
          packed[i * 2 + 1] = Math.round(Math.min(1, Math.max(0, uv.getY(i))) * 65535);
        }
        attributes.TEXCOORD_0 = accessor({ bufferView: put(new Uint8Array(packed.buffer), ARRAY_BUFFER, 4), componentType: USHORT, count, type: "VEC2", normalized: true });
      }
      const index = g.index;
      if (!index) throw new Error("a merged geometry has no index");
      const wide = count >= 65536;
      const list = wide ? Uint32Array.from(index.array) : Uint16Array.from(index.array);
      triangles += list.length / 3;
      const indices = accessor({ bufferView: put(new Uint8Array(list.buffer), ELEMENT_BUFFER), componentType: wide ? UINT : USHORT, count: list.length, type: "SCALAR" });
      primitives.push({ attributes, indices, material: useMaterial(matName) });
    }
    meshes.push({ name: nodeName, primitives });
    const at = body ? [0, 0, 0] : node.at;
    nodes.push({
      name: nodeName,
      mesh: meshes.length - 1,
      translation: [0, 1, 2].map((i) => round6((at[i] + q.getComponent(i) - centre.getComponent(i)) * MM)),
      scale: [round6(half * MM), round6(half * MM), round6(half * MM)],
    });
  }

  const json = {
    asset: { version: "2.0", generator: "hako-devices" },
    extensionsUsed: ["KHR_mesh_quantization", "KHR_materials_emissive_strength"],
    extensionsRequired: ["KHR_mesh_quantization"],
    scene: 0,
    scenes: [{ name: "device", nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: offset }],
  };
  const text = new TextEncoder().encode(JSON.stringify(json));
  const jsonPad = (4 - (text.byteLength % 4)) % 4;
  const binPad = (4 - (offset % 4)) % 4;
  const total = 12 + 8 + text.byteLength + jsonPad + 8 + offset + binPad;
  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, text.byteLength + jsonPad, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(text, 20);
  bytes.fill(0x20, 20 + text.byteLength, 20 + text.byteLength + jsonPad);
  let at = 20 + text.byteLength + jsonPad;
  view.setUint32(at, offset + binPad, true);
  view.setUint32(at + 4, 0x004e4942, true);
  at += 8;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.byteLength;
  }
  const size = bounds.getSize(new THREE.Vector3());
  return { bytes, triangles, size: [Math.round(size.x), Math.round(size.z), Math.round(size.y)] };
}
