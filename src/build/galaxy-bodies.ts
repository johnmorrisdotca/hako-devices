// The Galaxy S25, S25+ and S25 Ultra. The outer size is Samsung's own height × width × depth. Everything else is measured from Samsung's accessory drawing
// (developer.samsung.com/Mobile/file/597bb426-0af0-44c5-9608-4a52845135db), scaled so the outline's height is that published height. The outline's width then matches the published width.
// Across on the back runs from the left as seen from behind. No marks.
import type { SlabBody } from "./slab-body.ts";

export const GALAXY_BODIES: readonly SlabBody[] = [
  // SM-S931B. 146.9 × 70.5 × 7.2 mm. Three lenses in one column, a flash beside the top one, volume and power on the right.
  {
    key: "samsung-galaxy-s25",
    shell: "shell-silver",
    r: 6.6,
    screen: [65.6, 142.1, 2.4, 6.6],
    front: { camera: [35.2, 5.8, 1.7] },
    back: {
      lenses: [
        [12.3, 12.3, 6.5],
        [12.3, 28.3, 6.5],
        [12.3, 45.1, 6.5],
      ],
      flash: [[22.7, 9.7, 2.3]],
    },
    right: [
      ["button", 36.7, 19.8],
      ["button", 61.7, 10.9],
    ],
    // The sheet's bottom view: the microphone slot, the USB port, the speaker, and one small hole. The port's middle measures 35.2.
    bottom: [
      ["grille", 18.3, 14.5],
      ["usb-c", 35.2],
      ["grille", 51.9, 10.2],
    ],
    bottomHoles: [[28.1], 0.7],
  },
  // SM-S936B. 158.4 × 75.8 × 7.3 mm. Same arrangement, its own measurements.
  {
    key: "samsung-galaxy-s25-plus",
    shell: "shell-silver",
    r: 7.4,
    screen: [70.9, 153.5, 2.4, 7.4],
    front: { camera: [37.9, 5.8, 1.7] },
    back: {
      lenses: [
        [13.8, 13.1, 6.5],
        [13.8, 29.8, 6.5],
        [13.8, 47.3, 6.5],
      ],
      flash: [[22.2, 11.4, 1.5]],
    },
    right: [
      ["button", 38.4, 20.2],
      ["button", 63.4, 11.2],
    ],
    bottom: [
      ["grille", 21, 14.6],
      ["usb-c", 37.9],
      ["grille", 54.7, 10.2],
    ],
    bottomHoles: [[30.8], 0.7],
  },
  // SM-S938B. 162.8 × 77.6 × 8.2 mm. Sharper corners, a second column of lenses, the flash between those two.
  {
    key: "samsung-galaxy-s25-ultra",
    shell: "shell-titanium",
    r: 3.7,
    screen: [73.1, 158.2, 2.3, 3.7],
    front: { camera: [38.8, 5.7, 1.7] },
    back: {
      lenses: [
        [14.6, 14.6, 7],
        [14.6, 32.1, 6.5],
        [14.6, 50.4, 6.5],
        [31, 14.2, 4.8],
        [31, 32.5, 4.8],
      ],
      flash: [[31.4, 22, 2.3]],
    },
    right: [
      ["button", 41.5, 21.1],
      ["button", 67.4, 11.8],
    ],
    // A short opening at the left of the bottom, then a slot, the USB port, one small hole and the speaker.
    bottom: [
      ["tray", 6.3, 7],
      ["grille", 22.3, 10],
      ["usb-c", 38.8],
      ["grille", 56.1, 15.1],
    ],
    bottomHoles: [[46.6], 0.7],
  },
];
