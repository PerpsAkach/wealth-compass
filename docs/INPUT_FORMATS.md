# Statement input formats

Wealth Compass accepts two portfolio-demo input paths: CSV statements and **searchable-text** PDF statements. The parsers are intentionally conservative so the application does not silently invent transactions from ambiguous input.

## CSV input

The CSV adapter recognizes these case-insensitive header aliases:

| Field | Accepted headers |
|---|---|
| Date | `date`, `transaction date`, `posted date` |
| Description | `description`, `memo`, `details`, `merchant` |
| Signed amount | `amount` |
| Debit | `debit`, `withdrawal`, `debits` |
| Credit | `credit`, `deposit`, `credits` |
| Balance | `balance` |

### Amount conventions

Use either a signed `amount` column or separate debit/credit columns.

For a signed `amount` column:

- positive values are treated as income;
- negative values are treated as expenses;
- accounting parentheses such as `($125.40)` are treated as negative values.

For separate debit/credit columns:

- debit values are treated as expenses;
- credit values are treated as income;
- a row containing both a non-zero debit and a non-zero credit is rejected during normalization.

Currency symbols and thousands separators are accepted when the CSV field is quoted where required by CSV syntax.

Example:

```csv
Date,Description,Amount
01/02/2026,Payroll,"3,000.00"
01/03/2026,Rent,-1200.00
01/04/2026,Utility Bill,($125.40)
```

## Searchable PDF input

The browser demo extracts text with PDF.js and then applies a generic transaction-row pattern. It currently recognizes rows equivalent to:

```text
MM/DD/YYYY  Description text  -123.45
MM/DD/YYYY  Description text   123.45
MM/DD/YYYY  Description text  ($123.45)
```

The PDF workflow is designed for **searchable text PDFs**. It does not perform OCR and is not presented as a universal bank-statement parser. Financial institutions use materially different statement layouts, so a production implementation should use institution-specific adapters with fixture-based validation.

If searchable text can be extracted but no rows match the conservative transaction pattern, the UI reports that no transactions were recognized rather than fabricating records.

## Date normalization

The normalization layer accepts ISO dates (`YYYY-MM-DD`) and U.S. statement dates (`MM/DD/YY` or `MM/DD/YYYY`). Calendar-invalid values such as `2026-02-30` are rejected.

## Privacy boundary

Statement files are processed in the browser demo. This repository does not connect to a bank or brokerage and does not claim production-grade financial-data storage. Users should use fictional or sanitized data when evaluating the public portfolio implementation.
