import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { test } from "node:test";
import { machineList, machineText } from "../scripts/machines-read.ts";
import { catalogue, catalogueCounts, DEVICES, meshOf, statusOf } from "../src/index.ts";
import { FACETS } from "../src/tags.ts";

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { name: string; version: string; exports: Record<string, unknown> };
const rows = JSON.parse(readFileSync("data/wishlist.json", "utf8")) as { key: string; family: string }[];
const committed = readFileSync("data/machines.json", "utf8");
const AGAIN = "data/machines.json is not the model's list: run `pnpm machines` and commit the file";

test("data/machines.json is what the model gives (a machine added without `pnpm machines` fails here)", () => {
  assert.equal(committed, machineText(machineList(rows, pkg)), AGAIN);
});

test("the script gives the same bytes every time, and the file's", () => {
  const scratch = mkdtempSync(join(tmpdir(), "hako-machines-"));
  try {
    const bytes = [1, 2].map((n) => {
      const out = join(scratch, `${n}.json`);
      const ran = spawnSync(process.execPath, ["scripts/make-machines.ts", "--out", out], { encoding: "utf8" });
      assert.equal(ran.status, 0, ran.stderr);
      return readFileSync(out, "utf8");
    });
    assert.equal(bytes[0], bytes[1]);
    assert.equal(bytes[0], committed, AGAIN);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("it holds every machine of the catalogue once, in its order, with the model's own answers", () => {
  const list = JSON.parse(committed) as ReturnType<typeof machineList>;
  assert.deepEqual(list.machines.map((machine) => machine.key), catalogue().map((entry) => entry.key));
  const counts = catalogueCounts();
  assert.equal(list.machines.length, counts.total);
  assert.equal(list.machines.filter((machine) => machine.status === "built").length, counts.built);
  for (const machine of list.machines) {
    assert.equal(machine.status, statusOf(machine.key), machine.key);
    assert.equal(machine.mesh, meshOf(machine.key), machine.key);
  }
  for (const device of DEVICES) {
    const machine = list.machines.find((one) => one.key === device.key);
    assert.deepEqual(machine?.size, device.size, device.key);
    assert.deepEqual(machine?.ports, device.ports, device.key);
  }
});

test("every machine has the documented fields and nothing else", () => {
  const list = JSON.parse(committed) as ReturnType<typeof machineList>;
  assert.deepEqual(Object.keys(list), ["schema", "package", "version", "licence", "sources", "machines"]);
  assert.equal(list.schema, 1);
  assert.equal(list.package, pkg.name);
  assert.equal(list.version, pkg.version, "the file carries another version than package.json: run `pnpm machines`");
  assert.match(list.licence, /LICENSES\//);
  const facets = new Set<string>(FACETS.map((facet) => facet.id));
  for (const machine of list.machines) {
    assert.deepEqual(Object.keys(machine), ["key", "name", "maker", "family", "status", "mesh", "size", "ports", "tags"], machine.key);
    assert.ok(machine.name && machine.family, machine.key);
    assert.ok(machine.status === "built" || machine.status === "planned", machine.key);
    assert.ok(machine.size === null || (machine.size.length === 3 && machine.size.every((mm: number) => mm > 0)), machine.key);
    for (const facet of Object.keys(machine.tags)) assert.ok(facets.has(facet), `${machine.key}: ${facet}`);
  }
});

test("the file carries no address and no size the package did not already ship", () => {
  assert.ok(!/https?:|dimensions/i.test(committed));
  const list = JSON.parse(committed) as ReturnType<typeof machineList>;
  for (const machine of list.machines) if (machine.status === "planned") assert.equal(machine.size, null, machine.key);
});

test("it is a package export, and the docs say to regenerate it with every new machine", () => {
  assert.equal(pkg.exports["./machines.json"], "./dist/machines.json");
  for (const file of ["docs/machines.md", "docs/building-machines.md", "CONTRIBUTING.md", "README.md"]) assert.match(readFileSync(file, "utf8"), /pnpm machines/, file);
});
