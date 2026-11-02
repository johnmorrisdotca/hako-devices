// The picker: clicks in a row. A kind on the left, a family above the machines, a machine: nothing folds, and each list scrolls inside itself so the page never does.
import { catalogueCounts, deviceByKey, groupLayout, groupSample, meshOf, STYLE_NAMES, type StyleName } from "../src/index.ts";
import { FACETS, facetCounts, facetOrder, type FacetId, type Picks } from "../src/tags.ts";
import { applyParams, createAddressState } from "@johnmorrisdotca/kazoku-ui/address-state";
import { byId, el, rove, scrollWithin } from "./dom.ts";
import { allItems, countByKind, drawingKey, facetParam, familiesOf, featuredItems, filtersOn, type Item, isNarrowed, itemById, type Kind, KINDS, offeredItems, pickedItems, readPicks, readYears, realSize, type Show, START, YEAR_FROM, YEAR_TO, yearHints, yearItems, yearsSet } from "./gallery-model.ts";
import { yearFilter } from "./year-filter.ts";

/** Machines are drawn this many at a time, more as the list is scrolled: the whole list is 2,300. */
const PAGE = 80;
export type GalleryStyle = StyleName | "both";

export interface GalleryHooks {
  /** A machine was chosen: the address is already on it. */
  onChoose(): void;
  onStyle(style: GalleryStyle): void;
}

const address = createAddressState({ defaults: { show: "built", style: "thin", pane: "kinds", facet: "maker" } });

const fileOf = (key: string, style: StyleName, folder = "") => `assets/${folder}${key}${style === "thin" ? "" : `.${style}`}.svg`;
function drawingImg(key: string, style: StyleName, label: string, folder = "") {
  const img = el("img", { src: fileOf(key, style, folder), alt: label, loading: "lazy", decoding: "async", width: 320, height: 220 });
  img.dataset.style = style;
  return img;
}

