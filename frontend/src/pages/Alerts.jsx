function Alerts({ accounts, loadAccount, setActivePage }) {
  const alertAccounts = accounts.filter(
    (account) =>
      account.risk_level === "critical" ||
      account.risk_level === "suspicious"
  );

  return (
    <main className="transactions-page">
      <section className="panel">
        <h2>🚨 Active Alerts</h2>
        <p className="empty">Accounts requiring fraud team review</p>

        <div className="transaction-list">
          {alertAccounts.map((account) => (
            <div className="transaction-item" key={account.account_id}>
              <div>
                <strong>{account.name}</strong>
                <p>{account.account_id}</p>
                <p>Risk Level: {account.risk_level.toUpperCase()}</p>
              </div>

              <button
                onClick={async () => {
                  await loadAccount(account);
                  setActivePage("report");
                }}
              >
                Investigate
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Alerts;