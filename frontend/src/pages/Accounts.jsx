import { useState } from "react";

function Accounts({ accounts, loadAccount, setActivePage, getRiskColor }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = `${account.name} ${account.account_id} ${account.city}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter = filter === "all" || account.risk_level === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="accounts-page">
      <section className="panel accounts-header">
        <h2>👥 Customer Accounts</h2>
        <p className="empty">Search and monitor customer risk profiles.</p>

        <div className="accounts-toolbar">
          <input
            className="report-search"
            placeholder="Search by name, account ID or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="safe">Safe</option>
            <option value="suspicious">Suspicious</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </section>

      <section className="account-grid">
        {filteredAccounts.map((account) => (
          <div className="account-card polished-card" key={account.account_id}>
            <div className="account-card-top">
              <div>
                <h3>{account.name}</h3>
                <p>{account.account_id} • {account.city}</p>
              </div>

              <span
                className="badge"
                style={{ backgroundColor: getRiskColor(account.risk_level) }}
              >
                {account.risk_level.toUpperCase()}
              </span>
            </div>

            <div className="account-risk-line">
              <span>Risk Score</span>
              <strong style={{ color: getRiskColor(account.risk_level) }}>
                {account.risk_score}/100
              </strong>
            </div>

            <div className="anatomy-bar full">
              <div
                className="anatomy-fill"
                style={{
                  width: `${account.risk_score}%`,
                  backgroundColor: getRiskColor(account.risk_level),
                }}
              />
            </div>

            <div className="account-meta">
              <span>Age: {account.age}</span>
              <span>City: {account.city}</span>
            </div>

            <button
              onClick={async () => {
                await loadAccount(account);
                setActivePage("report");
              }}
            >
              View Report
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Accounts;