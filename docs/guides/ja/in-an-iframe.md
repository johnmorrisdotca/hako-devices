---
title: 埋め込みページの iframe
section: how-to
order: 7
description: サイト側で要素を動かせないときは、埋め込みページを iframe で表示します。
---

スクリプトを実行できないサイトでも、機器を表示できます。埋め込みページは、URL で指定された機器を描画します。下のコードは `examples/iframe.html` と同じ内容です。

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
