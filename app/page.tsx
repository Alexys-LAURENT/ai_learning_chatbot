"use client";

import { AppHeader } from "@/components/AppHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { InputBar } from "@/components/InputBar";
import { MessageList } from "@/components/MessageList";
import { Sidebar, type DocumentEntry } from "@/components/Sidebar";
import dynamic from "next/dynamic";

// react-pdf utilise pdfjs-dist qui dépend de DOMMatrix (API navigateur).
// Désactiver le SSR évite l'erreur de prerender au build.
const PdfViewerPanel = dynamic(
  () => import("@/components/PdfViewerPanel").then((m) => m.PdfViewerPanel),
  { ssr: false }
);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <>
          {/* Mobile drawer overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar */}
            <div
              className={`absolute inset-y-0 left-0 z-50 w-56 transform transition-transform md:relative md:z-auto md:transform-none ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
              }`}
            >
              <Sidebar
                documents={sentDocuments}
                selectedDocId={selectedDocId}
                onSelectDocument={(doc) => {
                  setSelectedDocId(doc.id);
                  setSidebarOpen(false);
                }}
              />
            </div>

            {/* PDF Viewer - hidden on small screens unless expanded */}
            {selectedDocument && (
              <div className="hidden lg:flex flex-col flex-shrink-0">
                <PdfViewerPanel
                  docId={selectedDocument.id}
                  docName={selectedDocument.file.name}
                  file={selectedDocument.file}
                  citations={citations}
                  onClose={() => setSelectedDocId(null)}
                  onAddCitation={addCitation}
                  onRemoveCitation={removeCitation}
                />
              </div>
            )}

            {/* Chat section */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Mobile toggle button */}
              <div className="md:hidden flex items-center px-3 py-2 shrink-0" style={{ borderBottom: "1px solid var(--separator)" }}>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Basculer la barre latérale"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </Button>
              </div>

              {error && (
                <div
                  className="flex items-center justify-between gap-4 px-3 md:px-4 py-2 text-xs shrink-0"
                  style={{
                    background: "oklch(65.32% 0.236 22.35 / 0.1)",
                    color: "var(--danger)",
                    borderBottom: "1px solid oklch(65.32% 0.236 22.35 / 0.2)",
                  }}
                >
                  <span className="truncate">Erreur : {error.message}</span>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0">
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
        </>
      )}
    </div>
  );
}
