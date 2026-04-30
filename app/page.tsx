"use client";

import { AppHeader } from "@/components/AppHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { InputBar } from "@/components/InputBar";
import { MessageList } from "@/components/MessageList";
import { Sidebar, type DocumentEntry } from "@/components/Sidebar";
import { fileToUIPart } from "@/utils/fileToUIPart";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useMemo, useState } from "react";

export default function Page() {
  const [sentDocuments, setSentDocuments] = useState<DocumentEntry[]>([]);
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status, stop, error, clearError } = useChat({ transport });

  const addDocument = useCallback((file: File) => {
    setSentDocuments((prev) => {
      if (prev.some((d) => d.file === file)) return prev;
      return [...prev, { id: crypto.randomUUID(), file, addedAt: new Date() }];
    });
  }, []);

  const handleSend = useCallback(
    async (text: string, attachment?: File) => {
      if (attachment) {
        addDocument(attachment);
        const filePart = await fileToUIPart(attachment);
        await sendMessage({ text, files: [filePart] });
      } else {
        await sendMessage({ text });
      }
    },
    [addDocument, sendMessage]
  );

  const isLoading = status === "submitted" || status === "streaming";
  const showGate = messages.length === 0 && !pendingAttachment;

  return (
    <div className="flex flex-col h-full">
      <AppHeader />

      {showGate ? (
        <DocumentUpload onUpload={setPendingAttachment} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar documents={sentDocuments} />

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
                    <button
                      onClick={stop}
                      className="underline opacity-80 hover:opacity-100 transition-opacity"
                    >
                      Arrêter
                    </button>
                  )}
                  <button
                    onClick={clearError}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <MessageList messages={messages} status={status} />

            <InputBar
              onSend={handleSend}
              isLoading={isLoading}
              attachment={pendingAttachment}
              onAttachmentChange={setPendingAttachment}
              requireAttachment={messages.length === 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
