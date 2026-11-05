---
title: スクリプトタグのあるページ
section: how-to
order: 2
description: インストールせずに、jsDelivr または unpkg から要素を読み込みます。
---

どちらのページも保存して開いてください。インポートマップは3Dビューが使う three.js を指し、モジュールのスクリプトが `<hako-device>` を定義します。線画はすぐ出ます。ブラウザーが描けるときは3Dビューに替わります。`@0` は 0.x の最新版を指します。

この2つのファイルは `examples/` にあり、下のページはそのファイルそのものです。

## jsDelivr

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hako Devices from jsDelivr</title>
    <script type="importmap">
      { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/" } }
    </script>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hako-devices@0/dist/element.js"></script>
  </head>
  <body>
    <hako-device key="pi4" drawing-style="thick" style="max-width: 360px"></hako-device>
  </body>
</html>
```

## unpkg

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hako Devices from unpkg</title>
    <script type="importmap">
      { "imports": { "three": "https://unpkg.com/three@0.186.1/build/three.module.js", "three/addons/": "https://unpkg.com/three@0.186.1/examples/jsm/" } }
    </script>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/hako-devices@0/dist/element.js"></script>
  </head>
  <body>
    <hako-device key="pi4" drawing-style="thick" style="max-width: 360px"></hako-device>
  </body>
</html>
```
