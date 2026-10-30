// The change from a device's drawing to its 3D view: the drawing stays a moment even when the 3D view is ready sooner, then the one becomes the other in a slow
// crossfade; under reduced motion, a plain short fade. Pure: the timings, and how long to wait.

/** The drawing stays at least this long after it first comes on screen. */
export const DRAWING_HOLD_MS = 1200;
/** How long the crossfade lasts. */
export const CROSSFADE_MS = 1500;
/** The plain fade under prefers-reduced-motion. */
export const REDUCED_FADE_MS = 400;

/** How long to wait, once the 3D view is ready at `readyAt`, before it takes over from a drawing first seen at `shownAt` (0 under reduced motion). */
export function revealDelay(shownAt: number, readyAt: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return Math.max(0, Math.min(DRAWING_HOLD_MS, shownAt + DRAWING_HOLD_MS - readyAt));
}
