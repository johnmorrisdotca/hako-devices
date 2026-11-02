// The Apple Watch cases (the head, no band), one row per body, held upright: the crown on the right edge, the picture facing you. Every number is read from Apple's dimensional drawing of that model: the Accessory
// Design Guidelines of 2020 (pages 258 to 277) for the Series 1 to 6 and the first SE, and the single-sheet drawings Apple publishes for the Series 7 to 12, the SE 3 and the Ultra. Across and down are as the case is held
// upright; across on the back runs from the left as seen from behind. Edge positions are measured down from the top of the case: the sheets give them from the case's middle (0.00), so each is half the case's height
// plus or minus the sheet's number.
//
// The size in the catalogue is the case alone: the sheets' width and height are the case without the crown, its thickness is the case without the back crystal, and the crystal's height above the case is back.rise
// (the sheet's overall thickness minus the case's). What a drawing does not dimension is named in the row: a corner radius is measured off the outline (the newer corners are not true circles: the number is the offset of
// the circle fitted to the curved part), the back's roundness and the colour of a shell are style choices, the crystal's dome is drawn as one round, and the crown's and the side button's height above the case, the band
// slots and release buttons and the microphone ports (the sheets give only their keepouts) are not drawn.
// The crown is drawn at the sheet's crown dial (7.5 mm on the Series 4 to 9 and SE 3 sheets, 7.25 on Series 10 and 11, 7.0 on Series 12): the larger circle on those sheets is the hatched keepout around it. The Series 6
// 40 mm sheet hides its corner under the glass line, so that radius is taken from the way the other 40 mm sheets fit. The Ultra sheets give no display area: its picture is the cover glass.
import type { SlabBody } from "./slab-body.ts";

