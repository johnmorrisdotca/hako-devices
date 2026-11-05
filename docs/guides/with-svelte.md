---
title: Svelte
section: how-to
order: 5
description: Use the element in Svelte, in a page that is built and opened.
---

Svelte passes the `device` attribute straight through. `onMount` never runs on the server, so the import waits for a browser. The files below are in `examples/svelte/`, word for word.

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
