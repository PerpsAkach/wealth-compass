import "./ui/styles.css";
import { parseCsvStatement } from "./ingestion/csvParser";
import { normalizeTransactions } from "./ingestion/normalizer";
import { categorizeTransactions } from "./analytics/categorizer";
import { analyzeWealthCompass } from "./pipeline";

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Application root not found.");

app.innerHTML = `
  <div class="shell">
    <header class="hero">
      <span class="eyebrow">PERSONAL FINANCE ANALYTICS · PORTFOLIO RECONSTRUCTION</span>
      <h1>Wealth Compass</h1>
      <p>Import a CSV statement to transform raw transactions into normalized records, monthly cash-flow summaries, spending deviations, and evidence-based recommendation signals.</p>
      <div class="actions">
        <label class="button primary" for="csv-file">Choose CSV statement</label>
        <input id="csv-file" type="file" accept=".csv,text/csv" />
        <button class="button secondary" id="load-sample" type="button">Load fictional sample</button>
      </div>
      <p class="scope">Demo only. No bank connection, tax filing, trading, or autonomous financial advice.</p>
    </header>

    <section id="status" class="status-card">Choose a CSV file or load the fictional sample dataset.</section>

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
      <div class="table-wrap"><table><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th><th>Margin</th></tr></thead><tbody id="cashflow-body"></tbody></table></div>
    </section>

    <section id="transactions-section" class="section hidden">
      <div class="section-heading"><span class="eyebrow">NORMALIZED DATA</span><h2>Transactions</h2></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Direction</th><th>Amount</th></tr></thead><tbody id="transactions-body"></tbody></table></div>
    </section>
  </div>
`;

const fileInput = document.querySelector<HTMLInputElement>("#csv-file")!;
const sampleButton = document.querySelector<HTMLButtonElement>("#load-sample")!;
const status = document.querySelector<HTMLElement>("#status")!;

function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function percent(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function show(selector: string): void {
  document.querySelector<HTMLElement>(selector)?.classList.remove("hidden");
}

function render(csvText: string, sourceLabel: string): void {
  try {
    const raw = parseCsvStatement(csvText);
    const normalized = normalizeTransactions(raw);
    const transactions = categorizeTransactions(normalized.transactions);
    const analysis = analyzeWealthCompass(transactions);
    const latest = analysis.cashFlow[analysis.cashFlow.length - 1];

    if (!latest) {
      status.textContent = "No valid transactions were found in this file.";
      return;
    }

    status.textContent = `Analyzed ${transactions.length} transactions from ${sourceLabel}. ${normalized.errors.length ? `${normalized.errors.length} row(s) were skipped during normalization.` : "All parsed rows normalized successfully."}`;

    document.querySelector<HTMLElement>("#metrics")!.innerHTML = `
      <article class="metric"><span>Month</span><strong>${latest.month}</strong></article>
      <article class="metric"><span>Income</span><strong>${money(latest.income)}</strong></article>
      <article class="metric"><span>Expenses</span><strong>${money(latest.expenses)}</strong></article>
      <article class="metric"><span>Net cash flow</span><strong>${money(latest.netCashFlow)}</strong></article>
      <article class="metric"><span>Observed margin</span><strong>${percent(latest.savingsRate)}</strong></article>
    `;

    document.querySelector<HTMLElement>("#recommendations")!.innerHTML = analysis.recommendations.length
      ? analysis.recommendations.map((rec) => `
          <article class="recommendation">
            <div class="recommendation-top"><strong>${rec.title}</strong><span>${rec.priority} · ${(rec.confidence * 100).toFixed(0)}% confidence</span></div>
            <p>${rec.message}</p>
            <small>${rec.evidence.join(" · ")}</small>
          </article>
        `).join("")
      : `<p class="muted">No recommendation rules fired for the selected data.</p>`;

    document.querySelector<HTMLElement>("#cashflow-body")!.innerHTML = analysis.cashFlow.map((row) => `
      <tr><td>${row.month}</td><td>${money(row.income)}</td><td>${money(row.expenses)}</td><td>${money(row.netCashFlow)}</td><td>${percent(row.savingsRate)}</td></tr>
    `).join("");

    document.querySelector<HTMLElement>("#transactions-body")!.innerHTML = transactions.slice().reverse().map((tx) => `
      <tr><td>${tx.date}</td><td>${tx.description}</td><td>${tx.category}</td><td>${tx.direction}</td><td>${money(tx.amount)}</td></tr>
    `).join("");

    show("#summary");
    show("#recommendations-section");
    show("#cashflow-section");
    show("#transactions-section");
  } catch (error) {
    status.textContent = `Unable to analyze this CSV: ${error instanceof Error ? error.message : String(error)}`;
  }
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  render(await file.text(), file.name);
});

sampleButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/sample_data/sample_transactions.csv");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    render(await response.text(), "fictional sample data");
  } catch (error) {
    status.textContent = `Unable to load sample data: ${error instanceof Error ? error.message : String(error)}`;
  }
});
