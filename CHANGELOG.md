# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- The list has every Galaxy Tab released so far: 68 more models, in the families Galaxy Tab A, E, S and Active, 88 in all. A row of the phones and tablets also gives `released`, `discontinued`, `lastUpdate`, `weightG`, `colours` and the pages in `factsSources`, each only where a page says so.

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
