import { describe, expect, it } from "vitest";
import { buildFeedbackWeights } from "../src/coach/feedback";

describe("adaptive feedback weights", () => {
  it("gives helpful-heavy feedback a larger weight", () => {
    const helpful = buildFeedbackWeights([
      {
        recommendationId: "a",
        recommendationType: "spending-deviation",
        category: "Dining",
        value: "Helpful",
        timestamp: "2026-01-01T00:00:00Z",
      },
      {
        recommendationId: "b",
        recommendationType: "spending-deviation",
        category: "Dining",
        value: "Helpful",
        timestamp: "2026-01-02T00:00:00Z",
      },
    ]);

    const irrelevant = buildFeedbackWeights([
      {
        recommendationId: "c",
        recommendationType: "spending-deviation",
        category: "Dining",
        value: "Not Relevant",
        timestamp: "2026-01-03T00:00:00Z",
      },
      {
        recommendationId: "d",
        recommendationType: "spending-deviation",
        category: "Dining",
        value: "Not Relevant",
        timestamp: "2026-01-04T00:00:00Z",
      },
    ]);

    expect(helpful[0].weight).toBeGreaterThan(irrelevant[0].weight);
  });
});
