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

function normalizeDate(raw: string): string {
  const value = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (us) {
    const [, mm, dd, yy] = us;
    const year = yy.length === 2 ? Number(yy) + 2000 : Number(yy);
    return `${year.toString().padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date: ${raw}`);
  return parsed.toISOString().slice(0, 10);
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
