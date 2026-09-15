import { describe, expect, it } from "vitest";
import { parsePdfTransactions } from "../src/ingestion/pdfTransactionParser";

describe("parsePdfTransactions", () => {
  it("parses generic searchable-PDF transaction rows", () => {
    const rows = parsePdfTransactions([
      {
        pageNumber: 1,
        text: "01/02/2026 Coffee Shop -7.50 01/03/2026 Payroll 2,500.00",
      },
    ]);

    expect(rows).toEqual([
      {
        date: "01/02/2026",
        description: "Coffee Shop",
        amount: -7.5,
        source: "pdf-page-1",
      },
      {
        date: "01/03/2026",
        description: "Payroll",
        amount: 2500,
        source: "pdf-page-1",
      },
    ]);
  });

  it("treats accounting parentheses as negative amounts", () => {
    const [row] = parsePdfTransactions([
      {
        pageNumber: 2,
        text: "02/10/2026 Utilities ($125.40)",
      },
    ]);

    expect(row.amount).toBe(-125.4);
    expect(row.source).toBe("pdf-page-2");
  });

  it("ignores unrecognized text rather than inventing transactions", () => {
    expect(parsePdfTransactions([{ pageNumber: 1, text: "Statement summary only" }])).toEqual([]);
  });
});
