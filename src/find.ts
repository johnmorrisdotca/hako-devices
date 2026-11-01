// Finding a machine by its key or by an alias: "trash-can" and "mac-pro-late-2013" are the same Mac Pro. An alias belongs to one machine and is never another machine's key.
import { ALIAS_DATA } from "./alias-data.ts";
import { catalogue, type CatalogueEntry } from "./status.ts";

let byName: Map<string, CatalogueEntry> | undefined;

/** The other names a machine goes by, lowercase kebab-case: `aliasesOf("rpi-zero")` is `["rpi-zero-v12", ..., "raspberry-pi-zero"]`. Empty for a machine with none, and for a key on no list. */
export const aliasesOf = (key: string): readonly string[] => ALIAS_DATA[key] ?? [];

/** The machine a key or an alias names, or `undefined`. The text is lowercased and spaces, underscores and the like become hyphens, so "Trash Can" finds "trash-can". A key wins over an alias, though no alias is a key. */
export function findMachine(keyOrAlias: string): CatalogueEntry | undefined {
  if (!byName) {
    byName = new Map();
    const entries = catalogue();
    for (const entry of entries) byName.set(entry.key, entry);
    for (const entry of entries) for (const alias of aliasesOf(entry.key)) byName.set(alias, entry);
  }
  return byName.get(keyOrAlias.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
}
