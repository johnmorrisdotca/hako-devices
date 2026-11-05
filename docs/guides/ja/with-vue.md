---
title: Vue
section: how-to
order: 4
description: Vue で要素をカスタム要素として使い、ビルドして開くページにします。
---

Vue は、そのタグがカスタム要素だと教えれば `<hako-device>` を描画できます。コンポーネントはページに載ってから要素をインポートするので、サーバーでの描画では読み込みません。下のファイルは `examples/vue/` にあるものと同じ文です。

## コンポーネント

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

## ページ

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

## タグが要素だと Vue に伝える

```ts
import vue from "@vitejs/plugin-vue";

export default { plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag: string) => tag.startsWith("hako-") } } })] };
```
