// The colours a machine came in: `@johnmorrisdotca/hako-devices/colours`. Each is the maker's own word with the page that says so; the table is its own entry point because it is large, and a page
// that only draws a device never loads it. A machine with no colours here is one nobody has checked yet, never one with no colours.
import { COLOUR_DATA, COLOUR_PAGES } from "./colour-data.ts";

export interface Swatch {
  /** "#rrggbb". */
  value: string;
  /**
   * How it is known. `page`: a page gives this value (`source`). `drawing`: the colour of this machine's own drawing. `word`: only the plain colour word in the maker's name, such as the blue of
   * "Sierra Blue": an approximation for a small chip, not the maker's paint.
   */
  from: "page" | "drawing" | "word";
  /** The page, for `page`. */
  source: string | null;
}

export interface MachineColour {
  /** The maker's name for it. */
  name: string;
  /** The pages that say this machine came in this colour. */
  sources: readonly string[];
  /** A colour for a chip, or null when nothing says what it looks like. */
  swatch: Swatch | null;
  /** The key of the device drawn in this colour, or null: it has no drawing of its own. */
  drawing: string | null;
}

/** Plain colour words and a colour for a chip. These are the words, not any maker's paint. */
const WORDS: Readonly<Record<string, string>> = {
  black: "#1c1c1e",
  white: "#f2f2ee",
  gray: "#8a8d91",
  grey: "#8a8d91",
  silver: "#c9cdd3",
  platinum: "#d5d5d0",
  gold: "#c8a96a",
  red: "#c0392b",
  orange: "#e07b39",
  yellow: "#e8c547",
  green: "#4f9d69",
  blue: "#3f7fbf",
  purple: "#8e6bb5",
  pink: "#e8a0b4",
  brown: "#7a5a3c",
  beige: "#d6c8ad",
  teal: "#2f8f8f",
  navy: "#24345a",
};

/** The chip for a name that holds a plain colour word: its last one, as in "Sierra Blue". Null for a name with none ("Midnight") and for two colours in one name ("Black & Slate"). */
export function wordSwatch(name: string): string | null {
  if (/[&/]| and /.test(name)) return null;
  const words = name.toLowerCase().split(/[^a-z]+/).filter((word) => Object.hasOwn(WORDS, word));
  return words.length ? WORDS[words[words.length - 1]] : null;
}

const swatchOf = (name: string, value?: string, page?: number, drawing?: string): Swatch | null => {
  if (value) return page !== undefined ? { value, from: "page", source: COLOUR_PAGES[page] } : drawing ? { value, from: "drawing", source: null } : null;
  const word = wordSwatch(name);
  return word ? { value: word, from: "word", source: null } : null;
};

const NONE: readonly MachineColour[] = [];

/** The colours this machine came in. An empty list means nobody has checked yet. */
export function coloursOf(key: string): readonly MachineColour[] {
  if (!Object.hasOwn(COLOUR_DATA, key)) return NONE;
  return COLOUR_DATA[key].map(({ name, pages, swatch, swatchPage, drawing }) => ({
    name,
    sources: pages.map((page) => COLOUR_PAGES[page]),
    swatch: swatchOf(name, swatch, swatchPage, drawing),
    drawing: drawing ?? null,
  }));
}

/** The machines whose colours somebody has checked. */
export function colouredKeys(): readonly string[] {
  return Object.keys(COLOUR_DATA);
}
