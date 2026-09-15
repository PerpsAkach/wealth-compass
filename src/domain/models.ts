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
  baselineObservations: number;
  robustScore: number;
  severity: "normal" | "watch" | "high";
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  annualReturnAssumption?: number;
}

export interface GoalProjection {
  goalId: string;
  monthsRemaining: number;
  fundingGap: number;
  requiredMonthlyContribution: number;
  projectedAmountAtTarget: number;
}

export interface InvestmentScenario {
  name: string;
  initialPrincipal: number;
  monthlyContribution: number;
  annualReturnAssumption: number;
  years: number;
}

export interface InvestmentProjection {
  scenario: InvestmentScenario;
  futureValue: number;
  totalContributions: number;
  estimatedGrowth: number;
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
