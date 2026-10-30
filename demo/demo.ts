// The demo page: a device large, the part builder, a lineup to scale, the gallery by family and a live screen. Everything comes from the package's own entries.
import { catalogue, catalogueCounts, check, type CatalogueEntry, COVERED, deviceByKey, FAMILIES, headingOf, meshOf, PARTS, partsOfKind, PRESETS, SHELVES, STYLE_NAMES, type Description, type Device, type Part, type StyleName } from "../src/index.ts";
import { HakoDevice, setAssetBase } from "../src/element.ts";

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
const heroCode = byId("hero-code").querySelector("code") as HTMLElement;
const chips = byId("hero-chips");
function showHero(key: string) {
  hero.setAttribute("key", key);
  heroCode.textContent = `<hako-device key="${key}"></hako-device>`;
  for (const chip of chips.querySelectorAll("button")) chip.setAttribute("aria-pressed", String(chip.dataset.key === key));
}
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
  const hay = `${entry.name} ${entry.key}`.toLowerCase();
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
function renderGallery() {
  for (const button of filterRow.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.value === filter));
  for (const button of styleRow.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.value === galleryStyle));
  const counts = catalogueCounts();
  byId("gallery-count").textContent = `${counts.built} of ${counts.total} built`;
  const text = search.value;
  const shown = entries.filter((entry) => (filter === "all" || entry.status === filter) && matches(entry, text));
  groups.replaceChildren();
  const devices = shown.filter((entry) => !("shelf" in entry));
  for (const { id, title } of FAMILIES) {
    const members = devices.filter((entry) => entry.family === id);
    if (members.length === 0) continue;
    const section = el("section");
    section.dataset.testid = "gallery-group";
    section.dataset.family = id;
    section.append(el("h3", { textContent: title }), el("div", { className: "tiles" }, ...members.map(tile)));
    groups.append(section);
  }
  if (filter !== "planned") {
    const parts = Object.values(PARTS).filter((part) => part.kind !== "board" && matches({ key: part.id, name: part.name } as CatalogueEntry, text));
    if (parts.length) {
      const section = el("section");
      section.dataset.testid = "gallery-group";
      section.dataset.family = "parts";
      section.append(el("h3", { textContent: "Parts on their own" }), el("div", { className: "tiles" }, ...parts.map(partTile)));
      groups.append(section);
    }
  }
  for (const { id, title } of SHELVES) {
    const members = shown.filter((entry): entry is Shelved => "shelf" in entry && entry.shelf === id);
    if (members.length === 0) continue;
    const shelf = fold(title, members.length, id, text !== "", (body) => {
      for (const [heading, machines] of byHeading(members)) {
        const family = fold(heading, machines.length, `${id}/${heading}`, text !== "", (tiles) => tiles.append(el("div", { className: "tiles" }, ...machines.map(tile))));
        family.dataset.testid = "gallery-family";
        body.append(family);
      }
    });
    shelf.dataset.testid = "gallery-shelf";
    shelf.dataset.shelf = id;
    shelf.dataset.count = String(members.length);
    groups.append(shelf);
  }
  if (shown.length === 0) groups.append(el("p", { className: "empty", textContent: "Nothing has that name." }));
}
search.addEventListener("input", renderGallery);
renderGallery();

// ------------------------------------------------------------- the dialog
const dialog = byId<HTMLDialogElement>("device-dialog");
const dialogView = byId("dialog-view");
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
    dialogView.replaceChildren(view);
    const facts = byId("dialog-facts");
    facts.replaceChildren();
    facts.append(el("dt", { textContent: "Id" }), el("dd", { textContent: part.id }), el("dt", { textContent: "Real size" }), el("dd", { textContent: `${part.size[0]} by ${part.size[1]} by ${part.size[2]} mm` }));
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
  dialogView.replaceChildren(view);
  const facts = byId("dialog-facts");
  facts.replaceChildren();
  const fact = (term: string, value: string) => facts.append(el("dt", { textContent: term }), el("dd", { textContent: value }));
  fact("Key", asked);
  if (coveredName) fact("Drawn as", entry.name);
  fact("Real size", entry.size ? `${entry.size[0]} by ${entry.size[1]} by ${entry.size[2]} mm` : "No real size: a stand-in");
  fact("Ports", entry.ports.map((port) => `${port.count} ${port.kind}`).join(", ") || "None");
  fact("Parts", JSON.stringify(entry.parts));
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
