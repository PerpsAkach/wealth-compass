import type {
  InvestmentProjection,
  InvestmentScenario,
} from "../domain/models";

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number`);
  }
}

function validateScenario(scenario: InvestmentScenario): void {
  assertFiniteNonNegative(scenario.initialPrincipal, "initialPrincipal");
  assertFiniteNonNegative(scenario.monthlyContribution, "monthlyContribution");

  if (!Number.isFinite(scenario.years) || scenario.years <= 0) {
    throw new Error("years must be a finite positive number");
  }
  if (!Number.isFinite(scenario.annualReturnAssumption) || scenario.annualReturnAssumption <= -1) {
    throw new Error("annualReturnAssumption must be finite and greater than -1");
  }
}

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
 * Return assumptions are supplied by the user/caller as decimal annual rates
 * (for example, 0.06 means 6%). The application does not label one scenario
 * as a guaranteed investment outcome.
 */
export function projectInvestmentScenario(
  scenario: InvestmentScenario,
): InvestmentProjection {
  validateScenario(scenario);
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
