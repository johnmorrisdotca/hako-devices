// The rules of data/colours.json, the colours a product came in. `pnpm wishlist` refuses a list that breaks them and test/colours.test.ts holds them.
//
// A row names the machines and the page, and each colour is the maker's own word. A colour's page says that this machine came in this colour: a blank is fine and a guess is not. A swatch value
// needs a page of its own, or the drawing it is read from. The machines whose colours are still tags in data/wishlist.json (`tags.colour` with `tagSources.colour`) stay there, and a machine is in one
// place only.
export interface ColourValue {
  name: string;
  /** Another page for this one colour, in place of the row's. */
  source?: string;
  /** "#rrggbb" for a swatch. */
  swatch?: string;
  /** The page that gives the value. */
  swatchSource?: string;
  /** The key of the device drawn in this colour. */
  drawing?: string;
}

export interface ColourRow {
  keys: readonly string[];
  source: string;
  colours: readonly (string | ColourValue)[];
  /** Why this row needed a word of explanation: stays in data/. */
  note?: string;
}

/** The machine's list row, as far as colours read it. */
export interface ColourListRow {
  key: string;
  tags: Record<string, readonly string[]>;
  tagSources?: Record<string, readonly string[]>;
}

export interface ColourEntry {
  name: string;
  sources: readonly string[];
  swatch?: string;
  swatchSource?: string;
  drawing?: string;
}

const isPage = (value: unknown) => typeof value === "string" && /^https?:\/\/\S+$/.test(value);
const HEX = /^#[0-9a-f]{6}$/;
const valueOf = (colour: string | ColourValue): ColourValue => (typeof colour === "string" ? { name: colour } : colour);

/** What is wrong with the colours of the list, one line each. Empty when every colour is a word on a known machine with its page. */
export function colourProblems(rows: readonly ColourRow[], list: readonly ColourListRow[], devices: ReadonlySet<string>): string[] {
  const known = new Map(list.map((row) => [row.key, row]));
  const seen = new Set<string>();
  const problems: string[] = [];
  rows.forEach((row, index) => {
    const name = row.keys?.[0] ?? `row ${index + 1}`;
    if (!Array.isArray(row.keys) || row.keys.length === 0) problems.push(`${name}: names no machine`);
    if (!isPage(row.source)) problems.push(`${name}: the row's source is not a page address`);
    if (!Array.isArray(row.colours) || row.colours.length === 0) {
      problems.push(`${name}: has no colours`);
      return;
    }
    for (const key of row.keys ?? []) {
      if (!known.has(key)) problems.push(`${key}: is not on the list`);
      else if (known.get(key)?.tags.colour) problems.push(`${key}: already has its colours as tags in data/wishlist.json`);
      if (seen.has(key)) problems.push(`${key}: is in two rows`);
      seen.add(key);
    }
    const names = new Set<string>();
    for (const colour of row.colours) {
      const { name: word, source, swatch, swatchSource, drawing } = valueOf(colour);
      const say = (text: string) => problems.push(`${name}: ${word} ${text}`);
      if (typeof word !== "string" || !word.trim()) {
        problems.push(`${name}: a colour has no name`);
        continue;
      }
      if (names.has(word)) say("is there twice");
      names.add(word);
      if (source !== undefined && !isPage(source)) say("has a source that is not a page address");
      if (swatch !== undefined && !HEX.test(swatch)) say("has a swatch that is not #rrggbb in lowercase");
      if (swatch !== undefined && !swatchSource && !drawing) say("has a swatch with no page and no drawing");
      if (swatchSource !== undefined && !isPage(swatchSource)) say("has a swatch source that is not a page address");
      if (swatchSource !== undefined && swatch === undefined) say("has a swatch source and no swatch");
      if (drawing !== undefined && !devices.has(drawing)) say(`names a drawing that is not a device: ${drawing}`);
    }
  });
  return problems;
}

/** Every machine's colours: those still kept as tags in the list, then data/colours.json. */
export function readColours(rows: readonly ColourRow[], list: readonly ColourListRow[]): Record<string, readonly ColourEntry[]> {
  const colours: Record<string, readonly ColourEntry[]> = {};
  for (const row of list) {
    const names = row.tags.colour;
    if (names?.length) colours[row.key] = names.map((name) => ({ name, sources: row.tagSources?.colour ?? [] }));
  }
  for (const row of rows) {
    const entries = row.colours.map((colour): ColourEntry => {
      const { name, source, swatch, swatchSource, drawing } = valueOf(colour);
      return { name, sources: [source ?? row.source], ...(swatch ? { swatch } : {}), ...(swatchSource ? { swatchSource } : {}), ...(drawing ? { drawing } : {}) };
    });
    for (const key of row.keys) colours[key] = entries;
  }
  return colours;
}

/** The generated table: each page once, by its place in the list. */
export function colourTable(colours: Record<string, readonly ColourEntry[]>): { pages: string[]; data: Record<string, readonly object[]> } {
  const pages: string[] = [];
  const places = new Map<string, number>();
  const place = (page: string) => {
    if (!places.has(page)) {
      places.set(page, pages.length);
      pages.push(page);
    }
    return places.get(page) as number;
  };
  const data: Record<string, readonly object[]> = {};
  for (const [key, entries] of Object.entries(colours)) {
    data[key] = entries.map(({ name, sources, swatch, swatchSource, drawing }) => ({
      name,
      pages: sources.map(place),
      ...(swatch ? { swatch } : {}),
      ...(swatchSource ? { swatchPage: place(swatchSource) } : {}),
      ...(drawing ? { drawing } : {}),
    }));
  }
  return { pages, data };
}
