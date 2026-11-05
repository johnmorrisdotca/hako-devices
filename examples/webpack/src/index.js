import "@johnmorrisdotca/hako-devices/element";

const device = document.createElement("hako-device");
device.setAttribute("key", "pi4");
device.setAttribute("drawing-style", "thick");
device.style.maxWidth = "360px";
document.body.append(device);
