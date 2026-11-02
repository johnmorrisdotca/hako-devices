// The demo page: a device large, the part builder, a lineup to scale, the gallery by family and a live screen. Everything comes from the package's own entries.
import { aliasesOf, catalogue, catalogueCounts, check, type CatalogueEntry, COVERED, deviceByKey, FAMILIES, groupLayout, groupSample, headingOf, meshOf, PARTS, partsOfKind, PRESETS, SHELVES, STYLE_NAMES, type Description, type Device, type Part, type StyleName } from "../src/index.ts";
import { colourRow } from "./colour-row.ts";
import { EMBED_KINDS, embedCode, type EmbedKind } from "../src/embed.ts";
import { HakoDevice, setAssetBase } from "../src/element.ts";
import { facetCounts, FACETS, facetOrder, type FacetId, matchesPicks, type Picks, yearSpan } from "../src/tags.ts";
import { yearFilter } from "./year-filter.ts";
import "@johnmorrisdotca/kazoku-ui/view-controls/define";
import type { ViewControlsElement } from "@johnmorrisdotca/kazoku-ui/view-controls/element";

const assets = new URL("assets/", document.baseURI).href;
setAssetBase(assets);

const byId = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`no #${id}`);
  return node as T;
};
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
};

// ------------------------------------------------------------- the device large
const HERO = ["pi4-pitft", "pi3b-oled", "pi-zero", "pi4-armor", "pi5", "mac-studio", "macbook-pro-14", "ipad-pro-11", "nas-2bay", "mini-pc"];
const hero = byId<HakoDevice>("hero");
const chips = byId("hero-chips");
let heroKey = "pi4-pitft";
let embedKind: EmbedKind = "element";
let embedFull = "";
const embedTabs = byId("embed-tabs");
const embedCodeNode = byId("embed-code");
const embedStatus = byId("embed-status");
for (const kind of EMBED_KINDS) {
  const tab = el("button", { type: "button", textContent: kind });
  tab.dataset.testid = `tab-${kind}`;
  tab.setAttribute("role", "tab");
  tab.addEventListener("click", () => {
    embedKind = kind;
    drawEmbed();
  });
  embedTabs.append(tab);
}
function drawEmbed() {
  embedFull = embedCode({ key: heroKey }, embedKind);
  embedCodeNode.textContent = embedFull.length > 1400 ? `${embedFull.slice(0, 1400)}…` : embedFull;
  for (const tab of embedTabs.querySelectorAll("button")) tab.setAttribute("aria-selected", String(tab.dataset.testid === `tab-${embedKind}`));
}
// The family's view controls turn, tip, zoom and move it; the device follows, and another device keeps the view.
const bar = byId<HTMLElement>("view-bar") as ViewControlsElement;
bar.addEventListener("kazoku-viewchange", (event) => hero.drive((event as CustomEvent).detail));
// the flat drawing cannot turn
hero.addEventListener("hako-fallback", () => bar.setAttribute("flat", ""));
hero.addEventListener("hako-ready", () => bar.removeAttribute("flat"));
function showHero(key: string) {
  heroKey = key;
  hero.removeAttribute("body-colour");
  hero.setAttribute("key", key);
  byId("hero-colours").replaceChildren(colourRow(hero, key));
  drawEmbed();
  for (const chip of chips.querySelectorAll("button")) chip.setAttribute("aria-pressed", String(chip.dataset.key === key));
}
byId("embed-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(embedFull);
  } catch {
    const area = el("textarea");
    area.value = embedFull;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  embedStatus.textContent = "Copied";
});
for (const key of HERO) {
  const chip = el("button", { type: "button", className: "chip", textContent: deviceByKey(key)?.name.replace(/^Raspberry /, "") ?? key });
  chip.dataset.key = key;
  chip.addEventListener("click", () => showHero(key));
  chips.append(chip);
}
showHero("pi4-pitft");

