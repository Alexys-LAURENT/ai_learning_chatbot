"use client";

import { Button, Spinner } from "@heroui/react";
import { useCallback, useState } from "react";

interface DocumentUploadProps {
  onSubmit: (files: File[]) => void;
  isSubmitting?: boolean;
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}`;
}

export function DocumentUpload({ onSubmit, isSubmitting = false }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfs.length === 0) {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    setError(null);
    setFiles((prev) => {
      const existing = new Set(prev.map(fileKey));
      const fresh = pdfs.filter((f) => !existing.has(fileKey(f)));
      return [...prev, ...fresh];
    });
  }, []);

  const removeFile = useCallback((key: string) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  const handleSubmit = () => {
    if (files.length === 0 || isSubmitting) return;
    onSubmit(files);
  };

  const canSubmit = files.length > 0 && !isSubmitting;

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-100 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(75.24% 0.0884 225.59 / 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex w-full max-w-md flex-col gap-6 md:gap-8 px-4 md:px-6">
        <div className="flex flex-col items-center gap-3 md:gap-4 text-center">
          <div className="flex items-center gap-3">
            <span className="block h-px w-8 md:w-10 bg-border" />
            <span className="text-muted text-[9px] md:text-[10px] font-medium tracking-[0.2em] uppercase">
              StudyMate
            </span>
            <span className="block h-px w-8 md:w-10 bg-border" />
          </div>
          <h1
            className="text-foreground text-xl md:text-[2.5rem] leading-[1.1] font-bold tracking-tight"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Analysez vos
            <br />
            PDFs
          </h1>
          <p className="text-muted max-w-xs text-xs md:text-sm">
            Importez puis posez vos questions
          </p>
        </div>

        <label
          htmlFor="pdf-upload"
          className="relative flex h-32 md:h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 md:gap-3 select-none transition-all duration-200"
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
            multiple
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

          <div className="space-y-0.5 md:space-y-1 text-center">
            <p className="text-foreground text-xs md:text-sm font-semibold">
              {isDragging ? "Relâchez" : "Glissez vos PDF"}
            </p>
            <p className="text-muted text-[10px] md:text-xs">
              ou cliquez
            </p>
          </div>
        </label>

        {files.length > 0 && (
          <FileList files={files} onRemove={removeFile} />
        )}

        {error && (
          <p
            className="flex items-center justify-center gap-2 text-xs md:text-sm"
            style={{ color: "var(--danger)" }}
          >
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}

        <Button
          onPress={handleSubmit}
          isDisabled={!canSubmit}
          variant="primary"
          className="w-full"
        >
          {isSubmitting ? (
            <Spinner size="sm" color="current" />
          ) : (
            <>
              Démarrer
              {files.length > 0 && (
                <span className="ml-1.5 opacity-70">({files.length})</span>
              )}
            </>
          )}
        </Button>

        <p className="text-muted text-center text-[10px] md:text-xs">
          PDF uniquement
        </p>
      </div>
    </div>
  );
}

function FileList({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (key: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {files.map((file) => {
        const sizeMb = (file.size / 1024 / 1024).toFixed(2);
        return (
          <li
            key={fileKey(file)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius, 2px)",
            }}
          >
            <SmallPdfIcon />
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-medium"
                style={{ color: "var(--foreground)" }}
                title={file.name}
              >
                {file.name}
              </p>
              <p
                className="tabular-nums"
                style={{ color: "var(--muted)", fontSize: "10px" }}
              >
                {sizeMb} Mo
              </p>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => onRemove(fileKey(file))}
              aria-label="Retirer le document"
              className="h-5 w-5 min-w-0"
            >
              ×
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function PdfIcon() {
  return (
    <svg
      width="44"
      height="50"
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

function SmallPdfIcon() {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 22 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "oklch(75.24% 0.0884 225.59)", flexShrink: 0 }}
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
    </svg>
  );
}
