---
title: はじめに
section: tutorial
order: 1
description: カタログから1台を読み、同じ機械をページに置きます。
---

このガイドでは、カタログから Mac Studio を読み、その機械をカスタム要素としてページに置きます。カタログには Node 22 以降が、ページにはブラウザーが必要です。

## 1台を読む

カタログはただのデータです。ブラウザーなしで、Node で動きます。

```ts no-run
import { deviceByKey } from "@johnmorrisdotca/hako-devices";

const studio = deviceByKey("mac-studio");
console.log(studio?.name);
```

`deviceByKey` は機械を返します。そのキーがカタログにないときは `undefined` です。通称は `findMachine` で引けます。

```ts no-run
import { findMachine } from "@johnmorrisdotca/hako-devices";

console.log(findMachine("trash-can")?.key);
```

## ページに置く

要素を一度インポートします。それで `<hako-device>` タグが定義されます。three.js はピア依存で、線画だけを出すページは three.js を読み込みません。

```ts no-run
import "@johnmorrisdotca/hako-devices/element";
```

```html
<hako-device key="mac-studio" mode="drawing" style="max-width: 360px"></hako-device>
```

`mode="drawing"` は線画のままにします。`mode` を付けないと、ブラウザーが描けるときはその場で3Dビューに替わります。
