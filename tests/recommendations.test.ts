import { describe, expect, it } from "vitest";
import { materializeRecommendations } from "../src/coach/recommendations";
import { buildRecommendationCandidates } from "../src/coach/rules";
import type { SpendingDeviation } from "../src/domain/models";

function highDiningDeviation(observations: number): SpendingDeviation {
  return {
    category: "Dining",
    currentAmount: 500,
    baselineMedian: 100,
    baselineMAD: 20,
    baselineObservations: observations,
    robustScore: 5,
    severity: "high",
  };
}

describe("recommendation evidence calibration", () => {
  it("uses the actual baseline history depth instead of assuming six months", () => {
    const shortHistory = buildRecommendationCandidates([], [highDiningDeviation(1)])[0];
    const fullHistory = buildRecommendationCandidates([], [highDiningDeviation(6)])[0];

    expect(shortHistory.dataPoints).toBe(1);
    expect(fullHistory.dataPoints).toBe(6);
    expect(shortHistory.evidence).toContain("Historical months: 1");

    const [shortRecommendation] = materializeRecommendations([shortHistory]);
    const [fullRecommendation] = materializeRecommendations([fullHistory]);
    expect(shortRecommendation.confidence).toBeLessThan(fullRecommendation.confidence);
  });
});
