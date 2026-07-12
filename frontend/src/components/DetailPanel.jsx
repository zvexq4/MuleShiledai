import RiskAnatomyBar from "./RiskAnatomyBar";

const SIGNAL_LABELS = {
  multiple_senders: "Multiple Senders",
  rapid_transfer: "Rapid Transfer",
  fan_out: "Fan-Out Activity",
  wallet_chain: "Wallet Chain",
  flow_imbalance: "Flow Imbalance",
  new_device: "New Device",
};

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function DetailPanel({
  riskDetail,
  explanation,
  selectedUser,
  getRiskColor,
}) {
  if (!riskDetail || !selectedUser) {
    return (
      <section className="panel detail-panel">
        <p className="empty">
          Select an account to view risk details.
        </p>
      </section>
    );
  }

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

  const breakdown =
    riskDetail.risk_breakdown ||
    selectedUser.risk_breakdown ||
    {};

  const activeSignals = Object.entries(
    breakdown
  )
    .filter(([, value]) => safeNumber(value) > 0)
    .sort(
      ([, firstValue], [, secondValue]) =>
        safeNumber(secondValue) -
        safeNumber(firstValue)
    );

  const mlContribution = Math.max(
    0,
    safeNumber(riskScore) -
      safeNumber(ruleScore)
  );

  return (
    <section className="panel detail-panel">
      <div className="detail-panel-heading">
        <div>
          <span>EXPLAINABLE RISK MODEL</span>
          <h2>Account Risk Detail</h2>
        </div>

        <span
          className="detail-risk-level"
          style={{
            color: getRiskColor(riskLevel),
            borderColor:
              getRiskColor(riskLevel),
          }}
        >
          {riskLevel.toUpperCase()}
        </span>
      </div>

      <div className="score-box">
        <div className="score-box-head">
          <div>
            <p>Hybrid Risk Score</p>

            <h1
              style={{
                color:
                  getRiskColor(riskLevel),
              }}
            >
              {riskScore}
              <small>/100</small>
            </h1>
          </div>

          <div className="score-engine-summary">
            <span>
              Rule
              <strong>{ruleScore}</strong>
            </span>

            <span>
              ML
              <strong>
                {mlScore !== undefined &&
                mlScore !== null
                  ? safeNumber(mlScore).toFixed(
                      2
                    )
                  : "—"}
              </strong>
            </span>

            <span>
              Hybrid
              <strong>{riskScore}</strong>
            </span>
          </div>
        </div>

        <RiskAnatomyBar
          breakdown={breakdown}
          mlContribution={mlContribution}
          showLegend
        />
      </div>

      <div className="detail-section-heading">
        <h3>Risk Breakdown</h3>
        <span>
          {activeSignals.length} active signals
        </span>
      </div>

      <div className="breakdown">
        {activeSignals.map(([key, value]) => (
          <div key={key}>
            <span>
              {SIGNAL_LABELS[key] || key}
            </span>

            <strong>+{value}</strong>
          </div>
        ))}

        {activeSignals.length === 0 && (
          <p className="detail-empty-signals">
            No rule-based risk contribution was
            returned.
          </p>
        )}
      </div>

      {riskDetail.reasons?.length > 0 && (
        <>
          <div className="detail-section-heading">
            <h3>Detection Reasons</h3>
          </div>

          <div className="detail-reasons">
            {riskDetail.reasons.map(
              (reason, index) => (
                <p key={index}>
                  <i />
                  {reason}
                </p>
              )
            )}
          </div>
        </>
      )}

      {explanation?.explanation && (
        <>
          <div className="detail-section-heading">
            <h3>AI Explanation</h3>
          </div>

          <p className="ai-box">
            {explanation.explanation}
          </p>
        </>
      )}
    </section>
  );
}

export default DetailPanel;