// ------------------------------------------------------------- the builder
const selects = {
  board: byId<HTMLSelectElement>("pick-board"),
  case: byId<HTMLSelectElement>("pick-case"),
  hat: byId<HTMLSelectElement>("pick-hat"),
  screen: byId<HTMLSelectElement>("pick-screen"),
  cooler: byId<HTMLSelectElement>("pick-cooler"),
};
const fill = (select: HTMLSelectElement, parts: readonly Part[], none: string | null) => {
  if (none) select.append(el("option", { value: "", textContent: none }));
  for (const part of parts) select.append(el("option", { value: part.id, textContent: part.name }));
};
fill(selects.board, partsOfKind("board"), null);
fill(selects.case, partsOfKind("case"), "No case");
fill(selects.hat, partsOfKind("hat"), "No hat");
fill(selects.screen, partsOfKind("screen"), "No module");
fill(selects.cooler, partsOfKind("cooler"), "No cooler");
const solder = byId<HTMLInputElement>("pick-solder");
const printInput = byId<HTMLInputElement>("pick-print");

function description(): Description {
  const d: Record<string, unknown> = { board: selects.board.value };
  if (selects.case.value) d.case = selects.case.value;
  if (selects.hat.value) d.hat = selects.hat.value;
  if (selects.screen.value) d.screen = selects.screen.value;
  if (selects.cooler.value) d.cooler = selects.cooler.value;
  if (solder.checked) d.solderHeader = true;
  if (printInput.value.trim()) d.print = printInput.value.trim();
  return d as Description;
}

let lastGood = "";
const stage = byId("builder-stage");
const builderDevice = new HakoDevice();
builderDevice.setAttribute("data-testid", "builder-device");
stage.append(builderDevice);
const CODE_TABS = ["Element", "build()", "React"] as const;
let codeTab: (typeof CODE_TABS)[number] = "Element";
const codeNode = byId("builder-code");
const tabs = byId("code-tabs");
function codeFor(d: Description): string {
  const json = JSON.stringify(d);
  const pretty = JSON.stringify(d, null, 2);
  if (codeTab === "build()") return `import { build } from "@johnmorrisdotca/hako-devices/build";\n\nconst machine = build(${pretty});\nmachine.glb().bytes; // the mesh, a .glb\nmachine.svg("thin"); // the drawing`;
  if (codeTab === "React") return `import { HakoDevice } from "@johnmorrisdotca/hako-devices/react";\n\n<HakoDevice build={${json}} />`;
  return `<script type="module">\n  import "@johnmorrisdotca/hako-devices/element";\n</script>\n\n<hako-device build='${json}'></hako-device>`;
}
for (const name of CODE_TABS) {
  const tab = el("button", { type: "button", textContent: name });
  tab.setAttribute("role", "tab");
  tab.addEventListener("click", () => {
    codeTab = name;
    updateBuilder();
  });
  tabs.append(tab);
}
function updateBuilder() {
  for (const tab of tabs.querySelectorAll("button")) tab.setAttribute("aria-selected", String(tab.textContent === codeTab));
  const d = description();
  const report = check(d);
  const issues = byId("builder-issues");
  issues.replaceChildren();
  for (const issue of report.issues) {
    const li = el("li", { textContent: issue.message });
    li.dataset.level = issue.level;
    li.dataset.code = issue.code;
    issues.append(li);
  }
  if (report.ok && report.issues.length === 0) {
    const li = el("li", { textContent: "It all fits." });
    li.dataset.level = "ok";
    issues.append(li);
  }
  byId("builder-size").textContent = report.size ? `About ${report.size[0]} by ${report.size[1]} by ${report.size[2]} mm` : "It does not go together, so the last one that did stays on show.";
  codeNode.textContent = codeFor(d);
  const text = JSON.stringify(d);
  if (report.ok && text !== lastGood) {
    lastGood = text;
    builderDevice.description = d;
  }
}
for (const select of Object.values(selects)) select.addEventListener("change", updateBuilder);
solder.addEventListener("change", updateBuilder);
printInput.addEventListener("change", updateBuilder);
byId("builder-copy").addEventListener("click", () => {
  void navigator.clipboard?.writeText(codeNode.textContent ?? "");
});
function usePreset(d: Description) {
  selects.board.value = d.board ?? "pi4";
  selects.case.value = d.case ?? "";
  selects.hat.value = d.hat ?? "";
  selects.screen.value = d.screen ?? "";
  selects.cooler.value = d.cooler ?? "";
  solder.checked = d.solderHeader === true;
  updateBuilder();
}
const presetRow = byId("builder-presets");
for (const preset of PRESETS.filter((entry) => entry.description.board)) {
  const chip = el("button", { type: "button", className: "chip", textContent: preset.name });
  chip.addEventListener("click", () => usePreset(preset.description));
  presetRow.append(chip);
}
usePreset(PRESETS[0].description);
byId<HTMLFormElement>("builder-form").addEventListener("submit", (event) => event.preventDefault());

