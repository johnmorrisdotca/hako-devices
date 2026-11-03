// A kind is a kind of device. The gallery's kinds list is a partition of the machines by what they are (the `type` tag), so no machine is in two kinds, no kind is a part of another, and a maker or a product line never stands for a kind.
import assert from "node:assert/strict";
import { test } from "node:test";
import { allItems, KINDS, PARTS_KIND } from "../demo/gallery-model.ts";
import { tagsOf } from "../src/tags.ts";

/** The types of machine each kind holds, found from the rows themselves, so the test holds whatever way the kinds are made. */
function typesByKind(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const item of allItems()) {
    if (item.part) continue;
    const type = tagsOf(item.key).type?.[0];
    assert.ok(type, `${item.key} has no type`);
    out.set(item.kind, (out.get(item.kind) ?? new Set()).add(type));
  }
  return out;
}

test("every machine is one row in one kind", () => {
  const seen = new Map<string, string>();
  for (const item of allItems()) {
    assert.equal(seen.get(item.key), undefined, `${item.key} is in ${seen.get(item.key)} and in ${item.kind}`);
    seen.set(item.key, item.kind);
  }
});

test("a type of machine is in one kind only: Raspberry Pis are not in a kind of their own beside the single-board computers", () => {
  const owner = new Map<string, string[]>();
  for (const [kind, types] of typesByKind()) for (const type of types) owner.set(type, [...(owner.get(type) ?? []), kind]);
  const split = [...owner].filter(([, kinds]) => kinds.length > 1).map(([type, kinds]) => `${type}: ${kinds.join(", ")}`);
  assert.deepEqual(split, [], `these types are split over several kinds:\n${split.join("\n")}`);
});

test("no kind is a subset of another", () => {
  const kinds = [...typesByKind()];
  const nested: string[] = [];
  for (const [a, typesA] of kinds) for (const [b, typesB] of kinds) if (a !== b && [...typesA].every((type) => typesB.has(type))) nested.push(`${a} is inside ${b}`);
  assert.deepEqual(nested, []);
});

test("a kind of device holds machines of its own types, and each type is named by one kind", () => {
  const byKind = typesByKind();
  for (const kind of KINDS) if (kind.id !== PARTS_KIND) assert.ok(byKind.get(kind.id)?.size, `${kind.id} holds no machine`);
  assert.deepEqual([...byKind.keys()].filter((id) => !KINDS.some((kind) => kind.id === id)), []);
});
