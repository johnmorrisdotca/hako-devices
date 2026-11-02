// The builder: clicks in a row for a board, a case, a hat, a module and a cooler, and one description makes the mesh and the drawing. It never shows an error and never a picture of something other than
// what is chosen: by default the other parts change to ones that fit, and the other way greys what cannot work. Its device exists only while this view is open, so only one device on the page draws in 3D.
import { BOARDS, CHOICE_SLOTS, type ChoiceChange, type ChoiceSlot, type Description, fillNeeded, nearestWorking, PRESETS, whatFits } from "../src/index.ts";
import { HakoDevice } from "../src/element.ts";
import { createAddressState } from "@johnmorrisdotca/kazoku-ui/address-state";
import { byId, el, rove } from "./dom.ts";

type Way = "working" | "fits";
const address = createAddressState({ defaults: { fit: "working" } });
const CODE_TABS = ["Element", "build()", "React"] as const;

/** What the person chose: what the address keeps. The header they ticked themselves is theirs; one a hat needed goes when the hat goes. */
const partsOf = (d: Description, ticked: boolean) => [...CHOICE_SLOTS.map((slot) => d[slot] ?? ""), ticked ? "soldered" : ""].join(",").replace(/,+$/, "");
function readParts(text: string | null): { d: Description; ticked: boolean } | null {
  if (!text) return null;
  const values = text.split(",");
  const d: Record<string, unknown> = {};
  CHOICE_SLOTS.forEach((slot, at) => {
    if (values[at]) d[slot] = values[at];
  });
  return { d: d as Description, ticked: values[CHOICE_SLOTS.length] === "soldered" };
}

