# Assets

The package ships ready files under `dist/assets`, at `@johnmorrisdotca/hako-devices/assets/*`.

| File | What |
| --- | --- |
| `<key>.glb` | The mesh of a device: metres, standing on y = 0, centred on its footprint, under 300 KB |
| `<key>.svg` | Its drawing in the default style |
| `<key>.thick.svg` | Its drawing in the thick style |
| `client-<kind>-small.svg` | A heavier line, for about 48 pixels wide |
| `parts/<id>.glb`, `parts/<id>.svg`, `parts/<id>.thick.svg` | A part on its own |
| `coming-soon.svg` | The one picture of a machine with no mesh yet |

A `.glb` is plain glTF 2.0 with `KHR_mesh_quantization`, so any viewer reads it; it has no textures. Its nodes are named: `spin-y*` and `spin-z*` are fans the viewer turns; `screen-<kind>-<width>x<height>` is a screen, its texture coordinates 0 to 1 across the face; `perf-<across>-<down>-<dot>` is a field of fine holes the viewer paints; `print-<area>` is a clear face for the caller's words. Materials named `led-*` are lights.

Generating them is deterministic: the same description gives the same bytes.

```ts
import { DEVICES, deviceByKey } from "@johnmorrisdotca/hako-devices";

deviceByKey("pi4")?.size; // [85, 56, 17]
DEVICES.length > 50; // true
```

## Built or planned

```ts
import { catalogueCounts, meshOf, statusOf } from "@johnmorrisdotca/hako-devices";

statusOf("pi4"); // "built"
statusOf("a-machine-nobody-has"); // null
meshOf("mac-pro-2019"); // "mac-pro"
catalogueCounts().total > 1000; // true
```

Machines on the list carry a `shelf` (`SHELVES`: Apple, Microsoft, Game consoles, Retro phones and PDAs, Retro home computers), a `maker` and a `family`, and `headingOf(entry)` names the family on its shelf ("Nintendo DS"). The demo's gallery groups them that way.

A real machine a built mesh covers is built, and `<hako-device key="mac-pro-2019">` draws that mesh. A planned one shows the one "Coming soon" picture.

## Finding the key for a real machine

```ts
import { deviceKeyOf, macKey, nasKey, piKey } from "@johnmorrisdotca/hako-devices";

piKey("Raspberry Pi 4 Model B Rev 1.4"); // "pi4"
macKey("Mac13,1"); // "mac-studio"
nasKey("DS923+"); // "nas-4bay"
deviceKeyOf({ platform: "darwin", macModel: "Mac16,10" }); // "mac-mini"
```
