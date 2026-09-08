import { describe, expect, it } from "vitest";
import { detectSpendingDeviations } from "../src/analytics/deviations";
import type { CategoryBaseline, Transaction } from "../src/domain/models";


describe("spending deviation detection", () => {
  it("flags a large positive deviation", () => {
    const transactions: Transaction[] = [{
      id: "1",
      date: "2026-08-10",
      description: "Restaurant",
      normalizedDescription: "RESTAURANT",
      amount: 500,
      direction: "expense",
      category: "Dining",
    }];

    const baselines: CategoryBaseline[] = [{
      category: "Dining",
      observations: 6,
      median: 100,
      mad: 20,
      mean: 105,
    }];

    const [deviation] = detectSpendingDeviations(transactions, baselines, "2026-08");
    expect(deviation.robustScore).toBeGreaterThan(3);
    expect(deviation.severity).toBe("high");
  });
});
