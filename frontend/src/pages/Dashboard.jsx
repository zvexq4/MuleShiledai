import AccountTable from "../components/AccountTable";
import StatCards from "../components/StatCards";

function Dashboard({ dashboard, accounts, loadAccount, getRiskColor, setActivePage }) {
  const openReport = async (account) => {
    await loadAccount(account);
    setActivePage("report");
  };

  const criticalAccounts = accounts
    .filter((account) => account.risk_level === "critical" || account.risk_level === "suspicious")
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  return (
    <>
      <section className="dashboard-hero">
        <div>
          <h2>Fraud Command Center</h2>
          <p>Real-time mule account monitoring and risk intelligence overview.</p>
        </div>

        <div className="engine-card">
          <span>AI Engine</span>
          <strong>ONLINE</strong>
          <small>Last scan: just now</small>
        </div>
      </section>

      <StatCards dashboard={dashboard} />

      <section className="dashboard-insights">
        <div className="panel">
          <h2>🚨 Priority Alerts</h2>

          {criticalAccounts.length === 0 ? (
            <p className="empty">No active high-risk alerts.</p>
          ) : (
            <div className="transaction-list">
              {criticalAccounts.map((account) => (
                <div className="transaction-item" key={account.account_id}>
                  <div>
                    <strong>{account.name}</strong>
                    <p>{account.account_id} • {account.city}</p>
                  </div>

                  <span style={{ color: getRiskColor(account.risk_level), fontWeight: "bold" }}>
                    {account.risk_score}/100
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>🤖 AI Summary</h2>
          <div className="insight-list">
            <p>✓ MuleShield is monitoring {accounts.length} active customer accounts.</p>
            <p>✓ {dashboard?.critical_accounts || 0} critical account requires urgent review.</p>
            <p>✓ Suspicious activity is evaluated using sender count, device activity and rapid transfer behavior.</p>
          </div>
        </div>
      </section>

      <main className="dashboard-layout">
        <AccountTable
          accounts={accounts}
          loadAccount={openReport}
          getRiskColor={getRiskColor}
        />
      </main>
    </>
  );
}

export default Dashboard;