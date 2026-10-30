// A thin React wrapper round `<hako-device>`. React keeps `key` for itself, so the wrapper passes `device`, the element's other name for it.
import { createElement, useEffect, useRef, type HTMLAttributes, type Ref } from "react";
import type { Description } from "./fit.ts";
import type { Painter } from "./element/scene.ts";
import type { StyleName } from "./styles.ts";

export interface HakoDeviceProps extends Omit<HTMLAttributes<HTMLElement>, "style"> {
  /** A device by its catalogue key. */
  device?: string;
  /** A machine from parts. */
  build?: Description;
  drawingStyle?: StyleName;
  mode?: "auto" | "drawing";
  assets?: string;
  spin?: string | number;
  way?: "cw" | "ccw";
  label?: string;
  print?: string;
  scale?: "fit" | "real";
  unit?: string | number;
  ruler?: boolean;
  fireflies?: boolean;
  noGround?: boolean;
  flipped?: boolean;
  /** What its screen shows: words, a canvas, or a function that draws on one. */
  screen?: Painter;
  ref?: Ref<HTMLElement>;
}

type ElementWithScreen = HTMLElement & { screen: Painter | null };

export function HakoDevice({ device, build, drawingStyle, mode, assets, spin, way, label, print, scale, unit, ruler, fireflies, noGround, flipped, screen, ref, ...rest }: HakoDeviceProps) {
  const own = useRef<ElementWithScreen | null>(null);
  useEffect(() => {
    void import("./element.ts");
  }, []);
  useEffect(() => {
    if (own.current) own.current.screen = screen ?? null;
  }, [screen]);
  const on = (value: boolean | undefined) => (value ? "" : undefined);
  return createElement("hako-device", {
    ...rest,
    ref: (node: ElementWithScreen | null) => {
      own.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLElement | null }).current = node;
    },
    device,
    build: build ? JSON.stringify(build) : undefined,
    "drawing-style": drawingStyle,
    mode,
    assets,
    spin,
    way,
    label,
    print,
    scale,
    unit,
    ruler: on(ruler),
    fireflies: on(fireflies),
    "no-ground": on(noGround),
    flipped: on(flipped),
  });
}
