---
title: Angular
section: how-to
order: 6
description: Angular で要素を使い、ビルドして開けるページを作ります。
---

タグを使うコンポーネントに `CUSTOM_ELEMENTS_SCHEMA` を追加します。`ngOnInit` はサーバーでの描画でも実行されるので、インポートはブラウザーのときだけ行います。下のファイルは `examples/angular/` にあるものと同じ内容です。

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-device-view",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<hako-device [attr.device]="device" drawing-style="thick"></hako-device>`,
})
export class DeviceViewComponent implements OnInit {
  @Input() device = "pi4";

  ngOnInit(): void {
    if (typeof window !== "undefined") void import("@johnmorrisdotca/hako-devices/element");
  }
}
```

```ts
import "@angular/compiler";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { DeviceViewComponent } from "./device-view.component";

void bootstrapApplication(DeviceViewComponent, { providers: [provideZonelessChangeDetection()] });
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hako Devices with Angular</title>
  </head>
  <body>
    <app-device-view></app-device-view>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```
