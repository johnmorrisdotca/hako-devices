// Reads data/wishlist.json into the catalogue's entries: for a machine with no mesh yet, a key, a name and a family; for a real machine a built mesh already covers, which mesh. Nothing
// else of the file goes in the package: its sizes and sources stay in data/.
export interface PlannedEntry {
  key: string;
  name: string;
  family: string;
  status: "planned";
}

export interface CoveredEntry {
  key: string;
  name: string;
  family: string;
  /** The catalogue key of the mesh that draws it. */
  mesh: string;
  status: "built";
}

interface RawEntry {
  key: string;
  name: string;
  family: string;
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
    if (raw.status === "planned") planned.push({ key: raw.key, name: raw.name, family: raw.family, status: "planned" });
    else {
      const mesh = /Covered by the built mesh ([\w-]+)/.exec(raw.notes)?.[1] ?? raw.formFactorGroup;
      if (!built.has(mesh)) throw new Error(`${raw.key} is built, and its mesh ${mesh} is not in the catalogue`);
      covered.push({ key: raw.key, name: raw.name, family: raw.family, mesh, status: "built" });
    }
  }
  return { planned, covered };
}
