import type { Transaction } from "../domain/models";

const RULES: Array<{ category: string; patterns: RegExp[] }> = [
  { category: "Income", patterns: [/PAYROLL/i, /DIRECT DEP/i, /SALARY/i] },
  { category: "Housing", patterns: [/RENT/i, /MORTGAGE/i] },
  { category: "Groceries", patterns: [/GROCERY/i, /SUPERMARKET/i, /WHOLE FOODS/i] },
  { category: "Dining", patterns: [/RESTAURANT/i, /CAFE/i, /COFFEE/i, /DOORDASH/i, /UBER EATS/i] },
  { category: "Transportation", patterns: [/TOLL/i, /FUEL/i, /GAS STATION/i, /UBER/i, /LYFT/i] },
  { category: "Debt Payments", patterns: [/SOFI/i, /STUDENT LOAN/i, /LOAN PAYMENT/i] },
  { category: "Subscriptions", patterns: [/NETFLIX/i, /SPOTIFY/i, /APPLE MUSIC/i, /SUBSCRIPTION/i] },
  { category: "Health & Fitness", patterns: [/GYM/i, /PHARMACY/i, /MEDICAL/i, /DENTAL/i] },
  { category: "Shopping", patterns: [/AMAZON/i, /TARGET/i, /WALMART/i] },
];

export function categorizeTransaction(tx: Transaction): Transaction {
  if (tx.direction === "income") return { ...tx, category: "Income" };

  for (const rule of RULES) {
    if (rule.category !== "Income" && rule.patterns.some((pattern) => pattern.test(tx.normalizedDescription))) {
      return { ...tx, category: rule.category };
    }
  }

  return { ...tx, category: "Other" };
}

export function categorizeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map(categorizeTransaction);
}
