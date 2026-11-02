# The machine list as JSON

Every machine in the catalogue, as one static JSON file you can read without installing or running anything.

- **From npm:** `@johnmorrisdotca/hako-devices/machines.json`, the file of the version you installed.
- **From the web:** https://johnmorrisdotca.github.io/hako-devices/machines.json, the file of the newest commit on `main`. Its `version` field says which package version it matches. The site allows other sites to read it.

```js
import list from "@johnmorrisdotca/hako-devices/machines.json" with { type: "json" };

const built = list.machines.filter((machine) => machine.status === "built");
```

```js
const list = await (await fetch("https://johnmorrisdotca.github.io/hako-devices/machines.json")).json();
```

## What is in it

The file is made from the package's own catalogue, tags and ports by `scripts/make-machines.ts`, so it says what `catalogue()`, `statusOf`, `meshOf` and `tagsOf` say. It is one object with the machines one to a line.

| Field | Meaning |
| --- | --- |
| `schema` | The shape of this file. It is `1`, and a change that breaks a reader makes it `2` |
| `package` | The package it comes from |
| `version` | The package version it was made for |
| `licence` | Where the licence terms are: `see LICENSES/ and NOTICE.md` |
| `sources` | Where the facts come from: `see NOTICE.md` |
| `machines` | The list, in catalogue order: the drawn devices, then the real models they cover, then those still to come |

Each machine:

