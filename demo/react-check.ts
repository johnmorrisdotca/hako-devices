// The React wrapper on a page of its own, for the browser tests.
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { setAssetBase } from "../src/element.ts";
import { HakoDevice } from "../src/react.ts";

setAssetBase(new URL("assets/", document.baseURI).href);
const node = document.getElementById("root");
if (node) createRoot(node).render(createElement(HakoDevice, { device: "pi4", mode: "drawing", id: "react-device" }));
