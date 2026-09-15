import type {
  FinancialGoal,
  GoalProjection,
} from "../domain/models";

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number`);
  }
}

function parseTargetDate(value: string): Date {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("targetDate must use YYYY-MM-DD format");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const target = new Date(Date.UTC(year, month - 1, day));

  if (
    target.getUTCFullYear() !== year
    || target.getUTCMonth() !== month - 1
    || target.getUTCDate() !== day
  ) {
    throw new Error("targetDate must be a valid calendar date");
  }

  return target;
}

function validateGoal(goal: FinancialGoal, now: Date): void {
  assertFiniteNonNegative(goal.targetAmount, "targetAmount");
  assertFiniteNonNegative(goal.currentAmount, "currentAmount");

  const annualReturn = goal.annualReturnAssumption ?? 0;
  if (!Number.isFinite(annualReturn) || annualReturn <= -1) {
    throw new Error("annualReturnAssumption must be finite and greater than -1");
  }
  if (Number.isNaN(now.getTime())) {
    throw new Error("now must be a valid date");
  }
}

function monthsBetween(now: Date, target: Date): number {
  const months =
    (target.getUTCFullYear() - now.getUTCFullYear()) * 12 +
    (target.getUTCMonth() - now.getUTCMonth());

  return Math.max(0, months);
}

function futureValue(
  principal: number,
  monthlyContribution: number,
  annualReturn: number,
  months: number,
): number {
  const monthlyRate = annualReturn / 12;

  if (months <= 0) return principal;

  if (monthlyRate === 0) {
    return principal + monthlyContribution * months;
  }

  const principalFV =
    principal * Math.pow(1 + monthlyRate, months);

  const contributionFV =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return principalFV + contributionFV;
}

export function projectGoal(
  goal: FinancialGoal,
  now = new Date(),
): GoalProjection {
  validateGoal(goal, now);
  const target = parseTargetDate(goal.targetDate);
  const months = monthsBetween(now, target);
  const annualReturn = goal.annualReturnAssumption ?? 0;

  const fundingGap = Math.max(
    0,
    goal.targetAmount - goal.currentAmount,
  );

  if (months === 0) {
    return {
      goalId: goal.id,
      monthsRemaining: 0,
      fundingGap,
      requiredMonthlyContribution: fundingGap,
      projectedAmountAtTarget: goal.currentAmount,
    };
  }

  // Solve contribution by binary search so it also works when return != 0.
  let low = 0;
  let high = Math.max(goal.targetAmount, fundingGap);

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const projected = futureValue(
      goal.currentAmount,
      mid,
      annualReturn,
      months,
    );

    if (projected >= goal.targetAmount) high = mid;
    else low = mid;
  }

  const monthlyContribution = high;

  return {
    goalId: goal.id,
    monthsRemaining: months,
    fundingGap,
    requiredMonthlyContribution: monthlyContribution,
    projectedAmountAtTarget: futureValue(
      goal.currentAmount,
      monthlyContribution,
      annualReturn,
      months,
    ),
  };
}
