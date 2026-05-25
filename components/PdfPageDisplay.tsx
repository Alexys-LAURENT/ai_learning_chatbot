'use client';

import { Spinner } from '@heroui/react';
import { useMemo } from 'react';
import { Document, Page } from 'react-pdf';

const PAGE_WIDTH = 560;

interface PdfPageDisplayProps {
  file: File | null;
  source: string;
  page: number;
  caption?: string;
}

export function PdfPageDisplay({ file, source, page, caption }: PdfPageDisplayProps) {
  const options = useMemo(
    () => ({ cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.296/cmaps/' }),
    []
  );

  if (!file) {
    return <MissingDocument source={source} page={page} />;
  }

  return (
    <div
      className="flex w-full max-w-2xl flex-col gap-2 p-3"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius, 2px)',
      }}
    >
      <header className="flex items-baseline justify-between gap-3">
        <p
          className="truncate text-xs font-medium"
          style={{ color: 'var(--foreground)' }}
          title={source}
        >
          {source}
        </p>
        <span
          className="shrink-0 text-[10px] tracking-wide uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Page {page}
        </span>
      </header>

      <div
        className="overflow-hidden"
        style={{
          background: 'var(--surface-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 2px)',
        }}
      >
        <Document
          file={file}
          options={options}
          loading={<PageLoading />}
          error={<PageError />}
        >
          <Page
            pageNumber={page}
            width={PAGE_WIDTH}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </div>

      {caption && (
        <p
          className="text-xs italic"
          style={{ color: 'var(--muted)' }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

function MissingDocument({ source, page }: { source: string; page: number }) {
  return (
    <div
      className="max-w-md p-3 text-xs"
      style={{
        background: 'var(--surface)',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius, 2px)',
        color: 'var(--muted)',
      }}
    >
      Document <span className="font-medium">{source}</span> introuvable pour la page {page}.
    </div>
  );
}

function PageLoading() {
  return (
    <div className="flex items-center justify-center py-10">
      <Spinner size="sm" color="accent" />
    </div>
  );
}

function PageError() {
  return (
    <div
      className="py-6 text-center text-xs"
      style={{ color: 'var(--danger)' }}
    >
      Impossible de charger la page.
    </div>
  );
}
