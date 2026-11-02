// Writes src/wishlist.ts from data/wishlist.json. Run it when the list changes (`pnpm wishlist`); a test keeps the two equal. The JSON is read, never edited here.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEVICES } from "../src/catalogue.ts";
import { tagProblems, type TagRow } from "./tag-rules.ts";
import { aliasProblems, readAliases, readTags, readWishlist } from "./wishlist-read.ts";

interface Raw {
  key: string;
  name: string;
  brand: string;
  family: string;
  year: number | null;
  dimensionsMm: number[] | null;
  formFactorGroup: string;
  phase: number;
  status: string;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "data", "wishlist.json"), "utf8")) as Raw[];
const problems = aliasProblems(data as { key: string; aliases?: string[] }[]);
if (problems.length) throw new Error(`aliases in data/wishlist.json:\n${problems.join("\n")}`);
const tagIssues = tagProblems(data as unknown as TagRow[]);
if (tagIssues.length) throw new Error(`tags in data/wishlist.json:\n${tagIssues.slice(0, 40).join("\n")}${tagIssues.length > 40 ? `\n... and ${tagIssues.length - 40} more` : ""}`);
const { planned, covered } = readWishlist(data, new Set(DEVICES.map((device) => device.key)));
const lines = (list: readonly unknown[]) => list.map((entry) => `  ${JSON.stringify(entry)},`).join("\n");
writeFileSync(
  join(root, "src", "wishlist.ts"),
  `// The list of machines, from data/wishlist.json by scripts/make-wishlist.ts: names only. Those with no mesh yet show under one "Coming soon" picture; a real machine a built mesh
// covers shows that mesh. Do not edit: run \`pnpm wishlist\`.
export interface PlannedDevice {
  key: string;
  name: string;
  family: string;
  /** Which shelf of the gallery it sits on: \`SHELVES\`. */
  shelf: string;
  maker: string;
  status: "planned";
}

export interface CoveredDevice {
  key: string;
  name: string;
  family: string;
  shelf: string;
  maker: string;
  /** The catalogue key of the mesh that draws it. */
  mesh: string;
  status: "built";
}

export const COVERED: readonly CoveredDevice[] = [
${lines(covered)}
];

export const PLANNED: readonly PlannedDevice[] = [
${lines(planned)}
];
`,
);
writeFileSync(
  join(root, "src", "tag-data.ts"),
  `// Every machine's tags, from data/wishlist.json by scripts/make-wishlist.ts. Do not edit: run \`pnpm wishlist\`.
export const TAG_DATA: Readonly<Record<string, Readonly<Partial<Record<string, readonly string[]>>>>> = {
${Object.entries(readTags(data)).map(([key, tags]) => `  ${JSON.stringify(key)}: ${JSON.stringify(tags)},`).join("\n")}
};
`,
);

writeFileSync(
  join(root, "src", "alias-data.ts"),
  `// Every machine's aliases, from data/wishlist.json by scripts/make-wishlist.ts. Do not edit: run \`pnpm wishlist\`.
export const ALIAS_DATA: Readonly<Record<string, readonly string[]>> = {
${Object.entries(readAliases(data)).map(([key, aliases]) => `  ${JSON.stringify(key)}: ${JSON.stringify(aliases)},`).join("\n")}
};
`,
);

// docs/wishlist.md: the counts, and the machines by phase. The words around them are written by hand.
const PHASES: Readonly<Record<number, string>> = { 1: "Retro phones and PDAs", 2: "Game consoles", 3: "Retro home computers", 4: "Apple", 5: "Microsoft", 6: "What is built today", 7: "Raspberry Pi", 8: "TV sticks and boxes", 9: "Android phones and tablets", 10: "Other small boards", 11: "Mini PCs", 12: "NeXT" };
const builtGroups = new Set(data.filter((entry) => entry.status === "built").map((entry) => entry.formFactorGroup));
const shapes = (rows: readonly Raw[]) => new Set(rows.filter((entry) => entry.status === "planned" && !builtGroups.has(entry.formFactorGroup)).map((entry) => entry.formFactorGroup)).size;
const sized = (rows: readonly Raw[]) => rows.filter((entry) => entry.dimensionsMm).length;
const groupBy = <K,>(rows: readonly Raw[], by: (entry: Raw) => K) => {
  const found = new Map<K, Raw[]>();
  for (const entry of rows) found.set(by(entry), [...(found.get(by(entry)) ?? []), entry]);
  return found;
};
const phases = Object.keys(PHASES).map(Number);
const of = (phase: number) => data.filter((entry) => entry.phase === phase);
const countLines = ["## Counts", "", "| Phase | Group | Machines | Shapes to build | With a sourced size |", "|---|---|---:|---:|---:|"];
for (const phase of phases) {
  countLines.push(`| **${phase}** | **${PHASES[phase]}** | **${of(phase).length}** | **${shapes(of(phase))}** | **${sized(of(phase))}** |`);
  const rows = [...groupBy(of(phase), (entry) => ([1, 2, 3].includes(phase) ? entry.brand : entry.family))].sort((a, b) => b[1].length - a[1].length);
  for (const [name, list] of rows) countLines.push(`|  | ${name} | ${list.length} | ${shapes(list)} | ${sized(list)} |`);
}
countLines.push(`|  | **Total** | **${data.length}** | **${shapes(data)}** | **${sized(data)}** |`);
const machineLines = ["## The machines", ""];
for (const phase of phases) {
  machineLines.push(`### Phase ${phase}: ${PHASES[phase]} (${of(phase).length} machines, ${shapes(of(phase))} shapes to build)`, "");
  const rows = [...groupBy(of(phase), (entry) => `${entry.brand}|${entry.family}`)].sort(([a], [b]) => (a < b ? -1 : 1));
  for (const [id, list] of rows) {
    const [brand, family] = id.split("|");
    machineLines.push(`**${family.includes(brand) || [4, 5, 6, 7, 11].includes(phase) ? family : `${brand} ${family}`}** (${list.length} machines, ${shapes(list)} shapes)`, "");
    const named = [...list].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || (a.name < b.name ? -1 : 1)).map((entry) => {
      const dated = entry.year && !entry.name.includes(String(entry.year)) ? `${entry.name} (${entry.year})` : entry.name;
      return entry.status === "built" ? `${dated} *built*` : dated;
    });
    machineLines.push(`${named.join(", ")}.`, "");
  }
}
const docPath = join(root, "docs", "wishlist.md");
const doc = readFileSync(docPath, "utf8");
const built = data.filter((entry) => entry.status === "built").length;
writeFileSync(
  docPath,
  doc
    .replace(/\*\*\d+ machines\. \d+ distinct shapes still to build\. \d+ entries are already built([^]*?) \d+ entries have a sourced size; the other \d+ are/, (_all, words: string) => `**${data.length} machines. ${shapes(data)} distinct shapes still to build. ${built} entries are already built${words} ${sized(data)} entries have a sourced size; the other ${data.length - sized(data)} are`)
    .replace(/the \d+ devices in this package/, `the ${DEVICES.length} devices in this package`)
    .replace(/## Counts\n[^]*?(?=\nA shape shared across two rows)/, countLines.join("\n") + "\n")
    .replace(/## The machines\n[^]*$/, machineLines.join("\n")),
);
console.log(`wishlist: ${planned.length} planned, ${covered.length} covered by a built mesh`);
