'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mt-3 mb-2 text-base font-semibold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-2 text-sm font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 mb-1 text-sm font-semibold first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2"
      style={{ color: 'oklch(75.24% 0.0884 225.59)' }}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="my-2 border-l-2 pl-3 italic"
      style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code
          className={`${className ?? ''} block`}
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded px-1 py-0.5 text-[0.85em]"
        style={{
          background: 'var(--surface-tertiary)',
          border: '1px solid var(--border)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      className="my-2 overflow-x-auto p-3 text-xs"
      style={{
        background: 'var(--surface-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius, 2px)',
      }}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table
        className="w-full text-xs"
        style={{ borderCollapse: 'collapse', border: '1px solid var(--border)' }}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th
      className="px-2 py-1 text-left font-semibold"
      style={{ background: 'var(--surface-tertiary)', border: '1px solid var(--border)' }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1" style={{ border: '1px solid var(--border)' }}>
      {children}
    </td>
  ),
  hr: () => <hr className="my-3" style={{ borderColor: 'var(--border)' }} />,
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
