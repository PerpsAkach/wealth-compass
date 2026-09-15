import { describe, expect, it } from "vitest";
import { categorizeTransactions } from "../src/analytics/categorizer";
import { parseCsvStatement } from "../src/ingestion/csvParser";
import { normalizeTransactions } from "../src/ingestion/normalizer";
import { analyzeWealthCompass } from "../src/pipeline";

describe("Wealth Compass ingestion-to-analysis pipeline", () => {
  it("turns a statement into categorized monthly cash-flow analytics", () => {
    const csv = [
      "Date,Description,Amount",
      "01/02/2026,Payroll,3000.00",
      "01/03/2026,Rent,-1200.00",
      "01/04/2026,Coffee Shop,-8.50",
      "02/02/2026,Payroll,3000.00",
      "02/03/2026,Rent,-1200.00",
      "02/04/2026,Whole Foods,-150.00",
    ].join("\n");

    const normalized = normalizeTransactions(parseCsvStatement(csv));
    expect(normalized.errors).toEqual([]);

    const transactions = categorizeTransactions(normalized.transactions);
    const analysis = analyzeWealthCompass(transactions, [], "2026-02");

    expect(transactions.map((tx) => tx.category)).toEqual([
      "Income",
      "Housing",
      "Dining",
      "Income",
      "Housing",
      "Groceries",
    ]);

    expect(analysis.cashFlow).toEqual([
      {
        month: "2026-01",
        income: 3000,
        expenses: 1208.5,
        netCashFlow: 1791.5,
        savingsRate: 1791.5 / 3000,
      },
      {
        month: "2026-02",
        income: 3000,
        expenses: 1350,
        netCashFlow: 1650,
        savingsRate: 0.55,
      },
    ]);
  });
});
