"use client";

import { Button } from "@heroui/react";
import type { RevisionBlock } from "@/app/tools/revisionSheetTool";
import { IconDownload } from "@/components/icons";

function blocksToHtml(subject: string, blocks: RevisionBlock[]): string {
  const body = blocks
    .map((block) => {
      if (block.type === "table") {
        const headers = block.headers.map((h) => `<th>${h}</th>`).join("");
        const rows = block.rows
          .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
          .join("");
        return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
      }
      const { type, content } = block;
      if (type === "h1") return `<h2>${content}</h2>`;
      if (type === "h2") return `<h3>${content}</h3>`;
      if (type === "h3") return `<h4>${content}</h4>`;
      if (type === "p") return `<p>${content}</p>`;
      if (type === "li") return `<li>${content}</li>`;
      if (type === "code") return `<pre><code>${content}</code></pre>`;
      if (type === "bold") return `<p><strong>${content}</strong></p>`;
    })
    .join("\n");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap');
  body { font-family: 'Bricolage Grotesque', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1c1917; }
  h1 { font-size: 2rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1.5rem; margin-top: 2rem; color: #92400e; }
  h3 { font-size: 1.1rem; margin-top: 1.5rem; color: #b45309; }
  h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin-top: 1rem; }
  p, li { font-size: 0.9rem; line-height: 1.6; }
  pre { background: #1c1917; color: #a8a29e; padding: 1rem; border-radius: 0.5rem; font-size: 0.8rem; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.85rem; }
  th, td { border: 1px solid #e7e5e4; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f4; font-weight: 600; }
</style>
</head><body>
<h1>${subject}</h1>
${body}
</body></html>`;
}

type Props = {
  subject: string;
  blocks: RevisionBlock[];
};

export default function DownloadPdfButton({ subject, blocks }: Props) {
  function handlePress() {
    const html = blocksToHtml(subject, blocks);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    win?.addEventListener("load", () => {
      win.print();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Button
      isIconOnly
      variant="outline"
      size="sm"
      onPress={handlePress}
      aria-label="Télécharger en PDF"
      className="pointer-events-auto"
    >
      <IconDownload />
    </Button>
  );
}
