// The device on show: the one large view, the only one in the gallery that draws in 3D, with its name, colours, options, facts and the code to copy beside it.
import { deviceByKey, meshOf, PARTS, type StyleName } from "../src/index.ts";
import { deviceToParams, EMBED_KINDS, embedCode, type DeviceOptions, type EmbedKind } from "../src/embed.ts";
import { HakoDevice } from "../src/element.ts";
import { FACETS, tagsOf } from "../src/tags.ts";
import { applyParams, createAddressState } from "@johnmorrisdotca/kazoku-ui/address-state";
import "@johnmorrisdotca/kazoku-ui/embed-panel/define";
import type { EmbedPanelElement } from "@johnmorrisdotca/kazoku-ui/embed-panel/element";
import type { ViewControlsElement } from "@johnmorrisdotca/kazoku-ui/view-controls/element";
import { colourRow } from "./colour-row.ts";
import { byId, el } from "./dom.ts";
import type { Item } from "./gallery-model.ts";

const address = createAddressState({ defaults: { look: "3d", fireflies: "on", ground: "on", turned: "off" } });
/** The tags already said by the size, ports and parts rows. */
const SAID = new Set<string>(["ports", "parts"]);

export function createStage(startStyle: () => string) {
  const hero = byId<HakoDevice>("hero");
  const bar = byId<HTMLElement>("view-bar") as ViewControlsElement;
  const nameNode = byId("device-name");
  const statusNode = byId("device-status");
  const coloursRow = byId("device-colours");
  const optionsBox = byId("device-options");
  const facts = byId("device-facts");
  const panel = byId<EmbedPanelElement>("embed-panel");
  const viewNote = byId("view-note");
  let current: Item | null = null;
  /** The colour the row was drawn for, as the address names it. */
  let colourNow: string | null = null;

  const look = () => address.get("look") as "3d" | "drawing";
  const flag = (name: string) => address.get(name) === "on";
  const drawingStyle = (): StyleName | null => {
    const style = startStyle();
    return style === "thick" ? "thick" : null;
  };

  /** What the code to copy says: what is on the screen. A drawing is the drawn machine's own, and a machine with none says so. */
  function optionsNow(forDrawing: boolean): DeviceOptions {
    const item = current;
    if (item?.status === "planned") return { key: item.key };
    // the key on the view: a colour with its own drawing changes it
    const key = hero.getAttribute("key") ?? item?.key ?? "";
    const options: DeviceOptions = item?.part ? { part: item.part.id } : { key: forDrawing ? (meshOf(key) ?? key) : key };
    const style = drawingStyle();
    if (style) options.drawingStyle = style;
    if (look() === "drawing") options.mode = "drawing";
    if (flag("fireflies")) options.fireflies = true;
    if (!flag("ground")) options.noGround = true;
    if (flag("turned")) options.flipped = true;
    return options;
  }
  const asKind = (kind: string): EmbedKind => ((EMBED_KINDS as readonly string[]).includes(kind) ? (kind as EmbedKind) : "element");
  panel.labels = { data: "Data address" };
  panel.note = "Copy the code for the machine on the screen. The embed page is for a site that cannot run script.";
  panel.generate = ({ kind }) => {
    const one = asKind(kind);
    return embedCode(optionsNow(one === "svg" || one === "data"), one);
  };
  function drawEmbed() {
    const query = deviceToParams(optionsNow(false)).toString();
    panel.openHref = `embed.html${query === "" ? "" : `?${query}`}`;
    panel.update();
  }

  // The family's view controls turn, tip, zoom and move it; the device follows, and another device keeps the view.
  bar.addEventListener("kazoku-viewchange", (event) => hero.drive((event as CustomEvent).detail));
  // the flat drawing cannot turn
  const flat = () => bar.setAttribute("flat", "");
  hero.addEventListener("hako-fallback", flat);
  hero.addEventListener("hako-planned", flat);
  hero.addEventListener("hako-ready", () => bar.removeAttribute("flat"));

  function applyAttributes() {
    const set = (name: string, on: boolean, value = "") => (on ? hero.setAttribute(name, value) : hero.removeAttribute(name));
    const style = drawingStyle();
    set("drawing-style", style !== null, style ?? "");
    set("mode", look() === "drawing", "drawing");
    set("fireflies", flag("fireflies"));
    set("no-ground", !flag("ground"));
    set("flipped", flag("turned"));
    if (look() === "drawing") flat();
  }

  // ----------------------------------------------------------- the options
  function choiceRow(label: string, choices: readonly [string, string][], now: string, testid: string, pick: (value: string) => void) {
    const row = el("div", { className: "option-row" }, el("span", { className: "option-label", textContent: label }));
    const buttons = el("div", { className: "seg" });
    buttons.setAttribute("role", "group");
    buttons.setAttribute("aria-label", label);
    for (const [value, words] of choices) {
      const button = el("button", { type: "button", textContent: words });
      button.dataset.testid = `${testid}-${value}`;
      button.setAttribute("aria-pressed", String(value === now));
      button.addEventListener("click", () => pick(value));
      buttons.append(button);
    }
    row.append(buttons);
    return row;
  }
  const change = (name: string, value: string) => {
    address.set(name, value);
    applyAttributes();
    drawOptions();
    drawEmbed();
  };
  function drawOptions() {
    optionsBox.replaceChildren();
    if (!current || current.status !== "built") return;
    const onOff: readonly [string, string][] = [
      ["on", "On"],
      ["off", "Off"],
    ];
    optionsBox.append(
      choiceRow(
        "Show as",
        [
          ["3d", "3D"],
          ["drawing", "Drawing"],
        ],
        look(),
        "option-look",
        (value) => change("look", value),
      ),
      choiceRow("Fireflies", onOff, address.get("fireflies") as string, "option-fireflies", (value) => change("fireflies", value)),
      choiceRow("Ground", onOff, address.get("ground") as string, "option-ground", (value) => change("ground", value)),
      choiceRow(
        "Turned round",
        [
          ["off", "No"],
          ["on", "Yes"],
        ],
        address.get("turned") as string,
        "option-turned",
        (value) => change("turned", value),
      ),
    );
  }
  /** A colour changes the machine on the screen, so it is a step for Back, and the address keeps it for a reload. */
  function pickColour(name: string) {
    address.flush();
    history.pushState(history.state, "", `${location.pathname}${applyParams(location.search, { colour: name })}${location.hash}`);
    colourNow = name;
  }
  function drawColours(item: Item) {
    colourNow = address.get("colour");
    coloursRow.hidden = item.part !== null;
    hero.removeAttribute("body-colour");
    if (!item.part) hero.setAttribute("key", item.key);
    coloursRow.replaceChildren(...(item.part ? [] : [colourRow(hero, item.key, colourNow, pickColour)]));
  }
  function drawFacts(item: Item) {
    facts.replaceChildren();
    const fact = (term: string, value: string) => {
      const dt = el("dt", { textContent: term });
      const dd = el("dd", { textContent: value });
      dd.dataset.fact = term;
      facts.append(dt, dd);
    };
    if (item.part) {
      fact("Id", item.part.id);
      fact("Real size", `${item.part.size[0]} by ${item.part.size[1]} by ${item.part.size[2]} mm`);
      return;
    }
    fact("Key", item.key);
    const mesh = meshOf(item.key);
    const drawn = mesh ? deviceByKey(mesh) : undefined;
    if (mesh && mesh !== item.key && drawn) fact("Drawn as", drawn.name);
    if (drawn) {
      fact("Real size", drawn.size ? `${drawn.size[0]} by ${drawn.size[1]} by ${drawn.size[2]} mm` : "No real size: a stand-in");
      fact("Ports", drawn.ports.map((port) => `${port.count} ${port.kind}`).join(", ") || "None");
      const parts = Object.entries(drawn.parts).filter(([word]) => word !== "base").map(([word, value]) => `${word}: ${typeof value === "string" && Object.hasOwn(PARTS, value) ? PARTS[value].name : String(value)}`);
      if (parts.length) fact("Parts", parts.join(", "));
    }
    const tags = tagsOf(item.key);
    for (const { id, title } of FACETS) {
      const values = tags[id];
      if (!SAID.has(id) && values?.length) fact(title, values.join(", "));
    }
  }

  new MutationObserver(drawEmbed).observe(hero, { attributes: true, attributeFilter: ["key"] });
  applyAttributes();
  return {
    show(item: Item) {
      current = item;
      if (item.part) {
        hero.removeAttribute("key");
        hero.setAttribute("part", item.part.id);
      } else hero.removeAttribute("part");
      nameNode.textContent = item.name;
      statusNode.textContent = item.status === "planned" ? "Coming soon" : "";
      statusNode.hidden = item.status !== "planned";
      viewNote.hidden = item.status === "planned";
      applyAttributes();
      drawColours(item);
      drawOptions();
      drawFacts(item);
      drawEmbed();
    },
    onStyle() {
      applyAttributes();
      drawEmbed();
    },
    /** Reads the address again after Back or Forward. */
    sync() {
      applyAttributes();
      drawOptions();
      if (current && address.get("colour") !== colourNow) drawColours(current);
      drawEmbed();
    },
  };
}