export const WATCH_BODIES: readonly SlabBody[] = [
  // 2015 and 2016, Figures 40-116 and 40-117 (pages 276 and 277), 42 mm: the first generation and the Series 1 on one sheet. Case 36.44 by 42.50, 10.50 thick (the sheet's profile detail), the back crystal's flat ring at 11.39 and the dome at 12.46 overall, so 1.96 above the case. The picture is the sheet's 24.34 by 30.42, centred (measured within 0.1). Crown 7.20 across, its middle 7.78 above the case's middle; the side button runs from 0.89 to 12.09 below it. The speaker is two slots side by side, 7.35 to 11.40 above the middle; the microphone hole (8.46 to 9.70, so 1.24) is 9.05 below it. Corner radius measured. The back crystal is the sheet's 25.69 charging circle
  {
    key: "apple-watch-series-1-42-mm",
    shell: "alu",
    r: 7,
    edge: 3,
    screen: [24.34, 30.42, 6.04, 0.4],
    front: {},
    back: { lenses: [[18.22, 21.25, 12.85]], rise: 1.96 },
    right: [["round", 13.47, 7.2], ["button", 27.74, 11.2]],
    left: [["grille", 11.88, 4.05], ["jack", 30.3, 1.24]],
  },
  // 2015 and 2016, Figure 40-117 (page 277), 38 mm: case 33.27 by 38.56, 10.50 thick, ring at 11.37 and dome at 12.20 overall (1.70 above the case). Picture the sheet's 21.22 by 26.52, centred. Crown 7.20 across, its middle 7.20 above the case's middle; the button runs from 0.20 to 11.39 below it. Speaker slots 6.59 to 10.64 above the middle; the microphone hole (7.82 to 9.12, so 1.30) is 8.47 below it. Corner radius measured. The back crystal is the sheet's 23.56 charging circle
  {
    key: "apple-watch-series-1-38-mm",
    shell: "alu",
    r: 6.3,
    edge: 3,
    screen: [21.22, 26.52, 6.02, 0.4],
    front: {},
    back: { lenses: [[16.64, 19.28, 11.78]], rise: 1.7 },
    right: [["round", 12.08, 7.2], ["button", 25.08, 11.19]],
    left: [["grille", 10.67, 4.05], ["jack", 27.75, 1.3]],
  },
  // 2016, Figure 40-114 (page 274), 42 mm metal: case 36.44 by 42.50, 11.40 thick (the profile detail), the crystal's ring at 12.28 and its dome at 13.35 overall, so 1.95 above the case. Picture the sheet's 25.13 by 31.22 (the sheet draws it square), its top measured 5.68 and the centred 5.64 used. Crown 7.50 across, its middle 7.78 above the case's middle; the button runs from 0.90 to 12.07 below it. Speaker: two slots side by side, 6.44 to 9.12 above the middle; two small holes (microphone and altimeter) at 4.59 and 8.39 below it, their size (1.2) measured off the ring on the sheet. Corner radius measured. Back crystal the sheet's 25.73 charging circle. The ceramic model (page 272) is another body and is not drawn here
  {
    key: "apple-watch-series-2-42-mm",
    shell: "alu",
    r: 6.85,
    edge: 3,
    screen: [25.13, 31.22, 5.64, 0.4],
    front: {},
    back: { lenses: [[18.22, 21.25, 12.87]], rise: 1.95 },
    right: [["round", 13.47, 7.5], ["button", 27.74, 11.17]],
    left: [["grille", 13.47, 2.68], ["jack", 25.84, 1.2], ["jack", 29.64, 1.2]],
  },
  // 2016, Figure 40-115 (page 275), 38 mm metal: case 33.27 by 38.56, 11.40 thick, ring at 12.28 and dome at 13.10 overall (1.70 above the case). Picture the sheet's 22.02 by 27.32, centred (measured 5.62). Crown 7.50 across, its middle 7.20 above the case's middle; the button runs from 0.21 to 11.38 below it. Speaker slots 5.86 to 8.54 above the middle; the two holes at 3.89 and 7.69 below it (size measured, 1.2). Corner radius measured. Back crystal the sheet's 22.54 charging circle
  {
    key: "apple-watch-series-2-38-mm",
    shell: "alu",
    r: 6.3,
    edge: 3,
    screen: [22.02, 27.32, 5.62, 0.4],
    front: {},
    back: { lenses: [[16.64, 19.28, 11.27]], rise: 1.7 },
    right: [["round", 12.08, 7.5], ["button", 25.08, 11.17]],
    left: [["grille", 12.08, 2.68], ["jack", 23.17, 1.2], ["jack", 26.97, 1.2]],
  },
  // 2017, Figure 40-110 (page 270), 42 mm metal (GPS; the GPS + cellular model's crystal stands 0.25 higher, 13.60 overall, and is not drawn): the Series 2's body with a longer speaker slot (6.21 to 9.35 above the middle, so 3.14). Case 36.44 by 42.50, 11.40 thick, ring at 12.28 and dome at 13.35 overall (1.95 above the case). Picture 25.13 by 31.22 centred. Crown 7.50 across at 7.78 above the middle, button 0.90 to 12.07 below it. Holes at 4.59 and 8.39 below the middle (size measured, 1.2). Corner radius measured. Back crystal the sheet's 25.73 charging circle
  {
    key: "apple-watch-series-3-42-mm",
    shell: "alu",
    r: 6.85,
    edge: 3,
    screen: [25.13, 31.22, 5.64, 0.4],
    front: {},
    back: { lenses: [[18.22, 21.25, 12.87]], rise: 1.95 },
    right: [["round", 13.47, 7.5], ["button", 27.74, 11.17]],
    left: [["grille", 13.47, 3.14], ["jack", 25.84, 1.2], ["jack", 29.64, 1.2]],
  },
  // 2017, Figure 40-111 (page 271), 38 mm metal (GPS; the cellular model is 0.25 higher on the back, 13.35 overall, not drawn): case 33.27 by 38.56, 11.40 thick, ring at 12.28 and dome at 13.10 overall (1.70 above the case). Picture 22.02 by 27.32 centred. Crown 7.50 across at 7.20 above the middle, button 0.21 to 11.38 below it. Speaker slots 5.63 to 8.77 above the middle (3.14); holes at 3.89 and 7.69 below it (size measured, 1.2). Corner radius measured. Back crystal the sheet's 22.54 charging circle
  {
    key: "apple-watch-series-3-38-mm",
    shell: "alu",
    r: 6.3,
    edge: 3,
    screen: [22.02, 27.32, 5.62, 0.4],
    front: {},
    back: { lenses: [[16.64, 19.28, 11.27]], rise: 1.7 },
    right: [["round", 12.08, 7.5], ["button", 25.08, 11.17]],
    left: [["grille", 12.08, 3.14], ["jack", 23.17, 1.2], ["jack", 26.97, 1.2]],
  },
  // 2018, 2019 and 2020, Figures 40-106 (Series 4), 40-102 (Series 5) and 40-100 (SE), 44 mm, on pages 266, 262 and 260: the three sheets give the same number for the case (37.84 by 44.08), glass (34.79 by 41.03), picture (28.71 by 34.95), crown (9.50 across, 8.45 above the middle), button (1.33 to 12.33 below it), thickness (10.70, ring at 11.54, dome at 13.06 overall, so 2.36 above the case), speaker slots (0.57 to 7.83 above and below the middle), band release (17.34) and back crystal (26.00). The picture's top is the centred 4.57 (measured 4.5), its corner radius measured. Case corner radius measured. The mic port (a 3.00 keepout 1.60 above the middle on the crown edge) is not drawn
  {
    key: "apple-watch-series-4-44-mm",
    shell: "alu",
    r: 9,
    edge: 3,
    screen: [28.71, 34.95, 4.57, 4.9],
    front: {},
    back: { lenses: [[18.92, 22.04, 13]], rise: 2.36 },
    right: [["round", 13.59, 7.5], ["button", 28.87, 11]],
    left: [["grille", 17.84, 7.26], ["grille", 26.24, 7.26]],
  },
  // 2018, 2019 and 2020, Figures 40-107 (Series 4), 40-103 (Series 5) and 40-101 (SE), 40 mm, on pages 267, 263 and 261: the same numbers on all three (case 34.41 by 39.87, glass 31.36 by 36.82, picture 25.27 by 30.73, crown 9.50 across and 7.74 above the middle, button 0.70 to 11.70 below it, 10.70 thick, ring 11.54, dome 12.67 overall so 1.97 above the case, slots 0.57 to 7.83, band release 15.24, back crystal 22.60). Picture's top the centred 4.57, its corner radius measured. Case corner radius measured on these three sheets
  {
    key: "apple-watch-series-4-40-mm",
    shell: "alu",
    r: 8.15,
    edge: 3,
    screen: [25.27, 30.73, 4.57, 4.1],
    front: {},
    back: { lenses: [[17.21, 19.94, 11.3]], rise: 1.97 },
    right: [["round", 12.2, 7.5], ["button", 26.14, 11]],
    left: [["grille", 15.74, 7.26], ["grille", 24.14, 7.26]],
  },
  // 2020, Figure 40-98 (page 258), 44 mm: the Series 6 has the same case, glass, picture, crown and button as the Series 5 (37.84 by 44.08, 10.70 thick), but the back crystal is 26.60 across and stands higher (ring 11.54, dome 13.14 overall, so 2.44 above the case), the speaker slots are 0.58 to 7.82 and the band release is at 17.56. Picture's top the centred 4.57, its corner radius measured. Case corner radius measured. Mic port not drawn
  {
    key: "apple-watch-series-6-44-mm",
    shell: "alu",
    r: 9,
    edge: 3,
    screen: [28.71, 34.95, 4.57, 4.9],
    front: {},
    back: { lenses: [[18.92, 22.04, 13.3]], rise: 2.44 },
    right: [["round", 13.59, 7.5], ["button", 28.87, 11]],
    left: [["grille", 17.84, 7.24], ["grille", 26.24, 7.24]],
  },
  // 2020, Figure 40-99 (page 259), 40 mm: case 34.41 by 39.87 like the Series 5, 10.70 thick, back crystal 23.20 across (ring 11.54, dome 12.74 overall, so 2.04 above the case), slots 0.58 to 7.83, band release 15.46, crown 7.74 above the middle, button 0.70 to 11.70 below it. Case corner radius is not read off this sheet (its outline is hidden under the glass line at the corner): 8.2 is judged from the 8.15 that the 40 mm sheets of the Series 4, 5 and SE give for the same outline. Picture's corner radius measured on this sheet
  {
    key: "apple-watch-series-6-40-mm",
    shell: "alu",
    r: 8.2,
    edge: 3,
    screen: [25.27, 30.73, 4.57, 4.1],
    front: {},
    back: { lenses: [[17.21, 19.94, 11.6]], rise: 2.04 },
    right: [["round", 12.2, 7.5], ["button", 26.14, 11]],
    left: [["grille", 15.73, 7.25], ["grille", 24.14, 7.25]],
  },
  // 2021 to 2023, Series 7 (page 2 of apple-watch-series-7-41mm.pdf), 8 and 9 (apple-watch-series-8-41mm.pdf, apple-watch-series-9-41mm.pdf), 41 mm: the three sheets give the same numbers (case 34.77 by 40.85, glass 31.15 by 37.23, active area 27.78 by 33.86, crown dial Ø 7.50 and keepout Ø 9.50 with the crown's middle 7.96 above the case's middle, mic keepout 1.56, button -0.87 to -11.87 (middle -6.37, 11.00 long), 10.70 thick, flat ring 11.54, dome 12.74 overall so 2.04 above the case, back crystal Ø 23.20, band release 15.60, slot 7.06 to -7.05 with a divider at +-0.58) and the outlines fit the same corner radii. The picture's top is the centred 3.495. Corner radii measured (case 9.05, picture 5.45); the speaker slot is 7.06 and 7.05 less the 1.00 keepout
  {
    key: "apple-watch-series-7-41-mm",
    shell: "alu",
    r: 9.05,
    edge: 3,
    screen: [27.78, 33.86, 3.495, 5.45],
    front: {},
    back: { lenses: [[17.385, 20.425, 11.6]], rise: 2.04 },
    right: [["round", 12.465, 7.5], ["button", 26.795, 11]],
    left: [["grille", 20.42, 12.11]],
  },
  // 2021 to 2023, Series 7, 8 and 9 (apple-watch-series-7-45mm.pdf, -8-45mm.pdf, -9-45mm.pdf), 45 mm: the three sheets give the same numbers (case 38.22 by 45.08, glass 34.59 by 41.45, active area 31.20 by 38.06, crown dial Ø 7.50 (keepout Ø 9.50), the crown's middle 8.63 above the middle, mic keepout 1.60, button -1.47 to -12.47 (middle -6.97, 11.00 long), 10.70 thick, flat ring 11.54, dome 13.14 overall so 2.44 above the case, back crystal Ø 26.60, band release 17.72, slot +-7.06 with a divider at +-0.58). The crown-side view's own "10.65" (the Series 7 to 9 sheets alike) is read as the width of that view, not the case's thickness: the profile detail on all three ends at 10.70. Picture's top the centred 3.51. Corner radii measured (case 9.65, picture 6.0); the speaker slot is 7.06 less the 1.00 keepout at each end
  {
    key: "apple-watch-series-7-45-mm",
    shell: "alu",
    r: 9.65,
    edge: 3,
    screen: [31.2, 38.06, 3.51, 6],
    front: {},
    back: { lenses: [[19.11, 22.54, 13.3]], rise: 2.44 },
    right: [["round", 13.91, 7.5], ["button", 29.51, 11]],
    left: [["grille", 22.54, 12.12]],
  },
  // 2024 and 2025, Series 10 and Series 11 (apple-watch-series-10-42mm.pdf, apple-watch-series-11-42mm.pdf), 42 mm: the two sheets' drawing is the same (compared as images: they differ only in the footer's date and the title block), so the numbers are the same: case 36.44 by 42.05 (38.30 with the crown), cover glass 33.89 by 39.50, active area 29.17 by 34.79, crown dial Ø 7.25 (keepout Ø 9.25) with its middle 7.92 above the case's middle, mic port 2.20, button 0.20 to -11.72 (middle -5.76, 11.92 long), 9.70 thick (flat of back to flat of display glass), flat ring 0.67 above that, dome 11.74 overall so 2.04 above the case, dome Ø 25.39, band release 15.44. Picture's top the centred 3.63. Corner radii measured (case 10.0, picture 6.3). The speaker is two perforated pads, 2.03 wide, which the sheet does not dimension: measured off the drawing, the upper from 0.40 to 8.10 above the middle (7.70 long, middle 4.25) and the lower from 0.14 to 8.10 below it (7.96 long, middle 4.12), within 0.1
  {
    key: "apple-watch-series-10-42-mm",
    shell: "alu",
    r: 10,
    edge: 3,
    screen: [29.17, 34.79, 3.63, 6.3],
    front: {},
    back: { lenses: [[18.22, 21.025, 12.7]], rise: 2.04 },
    right: [["round", 13.105, 7.25], ["button", 26.785, 11.92]],
    left: [["grille", 16.775, 7.7], ["grille", 25.145, 7.96]],
  },
  // 2024 and 2025, Series 10 and Series 11 (apple-watch-series-10-46mm.pdf, apple-watch-series-11-46mm.pdf), 46 mm: the two sheets are the same drawing (compared as images, as at 42 mm): case 39.76 by 46.00 (41.63 with the crown), cover glass 37.21 by 43.45, active area 32.45 by 38.69, crown dial Ø 7.25 (keepout Ø 9.25), its middle 8.66 above the middle, mic port 2.46, button -0.03 to -12.46 (middle -6.24, 12.43 long), 9.70 thick, flat ring 0.84 above that, dome 12.14 overall so 2.44 above the case, dome Ø 26.60, band release 17.41. Picture's top the centred 3.655. Corner radii measured (case 11.0, picture 7.3). Speaker pads (2.03 wide) measured off the drawing: upper 0.41 to 8.08 above the middle (7.67 long, middle 4.245), lower 0.14 to 8.15 below (8.01 long, middle 4.145)
  {
    key: "apple-watch-series-10-46-mm",
    shell: "alu",
    r: 11,
    edge: 3,
    screen: [32.45, 38.69, 3.655, 7.3],
    front: {},
    back: { lenses: [[19.88, 23, 13.3]], rise: 2.44 },
    right: [["round", 14.34, 7.25], ["button", 29.245, 12.43]],
    left: [["grille", 18.755, 7.67], ["grille", 27.145, 8.01]],
  },
  // 2026, Series 12 (page 2 of apple-watch-series-12-42mm.pdf; page 3 is the ceramic case, not made here), 42 mm: case 36.95 by 42.57 (39.23 with the crown), cover glass 35.28 by 40.90, active area 29.17 by 34.79, crown dial Ø 7.00 (keepout Ø 9.25), its middle 7.55 above the middle, mic port 2.35, button 0.47 to -11.42 (middle -5.48, 11.89 long), 9.70 thick, flat ring 0.59 above that, dome 11.68 overall so 1.98 above the case, dome Ø 24.70, band release 15.63. Picture's top the centred 3.89. Corner radii measured (case 10.2, picture 6.3). Two speaker slots (0.77 wide, inside a 0.30 keepout) measured off the drawing: upper from 0.34 to 7.50 above the middle (7.16 long), lower from 0.39 to 7.45 below (7.06 long), within 0.1
  {
    key: "apple-watch-series-12-42-mm",
    shell: "alu",
    r: 10.2,
    edge: 3,
    screen: [29.17, 34.79, 3.89, 6.3],
    front: {},
    back: { lenses: [[18.475, 21.285, 12.35]], rise: 1.98 },
    right: [["round", 13.735, 7], ["button", 26.76, 11.89]],
    left: [["grille", 17.365, 7.16], ["grille", 25.205, 7.06]],
  },
  // 2026, Series 12 (page 2 of apple-watch-series-12-46mm.pdf; page 3 is the ceramic case, not made here), 46 mm: case 40.28 by 46.38 (42.55 with the crown), cover glass 38.60 by 44.84, active area 32.45 by 38.69, crown dial Ø 7.00 (keepout Ø 9.25), its middle 8.26 above the middle, mic port 2.68, button 0.41 to -12.49 (middle -6.04, 12.90 long), 9.70 thick, flat ring 0.76 above that, dome 12.08 overall so 2.38 above the case, dome Ø 26.60, band release 17.58. Picture's top the centred 3.845. Corner radii measured (case 11.25, picture 7.25). Two speaker slots measured off the drawing: upper 0.39 to 7.51 above the middle (7.12 long), lower 0.46 to 7.52 below (7.06 long)
  {
    key: "apple-watch-series-12-46-mm",
    shell: "alu",
    r: 11.25,
    edge: 3,
    screen: [32.45, 38.69, 3.845, 7.25],
    front: {},
    back: { lenses: [[20.14, 23.19, 13.3]], rise: 2.38 },
    right: [["round", 14.93, 7], ["button", 29.23, 12.9]],
    left: [["grille", 19.24, 7.12], ["grille", 27.18, 7.06]],
  },
  // 2025, SE 3 (apple-watch-se-3-40mm.pdf), 40 mm: the sheet is drawn like the Series 4 to 6 and SE sheets but its numbers are its own: case 34.41 by 39.82 (the 2020 sheets give 39.87), glass 31.36 by 36.82, active area 25.27 by 30.73, crown dial Ø 7.50 (keepout Ø 9.50), the crown's middle 7.75 above the middle, mic keepout 1.56, button -0.70 to -11.70 (middle -6.20, 11.00 long), 10.70 thick, flat ring 11.54, dome 12.67 overall so 1.97 above the case, back crystal a plain glass disc Ø 22.60, band release 15.24, slot +-7.83 with a divider at +-0.57. Picture's top the centred 4.545. Corner radii measured (case 8.2, picture 4.15); the speaker slot is 7.83 less the 1.00 keepout at each end
  {
    key: "apple-watch-se-3-40-mm",
    shell: "alu",
    r: 8.2,
    edge: 3,
    screen: [25.27, 30.73, 4.545, 4.15],
    front: {},
    back: { lenses: [[17.205, 19.91, 11.3]], rise: 1.97 },
    right: [["round", 12.16, 7.5], ["button", 26.11, 11]],
    left: [["grille", 19.91, 13.66]],
  },
  // 2025, SE 3 (apple-watch-se-3-44mm.pdf), 44 mm: case 37.84 by 44.08, glass 34.79 by 41.03, active area 28.71 by 34.95, crown dial Ø 7.50 (keepout Ø 9.50), the crown's middle 8.45 above the middle, mic keepout 1.60, button -1.33 to -12.33 (middle -6.83, 11.00 long), 10.70 thick, flat ring 11.54, dome 13.07 overall so 2.37 above the case, back crystal a plain glass disc Ø 24.87 (the 2020 sheets give 26.00), band release 17.34, slot +-7.83 with a divider at +-0.57. Picture's top the centred 4.565. Corner radii measured (case 9.05, picture 4.95: the same outline as the 2020 sheets' 44 mm); the speaker slot is 7.83 less the 1.00 keepout at each end
  {
    key: "apple-watch-se-3-44-mm",
    shell: "alu",
    r: 9.05,
    edge: 3,
    screen: [28.71, 34.95, 4.565, 4.95],
    front: {},
    back: { lenses: [[18.92, 22.04, 12.45]], rise: 2.37 },
    right: [["round", 13.59, 7.5], ["button", 28.87, 11]],
    left: [["grille", 22.04, 13.66]],
  },
  // 2022, Ultra (apple-watch-ultra.pdf), 49 mm: titanium case with a flat cover glass. The sheet gives the case's face as 38.42 by 45.70 (the bottom and side views; its front outline is 3.4 mm taller, 49.14 with the band horns, and 43.32 wide with the crown guard (3.17 out, 27.62 tall) and the Action button, none of which is drawn here), 10.62 thick (the bottom view), the dome's flat ring 12.00 and its apex 14.44 overall so 3.82 above the case, dome Ø 27.30, a back crystal plate 36.80 by 44.07 (its height not given, not drawn), band release 19.48. The sheet has no display active area: the picture is the cover glass, 35.79 by 43.07, so it is larger than the lit picture; its top is the centred 1.315. Corner radii measured (case face 11.2, cover glass 9.9). Crown Ø 9.70 ("crown diameter"), its middle 6.43 above the case's middle (measured, symmetric about 6.43 on the sheet), side button from -2.19 to -12.45 (10.26 long, middle -7.32, measured). Left edge, all measured off the drawing: microphone 17.5 above the middle (about 1.2), the speaker's round holes cover 5.1 to 11.7 above (middle 8.4), the Action button's pill 11.3 long from +1.48 to -9.81 (middle -4.165), the siren 13.9 below (about 1.65)
  {
    key: "apple-watch-ultra-49-mm",
    shell: "shell-titanium",
    r: 11.2,
    edge: 3,
    screen: [35.79, 43.07, 1.315, 9.9],
    front: {},
    back: { lenses: [[19.21, 22.85, 13.65]], rise: 3.82 },
    right: [["round", 16.42, 9.7], ["button", 30.17, 10.26]],
    left: [["jack", 5.35, 1.2], ["grille", 14.45, 6.7], ["button", 27.0, 11.3], ["jack", 36.75, 1.65]],
  },
  // 2023 and 2025, Ultra 2 (apple-watch-ultra-2.pdf) and Ultra 3 (apple-watch-ultra-3.pdf), 49 mm: the Ultra's case (38.42 by 45.70 face, 10.62 thick, dome 14.44 overall so 3.82 above the case, dome Ø 27.30, cover glass 35.79 by 43.07, band release 19.48) with the crown's diameter now 9.42, its middle still 6.43 above the middle, the side button the same (-2.19 to -12.44, middle -7.32); the left edge is at the same places. The Ultra 3 sheet's page 3 is the Ultra 2's exactly and its page 2 differs only in the notes and an "antenna split" callout, so one row. As on the Ultra, the picture is the cover glass (the sheets give no display active area), the corner radii measured (case face 11.25, cover glass 9.9)
  {
    key: "apple-watch-ultra-2-49-mm",
    shell: "shell-titanium",
    r: 11.25,
    edge: 3,
    screen: [35.79, 43.07, 1.315, 9.9],
    front: {},
    back: { lenses: [[19.21, 22.85, 13.65]], rise: 3.82 },
    right: [["round", 16.42, 9.42], ["button", 30.17, 10.25]],
    left: [["jack", 5.35, 1.2], ["grille", 14.45, 6.7], ["button", 27.0, 11.3], ["jack", 36.75, 1.65]],
  },
  // 2026, Ultra 4 (apple-watch-ultra-4.pdf), 49 mm: the Ultra 3's numbers on page 2 (all labels and every position and corner measured the same as the Ultra 2 and 3) with a different back (a spoked sensor ring on the dome, 32 sensors) and a changed page 3 (the profile tables, not read here), so a row of its own. The picture is the cover glass (no display active area on the sheet)
  {
    key: "apple-watch-ultra-4-49-mm",
    shell: "shell-titanium",
    r: 11.25,
    edge: 3,
    screen: [35.79, 43.07, 1.315, 9.9],
    front: {},
    back: { lenses: [[19.21, 22.85, 13.65]], rise: 3.82 },
    right: [["round", 16.42, 9.42], ["button", 30.17, 10.25]],
    left: [["jack", 5.35, 1.2], ["grille", 14.45, 6.7], ["button", 27.0, 11.3], ["jack", 36.75, 1.65]],
  },
];
