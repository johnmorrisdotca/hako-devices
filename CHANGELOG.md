# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Calculators, personal music, e-readers and headsets, as shelves. The first rows are machines whose pages were opened again: the HP-35, the Voyager models, the HP 48GX, both Curtas, the TI-83 family, the fx-82 and fx-82A, the Sharp EL-8, the Rio PMP300, both Nook 1st Edition models, the Oculus Rift CV1, and the IBM 5150. A size with no named axes is left blank.
- The HP-12C, as a flat body. Its size on the list stays blank: the Voyager page's 128 by 79 by 15 mm names no axes, and the mesh uses that triple as a stand-in after a photograph. The underside is plain.
- The HP-12C, as a flat body.
- The HP-15C, HP-35, TI-83, TI-84 Plus, TI-30, Casio fx-82 and Curta Type I. A size a page does not name stays blank, and the mesh stand-in is in the note. The TI-84 Plus back has its battery door. The others have no back photograph, so the back is plain.
 Its size on the list stays blank: the Voyager page's 128 by 79 by 15 mm names no axes, and the mesh uses that triple as a stand-in after a photograph. The underside is plain.

### Fixed

- A year on the list is rejected only when it is before 1900 or still in the future. The Curta Type I keeps 1948.

## [0.16.0] - 2026-11-03

### Fixed

- The demo's gallery listed the same kind of machine under several kinds: "Raspberry Pi" (2) beside "Single-board computers", "NeXT" beside "NeXT: every model", "Classic Macs" and "Desktops" beside "Apple", "Small PCs and towers" beside "Mini PCs", "Boards with hats and cases" and "Other small boards". The kinds were the drawn machines' groups and the list's shelves side by side, and one machine could be argued into either. They are now kinds of device, 16 of them in place of 31 (the "Raspberry Pi" kind is gone, and its two machines are single-board computers), and a machine's kind comes from its `type` tag, each type in one kind only. A maker is a filter (Brand) and a product line is the step inside a kind. A test fails when a type is in two kinds or a kind is a part of another. An address with an old kind (`?kind=apple`) opens on the first row.

### Added

- The README opens with the package's thumbnail, and the demo carries it as its link preview (og:image) and publishes the card, a dark card and an icon on Pages at `thumbnail.png`, `thumbnail-dark.png` and `icon.png`.
- `lineOf(key)` in `@johnmorrisdotca/hako-devices/tags`: the product line of a drawn device ("Power Mac", "iPhone"). `headingOf` takes just a shelf, a maker and a family.

### Changed

- The MacBooks and the Compute Module 4 on its IO board are in the product lines "MacBook" and "Compute Module" in `data/wishlist.json` and `machines.json`, where they were "Generic".

## [0.15.0] - 2026-11-02

### Added

