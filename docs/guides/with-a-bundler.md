---
title: Vite and webpack
section: how-to
order: 3
description: Bundle the element with Vite or with webpack, with no CDN.
---

Install the package and three.js (`npm install @johnmorrisdotca/hako-devices three`). Import the element once. A page that only shows the line drawing never loads three.js. Each file below is in `examples/`, word for word.

## Vite

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hako Devices with Vite</title>
  </head>
  <body>
    <hako-device id="device" key="pi4" drawing-style="thick" style="max-width: 360px"></hako-device>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

```ts
import "@johnmorrisdotca/hako-devices/element";
import { deviceByKey } from "@johnmorrisdotca/hako-devices";

const device = document.querySelector("hako-device");
if (device) device.setAttribute("print", deviceByKey("pi4")?.name ?? "");
```

## webpack

The same import works in webpack 5. The config below is the whole of it.

```js
import "@johnmorrisdotca/hako-devices/element";

const device = document.createElement("hako-device");
device.setAttribute("key", "pi4");
device.setAttribute("drawing-style", "thick");
device.style.maxWidth = "360px";
document.body.append(device);
```

```js
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```
