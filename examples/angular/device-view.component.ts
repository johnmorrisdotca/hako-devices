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
