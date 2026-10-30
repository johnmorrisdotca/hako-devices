// The machines on the list that have no mesh yet: names only, shown under one "Coming soon" silhouette. Made from data/wishlist.json by scripts/make-wishlist.ts.
export interface PlannedDevice {
  key: string;
  name: string;
  family: string;
  status: "planned";
}

export const PLANNED: readonly PlannedDevice[] = [];
