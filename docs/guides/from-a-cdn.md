---
title: A page with a script tag
section: how-to
order: 2
description: Load the element from jsDelivr or unpkg, with no install step.
---

Save either page and open it. The import map names the three.js a 3D view uses, and the module script defines `<hako-device>`. The drawing shows at once. When the browser can draw it, the 3D view takes over. `@0` means the newest 0.x release.

These two files live in `examples/`, and the pages below are those files.

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
