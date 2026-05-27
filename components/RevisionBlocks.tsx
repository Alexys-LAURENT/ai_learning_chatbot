import type { RevisionBlock } from '@/app/tools/displayRevisionSheetTool';

export function H1Block({ content }: { content: string }) {
  return <h2 className="mt-5 mb-1 text-2xl font-bold whitespace-normal break-words">{content}</h2>;
}

export function H2Block({ content }: { content: string }) {
  return <h3 className="mt-4 mb-1 text-lg font-semibold whitespace-normal break-words">{content}</h3>;
}

export function H3Block({ content }: { content: string }) {
  return (
    <h4 className="text-muted mt-3 mb-1 text-sm font-semibold tracking-wider uppercase whitespace-normal break-words">
      {content}
    </h4>
  );
}

export function ParagraphBlock({ content }: { content: string }) {
  return <p className="text-sm leading-relaxed whitespace-normal break-words">{content}</p>;
}

export function BoldBlock({ content }: { content: string }) {
  return <p className="mt-3 text-sm font-semibold whitespace-normal break-words">{content}</p>;
}

export function ListItemBlock({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="bg-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
      <span className="whitespace-normal break-words">{content}</span>
    </div>
  );
}

export function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="bg-surface my-3 overflow-x-auto rounded-lg px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
      <code>{content}</code>
    </pre>
  );
}

export function TableBlock({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h, j) => (
              <th
                key={j}
                className="bg-surface border px-3 py-2 text-left font-semibold whitespace-normal break-words"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, j) => (
            <tr key={j}>
              {row.map((cell, k) => (
                <td key={k} className="border px-3 py-2 whitespace-normal break-words">
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

export function Block({ block }: { block: RevisionBlock }) {
  if (block.type === 'table')
    return <TableBlock headers={block.headers} rows={block.rows} />;
  if (block.type === 'h1') return <H1Block content={block.content} />;
  if (block.type === 'h2') return <H2Block content={block.content} />;
  if (block.type === 'h3') return <H3Block content={block.content} />;
  if (block.type === 'p') return <ParagraphBlock content={block.content} />;
  if (block.type === 'bold') return <BoldBlock content={block.content} />;
  if (block.type === 'li') return <ListItemBlock content={block.content} />;
  if (block.type === 'code') return <CodeBlock content={block.content} />;
}
