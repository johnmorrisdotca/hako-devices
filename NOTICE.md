# Notice

The code, the meshes and the drawings of this package are under the MIT licence (see [LICENSE](LICENSE) and [LICENSES/MIT.txt](LICENSES/MIT.txt)).

**Every mesh and drawing is drawn by this package's own code** from plain geometry: boxes, cylinders, extruded outlines and flat shapes, placed by published sizes. Photographs were looked at for where parts sit, and some positions and sizes on the phones and tablets were read as individual measurements from the makers' published dimensional drawings. Nothing was traced or copied from a photograph or a drawing, no third-party 3D file or icon set is included, and no photograph or drawing, or part of one, is shipped or kept in this repository. No mesh or drawing carries a logo, a mark or brand printing.

Product names appear only as plain descriptive words, in the catalogue, the part table, the mapping helpers and the docs. All trademarks belong to their owners, and this project is not affiliated with, sponsored by or endorsed by any of them.

## The list of machines

`data/wishlist.json` and `docs/wishlist.md` list machines still to come. Where an entry gives a size, it was read from Wikipedia, from Apple's spec pages or, for the NUC line, from Intel's and ASUS's product pages (Intel's through the Internet Archive) and Intel's own product brief and product specification PDFs (the NUC5i5RYK brief, the CMB1BB specification) and in a few cases a retailer's or reviewer's page, and the entry names its page in `dimensionsSource`, entry by entry. Wikipedia's text is under the [Creative Commons Attribution-ShareAlike 4.0 licence](https://creativecommons.org/licenses/by-sa/4.0/); those sizes keep that licence as far as it covers them. Apple's pages are Apple's, under [its site terms](https://www.apple.com/legal/internet-services/terms/site.html), and are used by this project's decision, with no licence from Apple. Intel's and ASUS's pages are theirs, under their own site terms, and are likewise used by this project's decision with no licence from them. So are Samsung's pages and GSMArena's, where the Galaxy Tab rows name them. None of these sizes is under this package's MIT licence, and neither file is in the published package.

The published package carries the names of the machines (`src/wishlist.ts`), under which no shape is drawn, and their tags (`src/tag-data.ts`, the `./tags` entry): plain facts such as a CPU's name, how many cores and how much memory, read from the same pages and, for the operating system, wireless, weight, colour and the year a machine was discontinued, from each machine's own page: Apple's spec pages, Intel's Ark pages, Raspberry Pi's product briefs, the makers' pages for the iPhones, iPads and Galaxy Tabs, and Wikipedia's articles (CC BY-SA 4.0). The page of every such tag is named in `data/wishlist.json` (`tagSources`). This package's MIT licence covers its own work; whatever rights those sources hold in what they publish stay theirs.

## What it uses

The published package has no runtime dependency of its own. These are peer dependencies the caller installs, and tools used to build and test it; none of their code is copied into the package.

| Name | Version | Licence | Used for |
| --- | --- | --- | --- |
| three | 0.186.1 (peer, >=0.170.0) | MIT | The geometry of the builders, the 3D view |
| react | 19 (optional peer, >=18) | MIT | The React wrapper |
| react-dom | 19 | MIT | Testing the wrapper |
| typescript | 5.9 | Apache-2.0 | The build |
| esbuild | 0.25 | MIT | Bundling the demo |
| @playwright/test | 1.64.0 | Apache-2.0 | The browser tests |
| eslint, @eslint/js, typescript-eslint | 9, 9, 8 | MIT | Lint |
| @types/node, @types/react, @types/react-dom, @types/three | 24, 19, 19, 0.186 | MIT | Types |

The demo site bundles three and, on its check page, react and react-dom, each under the MIT licence.
