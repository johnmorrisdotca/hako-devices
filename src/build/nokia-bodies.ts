// The Nokia X30 and the XR21. The outer size is HMD's own height x width x depth. Everything else is measured from HMD's straight-on product pictures, scaled so the outline matches that height and that width. Across on the back runs from the left as seen from behind. No mark. There is no side picture, so the camera island's height is not drawn, and no bottom picture, so the USB-C is not drawn.
import type { SlabBody } from "./slab-body.ts";

export const NOKIA_BODIES: readonly SlabBody[] = [
  // 158.9 x 73.9 x 7.99 mm. Two lenses, a flash, a centred punch hole, two buttons on the right.
  {
    key: "nokia-x30",
    shell: "shell-dark-blue",
    r: 8.2,
    screen: [67.5, 149.6, 4.1, 5],
    front: { camera: [36.9, 7.8, 1.3] },
    back: {
      lenses: [
        [17.5, 16.9, 3.8],
        [17.5, 29.4, 3.8],
      ],
      flash: [[17.5, 39.6, 1.3]],
    },
    right: [
      ["button", 43.7, 20.1],
      ["button", 66, 9.5],
    ],
  },
  // 168 x 78.58 x 10.45 mm. Two lenses, two flashes, a centred punch hole, a button on each side.
  {
    key: "nokia-xr21",
    shell: "shell-graphite",
    r: 12,
    screen: [68.5, 151.3, 7.1, 7],
    front: { camera: [39.3, 11.5, 2.2] },
    back: {
      lenses: [
        [16.9, 16.3, 4.8],
        [16.9, 29.4, 4.8],
      ],
      flash: [
        [18.3, 38.3, 0.8],
        [18.3, 41.5, 0.8],
      ],
    },
    left: [["button", 62.4, 16.9]],
    right: [["button", 52.8, 21.9]],
  },
];
