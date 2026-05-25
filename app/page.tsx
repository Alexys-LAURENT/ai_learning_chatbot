"use client";

import { AppHeader } from "@/components/AppHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { InputBar } from "@/components/InputBar";
import { MessageList } from "@/components/MessageList";
import { PdfViewerPanel } from "@/components/PdfViewerPanel";
import { Sidebar, type DocumentEntry } from "@/components/Sidebar";
import type { Citation } from "@/types/Citation";
import type { MyUIMessage } from "@/types/CustomUiMessage";
import { fileToUIPart } from "@/utils/fileToUIPart";
import { formatCitationsForPrompt } from "@/utils/citations";
import { useChat } from "@ai-sdk/react";
import { Button } from "@heroui/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useMemo, useState } from "react";

export default function Page() {
  const [sentDocuments, setSentDocuments] = useState<DocumentEntry[]>([]);
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isInitialSubmitting, setIsInitialSubmitting] = useState(false);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status, stop, error, clearError } = useChat<MyUIMessage>({ transport });

  const selectedDocument = useMemo(
    () => sentDocuments.find((d) => d.id === selectedDocId) ?? null,
    [sentDocuments, selectedDocId]
  );

  const addDocument = useCallback((file: File) => {
    setSentDocuments((prev) => {
      if (prev.some((d) => d.file === file)) return prev;
      return [...prev, { id: crypto.randomUUID(), file, addedAt: new Date() }];
    });
  }, []);

  // Premier envoi depuis le gate : un message utilisateur composé uniquement
  // de PDFs (sans texte). Le system prompt prend en charge l'accusé de réception.
  const handleInitialSubmit = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsInitialSubmitting(true);
      try {
        files.forEach(addDocument);
        const fileParts = await Promise.all(files.map(fileToUIPart));
        await sendMessage({ text: "", files: fileParts });
      } finally {
        setIsInitialSubmitting(false);
      }
    },
    [addDocument, sendMessage]
  );

  const addCitation = useCallback((citation: Omit<Citation, "id">) => {
    setCitations((prev) => [...prev, { ...citation, id: crypto.randomUUID() }]);
  }, []);

  const removeCitation = useCallback((citationId: string) => {
    setCitations((prev) => prev.filter((c) => c.id !== citationId));
  }, []);

  const handleSend = useCallback(
    async (text: string, attachment?: File) => {
      const prefix = formatCitationsForPrompt(citations);
      const finalText = prefix + text;

      if (attachment) {
        addDocument(attachment);
        const filePart = await fileToUIPart(attachment);
        await sendMessage({ text: finalText, files: [filePart] });
      } else {
        await sendMessage({ text: finalText });
      }
      setCitations([]);
    },
    [addDocument, citations, sendMessage]
  );

  const isLoading = status === "submitted" || status === "streaming";
  const showGate = messages.length === 0 && !pendingAttachment;
  const isGateSubmitting = isInitialSubmitting || isLoading;

  return (
    <div className="flex flex-col h-full">
      <AppHeader />

      {showGate ? (
        <DocumentUpload
          onSubmit={handleInitialSubmit}
          isSubmitting={isGateSubmitting}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            documents={sentDocuments}
            selectedDocId={selectedDocId}
            onSelectDocument={(doc) => setSelectedDocId(doc.id)}
          />

          {selectedDocument && (
            <PdfViewerPanel
              docId={selectedDocument.id}
              docName={selectedDocument.file.name}
              file={selectedDocument.file}
              citations={citations}
              onClose={() => setSelectedDocId(null)}
              onAddCitation={addCitation}
              onRemoveCitation={removeCitation}
            />
          )}

          <div className="flex flex-col flex-1 overflow-hidden">
            {error && (
              <div
                className="flex items-center justify-between gap-4 px-4 py-2 text-xs shrink-0"
                style={{
                  background: "oklch(65.32% 0.236 22.35 / 0.1)",
                  color: "var(--danger)",
                  borderBottom: "1px solid oklch(65.32% 0.236 22.35 / 0.2)",
                }}
              >
                <span className="truncate">Erreur : {error.message}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {status === "streaming" && (
                    <Button size="sm" variant="ghost" onPress={stop}>
                      Arrêter
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" isIconOnly onPress={clearError} aria-label="Fermer">
                    ✕
                  </Button>
                </div>
              </div>
            )}

            <MessageList messages={messages} status={status} documents={sentDocuments} />

            <InputBar
              onSend={handleSend}
              isLoading={isLoading}
              attachment={pendingAttachment}
              onAttachmentChange={setPendingAttachment}
              requireAttachment={messages.length === 0}
              citations={citations}
              onRemoveCitation={removeCitation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
