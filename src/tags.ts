// Every machine's tags, and the filters they make: `@johnmorrisdotca/hako-devices/tags`. Within one facet a machine needs any of the values picked; across facets, all of them. The table is its own
// entry point because it is large, and a page that only draws a device never loads it.
import { deviceByKey } from "./catalogue.ts";
import { TAG_DATA } from "./tag-data.ts";

export const FACETS = [
  { id: "maker", title: "Brand" },
  { id: "type", title: "Type" },
  { id: "decade", title: "Decade" },
  { id: "cpuMaker", title: "CPU maker" },
  { id: "cpu", title: "CPU" },
  { id: "cores", title: "Cores" },
  { id: "ram", title: "Memory" },
  { id: "os", title: "Operating system" },
  { id: "screen", title: "Screen" },
  { id: "ports", title: "Ports" },
  { id: "wireless", title: "Wireless" },
  { id: "weight", title: "Weight" },
  { id: "generation", title: "Generation" },
  { id: "parts", title: "Parts" },
] as const;

export type FacetId = (typeof FACETS)[number]["id"];
export type Tags = Partial<Record<FacetId, readonly string[]>>;
export type Picks = Partial<Record<FacetId, readonly string[]>>;

const PART_WORDS: readonly [keyof NonNullable<ReturnType<typeof deviceByKey>>["parts"], string][] = [
  ["case", "Case"],
  ["hat", "Hat"],
  ["screen", "Screen"],
  ["cooler", "Cooler"],
];

/** What a machine is tagged with. A fact with no source is simply absent. A built device also says its ports and parts. */
export function tagsOf(key: string): Tags {
  const tags: Tags = TAG_DATA[key] ?? {};
  const device = deviceByKey(key);
  if (!device) return tags;
  const ports = [...new Set(device.ports.map((port) => port.kind))];
  const parts = PART_WORDS.filter(([field]) => device.parts[field]).map(([, word]) => word);
  return { ...tags, ...(ports.length ? { ports } : {}), ...(parts.length ? { parts } : {}) };
}

const passes = (tags: Tags, picks: Picks, skip?: FacetId): boolean =>
  FACETS.every(({ id }) => {
    const wanted = picks[id];
    if (id === skip || !wanted?.length) return true;
    return wanted.some((value) => tags[id]?.includes(value));
  });

/** Whether a machine has what was picked. */
export const matchesPicks = (key: string, picks: Picks): boolean => passes(tagsOf(key), picks);

/** How many of these machines each value would show, given what is picked in the other facets, so a facet's own choices stay on offer. */
export function facetCounts(keys: readonly string[], picks: Picks): Record<FacetId, Map<string, number>> {
  const counts = Object.fromEntries(FACETS.map(({ id }) => [id, new Map<string, number>()])) as Record<FacetId, Map<string, number>>;
  for (const key of keys) {
    const tags = tagsOf(key);
    for (const { id } of FACETS) {
      if (!passes(tags, picks, id)) continue;
      for (const value of tags[id] ?? []) counts[id].set(value, (counts[id].get(value) ?? 0) + 1);
    }
  }
  return counts;
}

const WEIGHTS: readonly string[] = ["Under 1 kg", "1 to 3 kg", "3 to 10 kg", "Over 10 kg"];
const BYTES: Readonly<Record<string, number>> = { KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12 };
const sizeOf = (value: string): number => {
  const [amount, unit] = value.split(" ");
  return Number(amount) * (BYTES[unit] ?? 1);
};

/** A facet's values in the order a reader expects: sizes and years as numbers, the rest with the commonest first. */
export function facetOrder(facet: FacetId, counts: ReadonlyMap<string, number>): string[] {
  const values = [...counts.keys()];
  if (facet === "ram") return values.sort((a, b) => sizeOf(a) - sizeOf(b));
  if (facet === "weight") return values.sort((a, b) => WEIGHTS.indexOf(a) - WEIGHTS.indexOf(b));
  if (facet === "decade" || facet === "cores" || facet === "screen" || facet === "generation") return values.sort((a, b) => parseFloat(a) - parseFloat(b));
  return values.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b, "en", { numeric: true }));
}
