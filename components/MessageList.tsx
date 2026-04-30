"use client";

import { useEffect, useRef } from "react";
import { ScrollShadow, Spinner } from "@heroui/react";
import { isTextUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
}

export function MessageList({ messages, status }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius, 2px)",
            color: "var(--muted)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Votre document est prêt
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Posez votre première question ci-dessous
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollShadow hideScrollBar className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
        {messages.map((message) => {
          const text = message.parts
            .filter(isTextUIPart)
            .map((p) => p.text)
            .join("");
          if (!text) return null;
          return (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={text}
            />
          );
        })}

        {status === "submitted" && <LoadingBubble />}

        <div ref={bottomRef} />
      </div>
    </ScrollShadow>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-3">
      <div
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center mt-0.5"
        style={{
          background: "var(--surface-tertiary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius, 2px)",
        }}
      >
        <Spinner size="sm" color="accent" />
      </div>
      <div
        className="px-4 py-3"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius, 2px)",
        }}
      >
        <div className="flex gap-1.5 items-center h-4">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                background: "var(--muted)",
                animationDelay: `${delay}ms`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
