import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BrainCircuit,
  Network,
  ShieldAlert,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";

const SIGNAL_META = {
  multiple_senders: {
    label: "Multiple Senders",
    description:
      "Funds were received from multiple independent sources.",
  },
  rapid_transfer: {
    label: "Rapid Transfer",
    description:
      "Incoming funds were transferred out shortly after arrival.",
  },
  fan_out: {
    label: "Fan-Out Activity",
    description:
      "Funds were distributed across many unique destinations.",
  },
  wallet_chain: {
    label: "Wallet Chain",
    description:
      "Wallet-to-wallet chain activity was detected.",
  },
  flow_imbalance: {
    label: "Flow Imbalance",
    description:
      "Outgoing volume is unusually high compared with incoming volume.",
  },
  new_device: {
    label: "New Device",
    description:
      "Activity from an unrecognized device was detected.",
  },
};

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(safeNumber(value))} TRY`;
}

function getTransactionDirection(transaction) {
  const direction = (
    transaction?.direction ||
    transaction?.type ||
    ""
  ).toLowerCase();

  if (
    direction === "incoming" ||
    direction === "in"
  ) {
    return "incoming";
  }

  return "outgoing";
}

function getTransactionSource(transaction) {
  return (
    transaction?.source ||
    transaction?.sender_id ||
    transaction?.sender ||
    "Unknown source"
  );
}

function getTransactionTarget(transaction) {
  return (
    transaction?.target ||
    transaction?.receiver_id ||
    transaction?.receiver ||
    "Unknown target"
  );
}

function InvestigationPanel({
  selectedUser,
  riskDetail,
  explanation,
  transactions = [],
  getRiskColor,
}) {
  if (!selectedUser || !riskDetail) {
    return null;
  }

  const walletId =
    selectedUser.account_id ||
    selectedUser.wallet_id ||
    "Unknown Wallet";

  const metrics =
    riskDetail.metrics ||
    selectedUser.metrics ||
    {};

  const breakdown =
    riskDetail.risk_breakdown ||
    selectedUser.risk_breakdown ||
    {};

  const riskLevel =
    riskDetail.hybrid_risk_level ||
    selectedUser.hybrid_risk_level ||
    riskDetail.risk_level ||
    selectedUser.risk_level ||
    "safe";

  const riskScore =
    riskDetail.hybrid_risk_score ??
    selectedUser.hybrid_risk_score ??
    riskDetail.risk_score ??
    selectedUser.risk_score ??
    0;

  const ruleScore =
    riskDetail.rule_risk_score ??
    selectedUser.rule_risk_score ??
    riskDetail.risk_score ??
    selectedUser.risk_score ??
    0;

  const mlScore =
    riskDetail.ml_anomaly_score ??
    selectedUser.ml_anomaly_score;

  const activeSignals = Object.entries(
    breakdown
  )
    .filter(([, value]) => safeNumber(value) > 0)
    .sort(
      ([, firstValue], [, secondValue]) =>
        safeNumber(secondValue) -
        safeNumber(firstValue)
    );

  const latestTransactions = [
    ...transactions,
  ]
    .sort((firstTransaction, secondTransaction) => {
      const firstTime = new Date(
        firstTransaction.timestamp || 0
      ).getTime();

      const secondTime = new Date(
        secondTransaction.timestamp || 0
      ).getTime();

      return secondTime - firstTime;
    })
    .slice(0, 5);

  return (
    <aside className="investigation-panel">
      <div className="investigation-header">
        <ShieldAlert size={20} />

        <div>
          <span>CASE INTELLIGENCE</span>
          <h2>Investigation Case</h2>
        </div>
      </div>

      <section className="investigation-card">
        <div className="investigation-wallet-head">
          <div>
            <span>WALLET ENTITY</span>
            <strong>{walletId}</strong>
            <p>
              {selectedUser.name ||
                "Hackathon Wallet"}
            </p>
          </div>

          <span
            className="investigation-level"
            style={{
              color: getRiskColor(riskLevel),
              borderColor:
                getRiskColor(riskLevel),
            }}
          >
            {riskLevel.toUpperCase()}
          </span>
        </div>
      </section>

      <section className="investigation-card">
        <h3>Hybrid Risk Overview</h3>

        <div className="risk-score-big">
          <span
            className="risk-circle"
            style={{
              borderColor:
                getRiskColor(riskLevel),
              color:
                getRiskColor(riskLevel),
            }}
          >
            {riskScore}
          </span>

          <div className="risk-score-copy">
            <strong>
              {riskLevel.toUpperCase()}
            </strong>

            <p>
              Combined rule and anomaly score
            </p>
          </div>
        </div>

        <div className="investigation-score-grid">
          <div>
            <span>Rule Score</span>
            <strong>{ruleScore}/100</strong>
          </div>

          <div>
            <span>ML Percentile</span>
            <strong>
              {mlScore !== undefined &&
              mlScore !== null
                ? `${safeNumber(mlScore).toFixed(
                    2
                  )}/100`
                : "Unavailable"}
            </strong>
          </div>

          <div>
            <span>Hybrid Score</span>
            <strong>{riskScore}/100</strong>
          </div>
        </div>
      </section>

      <section className="investigation-card">
        <h3>Wallet Metrics</h3>

        <div className="investigation-metric-grid">
          <div>
            <Users size={16} />

            <span>Unique Senders</span>

            <strong>
              {safeNumber(
                metrics.unique_senders
              )}
            </strong>
          </div>

          <div>
            <Network size={16} />

            <span>Unique Targets</span>

            <strong>
              {safeNumber(
                metrics.unique_targets
              )}
            </strong>
          </div>

          <div>
            <Zap size={16} />

            <span>Rapid Transfers</span>

            <strong>
              {safeNumber(
                metrics.rapid_transfer_count
              )}
            </strong>
          </div>

          <div>
            <WalletCards size={16} />

            <span>Wallet Transfers</span>

            <strong>
              {safeNumber(
                metrics.wallet_transfer_count
              )}
            </strong>
          </div>
        </div>

        <div className="investigation-flow-grid">
          <div className="incoming">
            <ArrowDownToLine size={16} />

            <span>
              Total Incoming
              <strong>
                {formatCurrency(
                  metrics.total_incoming
                )}
              </strong>
            </span>
          </div>

          <div className="outgoing">
            <ArrowUpFromLine size={16} />

            <span>
              Total Outgoing
              <strong>
                {formatCurrency(
                  metrics.total_outgoing
                )}
              </strong>
            </span>
          </div>
        </div>
      </section>

      <section className="investigation-card">
        <h3>Active Risk Signals</h3>

        <div className="investigation-findings">
          {activeSignals.map(
            ([key, value]) => (
              <article key={key}>
                <div>
                  <strong>
                    {SIGNAL_META[key]?.label ||
                      key}
                  </strong>

                  <span>+{value} points</span>
                </div>

                <p>
                  {SIGNAL_META[key]
                    ?.description ||
                    "Behavioral risk signal detected."}
                </p>
              </article>
            )
          )}

          {activeSignals.length === 0 && (
            <p className="investigation-empty">
              No active rule-based risk signals
              were returned.
            </p>
          )}
        </div>
      </section>

      {explanation?.explanation && (
        <section className="investigation-card">
          <div className="investigation-card-title">
            <BrainCircuit size={17} />
            <h3>AI Explanation</h3>
          </div>

          <p className="investigation-ai-copy">
            {explanation.explanation}
          </p>
        </section>
      )}

      <section className="investigation-card">
        <h3>Latest Transactions</h3>

        <div className="investigation-transactions">
          {latestTransactions.map(
            (transaction, index) => {
              const direction =
                getTransactionDirection(
                  transaction
                );

              const transactionId =
                transaction.transaction_id ||
                transaction.id ||
                `${transaction.timestamp}-${index}`;

              return (
                <article
                  className={`mini-transaction ${direction}`}
                  key={transactionId}
                >
                  <div>
                    <strong>
                      {direction === "incoming"
                        ? "Incoming"
                        : "Outgoing"}
                    </strong>

                    <small>
                      {getTransactionSource(
                        transaction
                      )}
                      {" → "}
                      {getTransactionTarget(
                        transaction
                      )}
                    </small>
                  </div>

                  <span>
                    {direction === "incoming"
                      ? "+"
                      : "-"}
                    {formatCurrency(
                      transaction.amount
                    )}
                  </span>
                </article>
              );
            }
          )}

          {latestTransactions.length === 0 && (
            <p className="investigation-empty">
              No transactions were returned for
              this wallet.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}

export default InvestigationPanel;