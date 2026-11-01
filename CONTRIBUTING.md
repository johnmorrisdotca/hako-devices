# Contributing

Thank you for helping. Bug reports, ideas and pull requests are all welcome. Bug reports and ideas go in the [issues](https://github.com/johnmorrisdotca/hako-devices/issues).

## The rules

- **No logos, no marks, no brand printing.** No mesh or drawing carries a maker's logo, wordmark or printed name, and `test/legal.test.ts` holds it. A word on a device comes only from the caller, through `print`.
- **Drawn here, never copied.** A mesh or drawing is made by this package's code from plain geometry and published sizes. No third-party 3D file, no traced photograph, no icon set. Anything else from outside has its row in `NOTICE.md`, and its licence must be MIT, ISC, BSD or Apache.
- **One description, one mesh and one drawing.** A part is a mesh function in `src/build/` and a drawing function in `src/draw/` that place themselves with the same frames, and a row in `src/parts.ts` with its real size and mounts. `check` reads only that row, so a form can ask it with no three.js.
- **A mesh is a pure function of its description.** No clock, no unseeded random number: the same description gives the same bytes, and a test holds it. A mesh stays under 300 KB and a drawing under 14 KB, in every style.
- **A style is one table entry** in `src/styles.ts`. It changes lines, colours and fills, never a shape.
- **The core has no dependency.** The root entry imports neither three.js nor the DOM. `build` needs three.js; the element loads it only for a 3D view.
- **Anything from outside is treated as text.** A new option that reaches markup has a test with a hostile value.
- **Test what you change.** Tests sit in `test/` and `e2e/`. A rule you change has a test that would have caught it.
- **The wishlist is names only.** `data/wishlist.json` lists machines with no mesh yet; `pnpm wishlist` writes `src/wishlist.ts` from it. A planned machine gets no shape until it is built for real.
- **The machine list is published as JSON, and regenerated with every machine.** `data/machines.json` is made from the catalogue, the wishlist and the tags by `pnpm machines` (after `pnpm wishlist`), ships as `@johnmorrisdotca/hako-devices/machines.json` and sits on the demo site. Add or change a machine and you commit the regenerated file with it; `pnpm check` fails otherwise. [docs/machines.md](docs/machines.md) has its fields.
- **Needs Node 22 or later** to use the package, and **22.18 or later** to work on it: the tests and scripts run TypeScript directly with Node's own type stripping. So the TypeScript uses only syntax that can be erased (`erasableSyntaxOnly`), `import type` for types and a `.ts` extension on every relative import.
- **Ports.** This package owns local ports 7800 to 7899 and nothing outside them. The demo's server is on 7800 (`scripts/dev.ts`), the tests' on 7801 (`playwright.config.ts`; `TEST_PORT` names another), the picture script's on 7802, and any other server or worktree takes 7803 and up. Check with `lsof -iTCP:<port> -sTCP:LISTEN` first, and stop a server by its process id, never by name.

## Add or correct a fact

The list is `data/wishlist.json`, one machine per line. An issue with the machine, the fact and a link is all we need. To send a pull request instead, change that line and run `pnpm wishlist` and then `pnpm machines`, which write the files made from it, the machine list as JSON among them. Commit them with your change: `pnpm check` fails when they are stale.

- **A blank is fine, a guess is not.** Leave out what you cannot source. A wrong fact is worse than a missing one.
- **Name the page.** A size goes with its `dimensionsSource`, and tags with their `tagsSource`. The maker's own page is best, then a reference such as Wikipedia, then a review.
- **Facts only.** Copy no pictures, 3D files or passages of text from those pages.

## Pull requests

One change per pull request. Say what changed and how you checked it, and add a line to `CHANGELOG.md` under **Unreleased**.

## Commands

```sh
pnpm check          # lint, types, tests, the build and the packed package
pnpm verify         # all of that, the docs' examples and the browser tests
pnpm test           # the unit tests
pnpm test:demo      # build the site and play it in a real browser at a phone's width and a desk's
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm test:readme    # run every example of the README and the docs
pnpm dev            # the demo on http://127.0.0.1:7800/hako-devices/
pnpm assets         # make dist/assets again
pnpm wishlist       # write src/wishlist.ts from data/wishlist.json
pnpm machines       # write data/machines.json, the machine list as JSON, from the model (run it whenever machines are added)
pnpm screenshots    # the pictures in docs/images
```
