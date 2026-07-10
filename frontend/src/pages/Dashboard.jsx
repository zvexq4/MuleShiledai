import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import RiskAnatomyBar from "../components/RiskAnatomyBar";

function pseudoSeries(seed, length, min = 20, max = 100) {
  const safeSeed = String(seed || "default");
  let hash = 0;

  for (let index = 0; index < safeSeed.length; index += 1) {
    hash = (
      hash * 31
      + safeSeed.charCodeAt(index)
    ) >>> 0;
  }

  const series = [];

  for (let index = 0; index < length; index += 1) {
    hash = (
      hash * 1103515245
      + 12345
    ) >>> 0;

    series.push(
      min + (hash % (max - min))
    );
  }

  return series;
}

const IMPACT_META = {
  multiple_senders: {
    label: "Multiple Senders",
    text: (value) =>
      `Multiple independent funding sources detected (${value} risk points).`,
  },

  rapid_transfer: {
    label: "Rapid Transfer",
    text: (value) =>
      `Incoming funds were transferred out shortly after arrival (${value} risk points).`,
  },

  fan_out: {
    label: "Fan-Out Activity",
    text: (value) =>
      `Funds were distributed across many unique targets (${value} risk points).`,
  },

  wallet_chain: {
    label: "Wallet Chain",
    text: (value) =>
      `Wallet-to-wallet chain activity was detected (${value} risk points).`,
  },

  flow_imbalance: {
    label: "Flow Imbalance",
    text: (value) =>
      `Outgoing volume is unusually high compared with observed incoming volume (${value} risk points).`,
  },

  new_device: {
    label: "New Device",
    text: (value) =>
      `Activity from an unrecognized device was detected (${value} risk points).`,
  },
};

function impactLevel(value) {
  if (value >= 25) {
    return "High";
  }

  if (value >= 10) {
    return "Medium";
  }

  return "Low";
}

function formatCurrency(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 TRY";
  }

  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(numericValue) + " TRY";
}

