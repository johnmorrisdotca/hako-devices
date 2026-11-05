import "@johnmorrisdotca/hako-devices/element";
import { deviceByKey } from "@johnmorrisdotca/hako-devices";

const device = document.querySelector("hako-device");
if (device) device.setAttribute("print", deviceByKey("pi4")?.name ?? "");