export function createGallery(hooks: GalleryHooks) {
  const search = byId<HTMLInputElement>("gallery-search");
  const railBox = byId("gallery-rail");
  const stepsBox = byId("gallery-steps");
  const scroller = byId("gallery-scroll");
  const grid = byId("gallery-tiles");
  const end = byId("gallery-end");
  const countNode = byId("gallery-count");
  const filterRow = byId("gallery-filter");
  const styleRow = byId("gallery-style");
  const kindsTab = byId("gallery-kinds");
  const filtersTab = byId("gallery-filters");
  const refreshRail = rove(railBox);
  const refreshSteps = rove(stepsBox);
  const refreshTiles = rove(grid);

  /** The machine on show, and the one the address names: a first visit shows one and names none. */
  let currentId: string | null = null;
  let namedId: string | null = null;
  let rows = new Map<string, HTMLButtonElement>();
  let rowsStyle = "";
  let list: readonly Item[] = [];
  let drawn = 0;
  let tileNodes = new Map<string, HTMLElement>();

  const show = () => address.get("show") as Show;
  const style = () => address.get("style") as GalleryStyle;
  const artStyle = (): StyleName => (style() === "both" ? "thin" : (style() as StyleName));
  const pane = () => address.get("pane") as "kinds" | "filters";
  const facet = () => address.get("facet") as FacetId;
  const text = () => address.get("q") ?? "";
  const picks = (): Picks => readPicks((name) => address.get(name));
  const yearsNow = () => readYears((name) => address.get(name));
  const narrowedNow = () => isNarrowed(text(), picks(), yearsNow());

  /** The kind in use: the one chosen, else everything when something narrows it, else the home of the machine the address names, else the first row. */
  function kindNow(): string {
    const asked = address.get("kind");
    if (asked) return asked;
    if (narrowedNow()) return START;
    return namedId ? (itemById(namedId)?.kind ?? START) : START;
  }
  function familyNow(): string | null {
    const asked = address.get("family");
    if (asked) return asked;
    if (address.get("kind") || narrowedNow() || !namedId) return null;
    return itemById(namedId)?.family ?? null;
  }
  /** A step along the row is a step for Back: it gets a history entry, where a search or a filter only changes the address. */
  function go(changes: Record<string, string | null>, hash = location.hash) {
    address.flush();
    history.pushState(history.state, "", `${location.pathname}${applyParams(location.search, changes)}${hash}`);
    render();
  }

  // ----------------------------------------------------------- the kinds
  function kindArt(pictures: readonly string[]) {
    const art = el("span", { className: "group-art" });
    const chosen = groupSample(pictures);
    groupLayout(chosen.length).forEach((place, i) => {
      const img = el("img", { src: chosen[i], alt: "", loading: "lazy", decoding: "async", width: 320, height: 220 });
      img.style.cssText = `left:${place.x}%;top:${place.y}%;width:${place.width}%;z-index:${place.order};transform:translate(-50%,-50%) rotate(${place.rotate}deg)`;
      art.append(img);
    });
    return art;
  }
  const picturesOf = (items: readonly Item[]) => {
    const drawings = items.map((item) => (item.part ? fileOf(item.key, artStyle(), "parts/") : drawingKey(item) ? fileOf(drawingKey(item) as string, artStyle()) : null)).filter((file): file is string => file !== null);
    return drawings.length ? drawings : ["assets/coming-soon.svg"];
  };
  function kindRow(id: string, title: string, pictures: readonly string[]) {
    const count = el("span", { className: "tile-size" });
    const label = el("span", { className: "tile-name", textContent: title });
    const node = el("button", { type: "button", className: "group-card" }, kindArt(pictures), el("span", { className: "group-words" }, label, count));
    node.dataset.testid = "gallery-card";
    node.dataset.group = id;
    node.addEventListener("click", () => go({ kind: id, family: null }));
    return node;
  }
  function buildRows() {
    rows = new Map();
    railBox.replaceChildren();
    const start = kindRow(START, "Start here", picturesOf(featuredItems()));
    rows.set(START, start);
    railBox.append(start);
    for (const kind of KINDS) {
      const members = allItems().filter((item) => item.kind === kind.id);
      const node = kindRow(kind.id, kind.title, picturesOf(members));
      if (kind.shelf) node.dataset.shelf = kind.shelf;
      rows.set(kind.id, node);
      railBox.append(node);
    }
    rowsStyle = artStyle();
  }
  function renderKinds(shown: readonly Item[], everything: boolean) {
    if (rowsStyle !== artStyle()) buildRows();
    const counts = countByKind(shown);
    const start = rows.get(START) as HTMLButtonElement;
    const name = start.querySelector(".tile-name") as HTMLElement;
    const size = start.querySelector(".tile-size") as HTMLElement;
    name.textContent = everything ? "Everything" : "Start here";
    size.textContent = String(everything ? shown.length : featuredItems().length);
    const now = kindNow();
    start.setAttribute("aria-pressed", String(now === START));
    for (const kind of KINDS as readonly Kind[]) {
      const node = rows.get(kind.id) as HTMLButtonElement;
      const count = counts.get(kind.id) ?? 0;
      node.hidden = count === 0;
      node.dataset.count = String(count);
      (node.querySelector(".tile-size") as HTMLElement).textContent = String(count);
      node.setAttribute("aria-pressed", String(now === kind.id));
    }
    refreshRail();
    const pressed = rows.get(now);
    if (pressed && !railBox.contains(document.activeElement)) scrollWithin(railBox, pressed);
  }

  // ----------------------------------------------------------- the filters: a fact on the left, its values above the machines
  function renderFacetRows(counts: ReturnType<typeof facetCounts>) {
    const chosen = picks();
    railBox.replaceChildren();
    for (const { id, title } of FACETS) {
      const values = facetOrder(id, counts[id]);
      if (values.length === 0) continue;
      const on = chosen[id] ?? [];
      const node = el("button", { type: "button", className: "group-card facet-row" }, el("span", { className: "group-words" }, el("span", { className: "tile-name", textContent: title }), el("span", { className: "tile-size", textContent: on.length ? on.join(", ") : `${values.length} to choose from` })));
      node.dataset.testid = "gallery-facet";
      node.dataset.facet = id;
      node.setAttribute("aria-pressed", String(id === facet()));
      node.addEventListener("click", () => {
        address.set("facet", id);
        render();
      });
      railBox.append(node);
    }
    rowsStyle = "";
    refreshRail();
  }
  function togglePick(id: FacetId, value: string) {
    const now = picks()[id] ?? [];
    const next = now.includes(value) ? now.filter((other) => other !== value) : [...now, value];
    address.setMany({ [facetParam(id)]: next.length ? next.join("|") : null, kind: null, family: null });
    render();
  }
  function renderFacetChips(counts: ReturnType<typeof facetCounts>) {
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.value : undefined;
    const box = el("div", { className: "steps-row" });
    box.dataset.testid = "gallery-facets";
    const id = facet();
    if (Object.values(picks()).some((values) => values?.length) || yearsSet(yearsNow()) > 0) {
      const clear = el("button", { type: "button", className: "facet-clear", textContent: "Clear filters" });
      clear.dataset.testid = "facet-clear";
      clear.addEventListener("click", () => {
        address.setMany({ ...Object.fromEntries(FACETS.map((one) => [facetParam(one.id), null])), [YEAR_FROM]: null, [YEAR_TO]: null });
        render();
      });
      box.append(clear);
    }
    for (const value of facetOrder(id, counts[id])) {
      const chip = el("button", { type: "button", className: "facet-chip" }, el("span", { textContent: id === "cores" ? `${value} ${value === "1" ? "core" : "cores"}` : value }), el("span", { className: "fold-count", textContent: String(counts[id].get(value)) }));
      chip.dataset.testid = "facet-chip";
      chip.dataset.facet = id;
      chip.dataset.value = value;
      chip.setAttribute("aria-pressed", String(picks()[id]?.includes(value) ?? false));
      chip.addEventListener("click", () => togglePick(id, value));
      box.append(chip);
    }
    // the years stay where they are while the chips change, so typing in a box keeps the focus
    if (years.node.parentElement !== stepsBox) stepsBox.replaceChildren(years.node);
    stepsBox.querySelector(".steps-row")?.remove();
    stepsBox.append(box);
    years.show(yearsNow());
    stepsBox.hidden = false;
    refreshSteps();
    if (focused) [...box.querySelectorAll<HTMLElement>("button")].find((button) => button.dataset.value === focused)?.focus();
  }

  const years = yearFilter(yearHints(), () => {
    const next = years.range();
    const now = yearsNow();
    if (next.from === now.from && next.to === now.to) return;
    address.setMany({ [YEAR_FROM]: next.from === null ? null : String(next.from), [YEAR_TO]: next.to === null ? null : String(next.to), kind: null, family: null });
    render();
  });

  // ----------------------------------------------------------- the families
  function renderFamilies(members: readonly Item[]) {
    const families = familiesOf(members);
    const now = familyNow();
    if (families.length < 2) {
      stepsBox.hidden = true;
      stepsBox.replaceChildren();
      return;
    }
    const box = el("div", { className: "steps-row" });
    const chip = (label: string, count: number, family: string | null) => {
      const node = el("button", { type: "button", className: "facet-chip" }, el("span", { textContent: label }), el("span", { className: "fold-count", textContent: String(count) }));
      node.dataset.testid = family === null ? "gallery-family-all" : "gallery-family";
      if (family !== null) node.dataset.family = family;
      node.setAttribute("aria-pressed", String(family === now));
      node.addEventListener("click", () => go({ kind: kindNow(), family }));
      return node;
    };
    box.append(chip("All", members.length, null));
    for (const [family, count] of families) box.append(chip(family, count, family));
    stepsBox.replaceChildren(box);
    stepsBox.hidden = false;
    refreshSteps();
    const pressed = box.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (pressed) scrollWithin(box, pressed);
  }

  // ----------------------------------------------------------- the machines
  function tile(item: Item): HTMLElement {
    const built = item.status === "built";
    const mesh = drawingKey(item);
    const folder = item.part ? "parts/" : "";
    const art = el("span", { className: "tile-art" });
    if (!built || !mesh) art.append(el("img", { src: "assets/coming-soon.svg", alt: "", loading: "lazy", decoding: "async", width: 320, height: 220 }));
    else if (style() === "both") {
      art.dataset.both = "";
      for (const one of STYLE_NAMES) art.append(drawingImg(mesh, one, `${item.name}, ${one}`, folder));
    } else art.append(drawingImg(mesh, style() as StyleName, item.name, folder));
    const name = el("span", { className: "tile-name", textContent: item.name });
    name.dataset.testid = "tile-name";
    const size = realSize(item);
    const covered = item.entry !== null && "mesh" in item.entry;
    const note = !built ? "Coming soon" : covered ? `Drawn as ${deviceByKey(meshOf(item.key) ?? "")?.name ?? mesh}` : size ? `${size[0]} by ${size[1]} by ${size[2]} mm` : "No real size";
    const node = el("button", { type: "button", className: "tile" }, art, name, el("span", { className: "tile-size", textContent: note }));
    node.dataset.testid = item.part ? "part-tile" : "tile";
    node.dataset.key = item.key;
    node.dataset.status = item.status;
    node.setAttribute("aria-pressed", String(item.id === currentId));
    node.addEventListener("click", () => {
      go({ kind: kindNow(), family: familyNow() }, `#${encodeURIComponent(item.id)}`);
      hooks.onChoose();
    });
    tileNodes.set(item.id, node);
    return node;
  }
  function drawMore() {
    const chunk = list.slice(drawn, drawn + PAGE);
    grid.append(...chunk.map(tile));
    drawn += chunk.length;
    end.hidden = drawn >= list.length;
    refreshTiles();
  }
  new IntersectionObserver(
    ([seen]) => {
      if (seen.isIntersecting && drawn < list.length) drawMore();
    },
    { root: scroller, rootMargin: "400px" },
  ).observe(end);
  let listKey = "";
  function renderTiles(items: readonly Item[], key: string) {
    const wanted = `${key}|${style()}`;
    if (wanted === listKey) return false;
    listKey = wanted;
    list = items;
    drawn = 0;
    tileNodes = new Map();
    grid.replaceChildren();
    scroller.scrollTo(0, 0);
    grid.dataset.both = style() === "both" ? "true" : "false";
    scroller.dataset.total = String(items.length);
    scroller.dataset.kind = kindNow();
    drawMore();
    if (items.length === 0) grid.append(el("p", { className: "empty", textContent: "Nothing matches." }));
    return true;
  }
  /** Marks the machine on show, drawing as far as it if it is further down this list. */
  function markCurrent() {
    for (const [id, node] of tileNodes) node.setAttribute("aria-pressed", String(id === currentId));
    if (!currentId) return;
    const at = list.findIndex((item) => item.id === currentId);
    while (at >= drawn) drawMore();
    refreshTiles();
    const node = tileNodes.get(currentId);
    if (at >= 0 && node && !grid.contains(document.activeElement)) scrollWithin(scroller, node);
  }

  // ----------------------------------------------------------- all of it
  function render() {
    const value = text();
    if (search.value.trim() !== value.trim()) search.value = value;
    const chosen = picks();
    const limits = yearsNow();
    const offered = yearItems(offeredItems(allItems(), show(), value), limits);
    const shown = pickedItems(offered, chosen);
    const narrowed = isNarrowed(value, chosen, limits);
    const counts = catalogueCounts();
    countNode.textContent = narrowed ? `${shown.length} of ${counts.total} match` : `${counts.built} of ${counts.total} built`;
    for (const button of filterRow.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.value === show()));
    for (const button of styleRow.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.value === style()));
    kindsTab.setAttribute("aria-pressed", String(pane() === "kinds"));
    filtersTab.setAttribute("aria-pressed", String(pane() === "filters"));
    const on = filtersOn(chosen, limits);
    filtersTab.textContent = on ? `Filters: ${on} on` : "Filters";

    // "Start here" is ten good machines; with anything narrowed, or with Coming soon asked for, the first row is everything left
    const everything = narrowed || show() !== "built";
    const kind = kindNow();
    const inKind = kind === START ? (everything ? shown : featuredItems()) : shown.filter((item) => item.kind === kind);
    const family = familyNow();
    const items = family === null ? inKind : inKind.filter((item) => item.family === family);

    if (pane() === "filters") {
      const facets = facetCounts(
        offered.filter((item) => item.part === null).map((item) => item.key),
        chosen,
      );
      renderFacetRows(facets);
      renderFacetChips(facets);
    } else {
      if (railBox.querySelector('[data-testid="gallery-facet"]') || !rows.size) buildRows();
      renderKinds(shown, everything);
      if (kind === START && !everything) {
        stepsBox.hidden = true;
        stepsBox.replaceChildren();
      } else renderFamilies(inKind);
    }
    grid.dataset.start = String(kind === START && !everything);
    const key = [show(), value.trim().toLowerCase(), JSON.stringify(chosen), JSON.stringify(limits), kind, family ?? "", everything].join("|");
    renderTiles(items, key);
    markCurrent();
  }

  // ----------------------------------------------------------- its controls
  const FILTERS: readonly [Show, string][] = [
    ["built", "Built"],
    ["planned", "Coming soon"],
    ["all", "All"],
  ];
  for (const [value, label] of FILTERS) {
    const button = el("button", { type: "button", textContent: label });
    button.dataset.value = value;
    button.dataset.testid = `filter-${value}`;
    button.addEventListener("click", () => {
      address.setMany({ show: value, kind: null, family: null });
      render();
    });
    filterRow.append(button);
  }
  for (const value of [...STYLE_NAMES, "both"] as const) {
    const button = el("button", { type: "button", textContent: value === "both" ? "Both" : value[0].toUpperCase() + value.slice(1) });
    button.dataset.value = value;
    button.dataset.testid = `style-${value}`;
    button.addEventListener("click", () => {
      address.set("style", value);
      hooks.onStyle(value);
      render();
    });
    styleRow.append(button);
  }
  search.addEventListener("input", () => {
    address.setMany({ q: search.value.trim() === "" ? null : search.value, kind: null, family: null });
    render();
  });
  kindsTab.addEventListener("click", () => {
    address.set("pane", "kinds");
    render();
  });
  filtersTab.addEventListener("click", () => {
    address.set("pane", "filters");
    render();
  });
  search.value = text();

  return {
    /** Reads the address again: on load, on Back and Forward, and when a link changed it. */
    sync(shownId: string | null, named: string | null) {
      currentId = shownId;
      namedId = named;
      const item = named ? itemById(named) : undefined;
      if (item?.status === "planned" && show() === "built") address.set("show", "all");
      render();
    },
    style,
  };
}
