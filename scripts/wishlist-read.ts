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

const SHELF_OF_PHASE: Readonly<Record<number, string>> = { 1: "phones", 2: "consoles", 3: "computers", 4: "apple", 5: "microsoft" };

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
