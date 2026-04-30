"use client";

import { useMemo, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  convertFileListToFileUIParts,
  type FileUIPart,
} from "ai";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AppHeader } from "@/components/AppHeader";
import { Sidebar, type DocumentEntry } from "@/components/Sidebar";
import { MessageList } from "@/components/MessageList";
import { InputBar } from "@/components/InputBar";

/** Convertit un File en FileUIPart (data URL base64) via le helper SDK. */
async function fileToUIPart(file: File): Promise<FileUIPart> {
  const dt = new DataTransfer();
  dt.items.add(file);
  const [part] = await convertFileListToFileUIParts(dt.files);
  return part;
}

export default function Page() {
  // gateFile déverrouille le chat — n'apparaît PAS en sidebar avant envoi
  const [gateFile, setGateFile] = useState<File | null>(null);
  // documents : uniquement les fichiers envoyés dans un message
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status, error, stop, clearError } = useChat({
    transport,
    onError: (err) => {
      console.error("[chat]", err.message);
    },
    onFinish: ({ message }) => {
      console.debug("[chat] message terminé", message.id);
    },
  });

  const addDocument = useCallback((file: File) => {
    setDocuments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), file, addedAt: new Date() },
    ]);
  }, []);

  const handleSend = useCallback(
    async (text: string, attachment?: File) => {
      // Ajouter à la sidebar uniquement si pas déjà présent
      if (attachment && !documents.some((d) => d.file === attachment)) {
        addDocument(attachment);
      }

      if (attachment) {
        const filePart = await fileToUIPart(attachment);
        await sendMessage({ text, files: [filePart] });
      } else {
        await sendMessage({ text });
      }
    },
    [addDocument, sendMessage, documents]
  );

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-full">
      <AppHeader />

      {!gateFile ? (
        <DocumentUpload onUpload={setGateFile} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar documents={documents} />

          <div className="flex flex-col flex-1 overflow-hidden">
            {error && (
              <div
                className="flex items-center justify-between gap-4 px-4 py-2 text-xs flex-shrink-0"
                style={{
                  background: "oklch(65.32% 0.236 22.35 / 0.1)",
                  color: "var(--danger)",
                  borderBottom: "1px solid oklch(65.32% 0.236 22.35 / 0.2)",
                }}
              >
                <span className="truncate">Erreur : {error.message}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
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
              initialAttachment={messages.length === 0 ? gateFile : undefined}
              requireAttachment={messages.length === 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
