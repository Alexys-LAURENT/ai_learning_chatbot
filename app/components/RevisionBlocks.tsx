import type { RevisionBlock } from "@/app/tools/revisionSheetTool";

export function H1Block({ content }: { content: string }) {
  return <h2 className="text-2xl font-bold mt-5 mb-1">{content}</h2>;
}

export function H2Block({ content }: { content: string }) {
  return <h3 className="text-lg font-semibold mt-4 mb-1">{content}</h3>;
}

export function H3Block({ content }: { content: string }) {
  return <h4 className="text-sm font-semibold uppercase tracking-wider mt-3 mb-1 text-muted">{content}</h4>;
}

export function ParagraphBlock({ content }: { content: string }) {
  return <p className="text-sm leading-relaxed">{content}</p>;
}

export function BoldBlock({ content }: { content: string }) {
  return <p className="text-sm font-semibold mt-3">{content}</p>;
}

export function ListItemBlock({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
      {content}
    </div>
  );
}

export function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="rounded-lg px-4 py-3 text-xs leading-relaxed overflow-x-auto my-3 bg-surface font-mono">
      <code>{content}</code>
    </pre>
  );
}

export function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
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

export function Block({ block }: { block: RevisionBlock }) {
  if (block.type === "table") return <TableBlock headers={block.headers} rows={block.rows} />;
  if (block.type === "h1") return <H1Block content={block.content} />;
  if (block.type === "h2") return <H2Block content={block.content} />;
  if (block.type === "h3") return <H3Block content={block.content} />;
  if (block.type === "p") return <ParagraphBlock content={block.content} />;
  if (block.type === "bold") return <BoldBlock content={block.content} />;
  if (block.type === "li") return <ListItemBlock content={block.content} />;
  if (block.type === "code") return <CodeBlock content={block.content} />;
}
