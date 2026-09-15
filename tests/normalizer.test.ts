import { describe, expect, it } from "vitest";
import { normalizeRawTransaction } from "../src/ingestion/normalizer";

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
});
