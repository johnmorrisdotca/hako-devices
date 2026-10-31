# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
