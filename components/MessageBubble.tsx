interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | string;
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[10px] font-bold tracking-wide"
        style={{
          background: isUser
            ? "oklch(75.24% 0.0884 225.59 / 0.15)"
            : "var(--surface-tertiary)",
          color: isUser
            ? "oklch(75.24% 0.0884 225.59)"
            : "var(--muted)",
          borderRadius: "var(--radius, 2px)",
          border: isUser
            ? "1px solid oklch(75.24% 0.0884 225.59 / 0.25)"
            : "1px solid var(--border)",
          marginTop: "2px",
        }}
      >
        {isUser ? "V" : "AI"}
      </div>

      {/* Bubble */}
      <div
        className="max-w-[76%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
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
    </div>
  );
}
