// A machine's colours beside its view: one small function, so any part of the demo can show them. A colour with a drawing of its own switches to it. One with none says so: the body of the mesh takes its
// swatch if it has one and the machine has a mesh, and otherwise the picture stays as it is.
import { coloursOf, type MachineColour } from "../src/colours.ts";
import { meshOf } from "../src/index.ts";
import type { HakoDevice } from "../src/element.ts";

const HOW: Readonly<Record<string, string>> = {
  page: "the colour value the page gives",
  word: "only the plain colour word in its name, not the maker's paint",
  drawing: "the colour of this machine's drawing",
};

function chipOf(colour: MachineColour): HTMLButtonElement {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip colour-chip";
  chip.dataset.testid = "colour-chip";
  chip.dataset.colour = colour.name;
  chip.dataset.drawn = String(colour.drawing !== null);
  const swatch = document.createElement("span");
  swatch.className = colour.swatch ? "swatch" : "swatch swatch-none";
  if (colour.swatch) swatch.style.background = colour.swatch.value;
  chip.append(swatch, colour.name);
  if (!colour.drawing) {
    const mark = document.createElement("small");
    mark.textContent = "no drawing";
    chip.append(mark);
  }
  return chip;
}

/** The row of a machine's colours, which drives this view. `key` is the machine's, drawn or planned. */
export function colourRow(view: HakoDevice, key: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "colours";
  row.dataset.testid = "colour-row";
  const colours = coloursOf(key);
  const note = document.createElement("p");
  note.className = "note colour-note";
  note.dataset.testid = "colour-note";
  if (colours.length === 0) {
    note.textContent = "Colours: nobody has checked this machine yet.";
    row.append(note);
    return row;
  }
  const drawn = colours.filter(({ drawing }) => drawing).length;
  note.textContent = `${colours.length} ${colours.length === 1 ? "colour" : "colours"}, ${drawn} drawn. Pick one.`;
  const chips = document.createElement("div");
  chips.className = "chips";
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Colours");
  const mesh = meshOf(key);
  const home = view.getAttribute("key") ?? key;
  const pick = (colour: MachineColour, chip: HTMLButtonElement) => {
    for (const other of chips.querySelectorAll("button")) other.setAttribute("aria-pressed", String(other === chip));
    let words: string;
    if (colour.drawing) {
      view.removeAttribute("body-colour");
      view.setAttribute("key", colour.drawing);
      words = `${colour.name} has a drawing of its own.`;
    } else {
      if (view.getAttribute("key") !== home) view.setAttribute("key", home);
      const tint = mesh ? colour.swatch : null;
      if (tint) view.setAttribute("body-colour", tint.value);
      else view.removeAttribute("body-colour");
      if (tint) words = `${colour.name} has no drawing of its own. In the 3D view this mesh's body is tinted to ${tint.value}, ${HOW[tint.from]}; nothing else changes.`;
      else if (colour.swatch) words = `${colour.name} has no drawing, and this machine has no mesh yet: only its name and swatch.`;
      else words = `${colour.name} has no drawing and no colour value: only its name, and the picture does not change.`;
    }
    const source = document.createElement("a");
    source.href = colour.sources[0];
    source.rel = "noopener noreferrer";
    source.target = "_blank";
    source.textContent = "Where this comes from";
    note.replaceChildren(`${words} `, source);
  };
  for (const colour of colours) {
    const chip = chipOf(colour);
    chip.setAttribute("aria-pressed", String(colour.drawing !== null && colour.drawing === mesh));
    chip.addEventListener("click", () => pick(colour, chip));
    chips.append(chip);
  }
  row.append(chips, note);
  return row;
}
