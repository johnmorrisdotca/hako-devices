# The element

```html
<script type="module">
  import "@johnmorrisdotca/hako-devices/element";
</script>

<hako-device key="pi4"></hako-device>
```

Importing the module defines `<hako-device>` and `<hako-lineup>`, and it imports safely on a server. It shows the drawing at once. When the element comes on screen it loads three.js and the mesh, and the drawing becomes the 3D view without a jump: both come from one camera rule. Out of view it stops drawing and, after 30 seconds, lets its WebGL canvas go.

## Attributes

| Attribute | What |
| --- | --- |
| `key` | A device by its catalogue key. `device` is the same thing, for React, which keeps `key` for itself |
| `part` | A part on its own, by its id |
| `build` | A machine from parts, as JSON. The `description` property takes the object |
| `drawing-style` | `thin` (the default) or `thick`. `style` works too, but it is HTML's global attribute and a strict content security policy reports it |
| `mode` | `auto` (the default) or `drawing`: never load 3D |
| `assets` | Where the files are. Left out: `setAssetBase(url)`, else `./assets/` beside the module |
| `spin` | Seconds a turn, or `off`, `slow`, `medium`, `fast`. Default 180 |
| `way` | `cw` or `ccw` |
| `label` | What a screen reader says; the catalogue's name by default |
| `print` | Your own words on the device's main area, at your own risk |
| `scale` | `real` for true size (see [To scale](scale.md)) |
| `unit` | Pixels a millimetre at real scale: `2px/mm` |
| `ruler` | A ruler under it at real scale; a number names its length in millimetres |
| `fireflies` | Three little lights drifting round it |
| `no-ground` | No pool of light under it |
| `flipped` | Turned half a turn, its screen's picture too |
| `body-colour` | `#rrggbb`: the body of the mesh in this colour, in the 3D view. A tint, not a drawing of that colour: [what colours a machine came in](assets.md#what-colours-a-machine-came-in) |

## What it says

`data-view` on the element is `picture`, `loading`, `3d`, `fallback` or `planned`; `data-why` says why it stayed a drawing: `off`, `no-webgl`, `reduced-data`, `context-lost`, `error`, `planned` or `unknown-key`. Events, which bubble: `hako-ready`, `hako-fallback` (`detail.reason`), `hako-planned` (`detail.key`, `detail.name`, `detail.known`) and `hako-error` (`detail.error`).

The parts you can style are `frame`, `figure`, `drawing`, `canvas`, `tilt` and `ruler`, with `::part()`. The element has no background of its own.

## Keys and touch

Drag turns it and a finger still scrolls the page up and down. These are the element's own hands, for a page that adds none; [the family's view controls](#the-familys-view-controls) can take them over. Once it has the focus the wheel and a pinch zoom. Arrow keys turn it, `+` and `-` zoom, Home, `0` or a double-click put it back. On a phone leaning it turns the view a little; where a browser must ask first, a "Tilt to turn" button asks. Under `prefers-reduced-motion` nothing turns by itself and the crossfade is a short fade. The 3D canvas is held to a pixel budget (`pixelRatioFor`: a ratio of 2 at most, 4096 pixels on a side and 6 million in all), and it draws only while something moves, never out of sight or in a hidden tab.

## The family's view controls

`<kazoku-view-controls>` from [`@johnmorrisdotca/kazoku-ui`](https://www.npmjs.com/package/@johnmorrisdotca/kazoku-ui) is one set of controls for every project in the family: the angle, Auto-turn, zoom with its number and Fit, and behind More (or `controls="advanced"`) the tilt, Front and moving the view, with the same drag, pinch, wheel (with Ctrl or Command) and keys everywhere. It never draws; it tells the page what was chosen, and the page hands that to the element with `drive()`. This package does not import it, so it adds nothing to your bundle unless your page uses it. The demo does, as a devDependency.

```html
<hako-device id="device" key="pi4"></hako-device>
<kazoku-view-controls for="device" address></kazoku-view-controls>

<script type="module">
  import "@johnmorrisdotca/hako-devices/element";
  import "@johnmorrisdotca/kazoku-ui/view-controls/define";

  const controls = document.querySelector("kazoku-view-controls");
  controls.addEventListener("kazoku-viewchange", (event) => document.getElementById("device").drive(event.detail));
</script>
```

`element.drive({ yaw, tilt, zoom, panX, panY })` takes what the controls report: `yaw` and `tilt` in degrees, `zoom` (1 is the whole device in the picture; held to 0.25 to 8) and the pan in pixels. Each is optional and must be a finite number, or what was stays. The first call hands over: the element's own drag, wheel, keys and spin stand down, `data-driven` is set, and the 3D view follows. `drive(null)` takes the hands back.

- Yaw 0 and tilt 0 is the view the device first shows. Dragging right makes `yaw` larger, which carries the camera to the left; a larger `tilt` lowers it. The camera keeps the distance that holds the whole device, so turning never makes it breathe, and zoom is the camera's, so a zoomed 3D view stays sharp.
- The flat drawing cannot turn, so it follows only the zoom and the pan (a transform of the picture, nothing drawn again). Give the controls `flat` when the element says `hako-fallback`, as the demo does.
- Another device keeps the view: change `key` and the new device opens turned, tipped and zoomed as the last one was.
- Tilt to turn on a phone still works, added to the chosen view.
- The canvas pixel budget, and the pause out of sight, apply as ever.

## A live screen

A device with a screen shows its own sample words until you paint it. Paint it with words, a canvas of yours, or a function that draws on one the size of the screen's pixels:

```js
const device = document.querySelector("hako-device");
device.paintScreen({ title: "Kitchen", subtitle: "Home", lines: ["3 screens are on"], status: "good", badge: "OK", buttons: ["Menu"] });
device.paintScreen(myCanvas);
device.paintScreen((ctx, width, height) => {
  ctx.fillStyle = "#14304f";
  ctx.fillRect(0, 0, width, height);
});
```

The words are laid out for each kind of screen: a one-bit picture on a small OLED, a touch panel's rail of buttons, black on paper for e-paper. The pure functions behind them are in the root entry: `oledPicture`, `panelPicture`, `desktopPicture`, `phonePicture`, `paperPicture`.

## React

```jsx
import { HakoDevice } from "@johnmorrisdotca/hako-devices/react";

<HakoDevice device="pi4" drawingStyle="thick" scale="real" unit="2px/mm" />;
<HakoDevice build={{ board: "pi4", case: "armor", hat: "pitft-28" }} screen={{ title: "Kitchen" }} />;
```

React keeps `key` and `style` for itself, so the props are `device` and `drawingStyle`.

## Content security policy

The element uses constructable style sheets and the DOM's own style objects, and loads no inline script or style. It needs `img-src` and `connect-src` to reach the assets. The demo runs under `default-src 'self'` with nothing added but `img-src data:`.

The same attributes are the query of [the embed page](embed.md), for a site that cannot run script. `embedCode` writes the snippet.

## With no bundler

An import map names three.js and the package:

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/",
      "@johnmorrisdotca/hako-devices/element": "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hako-devices/dist/element.js"
    }
  }
</script>
```
