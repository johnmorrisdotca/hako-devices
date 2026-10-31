# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `@johnmorrisdotca/hako-devices/tags`: every machine's brand, type and decade, and CPU, cores, memory, screen, ports and parts where a source gives them, with `matchesPicks` and `facetCounts` to filter by them. The gallery has a filter for each.
- The Raspberry Pi line that is not drawn yet is on the list, with Apple's mice, trackpads, cameras, Pencil and AirTag, and shelves for Android phones and tablets, TV sticks and boxes, other small boards and Mini PCs.
- Classic machines, drawn and in 3D: Macintosh 128K, Game Boy, Game Boy Advance, Nintendo DS, Nintendo 64, Switch, Nokia 3310, Palm III, Wii, Xbox Series X, PlayStation 2, 4 and 5, Amiga 500, ZX Spectrum, Dreamcast, iPhone, iPod nano, Apple TV 4K and Power Mac G5.
- `groupLayout` and `groupSample` for a group's picture, and `FINISHES` for a machine's other colours. The gallery opens on groups.
- The plain Pi Zero and the WH boards, the 17-inch MacBook Pro, AirPods, AirPods Max and the Vision Pro.
- More tags: operating system, wireless, weight and generation, with more CPUs.
- `SHELVES` and `headingOf`, and a `shelf` and `maker` on every machine on the list. The gallery groups the list by shelf and family, and opens them on demand.

## [0.1.0] - Not released

The first version.

### Added

- **The catalogue**: 55 devices with their names, families, real sizes and ports, and machines still to come with `status: "planned"`.
- **Assets**: a `.glb` and a `.svg` for every device and part, in every drawing style, each mesh under 300 KB.
- **`<hako-device>`**: the drawing first, then the 3D view crossfading in; drag, keyboard, tilt, reduced motion, and the drawing on no WebGL or Save-Data. Three.js is a peer dependency, loaded only for a 3D view.
- **`build()`**: one mesh and one drawing from one description of a board, a case, a hat and more, checked for fit by real sizes and mount types.
- **Drawing styles**: `thin` and `thick`, each one table of settings.
- **To scale**: `scale="real"`, `unit`, `<hako-lineup>`, a ruler, lines that keep their width at any size.
- **A live screen**: `paintScreen` with words, a canvas or a function.
- **`print`**: your own words on a device, at your own risk. No logo or brand printing is drawn on anything.
- **A React wrapper**, mapping helpers (a board's model line, a hardware identifier or a NAS's name to a key) and a demo site.
