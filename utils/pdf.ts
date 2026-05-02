import { createCanvas } from "@napi-rs/canvas";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { createRequire } from "module";
import path from "path";

// pdfjs v5 fake-worker path checks globalThis.pdfjsWorker?.WorkerMessageHandler first,
// before attempting a dynamic import of workerSrc. Setting this avoids any URL resolution.
(globalThis as Record<string, unknown>).pdfjsWorker = pdfjsWorker;

const require = createRequire(import.meta.url);
const PDFJS_DIR = path.dirname(require.resolve("pdfjs-dist/package.json"));

export type PdfPageResult =
  | { type: "image"; page: number; base64: string }
  | { type: "text"; page: number; text: string };

export interface PdfProcessOptions {
  /** Résolution DPI pour le rendu des pages en image (défaut : 150) */
  density?: number;
  /** Largeur max en pixels pour le rendu image (défaut : 1200) */
  maxWidth?: number;
}

function computeScale(
  page: PDFPageProxy,
  density: number,
  maxWidth: number,
): number {
  const baseScale = density / 72;
  const viewport = page.getViewport({ scale: baseScale });
  return viewport.width > maxWidth
    ? (maxWidth / viewport.width) * baseScale
    : baseScale;
}

async function renderPageToBase64(
  page: PDFPageProxy,
  options: PdfProcessOptions,
): Promise<string> {
  const { density = 150, maxWidth = 1200 } = options;
  const scale = computeScale(page, density, maxWidth);
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height),
  );

  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    viewport,
  } as unknown as Parameters<typeof page.render>[0]).promise;

  return canvas.toBuffer("image/png").toString("base64");
}

async function pageHasImages(page: PDFPageProxy): Promise<boolean> {
  const operatorList = await page.getOperatorList();

  const imageOps = new Set([
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintImageMaskXObject,
    pdfjs.OPS.paintInlineImageXObject,
    pdfjs.OPS.paintImageMaskXObjectGroup,
    pdfjs.OPS.paintImageXObjectRepeat,
  ]);

  return operatorList.fnArray.some((op) => imageOps.has(op));
}

/**
 * Charge un `Buffer` ou `Uint8Array` représentant un fichier PDF
 * et retourne un `PDFDocumentProxy` prêt à être consommé par les
 * autres fonctions de ce module.
 *
 * @param buffer - Contenu binaire du fichier PDF.
 * @returns Un document PDF parsé.
 *
 * @example
 * ```ts
 * import fs from "fs";
 * import { loadPdfFromBuffer } from "@/utils/pdf";
 *
 * const buffer = fs.readFileSync("./document.pdf");
 * const pdf = await loadPdfFromBuffer(buffer);
 * console.log(`${pdf.numPages} page(s) détectée(s)`);
 * ```
 */
export async function loadPdfFromBuffer(
  buffer: Buffer | Uint8Array,
): Promise<PDFDocumentProxy> {
  const data = buffer instanceof Buffer ? new Uint8Array(buffer) : buffer;
  return pdfjs.getDocument({
    data,
    cMapUrl: path.join(PDFJS_DIR, "cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: path.join(PDFJS_DIR, "standard_fonts/"),
  }).promise;
}

/**
 * Rend chaque page du PDF sous forme d'image PNG encodée en base64.
 *
 * Utile quand toutes les pages doivent être envoyées à un modèle vision
 * (ex : PDF scanné, présentation, rapport très visuel).
 *
 * @param pdf - Document PDF chargé via {@link loadPdfFromBuffer}.
 * @param options - Options de rendu (DPI, largeur max).
 * @returns Un tableau de strings base64 dans l'ordre des pages.
 *
 * @example
 * ```ts
 * import { loadPdfFromBuffer, pdfToImages } from "@/utils/pdf";
 *
 * const pdf = await loadPdfFromBuffer(buffer);
 * const images = await pdfToImages(pdf, { density: 200 });
 *
 * // images = base64 de la page 1, images = page 2, etc.[16]
 * ```
 */
export async function pdfToImages(
  pdf: PDFDocumentProxy,
  options: PdfProcessOptions = {},
): Promise<string[]> {
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    images.push(await renderPageToBase64(page, options));
    page.cleanup();
  }

  return images;
}

