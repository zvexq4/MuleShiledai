import { useMemo, useState } from "react";
import DetailPanel from "../components/DetailPanel";
import RiskTimeline from "../components/RiskTimeline";
import InvestigationPanel from "../components/InvestigationPanel";
import generateInvestigationPDF from "../utils/generateInvestigationPDF";

function formatCurrency(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 TRY";
  }

  return `${new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(numericValue)} TRY`;
}

function Report({
  accounts = [],
  loadAccount,
  clearSelectedAccount,
  riskDetail,
  explanation,
  selectedUser,
  transactions = [],
  getRiskColor,
}) {
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const searchableText = [
        account.account_id,
        account.wallet_id,
        account.name,
        account.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [accounts, search]);

  const metrics = riskDetail?.metrics || selectedUser?.metrics || {};

  const incomingTotal =
    metrics.total_incoming ??
    transactions
      .filter((transaction) => transaction.type === "incoming")
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      );

  const outgoingTotal =
    metrics.total_outgoing ??
    transactions
      .filter((transaction) => transaction.type === "outgoing")
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      );

  const selectedAccountId =
    selectedUser?.account_id || selectedUser?.wallet_id;

  return (
    <main className="report-page">
      {!selectedUser && (
        <>
          <section className="panel report-header">
            <h2>Select Account</h2>
            <p className="empty">
              Search a wallet and generate its full investigation report.
            </p>

            <input
              className="report-search"
              placeholder="Search by wallet ID, name or city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </section>

          <section className="panel">
            <div className="report-account-list">
              {filteredAccounts.map((account) => {
                const accountId =
                  account.account_id || account.wallet_id;

                return (
                  <button
                    className="report-account-item"
                    key={accountId}
                    onClick={() => loadAccount(account)}
                  >
                    <div>
                      <strong>
                        {account.name || "Hackathon Wallet"}
                      </strong>

                      <p>
                        {accountId}
                        {account.city ? ` • ${account.city}` : ""}
                      </p>
                    </div>

                    <div className="report-account-risk">
                      <strong
                        style={{
                          color: getRiskColor(account.risk_level),
                        }}
                      >
                        {account.risk_score}/100
                      </strong>

                      <span
                        className="badge"
                        style={{
                          backgroundColor: getRiskColor(
                            account.risk_level
                          ),
                        }}
                      >
                        {(account.risk_level || "safe").toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredAccounts.length === 0 && (
                <div className="inspector-empty">
                  No wallets match this search.
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {selectedUser && riskDetail && (
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
              <p>Wallet</p>
              <h3>{selectedUser.name || "Hackathon Wallet"}</h3>
              <span>{selectedAccountId}</span>
            </div>

            <div className="summary-card">
              <p>Risk Score</p>

              <h3
                style={{
                  color: getRiskColor(riskDetail.risk_level),
                }}
              >
                {riskDetail.risk_score}/100
              </h3>

              <span>
                {(riskDetail.risk_level || "safe").toUpperCase()}
              </span>
            </div>

            <div className="summary-card">
              <p>Total Incoming</p>
              <h3>{formatCurrency(incomingTotal)}</h3>
              <span>
                {metrics.incoming_transaction_count ?? 0} transactions
              </span>
            </div>

            <div className="summary-card">
              <p>Total Outgoing</p>
              <h3>{formatCurrency(outgoingTotal)}</h3>
              <span>
                {metrics.outgoing_transaction_count ?? 0} transactions
              </span>
            </div>
          </section>

          <div className="report-detail-layout">
            <DetailPanel
              riskDetail={riskDetail}
              explanation={explanation}
              selectedUser={selectedUser}
              getRiskColor={getRiskColor}
            />

            <InvestigationPanel
              selectedUser={selectedUser}
              riskDetail={riskDetail}
              explanation={explanation}
              transactions={transactions}
              getRiskColor={getRiskColor}
            />
          </div>

          <section className="panel">
            <div className="timeline-header">
              <h2>⚠ Risk Timeline</h2>

              <button
                className="download-report-btn"
                onClick={() =>
                  generateInvestigationPDF(
                    selectedUser,
                    riskDetail,
                    explanation,
                    transactions
                  )
                }
              >
                📄 Download Investigation PDF
              </button>
            </div>

            <RiskTimeline transactions={transactions} />
          </section>

          <section className="panel">
            <h2>Recommended Actions</h2>

            <div className="insight-list">
              <p>✓ Prioritize this wallet for manual fraud review.</p>
              <p>✓ Review unique senders and destination concentration.</p>
              <p>✓ Investigate rapid outgoing transfers after incoming funds.</p>
              <p>✓ Escalate to compliance if the pattern continues.</p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default Report;