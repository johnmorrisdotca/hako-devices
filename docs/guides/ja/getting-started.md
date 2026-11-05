---
title: はじめに
section: tutorial
order: 1
description: カタログから機器を1台取り出し、同じ機器をページに置きます。
---

このガイドでは、カタログから Mac Studio を取り出し、その機器をカスタム要素としてページに置きます。カタログを使うには Node 22 以降が、ページに置くにはブラウザーが必要です。

## 1台を取り出す

カタログはただのデータなので、ブラウザーがなくても Node で動きます。

```ts no-run
import { deviceByKey } from "@johnmorrisdotca/hako-devices";

const studio = deviceByKey("mac-studio");
console.log(studio?.name);
```

`deviceByKey` は機器を返します。そのキーがカタログにない場合は `undefined` を返します。通称からは `findMachine` で探せます。

```ts no-run
import { findMachine } from "@johnmorrisdotca/hako-devices";

console.log(findMachine("trash-can")?.key);
```

## ページに置く

要素を一度インポートすると、`<hako-device>` タグが定義されます。three.js はピア依存のパッケージで、線画だけを表示するページでは読み込まれません。

```ts no-run
import "@johnmorrisdotca/hako-devices/element";
```

```html
<hako-device key="mac-studio" mode="drawing" style="max-width: 360px"></hako-device>
```

`mode="drawing"` を指定すると線画のままです。`mode` を省略すると、ブラウザーが対応していれば、その場で3Dビューに切り替わります。
