# Hackathon Demo Scenario

[← Back to README](../README.md)

## Objective

Demonstrate that MuleShield AI can prioritize wallets from the provided hackathon dataset, explain deterministic risk signals, expose supporting transactions, and produce an investigation PDF.

Recommended duration: **5–7 minutes**.

## Before the Presentation

### Verify the project

Start the backend:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Confirm:

- `http://127.0.0.1:8000/health` returns a healthy response.
- `http://127.0.0.1:8000/dataset/dashboard` returns wallet data.
- `http://localhost:5173` opens successfully.
- Browser zoom and screen resolution show the complete dashboard.
- At least one wallet has visible signals and transaction history.
- PDF download is allowed by the browser.

### Keep the distinction clear

- Dashboard, Accounts, Alerts, Reports, and Analytics use Excel-backed hybrid results.
- Simulator writes only to the separate demo JSON dataset.
- The anomaly percentile is not a fraud probability.

## Presentation Flow

### 1. Opening — 30 seconds

Suggested narration:

> Mule activity is not always visible in a single payment. MuleShield AI looks at wallet behavior across transactions, combines explainable rules with unsupervised anomaly detection, and gives analysts a prioritized investigation workspace.

State that the application uses the provided hackathon Excel dataset and is a decision-support prototype.

### 2. Dashboard — 60 seconds

Open **Monitor**.

Show:

- Total wallet and transaction summary
- Safe, suspicious, and critical distribution
- Search and risk filters
- Wallet ordering and pagination
- Visible Risk Anatomy signals

Key message:

> The main score shown to the frontend is the hybrid result. It combines a deterministic rule score with a relative anomaly score.

### 3. Select a wallet — 45 seconds

Choose a wallet with multiple active signals.

Explain that selection loads wallet detail and transaction history from two endpoints in parallel. Point out:

- Hybrid risk level
- Score
- Wallet metrics
- Detection reasons

Avoid calling the score a fraud probability or final fraud decision.

### 4. Risk Anatomy — 60 seconds

Walk through the active signals:

- Multiple Senders
- Rapid Transfer
- Fan-Out
- Wallet Chain
- Flow Imbalance
- New Device, if present

Suggested narration:

> Every deterministic contribution remains visible. The analyst can see whether the score came from sender concentration, rapid movement, distribution behavior, wallet chaining, flow imbalance, or the demo new-device marker.

Mention that rule score is capped at 100 and that Critical begins at 60 for both the rule and hybrid levels, while hybrid also includes a Watchlist category.

### 5. Alerts and Accounts — 45 seconds

Open **Alerts** to show the prioritized review queue, search, filters, and signal summary. Then briefly open **Accounts** to show the broader wallet catalog and investigation navigation.

Key message:

> Different views reuse the same wallet analysis for monitoring, triage, and detailed review.

### 6. Investigation Report — 75 seconds

Open **Reports**, select a wallet, and show:

- Rule, ML, and hybrid information
- Risk breakdown
- Human-readable reasons
- Flow and investigation metrics
- Recommended analyst actions
- Supporting transaction evidence

Scroll to the paginated Transaction Timeline and explain direction, source, target, amount, and timestamp.

Click **Download PDF** and open the generated report if presentation time allows.

Key message:

> The report packages the evidence already visible in the browser. PDF creation is client-side and does not claim backend case storage.

### 7. Analytics — 45 seconds

Open **Analytics** and show:

- Risk distribution
- ML anomaly count
- Active signal distribution
- Money-flow metrics
- High-risk wallet ranking

Explain that Isolation Forest compares feature profiles within the loaded wallet population.

### 8. Simulator — 30 seconds

Open **Settings / Simulator**.

Demonstrate the form and projected UI impact. If adding a transaction, clearly state:

> The simulator writes to the demo JSON dataset. It is intentionally separate from the Excel-backed hackathon analysis.

Use reset to restore `default_transactions.json` if needed.

### 9. Closing — 20 seconds

Suggested close:

> MuleShield AI does not replace an analyst. It turns transaction behavior into a transparent priority score, shows the evidence behind that score, and shortens the path from detection to investigation.

## Technical Questions the Jury May Ask

### Which ML model is used?

Isolation Forest from scikit-learn, configured with 300 estimators and default contamination of 0.02.

### Is the anomaly score a fraud probability?

No. It is a percentile rank derived from relative Isolation Forest anomaly values.

### How is the hybrid score calculated?

The rule layer contributes 60%. The anomaly layer contributes 40% for ML-classified anomalies. For other wallets, the anomaly score is reduced to 25% before applying its 40% weight.

### What makes the result explainable?

The backend retains a per-signal `risk_breakdown`, reasons, and supporting metrics. The frontend displays these through Risk Anatomy and investigation views.

### Is it real-time?

No. The current prototype loads a local Excel dataset and warms an in-process cache at backend startup.

### Does the simulator affect the main dashboard?

No. Simulator endpoints use JSON demo data, while the primary dashboard uses the Excel hackathon dataset.

### Does it integrate with a bank?

No. There is no banking or payment-network integration in the current repository.

## Recovery Plan

If the frontend cannot load:

1. Check that FastAPI is running on port 8000.
2. Open `/health` and `/dataset/dashboard` directly.
3. Check that `datasets/real/hackathon-data-trx.xlsx` exists.
4. Restart the backend to rebuild the analysis cache.
5. Confirm the frontend is using port 5173 and can access `127.0.0.1:8000`.

If PDF export is blocked, keep the investigation view open and explain that generation is client-side.

## Demo Integrity Checklist

- Do not describe the system as production-ready.
- Do not claim live or real-time bank data.
- Do not call an anomaly percentile a probability.
- Do not imply that a high score proves fraud.
- Do not imply that simulator changes retrain or refresh the Excel model.
- Keep the analyst-in-the-loop position explicit.
