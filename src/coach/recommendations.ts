import type { FeedbackWeight, Recommendation } from "../domain/models";
import type { RecommendationCandidate } from "./rules";
import { recommendationConfidence } from "./confidence";

function stableId(type: string, title: string, category?: string): string {
  const text = `${type}|${category ?? ""}|${title}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `rec_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function materializeRecommendations(
  candidates: RecommendationCandidate[],
  weights: FeedbackWeight[] = [],
): Recommendation[] {
  return candidates.map((candidate) => {
    const key = candidate.category
      ? `${candidate.type}:${candidate.category}`
      : candidate.type;
    const feedbackWeight = weights.find((row) => row.key === key)?.weight ?? 1;

    return {
      id: stableId(candidate.type, candidate.title, candidate.category),
      type: candidate.type,
      title: candidate.title,
      message: candidate.message,
      priority: candidate.priority,
      evidence: candidate.evidence,
      category: candidate.category,
      confidence: recommendationConfidence(
        candidate.signalStrength,
        candidate.dataPoints,
        feedbackWeight,
      ),
    };
  });
}
