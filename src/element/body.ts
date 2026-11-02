// Which of a mesh's materials is its body, for a colour shown on a mesh with no drawing of that colour. Pure, so a test needs no three.js. A finish is the same shape with another shell material, so this
// changes the same thing and nothing else: lights, glass, screens, keys and trim stay as drawn.
const BODY = /^(alu|alu-dark|shell-.+|plastic-.+|case-.+)$/;

/** The body among these materials: the largest surface of those that can be one. Null when none can: a bare board has no body to colour. */
export function bodyMaterial(areas: ReadonlyMap<string, number>): string | null {
  let best: string | null = null;
  let most = 0;
  for (const [name, area] of areas) {
    if (BODY.test(name) && area > most) {
      best = name;
      most = area;
    }
  }
  return best;
}

/** A value for the `body-colour` attribute, or null: anything but #rrggbb is ignored. */
export const bodyColourValue = (value: string | null): string | null => (value && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null);
