'use client';

import QuizComponent from '@/components/QuizComponent';
import RevisionSheetComponent from '@/components/RevisionSheetComponent';
import { MyUIMessage } from '@/types/CustomUiMessage';
import { parseCitationsFromText } from '@/utils/citations';
import { ScrollShadow, Spinner } from '@heroui/react';
import type { ChatStatus } from 'ai';
import { isFileUIPart, isTextUIPart } from 'ai';
import { Fragment, useEffect, useRef } from 'react';
import { AssistantRow } from './AssistantRow';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';

interface MessageListProps {
  messages: MyUIMessage[];
  status: ChatStatus;
}

export function MessageList({ messages, status }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div
          className="flex h-10 w-10 items-center justify-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius, 2px)',
            color: 'var(--muted)',
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
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
          >
            Votre document est prêt
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Posez votre première question ci-dessous
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollShadow hideScrollBar className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        {messages.map((message) => {
          if (message.role === 'user') {
            const rawText = message.parts
              .filter(isTextUIPart)
              .map((p) => p.text)
              .join('');
            const { citations, cleanText } = parseCitationsFromText(rawText);
            const files = message.parts.filter(isFileUIPart);
            if (!cleanText && files.length === 0 && citations.length === 0) {
              return null;
            }
            return (
              <MessageBubble
                key={message.id}
                role="user"
                content={cleanText}
                attachments={files.length > 0 ? files : undefined}
                citations={citations.length > 0 ? citations : undefined}
              />
            );
          }

          const elements = message.parts.flatMap((part, i) => {
            switch (part.type) {
              case 'reasoning':
                return part.state === 'streaming'
                  ? [
                      <ThinkingIndicator key={`${message.id}-${i}`} />,
                    ]
                  : [];
              case 'text':
                return part.text.trim()
                  ? [
                      <MessageBubble
                        key={`${message.id}-${i}`}
                        role="assistant"
                        content={part.text}
                      />,
                    ]
                  : [];
              case 'tool-displayQuizTool':
                return part.state === 'output-available'
                  ? [
                      <AssistantRow key={`${message.id}-${i}`}>
                        <QuizComponent
                          subject={part.output.subject}
                          questions={part.output.questions}
                        />
                      </AssistantRow>,
                    ]
                  : [];
              case 'tool-displayRevisionSheetTool':
                return part.state === 'output-available'
                  ? [
                      <AssistantRow key={`${message.id}-${i}`}>
                        <RevisionSheetComponent
                          subject={part.output.subject}
                          blocks={part.output.blocks}
                        />
                      </AssistantRow>,
                    ]
                  : [];
              default:
                return [];
            }
          });

          if (elements.length === 0) return null;
          return <Fragment key={message.id}>{elements}</Fragment>;
        })}

        {status === 'submitted' && <LoadingBubble />}

        <div ref={bottomRef} />
      </div>
    </ScrollShadow>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center"
        style={{
          background: 'var(--surface-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 2px)',
        }}
      >
        <Spinner size="sm" color="accent" />
      </div>
      <div
        className="px-4 py-3"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 2px)',
        }}
      >
        <div className="flex h-4 items-center gap-1.5">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 animate-bounce rounded-full"
              style={{
                background: 'var(--muted)',
                animationDelay: `${delay}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
