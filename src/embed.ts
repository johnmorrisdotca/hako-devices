// `embedCode`: the text to put a device in a page, in each of the five ways: the custom element, an iframe of `embed.html`, a JavaScript module, and the SVG itself or a data address.
// This entry imports the builder, so it needs three.js. The root entry does not.
import { deviceByKey } from "./catalogue.ts";
import { build, buildPart } from "./build/index.ts";
import type { Description } from "./fit.ts";
import { COMING_SOON_SVG } from "./placeholder.ts";
import { cleanStyle } from "./styles.ts";
import { attributesFromOptions, deviceToParams, type DeviceOptions } from "./attrs.ts";

export const EMBED_KINDS = ["element", "iframe", "module", "svg", "data"] as const;
export type EmbedKind = (typeof EMBED_KINDS)[number];

export interface EmbedSettings {
  /** The address of the published demo, where `embed.html` is. */
  site?: string;
  /** The CDN or package path the element is loaded from. */
  cdn?: string;
}

export const SITE = "https://johnmorrisdotca.github.io/hako-devices/";
export const CDN = "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hako-devices@0";

const esc = (value: string): string => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export { attributesFromOptions, deviceFromParams, deviceToParams, optionsFromAttributes } from "./attrs.ts";
export type { DeviceOptions } from "./attrs.ts";

function descriptionOf(options: DeviceOptions): Description | null {
  if (options.build) {
    try {
      const parsed = JSON.parse(options.build) as Description;
      if (parsed && typeof parsed === "object") return options.print ? { ...parsed, print: options.print } : parsed;
    } catch {
      // not JSON: the named device, when there is one
    }
  }
  const entry = options.key ? deviceByKey(options.key) : undefined;
  if (!entry) return null;
  return options.print ? { ...entry.parts, print: options.print } : entry.parts;
}

function drawingOf(options: DeviceOptions): string {
  const style = cleanStyle(options.drawingStyle);
  try {
    if (options.part) return buildPart(options.part).svg(style);
    const description = descriptionOf(options);
    if (!description) return COMING_SOON_SVG;
    return build(description).svg(style);
  } catch {
    return COMING_SOON_SVG;
  }
}

/** The text of one embed. The `module` one imports the package; the `data` one is a `data:image/svg+xml` address for an `<img>`. */
export function embedCode(options: DeviceOptions, kind: EmbedKind = "element", settings: EmbedSettings = {}): string {
  const site = settings.site ?? SITE;
  const cdn = settings.cdn ?? CDN;
  if (kind === "svg") return drawingOf(options);
  if (kind === "data") return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(drawingOf(options))}`;
  if (kind === "iframe") {
    const query = deviceToParams(options).toString();
    const src = `${site}embed.html${query === "" ? "" : `?${query}`}`;
    return `<iframe\n  src="${esc(src)}"\n  title="${esc(options.label ?? "Device")}"\n  loading="lazy"\n  style="width:100%;max-width:480px;aspect-ratio:320 / 220;border:0"\n></iframe>`;
  }
  if (kind === "module") {
    const style = cleanStyle(options.drawingStyle);
    if (options.part) {
      return `import { buildPart } from "${cdn}/dist/build/index.js";\n// or, from npm: import { buildPart } from "@johnmorrisdotca/hako-devices/build";\n\ndocument.querySelector("#device").innerHTML = buildPart(${JSON.stringify(options.part)}).svg(${JSON.stringify(style)});`;
    }
    const description = descriptionOf(options);
    const call = description ? `build(${JSON.stringify(description, null, 2)}).svg(${JSON.stringify(style)})` : `buildDevice(${JSON.stringify(options.key ?? "")}).svg(${JSON.stringify(style)})`;
    const named = description ? "build" : "buildDevice";
    return `import { ${named} } from "${cdn}/dist/build/index.js";\n// or, from npm: import { ${named} } from "@johnmorrisdotca/hako-devices/build";\n\ndocument.querySelector("#device").innerHTML = ${call};`;
  }
  const attrs = Object.entries(attributesFromOptions(options)).map(([name, value]) => (value === "" ? name : `${name}="${esc(value)}"`));
  return `<script type="module" src="${cdn}/dist/element.js"></script>\n\n<hako-device${attrs.length === 0 ? "" : `\n  ${attrs.join("\n  ")}`}\n></hako-device>`;
}
