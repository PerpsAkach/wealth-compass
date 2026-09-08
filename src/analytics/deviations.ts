import type { CategoryBaseline, SpendingDeviation, Transaction } from "../domain/models";
import { spendingByCategory } from "./cashFlow";

function robustScore(current: number, baseline: CategoryBaseline): number {
  if (baseline.mad > 0) {
    return 0.6745 * (current - baseline.median) / baseline.mad;
  }
  if (baseline.median > 0) {
    return (current - baseline.median) / baseline.median;
  }
  return current > 0 ? 3 : 0;
}

export function detectSpendingDeviations(
  transactions: Transaction[],
  baselines: CategoryBaseline[],
  currentMonth: string,
): SpendingDeviation[] {
  const current = spendingByCategory(transactions, currentMonth);
  const baselineMap = new Map(baselines.map((row) => [row.category, row]));
  const categories = new Set([...Object.keys(current), ...baselines.map((b) => b.category)]);

  return [...categories].map((category) => {
    const baseline = baselineMap.get(category) ?? {
      category,
      observations: 0,
      median: 0,
      mad: 0,
      mean: 0,
    };
    const currentAmount = current[category] ?? 0;
    const score = robustScore(currentAmount, baseline);
    const magnitude = Math.abs(score);

    return {
      category,
      currentAmount,
      baselineMedian: baseline.median,
      baselineMAD: baseline.mad,
      robustScore: score,
      severity: magnitude >= 3 ? "high" : magnitude >= 1.5 ? "watch" : "normal",
    } as SpendingDeviation;
  });
}
