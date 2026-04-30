"use client";

import type { RevisionBlock } from "@/app/tools/revisionSheetTool";
import { Button, Card, Chip, Separator } from "@heroui/react";
import { useState } from "react";

type Props = {
  subject: string;
  blocks: RevisionBlock[];
};

function blocksToText(subject: string, blocks: RevisionBlock[]): string {
  const lines: string[] = [`# ${subject}`, ""];

  for (const block of blocks) {
    if (block.type === "table") {
      const colWidths = block.headers.map((h, i) =>
        Math.max(h.length, ...block.rows.map((r) => (r[i] ?? "").length)),
      );
      const row = (cells: string[]) =>
        "| " + cells.map((c, i) => c.padEnd(colWidths[i])).join(" | ") + " |";
      lines.push(row(block.headers));
      lines.push("| " + colWidths.map((w) => "-".repeat(w)).join(" | ") + " |");
      block.rows.forEach((r) => lines.push(row(r)));
    } else {
      const { type, content } = block;
      if (type === "h1") lines.push(`## ${content}`);
      else if (type === "h2") lines.push(`### ${content}`);
      else if (type === "h3") lines.push(`#### ${content}`);
      else if (type === "li") lines.push(`  • ${content}`);
      else if (type === "code") lines.push("```", content, "```");
      else lines.push(content);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function blocksToHtml(subject: string, blocks: RevisionBlock[]): string {
  const bodyRows = blocks
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
  body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1c1917; }
  h1 { font-size: 2rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1.5rem; margin-top: 2rem; }
  h3 { font-size: 1.1rem; margin-top: 1.5rem; }
  h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin-top: 1rem; }
  p, li { font-size: 0.9rem; line-height: 1.6; }
  pre { background: #1c1917; color: #a8a29e; padding: 1rem; border-radius: 0.5rem; font-size: 0.8rem; overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.85rem; }
  th, td { border: 1px solid #e7e5e4; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f4; font-weight: 600; }
  @media print { body { margin: 20px; } }
</style>
</head><body>
<h1>${subject}</h1>
${bodyRows}
</body></html>`;
}

function renderBlock(block: RevisionBlock, i: number) {
  if (block.type === "table") {
    return (
      <div key={i} className="my-3 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {block.headers.map((h, j) => (
                <th
                  key={j}
                  className="border px-3 py-2 text-left font-semibold bg-surface"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, j) => (
              <tr key={j}>
                {row.map((cell, k) => (
                  <td key={k} className="border px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const { type, content } = block;

  switch (type) {
    case "h1":
      return (
        <h2 key={i} className="text-2xl font-bold mt-5 mb-1">
          {content}
        </h2>
      );
    case "h2":
      return (
        <h3 key={i} className="text-lg font-semibold mt-4 mb-1">
          {content}
        </h3>
      );
    case "h3":
      return (
        <h4
          key={i}
          className="text-sm font-semibold uppercase tracking-wider mt-3 mb-1 text-muted"
        >
          {content}
        </h4>
      );
    case "p":
      return (
        <p key={i} className="text-sm leading-relaxed">
          {content}
        </p>
      );
    case "li":
      return (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
          {content}
        </div>
      );
    case "code":
      return (
        <pre
          key={i}
          className="rounded-lg px-4 py-3 text-xs leading-relaxed overflow-x-auto my-3 bg-surface font-mono"
        >
          <code>{content}</code>
        </pre>
      );
    case "bold":
      return (
        <p key={i} className="text-sm font-semibold mt-3">
          {content}
        </p>
      );
  }
}

const IconDownload = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconCopy = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function RevisionSheetComponent({ subject, blocks }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(blocksToText(subject, blocks));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadPdf() {
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
    <div className="relative w-full max-w-2xl">
      {/* sticky action buttons limited to the card */}
      <div className="sticky top-4 z-10 flex justify-end gap-1.5 pr-4 -mb-12 pointer-events-none">
        <Button
          isIconOnly
          variant="outline"
          size="sm"
          onPress={handleDownloadPdf}
          aria-label="Télécharger en PDF"
          className="pointer-events-auto bg-white"
        >
          <IconDownload />
        </Button>
        <Button
          isIconOnly
          variant={copied ? "primary" : "outline"}
          size="sm"
          onPress={handleCopy}
          aria-label="Copier le texte"
          className="pointer-events-auto bg-white"
        >
          {copied ? <IconCheck /> : <IconCopy />}
        </Button>
      </div>

      <Card className="w-full">
        <Card.Header className="flex-row items-start justify-between pt-6 pb-3 pr-24">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-1">
              Fiche de révision
            </p>
            <Card.Title className="text-3xl font-bold">{subject}</Card.Title>
          </div>
          <Chip
            color="warning"
            variant="soft"
            size="sm"
            className="shrink-0 mt-1"
          >
            📖 Cours
          </Chip>
        </Card.Header>

        <Separator variant="secondary" className="mx-6" />

        <Card.Content className="space-y-2 py-5">
          {blocks.map((block, i) => renderBlock(block, i))}
        </Card.Content>
      </Card>
    </div>
  );
}
