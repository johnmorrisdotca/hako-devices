// The builder: pick a board, a case and a hat, and one description makes the mesh and the drawing. Its device exists only while this view is open, so only one device on the page draws in 3D.
import { check, type Description, partsOfKind, PRESETS, type Part } from "../src/index.ts";
import { HakoDevice } from "../src/element.ts";
import { byId, el } from "./dom.ts";

export function createBuilder() {
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

  return {
    /** Puts the device on the page when the view opens and takes it off when it closes: taking it off gives its WebGL context back. */
    setOpen(open: boolean) {
      if (open && !builderDevice.isConnected) stage.append(builderDevice);
      if (!open && builderDevice.isConnected) builderDevice.remove();
    },
  };
}
