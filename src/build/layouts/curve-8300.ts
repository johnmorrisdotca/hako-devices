import { parseLayout, type KeyLayout } from "../keys.ts";

// The same object as curve-8300.json. The test reads the file and refuses a drift.
export const curve8300Layout: KeyLayout = parseLayout({
  u: 4.4,
  rows: [
    { y: 38, h: 3.4, gap: 0.55, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], profile: "sculpted", stuff: "metal" },
    { y: 32, h: 3.4, gap: 0.55, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], profile: "sculpted", stuff: "metal" },
    { y: 26, h: 3.4, gap: 0.55, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], profile: "sculpted", stuff: "metal" },
    { y: 18, h: 3.8, gap: 1.6, keys: [2, 4.6, 2], profile: "domed", stuff: "metal" },
  ],
});
