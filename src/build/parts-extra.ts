// The drives, on their own: plain shapes from the standard's sizes, no label.
import { box, type Box, cyl, rbox } from "./kit.ts";

/** A 3.5-inch hard drive: 101.6 by 147 by 26.1 mm, a steel lid on a dark casting, a green board underneath. */
export function hdd35(m: Box) {
  const W = 101.6;
  const D = 147;
  m.add("alu-dark", rbox(W, 22, D, 1, 1), [0, 12, 0]);
  m.add("steel", box(W - 4, 0.6, D - 6), [0, 23.3, 0]);
  m.add("pcb-green", box(W - 8, 1.4, 90), [0, 0.7, 24]);
  m.add("plastic-black", box(40, 7, 4), [8, 6, D / 2 - 1.4]);
  for (const [x, z] of [
    [-40, -60],
    [40, -60],
    [-40, 0],
    [40, 0],
    [-40, 60],
    [40, 60],
  ])
    m.add("steel", cyl(2.4, 0.5, 12), [x, 23.7, z]);
  m.printFace("lid", [0, 23.66, 0], [-90, 0, 0], 70, 14);
}

/** A 2.5-inch solid state drive: 69.9 by 100 by 7 mm, a plain dark shell. */
export function ssd25(m: Box) {
  m.add("plastic-char", rbox(69.9, 7, 100, 1.2, 2), [0, 3.5, 0]);
  m.add("plastic-black", box(34, 3, 1), [8, 3.5, 50.1]);
  m.printFace("lid", [0, 7.04, 0], [-90, 0, 0], 50, 10);
}
