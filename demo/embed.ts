// The embed page: it draws what its address says, for a site that cannot run script of its own. The address is read as text.
import { attributesFromOptions, deviceFromParams, type DeviceOptions } from "../src/attrs.ts";
import { setAssetBase, type HakoDevice } from "../src/element.ts";

setAssetBase(new URL("assets/", document.baseURI).href);

const asked = deviceFromParams(new URLSearchParams(location.search));
const options: DeviceOptions = { key: "pi4", spin: "off", ...asked };
const device = document.getElementById("device") as HakoDevice;
for (const [name, value] of Object.entries(attributesFromOptions(options))) {
  if (value === "") device.setAttribute(name, "");
  else device.setAttribute(name, value);
}
queueMicrotask(() => {
  document.documentElement.dataset.ready = "true";
});
