// The demo's page, made from demo/index.html and the family's shared head, header, footer and language chooser (family-template.mjs). The Pages build (site.ts) writes it
// into site/, and the dev server serves the same files, so the tests play the page that is published.
import { readFileSync } from "node:fs";
import { WORDS } from "./page-words.ts";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "hako-devices";
const TITLE = "Hako Devices 箱: computers drawn from published sizes";
const DESCRIPTION = "Line drawings and 3D views of computers, boards, hats, NAS boxes, tablets and more, as a web component, with a typed way to assemble machines from parts.";
const LINKS = [
  { href: "docs/index.html", say: "pageDocs" },
  { href: "embed.html", say: "pageEmbed" },
  { href: "machines.json", say: "pageList" },
];

/** The page's text with the family's blocks put in where its comments say. */
export function renderIndex(): string {
  const html = readFileSync(new URL("../demo/index.html", import.meta.url), "utf8");
  return html
    .replace("<!--family:head-->", familyHead({ id, title: TITLE, description: DESCRIPTION }))
    .replace("<!--family:header-->", familyHeader({ id, links: LINKS }))
    .replace("<!--family:unreviewed-->", familyUnreviewed({ id }))
    .replace("<!--family:footer-->", familyFooter({ id }))
    .replace("<!--family:scripts js/demo.js-->", `<script src="family-boot.js"></script>\n    <script type="module" src="kazoku-parts.js"></script>\n    <script type="module" src="js/demo.js"></script>`);
}

/** The classic script that defines familyLanguage and fills the header. An external file, so the page's script policy stays 'self'. */
export function familyBoot(): string {
  return `${FAMILY_SCRIPT}\nfamilyLanguage({ id: ${JSON.stringify(id)}, words: ${JSON.stringify(WORDS)} });\n`;
}
