# Build from parts

A description names one machine. Give a `board` with what goes on it, or a `base` (a whole device by its catalogue key) with what goes on that.

```ts
import { build } from "@johnmorrisdotca/hako-devices/build";

const machine = build({ board: "pi4", case: "armor", hat: "pitft-28" });
machine.report.stack; // { riser: 0, under: 16.8 }
machine.size; // the mesh's width, depth and height in millimetres
machine.glb().bytes; // a .glb
machine.svg("thin"); // the drawing
machine.metrics(); // its scale, for drawing it to scale
machine.printAreas(); // where `print` can go
```

`build` throws a `FitError` when a machine does not go together; its `report` says why. `check` answers the same question with no three.js, so a form can ask on every change:

```ts
import { check } from "@johnmorrisdotca/hako-devices";

const report = check({ board: "pi3b", hat: "poe-plus" });
report.ok; // false
report.issues[0].code; // "no-poe-pins"
```

## A form that never shows an error

`whatFits` says what to offer and `nearestWorking` what to change, so a form never has to show a fault. Both are pure and need no three.js, and neither touches `print`, which stays at the person's own risk.

```ts
import { fillNeeded, nearestWorking, whatFits } from "@johnmorrisdotca/hako-devices";

// a needed choice with one answer is made for you: bare holes under a hat get their header, and a module with no hat gets the one hat that takes it
fillNeeded({ board: "pi-zero-2w", hat: "oled-bonnet" }).description; // { board: "pi-zero-2w", hat: "oled-bonnet", solderHeader: true }

// grey what cannot work, with its reason
whatFits({ board: "pi-zero-2w" }, "case").find((option) => option.id === "armor"); // { id: "armor", name: "...", fits: false, why: "... is cut for other sockets than those of ..." }

// or take anything, and change the rest: the second argument is the choice just made, which stays
const { description, changes } = nearestWorking({ board: "pi-zero-2w", case: "armor" }, "board");
description.case; // "unipi"
changes[0].message; // "the case is now Small domed case (UniPiCase Zero style)"
```

The nearest set changes as little as it can. Another case that fits is nearer than no case, because cases do one job; a hat, a module or a cooler each does its own job, so no hat is nearer than a different hat. A board moves last of all, when a part fits no other way. `hat-overhangs` stays a warning: a hat past a board's edge goes together, so it is a fact to say, not a fit to avoid. The demo's builder is both ways behind one switch.

## The description

| Field | What |
| --- | --- |
| `board` | A board: `pi1b-plus`, `pi2b`, `pi3b`, `pi3b-plus`, `pi3a-plus`, `pi4`, `pi5`, `pi-zero-w`, `pi-zero-2w`, `cm4-io` |
| `case` | `armor` (finned, keeps the header reachable; fits the USB-C full-size board), `argon` (faceted, closed; same board), `unipi` (small domed, closed; the small boards), `plate` (a plain plate on standoffs; any board) |
| `hat` | `pitft-28`, `pitft-35`, `oled-bonnet`, `epaper-213`, `poe-plus`, `proto-hat` |
| `screen` | `oled-module` (on a hat with a display header: `proto-hat`), `touch-7` (holds the board on its back) |
| `cooler` | `active-cooler` (the fan and fins for `pi5`) |
| `riser` | Millimetres of stacking header under the hat. Left out: as much as it takes to clear what is under the hat |
| `solderHeader` | Puts the pins on a board that comes with bare header holes |
| `base` | A whole device by its catalogue key, instead of a board |
| `stand` | Under a tablet or a phone: `desk-stand`, or `null` to lie flat. Left out: the desk stand |
| `drives` | The drives in a NAS's bays, in order: `hdd-35`, `ssd-25`, or `null` for an empty bay. Left out: all full |
| `print` | Your own words, at your own risk: one string for the device's main area, or by area (`{ side: "Backup" }`) |
| `turn` | `0` or `180`: which way round it stands. Left out: the way its hat reads best |

## How parts attach

| Mount | What attaches | Checked |
| --- | --- | --- |
| 40-pin header | A hat | The board has soldered pins; a closed case does not cover them; the hat's outline clears everything tall under it, by real heights |
| Four network power pins | A hat that needs them | The board has them |
| Sockets and outline | A case | The case is cut for this board's sockets, and the board fits inside it |
| Display header | A screen module | The hat has one |
| Standoffs on a display's back | A board | Its screw holes line up |
| Cooler holes | A cooler | Made for this board; not inside a closed case |
| Drive bay | A drive | Its size goes in the bay; no more drives than bays |
| Foot of a slab | A stand | It holds a slab of that width |

A hat over tall sockets rises by itself: `check({ board: "pi4", hat: "pitft-28" })` gives a note that it sits 6.2 mm higher on a stacking header. Give `riser` yourself and a height that is too short is a warning that names the height needed.

## The fit codes

| Code | Level | Means |
| --- | --- | --- |
| `nothing`, `board-and-base` | error | Give a board or a base, one of them |
| `unknown-part` | error | No part has that name |
| `case-wrong-board`, `case-too-small` | error | The case is cut for other sockets, or the board is bigger than its inside |
| `case-covers-header` | error | The case closes over the header, so a hat cannot reach it |
| `case-on-screen` | error | A display that holds the board takes no case |
| `header-not-soldered` | error | Bare holes: set `solderHeader` |
| `no-poe-pins` | error | The hat needs the four pins |
| `hat-overhangs` | warning | The hat reaches past the board's edge |
| `hat-meets-part` | warning | The given `riser` is too short |
| `hat-raised` | note | The hat was raised to clear something, by how much |
| `riser-too-tall`, `riser-without-hat` | error | 0 to 30 mm, and under a hat |
| `cooler-wrong-board`, `cooler-in-closed-case` | error | It does not go there |
| `screen-needs-header`, `screen-wrong-board`, `two-screens` | error | It does not go there |
| `stand-wrong-base`, `stand-wrong-size` | error | Not a slab, or too wide or too narrow for the stand |
| `drives-wrong-base`, `too-many-drives`, `drive-wrong-bay` | error | No bays, too many drives, or a drive that does not go in |
| `part-on-base` | error | A hat on a whole device, or a stand on a board |

## Presets

`PRESETS` holds real machines to use or start from: a Pi 4 in a finned case with a 2.8-inch touch screen, a Pi 3 B with an OLED bonnet, a Pi Zero 2 W in a small domed case, and more.

```ts
import { PRESETS } from "@johnmorrisdotca/hako-devices";
import { build } from "@johnmorrisdotca/hako-devices/build";

const machines = PRESETS.map((preset) => build(preset.description));
machines.length; // 8
```

## A part on its own

```ts
import { buildPart } from "@johnmorrisdotca/hako-devices/build";

buildPart("armor").svg("thick");
buildPart("pitft-28").glb();
```

## The print option

Every device has areas where your words can go: `machine.printAreas()` lists them, the first being the main one. Nothing is painted unless you ask, and a shipped `.glb` has clear faces there, so nothing shows in any other viewer. What you print is at your own risk: do not print someone else's trademark.