/**
 * Extrait le contenu textuel de toutes les pages et retourne une unique
 * string, chaque page étant séparée par un marqueur `--- Page N ---`.
 *
 * Privilégier cette méthode pour les PDFs natifs (non scannés) sans
 * contenu visuel : elle consomme beaucoup moins de tokens qu'une approche
 * par images.
 *
 * @param pdf - Document PDF chargé via {@link loadPdfFromBuffer}.
 * @returns Le texte complet du document.
 *
 * @example
 * ```ts
 * import { loadPdfFromBuffer, pdfToText } from "@/utils/pdf";
 *
 * const pdf = await loadPdfFromBuffer(buffer);
 * const text = await pdfToText(pdf);
 *
 * // "--- Page 1 ---\nLorem ipsum...\n\n--- Page 2 ---\n..."
 * ```
 */
export async function pdfToText(pdf: PDFDocumentProxy): Promise<string> {
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push(`--- Page ${i} ---\n${pageText}`);
    page.cleanup();
  }

  return pages.join("\n\n");
}

/**
 * Analyse chaque page du PDF et choisit automatiquement la meilleure
 * représentation pour un modèle IA :
 * - **image** (base64 PNG) si la page contient des éléments visuels
 *   (graphiques, photos, schémas, formulaires).
 * - **texte** brut dans le cas contraire.
 *
 * Cette approche hybride optimise le ratio qualité / tokens consommés
 * par rapport à un envoi systématique de toutes les pages en images.
 *
 * @param pdf - Document PDF chargé via {@link loadPdfFromBuffer}.
 * @param options - Options de rendu pour les pages converties en image.
 * @returns Un tableau ordonné de {@link PdfPageResult}.
 *
 * @example
 * ```ts
 * import { loadPdfFromBuffer, processPdf } from "@/utils/pdf";
 *
 * const pdf = await loadPdfFromBuffer(buffer);
 * const results = await processPdf(pdf);
 *
 * for (const page of results) {
 *   if (page.type === "image") {
 *     console.log(`Page ${page.page} → image (${page.base64.length} chars)`);
 *   } else {
 *     console.log(`Page ${page.page} → texte : ${page.text.slice(0, 80)}...`);
 *   }
 * }
 * ```
 */
export async function processPdf(
  pdf: PDFDocumentProxy,
  options: PdfProcessOptions = {},
  forcedRenderMode?: "text" | "image",
): Promise<PdfPageResult[]> {
  const results: PdfPageResult[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const useImageMode =
      forcedRenderMode === "image" ||
      (!forcedRenderMode && (await pageHasImages(page)));

    if (useImageMode) {
      const base64 = await renderPageToBase64(page, options);
      results.push({ type: "image", page: i, base64 });
    } else {
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      results.push({ type: "text", page: i, text });
    }

    page.cleanup();
  }

  return results;
}

/**
 * Convertit un tableau de {@link PdfPageResult} en un tableau de
 * `content parts` directement utilisable dans le champ `messages[]`
 * du Vercel AI SDK.
 *
 * @param results - Sortie de {@link processPdf}.
 * @returns Un tableau de parts `{ type: "text" | "image", ... }`.
 *
 * @example
 * ```ts
 * import { generateText } from "ai";
 * import { ollama } from "ai-sdk-ollama";
 * import {
 *   loadPdfFromBuffer,
 *   processPdf,
 *   pdfResultsToAiContent,
 * } from "@/utils/pdf";
 *
 * const pdf = await loadPdfFromBuffer(buffer);
 * const results = await processPdf(pdf);
 * const content = pdfResultsToAiContent(results);
 *
 * const { text } = await generateText({
 *   model: ollama("gemma4:4b"),
 *   messages: [{
 *     role: "user",
 *     content: [
 *       { type: "text", text: "Résume ce document." },
 *       ...content,
 *     ],
 *   }],
 *   maxTokens: 8000,
 * });
 * ```
 */
export function pdfResultsToAiContent(
  results: PdfPageResult[],
): Array<{ type: "text"; text: string } | { type: "image"; image: string }> {
  return results.map((result) => {
    if (result.type === "image") {
      return { type: "image" as const, image: result.base64 };
    }
    return {
      type: "text" as const,
      text: `--- Page ${result.page} ---\n${result.text}`,
    };
  });
}
