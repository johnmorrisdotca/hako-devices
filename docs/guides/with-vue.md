---
title: Vue
section: how-to
order: 4
description: Use the element in Vue as a custom element, in a page that is built and opened.
---

Vue can render `<hako-device>` once it is told the tag is a custom element. The component imports the element after it is on the page, so a server render never loads it. The files below are in `examples/vue/`, word for word.

## The component

```html
<script setup lang="ts">
import { onMounted } from "vue";

withDefaults(defineProps<{ device?: string }>(), { device: "pi4" });

// The element needs a browser: import it once the component is on the page, never while a server renders it.
onMounted(() => {
  void import("@johnmorrisdotca/hako-devices/element");
});
</script>

<template>
  <hako-device :device="device" drawing-style="thick"></hako-device>
</template>
```

## The page

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hako Devices with Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

```ts
import { createApp } from "vue";
import DeviceView from "./DeviceView.vue";

createApp(DeviceView).mount("#app");
```

## Tell Vue the tag is an element

```ts
import vue from "@vitejs/plugin-vue";

export default { plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag: string) => tag.startsWith("hako-") } } })] };
```
