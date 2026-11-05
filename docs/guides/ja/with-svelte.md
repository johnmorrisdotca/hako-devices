---
title: Svelte
section: how-to
order: 5
description: Svelte で要素を使い、ビルドして開けるページを作ります。
---

Svelte は `device` 属性をそのまま要素に渡します。`onMount` はサーバーでは実行されないので、インポートはブラウザーで実行されたときに行われます。下のファイルは `examples/svelte/` にあるものと同じ内容です。

```html
<script lang="ts">
  import { onMount } from "svelte";

  let { device = "pi4" }: { device?: string } = $props();

  // The element needs a browser: onMount never runs on the server.
  onMount(() => {
    void import("@johnmorrisdotca/hako-devices/element");
  });
</script>

<hako-device {device} drawing-style="thick"></hako-device>
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hako Devices with Svelte</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

```ts
import { mount } from "svelte";
import DeviceView from "./DeviceView.svelte";

mount(DeviceView, { target: document.getElementById("app")! });
```
