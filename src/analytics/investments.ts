import type {
  InvestmentProjection,
  InvestmentScenario,
} from "../domain/models";

function monthlyFutureValue(
  principal: number,
  monthlyContribution: number,
  annualReturn: number,
  months: number,
): number {
  const monthlyRate = annualReturn / 12;

  if (monthlyRate === 0) {
    return principal + monthlyContribution * months;
  }

  return (
    principal * Math.pow(1 + monthlyRate, months) +
    monthlyContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  );
}

/**
 * Scenario comparison only.
 *
 * Return assumptions are supplied by the user/caller. The application does
 * not label one scenario as a guaranteed investment outcome.
 */
export function projectInvestmentScenario(
  scenario: InvestmentScenario,
): InvestmentProjection {
  const months = Math.round(scenario.years * 12);

  const futureValue = monthlyFutureValue(
    scenario.initialPrincipal,
    scenario.monthlyContribution,
    scenario.annualReturnAssumption,
    months,
  );

  const totalContributions =
    scenario.initialPrincipal +
    scenario.monthlyContribution * months;

  return {
    scenario,
    futureValue,
    totalContributions,
    estimatedGrowth: futureValue - totalContributions,
  };
}
