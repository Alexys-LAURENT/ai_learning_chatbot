//TODO : Remove this endpoint when development is done. It's only used for testing the PDF processing functions in isolation

import {
  loadPdfFromBuffer,
  pdfToImages,
  pdfToText,
  processPdf,
} from "@/app/utils/pdf";

export const runtime = "nodejs";

type PdfMode = "text" | "images" | "hybrid";

type PdfApiResponse =
  | { kind: "text"; pageCount: number; text: string }
  | { kind: "images"; pageCount: number; images: string[] }
  | {
      kind: "hybrid";
      pageCount: number;
      pages: Array<
        | { type: "image"; page: number; base64: string }
        | { type: "text"; page: number; text: string }
      >;
    };

function parseNumber(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "Missing PDF file." }, { status: 400 });
  }

  const modeValue = formData.get("mode");
  const mode: PdfMode =
    modeValue === "images" || modeValue === "text" || modeValue === "hybrid"
      ? modeValue
      : "hybrid";

  const density = parseNumber(formData.get("density"));
  const maxWidth = parseNumber(formData.get("maxWidth"));

  const buffer = new Uint8Array(await file.arrayBuffer());
  const pdf = await loadPdfFromBuffer(buffer);

  const options = {
    ...(density ? { density } : {}),
    ...(maxWidth ? { maxWidth } : {}),
  };

  let response: PdfApiResponse;

  if (mode === "text") {
    response = {
      kind: "text",
      pageCount: pdf.numPages,
      text: await pdfToText(pdf),
    };
  } else if (mode === "images") {
    response = {
      kind: "images",
      pageCount: pdf.numPages,
      images: await pdfToImages(pdf, options),
    };
  } else {
    response = {
      kind: "hybrid",
      pageCount: pdf.numPages,
      pages: await processPdf(pdf, options),
    };
  }

  return Response.json(response);
}
