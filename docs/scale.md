# To scale

By default each drawing and 3D view is framed to fill its own picture, so a small board looks as big as a tower. To scale, machines keep their true relative size.

```html
<hako-device key="pi-zero" scale="real" unit="2px/mm"></hako-device>
<hako-lineup keys="pi-zero,pi5,nas-2bay" unit="1px/mm" ruler labels></hako-lineup>
```

- `unit` is pixels a millimetre: `2px/mm`, or just `2`.
- At real scale the element's box is the device's own box, so its bottom edge is the ground it stands on.
- `<hako-lineup>` stands machines side by side on one baseline, on one scale. What does not fit wraps onto another row on the same scale, so nothing is out of sight.
- `ruler` adds a ruler; `ruler="200"` names its length in millimetres. `labels` adds names under the machines. `mode="auto"` on a lineup gives each machine its 3D view; by default a lineup stays drawings, since a browser allows only a few WebGL canvases at a time.

## Lines stay one width

A tiny board is not hairline and a big tower is not heavy. At real scale every line carries `vector-effect="non-scaling-stroke"`, so its width is the one its [style](styles.md) sets, in pixels, whatever the scale. A row of dots and a drawn handle are shapes, not lines, and scale with the device.

## What a drawing records

Every drawing records how it relates to millimetres, on its root element, and `readMetrics` reads it back:

```ts
import { readMetrics, realPlacement } from "@johnmorrisdotca/hako-devices";
import { buildDevice } from "@johnmorrisdotca/hako-devices/build";

const svg = buildDevice("pi5").svg();
const metrics = readMetrics(svg); // { mmPerUnit, box, baseline }
const place = realPlacement(metrics, 2); // its size in pixels at 2 px/mm
place.width > 0; // true
```

| Attribute | What |
| --- | --- |
| `data-mm-per-unit` | Millimetres per unit of the picture, on the plane the camera looks at |
| `data-box` | The device's box on the picture: x0, y0, x1, y1 |
| `data-baseline` | The y of the ground it stands on |

`realScaleSvg(svg, unit, style)` gives a drawing's text at real scale with its lines held, for use without the element.

The picture is a perspective view, so the numbers hold exactly on the plane the camera looks at, and a corner nearer the camera is a little larger. A flat board is seen from higher up than a tall box, as in the default view.

## 3D at real scale

A 3D view takes the same scale from the mesh's real millimetres: its camera is the drawing's, on a canvas the size of the whole picture at that scale. It turns freely, and the canvas may reach past the element's box, so nothing is cut off.
