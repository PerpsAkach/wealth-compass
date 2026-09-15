import { describe, expect, it } from "vitest";
import { parseCsvStatement } from "../src/ingestion/csvParser";

describe("parseCsvStatement", () => {
  it("accepts common header aliases and currency formatting", () => {
    const rows = parseCsvStatement(
      "Posted Date,Merchant,Withdrawal,Deposit,Balance\n" +
      "01/02/2026,Coffee Shop,$7.50,,$992.50\n" +
      "01/03/2026,Payroll,,$2,500.00,$3,492.50\n".replace("$2,500.00", '"$2,500.00"').replace("$3,492.50", '"$3,492.50"'),
    );

    expect(rows[0]).toMatchObject({
      date: "01/02/2026",
      description: "Coffee Shop",
      debit: 7.5,
      balance: 992.5,
      source: "csv",
    });
    expect(rows[1]).toMatchObject({
      date: "01/03/2026",
      description: "Payroll",
      credit: 2500,
      balance: 3492.5,
      source: "csv",
    });
  });

  it("handles a UTF-8 BOM and accounting-style parenthesized amounts", () => {
    const rows = parseCsvStatement(
      "\uFEFFDate,Description,Amount\n01/04/2026,Utility Bill,($125.40)\n",
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      date: "01/04/2026",
      description: "Utility Bill",
      amount: -125.4,
      source: "csv",
    });
  });

  it("leaves invalid numeric values for the normalization layer to reject", () => {
    const rows = parseCsvStatement(
      "Date,Description,Amount\n01/05/2026,Malformed Amount,not-a-number\n",
    );

    expect(rows[0]?.amount).toBeUndefined();
  });

  it("rejects a row with neither a date nor description", () => {
    expect(() => parseCsvStatement("Date,Description,Amount\n,,-10.00\n")).toThrow(
      "missing date and description",
    );
  });
});
