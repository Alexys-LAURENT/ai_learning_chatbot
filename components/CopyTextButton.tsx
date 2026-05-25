'use client';

import { Button } from '@heroui/react';
import { useState } from 'react';
import type { RevisionBlock } from '@/app/tools/displayRevisionSheetTool';
import { IconCheck, IconCopy } from '@/components/icons';

function blocksToText(subject: string, blocks: RevisionBlock[]): string {
  const lines: string[] = [`# ${subject}`, ''];

  for (const block of blocks) {
    if (block.type === 'table') {
      const colWidths = block.headers.map((h, i) =>
        Math.max(h.length, ...block.rows.map((r) => (r[i] ?? '').length))
      );
      const row = (cells: string[]) =>
        '| ' + cells.map((c, i) => c.padEnd(colWidths[i])).join(' | ') + ' |';
      lines.push(row(block.headers));
      lines.push('| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |');
      block.rows.forEach((r) => lines.push(row(r)));
    } else {
      const { type, content } = block;
      if (type === 'h1') lines.push(`## ${content}`);
      else if (type === 'h2') lines.push(`### ${content}`);
      else if (type === 'h3') lines.push(`#### ${content}`);
      else if (type === 'li') lines.push(`  • ${content}`);
      else if (type === 'code') lines.push('```', content, '```');
      else lines.push(content);
    }
    lines.push('');
  }

  return lines.join('\n');
}

type Props = {
  subject: string;
  blocks: RevisionBlock[];
};

export default function CopyTextButton({ subject, blocks }: Props) {
  const [copied, setCopied] = useState(false);

  function handlePress() {
    navigator.clipboard.writeText(blocksToText(subject, blocks));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      isIconOnly
      variant={copied ? 'primary' : 'outline'}
      size="sm"
      onPress={handlePress}
      aria-label="Copier le texte"
      className="pointer-events-auto"
    >
      {copied ? <IconCheck /> : <IconCopy />}
    </Button>
  );
}
