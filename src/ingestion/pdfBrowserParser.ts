export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
}

function assertBrowserPdfEnvironment(): void {
  if (typeof window === "undefined") {
    throw new Error("PDF extraction is browser-only.");
  }
  if (typeof DOMMatrix === "undefined") {
    throw new Error("DOMMatrix is unavailable in this runtime.");
  }
}

export async function extractSearchablePdfText(file: File): Promise<ExtractedPdfPage[]> {
  assertBrowserPdfEnvironment();

  // Dynamic imports are intentional: PDF.js must initialize only in a browser
  // runtime, and the worker URL is resolved by Vite rather than hard-coded.
  const [pdfjs, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages: ExtractedPdfPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: unknown) => (
        typeof item === "object" && item !== null && "str" in item
          ? String((item as { str: unknown }).str)
          : ""
      ))
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push({ pageNumber, text });
  }

  return pages;
}
