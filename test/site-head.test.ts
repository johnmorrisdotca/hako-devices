// The demo page's content security policy lets it fetch images only from itself, so nothing the page fetches on load may point at the Pages address: a test that fails when the icon link does.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { thumbnailAddresses, thumbnailHead } from "../scripts/family-thumbnail.mjs";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { name: string };
const { site, card } = thumbnailAddresses(pkg);

/** Every address the browser fetches by itself when a page opens, from the links and pictures in it. */
const fetched = (html: string): string[] => [...html.matchAll(/<(?:link|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

test("the head's icon link is relative, and the cards a link preview reads stay absolute", () => {
  const head = thumbnailHead(pkg, { alt: "alt words" });
  assert.deepEqual(fetched(head), ["icon.png"]);
  assert.ok(head.includes(`<meta property="og:image" content="${card}" />`));
  assert.ok(head.includes(`<meta name="twitter:image" content="${card}" />`));
});

test("the built demo page fetches no image or icon from its own Pages address", { skip: !existsSync(join(root, "site", "index.html")) }, () => {
  const html = readFileSync(join(root, "site", "index.html"), "utf8");
  const absolute = fetched(html).filter((address) => address.startsWith(site));
  assert.deepEqual(absolute, [], "the content security policy (img-src 'self' data:) blocks these");
  assert.ok(html.includes("img-src 'self' data:"), "the policy is still strict");
  assert.ok(fetched(html).includes("icon.png"));
});
