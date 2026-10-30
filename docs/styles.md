# Styles

A drawing style is one small table of settings in `src/styles.ts`. Every device and part is made in every style, from the same solids and the same camera, so a style can never change a shape.

| Setting | `thin` | `thick` | What |
| --- | --- | --- | --- |
| `line` | `#8fa1b8` | `#b4c2d4` | The colour of its lines |
| `outline` | 1 | 3.5 | How much heavier an outline is |
| `detail` | 1 | 1.8 | How much heavier any finer line is |
| `fills` | none | none | A fill to put in place of another, by colour |
| `pictures` | `fine` | `big` | A screen's small picture, or a hero and three tiles in brighter colours |
| `androidEdge`, `androidShell` | none | green | What tells an Android slab apart; in `thin`, only its small round camera |
| `small` | 2.6 | none | Also makes a `client-*-small.svg` with lines this much heavier, for about 48 pixels wide |

`thin` is the default. Files: `pi4.svg` is the default style and `pi4.thick.svg` the other.

```ts
import { drawingFile } from "@johnmorrisdotca/hako-devices";
import { buildDevice } from "@johnmorrisdotca/hako-devices/build";

drawingFile("pi4", "thick"); // "pi4.thick.svg"
buildDevice("pi4").svg("thick").length > 0; // true
```

```html
<hako-device key="pi4" drawing-style="thick"></hako-device>
```

## Adding one

Add an entry to `STYLES`. That is the whole change: the assets, the element and the demo's gallery read the table.
