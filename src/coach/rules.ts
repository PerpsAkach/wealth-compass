import type { MonthlyCashFlow, Recommendation, SpendingDeviation } from "../domain/models";

export interface RecommendationCandidate {
  type: Recommendation["type"];
  title: string;
  message: string;
  priority: Recommendation["priority"];
  evidence: string[];
  category?: string;
  signalStrength: number;
  dataPoints: number;
}

export function buildRecommendationCandidates(
  cashFlow: MonthlyCashFlow[],
  deviations: SpendingDeviation[],
): RecommendationCandidate[] {
  const candidates: RecommendationCandidate[] = [];
  const latest = cashFlow[cashFlow.length - 1];

  if (latest?.netCashFlow < 0) {
    candidates.push({
      type: "cash-flow",
      title: "Negative monthly cash flow",
      message: "Expenses exceeded income in the latest analyzed month.",
      priority: "high",
      evidence: [`Net cash flow: ${latest.netCashFlow.toFixed(2)}`],
      signalStrength: Math.min(1, Math.abs(latest.netCashFlow) / Math.max(1, latest.income)),
      dataPoints: cashFlow.length,
    });
  }

  for (const deviation of deviations) {
    if (deviation.severity === "high" && deviation.robustScore > 0) {
      candidates.push({
        type: "spending-deviation",
        title: `${deviation.category} spending is above baseline`,
        message: `Current ${deviation.category} spending is materially above its recent baseline.`,
        priority: "high",
        category: deviation.category,
        evidence: [
          `Current: ${deviation.currentAmount.toFixed(2)}`,
          `Baseline median: ${deviation.baselineMedian.toFixed(2)}`,
        ],
        signalStrength: Math.min(1, Math.abs(deviation.robustScore) / 5),
        dataPoints: 6,
      });
    }
  }

  return candidates;
}
