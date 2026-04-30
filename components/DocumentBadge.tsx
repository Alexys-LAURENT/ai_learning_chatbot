"use client";

import { ThemeToggle } from "./ThemeToggle";

interface DocumentBadgeProps {
  file: File;
  onRemove: () => void;
}

export function DocumentBadge({ file, onRemove }: DocumentBadgeProps) {
  const sizeMb = (file.size / 1024 / 1024).toFixed(2);

  return (
    <header
      className="flex items-center justify-between px-6 py-3"
      style={{
        borderBottom: "1px solid var(--separator)",
        background: "var(--background)",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-medium">
          Document
        </span>

        <div
          className="flex items-center gap-2 px-2.5 py-1 text-xs"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius, 2px)",
          }}
        >
          <PdfFileIcon />
          <span
            className="font-medium max-w-[200px] truncate"
            style={{ color: "var(--foreground)" }}
          >
            {file.name}
          </span>
          <button
            onClick={onRemove}
            className="ml-1 transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--danger)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted)")
            }
            aria-label="Supprimer le document"
            title="Changer de document"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums" style={{ color: "var(--muted)" }}>
          {sizeMb} Mo
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

function PdfFileIcon() {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "oklch(75.24% 0.0884 225.59)", flexShrink: 0 }}
    >
      <path
        d="M1.5 1C1.5 0.723858 1.72386 0.5 2 0.5H7.5L11 4V13C11 13.2761 10.7761 13.5 10.5 13.5H2C1.72386 13.5 1.5 13.2761 1.5 13V1Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M7.5 0.5V3.5C7.5 3.77614 7.72386 4 8 4H11"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}
