import { useState } from "react";
import DetailPanel from "../components/DetailPanel";
import TransactionList from "../components/TransactionList";
import RiskTimeline from "../components/RiskTimeline";
import InvestigationPanel from "../components/InvestigationPanel";

function Report({
  accounts,
  loadAccount,
  clearSelectedAccount,
  riskDetail,
  explanation,
  selectedUser,
  transactions,
  getRiskColor,
}) {
  const [search, setSearch] = useState("");

  const filteredAccounts = accounts.filter((account) =>
    `${account.name} ${account.account_id} ${account.city}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const incomingTotal = transactions
    .filter((tx) => tx.type === "incoming")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const outgoingTotal = transactions
    .filter((tx) => tx.type === "outgoing")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <main className="report-page">
      <section className="panel report-header">
        <h2>📄 Fraud Investigation Report</h2>
        <p className="empty">Search a customer and generate a full risk report.</p>

        <input
          className="report-search"
          placeholder="Search by name, account ID or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {!selectedUser && (
        <section className="panel">
          <h2>Select Account</h2>

          <div className="report-account-list">
            {filteredAccounts.map((account) => (
              <button
                className="report-account-item"
                key={account.account_id}
                onClick={() => loadAccount(account)}
              >
                <div>
                  <strong>{account.name}</strong>
                  <p>{account.account_id} • {account.city}</p>
                </div>

                <span
                  className="badge"
                  style={{ backgroundColor: getRiskColor(account.risk_level) }}
                >
                  {account.risk_level.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedUser && riskDetail && explanation && (
        <>
          <section className="panel report-selected">
            <button
              className="back-button"
              onClick={() => {
                setSearch("");
                clearSelectedAccount();
              }}
            >
              ← Back to account list
            </button>
          </section>

          <section className="report-summary-grid">
            <div className="summary-card">
              <p>Customer</p>
              <h3>{selectedUser.name}</h3>
              <span>{selectedUser.account_id}</span>
            </div>

            <div className="summary-card">
              <p>Risk Score</p>
              <h3 style={{ color: getRiskColor(riskDetail.risk_level) }}>
                {riskDetail.risk_score}/100
              </h3>
              <span>{riskDetail.risk_level.toUpperCase()}</span>
            </div>

            <div className="summary-card">
              <p>Total Incoming</p>
              <h3>{incomingTotal} TRY</h3>
              <span>Received funds</span>
            </div>

            <div className="summary-card">
              <p>Total Outgoing</p>
              <h3>{outgoingTotal} TRY</h3>
              <span>Transferred funds</span>
            </div>
          </section>

          <DetailPanel
            riskDetail={riskDetail}
            explanation={explanation}
            selectedUser={selectedUser}
            getRiskColor={getRiskColor}
          />

          <RiskTimeline transactions={transactions} />

          <section className="panel">
            <h2>Recommended Actions</h2>
            <div className="insight-list">
              <p>✓ Prioritize this account for manual fraud review.</p>
              <p>✓ Verify customer identity and recent device activity.</p>
              <p>✓ Check rapid outgoing transfers after incoming deposits.</p>
              <p>✓ Escalate to compliance team if pattern continues.</p>
            </div>
          </section>

          <section className="panel">
            <h2>Transaction History</h2>
            <InvestigationPanel
              selectedUser={selectedUser}
              riskDetail={riskDetail}
              explanation={explanation}
              transactions={transactions}
            />
          </section>
          <InvestigationPanel
            selectedUser={selectedUser}
            riskDetail={riskDetail}
            explanation={explanation}
            transactions={transactions}
          />
        </>
      )}
    </main>
  );
}

export default Report;