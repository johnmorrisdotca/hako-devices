# Building machines

How to add a machine to this library so it matches the rest, whether you are a person or are directing a coding agent. The list is far longer than anyone can draw alone, so take one product line and go. [The wishlist](wishlist.md) shows what is waiting.

## What good looks like

A reader who owned the machine would recognise it, from the front and from behind, and find nothing that is plainly wrong:

- **The right shape at the real size.** The size comes from a source and the mesh is built to it.
- **The right details in the right places.** Buttons on the right edge, ports on the right side, cameras in the right corner and the right number of lenses. Only what you can back up: a plain back is better than an invented one.
- **The real differences between models.** Two models get one drawing only when their bodies truly match, front and back.
- **Every look working.** The 3D view, and the `thin` and `thick` drawings.
- **No logos, marks or printed names**, ever. A strong shape is enough.

## The one rule about facts

**A blank is fine. A wrong fact is worse than a missing one.** Readers cannot tell a guess from a fact.

- Every fact names the page it came from. Prefer the maker's own pages, manuals and press releases, then museums and encyclopedias, then reviews.
- Never fill a gap with an estimate, or a number from a similar model.
- When sources disagree, keep the one you can defend and record the other.
- If a mesh must have a size no source gives, say so in the machine's notes and leave its listed size blank.
- Look at what you cannot read. If you could not open a source or a picture, say so instead of implying you did.

## What you may use

| Source | Use it for |
|---|---|
| Sizes, dates and specifications | Plain facts, with the page named |
| Photographs and the maker's technical drawings | Looking at, to see where parts sit and to measure them. Nothing traced and no picture shipped |
| Someone else's 3D model, icon or texture | Not in this package. Everything here is drawn by its own code |

Be careful with other sites' files even for reference. "Creative Commons" comes in kinds with very different terms: read the licence, not just the badge. Check for a separate notice restricting the file, such as Sketchfab's NoAI tag. A repository with no licence means all rights reserved. Some uploads are copies of another person's work under a new name.

## The steps

1. **Pick one line.** Find its rows in `data/wishlist.json`, one machine per line. Add any model that is missing.
2. **Research.** For each model, gather the year, the dates, the size, what is on its front and back, and a source for each. Find a picture of each side of that exact model.
3. **Sort models into bodies.** Models that truly share a body share a mesh. Mark the others `Covered by the built mesh <key>` in their notes, with status `built`.
4. **Write a body as data.** Keep what differs between models in a table of numbers, with a comment saying where they came from. `PRO_CAMERAS` in `src/build/tablets.ts` and the specs in `src/build/machines.ts` are the pattern. A new shape of code is the exception.
5. **Add the device.** A `whole(...)` line in `src/catalogue.ts`, an entry in `src/build/assemble.ts`, and its wishlist row. Run `pnpm wishlist`, then `pnpm machines`: the [machine list as JSON](machines.md) is regenerated and published with every new machine, and `pnpm check` fails until you have run it.
6. **Look at it beside the real thing.** Run `pnpm site`, then `PORT=<a free port> node scripts/dev.ts`, and show it with `<hako-device key="your-key" spin="off" flipped>` to see the back. Compare the front, the back and the sides with your pictures. Fix what is off, and do this for every body, not a sample.
7. **Check it.** `pnpm verify` runs everything. A mesh stays under 300 KB. Commit `data/machines.json` with the machine: it fails the check if it is stale.
8. **Send it.** One line per pull request, with a line in `CHANGELOG.md`, the sources, and pictures of what you built. Name anything you drew from thin evidence.

Finish fewer machines properly rather than many roughly, and say what is left.

## Mistakes already made here

Each of these reached a reader's eye or a test, so check for them:

- **A camera drawn from memory.** The iPad Pro had a wide pill in the middle of its top edge. Every real one has its cameras in a corner, and each generation differs. Measure from a picture of that model.
- **Generic bodies claiming too much.** A shared drawing can hide a wrong camera or button for a model it "covers".
- **Misread tables.** A year of 2060 came from a CPU number in the wrong column, and an 81 m booster from a table whose cells shifted. Check that parts add up to the whole and that dates are possible.
- **Mixed meanings.** One maker's "height" can be the shorter side, and another's the longer.
- **Relatives passed off as the thing.** A body placed from a similar model's photograph is thin evidence: say so in its notes.
- **Claims nobody checked.** "Looked at", "matches" and "passed" mean you did it, on this version, and can name it.

## Prompts for a coding agent

These give an agent what it needs to work to this standard. Fill in the line, and read its results yourself: its confident mistakes look just like its facts.

Research first:

```text
Research job for the hako-devices library. Do not edit any code. Read data/wishlist.json and docs/building-machines.md first.
Line: <the product line, for example every Sony Walkman cassette player>.
For every model ever released, write one JSON object per line to research.jsonl: key (from wishlist.json if it is listed, else null), name, brand, line, year, released, discontinued, supportEnded, heightMm, widthMm, depthMm, weightG, front (what is on it), back (what is on it), buttons (each one and its edge), ports (each one and its edge), colours, sameBodyAs (an earlier model with an identical body), pictureFront and pictureBack (the address of a photograph of that exact model, not a download), sources (one address per group of facts).
A fact no source states is null. Never estimate, and never copy a number from a similar model. Prefer the maker's pages, then museums and encyclopedias, then reviews. Copy no text, pictures or 3D files. Do not stop to ask. List anything you could not open, and any row in wishlist.json your sources disagree with.
```

Then build:

```text
Build a product line in the hako-devices library. Read AGENTS.md, CONTRIBUTING.md, NOTICE.md and docs/building-machines.md first, and follow the last one's steps and rules exactly.
Line: <the product line>. Research: <the file, if there is one; check at least 15 of its facts against their sources before trusting it>.
Work on a branch of your own. Add every model to data/wishlist.json, sort them into bodies, and build one mesh and drawing per body as rows of data. Measure from photographs of each exact model: nothing traced, no logos, no third-party models. For every body, render the front and back in a real browser and compare them with the real pictures yourself, then fix what is wrong. Run pnpm verify. Report the models listed, the bodies built, what you ran with its counts, the bodies drawn from thin evidence by name, the facts you could not source and what is left. Say only what you checked. A correct small set beats a large rough one.
```

## Not sure where to start?

Pick a machine you own, or the line in the [wishlist](wishlist.md) you care about most, and [open an issue](https://github.com/johnmorrisdotca/hako-devices/issues) to say you are on it, so two people do not draw the same thing.
