// The demo page: one screen at a time. The gallery (pick a device in a few clicks and see it large with its options), the part builder, a lineup to scale and a live screen. The address's
// hash says which, or which device: `#pi4`, `#part:armor`, `#builder`. Everything comes from the package's own entries.
import { deviceByKey } from "../src/index.ts";
import { HakoDevice, setAssetBase } from "../src/element.ts";
import "@johnmorrisdotca/kazoku-ui/view-controls/define";
import { createBuilder } from "./builder.ts";
import { byId, el } from "./dom.ts";
import { createGallery } from "./gallery.ts";
import { FEATURED, itemById } from "./gallery-model.ts";
import { createStage } from "./stage.ts";

setAssetBase(new URL("assets/", document.baseURI).href);

const VIEWS = ["gallery", "builder", "lineup", "screen"] as const;
type View = (typeof VIEWS)[number];

// ------------------------------------------------------------- the gallery and the device on show
let gallery: ReturnType<typeof createGallery> | null = null;
const stage = createStage(() => gallery?.style() ?? new URLSearchParams(location.search).get("style") ?? "thin");
gallery = createGallery({
  onChoose: () => {
    sync();
    // on a phone the device is above the list: bring it back if it has gone
    byId("hero").scrollIntoView({ block: "nearest" });
  },
  onStyle: () => stage.onStyle(),
});

// ------------------------------------------------------------- the builder
const builder = createBuilder();

// ------------------------------------------------------------- the lineup
const lineup = byId("lineup-view");
const lineupKeys = byId<HTMLInputElement>("lineup-keys");
const lineupUnit = byId<HTMLSelectElement>("lineup-unit");
lineupKeys.addEventListener("change", () => lineup.setAttribute("keys", lineupKeys.value));
lineupUnit.addEventListener("change", () => lineup.setAttribute("unit", lineupUnit.value));

// ------------------------------------------------------------- a live screen
const screenHolder = byId("screen-holder");
const screenDevice = new HakoDevice();
screenDevice.id = "screen-device";
screenDevice.setAttribute("key", "pi4-pitft");
screenDevice.setAttribute("spin", "off");
screenDevice.dataset.testid = "screen-device";
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

// ------------------------------------------------------------- which view, which device
const links = new Map(VIEWS.map((view) => [view, document.querySelector<HTMLAnchorElement>(`.links a[data-view="${view}"]`)]));
let shown = "";
function sync() {
  const asked = decodeURIComponent(location.hash.slice(1));
  const view: View = (VIEWS as readonly string[]).includes(asked) ? (asked as View) : "gallery";
  for (const name of VIEWS) {
    byId(name).hidden = name !== view;
    const link = links.get(name);
    if (name === view) link?.setAttribute("aria-current", "page");
    else link?.removeAttribute("aria-current");
  }
  document.body.dataset.view = view;
  // only the view on the screen has a live device, and leaving takes its WebGL context back; the large one stops by itself when it is out of sight
  builder.setOpen(view === "builder");
  if (view === "screen" && !screenDevice.isConnected) screenHolder.append(screenDevice);
  if (view !== "screen" && screenDevice.isConnected) screenDevice.remove();
  const item = itemById(asked);
  if (item) {
    if (item.id !== shown) stage.show(item);
    shown = item.id;
    links.get("gallery")?.setAttribute("href", `#${encodeURIComponent(item.id)}`);
  } else if (!shown || asked === "") {
    // an address that names nothing is the page as it opens, so Back to it shows what it showed
    const first = itemById(FEATURED[0]);
    if (first && shown !== first.id) stage.show(first);
    shown = FEATURED[0];
    links.get("gallery")?.setAttribute("href", "#gallery");
  }
  stage.sync();
  gallery?.sync(shown, item ? item.id : null);
}
window.addEventListener("hashchange", sync);
window.addEventListener("popstate", sync);
sync();

export {};