// ------------------------------------------------------------- the lineup
const lineup = byId("lineup-view");
const lineupKeys = byId<HTMLInputElement>("lineup-keys");
const lineupUnit = byId<HTMLSelectElement>("lineup-unit");
lineupKeys.addEventListener("change", () => lineup.setAttribute("keys", lineupKeys.value));
lineupUnit.addEventListener("change", () => lineup.setAttribute("unit", lineupUnit.value));

// ------------------------------------------------------------- the gallery
type Filter = "built" | "planned" | "all";
let filter: Filter = "built";
let galleryStyle: StyleName | "both" = "thin";
const entries = catalogue();
const search = byId<HTMLInputElement>("gallery-search");
const groups = byId("gallery-groups");
const facetsBox = byId("gallery-facets");
const picks: Partial<Record<FacetId, string[]>> = {};
const years = yearFilter(yearSpan(entries.map((entry) => entry.key)), () => renderGallery());
facetsBox.before(years.node);
const anyPick = () => Object.values(picks).some((values) => values.length > 0);
function togglePick(facet: FacetId, value: string) {
  const now = picks[facet] ?? [];
  picks[facet] = now.includes(value) ? now.filter((other) => other !== value) : [...now, value];
  renderGallery();
}
/** One row per fact the machines can be filtered by, each with what picking a value would show. */
function renderFacets(keys: readonly string[]) {
  const counts = facetCounts(keys, picks as Picks);
  facetsBox.replaceChildren();
  const picked = Object.values(picks).reduce((sum, values) => sum + values.length, 0);
  const all = fold(picked ? `Filters: ${picked} on` : "Filters", FACETS.length, "facets", picked > 0, (body) => renderFacetRows(body, counts));
  all.dataset.testid = "gallery-filters";
  facetsBox.append(all);
}
function renderFacetRows(facetsBox: HTMLElement, counts: ReturnType<typeof facetCounts>) {
  if (anyPick()) {
    const clear = el("button", { type: "button", className: "facet-clear", textContent: "Clear filters" });
    clear.dataset.testid = "facet-clear";
    clear.addEventListener("click", () => {
      for (const { id } of FACETS) picks[id] = [];
      renderGallery();
    });
    facetsBox.append(clear);
  }
  for (const { id, title } of FACETS) {
    const values = facetOrder(id, counts[id]);
    if (values.length === 0) continue;
    const chosen = picks[id]?.length ?? 0;
    const row = fold(chosen ? `${title}: ${picks[id]?.join(", ")}` : title, values.length, `facet/${id}`, false, (body) => {
      const chips = el("div", { className: "facet-chips" });
      for (const value of values) {
        const chip = el("button", { type: "button", className: "facet-chip" }, el("span", { textContent: id === "cores" ? `${value} ${value === "1" ? "core" : "cores"}` : value }), el("span", { className: "fold-count", textContent: String(counts[id].get(value)) }));
        chip.dataset.testid = "facet-chip";
        chip.dataset.facet = id;
        chip.dataset.value = value;
        chip.setAttribute("aria-pressed", String(picks[id]?.includes(value) ?? false));
        chip.addEventListener("click", () => togglePick(id, value));
        chips.append(chip);
      }
      body.append(chips);
    });
    row.dataset.testid = "gallery-facet";
    row.dataset.facet = id;
    facetsBox.append(row);
  }
}
const FILTERS: readonly [Filter, string][] = [
  ["built", "Built"],
  ["planned", "Coming soon"],
  ["all", "All"],
];
const filterRow = byId("gallery-filter");
for (const [value, label] of FILTERS) {
  const button = el("button", { type: "button", textContent: label });
  button.dataset.value = value;
  button.dataset.testid = `filter-${value}`;
  button.addEventListener("click", () => {
    filter = value;
    renderGallery();
  });
  filterRow.append(button);
}
const styleRow = byId("gallery-style");
for (const value of [...STYLE_NAMES, "both"] as const) {
  const button = el("button", { type: "button", textContent: value === "both" ? "Both" : value[0].toUpperCase() + value.slice(1) });
  button.dataset.value = value;
  button.dataset.testid = `style-${value}`;
  button.addEventListener("click", () => {
    galleryStyle = value;
    renderGallery();
  });
  styleRow.append(button);
}
const fileOf = (key: string, style: StyleName, folder = "") => `assets/${folder}${key}${style === "thin" ? "" : `.${style}`}.svg`;
function drawingImg(key: string, style: StyleName, label: string, folder = "") {
  const img = el("img", { src: fileOf(key, style, folder), alt: label, loading: "lazy", decoding: "async", width: 320, height: 220 });
  img.dataset.style = style;
  return img;
}
function tile(entry: CatalogueEntry): HTMLElement {
  const built = entry.status === "built";
  const mesh = meshOf(entry.key) ?? entry.key;
  const art = el("span", { className: "tile-art" });
  if (!built) art.append(el("img", { src: "assets/coming-soon.svg", alt: "", loading: "lazy", decoding: "async", width: 320, height: 220 }));
  else if (galleryStyle === "both") {
    art.dataset.both = "";
    for (const style of STYLE_NAMES) art.append(drawingImg(mesh, style, `${entry.name}, ${style}`));
  } else art.append(drawingImg(mesh, galleryStyle, entry.name));
  const name = el("span", { className: "tile-name", textContent: entry.name });
  name.dataset.testid = "tile-name";
  const size = (entry as Device).size ?? null;
  const covered = "mesh" in entry;
  const words = el("span", { className: "tile-size", textContent: !built ? "Coming soon" : covered ? `Drawn as ${deviceByKey(mesh)?.name ?? mesh}` : size ? `${size[0]} by ${size[1]} by ${size[2]} mm` : "No real size" });
  const node = built ? el("button", { type: "button", className: "tile" }, art, name, words) : el("div", { className: "tile" }, art, name, words);
  node.dataset.testid = "tile";
  node.dataset.key = entry.key;
  node.dataset.status = entry.status;
  if (built) node.addEventListener("click", () => (location.hash = encodeURIComponent(entry.key)));
  return node;
}
function partTile(part: Part): HTMLElement {
  const art = el("span", { className: "tile-art" });
  if (galleryStyle === "both") {
    art.dataset.both = "";
    for (const style of STYLE_NAMES) art.append(drawingImg(part.id, style, `${part.name}, ${style}`, "parts/"));
  } else art.append(drawingImg(part.id, galleryStyle, part.name, "parts/"));
  const name = el("span", { className: "tile-name", textContent: part.name });
  const words = el("span", { className: "tile-size", textContent: `${part.size[0]} by ${part.size[1]} by ${part.size[2]} mm` });
  const node = el("button", { type: "button", className: "tile" }, art, name, words);
  node.dataset.testid = "part-tile";
  node.dataset.key = part.id;
  node.addEventListener("click", () => (location.hash = `part:${encodeURIComponent(part.id)}`));
  return node;
}
function matches(entry: CatalogueEntry, text: string): boolean {
  const hay = `${entry.name} ${entry.key} ${aliasesOf(entry.key).join(" ")}`.toLowerCase();
  return text.toLowerCase().split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
}
type Shelved = Exclude<CatalogueEntry, Device>;
const openFolds = new Set<string>();
function byHeading(members: readonly Shelved[]): [string, Shelved[]][] {
  const found = new Map<string, Shelved[]>();
  for (const entry of members) found.set(headingOf(entry), [...(found.get(headingOf(entry)) ?? []), entry]);
  return [...found].sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }));
}
/** A group that opens and closes, its tiles made only when first opened: the whole list is 1,400 machines. A search opens what it found, and is not remembered. */
function fold(title: string, count: number, id: string, searching: boolean, fill: (body: HTMLElement) => void): HTMLElement {
  const body = el("div", { className: "fold-body" });
  const node = el("details", { className: "fold" }, el("summary", {}, el("span", { textContent: title }), el("span", { className: "fold-count", textContent: String(count) })), body);
  const show = () => {
    if (node.open && body.childElementCount === 0) fill(body);
  };
  node.open = searching || openFolds.has(id);
  show();
  node.addEventListener("toggle", () => {
    show();
    if (searching) return;
    if (node.open) openFolds.add(id);
    else openFolds.delete(id);
  });
  return node;
}
let openGroup: string | null = null;
/** One group: a bunch of its machines (groupLayout), its name and how many. */
function groupCard(id: string, title: string, count: number, pictures: readonly string[], noun = "machine"): HTMLElement {
  const art = el("span", { className: "group-art" });
  const chosen = groupSample(pictures);
  groupLayout(chosen.length).forEach((place, i) => {
    const img = el("img", { src: chosen[i], alt: "", loading: "lazy", decoding: "async", width: 320, height: 220 });
    img.style.cssText = `left:${place.x}%;top:${place.y}%;width:${place.width}%;z-index:${place.order};transform:translate(-50%,-50%) rotate(${place.rotate}deg)`;
    art.append(img);
  });
  const node = el("button", { type: "button", className: "group-card" }, art, el("span", { className: "tile-name", textContent: title }), el("span", { className: "tile-size", textContent: `${count} ${noun}${count === 1 ? "" : "s"}` }));
  node.dataset.testid = "gallery-card";
  node.dataset.group = id;
  node.addEventListener("click", () => {
    openGroup = id;
    renderGallery();
    groups.scrollIntoView({ block: "start" });
  });
  return node;
}
function renderGallery() {
  for (const button of filterRow.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.value === filter));
  for (const button of styleRow.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.value === galleryStyle));
  const counts = catalogueCounts();
  const text = search.value;
  const offered = entries.filter((entry) => (filter === "all" || entry.status === filter) && matches(entry, text) && years.passes(entry.key));
  const shown = offered.filter((entry) => matchesPicks(entry.key, picks as Picks));
  const narrowed = text !== "" || anyPick() || years.active();
  renderFacets(offered.map((entry) => entry.key));
  byId("gallery-count").textContent = narrowed ? `${shown.length} of ${counts.total} match` : `${counts.built} of ${counts.total} built`;
  groups.replaceChildren();
  const devices = shown.filter((entry) => !("shelf" in entry));
  const shelved = (id: string) => shown.filter((entry): entry is Shelved => "shelf" in entry && entry.shelf === id);
  const parts = filter === "planned" || anyPick() || years.active() ? [] : Object.values(PARTS).filter((part) => part.kind !== "board" && matches({ key: part.id, name: part.name } as CatalogueEntry, text));
  const shownFamily = (id: string) => devices.filter((entry) => entry.family === id);
  // Nothing narrowed and no group chosen: the groups alone, each a bunch of its machines. A list this long is browsed by opening one.
  if (!narrowed && openGroup === null) {
    const cards = el("div", { className: "group-cards" });
    for (const { id, title } of FAMILIES) if (shownFamily(id).length) cards.append(groupCard(id, title, shownFamily(id).length, shownFamily(id).map((entry) => fileOf(entry.key, galleryStyle === "both" ? "thin" : galleryStyle))));
    for (const { id, title } of SHELVES) {
      const members = shelved(id);
      if (!members.length) continue;
      const drawn = members.map((entry) => meshOf(entry.key)).filter((key): key is string => key !== null);
      const card = groupCard(id, title, members.length, drawn.length ? drawn.map((key) => fileOf(key, galleryStyle === "both" ? "thin" : galleryStyle)) : ["assets/coming-soon.svg"]);
      card.dataset.shelf = id;
      card.dataset.count = String(members.length);
      cards.append(card);
    }
    if (parts.length) cards.append(groupCard("parts", "Parts on their own", parts.length, parts.map((part) => fileOf(part.id, galleryStyle === "both" ? "thin" : galleryStyle, "parts/")), "part"));
    groups.append(cards);
    return;
  }
  const only = narrowed ? null : openGroup;
  if (only !== null) {
    const back = el("button", { type: "button", className: "group-back", textContent: "All groups" });
    back.dataset.testid = "group-back";
    back.addEventListener("click", () => {
      openGroup = null;
      renderGallery();
    });
    groups.append(back);
  }
  const wanted = (id: string) => only === null || only === id;
  for (const { id, title } of FAMILIES) {
    const members = shownFamily(id);
    if (members.length === 0 || !wanted(id)) continue;
    const section = el("section");
    section.dataset.testid = "gallery-group";
    section.dataset.family = id;
    section.append(el("h3", { textContent: title }), el("div", { className: "tiles" }, ...members.map(tile)));
    groups.append(section);
  }
  if (parts.length && wanted("parts")) {
    const section = el("section");
    section.dataset.testid = "gallery-group";
    section.dataset.family = "parts";
    section.append(el("h3", { textContent: "Parts on their own" }), el("div", { className: "tiles" }, ...parts.map(partTile)));
    groups.append(section);
  }
  for (const { id, title } of SHELVES) {
    const members = shelved(id);
    if (members.length === 0 || !wanted(id)) continue;
    const shelf = fold(title, members.length, id, narrowed || only === id, (body) => {
      for (const [heading, machines] of byHeading(members)) {
        const family = fold(heading, machines.length, `${id}/${heading}`, narrowed, (tiles) => tiles.append(el("div", { className: "tiles" }, ...machines.map(tile))));
        family.dataset.testid = "gallery-family";
        body.append(family);
      }
    });
    shelf.dataset.testid = "gallery-shelf";
    shelf.dataset.shelf = id;
    shelf.dataset.count = String(members.length);
    groups.append(shelf);
  }
  if (shown.length === 0) groups.append(el("p", { className: "empty", textContent: "Nothing matches." }));
}
search.addEventListener("input", renderGallery);
renderGallery();

