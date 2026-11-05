---
title: Vue
section: how-to
order: 4
description: Vue でカスタム要素として使い、ビルドして開けるページを作ります。
---

Vue にタグがカスタム要素だと伝えると、`<hako-device>` を描画できます。コンポーネントは、ページにマウントされてから要素をインポートします。そのため、サーバーサイドレンダリング（SSR）では読み込まれません。下のファイルは `examples/vue/` にあるものと同じ内容です。

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

## タグがカスタム要素だと Vue に伝える

```ts
import vue from "@vitejs/plugin-vue";

export default { plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag: string) => tag.startsWith("hako-") } } })] };
```
