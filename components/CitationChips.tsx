import type { Citation } from '@/types/Citation';
import { citationPreview } from '@/utils/citations';
import { Button } from '@heroui/react';

interface CitationChipsProps {
  citations: Citation[];
  onRemove?: (citationId: string) => void;
}

export function CitationChips({ citations, onRemove }: CitationChipsProps) {
  if (citations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {citations.map((citation) => (
        <CitationChip
          key={citation.id}
          citation={citation}
          onRemove={onRemove ? () => onRemove(citation.id) : undefined}
        />
      ))}
    </div>
  );
}

function CitationChip({
  citation,
  onRemove,
}: {
  citation: Citation;
  onRemove?: () => void;
}) {
  const label =
    citation.kind === 'page'
      ? `Page ${citation.page}`
      : `Extrait p.${citation.page}`;

  return (
    <div
      className="inline-flex max-w-xs items-center gap-1.5 px-2 py-1 text-[11px] whitespace-normal break-words"
      style={{
        background: 'oklch(75.24% 0.0884 225.59 / 0.1)',
        border: '1px solid oklch(75.24% 0.0884 225.59 / 0.3)',
        borderRadius: 'var(--radius, 2px)',
        color: 'var(--foreground)',
      }}
      title={`${citation.docName} — ${citation.text}`}
    >
      <span className="font-medium whitespace-nowrap" style={{ color: 'oklch(75.24% 0.0884 225.59)' }}>
        {label}
      </span>
      <span className="truncate whitespace-normal break-words" style={{ color: 'var(--muted)' }}>
        {citationPreview(citation.text)}
      </span>
      {onRemove && (
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={onRemove}
          aria-label="Retirer la citation"
          className="ml-0.5 h-4 w-4 min-w-0"
        >
          ×
        </Button>
      )}
    </div>
  );
}
