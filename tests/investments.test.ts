import { describe, expect, it } from "vitest";
import { projectInvestmentScenario } from "../src/analytics/investments";

describe("investment scenario projection", () => {
  it("matches simple contributions when return assumption is zero", () => {
    const result = projectInvestmentScenario({
      name: "No-growth baseline",
      initialPrincipal: 1000,
      monthlyContribution: 100,
      annualReturnAssumption: 0,
      years: 1,
    });

    expect(result.totalContributions).toBe(2200);
    expect(result.futureValue).toBe(2200);
    expect(result.estimatedGrowth).toBe(0);
  });

  it("reports positive estimated growth for a positive return assumption", () => {
    const result = projectInvestmentScenario({
      name: "Illustrative growth",
      initialPrincipal: 1000,
      monthlyContribution: 100,
      annualReturnAssumption: 0.06,
      years: 2,
    });

    expect(result.futureValue).toBeGreaterThan(result.totalContributions);
    expect(result.estimatedGrowth).toBeGreaterThan(0);
  });

  it("rejects non-finite, negative-capital, invalid-horizon, and impossible return assumptions", () => {
    expect(() => projectInvestmentScenario({
      name: "Negative capital",
      initialPrincipal: -1,
      monthlyContribution: 100,
      annualReturnAssumption: 0.06,
      years: 1,
    })).toThrow("initialPrincipal");

    expect(() => projectInvestmentScenario({
      name: "No horizon",
      initialPrincipal: 1000,
      monthlyContribution: 100,
      annualReturnAssumption: 0.06,
      years: 0,
    })).toThrow("years");

    expect(() => projectInvestmentScenario({
      name: "Impossible return",
      initialPrincipal: 1000,
      monthlyContribution: 100,
      annualReturnAssumption: -1,
      years: 1,
    })).toThrow("annualReturnAssumption");

    expect(() => projectInvestmentScenario({
      name: "Non-finite contribution",
      initialPrincipal: 1000,
      monthlyContribution: Number.NaN,
      annualReturnAssumption: 0.06,
      years: 1,
    })).toThrow("monthlyContribution");
  });
});
