// The gallery's date filter, as one small control: two boxes, a first and a last year. It owns its markup and says only whether a machine passes, so a gallery of any shape can mount it.
import { inYears, type YearRange } from "../src/tags.ts";

const yearBox = (label: string, id: string, hint: number, onChange: () => void) => {
  const input = document.createElement("input");
  input.type = "number";
  input.inputMode = "numeric";
  input.placeholder = String(hint);
  input.dataset.testid = id;
  input.addEventListener("input", onChange);
  const wrap = document.createElement("label");
  wrap.className = "year-box";
  wrap.append(`${label} `, input);
  return { wrap, input };
};

export interface YearFilter {
  node: HTMLElement;
  /** Whether a year is set, so the page knows the list is narrowed. */
  active(): boolean;
  passes(key: string): boolean;
}

export function yearFilter(span: { from: number; to: number } | null, onChange: () => void): YearFilter {
  const from = yearBox("From year", "year-from", span?.from ?? 0, onChange);
  const to = yearBox("To year", "year-to", span?.to ?? 0, onChange);
  const node = document.createElement("div");
  node.className = "year-filter";
  node.dataset.testid = "year-filter";
  node.append(from.wrap, to.wrap);
  const read = (input: HTMLInputElement): number | null => (input.value === "" ? null : Number(input.value));
  const range = (): YearRange => ({ from: read(from.input), to: read(to.input) });
  return { node, active: () => from.input.value !== "" || to.input.value !== "", passes: (key) => inYears(key, range()) };
}
