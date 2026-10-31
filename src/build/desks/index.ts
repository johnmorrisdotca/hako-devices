// The machines described as data, by their catalogue keys.
import type { DeskSpec } from "../desk.ts";
import * as I from "./imacs.ts";
import { NEXT_CUBE, NEXT_DISPLAY, NEXT_STATION } from "./next.ts";

export const DESKS: Readonly<Record<string, DeskSpec>> = {
  nextcube: NEXT_CUBE,
  nextstation: NEXT_STATION,
  "next-megapixel-display": NEXT_DISPLAY,
  "imac-1998": I.IMAC_G3_TRAY,
  "imac-slot-loading": I.IMAC_G3_SLOT,
  "imac-flat-panel-15-inch": I.IMAC_G4_15,
  "imac-flat-panel-17-inch": I.IMAC_G4_17,
  "imac-usb-2-0-20-inch": I.IMAC_G4_20,
  "imac-g5-2004-17-inch": I.IMAC_G5_17,
  "imac-g5-2004-20-inch": I.IMAC_G5_20,
  "imac-g5-isight-17-inch": I.IMAC_INTEL_17,
  "imac-g5-isight-20-inch": I.IMAC_INTEL_20,
  "imac-late-2006-24-inch": I.IMAC_INTEL_24,
  "imac-mid-2007-20-inch": I.IMAC_ALU_20,
  "imac-mid-2007-24-inch": I.IMAC_ALU_24,
  "imac-21-5-inch-late-2009": I.IMAC_UNI_21,
  "imac-27-inch-late-2009": I.IMAC_UNI_27,
  "imac-21-5-inch-late-2012": I.IMAC_THIN_21,
  "imac-27-inch-late-2012": I.IMAC_THIN_27,
  "imac-pro-2017": I.IMAC_PRO,
  "imac-24": I.IMAC_24_FOUR,
  "imac-24-two-ports": I.IMAC_24_TWO,
};
