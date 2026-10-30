// Where the camera stands for a device's 3D view when it first shows, and so where its drawing is drawn from: one rule for both, so the drawing turns into the
// 3D view without a jump. A front three-quarter view; a flat board seen from higher up, and a device with a screen looked at a little towards the screen so its
// words can be read. Pure, in any unit.

export type Vec3 = [number, number, number];

/** The camera's field of view, in degrees, top to bottom. */
export const FOV_DEG = 30;

export interface Framing {
  target: Vec3;
  position: Vec3;
  distance: number;
}

/** The camera for a device whose bounds are `min` to `max`, its screen (if it has one) centred at `screen`, on a picture `aspect` wide for 1 tall. */
export function frameFor(min: Vec3, max: Vec3, screen: Vec3 | null, aspect: number): Framing {
  const size: Vec3 = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const centre: Vec3 = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const radius = Math.hypot(...size) / 2;
  const flat = size[1] < 0.35 * Math.max(size[0], size[2]);
  let target: Vec3 = [centre[0], flat ? min[1] + size[1] * 0.35 : centre[1], centre[2]];
  if (screen && flat) target = target.map((v, i) => v + (screen[i] - v) * 0.25) as Vec3;
  const fov = (FOV_DEG * Math.PI) / 180;
  const fit = Math.min(1, aspect);
  const factor = flat ? 0.98 : screen ? 1.02 : 1;
  const distance = ((radius / Math.sin(fov / 2)) * factor) / Math.sqrt(fit);
  const polar = ((flat ? (screen ? 36 : 46) : 68) * Math.PI) / 180;
  const azimuth = ((screen ? 18 : 32) * Math.PI) / 180;
  const direction: Vec3 = [Math.sin(polar) * Math.sin(azimuth), Math.cos(polar), Math.sin(polar) * Math.cos(azimuth)];
  return { target, position: target.map((v, i) => v + direction[i] * distance) as Vec3, distance };
}
