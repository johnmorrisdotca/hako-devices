// A group's picture: a few of its machines in a bunch, the front one largest. Only where each goes: any page can lay out its own pictures with this.

export interface GroupPlace {
  /** The middle of the picture, as a percentage of the group's box. */
  x: number;
  y: number;
  /** Its width, as a percentage of the group's box. */
  width: number;
  /** Degrees. */
  rotate: number;
  /** Larger is in front. */
  order: number;
}

const FAN: readonly GroupPlace[] = [
  { x: 50, y: 58, width: 66, rotate: 0, order: 4 },
  { x: 26, y: 40, width: 50, rotate: -7, order: 2 },
  { x: 74, y: 40, width: 50, rotate: 7, order: 3 },
  { x: 50, y: 26, width: 44, rotate: 0, order: 1 },
];

/** Where each of `count` pictures goes, the first in front. At most four are used; one sits alone in the middle. */
export function groupLayout(count: number): readonly GroupPlace[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 50, y: 50, width: 80, rotate: 0, order: 1 }];
  return FAN.slice(0, Math.min(count, FAN.length));
}

/** A few that show a group's range: the first, the last and two between, with no repeats. */
export function groupSample<T>(items: readonly T[], count = 4): T[] {
  const unique = [...new Set(items)];
  if (unique.length <= count) return unique;
  return Array.from({ length: count }, (_, i) => unique[Math.round((i * (unique.length - 1)) / (count - 1))]);
}
