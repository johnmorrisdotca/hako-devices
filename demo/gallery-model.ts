// The gallery's list, with no page: every machine and loose part as one row, the kinds and families they sit in, and what a search and the filters leave. Pure, and tested by test/gallery-model.test.ts.
import { aliasesOf, catalogue, type CatalogueEntry, deviceByKey, headingOf, meshOf, PARTS, type Part } from "../src/index.ts";
import { FACETS, inYears, lineOf, matchesPicks, type FacetId, type Picks, tagsOf, type YearRange, yearSpan } from "../src/tags.ts";

export type Show = "built" | "planned" | "all";

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
  /** The types of machine it holds: the `type` tag, each in this kind and no other. */
  types: readonly string[];
}

/** The first row of the kinds: a few to start from when nothing is narrowed, everything that matches when something is. */
export const START = "start";
/** The machines the first row opens on. */
export const FEATURED = ["pi4-pitft", "pi3b-oled", "pi-zero", "pi4-armor", "pi5", "mac-studio", "macbook-pro-14", "ipad-pro-11", "nas-2bay", "mini-pc"] as const;
export const PARTS_KIND = "parts";

/**
 * The kinds are kinds of device, and nothing else: each is a group of the machines' `type` tag, and a type is in one kind only. A maker (Apple, Raspberry Pi) or a product line is not a kind: the
 * brand is a filter, and a line is the step inside a kind. So a Raspberry Pi is a single-board computer, an iPhone a phone and a NeXTstation a desktop, whichever list it was written on.
 */
export const KINDS: readonly Kind[] = [
  { id: "sbc", title: "Single-board computers", types: ["Single-board computer", "Compute module", "Keyboard computer", "Microcontroller board"] },
  { id: "mini-pcs", title: "Mini PCs", types: ["Mini PC"] },
  { id: "desktops", title: "Desktops", types: ["Desktop", "Workstation", "Tower", "Computer", "Other"] },
  { id: "laptops", title: "Laptops", types: ["Laptop"] },
  { id: "tablets", title: "Tablets and e-readers", types: ["Tablet", "E-reader"] },
  { id: "phones", title: "Phones and PDAs", types: ["Phone", "PDA", "Pager"] },
  { id: "wearables", title: "Watches and wearables", types: ["Watch", "Earbuds", "Headset"] },
  { id: "audio", title: "Music players and speakers", types: ["Music player", "Speaker"] },
  { id: "tv", title: "TV sticks and boxes", types: ["Streaming device", "TV device", "Media player"] },
  { id: "consoles", title: "Game consoles", types: ["Home console", "Handheld console", "Hybrid console"] },
  { id: "home-computers", title: "Retro home computers", types: ["Home computer"] },
  { id: "calculators", title: "Calculators", types: ["Calculator"] },
  { id: "nas", title: "NAS boxes and servers", types: ["NAS", "Server"] },
  { id: "peripherals", title: "Displays and accessories", types: ["Display", "Printer", "Scanner", "Keyboard", "Mouse", "Trackpad", "Stylus", "Camera", "Network", "Remote", "Tracker", "Board"] },
  { id: "gadgets", title: "Other gadgets", types: ["Toy", "Tabletop"] },
  { id: PARTS_KIND, title: "Parts on their own", types: [] },
];

const kindOfType = new Map(KINDS.flatMap((kind) => kind.types.map((type) => [type, kind.id] as const)));

/** The kind a machine sits in, from what it is. A machine with no type, or a type no kind names, stops the list rather than landing anywhere. */
export function kindOf(key: string): string {
  const type = tagsOf(key).type?.[0];
  const kind = type === undefined ? undefined : kindOfType.get(type);
  if (kind === undefined) throw new Error(`${key} is a "${type}", and no kind holds that type`);
  return kind;
}

/** Makers whose lines are known by their own names ("Power Mac", "iPhone", "Raspberry Pi 4"), so a heading needs no maker before it. */
const OWN_NAMES: Readonly<Record<string, string>> = { Apple: "apple", NeXT: "next", Microsoft: "microsoft", "Raspberry Pi": "raspberry-pi" };

/** A machine's product line, the step inside its kind: "Power Mac", "Nintendo DS". The drawings made for no maker in particular share one line. */
function lineHeading(entry: CatalogueEntry): string {
  if ("shelf" in entry) return entry.maker === "Generic" ? "Generic drawings" : headingOf(entry);
  const maker = tagsOf(entry.key).maker?.[0] ?? "Generic";
  const line = lineOf(entry.key);
  if (maker === "Generic" || line === null) return "Generic drawings";
  return headingOf({ shelf: OWN_NAMES[maker] ?? "", maker, family: line });
}

const hayOf = (name: string, key: string) => `${name} ${key} ${aliasesOf(key).join(" ")}`.toLowerCase();
const partWord = (part: Part) => `${part.kind[0].toUpperCase()}${part.kind.slice(1)}s`;

function listItems(): readonly Item[] {
  const rows = [...catalogue()]
    .map((entry) => ({ entry, kind: kindOf(entry.key), line: lineHeading(entry) }))
    .sort((a, b) => a.line.localeCompare(b.line, "en", { numeric: true }));
  // a kind under one heading has no step to take, like a kind of few machines
  const lines = new Map<string, Set<string>>();
  for (const { kind, line } of rows) lines.set(kind, (lines.get(kind) ?? new Set()).add(line));
  const parts = Object.values(PARTS).filter((part) => part.kind !== "board");
  return [
    ...rows.map(({ entry, kind, line }): Item => ({ id: entry.key, key: entry.key, name: entry.name, status: "shelf" in entry ? entry.status : "built", kind, family: lines.get(kind)?.size === 1 ? null : line, entry, part: null, hay: hayOf(entry.name, entry.key) })),
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
