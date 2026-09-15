import { describe, expect, it } from "vitest";
import { projectGoal } from "../src/analytics/goals";

describe("goal projection", () => {
  it("calculates a positive monthly funding requirement", () => {
    const result = projectGoal(
      {
        id: "goal",
        name: "Emergency fund",
        targetAmount: 12000,
        currentAmount: 6000,
        targetDate: "2027-01-01",
        annualReturnAssumption: 0,
      },
      new Date("2026-01-01T00:00:00Z"),
    );

    expect(result.monthsRemaining).toBe(12);
    expect(result.requiredMonthlyContribution).toBeCloseTo(500, 2);
  });

  it("does not report a negative funding gap when the target is already funded", () => {
    const result = projectGoal(
      {
        id: "funded",
        name: "Funded goal",
        targetAmount: 1000,
        currentAmount: 1500,
        targetDate: "2027-01-01",
      },
      new Date("2026-01-01T00:00:00Z"),
    );

    expect(result.fundingGap).toBe(0);
    expect(result.requiredMonthlyContribution).toBeCloseTo(0, 6);
  });
});
