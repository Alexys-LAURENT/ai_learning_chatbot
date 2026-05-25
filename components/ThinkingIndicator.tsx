export function ThinkingIndicator() {
  return (
    <div className="flex gap-3">
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
      <div
        className="flex items-center gap-2 px-3 py-2 text-xs italic"
        style={{
          background: 'var(--surface)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius, 2px)',
          color: 'var(--muted)',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-pulse"
        >
          <path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 0 0-7-7z" />
          <line x1="9" y1="22" x2="15" y2="22" />
        </svg>
        <span>Réflexion en cours</span>
        <span className="flex gap-0.5">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="h-1 w-1 animate-bounce rounded-full"
              style={{
                background: 'var(--muted)',
                animationDelay: `${delay}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
