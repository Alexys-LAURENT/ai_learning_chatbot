export interface DocumentEntry {
  id: string;
  file: File;
  addedAt: Date;
}

interface SidebarProps {
  documents: DocumentEntry[];
}

export function Sidebar({ documents }: SidebarProps) {
  return (
    <aside
      className="w-56 shrink-0 flex flex-col overflow-y-auto"
      style={{
        borderRight: "1px solid var(--separator)",
        background: "var(--surface)",
      }}
    >
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--separator)" }}
      >
        <span className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "var(--muted)" }}>
          Documents&nbsp;
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-bold tabular-nums"
            style={{
              background: "var(--surface-tertiary)",
              color: "var(--foreground)",
            }}
          >
            {documents.length}
          </span>
        </span>
      </div>

      <div className="flex-1 py-1">
        {documents.length === 0 ? (
          <p className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
            Aucun document
          </p>
        ) : (
          documents.map((doc) => (
            <SidebarItem key={doc.id} entry={doc} />
          ))
        )}
      </div>
    </aside>
  );
}

function SidebarItem({ entry }: { entry: DocumentEntry }) {
  const sizeMb = (entry.file.size / 1024 / 1024).toFixed(2);
  const time = entry.addedAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="group flex items-start gap-2.5 px-3 py-2.5 cursor-default transition-colors"
      style={{ "--hover-bg": "var(--surface-secondary)" } as React.CSSProperties}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--surface-secondary)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <div className="shrink-0 mt-0.5">
        <PdfIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate leading-tight"
          style={{ color: "var(--foreground)" }}
        >
          {entry.file.name}
        </p>
        <p
          className="text-[10px] tabular-nums mt-0.5"
          style={{ color: "var(--muted)" }}
        >
          {sizeMb} Mo · {time}
        </p>
      </div>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg
      width="22"
      height="26"
      viewBox="0 0 22 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "oklch(75.24% 0.0884 225.59)" }}
    >
      <path
        d="M3 2C3 1.44772 3.44772 1 4 1H14L21 8V24C21 24.5523 20.5523 25 20 25H4C3.44772 25 3 24.5523 3 24V2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
      />
      <path
        d="M14 1V7C14 7.55228 14.4477 8 15 8H21"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
        strokeLinejoin="round"
      />
      <rect x="6" y="12" width="10" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="6" y="15" width="7" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="6" y="18" width="9" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
