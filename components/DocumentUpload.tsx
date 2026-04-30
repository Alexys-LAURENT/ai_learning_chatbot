"use client";

import { useCallback, useState } from "react";

interface DocumentUploadProps {
  onUpload: (file: File) => void;
}

export function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        setError("Seuls les fichiers PDF sont acceptés.");
        return;
      }
      setError(null);
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-background overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(75.24% 0.0884 225.59 / 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md px-6 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <span className="block h-px w-10 bg-border" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted font-medium">
              Document Chat
            </span>
            <span className="block h-px w-10 bg-border" />
          </div>
          <h1
            className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Analysez votre
            <br />
            document PDF
          </h1>
          <p className="text-muted text-sm max-w-xs">
            Importez un document pour commencer à poser vos questions
          </p>
        </div>

        {/* Drop zone */}
        <label
          htmlFor="pdf-upload"
          className="relative flex flex-col items-center justify-center gap-5 w-full h-52 cursor-pointer select-none transition-all duration-200"
          style={{
            border: isDragging
              ? "2px dashed oklch(75.24% 0.0884 225.59)"
              : "2px dashed var(--border)",
            borderRadius: "var(--radius, 2px)",
            background: isDragging
              ? "oklch(75.24% 0.0884 225.59 / 0.06)"
              : "var(--surface)",
            transform: isDragging ? "scale(1.01)" : "scale(1)",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
        >
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={handleChange}
          />

          <div
            style={{
              color: isDragging
                ? "oklch(75.24% 0.0884 225.59)"
                : "var(--muted)",
              transition: "color 0.2s",
            }}
          >
            <PdfIcon />
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {isDragging ? "Relâchez pour importer" : "Glissez votre PDF ici"}
            </p>
            <p className="text-xs text-muted">
              ou cliquez pour parcourir vos fichiers
            </p>
          </div>
        </label>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-sm -mt-6" style={{ color: "var(--danger)" }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Footer hint */}
        <p className="text-center text-xs text-muted -mt-4">
          Format accepté :{" "}
          <span className="text-foreground font-medium">PDF uniquement</span>
        </p>
      </div>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg
      width="52"
      height="60"
      viewBox="0 0 52 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4C6 2.89543 6.89543 2 8 2H32L50 20V56C50 57.1046 49.1046 58 48 58H8C6.89543 58 6 57.1046 6 56V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M32 2V18C32 19.1046 32.8954 20 34 20H50"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <rect x="12" y="29" width="22" height="1.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="12" y="34" width="17" height="1.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="12" y="39" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <text
        x="13"
        y="52"
        fontSize="8.5"
        fontWeight="800"
        fill="currentColor"
        fontFamily="monospace"
        letterSpacing="1.5"
      >
        PDF
      </text>
    </svg>
  );
}
