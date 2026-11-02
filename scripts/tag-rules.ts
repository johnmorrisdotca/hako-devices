// The rules a machine's tags must follow in data/wishlist.json. `pnpm wishlist` refuses a list that breaks them and test/tags.test.ts holds them.
//
// A tag is a fact, so it names the page it came from. Brand, type and decade are the list's own (the brand, the shape and the year); a generation or a screen size may be read from the machine's own
// name. Every other tag needs a page: in `tagSources` under its kind, or for CPU, cores, memory and ports (the older kinds) the row's `tagsSource` or `dimensionsSource`. Operating system, wireless,
// weight, colour and discontinued year have only `tagSources`: a family's article is not a source for a model unless it says it covers it.
import { FACETS } from "../src/tags.ts";

export interface TagRow {
  key: string;
  name: string;
  year?: number | null;
  dimensionsSource?: string | null;
  tagsSource?: string;
  tags: Record<string, readonly string[]>;
  tagSources?: Record<string, readonly string[]>;
}

/** Kinds that need no page: the brand, the type and the decade are the list's own. */
export const OWN_KINDS: readonly string[] = ["maker", "type", "decade"];
/** Older kinds that may rest on the row's `tagsSource` or `dimensionsSource` when `tagSources` says nothing. */
export const ROW_SOURCE_KINDS: readonly string[] = ["cpu", "cpuMaker", "cores", "ram", "screen", "ports", "generation"];
/** Kinds a machine's own name can state. */
export const NAME_KINDS: readonly string[] = ["generation", "screen"];

const DASH = "[-‐-― ]?";
/** Whether the name states this value: `3` in "iPad (3rd generation)" or "NUC 12 Pro", `13-inch` in "MacBook Pro (13-inch)". */
export function nameStates(kind: string, value: string, name: string): boolean {
  if (kind === "generation") return new RegExp(`(?<![\\d.])${value}(?:st|nd|rd|th)?(?![\\d.])`, "i").test(name);
  if (kind === "screen") return new RegExp(`(?<![\\d.])${value.replace("-inch", "").replace(".", "\\.")}${DASH}(?:inch|in\\b|")`, "i").test(name);
  return false;
}

const isPage = (value: string) => /^https?:\/\/\S/.test(value);

/** What is wrong with the tags of the list, one line each. Empty when every tag is a known kind with a source. */
export function tagProblems(rows: readonly TagRow[]): string[] {
  const kinds = new Set<string>(FACETS.map((facet) => facet.id));
  const problems: string[] = [];
  for (const row of rows) {
    for (const [kind, values] of Object.entries(row.tags)) {
      const say = (text: string) => problems.push(`${row.key}: ${kind} ${text}`);
      if (!kinds.has(kind)) {
        say("is not a tag kind");
        continue;
      }
      if (!Array.isArray(values) || values.length === 0 || values.some((value) => typeof value !== "string" || !value)) say("has no values");
      else if (new Set(values).size !== values.length) say("repeats a value");
      if (kind === "discontinued" && values.some((value) => !/^(19|20)\d\d$/.test(value))) say("is not a four-digit year");
      if (kind === "decade" && row.year && values.join() !== `${Math.floor(row.year / 10) * 10}s`) say(`is not the decade of ${row.year}`);
      if (OWN_KINDS.includes(kind)) continue;
      const own = row.tagSources?.[kind] ?? [];
      const sources = own.length ? own : ROW_SOURCE_KINDS.includes(kind) ? [row.tagsSource, row.dimensionsSource].filter((page): page is string => !!page) : [];
      if (sources.length === 0) {
        if (!(NAME_KINDS.includes(kind) && values.every((value) => nameStates(kind, value, row.name)))) say("has no source");
      } else if (!sources.every(isPage)) say("has a source that is not a page address");
    }
    for (const kind of Object.keys(row.tagSources ?? {})) {
      if (!(kind in row.tags)) problems.push(`${row.key}: tagSources names ${kind}, which the machine does not have`);
      else if (OWN_KINDS.includes(kind)) problems.push(`${row.key}: ${kind} needs no source`);
    }
  }
  return problems;
}
