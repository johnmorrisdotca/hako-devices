---
title: Vite と webpack
section: how-to
order: 3
description: CDN を使わず、Vite または webpack で要素をバンドルします。
---

パッケージと three.js をインストールします（`npm install @johnmorrisdotca/hako-devices three`）。要素のインポートは一度だけです。線画だけを表示するページでは、three.js は読み込まれません。下の各ファイルは `examples/` にあるものと同じ内容です。

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

同じインポートは webpack 5 でも使えます。設定はこれだけです。

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
