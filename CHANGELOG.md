# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
