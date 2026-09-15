import type { RawTransaction } from "./normalizer";
import type { ExtractedPdfPage } from "./pdfBrowserParser";

/**
 * Statement formats differ substantially between institutions.
 *
 * This parser intentionally supports a conservative generic pattern:
 *
 *   MM/DD/YYYY  Description text  -123.45
 *   MM/DD/YYYY  Description text   123.45
 *
 * Production use should define a parser adapter per financial institution.
 */

const LINE_PATTERN =
  /(?<date>\d{1,2}\/\d{1,2}\/\d{2,4})\s+(?<description>.+?)\s+(?<amount>-?\(?\$?[\d,]+\.\d{2}\)?)$/;

function money(raw: string): number {
  const negativeByParens = raw.includes("(") && raw.includes(")");
  const cleaned = raw.replace(/[$,()]/g, "");
  const value = Number(cleaned);

  if (!Number.isFinite(value)) {
    throw new Error(`Cannot parse transaction amount: ${raw}`);
  }

  return negativeByParens ? -value : value;
}

export function parsePdfTransactions(
  pages: ExtractedPdfPage[],
): RawTransaction[] {
  const transactions: RawTransaction[] = [];

  for (const page of pages) {
    // Searchable PDFs often lose visual rows when text is flattened.
    // Split at date boundaries, but do not match a second boundary inside
    // a two-digit month (for example the "1" within "01/02/2026").
    const chunks = page.text
      .split(/(?<!\d)(?=\d{1,2}\/\d{1,2}\/\d{2,4}\s)/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const chunk of chunks) {
      const match = chunk.match(LINE_PATTERN);
      if (!match?.groups) continue;

      transactions.push({
        date: match.groups.date,
        description: match.groups.description.trim(),
        amount: money(match.groups.amount),
        source: `pdf-page-${page.pageNumber}`,
      });
    }
  }

  return transactions;
}
