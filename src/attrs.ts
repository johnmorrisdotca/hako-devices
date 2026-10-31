// A device's options as text: the attributes of `<hako-device>` and the query of `embed.html` are the same words, read by one function and written by another.

export const OPTION_ATTRIBUTES = ["key", "part", "build", "drawing-style", "mode", "spin", "way", "label", "print", "scale", "unit", "ruler", "fireflies", "no-ground", "flipped"] as const;

export interface DeviceOptions {
  key?: string;
  part?: string;
  /** A machine from parts, as JSON. The same text as the `build` attribute. */
  build?: string;
  drawingStyle?: string;
  mode?: string;
  spin?: string;
  way?: string;
  label?: string;
  print?: string;
  scale?: string;
  unit?: string;
  ruler?: string;
  fireflies?: boolean;
  noGround?: boolean;
  flipped?: boolean;
}

const TEXT: readonly (keyof DeviceOptions)[] = ["key", "part", "build", "drawingStyle", "mode", "spin", "way", "label", "print", "scale", "unit", "ruler"];
const ATTR: Readonly<Record<string, string>> = { drawingStyle: "drawing-style", noGround: "no-ground" };

/** The attributes that draw these options. A flag is present or absent. */
export function attributesFromOptions(options: DeviceOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of TEXT) {
    const value = options[key];
    if (typeof value === "string" && value !== "") out[ATTR[key] ?? key] = value;
  }
  if (options.fireflies) out.fireflies = "";
  if (options.noGround) out["no-ground"] = "";
  if (options.flipped) out.flipped = "";
  return out;
}

const flag = (value: string | null): boolean => value !== null && value !== "false" && value !== "0";

/** The options `read` finds. A missing attribute is left out. */
export function optionsFromAttributes(read: (name: string) => string | null): DeviceOptions {
  const options: DeviceOptions = {};
  const take = (name: string, key: keyof DeviceOptions): void => {
    const value = read(name);
    if (value !== null && value !== "") (options as Record<string, string>)[key] = value;
  };
  take("key", "key");
  take("part", "part");
  take("build", "build");
  take("drawing-style", "drawingStyle");
  for (const name of ["mode", "spin", "way", "label", "print", "scale", "unit", "ruler"] as const) take(name, name);
  if (flag(read("fireflies"))) options.fireflies = true;
  if (flag(read("no-ground"))) options.noGround = true;
  if (flag(read("flipped"))) options.flipped = true;
  return options;
}

/** The options as a query for `embed.html`. A flag is `1`. */
export function deviceToParams(options: DeviceOptions): URLSearchParams {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(attributesFromOptions(options))) params.set(name, value === "" ? "1" : value);
  return params;
}

/** The options a query names. */
export function deviceFromParams(params: URLSearchParams): DeviceOptions {
  return optionsFromAttributes((name) => params.get(name));
}
