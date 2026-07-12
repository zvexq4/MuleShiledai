# Problem Definition

[← Back to README](../README.md)

## Executive Summary

Money mule behavior is rarely explained by one transaction. It becomes visible when multiple events are evaluated together: a wallet may collect funds from many sources, move them out shortly after receipt, distribute them across many targets, or participate in repeated wallet-to-wallet transfers.

MuleShield AI addresses the analyst-prioritization part of this problem. It processes the provided hackathon transaction dataset, derives wallet-level behavioral signals, and presents explainable risk results for manual investigation.

It is a hackathon decision-support prototype. It does not block payments, connect to a bank, or make a final fraud determination.

## Why Transaction-by-Transaction Review Is Insufficient

An individual transfer may appear legitimate when viewed alone. The relevant context often exists across a wallet's broader activity:

- How many independent sources sent funds to the wallet?
- How quickly did incoming value leave again?
- How many different targets received outgoing funds?
- Did funds move through other wallets?
- Is outgoing volume disproportionate to observed incoming volume?
- Was a designated new-device indicator present?

Without aggregation, these relationships are difficult to see. A chronological transaction list also does not automatically explain which behaviors deserve attention.

## Analyst Challenges

### Prioritization

A wallet population can contain many low-risk records and a smaller number of unusual cases. Analysts need a consistent ordering mechanism to focus limited review time.

### Explainability

A score without supporting factors is difficult to validate. Reviewers need to know which measurable signals contributed to a wallet's position.

### Relative anomalies

Fixed rules capture known patterns, but they may not identify wallets whose overall activity is unusual relative to the rest of the dataset. Conversely, anomaly detection alone does not explain a case in operational terms.

### Evidence collection

After identifying a wallet, the analyst still needs supporting metrics, reasons, and transactions in one investigation view.

## Project Response

MuleShield AI combines three layers:

1. **Deterministic rules** calculate six traceable signal contributions.
2. **Isolation Forest** ranks unusual wallet feature profiles relative to the analyzed population.
3. **Investigation UI** exposes Risk Anatomy, reasons, metrics, timelines, alerts, and PDF export.

The result is intended to support prioritization and human review—not replace analyst judgment.

## Scope

### Included

- Local processing of the hackathon Excel dataset
- Wallet-level activity aggregation
- Rule, anomaly, and hybrid scoring
- Explainable signal breakdowns
- Monitoring, account, alert, analytics, and report views
- Transaction evidence and client-side PDF export
- A separate JSON-based simulator

### Not included

- Live banking or payment-network integration
- Real-time streaming ingestion
- Payment blocking or automated enforcement
- Authentication and role-based authorization
- Persistent investigation case management
- Labeled fraud-model training or production model validation

## Success Criteria for the Hackathon Prototype

The prototype succeeds when a reviewer can:

1. Load the supplied hackathon dataset.
2. See wallets prioritized by a repeatable hybrid method.
3. Understand the deterministic signals behind a selected wallet.
4. Review the relevant transaction timeline.
5. Export the available investigation evidence as a PDF.
6. Clearly distinguish implemented capabilities from future work.

## Responsible Interpretation

- `risk_score` is a prioritization value, not proof of fraud.
- `ml_anomaly_score` is a dataset-relative percentile, not a fraud probability.
- Rule thresholds are prototype settings and require domain validation.
- A flagged wallet should be manually reviewed with additional context before any operational action.
