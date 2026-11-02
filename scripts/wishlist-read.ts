// Reads data/wishlist.json into the catalogue's entries: for a machine with no mesh yet, a key, a name, its shelf, maker and family; for a real machine a built mesh already covers, which mesh. Nothing
// else of the file goes in the package: its sizes and sources stay in data/.
export interface PlannedEntry {
  key: string;
  name: string;
  family: string;
  /** Which shelf of the gallery it sits on: scripts/wishlist-read.ts SHELF_OF_PHASE, src/status.ts SHELVES. */
  shelf: string;
  maker: string;
  status: "planned";
}

export interface CoveredEntry {
  key: string;
  name: string;
  family: string;
  shelf: string;
  maker: string;
  /** The catalogue key of the mesh that draws it. */
  mesh: string;
  status: "built";
}

const SHELF_OF_PHASE: Readonly<Record<number, string>> = { 1: "phones", 2: "consoles", 3: "computers", 4: "apple", 5: "microsoft", 7: "raspberry-pi", 8: "tv", 9: "android", 10: "boards", 11: "mini-pcs", 12: "next" };

/** The tags of every machine, built ones too, for src/tag-data.ts: the facts that stay facts when the sizes and sources stay in data/. */
export function readTags(data: unknown, colours: Readonly<Record<string, readonly { name: string }[]>> = {}): Record<string, Record<string, readonly string[]>> {
  const tags: Record<string, Record<string, readonly string[]>> = {};
  for (const raw of data as (RawEntry & { tags: Record<string, readonly string[]> })[]) {
    const own = colours[raw.key];
    tags[raw.key] = { maker: [raw.brand], ...raw.tags, ...(own?.length ? { colour: own.map(({ name }) => name) } : {}) };
  }
  return tags;
}

/** The aliases of every machine that has any, for src/alias-data.ts. */
export function readAliases(data: unknown): Record<string, readonly string[]> {
  const aliases: Record<string, readonly string[]> = {};
  for (const raw of data as { key: string; aliases?: readonly string[] }[]) if (raw.aliases?.length) aliases[raw.key] = raw.aliases;
  return aliases;
}

const ALIAS_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** What is wrong with the aliases of the list, one line each: an alias that is not lowercase kebab-case ASCII, one that is another machine's key, one that two machines share, or one repeated on a machine. */
export function aliasProblems(data: readonly { key: string; aliases?: readonly string[] }[]): string[] {
  const keys = new Set(data.map((raw) => raw.key));
  const owner = new Map<string, string>();
  const problems: string[] = [];
  for (const { key, aliases = [] } of data) {
    for (const alias of aliases) {
      if (!ALIAS_FORMAT.test(alias)) problems.push(`${key}: "${alias}" is not lowercase kebab-case ASCII`);
      else if (alias === key) problems.push(`${key}: "${alias}" is its own key`);
      else if (keys.has(alias)) problems.push(`${key}: "${alias}" is the key of another machine`);
      else if (owner.has(alias)) problems.push(`${key}: "${alias}" is also an alias of ${owner.get(alias)}`);
      else owner.set(alias, key);
    }
  }
  return problems;
}

interface RawEntry {
  key: string;
  name: string;
  brand: string;
  family: string;
  phase: number;
  formFactorGroup: string;
  status: "planned" | "built";
  notes: string;
}

export function readWishlist(data: unknown, built: ReadonlySet<string>): { planned: PlannedEntry[]; covered: CoveredEntry[] } {
  if (!Array.isArray(data)) throw new Error("data/wishlist.json is not a list of machines");
  const planned: PlannedEntry[] = [];
  const covered: CoveredEntry[] = [];
  for (const raw of data as RawEntry[]) {
    if (built.has(raw.key)) continue;
    const shelf = SHELF_OF_PHASE[raw.phase];
    if (!shelf) throw new Error(`${raw.key} is on no shelf: phase ${raw.phase}`);
    const place = { family: raw.family, shelf, maker: raw.brand };
    if (raw.status === "planned") planned.push({ key: raw.key, name: raw.name, ...place, status: "planned" });
    else {
      const mesh = /Covered by the built mesh ([\w-]+)/.exec(raw.notes)?.[1] ?? raw.formFactorGroup;
      if (!built.has(mesh)) throw new Error(`${raw.key} is built, and its mesh ${mesh} is not in the catalogue`);
      covered.push({ key: raw.key, name: raw.name, ...place, mesh, status: "built" });
    }
  }
  return { planned, covered };
}
