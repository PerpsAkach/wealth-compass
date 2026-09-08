export function recommendationConfidence(
  signalStrength: number,
  dataPoints: number,
  feedbackWeight = 1,
): number {
  const signal = Math.max(0, Math.min(1, signalStrength));
  const history = Math.max(0, Math.min(1, dataPoints / 6));
  const adaptive = Math.max(0.5, Math.min(1.5, feedbackWeight));
  const raw = 0.65 * signal + 0.35 * history;
  return Math.max(0, Math.min(1, raw * adaptive));
}
