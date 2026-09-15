import "./ui/styles.css";
import sampleTransactionsCsv from "../sample_data/sample_transactions.csv?raw";
import { parseCsvStatement } from "./ingestion/csvParser";
import { extractSearchablePdfText } from "./ingestion/pdfBrowserParser";
import { parsePdfTransactions } from "./ingestion/pdfTransactionParser";
import { normalizeTransactions, type RawTransaction } from "./ingestion/normalizer";
import { categorizeTransactions } from "./analytics/categorizer";
import { analyzeWealthCompass } from "./pipeline";

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Application root not found.");

app.innerHTML = `
  <div class="shell">
    <header class="hero">
      <span class="eyebrow">PERSONAL FINANCE ANALYTICS · PORTFOLIO RECONSTRUCTION</span>
      <h1>Wealth Compass</h1>
      <p>Import a CSV statement or a searchable PDF statement to transform raw transactions into normalized records, monthly cash-flow summaries, spending deviations, and evidence-based recommendation signals.</p>
      <div class="actions">
        <label class="button primary" for="csv-file">Choose CSV statement</label>
        <input class="file-input" id="csv-file" type="file" accept=".csv,text/csv" />
        <label class="button secondary" for="pdf-file">Choose searchable PDF</label>
        <input class="file-input" id="pdf-file" type="file" accept=".pdf,application/pdf" />
        <button class="button secondary" id="load-sample" type="button">Load fictional sample</button>
      </div>
      <p class="scope">Demo only. Selected statement files are processed locally in this browser and are not uploaded by this application. PDF support uses a conservative generic searchable-text parser and will not recognize every bank statement layout. No bank connection, tax filing, trading, or autonomous financial advice.</p>
    </header>

    <section id="status" class="status-card" role="status" aria-live="polite">Choose a CSV/PDF file or load the fictional sample dataset.</section>

    <section id="summary" class="section hidden">
      <div class="section-heading"><span class="eyebrow">LATEST MONTH</span><h2>Cash-flow snapshot</h2></div>
      <div class="metrics" id="metrics"></div>
    </section>

    <section id="recommendations-section" class="section hidden">
      <div class="section-heading"><span class="eyebrow">SIGNALS</span><h2>Recommendations</h2></div>
      <div id="recommendations" class="stack"></div>
    </section>

    <section id="cashflow-section" class="section hidden">
      <div class="section-heading"><span class="eyebrow">HISTORY</span><h2>Monthly cash flow</h2></div>
      <div class="table-wrap"><table aria-label="Monthly cash flow"><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th><th>Margin</th></tr></thead><tbody id="cashflow-body"></tbody></table></div>
    </section>

    <section id="transactions-section" class="section hidden">
      <div class="section-heading"><span class="eyebrow">NORMALIZED DATA</span><h2>Transactions</h2></div>
      <div class="table-wrap"><table aria-label="Normalized transactions"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Direction</th><th>Amount</th></tr></thead><tbody id="transactions-body"></tbody></table></div>
    </section>
  </div>
`;

const csvInput = document.querySelector<HTMLInputElement>("#csv-file")!;
const pdfInput = document.querySelector<HTMLInputElement>("#pdf-file")!;
const sampleButton = document.querySelector<HTMLButtonElement>("#load-sample")!;
const status = document.querySelector<HTMLElement>("#status")!;
const resultSections = [
  "#summary",
  "#recommendations-section",
  "#cashflow-section",
  "#transactions-section",
];

function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function percent(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char] ?? char);
}

function showResults(): void {
  resultSections.forEach((selector) => document.querySelector<HTMLElement>(selector)?.classList.remove("hidden"));
}

function hideResults(): void {
  resultSections.forEach((selector) => document.querySelector<HTMLElement>(selector)?.classList.add("hidden"));
}