| Field | Meaning |
| --- | --- |
| `key` | Its identifier, the same as `<hako-device key="...">` and `catalogue()` |
| `name` | Its name, as plain descriptive words |
| `aliases` | Other names it goes by, in lowercase kebab-case ASCII, such as `trash-can` for `mac-pro-late-2013`. Empty when it has none. See [aliases](#aliases) |
| `maker` | Its brand, or `null` |
| `family` | Its product line, such as `Power Mac` or `Galaxy Tab S` |
| `status` | `built` when a mesh and drawings draw it, `planned` when it has a name and no shape yet |
| `mesh` | The `key` of the device that draws it: its own for a drawn device, another for a model that device covers, `null` when `planned` |
| `size` | Width, depth and height in millimetres, as `[w, d, h]`, for a drawn device whose size is published. `null` otherwise |
| `ports` | A drawn device's ports as `{ "kind", "count" }`. Empty when it has none or is not drawn |
| `tags` | What the machine is, as lists of values by facet: `maker`, `type`, `decade`, `discontinued`, `cpuMaker`, `cpu`, `cores`, `ram`, `os`, `screen`, `ports`, `wireless`, `weight`, `colour`, `generation`, `parts`. A fact with no source is absent, never guessed. See [tags](#tags) |
| `colours` | The colours it came in, as `{ "name", "swatch", "drawing" }`: the maker's word, a chip as `{ "value", "from" }` or `null`, and the key of its drawing or `null`. Empty means nobody has checked. The pages are `coloursOf`'s, in [the colours entry](assets.md#what-colours-a-machine-came-in) |

## Tags

`tags` says what a machine is, by kind. A value is there only when a page says so; a missing kind means nobody has sourced it, not that the machine lacks it. The pages stay in `data/wishlist.json` (`tagSources`) and are not published.

| Kind | Values |
| --- | --- |
| `maker`, `type`, `decade` | The brand, the shape of the machine and the decade of its year. Worked out from the list itself |
| `discontinued` | The year the maker stopped selling it, such as `2014`. Left out where a page gives several years for one machine |
| `cpuMaker`, `cpu`, `cores`, `ram` | As the source words them |
| `os` | The system it shipped with, as the source names it: `Mac OS` (System 1 to Mac OS 9), `Mac OS X`, `OS X`, `macOS`, `iOS`, `Android`, `Palm OS`... For a bare NUC kit, which ships with none, the systems Intel lists as supported |
| `screen`, `generation` | Read from the machine's own name, or a page |
| `ports`, `parts` | A drawn device's own ports and parts, or the ports a page lists |
| `wireless` | `Wi-Fi`, `Bluetooth` or `Cellular`: every radio a page names for the machine, including a version with a SIM. An optional card is not counted |
| `weight` | `Under 1 kg`, `1 to 3 kg`, `3 to 10 kg` or `Over 10 kg`; a page that gives several weights in different bands is left out |
| `colour` | The finishes the maker gives it, in the maker's words: `Space Gray`, `Pink Gold`. The same list as `colours` |

**Every tag has a page.** In `data/wishlist.json` a machine's `tagSources` gives the pages for each kind, `{ "os": ["https://..."] }`. Brand, type and decade need none. A generation or a screen size may be read from the name (`iPad (3rd generation)`, `MacBook Pro (13-inch)`). Ports, screen and generation without `tagSources` rest on the machine's `tagsSource` or `dimensionsSource`. CPU, CPU maker, cores and memory do too, but their page must be about the machine itself (below). Operating system, wireless, weight, colour and discontinued year always need their own `tagSources`. `pnpm wishlist` and `pnpm test` fail on a tag with no source, on a source that is not a page address and on a kind the package does not know.

**A family's page is not a model's.** A page gives a machine a tag only when the page is about that machine: its title is the machine's name (an article for the Wii U, Apple's own page for one Mac). The Atari 2600 article says nothing about the Atari 2600 Jr., and a later revision may have another chip, weight or end date, so it gets nothing from it. A fact stays empty until a page of its own gives it. For CPU, CPU maker, cores and memory `pnpm wishlist` and `pnpm test` enforce it: a Wikipedia article counts only when its title is the machine's name (`Wii_U` for the Wii U; `Mac_Mini` is the series, not the Mac mini (Late 2012)), and a maker's page counts when it is that machine's spec page (Apple's, Intel's Ark, ASUS's, Raspberry Pi's). A list, a series article or a document on a family does not. Where a machine's own page does not say, the tag is absent.

## Aliases

A machine can have other names: a nickname (`trash-can`), a maker's prefix swapped (`raspberry-pi-zero` for `rpi-zero`), a model number (`nuc5i5ryk`), a short form (`ps2`, `gba`) or a year form (`mac-pro-2013`). They are the `aliases` field of the machine in `data/wishlist.json`, and the rules are:

- **Lowercase kebab-case ASCII**: letters, digits and single hyphens, such as `mac-pro-2013`.
- **One machine each.** An alias never belongs to two machines, and never equals any machine's `key`. A nickname that fits several machines (the cheese grater Mac Pros) goes to the first one, and the others get the year: `cheese-grater-mac-pro-2008`.
- **Well known names only.** An alias that is a guess is left out, as a wrong fact is.

`findMachine` takes a key or an alias and gives back the machine, so a page does not need to know which it was given. `aliasesOf` gives a machine's aliases.

```js
import { aliasesOf, findMachine } from "@johnmorrisdotca/hako-devices";

findMachine("trash-can")?.key; // "mac-pro-late-2013"
findMachine("Trash Can")?.key; // "mac-pro-late-2013": case, spaces and underscores are forgiven
findMachine("rpi-zero")?.name; // "Raspberry Pi Zero": a key finds its machine too
aliasesOf("mac-pro-late-2013"); // ["trash-can", "trashcan-mac-pro", ..., "mac-pro-2013"]
findMachine("no-such-machine"); // undefined
```

A test fails on a malformed alias, on an alias two machines share and on one that is another machine's key. The demo's search matches aliases too.

## What is not in it

Only what the package already ships. The sizes of machines not yet drawn, their years and dates, and the page each fact came from stay in `data/wishlist.json` and are not published. A reader who needs a missing field should open an issue rather than guess it.

## Sources and licence

The names, tags and sizes are plain facts read from public pages: the makers' own pages, Wikipedia (CC BY-SA 4.0) and reviews. [NOTICE.md](../NOTICE.md) lists them, and whatever rights those pages hold in what they publish stay theirs. The package's MIT licence ([LICENSES](../LICENSES/MIT.txt)) covers this package's own work. The licence for the list's data as data has not been decided yet; the `licence` field points at the files that say where it stands, and will change when it is.

## When machines are added, this file is regenerated

Adding or changing a machine means regenerating this file and publishing it with the machine. After editing `data/wishlist.json` or `src/catalogue.ts`:

```sh
pnpm wishlist   # writes src/wishlist.ts, src/tag-data.ts and docs/wishlist.md
pnpm machines   # writes data/machines.json
```

Commit `data/machines.json` with the change. `pnpm check` fails, with the message "run `pnpm machines`", when the file is not what the model gives, so a machine cannot be added without it. The build copies the file into the package as `dist/machines.json`, and every push to `main` puts it on the demo site. A release regenerates it too, because `version` is part of it.
