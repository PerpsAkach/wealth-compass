import type { MonthlyCashFlow, Transaction } from "../domain/models";

export function summarizeMonthlyCashFlow(transactions: Transaction[]): MonthlyCashFlow[] {
  const map = new Map<string, { income: number; expenses: number }>();

  for (const tx of transactions) {
    const month = tx.date.slice(0, 7);
    const current = map.get(month) ?? { income: 0, expenses: 0 };
    if (tx.direction === "income") current.income += tx.amount;
    else current.expenses += tx.amount;
    map.set(month, current);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => {
      const netCashFlow = values.income - values.expenses;
      return {
        month,
        income: values.income,
        expenses: values.expenses,
        netCashFlow,
        savingsRate: values.income > 0 ? netCashFlow / values.income : null,
      };
    });
}

export function spendingByCategory(transactions: Transaction[], month?: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.direction !== "expense") continue;
    if (month && !tx.date.startsWith(month)) continue;
    result[tx.category] = (result[tx.category] ?? 0) + tx.amount;
  }
  return result;
}
