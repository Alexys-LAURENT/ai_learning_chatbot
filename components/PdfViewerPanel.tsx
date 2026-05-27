'use client';

import type { Citation } from '@/types/Citation';
import { citationPreview } from '@/utils/citations';
import { Button, Spinner } from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Types alignés sur la version de pdfjs bundlée par react-pdf (peut différer
// de la version directement installée dans le projet).
type PdfDocument = Awaited<ReturnType<typeof pdfjs.getDocument>['promise']>;
type PdfPage = Awaited<ReturnType<PdfDocument['getPage']>>;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker pdfjs : version alignée avec celle bundlée par react-pdf.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Hauteur constante pour la Page
const PAGE_HEIGHT = 550;

export interface PdfViewerPanelProps {
  docId: string;
  docName: string;
  file: File;
  citations: Citation[];
  onClose: () => void;
  onAddCitation: (citation: Omit<Citation, 'id'>) => void;
  onRemoveCitation: (citationId: string) => void;
}

interface PendingSelection {
  text: string;
  page: number;
}

export function PdfViewerPanel({
  docId,
  docName,
  file,
  citations,
  onClose,
  onAddCitation,
  onRemoveCitation,
}: PdfViewerPanelProps) {
  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [selection, setSelection] = useState<PendingSelection | null>(null);
  const [pageWidth, setPageWidth] = useState(400);
  const containerRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      setPageWidth(Math.min(node.clientWidth - 24, 500));
    }
  }, []);

  const documentOptions = useMemo(
    () => ({ cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.296/cmaps/' }),
    []
  );

  const pageCitations = useMemo(
    () =>
      new Map(
        citations
          .filter((c) => c.docId === docId && c.kind === 'page')
          .map((c) => [c.page, c.id])
      ),
    [citations, docId]
  );

  const handleDocumentLoad = useCallback((doc: PdfDocument) => {
    setPdfDoc(doc);
    setNumPages(doc.numPages);
  }, []);

  const togglePageCitation = useCallback(
    async (pageNumber: number) => {
      const existingId = pageCitations.get(pageNumber);
      if (existingId) {
        onRemoveCitation(existingId);
        return;
      }
      if (!pdfDoc) return;
      const page = await pdfDoc.getPage(pageNumber);
      const text = await extractPageText(page);
      onAddCitation({
        docId,
        docName,
        page: pageNumber,
        text,
        kind: 'page',
      });
    },
    [docId, docName, onAddCitation, onRemoveCitation, pageCitations, pdfDoc]
  );

  // Détecte la sélection de texte dans une page et stocke {text, page}.
  // Le numéro de page est lu sur data-page du wrapper le plus proche.
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setSelection(null);
        return;
      }
      const anchorNode = sel.anchorNode;
      if (!(anchorNode instanceof Node)) {
        setSelection(null);
        return;
      }
      const element =
        anchorNode.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as Element)
          : anchorNode.parentElement;
      const pageWrapper = element?.closest<HTMLElement>('[data-pdf-page]');
      const page = pageWrapper?.dataset.pdfPage
        ? Number.parseInt(pageWrapper.dataset.pdfPage, 10)
        : null;
      if (!page) {
        setSelection(null);
        return;
      }
      setSelection({ text, page });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () =>
      document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleAddSelection = useCallback(() => {
    if (!selection) return;
    onAddCitation({
      docId,
      docName,
      page: selection.page,
      text: selection.text,
      kind: 'selection',
    });
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, [docId, docName, onAddCitation, selection]);

  return (
    <aside
      ref={containerRef}
      className="hidden lg:flex lg:w-96 xl:w-[500px] shrink-0 flex-col overflow-hidden"
      style={{
        borderRight: '1px solid var(--separator)',
        background: 'var(--surface)',
      }}
    >
      <header
        className="flex shrink-0 items-center justify-between gap-2 px-3 md:px-4 py-3"
        style={{ borderBottom: '1px solid var(--separator)' }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-medium tracking-[0.15em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Document
          </p>
          <p
            className="truncate text-xs font-medium"
            style={{ color: 'var(--foreground)' }}
            title={docName}
          >
            {docName}
          </p>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={onClose}
          aria-label="Fermer le document"
        >
          ✕
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-2 md:px-3 py-3">
        <Document
          file={file}
          onLoadSuccess={handleDocumentLoad}
          options={documentOptions}
          loading={<ViewerLoading />}
          error={<ViewerError />}
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
            <PageItem
              key={pageNumber}
              pageNumber={pageNumber}
              checked={pageCitations.has(pageNumber)}
              onToggle={togglePageCitation}
              pageWidth={pageWidth}
            />
          ))}
        </Document>
      </div>

      {selection && (
        <SelectionBar
          selection={selection}
          onAdd={handleAddSelection}
          onDismiss={() => {
            window.getSelection()?.removeAllRanges();
            setSelection(null);
          }}
        />
      )}
    </aside>
  );
}

function PageItem({
  pageNumber,
  checked,
  onToggle,
  pageWidth,
}: {
  pageNumber: number;
  checked: boolean;
  onToggle: (pageNumber: number) => void;
  pageWidth: number;
}) {
  return (
    <div
      data-pdf-page={pageNumber}
      className="relative mb-3 last:mb-0"
      style={{
        border: checked
          ? '2px solid oklch(75.24% 0.0884 225.59)'
          : '1px solid var(--border)',
        borderRadius: 'var(--radius, 2px)',
        background: 'var(--surface-secondary)',
      }}
    >
      <div className="absolute top-2 left-2 z-10">
        <label
          className="flex cursor-pointer items-center gap-1.5 px-2 py-1 text-[10px] font-medium select-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius, 2px)',
            color: 'var(--foreground)',
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(pageNumber)}
            className="h-3 w-3 cursor-pointer"
          />
          Page {pageNumber}
        </label>
      </div>
      <Page
        pageNumber={pageNumber}
        width={pageWidth}
        height={PAGE_HEIGHT}
        renderAnnotationLayer={false}
      />
    </div>
  );
}

function SelectionBar({
  selection,
  onAdd,
  onDismiss,
}: {
  selection: PendingSelection;
  onAdd: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-2 px-3 py-2"
      style={{
        borderTop: '1px solid var(--separator)',
        background: 'var(--surface-secondary)',
      }}
    >
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-medium tracking-wide uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Sélection · page {selection.page}
        </p>
        <p
          className="truncate text-xs"
          style={{ color: 'var(--foreground)' }}
          title={selection.text}
        >
          {citationPreview(selection.text)}
        </p>
      </div>
      <Button size="sm" variant="ghost" onPress={onDismiss}>
        Annuler
      </Button>
      <Button size="sm" variant="primary" onPress={onAdd}>
        Citer
      </Button>
    </div>
  );
}

function ViewerLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner size="sm" color="accent" />
    </div>
  );
}

function ViewerError() {
  return (
    <div
      className="py-8 text-center text-xs"
      style={{ color: 'var(--danger)' }}
    >
      Impossible de charger le PDF.
    </div>
  );
}

async function extractPageText(page: PdfPage): Promise<string> {
  const content = await page.getTextContent();
  return content.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