// ------------------------------------------------------------- the dialog
const dialog = byId<HTMLDialogElement>("device-dialog");
const dialogView = byId("dialog-view");
/** The view controls for the device in the dialog. Only the page's own bar keeps its choices in the address. */
function viewBar(view: HakoDevice): HTMLElement {
  const controls = document.createElement("kazoku-view-controls") as ViewControlsElement;
  controls.dataset.testid = "dialog-view-bar";
  controls.setAttribute("theme", "dark");
  controls.view = view;
  controls.addEventListener("kazoku-viewchange", (event) => view.drive((event as CustomEvent).detail));
  return controls;
}
function openFromHash() {
  const asked = decodeURIComponent(location.hash.slice(1));
  const part = asked.startsWith("part:") ? PARTS[asked.slice(5)] : undefined;
  const key = meshOf(asked) ?? asked;
  const entry = deviceByKey(key);
  const coveredName = COVERED.find((machine) => machine.key === asked)?.name;
  if (part) {
    byId("dialog-title").textContent = part.name;
    const view = new HakoDevice();
    view.setAttribute("part", part.id);
    view.dataset.testid = "dialog-device";
    dialogView.replaceChildren(view, viewBar(view));
    const facts = byId("dialog-facts");
    facts.replaceChildren();
    facts.append(el("dt", { textContent: "Id" }), el("dd", { textContent: part.id }), el("dt", { textContent: "Real size" }), el("dd", { textContent: `${part.size[0]} by ${part.size[1]} by ${part.size[2]} mm` }));
    byId("dialog-colours").replaceChildren();
    byId("dialog-code").textContent = `<hako-device part="${part.id}"></hako-device>`;
    if (!dialog.open) dialog.showModal();
    return;
  }
  if (!entry) {
    if (dialog.open) dialog.close();
    return;
  }
  byId("dialog-title").textContent = coveredName ?? entry.name;
  const view = new HakoDevice();
  view.setAttribute("key", asked);
  view.setAttribute("fireflies", "");
  view.dataset.testid = "dialog-device";
  dialogView.replaceChildren(view, viewBar(view));
  const facts = byId("dialog-facts");
  facts.replaceChildren();
  const fact = (term: string, value: string) => facts.append(el("dt", { textContent: term }), el("dd", { textContent: value }));
  fact("Key", asked);
  if (coveredName) fact("Drawn as", entry.name);
  fact("Real size", entry.size ? `${entry.size[0]} by ${entry.size[1]} by ${entry.size[2]} mm` : "No real size: a stand-in");
  fact("Ports", entry.ports.map((port) => `${port.count} ${port.kind}`).join(", ") || "None");
  fact("Parts", JSON.stringify(entry.parts));
  byId("dialog-colours").replaceChildren(colourRow(view, asked));
  byId("dialog-code").textContent = `<hako-device key="${asked}"></hako-device>`;
  if (!dialog.open) dialog.showModal();
}
byId("dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  dialogView.replaceChildren();
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
window.addEventListener("hashchange", openFromHash);
if (location.hash) openFromHash();

// ------------------------------------------------------------- a live screen
const screenDevice = byId<HakoDevice>("screen-device");
const screenPick = byId<HTMLSelectElement>("screen-pick");
for (const key of ["pi4-pitft", "pi3b-oled", "pi4-epaper", "pi4-touch7", "macbook-air-13", "ipad-air", "iphone", "client-computer"]) {
  screenPick.append(el("option", { value: key, textContent: deviceByKey(key)?.name ?? key }));
}
const titleInput = byId<HTMLInputElement>("screen-title-input");
const lineInput = byId<HTMLInputElement>("screen-line-input");
function paintWords() {
  screenDevice.paintScreen({ title: titleInput.value, subtitle: "Your words", lines: [lineInput.value], status: "good", badge: "OK", buttons: ["One", "Two"] });
}
paintWords();
titleInput.addEventListener("input", paintWords);
lineInput.addEventListener("input", paintWords);
screenPick.addEventListener("change", () => screenDevice.setAttribute("key", screenPick.value));
byId("screen-canvas").addEventListener("click", () => {
  screenDevice.paintScreen((ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#14304f");
    g.addColorStop(1, "#6cd0ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.round(h / 6)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(titleInput.value, w / 2, h / 2);
  });
});
byId<HTMLFormElement>("screen-form").addEventListener("submit", (event) => event.preventDefault());

export {};
