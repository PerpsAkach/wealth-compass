# Wealth Compass

Personal finance analytics application for ingesting CSV and searchable PDF statements, normalizing transactions, analyzing cash flow, establishing historical spending baselines, detecting material deviations, modeling financial goals, and generating adaptive recommendations.

## What it demonstrates

- TypeScript application architecture
- CSV and browser-side PDF ingestion
- Transaction normalization and categorization
- Cash-flow and spending analytics
- Robust historical-baseline / deviation detection
- Goal and investment scenario modeling
- Recommendation confidence and user-feedback weighting
- Client/server runtime-boundary debugging

## Architecture

```text
PDF / CSV
   |
   v
Statement ingestion
   |
   v
Transaction normalization
   |
   v
Categorization + validation
   |
   v
Historical analytics
   |
   +--> cash flow
   +--> spending baselines
   +--> deviation detection
   +--> goal projections
   |
   v
Recommendation rules
   |
   v
Confidence + Helpful / Not Relevant feedback
```

## Notable engineering issue

The PDF-processing stack originally failed in a server runtime because browser APIs such as `DOMMatrix` were unavailable. The corrected design isolates PDF.js behind a browser-only dynamic import and passes extracted plain text into platform-independent analytics code.

## Run

```bash
npm install
npm test
npm run dev
```

## Provenance

This repository is a portfolio reconstruction. Historical product behavior and major engineering decisions are separated from reconstructed and enhanced implementation details. See `PROVENANCE.md`.
