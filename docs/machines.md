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
| `maker` | Its brand, or `null` |
| `family` | Its product line, such as `Power Mac` or `Galaxy Tab S` |
| `status` | `built` when a mesh and drawings draw it, `planned` when it has a name and no shape yet |
| `mesh` | The `key` of the device that draws it: its own for a drawn device, another for a model that device covers, `null` when `planned` |
| `size` | Width, depth and height in millimetres, as `[w, d, h]`, for a drawn device whose size is published. `null` otherwise |
| `ports` | A drawn device's ports as `{ "kind", "count" }`. Empty when it has none or is not drawn |
| `tags` | What the machine is, as lists of values by facet: `maker`, `type`, `decade`, `cpuMaker`, `cpu`, `cores`, `ram`, `os`, `screen`, `ports`, `wireless`, `weight`, `generation`, `parts`. A fact with no source is absent, never guessed |

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
