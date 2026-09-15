import { describe, expect, it } from "vitest";
import { detectSpendingDeviations } from "../src/analytics/deviations";
import type { CategoryBaseline, Transaction } from "../src/domain/models";


describe("spending deviation detection", () => {
  it("flags a large positive deviation and preserves history depth", () => {
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
    expect(deviation.baselineObservations).toBe(6);
  });

  it("does not label a first-observed category as a statistical anomaly", () => {
    const transactions: Transaction[] = [{
      id: "2",
      date: "2026-08-11",
      description: "Unexpected Purchase",
      normalizedDescription: "UNEXPECTED PURCHASE",
      amount: 750,
      direction: "expense",
      category: "Other",
    }];

    const [deviation] = detectSpendingDeviations(transactions, [], "2026-08");
    expect(deviation.baselineObservations).toBe(0);
    expect(deviation.robustScore).toBe(0);
    expect(deviation.severity).toBe("normal");
  });
});
