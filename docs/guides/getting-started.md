---
title: Getting started
section: tutorial
order: 1
description: Read one machine from the catalogue and put the same machine on a page.
---

This guide reads a Mac Studio from the catalogue, then puts that machine on a page as a custom element. You need Node 22 or newer for the catalogue, and a browser for the page.

## Read one machine

The catalogue is plain data. It runs in Node, with no browser.

```ts no-run
import { deviceByKey } from "@johnmorrisdotca/hako-devices";

const studio = deviceByKey("mac-studio");
console.log(studio?.name);
```

`deviceByKey` returns the machine, or `undefined` when that key is not in the catalogue. A nickname works through `findMachine`:

```ts no-run
import { findMachine } from "@johnmorrisdotca/hako-devices";

console.log(findMachine("trash-can")?.key);
```

## Put it on a page

Import the element once. That defines the `<hako-device>` tag. three.js is a peer dependency, and a page that only shows the line drawing never loads it.

```ts no-run
import "@johnmorrisdotca/hako-devices/element";
```

```html
<hako-device key="mac-studio" mode="drawing" style="max-width: 360px"></hako-device>
```

`mode="drawing"` keeps the line drawing. Leave `mode` unset and, when the browser can draw it, the view turns in place.
