// Which of a mesh's materials is its body, for a colour shown on a mesh with no drawing of that colour. Pure, so a test needs no three.js. A finish is the same shape with another shell material, so this
// changes the same thing and nothing else: lights, glass, screens, keys and trim stay as drawn.
const PLAIN = /^(alu|alu-dark|plastic-(white|black|char|gloss|grey|platinum|beige)|case-.+)$/;
const COLOURED = /^(shell-.+|plastic-.+)$/;

/**
 * The body among these materials: the largest surface of those in a colour of their own, else the largest plain one. A colour outranks size: the Bondi blue of an iMac is its colour, though the white
 * under it is the larger surface. Null when none can be a body: a bare board has none to colour.
 */
export function bodyMaterial(areas: ReadonlyMap<string, number>): string | null {
  const largest = (fits: (name: string) => boolean): string | null => {
    let best: string | null = null;
    let most = 0;
    for (const [name, area] of areas) {
      if (fits(name) && area > most) {
        best = name;
        most = area;
      }
    }
    return best;
  };
  return largest((name) => COLOURED.test(name) && !PLAIN.test(name)) ?? largest((name) => PLAIN.test(name));
}

/** A value for the `body-colour` attribute, or null: anything but #rrggbb is ignored. */
export const bodyColourValue = (value: string | null): string | null => (value && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null);
