import type { FileUIPart } from "ai";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | string;
  content: string;
  attachments?: FileUIPart[];
}

export function MessageBubble({ role, content, attachments }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="shrink-0 w-7 h-7 flex items-center justify-center text-[10px] font-bold tracking-wide"
        style={{
          background: isUser
            ? "oklch(75.24% 0.0884 225.59 / 0.15)"
            : "var(--surface-tertiary)",
          color: isUser ? "oklch(75.24% 0.0884 225.59)" : "var(--muted)",
          borderRadius: "var(--radius, 2px)",
          border: isUser
            ? "1px solid oklch(75.24% 0.0884 225.59 / 0.25)"
            : "1px solid var(--border)",
          marginTop: "2px",
        }}
      >
        {isUser ? "V" : "AI"}
      </div>

      <div className={`flex flex-col gap-2 max-w-[76%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            background: isUser
              ? "oklch(75.24% 0.0884 225.59 / 0.1)"
              : "var(--surface)",
            color: "var(--foreground)",
            border: isUser
              ? "1px solid oklch(75.24% 0.0884 225.59 / 0.2)"
              : "1px solid var(--border)",
            borderRadius: "var(--radius, 2px)",
          }}
        >
          {content}
        </div>

        {/* Attachments */}
        {isUser && attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-1">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 text-xs"
                style={{
                  background: "oklch(75.24% 0.0884 225.59 / 0.08)",
                  border: "1px solid oklch(75.24% 0.0884 225.59 / 0.2)",
                  borderRadius: "var(--radius, 2px)",
                  color: "var(--muted)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="truncate max-w-50">
                  {file.filename ?? file.mediaType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
