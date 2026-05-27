import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header
      className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3 shrink-0"
      style={{
        borderBottom: "1px solid var(--separator)",
        background: "var(--background)",
      }}
    >
      <div className="flex items-center gap-2">
        <ChatBubbleIcon />
        <span
          className="text-xs md:text-sm font-semibold tracking-tight"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}
        >
          StudyMate
        </span>
      </div>

      <ThemeToggle />
    </header>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="oklch(75.24% 0.0884 225.59)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
