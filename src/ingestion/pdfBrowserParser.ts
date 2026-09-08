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

  // Dynamic import is intentional: PDF.js must not initialize in the server runtime.
  const pdfjs = await import("pdfjs-dist");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages: ExtractedPdfPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ("str" in item ? String(item.str) : ""))
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push({ pageNumber, text });
  }

  return pages;
}