function renderRawTransactions(raw: RawTransaction[], sourceLabel: string): void {
  hideResults();

  try {
    const normalized = normalizeTransactions(raw);
    const transactions = categorizeTransactions(normalized.transactions);
    const analysis = analyzeWealthCompass(transactions);
    const latest = analysis.cashFlow[analysis.cashFlow.length - 1];

    if (!latest) {
      status.textContent = normalized.errors.length
        ? `No valid transactions were found in ${sourceLabel}. ${normalized.errors.length} row(s) failed normalization.`
        : `No valid transactions were found in ${sourceLabel}.`;
      return;
    }

    status.textContent = `Analyzed ${transactions.length} transactions from ${sourceLabel}. ${normalized.errors.length ? `${normalized.errors.length} row(s) were skipped during normalization.` : "All parsed rows normalized successfully."}`;

    document.querySelector<HTMLElement>("#metrics")!.innerHTML = `
      <article class="metric"><span>Month</span><strong>${escapeHtml(latest.month)}</strong></article>
      <article class="metric"><span>Income</span><strong>${money(latest.income)}</strong></article>
      <article class="metric"><span>Expenses</span><strong>${money(latest.expenses)}</strong></article>
      <article class="metric"><span>Net cash flow</span><strong>${money(latest.netCashFlow)}</strong></article>
      <article class="metric"><span>Observed margin</span><strong>${percent(latest.savingsRate)}</strong></article>
    `;

    document.querySelector<HTMLElement>("#recommendations")!.innerHTML = analysis.recommendations.length
      ? analysis.recommendations.map((rec) => `
          <article class="recommendation">
            <div class="recommendation-top"><strong>${escapeHtml(rec.title)}</strong><span>${escapeHtml(rec.priority)} · ${(rec.confidence * 100).toFixed(0)}% confidence</span></div>
            <p>${escapeHtml(rec.message)}</p>
            <small>${rec.evidence.map(escapeHtml).join(" · ")}</small>
          </article>
        `).join("")
      : `<p class="muted">No recommendation rules fired for the selected data.</p>`;

    document.querySelector<HTMLElement>("#cashflow-body")!.innerHTML = analysis.cashFlow.map((row) => `
      <tr><td>${escapeHtml(row.month)}</td><td>${money(row.income)}</td><td>${money(row.expenses)}</td><td>${money(row.netCashFlow)}</td><td>${percent(row.savingsRate)}</td></tr>
    `).join("");

    document.querySelector<HTMLElement>("#transactions-body")!.innerHTML = transactions.slice().reverse().map((tx) => `
      <tr><td>${escapeHtml(tx.date)}</td><td>${escapeHtml(tx.description)}</td><td>${escapeHtml(tx.category)}</td><td>${escapeHtml(tx.direction)}</td><td>${money(tx.amount)}</td></tr>
    `).join("");

    showResults();
  } catch (error) {
    status.textContent = `Unable to analyze ${sourceLabel}: ${error instanceof Error ? error.message : String(error)}`;
  }
}

csvInput.addEventListener("change", async () => {
  const file = csvInput.files?.[0];
  if (!file) return;

  hideResults();
  status.textContent = `Reading ${file.name}...`;
  try {
    renderRawTransactions(parseCsvStatement(await file.text()), file.name);
  } catch (error) {
    status.textContent = `Unable to parse this CSV: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    csvInput.value = "";
  }
});

pdfInput.addEventListener("change", async () => {
  const file = pdfInput.files?.[0];
  if (!file) return;

  hideResults();
  status.textContent = `Extracting searchable text from ${file.name}...`;
  try {
    const pages = await extractSearchablePdfText(file);
    const raw = parsePdfTransactions(pages);
    if (raw.length === 0) {
      throw new Error("searchable text was extracted, but no transactions matched the conservative generic PDF pattern");
    }
    renderRawTransactions(raw, `${file.name} (${pages.length} PDF page${pages.length === 1 ? "" : "s"})`);
  } catch (error) {
    status.textContent = `Unable to parse this PDF: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    pdfInput.value = "";
  }
});

sampleButton.addEventListener("click", () => {
  hideResults();
  status.textContent = "Loading fictional sample data...";
  try {
    renderRawTransactions(parseCsvStatement(sampleTransactionsCsv), "fictional sample data");
  } catch (error) {
    status.textContent = `Unable to load sample data: ${error instanceof Error ? error.message : String(error)}`;
  }
});
