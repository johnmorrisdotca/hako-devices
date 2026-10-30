# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

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
