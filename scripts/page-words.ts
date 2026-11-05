// The demo's words for the shared header and footer, in English and Japanese. The family's chooser fills every element with data-say="key" from WORDS[language][key] as text, never as HTML.
// The Japanese awaits a native reader. The line under the header says so when Japanese is showing.

export const WORDS = {
  en: {
    pitch: "Line drawings and 3D views of computers, boards, hats, NAS boxes and tablets, that you drop into a page and assemble from parts.",
    name: "Hako is the Japanese word 箱 for a box.",
    nameLink: "The name",
    foot: "MIT licence. Product names appear only as plain descriptive words. All trademarks belong to their owners, and this project is not affiliated with any of them. No logo or brand printing is drawn on any device.",
    pageDocs: "Docs",
    pageEmbed: "Embed",
    pageList: "List (JSON)",
  },
  ja: {
    pitch: "コンピューター、基板、ハット、NAS、タブレットの線画と3D。ページに置いて、部品から組み立てられます。",
    name: "Hako（箱）は「箱」を意味する日本語です。",
    nameLink: "名前",
    foot: "MITライセンス。製品名は説明の言葉としてだけ出します。商標は各権利者のもので、このプロジェクトはどのメーカーとも関係がありません。どの機器にもロゴやブランドの印刷は描きません。",
    pageDocs: "文書",
    pageEmbed: "埋め込み",
    pageList: "一覧（JSON）",
  },
};
