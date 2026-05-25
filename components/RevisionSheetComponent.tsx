'use client';

import { Card, Chip, Separator } from '@heroui/react';
import type { RevisionBlock } from '@/app/tools/displayRevisionSheetTool';
import { Block } from '@/components/RevisionBlocks';
import DownloadPdfButton from '@/components/DownloadPdfButton';
import CopyTextButton from '@/components/CopyTextButton';

type Props = {
  subject: string;
  blocks: RevisionBlock[];
};

export default function RevisionSheetComponent({ subject, blocks }: Props) {
  return (
    <div className="relative w-full max-w-2xl">
      <div className="pointer-events-none sticky top-4 z-10 -mb-12 flex justify-end gap-1.5 pr-4">
        <DownloadPdfButton subject={subject} blocks={blocks} />
        <CopyTextButton subject={subject} blocks={blocks} />
      </div>

      <Card className="w-full">
        <Card.Header className="flex-row items-start justify-between pt-6 pr-24 pb-3">
          <div>
            <p className="text-muted mb-1 text-xs tracking-widest uppercase">
              Fiche de révision
            </p>
            <Card.Title className="text-3xl font-bold">{subject}</Card.Title>
          </div>
          <Chip
            color="warning"
            variant="soft"
            size="sm"
            className="mt-1 shrink-0"
          >
            📖 Cours
          </Chip>
        </Card.Header>

        <Separator variant="secondary" className="mx-6" />

        <Card.Content className="space-y-2 py-5">
          {blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </Card.Content>
      </Card>
    </div>
  );
}