- What colours a machine came in: `coloursOf(key)` and `colouredKeys()` in the new entry point `@johnmorrisdotca/hako-devices/colours`. Each colour is the maker's word, the pages that say so, a swatch that says how it is known and the key of its drawing, or null. A colour with no drawing is still listed, and an empty list means nobody has checked. `FINISHES` is unchanged. The facts are in `data/colours.json`, 200 more machines read from their pages, beside the 167 whose colours were already tags. See [docs/assets.md](docs/assets.md#what-colours-a-machine-came-in).
- `data/machines.json` has `colours` on every machine, and the `colour` filter covers the new machines.
- `<hako-device body-colour="#rrggbb">` shows a colour on the body of the mesh in the 3D view, for a colour with no drawing of its own.
- The demo shows a machine's colours beside its options: a colour with a drawing switches to it, and one with none says so. The colour chosen is kept in the address, so a reload keeps it and Back undoes it.
- `whatFits(description, slot)`, `nearestWorking(description, keep?)`, `fillNeeded(description, keep?)`, `stillWorks(description)` and `CHOICE_SLOTS`, in the root entry beside `check`: what fits a set of choices and the nearest set that works, so that a form never has to show an error ([docs/parts.md](docs/parts.md#a-form-that-never-shows-an-error)). A test walks every board, case, hat, module and cooler, in both ways, and no choice ends in an error.
- Filter machines by date: `yearOf(key)`, `inYears(key, { from, to })` and `yearSpan(keys)` in `@johnmorrisdotca/hako-devices/tags`, and `year` on every machine in `data/machines.json`. A year nobody confirmed stays blank. The demo's Filters have a From and To year, kept in the address.
- Sizes from their own pages for 25 Apple printers (Apple's specification page for each, which also gives the year stopped for 15 of them), AirPods 3, AirPods 4 and the Magic Keyboard with and without a keypad. Seven doubted years confirmed or corrected: AppleDesign Keyboard is 1994, not 1993.
- 103 more machines on the list, each from a page that was opened: calculators, Walkmans and Discmans, Samsung Galaxy phones, PDAs and pagers, more consoles, the IBM PC line and other classics, laptops, Kindles, and shelves for calculators, personal music, e-readers, headsets, laptops and other gadgets. A year read only on a page about the whole line is left blank.
- 63 more machines from their makers' pages: a NAS shelf with 23 Synology DiskStations (sizes from Synology's hardware guides) and 29 QNAP boxes, ODROID, Pine64 and other small boards, and Google's two Chromebooks. Most have no year yet: those pages do not state one.
- CPU and CPU maker for 90 more Macs, PowerBooks and Xserves, each from Apple's specification page for that model.

### Changed

- The demo's builder never shows an error, and never a picture of something other than what is chosen. Its choices are clicks in a row. A switch offers two ways: "Keep it working" (the default: pick anything, and the other parts change to ones that fit, with one quiet line saying what changed) and "Only what fits" (what cannot work is greyed with its reason). A needed choice with one answer is made for you, such as the header under a hat on a Pi Zero. A hat past a board's edge is said quietly, as the fact it is.
- The demo's view controls are kazoku-ui 0.10.0's: one true zoom number between zoom out and zoom in, with the `2×` preset gone. Tilt, Front and moving the view are behind More.
- The demo is one screen at a time, and the gallery no longer folds. On a desk the page is the size of the window: pick a kind, then a family, then a machine, each list scrolling inside itself, and the machine stands large beside its colours, options, facts and the code to copy. Each machine with no shape yet opens as the one "Coming soon" picture. Filters are the same three steps: a fact, its values, the machines. Build, To scale and Live screen are views of their own, and only the device on show draws in 3D. Choices are kept in the address, and a step along the row is a step for Back; old addresses (`#pi4`, `#part:armor`, `#builder`) still go where they went. It works by mouse, touch and keyboard, and at a phone's width each row scrolls sideways inside itself.

## [0.14.0] - 2026-11-02

### Added

- The demo's viewer uses the family's view controls, `<kazoku-view-controls>` from `@johnmorrisdotca/kazoku-ui` 0.7.3 (a devDependency, for the demo only; the library stays dependency-free): angle and tilt, Auto-turn (for a minute, then it stops), Front, zoom with Fit, move, and the same drag, pinch, wheel and keys as the other projects, under the large device and in the device dialog. The angle, tilt, zoom and drag choice are kept in the address (`?yaw=40&tilt=10&zoom=2`) and another device keeps the view. Addresses that opened a device (`#pi4`, `#part:armor`) open it as before.
- `element.drive({ yaw, tilt, zoom, panX, panY })` hands the turn, tip, zoom and pan to a page; `drive(null)` takes the element's own hands back ([docs/element.md](docs/element.md#the-familys-view-controls)). The flat drawing follows the zoom and the pan. `ViewChoice` is a type of the root entry.
- `e2e/freeze.demo.ts` also plays the controls turning the device (auto-turn, zoom 1x to 5x on a 5K screen, a lost context handing the flat drawing the zoom and the pan), and `e2e/demo.demo.ts` holds the controls, the address and the old addresses.
- `AGENTS.md` is the family's template (kazoku-ui 0.7.3) with this repo's facts under its marker.

### Changed

- `release.yml` calls the family's shared release workflow (`johnmorrisdotca/kazoku-ui` `reusable-release.yml` at v0.7.3) instead of carrying its own steps; the file name is the same, so the trusted-publisher entry on npmjs.com is unchanged. The GitHub release's notes come from `scripts/release-notes.mjs` (was `.ts`).

## [0.13.0] - 2026-11-02

### Added

- 87 machines gain a CPU and its maker, each from a page about that machine: 51 from Apple's own tech specs page for it (the MacBook, MacBook Air, MacBook Pro, Mac mini, iMac, Mac Pro and older Macs, found through Apple's manuals-and-downloads page for the model) and 36 from the machine's own Wikipedia article (the Surface Go, Pro and Laptop, several Pixels and Nexus phones, Nokia and Palm phones, the Macintosh LC III and SE/30, Amstrad and Philips home computers). The page is named in `tagSources`. Nothing is guessed: a machine with no readable page about itself stays empty.
- Coverage of the 2,328 machines, CPU: 1,522 (65.4%) at 0.11.0, 1,017 (43.7%) after 0.12.1 removed the CPUs that rested on a family's page, 1,104 (47.4%) now. Of the 2,161 that have a processor at all (not a display, printer, keyboard or the like): 70.2%, 47.0%, 51.0%.

### Changed

- 28 CPU names that were a line of the infobox ("369 MHz ARM11 Freescale MXC-300-xx processor", "Motorola 68000 @ 7.16 MHz (NTSC) 7.09 MHz (PAL)", "TI OMAP 1710, 32-bit RISC ARM9 @ 220 MHz") are now the chip: `ARM11`, `Motorola 68000`, `ARM9`, so a filter by CPU offers one value for each.
- Still empty, and why: the Raspberry Pi 1, 2, 3 and Zero (the maker's pages answer no program, and its product briefs exist only for the later boards), 336 Intel Ark pages (unreadable by a program, so their values are kept as they were), consoles' later revisions (no article of their own), the Chromecasts, iPods, Apple Watches and BlackBerry and Nokia phones with no article.

## [0.12.2] - 2026-11-02

### Fixed

- The 3D view could hang a page. Its frame loop asked for the next frame twice whenever the camera's own change event had already asked (`controls.update` fires `change`, `change` wakes the loop, and the end of the frame asked again), so callbacks waiting for a frame piled up while the view turned, up to 31 within 24 seconds in a measured page, and drew more than once a frame. One frame is asked for, never two. `e2e/freeze.demo.ts` fails on 0.12.1 and earlier for it.
- The 3D canvas had no pixel budget: on a 5120 x 2880 screen at a ratio of 2 the large device was a 24 million pixel canvas and a second one 15 million, every frame. It is held to 6 million pixels, 4096 on a side and a ratio of 2 (`pixelRatioFor`, `MAX_PIXELS`, `MAX_SIDE` and `MAX_RATIO` in the root entry), and the test checks it on a 5K screen.
- A device's 3D view gives back the model's own pictures (not only its map) and the studio environment's geometries when it is let go; nothing out of sight or in a hidden tab draws, as before, and a test holds it.

## [0.12.1] - 2026-11-02

### Fixed

- A family's CPU, cores or memory is no longer applied to its models. Those three tags (and the CPU maker) now rest only on a page about the machine itself: its own Wikipedia article (the title is the machine's name; "Xbox (console)" is the Xbox, a model number such as "(AGB-001)" or a watch's "(40 mm)" is not part of the title), or the maker's spec page for that one machine (Apple's, Intel's Ark, ASUS's, Raspberry Pi's). A series article, a list of models ("List of iPhone models", "List of Mac models grouped by CPU type") or a document on a family is not one. Every value was read against its page (Intel's Ark pages do not answer a program, so the 336 of them were not read and their values stay as they were): 533 CPUs, 546 CPU makers, 306 core counts and 454 memory sizes that no page about that machine gives were removed, from 768 of the 2,328 machines. The Atari 2600 Jr., the Xbox 360 S and the PC Engine Duo no longer take their chip from the console they revise; a missing value means no page about that machine gives it. CPUs on the list: 1,522 before, 1,017 after (the next release fills what has a page).
- The Mac Pro steel tower (2023) in `machines.json` said 2 or 4 cores, 256 MB to 16 GB of memory, FireWire and no decade, carried over from the towers before it. It now says what Apple's page for the 2023 Mac Pro says: 24 cores, 64, 128 or 192 GB, USB-C, Thunderbolt and HDMI, the 2020s.
- Memory read from an infobox no longer mixes in storage and ROM (the Nokia E71 listed 110, 256, 128 and 71 MB; its RAM is 128 MB), and a NUC's 64 GB that its maker's page puts at 32 GB is gone.

### Changed

- `pnpm wishlist` and `pnpm test` fail on a CPU, CPU maker, core count or memory whose page is not about the machine (`isModelPage` in `scripts/tag-rules.ts`, held by `test/tags.test.ts`), as they already did for a tag with no page. CPU, cores and memory no longer rest on a machine's size page unless that page is about the machine too ([docs/machines.md](docs/machines.md#tags)).

## [0.12.0] - 2026-11-02

### Added

- Embeds: an embed page for a site that cannot run script, and `embedCode` for the element, an iframe, a module, the SVG and a data address, so a drawing can go on another site.

## [0.11.0] - 2026-11-02

### Added

- Apple Watch: 34 models on 21 bodies, the first generation and Series 1 to 12, the SE (1st generation and 3rd generation) and the Ultra 1 to 4, each a row of numbers read from Apple's dimensional drawing of that model. The case only, no band: the picture, the crown, the side button, the speaker slot and the back crystal, in the sizes the sheets give. Models whose sheets give the same numbers share a body (the Series 4, 5 and SE; the Series 7, 8 and 9; the Series 10 and 11; the Ultra 2 and 3). Their sizes in the list now come from those drawings.
- Not drawn yet: the Apple Watch SE (2nd generation), whose drawing was not found, the ceramic cases, the bands, and how far the crown and the button stand out.

## [0.10.0] - 2026-11-02

### Added

- iPods: the iPod touch (1st to 7th generation), the iPod nano (3rd to 7th generation), the iPod classic, the iPod (3rd and 4th generation), the iPod photo and the iPod mini, 22 models on 16 bodies, each a row of numbers read from Apple's dimensional drawing of that model: picture, click wheel or home button, cameras, buttons, jack, dock or Lightning socket. A row can now have a click wheel (`front.wheel`) and a plate of its own in front of the picture (`face`). Sizes of the rows that had none, or only a family's article, now come from Apple's drawing of that model or its own spec page.
- Not drawn yet: the iPod (5th generation), whose two thicknesses the list does not tell apart, the four iPod shuffles (a body with no picture, with a clip), the 3rd generation's row of four buttons and the touch's antenna window.

## [0.9.0] - 2026-11-02

### Added

- The older iPads and iPad minis, 17 models on 14 bodies, each a row of numbers read from Apple's dimensional drawing of that model: the iPad (1st to 9th generation), the iPad mini (1st, 2nd, 3rd, 4th and 5th generation) and the iPad Air (1st, 2nd and 3rd generation), with their front camera, rear camera, home button, buttons, switch, jack, sockets and speaker grilles. The mini 3, the 6th generation and the 8th generation share the body of the mini 2, the 5th generation and the 7th generation, which Apple draws once for each pair. The tablets stand long side down, as the iPad Pros do. Not drawn yet: the iPad Air 13-inch (M2, M3 and M4) and the iPad mini (A20 Pro), left as coming soon.

## [0.8.0] - 2026-11-01

### Added

- Tags: **discontinued** (the year a maker stopped selling a machine) and **colour** (the finishes the maker gives it) are new kinds, offered in the demo's filters and in `tagsOf`, `FACETS` and `machines.json`. 280 machines have a discontinued year and 167 a colour.
- More **operating system**, **wireless** and **weight** tags, each from a page about that machine: Apple's spec page for a Mac, iPod or Apple TV (the system it shipped with, Wi-Fi and Bluetooth, weight, the "Discontinued" date), Intel's Ark page for a NUC (Wi-Fi, Bluetooth, supported systems), the maker's product brief for a Raspberry Pi 3A+, 3B+, 4, 400, 5, Zero 2 W and Pico W (Wi-Fi and Bluetooth, CPU, cores, memory), the pages behind the iPhones, iPads and Galaxy Tabs, and the machine's own Wikipedia article. Coverage of 2,328 machines: operating system 832, wireless 549 (Wi-Fi, Bluetooth, Cellular), weight 674, discontinued 280, colour 167, generation 572.
- Every tag now names its page. `tagSources` in `data/wishlist.json` gives the pages by kind, and `pnpm wishlist` and `pnpm test` fail on a tag with no source, on a source that is not a page address and on a tag kind the package does not know ([docs/machines.md](docs/machines.md#tags)).

### Changed

- The operating system of a Mac is named as Apple names it: `Mac OS` (System 1 to Mac OS 9), `Mac OS X`, `OS X` or `macOS`, where it was one `Mac OS` for all.
- Weight bands are read from the page: 3 kg is in "1 to 3 kg".

### Fixed

- Tags that rested on a family's page, or on nothing, are gone, so a filter no longer reads a later revision as the first (the Atari 2600 Jr. gets nothing from the Atari 2600 article). 706 operating system tags (the family's, not a measured fact), 167 wireless and 117 weight tags that no page backs, and 67 CPUs, 52 memory sizes, 37 core counts, 58 port lists and 8 screen sizes with no page were removed; a value that is missing means no page gives it, not that the machine lacks it. The Raspberry Pi 4 now lists its 3 GB version from Raspberry Pi's product brief. The "13-inch" screen of the Pi with a 2.13-inch e-paper hat is gone.

## [0.7.0] - 2026-11-01

### Added

- Aliases: every machine can go by other names. 1,754 of the 2,328 machines have 3,072 of them: `trash-can`, `trashcan-mac-pro` and `mac-pro-2013` for the Late 2013 Mac Pro, `raspberry-pi-zero` for `rpi-zero`, `lampshade-imac`, `toilet-seat-ibook`, `wallstreet`, `ps2`, `gba`, `nuc5i5ryk`, `jetson-nano`. They are rules (a maker's prefix swapped, a model number, a year form) and a hand pass for well-known nicknames, written in the `aliases` field of `data/wishlist.json`.
- `findMachine(keyOrAlias)` gives the machine a key or an alias names, and `aliasesOf(key)` its aliases. Both are in the root entry and documented in [docs/machines.md](docs/machines.md#aliases).
- `aliases` in every machine of `machines.json`, and the demo's search matches them.
- A test fails on an alias that is not lowercase kebab-case ASCII, that two machines share, or that is another machine's key; `pnpm wishlist` refuses one too.

## [0.6.1] - 2026-11-01

### Fixed

- The Rock Canyon slim NUC's height is settled at 34.5 mm by Intel's own NUC5i5RYK product brief (a retailer's 32.7 mm is not Intel's). The brief is now its source, and the NUC5i5RYK row carries the size.
- The NUC Compute Element body (NUC 9, 11 and 12 Extreme and Pro) is 39 x 202 x 131 mm, from Intel's "Chassis Dimensions", not an estimate of 42 x 238 x 134 mm.
- The NUC Board Element body is Intel's CMB1BB: 110 x 80 x 16.21 mm from its product specification, not 101.6 x 147 x 20 mm (a 3.5-inch drive's size). The other boards listed under it say in their notes that their own boards differ.
- The Maple Canyon NUC's notes say what Intel does and does not publish: no chassis size was found, so its 115 x 111 x 49 mm mesh stays an estimate and its listed size stays blank.

## [0.6.0] - 2026-11-01

### Added

- The machine list as static JSON: `@johnmorrisdotca/hako-devices/machines.json` and `machines.json` on the demo site. Each of the 2,328 machines has its key, name, maker, family, status, mesh and tags, and a drawn device its size in millimetres and its ports. It is made from the catalogue by `pnpm machines` and documented in [docs/machines.md](docs/machines.md). When machines are added it is regenerated and published with them, and `pnpm check` fails if it is stale.

### Fixed

- The Jetson Orin Nano's name and key held a stray piece of Wikipedia markup; the key is now `nvidia-jetson-orin-nano`.

## [0.5.0] - 2026-10-31

### Added

- [Building machines](docs/building-machines.md): how to add a machine to the same standard, with prompts for a coding agent.
- The list has every Galaxy Tab released so far: 68 more models, in the families Galaxy Tab A, E, S and Active, 88 in all. A row of the phones and tablets also gives `released`, `discontinued`, `lastUpdate`, `weightG`, `colours` and the pages in `factsSources`, each only where a page says so.
- Every iPhone: 50 bodies, from the first to the iPhone 18 Pro Max and the Duo (closed), each a row of numbers read from Apple's dimensional drawings, with its front, cameras, plateau, buttons, sockets and holes. New port kinds `lightning` and `dock-30`.

### Fixed

- Sizes in the list now follow Apple's own figures to the hundredth, the iPad (3rd and 4th generation) outline among them. A Galaxy Tab's height is its longer side. The generic `iphone` row no longer copies the first iPhone's size.

## [0.4.0] - 2026-10-31

### Added

- NeXT, on a shelf of its own: the NeXT Computer and NeXTcube, the NeXTstation and the MegaPixel Display as bodies, and the NeXTcube Turbo and NeXTstation Color, Turbo and Turbo Color they draw.
- Every iMac body: G3 tray-loading and slot-loading, the G4 lamp in three sizes, the white G5 and Intel ones with and without a camera, aluminium, unibody, the thin edge, the iMac Pro, and the 24-inch with four ports or two.
- Every Mac Pro body: the 2006 to 2012 tower, the 2013 cylinder, the steel towers and racks of 2019 and 2023, each with its own back. Every Mac mini body, and every Mac Studio chip Apple lists on the list.
- The Macs before those: the Power Mac G4 Cube, the Twentieth Anniversary Macintosh, the eMac, compact Macs, the Lisa, the II, LC, Centris and Quadra lines, Performas, Power Macintosh towers and desktops, and the Power Mac G3 and G4. A body whose back no photograph showed has its back left plain, and its note says so.
- `build/desks/`: a machine described as a list of pieces, one description for its mesh and its drawing.
- `macKey` knows more identifiers, each giving the Mac its own body. A new `classic-macs` family holds the Macs before the iMac, and a `next` family the NeXT machines.

### Changed

- `mac-pro` is now the 2023 tower, and `mac-pro-2019` the 2019 one; `MacPro7,1` gives that. `macintosh-128k` and `power-mac-g5-2003` moved from `classics` to `classic-macs`.

### Fixed

- The Mac Studio and the small Mac mini had the wrong ports: on their sides, in the wrong places, and on the small mini a perforated back it does not have. They now follow Apple's pictures of each model's front and back. The Mac mini's flat body likewise. The Mac Pro's legs and handles are the right height, and its back has its real panel and ports.
- The iMac 24-inch sat 18 mm too low in its panel, and had no ports on its back.

## [0.3.0] - 2026-10-31

### Added

- **The whole NUC line**: every Intel and ASUS model we could find from 2012 to 2026, kits, mini PCs, boards, compute elements and laptop kits, on the list with its year, size and source, and 76 new bodies with a mesh and a drawing each, from the first black boxes to the ROG NUC 16. Models that share a body draw that body. `pcKey` now finds a NUC's own body from its product code.
- The ports `displayport`, `vga` and `serial`.

### Changed

- `nuc-12-tall` and `nuc-12-slim` are drawn from the same table now: the front has two USB-A and a sound jack, as Intel's page says, not a USB-C.

### Fixed

- The years of NUC models on the list: some read 2060 or 2020 from a misread table, and now come from Intel's launch dates. A test holds every year on the list to a real year, and its decade tag to it.

## [0.2.0] - 2026-10-31

### Added

- Every iPad Pro from 2015 to now, each body with its own cameras: the 2015 12.9-inch, the 9.7-inch, the 10.5-inch, the 2017 12.9-inch, the 2018 11-inch and 12.9-inch, the 2020 to 2022 11-inch, and the 2020 and 2021 to 2022 12.9-inch. The older ones have a home button.

### Fixed

- The iPad Pro 11-inch and 13-inch (M4 and M5) had the wrong cameras: a wide pill in the middle of the top edge. They now have the square in the corner, with one lens over the LiDAR, the flash, a light sensor and a microphone, placed from Apple's picture of the model. Their names now say which chips they cover.

## [0.1.1] - 2026-10-30

### Changed

- The package's description and keywords now name the machines it covers, so a search on npm finds them. No code changed.

## [0.1.0] - 2026-10-30

The first version.

### Added

- **The catalogue**: 86 devices with their names, families, real sizes and ports, and machines still to come with `status: "planned"`.
- **Tags**: `@johnmorrisdotca/hako-devices/tags` gives every machine's brand, type and decade, and CPU, cores, memory, screen, ports, operating system, wireless, weight, generation and parts where a source gives them, with `matchesPicks` and `facetCounts` to filter by them. The gallery has a filter for each.
- **Shelves and groups**: `SHELVES` and `headingOf`, a `shelf` and `maker` on every machine on the list, `groupLayout` and `groupSample` for a group's picture, and `FINISHES` for a machine's other colours. The gallery opens on groups.
- **Assets**: a `.glb` and a `.svg` for every device and part, in every drawing style, each mesh under 300 KB.
- **`<hako-device>`**: the drawing first, then the 3D view crossfading in; drag, keyboard, tilt, reduced motion, and the drawing on no WebGL or Save-Data. Three.js is a peer dependency, loaded only for a 3D view.
- **`build()`**: one mesh and one drawing from one description of a board, a case, a hat and more, checked for fit by real sizes and mount types.
- **Drawing styles**: `thin` and `thick`, each one table of settings.
- **To scale**: `scale="real"`, `unit`, `<hako-lineup>`, a ruler, lines that keep their width at any size.
- **A live screen**: `paintScreen` with words, a canvas or a function.
- **`print`**: your own words on a device, at your own risk. No logo or brand printing is drawn on anything.
- **A React wrapper**, mapping helpers (a board's model line, a hardware identifier or a NAS's name to a key) and a demo site.
