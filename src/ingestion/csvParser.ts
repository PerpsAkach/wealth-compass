import Papa from "papaparse";
import type { RawTransaction } from "./normalizer";

type CsvRow = Record<string, string | undefined>;

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const negativeByParens = trimmed.startsWith("(") && trimmed.endsWith(")");
  const cleaned = trimmed.replace(/[$,()]/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return undefined;
  return negativeByParens ? -Math.abs(parsed) : parsed;
}

function get(row: CsvRow, ...keys: string[]): string | undefined {
  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [key.replace(/^\uFEFF/, "").trim().toLowerCase(), value]),
  );
  for (const key of keys) {
    const value = normalized.get(key.toLowerCase());
    if (value !== undefined) return value;
  }
  return undefined;
}

export function parseCsvStatement(csvText: string): RawTransaction[] {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(parsed.errors[0]?.message ?? "Unable to parse CSV");
  }

  return parsed.data.map((row, index) => {
    const date = get(row, "date", "transaction date", "posted date")?.trim() ?? "";
    const description = get(row, "description", "memo", "details", "merchant")?.trim() ?? "";

    if (!date && !description) {
      throw new Error(`Row ${index + 2} is missing date and description`);
    }

    return {
      date,
      description,
      amount: parseNumber(get(row, "amount")),
      debit: parseNumber(get(row, "debit", "withdrawal", "debits")),
      credit: parseNumber(get(row, "credit", "deposit", "credits")),
      balance: parseNumber(get(row, "balance")),
      source: "csv",
    };
  });
}
