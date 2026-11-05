// Every phone and tablet that is a row of numbers.
import { GALAXY_BODIES } from "./galaxy-bodies.ts";
import { MOTOROLA_BODIES } from "./motorola-bodies.ts";
import { IPAD_BODIES } from "./ipad-bodies.ts";
import { IPOD_BODIES } from "./ipod-bodies.ts";
import { WATCH_BODIES } from "./watch-bodies.ts";
import { IPHONE_BODIES } from "./iphone-bodies.ts";
import type { SlabBody } from "./slab-body.ts";

export const SLAB_BODIES: readonly SlabBody[] = [...IPHONE_BODIES, ...IPAD_BODIES, ...IPOD_BODIES, ...WATCH_BODIES, ...GALAXY_BODIES, ...MOTOROLA_BODIES];
