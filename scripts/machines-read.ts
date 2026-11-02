// Makes the machine list, as the static JSON published at `@johnmorrisdotca/hako-devices/machines.json` and on the demo site, from the typed model: the catalogue, the tags and the table of
// ports. Only what the package already ships goes in: names, makers, families, tags, and the size and ports of a built device. The list's other sizes and its sources stay in data/.
import { catalogue, type Device } from "../src/index.ts";
import { FACETS, tagsOf, yearOf, type FacetId } from "../src/tags.ts";
import { meshOf } from "../src/status.ts";
import { aliasesOf } from "../src/find.ts";
import { coloursOf, type MachineColour } from "../src/colours.ts";

export interface Machine {
  key: string;
  name: string;
  aliases: readonly string[];
  maker: string | null;
  family: string;
  year: number | null;
  status: "built" | "planned";
  mesh: string | null;
  size: readonly [number, number, number] | null;
  ports: readonly { kind: string; count: number }[];
  tags: Partial<Record<FacetId, readonly string[]>>;
  /** Each colour without its pages: like every other fact's, they are not in this file. `coloursOf` has them. */
  colours: readonly (Pick<MachineColour, "name" | "drawing"> & { swatch: { value: string; from: string } | null })[];
}

export interface MachineList {
  schema: 1;
  package: string;
  version: string;
  licence: string;
  sources: string;
  machines: Machine[];
}

/** `rows` is data/wishlist.json, read only for the family of a built device (the catalogue's own `family` is a gallery group, not the maker's product family). */
export function machineList(rows: readonly { key: string; family: string }[], pkg: { name: string; version: string }): MachineList {
  const familyOf = new Map(rows.map((row) => [row.key, row.family]));
  const machines = catalogue().map((entry): Machine => {
    const family = "shelf" in entry ? entry.family : familyOf.get(entry.key);
    if (family === undefined) throw new Error(`${entry.key} is a built device and is not in data/wishlist.json`);
    const tags = tagsOf(entry.key);
    const device: Device | undefined = "parts" in entry ? entry : undefined;
    return {
      key: entry.key,
      name: entry.name,
      aliases: aliasesOf(entry.key),
      maker: tags.maker?.[0] ?? null,
      family,
      year: yearOf(entry.key),
      status: entry.status,
      mesh: meshOf(entry.key),
      size: device?.size ?? null,
      ports: device?.ports.map(({ kind, count }) => ({ kind, count })) ?? [],
      tags: Object.fromEntries(FACETS.filter(({ id }) => tags[id]?.length).map(({ id }) => [id, tags[id]])),
      colours: coloursOf(entry.key).map(({ name, swatch, drawing }) => ({ name, swatch: swatch && { value: swatch.value, from: swatch.from }, drawing })),
    };
  });
  return { schema: 1, package: pkg.name, version: pkg.version, licence: "see LICENSES/ and NOTICE.md", sources: "see NOTICE.md", machines };
}

/** One machine to a line, so a change to the list is a change to its lines. */
export function machineText(list: MachineList): string {
  const { machines, ...head } = list;
  return `${JSON.stringify(head).slice(0, -1)},"machines":[\n${machines.map((machine) => JSON.stringify(machine)).join(",\n")}\n]}\n`;
}
