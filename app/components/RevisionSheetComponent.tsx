"use client";

import { Button, Card, Chip, Separator } from "@heroui/react";
import { useState } from "react";
import type { RevisionBlock } from "@/app/tools/revisionSheetTool";
import { IconCheck, IconCopy, IconDownload } from "@/app/components/icons";

type Props = {
  subject: string;
  blocks: RevisionBlock[];
};

// --- Block components ---

function H1Block({ content }: { content: string }) {
  return <h2 className="text-2xl font-bold mt-5 mb-1">{content}</h2>;
}

function H2Block({ content }: { content: string }) {
  return <h3 className="text-lg font-semibold mt-4 mb-1">{content}</h3>;
}

function H3Block({ content }: { content: string }) {
  return <h4 className="text-sm font-semibold uppercase tracking-wider mt-3 mb-1 text-muted">{content}</h4>;
}

function ParagraphBlock({ content }: { content: string }) {
  return <p className="text-sm leading-relaxed">{content}</p>;
}

function BoldBlock({ content }: { content: string }) {
  return <p className="text-sm font-semibold mt-3">{content}</p>;
}

function ListItemBlock({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
      {content}
    </div>
  );
}

function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="rounded-lg px-4 py-3 text-xs leading-relaxed overflow-x-auto my-3 bg-surface font-mono">
      <code>{content}</code>
    </pre>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, j) => (
              <th key={j} className="border px-3 py-2 text-left font-semibold bg-surface">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, j) => (
            <tr key={j}>
              {row.map((cell, k) => (
                <td key={k} className="border px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({ block }: { block: RevisionBlock }) {
  if (block.type === "table") return <TableBlock headers={block.headers} rows={block.rows} />;
  if (block.type === "h1") return <H1Block content={block.content} />;
  if (block.type === "h2") return <H2Block content={block.content} />;
  if (block.type === "h3") return <H3Block content={block.content} />;
  if (block.type === "p") return <ParagraphBlock content={block.content} />;
  if (block.type === "bold") return <BoldBlock content={block.content} />;
  if (block.type === "li") return <ListItemBlock content={block.content} />;
  if (block.type === "code") return <CodeBlock content={block.content} />;
}

// --- PDF & text export ---

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

function downloadAsPdf(subject: string, blocks: RevisionBlock[]) {
  const html = blocksToHtml(subject, blocks);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  win?.addEventListener("load", () => {
    win.print();
    URL.revokeObjectURL(url);
  });
}

// --- Main component ---

export default function RevisionSheetComponent({ subject, blocks }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(blocksToText(subject, blocks));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadPdf() {
    downloadAsPdf(subject, blocks);
  }


  return (
    <div className="relative w-full max-w-2xl">
      <div className="sticky top-4 z-10 flex justify-end gap-1.5 pr-4 -mb-12 pointer-events-none">
        <Button
          isIconOnly
          variant="outline"
          size="sm"
          onPress={handleDownloadPdf}
          aria-label="Télécharger en PDF"
          className="pointer-events-auto"
        >
          <IconDownload />
        </Button>
        <Button
          isIconOnly
          variant={copied ? "primary" : "outline"}
          size="sm"
          onPress={handleCopy}
          aria-label="Copier le texte"
          className="pointer-events-auto"
        >
          {copied ? <IconCheck /> : <IconCopy />}
        </Button>
      </div>

      <Card className="w-full">
        <Card.Header className="flex-row items-start justify-between pt-6 pb-3 pr-24">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Fiche de révision</p>
            <Card.Title className="text-3xl font-bold">{subject}</Card.Title>
          </div>
          <Chip color="warning" variant="soft" size="sm" className="shrink-0 mt-1">📖 Cours</Chip>
        </Card.Header>

        <Separator variant="secondary" className="mx-6" />

        <Card.Content className="space-y-2 py-5">
          {blocks.map((block, i) => <Block key={i} block={block} />)}
        </Card.Content>
      </Card>
    </div>
  );
}
