---
title: 埋め込みページの iframe
section: how-to
order: 7
description: サイト自身が要素を動かせないときは、埋め込みページを枠に入れます。
---

スクリプトを動かせないサイトでも、機械は見せられます。埋め込みページは、アドレスが名指ししたものを描きます。下のファイルは `examples/iframe.html` そのものです。

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
