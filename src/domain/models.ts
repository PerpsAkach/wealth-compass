export type TransactionDirection = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  normalizedDescription: string;
  amount: number;
  direction: TransactionDirection;
  category: string;
  balance?: number;
  source?: string;
}

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
  savingsRate: number | null;
}

export interface CategoryBaseline {
  category: string;
  observations: number;
  median: number;
  mad: number;
  mean: number;
}

export interface SpendingDeviation {
  category: string;
  currentAmount: number;
  baselineMedian: number;
  baselineMAD: number;
  robustScore: number;
  severity: "normal" | "watch" | "high";
}

export type RecommendationType =
  | "cash-flow"
  | "spending-deviation"
  | "savings"
  | "goal"
  | "data-quality";

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  message: string;
  confidence: number;
  priority: "low" | "medium" | "high";
  evidence: string[];
  category?: string;
}

export interface RecommendationFeedback {
  recommendationId: string;
  recommendationType: RecommendationType;
  category?: string;
  value: "Helpful" | "Not Relevant";
  timestamp: string;
}

export interface FeedbackWeight {
  key: string;
  helpful: number;
  notRelevant: number;
  weight: number;
}
