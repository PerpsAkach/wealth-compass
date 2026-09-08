import type { FeedbackWeight, RecommendationFeedback } from "../domain/models";

export function buildFeedbackWeights(feedback: RecommendationFeedback[]): FeedbackWeight[] {
  const map = new Map<string, { helpful: number; notRelevant: number }>();

  for (const row of feedback) {
    const key = row.category
      ? `${row.recommendationType}:${row.category}`
      : row.recommendationType;
    const current = map.get(key) ?? { helpful: 0, notRelevant: 0 };
    if (row.value === "Helpful") current.helpful += 1;
    else current.notRelevant += 1;
    map.set(key, current);
  }

  return [...map.entries()].map(([key, counts]) => {
    const score = (counts.helpful + 1) / (counts.helpful + counts.notRelevant + 2);
    return {
      key,
      helpful: counts.helpful,
      notRelevant: counts.notRelevant,
      weight: 0.65 + 0.70 * score,
    };
  });
}