export function createBuilder() {
  const boxes: Record<ChoiceSlot, HTMLElement> = { board: byId("pick-board"), case: byId("pick-case"), hat: byId("pick-hat"), screen: byId("pick-screen"), cooler: byId("pick-cooler") };
  const refreshers = Object.fromEntries(CHOICE_SLOTS.map((slot) => [slot, rove(boxes[slot])])) as Record<ChoiceSlot, () => void>;
  const solder = byId<HTMLInputElement>("pick-solder");
  const solderRow = byId("solder-row");
  const printInput = byId<HTMLInputElement>("pick-print");
  const wayRow = byId("builder-way");
  const whyNode = byId("builder-why");
  const changedNode = byId("builder-changed");
  const stage = byId("builder-stage");
  const codeNode = byId("builder-code");
  const tabs = byId("code-tabs");
  const issues = byId("builder-issues");
  const device = new HakoDevice();
  device.setAttribute("data-testid", "builder-device");

  let choices: Description = {};
  let ticked = false;
  let codeTab: (typeof CODE_TABS)[number] = "Element";
  let shown = "";

  const way = () => address.get("fit") as Way;
  const wayNote = () => (way() === "working" ? "Pick anything: the other parts change to ones that fit." : "What cannot work with your choices is greyed: point at it or press it to see why.");
  const withPrint = (d: Description): Description => (printInput.value.trim() ? { ...d, print: printInput.value.trim() } : d);

  function codeFor(d: Description): string {
    const json = JSON.stringify(d);
    const pretty = JSON.stringify(d, null, 2);
    if (codeTab === "build()") return `import { build } from "@johnmorrisdotca/hako-devices/build";\n\nconst machine = build(${pretty});\nmachine.glb().bytes; // the mesh, a .glb\nmachine.svg("thin"); // the drawing`;
    if (codeTab === "React") return `import { HakoDevice } from "@johnmorrisdotca/hako-devices/react";\n\n<HakoDevice build={${json}} />`;
    return `<script type="module">\n  import "@johnmorrisdotca/hako-devices/element";\n</script>\n\n<hako-device build='${json}'></hako-device>`;
  }

  // ----------------------------------------------------------- the rows
  function partChip(slot: ChoiceSlot, id: string | null, name: string, fits: boolean, why: string | null) {
    const art = el("span", { className: "part-art" });
    if (id !== null) art.append(el("img", { src: `assets/parts/${id}.svg`, alt: "", loading: "lazy", decoding: "async", width: 320, height: 220 }));
    const node = el("button", { type: "button", className: "part-chip", title: why ?? name }, art, el("span", { className: "part-name", textContent: name.replace(/^Raspberry /, "") }));
    node.dataset.testid = "pick-option";
    node.dataset.slot = slot;
    node.dataset.value = id ?? "";
    node.setAttribute("aria-pressed", String((choices[slot] ?? null) === id));
    if (!fits) node.setAttribute("aria-disabled", "true");
    const tell = () => {
      if (!fits) whyNode.textContent = why ?? "";
    };
    node.addEventListener("mouseenter", tell);
    node.addEventListener("focus", tell);
    node.addEventListener("click", () => {
      if (fits) choose(slot, id);
      else tell();
    });
    return node;
  }
  function drawRows() {
    for (const slot of CHOICE_SLOTS) {
      const options = whatFits(choices, slot);
      const focused = boxes[slot].contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.value : undefined;
      boxes[slot].replaceChildren(...options.map((option) => partChip(slot, option.id, option.name, way() === "working" || option.fits, option.why)));
      refreshers[slot]();
      if (focused !== undefined) [...boxes[slot].querySelectorAll<HTMLElement>("button")].find((button) => button.dataset.value === focused)?.focus();
    }
    for (const button of wayRow.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.value === way()));
    // the header is a choice only on a board with bare holes, and a hat makes it no choice at all
    const bare = choices.board !== undefined && BOARDS[choices.board].header.kind === "pads";
    solderRow.hidden = !bare;
    solder.checked = choices.solderHeader === true;
    solder.disabled = choices.hat !== undefined;
  }

  // ----------------------------------------------------------- what is on show
  function drawResult(changes: readonly ChoiceChange[]) {
    const d = withPrint(choices);
    const report = nearestWorking(choices).report;
    issues.replaceChildren();
    for (const issue of report.issues) {
      const li = el("li", { textContent: issue.message });
      li.dataset.level = issue.level;
      li.dataset.code = issue.code;
      issues.append(li);
    }
    if (report.issues.length === 0) {
      const li = el("li", { textContent: "It all fits." });
      li.dataset.level = "ok";
      issues.append(li);
    }
    byId("builder-size").textContent = report.size ? `About ${report.size[0]} by ${report.size[1]} by ${report.size[2]} mm` : "";
    const line = changes.map((change) => change.message).join("; ");
    changedNode.textContent = line ? `Changed to fit: ${line}.` : "";
    codeNode.textContent = codeFor(d);
    for (const tab of tabs.querySelectorAll("button")) tab.setAttribute("aria-selected", String(tab.textContent === codeTab));
    const text = JSON.stringify(d);
    if (text !== shown) {
      shown = text;
      device.description = d;
    }
    address.set("parts", partsOf(choices, ticked));
  }
  /** Settles a set of choices and draws it. A header a hat needed is not news once it is on. */
  function settle(asked: Description, keep: ChoiceSlot | undefined) {
    const before = choices;
    const wanted: Record<string, unknown> = { ...asked };
    if (ticked) wanted.solderHeader = true;
    else delete wanted.solderHeader;
    const settled = nearestWorking(wanted as Description, keep);
    choices = settled.description;
    const changes = settled.changes.filter((change) => change.slot !== "header" || !before.solderHeader);
    whyNode.textContent = "";
    drawRows();
    drawResult(changes);
  }
  function choose(slot: ChoiceSlot, id: string | null) {
    const next: Record<string, unknown> = { ...choices };
    if (id === null) delete next[slot];
    else next[slot] = id;
    settle(next as Description, slot);
  }

  // ----------------------------------------------------------- its controls
  const WAYS: readonly [Way, string][] = [
    ["working", "Keep it working"],
    ["fits", "Only what fits"],
  ];
  for (const [value, words] of WAYS) {
    const button = el("button", { type: "button", textContent: words });
    button.dataset.value = value;
    button.dataset.testid = `builder-way-${value}`;
    button.addEventListener("click", () => {
      address.set("fit", value);
      whyNode.textContent = "";
      drawRows();
      byId("builder-way-note").textContent = wayNote();
    });
    wayRow.append(button);
  }
  for (const name of CODE_TABS) {
    const tab = el("button", { type: "button", textContent: name });
    tab.setAttribute("role", "tab");
    tab.addEventListener("click", () => {
      codeTab = name;
      drawResult([]);
    });
    tabs.append(tab);
  }
  solder.addEventListener("change", () => {
    ticked = solder.checked;
    settle(choices, undefined);
  });
  printInput.addEventListener("change", () => drawResult([]));
  byId("builder-copy").addEventListener("click", () => {
    void navigator.clipboard?.writeText(codeNode.textContent ?? "");
  });
  function usePreset(d: Description) {
    ticked = d.solderHeader === true;
    settle(fillNeeded(d).description, undefined);
    changedNode.textContent = "";
  }
  const presetRow = byId("builder-presets");
  for (const preset of PRESETS.filter((entry) => entry.description.board)) {
    const chip = el("button", { type: "button", className: "chip", textContent: preset.name });
    chip.addEventListener("click", () => usePreset(preset.description));
    presetRow.append(chip);
  }
  byId<HTMLFormElement>("builder-form").addEventListener("submit", (event) => event.preventDefault());

  const saved = readParts(address.get("parts"));
  if (saved) {
    ticked = saved.ticked;
    settle(saved.d, undefined);
    changedNode.textContent = "";
  } else usePreset(PRESETS[0].description);
  byId("builder-way-note").textContent = wayNote();

  return {
    /** Puts the device on the page when the view opens and takes it off when it closes: taking it off gives its WebGL context back. */
    setOpen(open: boolean) {
      if (open && !device.isConnected) stage.append(device);
      if (!open && device.isConnected) device.remove();
    },
  };
}