function Dashboard({
  dashboard,
  accounts = [],
  loadAccount,
  getRiskColor,
  selectedUser,
  riskDetail,
  explanation,
}) {
  const [filter, setFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [tableSearch, setTableSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    let accountList = Array.isArray(accounts)
      ? [...accounts]
      : [];

    if (filter !== "all") {
      accountList = accountList.filter(
        (account) =>
          account.risk_level === filter
      );
    }

    const normalizedSearch = tableSearch
      .trim()
      .toLowerCase();

    if (normalizedSearch) {
      accountList = accountList.filter(
        (account) => {
          const searchableText = [
            account.account_id,
            account.wallet_id,
            account.name,
            account.city,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedSearch
          );
        }
      );
    }

    accountList.sort((firstAccount, secondAccount) => {
      const firstScore = Number(
        firstAccount.risk_score || 0
      );

      const secondScore = Number(
        secondAccount.risk_score || 0
      );

      return sortDesc
        ? secondScore - firstScore
        : firstScore - secondScore;
    });

    return accountList;
  }, [
    accounts,
    filter,
    tableSearch,
    sortDesc,
  ]);

  const activeAlerts =
    dashboard?.critical_accounts
    + dashboard?.suspicious_accounts
    || dashboard?.critical_wallets
    + dashboard?.suspicious_wallets
    || accounts.filter(
      (account) =>
        account.risk_level === "critical"
        || account.risk_level === "suspicious"
    ).length;

  const criticalAccounts =
    dashboard?.critical_accounts
    ?? dashboard?.critical_wallets
    ?? accounts.filter(
      (account) =>
        account.risk_level === "critical"
    ).length;

  const trendSeed =
    selectedUser?.account_id
    || selectedUser?.wallet_id
    || "default";

  const alertTrend = pseudoSeries(
    `${trendSeed}-alert`,
    7,
    20,
    100
  );

  const weeklyLoad = pseudoSeries(
    `${trendSeed}-load`,
    7,
    20,
    95
  );

  const selectedMetrics =
    riskDetail?.metrics
    || selectedUser?.metrics
    || {};

  const selectedBreakdown =
    riskDetail?.risk_breakdown
    || selectedUser?.risk_breakdown
    || {};

  const selectedReasons =
    riskDetail?.reasons
    || selectedUser?.reasons
    || [];

  return (
    <>
      <section className="metric-strip">
        <div>
          ACTIVE MULE ALERTS:{" "}
          <strong className="metric-danger">
            {activeAlerts}
          </strong>
        </div>

        <div>
          CRITICAL RISK ACCOUNTS:{" "}
          <strong className="metric-warning">
            {criticalAccounts}
          </strong>
        </div>

        <div className="metric-status">
          <span className="status-dot" />

          ANALYSIS ENGINE STATUS:{" "}
          <strong className="metric-online">
            ONLINE
          </strong>

          <span className="metric-sub">
            Hackathon dataset connected
          </span>
        </div>
      </section>

      <div className="monitor-body">
        <div className="monitor-main">
          <div className="monitor-toolbar">
            <div className="toolbar-search">
              <input
                type="text"
                placeholder="Search wallet ID, name, or city..."
                value={tableSearch}
                onChange={(event) =>
                  setTableSearch(event.target.value)
                }
              />
            </div>

            <div className="toolbar-filter">
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
              >
                <option value="all">
                  All risk accounts
                </option>

                <option value="critical">
                  Critical only
                </option>

                <option value="suspicious">
                  Suspicious only
                </option>

                <option value="safe">
                  Safe only
                </option>
              </select>

              <ChevronDown size={14} />
            </div>
          </div>

          <div className="monitor-table-wrap">
            <table className="monitor-table">
              <thead>
                <tr>
                  <th>TARGET WALLET</th>

                  <th
                    className="sortable"
                    onClick={() =>
                      setSortDesc(
                        (currentValue) =>
                          !currentValue
                      )
                    }
                  >
                    RISK SCORE
                    <ArrowUpDown size={12} />
                  </th>

                  <th className="col-anatomy">
                    RISK ANATOMY (XAI)
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map((account) => {
                  const accountId =
                    account.account_id
                    || account.wallet_id;

                  const selectedAccountId =
                    selectedUser?.account_id
                    || selectedUser?.wallet_id;

                  const isSelected =
                    selectedAccountId === accountId;

                  return (
                    <tr
                      key={accountId}
                      className={
                        isSelected
                          ? "row-selected"
                          : ""
                      }
                      onClick={() =>
                        loadAccount(account)
                      }
                    >
                      <td className="col-account">
                        <span className="account-id">
                          {accountId}
                        </span>

                        <span className="account-name">
                          {account.name
                            || "Hackathon Wallet"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="risk-score"
                          style={{
                            color: getRiskColor(
                              account.risk_level
                            ),
                          }}
                        >
                          <i
                            className="dot"
                            style={{
                              backgroundColor:
                                getRiskColor(
                                  account.risk_level
                                ),
                            }}
                          />

                          {account.risk_score}/100
                        </span>
                      </td>

                      <td className="col-anatomy">
                        <RiskAnatomyBar
                          breakdown={
                            account.risk_breakdown
                            || {}
                          }
                        />
                      </td>
                    </tr>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="empty-row"
                    >
                      No wallets match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="inspector-panel">
          <div className="inspector-chart-card">
            <div className="inspector-label">
              ALERT TRENDS (7D)
            </div>

            <div className="mini-bars">
              {alertTrend.map((height, index) => (
                <div
                  key={index}
                  className="mini-bar"
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {!selectedUser ? (
            <div className="inspector-empty">
              Select a wallet to inspect its risk
              signals.
            </div>
          ) : (
            <>
              <div className="inspector-meta">
                <div className="inspector-meta-label">
                  Inspecting Entity:
                </div>

                <div className="inspector-meta-row">
                  <h3>
                    {selectedUser.account_id
                      || selectedUser.wallet_id}
                  </h3>

                  <span
                    className="inspector-score"
                    style={{
                      color: getRiskColor(
                        riskDetail?.risk_level
                        || selectedUser.risk_level
                      ),
                    }}
                  >
                    {riskDetail?.risk_score
                      ?? selectedUser.risk_score
                      ?? "--"}
                    /100
                  </span>
                </div>

                <div className="inspector-sub">
                  Account Holder:{" "}
                  <strong>
                    {selectedUser.name
                      || "Anonymous Wallet"}
                  </strong>
                </div>

                <div className="inspector-sub">
                  {selectedUser.city
                    ? `${selectedUser.city}${
                        selectedUser.age
                          ? ` • ${selectedUser.age} yrs old`
                          : ""
                      }`
                    : "Hackathon transaction dataset"}
                </div>
              </div>

              {Object.keys(selectedMetrics).length > 0 && (
                <div className="inspector-metrics">
                  <div>
                    <span>Unique Senders</span>
                    <strong>
                      {selectedMetrics.unique_senders
                        ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Unique Targets</span>
                    <strong>
                      {selectedMetrics.unique_targets
                        ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Rapid Transfers</span>
                    <strong>
                      {selectedMetrics.rapid_transfer_count
                        ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Wallet Transfers</span>
                    <strong>
                      {selectedMetrics.wallet_transfer_count
                        ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Total Incoming</span>
                    <strong>
                      {formatCurrency(
                        selectedMetrics.total_incoming
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Total Outgoing</span>
                    <strong>
                      {formatCurrency(
                        selectedMetrics.total_outgoing
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="inspector-signals">
                {Object.entries(
                  selectedBreakdown
                ).map(([key, value], index) => (
                  <div
                    className="signal-card"
                    key={key}
                  >
                    <div className="signal-head">
                      <span>
                        {index + 1}.{" "}
                        <strong>
                          {IMPACT_META[key]?.label
                            || key}
                        </strong>
                      </span>

                      <span className="signal-impact">
                        {impactLevel(value)} Impact
                      </span>
                    </div>

                    <div className="signal-desc">
                      {IMPACT_META[key]?.text
                        ? IMPACT_META[key].text(
                            value
                          )
                        : `${value} risk points generated by this signal.`}
                    </div>
                  </div>
                ))}

                {Object.keys(
                  selectedBreakdown
                ).length === 0 && (
                  <div className="inspector-empty">
                    No risk signals available for
                    this wallet.
                  </div>
                )}
              </div>

              {selectedReasons.length > 0 && (
                <div className="inspector-ai">
                  <strong>Detection Reasons</strong>

                  {selectedReasons.map(
                    (reason, index) => (
                      <p key={index}>
                        ✓ {reason}
                      </p>
                    )
                  )}
                </div>
              )}

              {explanation?.explanation && (
                <div className="inspector-ai">
                  {explanation.explanation}
                </div>
              )}

              <div className="inspector-chart-card weekly-load">
                <div className="inspector-label">
                  WEEKLY NETWORK LOAD
                </div>

                <div className="mini-bars tall">
                  {weeklyLoad.map(
                    (height, index) => (
                      <div
                        key={index}
                        className="mini-bar accent"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    )
                  )}
                </div>

                <div className="mini-bars-labels">
                  <span>MON</span>
                  <span>WED</span>
                  <span>FRI</span>
                  <span>SUN</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

export default Dashboard;