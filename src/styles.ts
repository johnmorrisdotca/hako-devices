// The styles the drawings are made in, each one small table of settings: every device and every part is made in each. The same solids from the same camera, so a new
// style is one more entry here and nothing else. Pure: it works on a drawing's text.

export interface DrawingStyle {
  /** The colour of its lines, in place of the drawings' own #8fa1b8. */
  line: string;
  /** How much heavier an outline is (a line from 1.6 to 2.4). */
  outline: number;
  /** How much heavier any finer line is. */
  detail: number;
  /** A fill to put in place of another, by colour. */
  fills: Readonly<Record<string, string>>;
  /** "fine": a screen shows its small picture as it is. "big": a hero and three tiles in brighter colours. */
  pictures: "fine" | "big";
  /** The line round the glass of an Android tablet or phone, and the colour of its edge, or null: then only its small round camera tells it apart. */
  androidEdge: string | null;
  androidShell: string | null;
  /** When set, a client also gets a <key>-small.svg with lines this much heavier, for where it is about 48 px wide. */
  small: number | null;
}

export const STYLES = {
  thin: {
    line: "#8fa1b8",
    outline: 1,
    detail: 1,
    fills: {},
    pictures: "fine",
    androidEdge: null,
    androidShell: null,
    small: 2.6,
  },
  thick: {
    line: "#b4c2d4",
    outline: 3.5,
    detail: 1.8,
    fills: {},
    pictures: "big",
    androidEdge: "#4ade80",
    androidShell: "#2f7a55",
    small: null,
  },
} as const satisfies Record<string, DrawingStyle>;

export type StyleName = keyof typeof STYLES;
/** The style a drawing is in when none is named. */
export const DEFAULT_STYLE: StyleName = "thin";
export const STYLE_NAMES = Object.keys(STYLES) as StyleName[];

/** A value from outside as a style's name: the default for anything else. */
export const cleanStyle = (value: unknown): StyleName => (typeof value === "string" && Object.hasOwn(STYLES, value) ? (value as StyleName) : DEFAULT_STYLE);

/** The file of a device's drawing in a style: `pi4.svg` in the default style, `pi4.thick.svg` in another. */
export const drawingFile = (key: string, style: StyleName = DEFAULT_STYLE): string => (style === DEFAULT_STYLE ? `${key}.svg` : `${key}.${style}.svg`);

const OWN_LINE = "#8fa1b8";
// an outline is a line this wide; anything wider is a drawn shape (a handle, a row of lattice dots) and keeps its width in every style
const OUTLINE = [1.6, 2.4];
const n = (v: number) => (Math.round(v * 10) / 10).toString();

/** A drawing's text in a style: its line colour and weights, its fills. The shapes are not touched. */
export function inStyle(svg: string, style: DrawingStyle): string {
  let out = svg.replace(/stroke-width="([\d.]+)"/g, (whole, width: string) => {
    const w = Number(width);
    const factor = w > OUTLINE[1] ? 1 : w >= OUTLINE[0] ? style.outline : style.detail;
    return factor === 1 ? whole : `stroke-width="${n(w * factor)}"`;
  });
  if (style.line !== OWN_LINE) out = out.replaceAll(`stroke="${OWN_LINE}"`, `stroke="${style.line}"`);
  for (const [from, to] of Object.entries(style.fills)) out = out.replaceAll(`fill="${from}"`, `fill="${to}"`);
  return out;
}

/** The same drawing with every line `factor` heavier. */
export const withHeavierLine = (svg: string, factor: number): string =>
  svg.replace(/stroke-width="([\d.]+)"/g, (_, width: string) => `stroke-width="${n(Number(width) * factor)}"`);
