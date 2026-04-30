"use client";
import Image from "next/image";
//TODO : Remove this page when development is done. It's only used for testing the PDF processing functions in isolation

import { useMemo, useState } from "react";

type PdfPageResult =
  | { type: "image"; page: number; base64: string }
  | { type: "text"; page: number; text: string };

type PdfApiResponse =
  | { kind: "text"; pageCount: number; text: string }
  | { kind: "images"; pageCount: number; images: string[] }
  | { kind: "hybrid"; pageCount: number; pages: PdfPageResult[] };

type PdfMode = "hybrid" | "text" | "images";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfMode>("hybrid");
  const [density, setDensity] = useState("150");
  const [maxWidth, setMaxWidth] = useState("1200");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfApiResponse | null>(null);

  const canSubmit = useMemo(() => Boolean(file) && !loading, [file, loading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      formData.append("density", density);
      formData.append("maxWidth", maxWidth);

      const response = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Request failed.");
      }

      const payload = (await response.json()) as PdfApiResponse;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: "var(--font-bricolage-grotesque, system-ui)",
        padding: "2.5rem",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "var(--foreground)",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>
          PDF Lab
        </h1>
        <p style={{ maxWidth: "640px", opacity: 0.75 }}>
          Test the PDF helpers with a simple upload, and see the text or images
          returned by the API.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1rem",
          padding: "1.5rem",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          background: "var(--surface)",
        }}
      >
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600 }}>PDF file</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) =>
              setFile(event.target.files?.[0] ?? null)
            }
          />
        </label>

        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600 }}>Mode</span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as PdfMode)}
          >
            <option value="hybrid">Hybrid (auto)</option>
            <option value="text">Text only</option>
            <option value="images">Images only</option>
          </select>
        </label>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>Density (DPI)</span>
            <input
              type="number"
              inputMode="numeric"
              value={density}
              min={72}
              max={400}
              onChange={(event) => setDensity(event.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>Max width (px)</span>
            <input
              type="number"
              inputMode="numeric"
              value={maxWidth}
              min={400}
              max={2400}
              onChange={(event) => setMaxWidth(event.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "999px",
            border: "none",
            background: "var(--accent)",
            color: "var(--accent-foreground)",
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.6,
            width: "fit-content",
          }}
        >
          {loading ? "Processing..." : "Run"}
        </button>
      </form>

      {error ? (
        <p style={{ marginTop: "1.5rem", color: "var(--danger)" }}>{error}</p>
      ) : null}

      {result ? (
        <section style={{ marginTop: "2.5rem", display: "grid", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.4rem" }}>
            Result ({result.pageCount} pages)
          </h2>

          {result.kind === "text" ? (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                padding: "1rem",
                borderRadius: "0.75rem",
                background: "var(--surface-secondary)",
              }}
            >
              {result.text}
            </pre>
          ) : null}

          {result.kind === "images" ? (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {result.images.map((base64, index) => (
                <figure
                  key={`${base64.slice(0, 16)}-${index}`}
                  style={{ margin: 0 }}
                >
                  <Image
                    src={`data:image/png;base64,${base64}`}
                    alt={`Page ${index + 1}`}
                    style={{
                      width: "100%",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border)",
                    }}
                  />
                </figure>
              ))}
            </div>
          ) : null}

          {result.kind === "hybrid" ? (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {result.pages.map((page) => (
                <article
                  key={`${page.type}-${page.page}`}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid var(--border)",
                    background: "var(--surface-secondary)",
                  }}
                >
                  <h3 style={{ marginBottom: "0.75rem" }}>Page {page.page}</h3>
                  {page.type === "image" ? (
                    <Image
                      src={`data:image/png;base64,${page.base64}`}
                      alt={`Page ${page.page}`}
                      style={{ width: "100%", borderRadius: "0.5rem" }}
                    />
                  ) : (
                    <pre style={{ whiteSpace: "pre-wrap" }}>{page.text}</pre>
                  )}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
