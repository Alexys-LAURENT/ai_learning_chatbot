import type { Citation } from '@/types/Citation';

const MAX_PREVIEW_CHARS = 80;
const CITATION_REGEX = /<citation\s+([^>]*)>([\s\S]*?)<\/citation>\s*/g;
const ATTR_REGEX = /(\w+)="([^"]*)"/g;

export function citationPreview(text: string): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  return trimmed.length > MAX_PREVIEW_CHARS
    ? `${trimmed.slice(0, MAX_PREVIEW_CHARS)}…`
    : trimmed;
}

// Serialise les citations sous forme de balises XML que le LLM peut distinguer
// du message utilisateur. Le contenu de chaque citation est inclus tel quel.
export function formatCitationsForPrompt(citations: Citation[]): string {
  if (citations.length === 0) return '';

  const blocks = citations.map((c) => {
    const attrs = `source="${escapeAttr(c.docName)}" page="${c.page}" kind="${c.kind}"`;
    return `<citation ${attrs}>\n${c.text.trim()}\n</citation>`;
  });

  return `${blocks.join('\n')}\n\n`;
}

// Inverse de formatCitationsForPrompt : extrait les balises <citation> d'un
// texte et retourne le texte nettoyé + les citations parsées (pour affichage).
export function parseCitationsFromText(text: string): {
  citations: Citation[];
  cleanText: string;
} {
  const citations: Citation[] = [];

  const cleanText = text
    .replace(CITATION_REGEX, (_match, rawAttrs: string, body: string) => {
      const attrs = parseAttrs(rawAttrs);
      const source = unescapeAttr(attrs.source ?? '');
      citations.push({
        id: `cite-${citations.length}`,
        docId: source,
        docName: source,
        page: Number.parseInt(attrs.page ?? '0', 10) || 0,
        text: body.trim(),
        kind: attrs.kind === 'selection' ? 'selection' : 'page',
      });
      return '';
    })
    .trimStart();

  return { citations, cleanText };
}

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of raw.matchAll(ATTR_REGEX)) {
    out[match[1]] = match[2];
  }
  return out;
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;');
}

function unescapeAttr(value: string): string {
  return value.replace(/&quot;/g, '"');
}
