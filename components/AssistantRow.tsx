import type { ReactNode } from 'react';

interface AssistantRowProps {
  children: ReactNode;
}

export function AssistantRow({ children }: AssistantRowProps) {
  return (
    // pt-3 compense l'absence de padding interne des tools, pour aligner
    // visuellement le gap au-dessus avec celui d'une MessageBubble (py-3).
    <div className="flex gap-3 pt-3">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold tracking-wide"
        style={{
          background: 'var(--surface-tertiary)',
          color: 'var(--muted)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 2px)',
        }}
      >
        AI
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
