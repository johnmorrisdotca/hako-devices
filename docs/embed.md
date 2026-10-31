# Put a device on your own site

The drawings are made to be used, under the MIT licence. A page of yours can show the same device the demo shows, in any of five ways. The demo copies the code for whatever is on the screen.

| Way | When |
| --- | --- |
| Custom element | The page can run a script. |
| Embed page | The page cannot run a script. Use an iframe. |
| Module | You want the SVG from a script of your own. |
| SVG | You want the drawing itself. |
| Data address | You want it in an `<img>`, with no file of your own. |

`embedCode` is on `@johnmorrisdotca/hako-devices/embed`, because making the SVG needs three.js. The attribute helpers are also on the root entry, which does not.

```ts
import { attributesFromOptions, embedCode, deviceFromParams, deviceToParams } from "@johnmorrisdotca/hako-devices/embed";

const options = { key: "pi4", drawingStyle: "thin" };
embedCode(options, "element").includes("<hako-device"); // true
embedCode(options, "iframe").includes("embed.html"); // true
attributesFromOptions(options).key; // "pi4"
deviceFromParams(deviceToParams(options)).key; // "pi4"
```

## The embed page

For a page that cannot run script: an iframe of `embed.html` that draws what its address says. The query is the element's attributes. A flag such as `fireflies` is `1`.

```html
<iframe src="https://johnmorrisdotca.github.io/hako-devices/embed.html?key=pi4&drawing-style=thin" title="Device" style="width:100%;max-width:480px;aspect-ratio:320 / 220;border:0"></iframe>
```

The page shows the drawing at once, and the 3D view when the browser can draw it. A device with no mesh yet shows the one "Coming soon" picture.

On a page with no bundler, the element needs an import map that names `three`, or use the embed page, which already has it.
