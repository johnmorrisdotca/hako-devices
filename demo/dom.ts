// The demo's small helpers: find a node, make a node, and let the arrow keys walk a row of buttons.

export const byId = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`no #${id}`);
  return node as T;
};

export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
};

const inView = (node: HTMLElement) => !node.hidden && node.offsetParent !== null;

/** The next button in a direction, by where the buttons are drawn: a column, a row, a grid and chips that wrap all work. */
function stepFrom(list: readonly HTMLElement[], at: number, key: string): HTMLElement | undefined {
  if (key === "Home") return list[0];
  if (key === "End") return list[list.length - 1];
  const from = list[at];
  const top = from.offsetTop;
  const sideways = key === "ArrowLeft" || key === "ArrowRight";
  const onOneLine = list.every((node) => node.offsetTop === top);
  const onOneColumn = list.every((node) => node.offsetLeft === from.offsetLeft);
  if (sideways || onOneLine) return list[at + (key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1)];
  if (onOneColumn) return list[at + (key === "ArrowUp" ? -1 : 1)];
  const direction = key === "ArrowUp" ? -1 : 1;
  let line: number | null = null;
  let best: HTMLElement | undefined;
  for (let i = at + direction; i >= 0 && i < list.length; i += direction) {
    const node = list[i];
    if (node.offsetTop === top) continue;
    line ??= node.offsetTop;
    if (node.offsetTop !== line) break;
    if (!best || Math.abs(node.offsetLeft - from.offsetLeft) < Math.abs(best.offsetLeft - from.offsetLeft)) best = node;
  }
  return best;
}

/** Brings a node into a list's own view by scrolling that list only, never the page. */
export function scrollWithin(box: HTMLElement, node: HTMLElement): void {
  const outer = box.getBoundingClientRect();
  const inner = node.getBoundingClientRect();
  if (inner.top < outer.top) box.scrollTop -= outer.top - inner.top;
  else if (inner.bottom > outer.bottom) box.scrollTop += inner.bottom - outer.bottom;
  if (inner.left < outer.left) box.scrollLeft -= outer.left - inner.left;
  else if (inner.right > outer.right) box.scrollLeft += inner.right - outer.right;
}

/** One Tab stop for a whole row of buttons, and the arrows, Home and End to walk it. Returns what to call when its buttons change. */
export function rove(box: HTMLElement): () => void {
  const buttons = () => [...box.querySelectorAll<HTMLElement>("button")].filter(inView);
  const mark = (chosen: HTMLElement | undefined) => {
    for (const button of box.querySelectorAll<HTMLElement>("button")) button.tabIndex = button === chosen ? 0 : -1;
  };
  box.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const list = buttons();
    const at = list.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    const next = stepFrom(list, at, event.key);
    event.preventDefault();
    if (!next) return;
    mark(next);
    next.focus();
    next.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
  box.addEventListener("focusin", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    if (button) mark(button);
  });
  return () => {
    const list = buttons();
    const focused = list.find((button) => button === document.activeElement);
    mark(focused ?? list.find((button) => button.getAttribute("aria-pressed") === "true") ?? list[0]);
  };
}
