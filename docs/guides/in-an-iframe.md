---
title: An iframe of the embed page
section: how-to
order: 7
description: Frame the embed page when a site cannot run the element itself.
---

A site that cannot run script can still show a machine. The embed page draws whatever its address names. The file below is `examples/iframe.html`, word for word.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hako Devices in an iframe</title>
  </head>
  <body>
    <iframe
      src="https://johnmorrisdotca.github.io/hako-devices/embed.html?key=pi4&drawing-style=thick"
      title="Raspberry Pi 4"
      style="width: 100%; max-width: 480px; aspect-ratio: 1; border: 0"
      loading="lazy"
    ></iframe>
  </body>
</html>
```
