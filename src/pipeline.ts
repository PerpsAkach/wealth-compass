import type { RecommendationFeedback, Transaction } from "./domain/models";
import { buildCategoryBaselines } from "./analytics/baselines";
import { summarizeMonthlyCashFlow } from "./analytics/cashFlow";
import { detectSpendingDeviations } from "./analytics/deviations";
import { buildRecommendationCandidates } from "./coach/rules";
import { buildFeedbackWeights } from "./coach/feedback";
import { materializeRecommendations } from "./coach/recommendations";

export function analyzeWealthCompass(
  transactions: Transaction[],
  feedback: RecommendationFeedback[] = [],
  currentMonth?: string,
) {
  const cashFlow = summarizeMonthlyCashFlow(transactions);
  const month = currentMonth ?? cashFlow[cashFlow.length - 1]?.month;

  if (!month) {
    return { cashFlow, baselines: [], deviations: [], recommendations: [] };
  }

  const baselines = buildCategoryBaselines(transactions, 6, month);
  const deviations = detectSpendingDeviations(transactions, baselines, month);
  const candidates = buildRecommendationCandidates(cashFlow, deviations);
  const weights = buildFeedbackWeights(feedback);
  const recommendations = materializeRecommendations(candidates, weights);

  return { cashFlow, baselines, deviations, recommendations };
}
