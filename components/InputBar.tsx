"use client";

import { useState, useCallback, useRef } from "react";
import { Button, TextArea, Spinner } from "@heroui/react";

interface InputBarProps {
  onSend: (text: string, attachment?: File) => void;
  isLoading: boolean;
  attachment: File | null;
  onAttachmentChange: (file: File | null) => void;
  requireAttachment?: boolean;
}

export function InputBar({ onSend, isLoading, attachment, onAttachmentChange, requireAttachment }: InputBarProps) {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;
      if (requireAttachment && !attachment) return;
      onSend(text, attachment ?? undefined);
      setInput("");
      onAttachmentChange(null);
    },
    [input, isLoading, onSend, attachment, onAttachmentChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        onAttachmentChange(file);
      }
      e.target.value = "";
    },
    [onAttachmentChange]
  );

  const canSend =
    input.trim().length > 0 &&
    !isLoading &&
    (!requireAttachment || !!attachment);

  return (
    <div
      className="px-4 py-3 flex-shrink-0"
      style={{ borderTop: "1px solid var(--separator)", background: "var(--background)" }}
    >
      {/* Attachment preview */}
      {attachment && (
        <div className="max-w-3xl mx-auto mb-2">
          <AttachmentChip
            file={attachment}
            onRemove={() => onAttachmentChange(null)}
          />
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto flex gap-2 items-end"
      >
        {/* Paperclip button */}
        <Button
          type="button"
          onPress={() => fileInputRef.current?.click()}
          isIconOnly
          variant="ghost"
          size="sm"
          isDisabled={isLoading}
          aria-label="Joindre un document PDF"
          className="flex-shrink-0 mb-0.5"
        >
          <PaperclipIcon active={!!attachment} />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={handleFileChange}
        />

        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez une question sur vos documents… (Entrée pour envoyer)"
          disabled={isLoading}
          rows={2}
          fullWidth
          variant="primary"
          className="flex-1 resize-none"
        />

        <Button
          type="submit"
          isDisabled={!canSend}
          isIconOnly
          variant={canSend ? "primary" : "secondary"}
          size="md"
          aria-label="Envoyer le message"
          className="flex-shrink-0 mb-0.5"
        >
          {isLoading ? <Spinner size="sm" color="current" /> : <SendIcon />}
        </Button>
      </form>

      <p
        className="text-center text-[11px] mt-2"
        style={{ color: requireAttachment && !attachment ? "var(--warning)" : "var(--muted)" }}
      >
        {requireAttachment && !attachment
          ? "Un document PDF est requis pour envoyer le premier message"
          : "Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne"}
      </p>
    </div>
  );
}

function AttachmentChip({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs"
      style={{
        background: "oklch(75.24% 0.0884 225.59 / 0.1)",
        border: "1px solid oklch(75.24% 0.0884 225.59 / 0.3)",
        borderRadius: "var(--radius, 2px)",
        color: "var(--foreground)",
      }}
    >
      <svg
        width="11"
        height="13"
        viewBox="0 0 11 13"
        fill="none"
        style={{ color: "oklch(75.24% 0.0884 225.59)", flexShrink: 0 }}
      >
        <path
          d="M1.5 1.5C1.5 1.22386 1.72386 1 2 1H7L10 4V11.5C10 11.7761 9.77614 12 9.5 12H2C1.72386 12 1.5 11.7761 1.5 11.5V1.5Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M7 1V3.5C7 3.77614 7.22386 4 7.5 4H10"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <span className="font-medium max-w-[180px] truncate">{file.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="transition-colors hover:opacity-70 ml-0.5"
        style={{ color: "var(--muted)" }}
        aria-label="Retirer la pièce jointe"
      >
        ×
      </button>
    </div>
  );
}

function PaperclipIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "oklch(75.24% 0.0884 225.59)" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
