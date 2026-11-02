// The gallery's list, with no page: every machine and loose part as one row, the kinds and families they sit in, and what a search and the filters leave. Pure, and tested by test/gallery-model.test.ts.
import { aliasesOf, catalogue, type CatalogueEntry, deviceByKey, type Device, FAMILIES, headingOf, meshOf, PARTS, type Part, SHELVES } from "../src/index.ts";
import { FACETS, inYears, matchesPicks, type FacetId, type Picks, tagsOf, type YearRange, yearSpan } from "../src/tags.ts";

export type Show = "built" | "planned" | "all";
type Shelved = Exclude<CatalogueEntry, Device>;

export interface Item {
  /** What the address holds for it: a key, or `part:` and a part's id. */
  id: string;
  key: string;
  name: string;
  status: "built" | "planned";
  /** The kind it sits under, and the family inside that. */
  kind: string;
  family: string | null;
  entry: CatalogueEntry | null;
  part: Part | null;
  /** Its name, key and other names, in lower case. */
  hay: string;
}

export interface Kind {
  id: string;
  title: string;
  /** The shelf it stands for, when it is one. */
  shelf: string | null;
}

/** The first row of the kinds: a few to start from when nothing is narrowed, everything that matches when something is. */
export const START = "start";
/** The machines the first row opens on. */
export const FEATURED = ["pi4-pitft", "pi3b-oled", "pi-zero", "pi4-armor", "pi5", "mac-studio", "macbook-pro-14", "ipad-pro-11", "nas-2bay", "mini-pc"] as const;
export const PARTS_KIND = "parts";

const familyIds = new Set<string>(FAMILIES.map(({ id }) => id));
/** A shelf's kind. NeXT is both a family of drawn machines and a shelf of every model, so the shelf's id changes where the two meet. */
export const shelfKind = (shelf: string): string => (familyIds.has(shelf) ? `${shelf}-shelf` : shelf);

export const KINDS: readonly Kind[] = [
  ...FAMILIES.map(({ id, title }) => ({ id, title, shelf: null })),
  ...SHELVES.map(({ id, title }) => ({ id: shelfKind(id), title, shelf: id })),
  { id: PARTS_KIND, title: "Parts on their own", shelf: null },
];

/** A drawn family's own step: whichever of the machines' type, maker and decade splits them best, or none when they all say the same. A machine with no such tag goes under "Others". */
function drawnFamilies(devices: readonly Device[]): Map<string, string | null> {
  const out = new Map<string, string | null>();
  for (const { id } of FAMILIES) {
    const members = devices.filter((device) => device.family === id);
    let best: { field: "type" | "maker" | "decade"; largest: number } | null = null;
    for (const field of ["type", "maker", "decade"] as const) {
      const sizes = new Map<string, number>();
      for (const device of members) {
        const value = tagsOf(device.key)[field]?.[0] ?? "Others";
        sizes.set(value, (sizes.get(value) ?? 0) + 1);
      }
      const largest = Math.max(...sizes.values());
      // a fact most of them lack is no way to sort them
      if (sizes.size > 1 && (sizes.get("Others") ?? 0) <= members.length / 5 && (!best || largest < best.largest)) best = { field, largest };
    }
    for (const device of members) out.set(device.key, best ? (tagsOf(device.key)[best.field]?.[0] ?? "Others") : null);
  }
  return out;
}

const hayOf = (name: string, key: string) => `${name} ${key} ${aliasesOf(key).join(" ")}`.toLowerCase();
const partWord = (part: Part) => `${part.kind[0].toUpperCase()}${part.kind.slice(1)}s`;

function listItems(): readonly Item[] {
  const entries = catalogue();
  const devices = entries.filter((entry): entry is Device => !("shelf" in entry));
  const drawn = drawnFamilies(devices);
  const shelved = (entries.filter((entry) => "shelf" in entry) as Shelved[])
    .map((entry) => ({ entry, family: headingOf(entry) }))
    .sort((a, b) => a.family.localeCompare(b.family, "en", { numeric: true }));
  // a shelf under one heading has no step to take, like a drawn family no fact splits
  const headings = new Map<string, Set<string>>();
  for (const { entry, family } of shelved) headings.set(entry.shelf, (headings.get(entry.shelf) ?? new Set()).add(family));
  const parts = Object.values(PARTS).filter((part) => part.kind !== "board");
  return [
    ...devices.map((entry): Item => ({ id: entry.key, key: entry.key, name: entry.name, status: "built", kind: entry.family, family: drawn.get(entry.key) ?? null, entry, part: null, hay: hayOf(entry.name, entry.key) })),
    ...shelved.map(({ entry, family }): Item => ({ id: entry.key, key: entry.key, name: entry.name, status: entry.status, kind: shelfKind(entry.shelf), family: headings.get(entry.shelf)?.size === 1 ? null : family, entry, part: null, hay: hayOf(entry.name, entry.key) })),
    ...parts.map((part): Item => ({ id: `part:${part.id}`, key: part.id, name: part.name, status: "built", kind: PARTS_KIND, family: partWord(part), entry: null, part, hay: hayOf(part.name, part.id) })),
  ];
}

