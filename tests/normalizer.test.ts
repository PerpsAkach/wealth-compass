import { describe, expect, it } from "vitest";
import { normalizeRawTransaction, normalizeTransactions } from "../src/ingestion/normalizer";

describe("normalizeRawTransaction", () => {
  it("normalizes a signed expense", () => {
    const tx = normalizeRawTransaction({
      date: "01/02/2026",
      description: " Coffee Shop 12345 ",
      amount: -7.5,
    });

    expect(tx.date).toBe("2026-01-02");
    expect(tx.direction).toBe("expense");
    expect(tx.amount).toBe(7.5);
    expect(tx.normalizedDescription).toBe("COFFEE SHOP");
  });

  it("normalizes debit/credit style statements", () => {
    const tx = normalizeRawTransaction({
      date: "2026-01-03",
      description: "PAYROLL",
      credit: 2500,
    });

    expect(tx.direction).toBe("income");
    expect(tx.amount).toBe(2500);
  });

  it("rejects rows containing both debit and credit amounts", () => {
    expect(() => normalizeRawTransaction({
      date: "2026-01-03",
      description: "AMBIGUOUS ROW",
      debit: 25,
      credit: 25,
    })).toThrow("both debit and credit");
  });

  it("rejects impossible ISO and US calendar dates", () => {
    expect(() => normalizeRawTransaction({
      date: "2026-02-30",
      description: "BAD ISO DATE",
      amount: -10,
    })).toThrow("Invalid date");

    expect(() => normalizeRawTransaction({
      date: "02/29/2025",
      description: "BAD US DATE",
      amount: -10,
    })).toThrow("Invalid date");
  });

  it("keeps valid rows while reporting invalid rows during batch normalization", () => {
    const result = normalizeTransactions([
      { date: "02/28/2025", description: "VALID", amount: -10 },
      { date: "02/29/2025", description: "INVALID", amount: -20 },
    ]);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]?.date).toBe("2025-02-28");
    expect(result.errors).toEqual(["Row 2: Invalid date: 02/29/2025"]);
  });
});
