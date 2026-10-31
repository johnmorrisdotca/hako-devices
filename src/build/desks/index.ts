// The machines described as data, by their catalogue keys.
import type { DeskSpec } from "../desk.ts";
import * as I from "./imacs.ts";
import * as M from "./minis.ts";
import { NEXT_CUBE, NEXT_DISPLAY, NEXT_STATION } from "./next.ts";
import * as T from "./towers.ts";

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
  "mac-pro-mid-2006": T.MAC_PRO_TOWER,
  "mac-pro-late-2013": T.MAC_PRO_CYLINDER,
  "mac-pro-2019": T.MAC_PRO_2019,
  "mac-pro": T.MAC_PRO_2023,
  "mac-pro-rack-2019": T.MAC_PRO_RACK_2019,
  "mac-pro-rack-2023": T.MAC_PRO_RACK_2023,
  "power-mac-g5-2003": T.POWER_MAC_G5,
  "mac-studio": M.MAC_STUDIO,
  "mac-mini": M.MAC_MINI_2024,
  "mac-mini-m1": M.MAC_MINI_M1,
  "mac-mini-2023-m2-pro": M.MAC_MINI_M2_PRO,
  "mac-mini-2018": M.MAC_MINI_2018,
  "mac-mini-late-2014": M.MAC_MINI_2014,
  "mac-mini-mid-2011": M.MAC_MINI_2011,
  "mac-mini-mid-2010": M.MAC_MINI_2010,
  "mac-mini-early-2009": M.MAC_MINI_2009,
  "mac-mini-early-2006": M.MAC_MINI_INTEL,
  "mac-mini-original": M.MAC_MINI_G4,
};
