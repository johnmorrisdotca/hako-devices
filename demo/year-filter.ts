// The gallery's date filter, as one small control: two boxes, a first and a last year. It owns its markup and says what its boxes hold; the page keeps the choice and decides what it narrows.
import { readYear } from "./gallery-model.ts";

const yearBox = (label: string, id: string, hint: number | null, onChange: () => void) => {
  const input = document.createElement("input");
  input.type = "number";
  input.inputMode = "numeric";
  input.placeholder = hint === null ? "" : String(hint);
  input.dataset.testid = id;
  input.addEventListener("input", onChange);
  const wrap = document.createElement("label");
  wrap.className = "year-box";
  wrap.append(`${label} `, input);
  return { wrap, input };
};

export interface YearLimits {
  from: number | null;
  to: number | null;
}

export interface YearFilter {
  node: HTMLElement;
  /** What the boxes say. A box half typed is no limit yet. */
  range(): YearLimits;
  /** Shows what the address holds. The box being typed in keeps its digits while they still mean that. */
  show(limits: YearLimits): void;
}

export function yearFilter(span: { from: number; to: number } | null, onChange: () => void): YearFilter {
  const from = yearBox("From year", "year-from", span?.from ?? null, onChange);
  const to = yearBox("To year", "year-to", span?.to ?? null, onChange);
  const node = document.createElement("div");
  node.className = "year-filter";
  node.dataset.testid = "year-filter";
  node.setAttribute("role", "group");
  node.setAttribute("aria-label", "Year it came out");
  node.append(from.wrap, to.wrap);
  const put = (input: HTMLInputElement, year: number | null) => {
    if (document.activeElement === input && readYear(input.value) === year) return;
    input.value = year === null ? "" : String(year);
  };
  return {
    node,
    range: () => ({ from: readYear(from.input.value), to: readYear(to.input.value) }),
    show(limits) {
      put(from.input, limits.from);
      put(to.input, limits.to);
    },
  };
}
