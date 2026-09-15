# Provenance

This repository separates four categories of material:

- **RECOVERED** — supported by prior project history or artifacts.
- **RECONSTRUCTED** — faithfully rebuilt where original source bytes were unavailable.
- **ENHANCED** — modern engineering improvements added for portfolio quality.
- **UNVERIFIED** — not presented as historical fact without supporting evidence.

## Recovered project scope

Recovered product capabilities include CSV/PDF statement import, transaction categorization, cash-flow analysis, spending baselines, deviation detection, goal projections, investment comparisons, personalized recommendations, recommendation confidence, `Helpful` / `Not Relevant` feedback, and browser-side PDF processing following a `DOMMatrix` runtime failure.

These recovered capabilities establish the historical project concept and feature scope. They do **not** establish that every line in the current repository is literal historical source code.

## Reconstructed implementation

The current TypeScript implementation reconstructs the product as a layered application with:

- transaction/domain models;
- CSV and searchable-PDF adapters;
- normalization and rule-based categorization;
- cash-flow, baseline, deviation, goal, and investment analytics;
- recommendation rules, confidence materialization, and feedback weighting;
- a Vite browser interface.

The robust MAD-based deviation formula and bounded feedback-weighting formula are reconstructed portfolio implementations rather than claims of byte-for-byte historical source.

## Enhanced engineering

Modern portfolio-quality enhancements include:

- a runnable Vite browser demo;
- direct searchable-PDF upload through browser-only PDF.js;
- conservative generic PDF transaction parsing with explicit limitations;
- bundled fictional sample data that is included in the production bundle;
- deterministic statement-date parsing with strict calendar validation;
- accounting-style CSV amount support and UTF-8 BOM handling;
- spending-deviation calibration that does not label a first-observed category as a statistical anomaly;
- recommendation confidence that uses the actual available baseline-history depth rather than assuming six months;
- validation of financial-goal and investment-scenario numeric, date, horizon, and return-assumption inputs;
- expanded unit and ingestion-to-analysis integration tests;
- deterministic dependency resolution with `package-lock.json` and `npm ci`;
- dependency auditing in GitHub Actions;
- Node.js 24 CI and production build validation;
- browser privacy messaging and accessibility cues for status/table output;
- explicit input-contract, privacy, financial-safety, and implementation-limit documentation;
- page metadata aligned with the current CSV/searchable-PDF browser demo.

## Unverified boundary

Unless supported by recovered artifacts, this repository does not claim:

- an exact historical source tree or commit history;
- an exact historical UI implementation;
- production-grade financial-data storage or bank connectivity;
- universal PDF statement compatibility;
- OCR support for image-only statements;
- regulated financial advice or autonomous investment execution.

The public portfolio should describe current enhanced functionality as **current portfolio functionality**, while preserving the distinction between recovered project history and reconstructed/enhanced engineering.
