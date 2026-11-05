// The motorola edge (2025). The outer size is Motorola's own height × width × depth. Everything else is measured from Motorola's straight-on product pictures, scaled so the outline's height is that published height. The front's width then matches the published width. Across on the back runs from the left as seen from behind. The camera island's edge does not show against the leather, so it is not drawn. No mark, and no bottom picture, so the USB-C is not drawn.
import type { SlabBody } from "./slab-body.ts";

export const MOTOROLA_BODIES: readonly SlabBody[] = [
  // 161.19 × 73.06 × 7.99 mm. Four lenses, a centred punch hole, volume and power on the right.
  {
    key: "motorola-edge-2025",
    shell: "shell-midnight-green",
    r: 6.3,
    screen: [70.7, 157.7, 1.4, 5.1],
    front: { camera: [37, 7.3, 1.6] },
    back: {
      rise: 4.2,
      lenses: [
        [14.7, 14.5, 7.1],
        [35, 15.3, 7.4],
        [15.2, 36.2, 7.4],
        [34.8, 36.2, 7.5],
      ],
    },
    right: [
      ["button", 42.8, 20.9],
      ["button", 64.8, 10.5],
    ],
  },
];
