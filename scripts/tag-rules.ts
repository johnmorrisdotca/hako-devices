// The rules a machine's tags must follow in data/wishlist.json. `pnpm wishlist` refuses a list that breaks them and test/tags.test.ts holds them.
//
// A tag is a fact, so it names the page it came from. Brand, type and decade are the list's own (the brand, the shape and the year); a generation or a screen size may be read from the machine's own
// name. Every other tag needs a page: in `tagSources` under its kind, or for CPU, cores, memory and ports (the older kinds) the row's `tagsSource` or `dimensionsSource`. Operating system, wireless,
// weight, colour and discontinued year have only `tagSources`: a family's article is not a source for a model unless it says it covers it. CPU, cores and memory go further: their page must be about the
// machine itself (`isModelPage`), because a later revision may have another chip, and the series article does not say.
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
/** Kinds whose page must be about the machine itself, never a series, a list or a family. */
export const MODEL_KINDS: readonly string[] = ["cpu", "cpuMaker", "cores", "ram"];
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

/** Pages that describe a whole family of machines, whatever their address looks like. */
const FAMILY_DOCUMENTS: readonly string[] = ["Accessory-Design-Guidelines"];
const plain = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
/** Wikipedia's own words after a title to tell it from another: "Xbox (console)" is the Xbox, not the brand. A year or a screen size in brackets is part of the machine's name and is never dropped. */
const DISAMBIGUATION = /\s*\((?:video game console|handheld game console|home video game console|console|home computer|personal computer|computer|smartphone|mobile phone|phone|tablet computer|tablet)\)$/i;
/** A maker's model number after the name ("Game Boy Advance (AGB-001)") names the same machine as the article called "Game Boy Advance". */
const MODEL_NUMBER = /\s*\((?:[A-Z]{2,5}-[A-Z]?\d{2,4}[A-Z]?(?:-[A-Z])?)\)$/;
/** A watch's case size is not another model: "Apple Watch Series 4 (40 mm)" is the Series 4. Any other bracket (a Mac's date, an iPad Pro's screen) names the model. */
const withoutCase = (text: string) => text.replace(/\s*\(\d+ mm\)\s*$/, "").replace(MODEL_NUMBER, "");

/** Whether a page is about this machine and no other. A Wikipedia article is when its title is the machine's name; a maker's page (Apple's, Intel's Ark, ASUS's) for one machine is, and a document on a family is not. */
export function isModelPage(name: string, page: string): boolean {
  if (FAMILY_DOCUMENTS.some((part) => page.includes(part))) return false;
  const article = /^https:\/\/[a-z]+\.wikipedia\.org\/wiki\/([^#?]+)/.exec(page);
  if (!article) return true;
  let title: string;
  try {
    title = decodeURIComponent(article[1]).replace(/_/g, " ");
  } catch {
    return false;
  }
  return [name, withoutCase(name)].map(plain).some((own) => own === plain(title) || own === plain(title.replace(DISAMBIGUATION, "")));
}

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
      else if (MODEL_KINDS.includes(kind)) {
        const family = sources.find((page) => !isModelPage(row.name, page));
        if (family) say(`rests on a page that is not about ${row.name}: ${family}`);
      }
    }
    for (const kind of Object.keys(row.tagSources ?? {})) {
      if (!(kind in row.tags)) problems.push(`${row.key}: tagSources names ${kind}, which the machine does not have`);
      else if (OWN_KINDS.includes(kind)) problems.push(`${row.key}: ${kind} needs no source`);
    }
  }
  return problems;
}