let cached: readonly Item[] | null = null;
let index: Map<string, Item> | null = null;
export const allItems = (): readonly Item[] => (cached ??= listItems());
/** The row an address names, or undefined. */
export function itemById(id: string): Item | undefined {
  index ??= new Map(allItems().map((item) => [item.id, item]));
  return index.get(id);
}
export const featuredItems = (): readonly Item[] => FEATURED.map((key) => itemById(key)).filter((item): item is Item => item !== undefined);

export const anyPick = (picks: Picks): boolean => Object.values(picks).some((values) => (values?.length ?? 0) > 0);
export const yearsSet = ({ from, to }: YearRange): number => (from == null ? 0 : 1) + (to == null ? 0 : 1);
export const isNarrowed = (text: string, picks: Picks, years: YearRange = {}): boolean => text.trim() !== "" || anyPick(picks) || yearsSet(years) > 0;
/** What "Filters: N on" counts: each value picked and each year limit set. */
export const filtersOn = (picks: Picks, years: YearRange): number => Object.values(picks).reduce((sum, values) => sum + (values?.length ?? 0), 0) + yearsSet(years);

/** What the Built, Coming soon and All choice and the search leave. Filters come after, because their own counts are of this. */
export function offeredItems(items: readonly Item[], show: Show, text: string): Item[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => (show === "all" || item.status === show) && words.every((word) => item.hay.includes(word)));
}

/** What a from and to year leave of those. Like the facets' own counts, what the filters offer is of this. A loose part has no year, and a machine of unknown year goes too, as `inYears` says. */
export const yearItems = (items: readonly Item[], years: YearRange): Item[] => (yearsSet(years) > 0 ? items.filter((item) => item.part === null && inYears(item.key, years)) : [...items]);

/** What the filters leave of those. A loose part has no tags, so any filter leaves it out, and it is never "coming soon". */
export const pickedItems = (offered: readonly Item[], picks: Picks): Item[] => (anyPick(picks) ? offered.filter((item) => item.part === null && matchesPicks(item.key, picks)) : [...offered]);

export const countByKind = (items: readonly Item[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
  return counts;
};

/** The families of some machines, A to Z, with how many in each. Machines with no family count for none. */
export function familiesOf(items: readonly Item[]): readonly [string, number][] {
  const counts = new Map<string, number>();
  for (const item of items) if (item.family !== null) counts.set(item.family, (counts.get(item.family) ?? 0) + 1);
  return [...counts].sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }));
}

/** The address keeps a filter as `f-maker=Apple|Sony`. */
export const facetParam = (facet: FacetId): string => `f-${facet}`;
export const readPicks = (read: (name: string) => string | null): Picks => {
  const picks: Partial<Record<FacetId, string[]>> = {};
  for (const { id } of FACETS) {
    const value = read(facetParam(id));
    if (value) picks[id] = value.split("|");
  }
  return picks;
};

/** The address keeps the date filter as `year-from=1984&year-to=1990`. */
export const YEAR_FROM = "year-from";
export const YEAR_TO = "year-to";
/** A year as typed or as an address has it: four digits, and anything else is no limit, so a box half typed narrows nothing yet. */
export const readYear = (raw: string | null): number | null => (raw !== null && /^\d{4}$/.test(raw.trim()) ? Number(raw) : null);
export const readYears = (read: (name: string) => string | null): { from: number | null; to: number | null } => ({ from: readYear(read(YEAR_FROM)), to: readYear(read(YEAR_TO)) });
/** The first and last year of the machines, for the boxes to hint at. */
export const yearHints = () => yearSpan(allItems().filter((item) => item.part === null).map((item) => item.key));

/** The drawing's key: its mesh, its own for a part, and null for a machine with no shape yet. */
export const drawingKey = (item: Item): string | null => (item.part ? item.part.id : meshOf(item.key));
export const realSize = (item: Item) => item.part?.size ?? deviceByKey(item.key)?.size ?? null;
