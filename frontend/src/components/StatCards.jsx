function StatCards({ dashboard }) {
  if (!dashboard) return null;

  return (
    <>
      <section className="cards">
        <div className="stat-card">
          <p>Total Accounts</p>
          <h2>{dashboard.total_accounts}</h2>
        </div>
        <div className="stat-card danger">
          <p>Critical Accounts</p>
          <h2>{dashboard.critical_accounts}</h2>
        </div>
        <div className="stat-card warning">
          <p>Suspicious Accounts</p>
          <h2>{dashboard.suspicious_accounts}</h2>
        </div>
        <div className="stat-card success">
          <p>Safe Accounts</p>
          <h2>{dashboard.safe_accounts}</h2>
        </div>
      </section>

      <section className="top-alert-bar">
        <div>
          ACTIVE MULE ALERTS:{" "}
          <strong>{dashboard.critical_accounts + dashboard.suspicious_accounts}</strong>
        </div>
        <div>
          CRITICAL RISK ACCOUNTS: <strong>{dashboard.critical_accounts}</strong>
        </div>
        <div>
          ANALYSIS ENGINE STATUS: <strong className="online">ONLINE</strong>
        </div>
      </section>
    </>
  );
}

export default StatCards;