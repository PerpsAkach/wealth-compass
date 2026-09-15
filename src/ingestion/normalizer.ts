import type { Transaction } from "../domain/models";

export interface RawTransaction {
  date: string;
  description: string;
  amount?: number;
  debit?: number;
  credit?: number;
  balance?: number;
  source?: string;
}

export interface NormalizationResult {
  transactions: Transaction[];
  errors: string[];
}

function isoDate(year: number, month: number, day: number, raw: string): string {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error(`Invalid date: ${raw}`);
  }

  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() !== month - 1
    || candidate.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: ${raw}`);
  }

  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function normalizeDate(raw: string): string {
  const value = raw.trim();

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]), raw);
  }

  const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (us) {
    const [, mm, dd, yy] = us;
    const year = yy.length === 2 ? Number(yy) + 2000 : Number(yy);
    return isoDate(year, Number(mm), Number(dd), raw);
  }

  throw new Error(`Invalid date: ${raw}`);
}

function normalizedDescription(raw: string): string {
  return raw.toUpperCase().replace(/\b\d{4,}\b/g, "").replace(/[^\p{L}\p{N}&' -]+/gu, " ").replace(/\s+/g, " ").trim();
}

export function normalizeRawTransaction(raw: RawTransaction): Transaction {
  const date = normalizeDate(raw.date);
  const description = raw.description.trim();
  if (!description) throw new Error("Transaction description is empty");

  let direction: "income" | "expense";
  let amount: number;

  if (raw.debit !== undefined || raw.credit !== undefined) {
    const debit = Math.abs(raw.debit ?? 0);
    const credit = Math.abs(raw.credit ?? 0);
    if (debit > 0 && credit > 0) throw new Error("Transaction cannot contain both debit and credit");
    direction = credit > 0 ? "income" : "expense";
    amount = credit > 0 ? credit : debit;
  } else {
    if (raw.amount === undefined || !Number.isFinite(raw.amount)) throw new Error("Missing amount");
    direction = raw.amount >= 0 ? "income" : "expense";
    amount = Math.abs(raw.amount);
  }

  const key = `${date}|${description}|${amount}|${direction}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return {
    id: `tx_${(hash >>> 0).toString(16)}`,
    date,
    description,
    normalizedDescription: normalizedDescription(description),
    amount,
    direction,
    category: "Uncategorized",
    balance: raw.balance,
    source: raw.source,
  };
}

export function normalizeTransactions(rawTransactions: RawTransaction[]): NormalizationResult {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  rawTransactions.forEach((raw, index) => {
    try {
      transactions.push(normalizeRawTransaction(raw));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Row ${index + 1}: ${message}`);
    }
  });

  return { transactions, errors };
}
