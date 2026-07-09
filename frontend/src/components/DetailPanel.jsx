function DetailPanel({ riskDetail, explanation, selectedUser, getRiskColor }) {
  if (!riskDetail) {
    return (
      <section className="panel detail-panel">
        <p className="empty">Select an account to view risk details.</p>
      </section>
    );
  }

  return (
    <section className="panel detail-panel">
      {riskDetail && explanation && selectedUser && (
        <>
          <h2>Account Detail</h2>

          <div className="account-title">👤 {selectedUser.name}</div>

          <div className="user-meta">
            <span>{selectedUser.account_id}</span>
            <span>{selectedUser.city}</span>
            <span>{selectedUser.age} years old</span>
          </div>

          <div className="score-box">
            <p>Risk Score</p>
            <h1>{riskDetail.risk_score}/100</h1>
            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${riskDetail.risk_score}%`,
                  backgroundColor: getRiskColor(riskDetail.risk_level),
                }}
              />
            </div>
          </div>

          <h3>Risk Breakdown</h3>

          <div className="breakdown">
            <div>
              <span>Multiple Senders</span>
              <strong>+{riskDetail.risk_breakdown.multiple_senders}</strong>
            </div>
            <div>
              <span>Rapid Transfer</span>
              <strong>+{riskDetail.risk_breakdown.rapid_transfer}</strong>
            </div>
            <div>
              <span>New Device</span>
              <strong>+{riskDetail.risk_breakdown.new_device}</strong>
            </div>
          </div>

          <h3>AI Explanation</h3>
          <p className="ai-box">{explanation.explanation}</p>
        </>
      )}
    </section>
  );
}

export default DetailPanel;