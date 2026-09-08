import type { CategoryBaseline, Transaction } from "../domain/models";
import { spendingByCategory } from "./cashFlow";

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function mad(values: number[]): number {
  if (!values.length) return 0;
  const med = median(values);
  return median(values.map((v) => Math.abs(v - med)));
}

export function buildCategoryBaselines(
  transactions: Transaction[],
  historyMonths = 6,
  excludeMonth?: string,
): CategoryBaseline[] {
  const months = [...new Set(transactions.map((tx) => tx.date.slice(0, 7)))]
    .filter((m) => m !== excludeMonth)
    .sort()
    .slice(-historyMonths);

  const monthly = months.map((month) => ({ month, spending: spendingByCategory(transactions, month) }));
  const categories = new Set<string>();
  monthly.forEach(({ spending }) => Object.keys(spending).forEach((c) => categories.add(c)));

  return [...categories].map((category) => {
    const values = monthly.map(({ spending }) => spending[category] ?? 0);
    return { category, observations: values.length, median: median(values), mad: mad(values), mean: mean(values) };
  });
}
