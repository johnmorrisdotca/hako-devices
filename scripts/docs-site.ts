// The docs as pages of the demo site: each docs/*.md through a small Markdown reader of ours (headings, paragraphs, lists, tables, code, links). Enough for these files and no more.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(text: string): string {
  return esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
      const local = /^(?!https?:)[\w./-]+\.md(#.*)?$/.test(href);
      return `<a href="${local ? href.replace(/\.md/, ".html") : href}">${label}</a>`;
    });
}

export function markdown(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(`<pre class="code"><code>${esc(code.join("\n"))}</code></pre>`);
    } else if (/^#{1,4} /.test(line)) {
      const level = /^#+/.exec(line)?.[0].length ?? 1;
      out.push(`<h${level}>${inline(line.slice(level + 1))}</h${level}>`);
      i++;
    } else if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        let item = lines[i++].replace(/^\s*[-*] /, "");
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*[-*] /.test(lines[i])) item += ` ${lines[i++].trim()}`;
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(`<ul>${items.join("")}</ul>`);
    } else if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++].split("|").slice(1, -1).map((cell) => cell.trim()));
      const [head, , ...body] = rows;
      out.push(`<div class="table"><table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    } else if (line.trim() === "") i++;
    else {
      const text: string[] = [];
      while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,4} |```|\||\s*[-*] )/.test(lines[i])) text.push(lines[i++]);
      out.push(`<p>${inline(text.join(" "))}</p>`);
    }
  }
  return out.join("\n");
}

const PAGE = (title: string, body: string, nav: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'none'" />
<title>${esc(title)} · Hako Devices</title>
<link rel="stylesheet" href="../demo.css" />
<link rel="stylesheet" href="docs.css" />
</head>
<body class="doc">
<header class="top"><div class="brand"><h1><a href="../index.html">Hako Devices</a></h1></div><nav class="links" aria-label="Docs">${nav}</nav></header>
<main><article class="panel doc-body">${body}</article></main>
</body>
</html>
`;

const DOC_CSS = `.doc h1 a { color: var(--ink); text-decoration: none; }
.doc-body { max-width: 56rem; }
.doc-body h1 { margin-bottom: 0.75rem; }
.doc-body h2 { margin: 1.5rem 0 0.5rem; }
.doc-body h3 { margin: 1.1rem 0 0.4rem; color: var(--ink); }
.doc-body p, .doc-body li { color: #d3dbe6; }
.doc-body code { background: var(--ground); border: 1px solid var(--line); border-radius: 0.3rem; padding: 0.05rem 0.25rem; font-size: 0.9em; }
.doc-body pre code { background: none; border: 0; padding: 0; }
.doc-body pre { margin: 0.6rem 0; }
.table { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 0.92rem; }
th, td { border: 1px solid var(--line); padding: 0.35rem 0.6rem; text-align: left; vertical-align: top; }
th { color: var(--muted); font-weight: 600; }
`;

export function renderDocs(root: string, out: string): void {
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "docs.css"), DOC_CSS);
  const folder = join(root, "docs");
  const names = existsSync(folder) ? readdirSync(folder).filter((name) => name.endsWith(".md")).sort() : [];
  const nav = names.map((name) => `<a href="${name.replace(/\.md$/, ".html")}">${esc(name.replace(/\.md$/, ""))}</a>`).join("");
  for (const name of names) {
    const source = readFileSync(join(folder, name), "utf8");
    const title = /^# (.+)$/m.exec(source)?.[1] ?? name;
    writeFileSync(join(out, name.replace(/\.md$/, ".html")), PAGE(title, markdown(source), nav));
  }
}
