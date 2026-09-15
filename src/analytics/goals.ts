import type {
  FinancialGoal,
  GoalProjection,
} from "../domain/models";

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
  const target = new Date(`${goal.targetDate}T00:00:00Z`);
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
