import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowDownToLine,
  ArrowUpDown,
  ArrowUpFromLine,
  Send,
  Shuffle,
  Users,
  Zap,
} from "lucide-react";
import RiskAnatomyBar from "../components/RiskAnatomyBar";

const ACCOUNTS_PER_PAGE = 17;

function parseTransactionDate(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function getTransactionAmount(transaction) {
  const amount = Number(transaction?.amount);

  return Number.isFinite(amount)
    ? amount
    : 0;
}

function buildWalletDailySeries(transactions = []) {
  const validTransactions = transactions
    .map((transaction) => ({
      transaction,
      date: parseTransactionDate(
        transaction.timestamp
      ),
    }))
    .filter((item) => item.date);

  if (validTransactions.length === 0) {
    return Array.from(
      { length: 7 },
      (_, index) => ({
        key: `empty-${index}`,
        label: "-",
        count: 0,
        volume: 0,
      })
    );
  }

  const latestTimestamp = Math.max(
    ...validTransactions.map(
      (item) => item.date.getTime()
    )
  );

  const latestDate = new Date(
    latestTimestamp
  );

  latestDate.setHours(0, 0, 0, 0);

  const days = Array.from(
    { length: 7 },
    (_, index) => {
      const day = new Date(latestDate);

      day.setDate(
        latestDate.getDate()
        - (6 - index)
      );

      const key = [
        day.getFullYear(),
        String(
          day.getMonth() + 1
        ).padStart(2, "0"),
        String(
          day.getDate()
        ).padStart(2, "0"),
      ].join("-");

      return {
        key,
        label:
          new Intl.DateTimeFormat(
            "en-US",
            {
              weekday: "short",
            }
          ).format(day),
        count: 0,
        volume: 0,
      };
    }
  );

  const dayMap = new Map(
    days.map((day) => [
      day.key,
      day,
    ])
  );

  validTransactions.forEach(
    ({ transaction, date }) => {
      const key = [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0"),
      ].join("-");

      const day = dayMap.get(key);

      if (!day) {
        return;
      }

      day.count += 1;
      day.volume +=
        getTransactionAmount(transaction);
    }
  );

  return days;
}

function normalizeBarHeights(
  values,
  minimumHeight = 8
) {
  const maximumValue = Math.max(
    ...values,
    0
  );

  if (maximumValue <= 0) {
    return values.map(
      () => minimumHeight
    );
  }

  return values.map((value) => {
    if (value <= 0) {
      return minimumHeight;
    }

    return Math.max(
      minimumHeight,
      Math.round(
        (value / maximumValue)
        * 100
      )
    );
  });
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

  return (
    new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 2,
    }).format(numericValue) + " TRY"
  );
}

function getVisiblePageNumbers(
  currentPage,
  totalPages
) {
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  let startPage = Math.max(
    1,
    currentPage - 2
  );

  let endPage = Math.min(
    totalPages,
    startPage + 4
  );

  if (endPage - startPage < 4) {
    startPage = Math.max(
      1,
      endPage - 4
    );
  }

  return Array.from(
    {
      length:
        endPage - startPage + 1,
    },
    (_, index) =>
      startPage + index
  );
}

function Dashboard({
  dashboard,
  accounts = [],
  loadAccount,
  getRiskColor,
  selectedUser,
  riskDetail,
  explanation,
  transactions = [],
}) {
  const [filter, setFilter] =
    useState("all");

  const [sortDesc, setSortDesc] =
    useState(true);

  const [tableSearch, setTableSearch] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

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

    accountList.sort(
      (
        firstAccount,
        secondAccount
      ) => {
        const firstScore = Number(
          firstAccount.hybrid_risk_score
          ?? firstAccount.risk_score
          ?? 0
        );

        const secondScore = Number(
          secondAccount.hybrid_risk_score
          ?? secondAccount.risk_score
          ?? 0
        );

        return sortDesc
          ? secondScore - firstScore
          : firstScore - secondScore;
      }
    );

    return accountList;
  }, [
    accounts,
    filter,
    tableSearch,
    sortDesc,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAccounts.length
      / ACCOUNTS_PER_PAGE
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filter,
    tableSearch,
    sortDesc,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedAccounts = useMemo(() => {
    const startIndex =
      (currentPage - 1)
      * ACCOUNTS_PER_PAGE;

    return filteredAccounts.slice(
      startIndex,
      startIndex
      + ACCOUNTS_PER_PAGE
    );
  }, [
    filteredAccounts,
    currentPage,
  ]);

  const visiblePageNumbers =
    getVisiblePageNumbers(
      currentPage,
      totalPages
    );

  const firstVisibleItem =
    filteredAccounts.length === 0
      ? 0
      : (currentPage - 1)
          * ACCOUNTS_PER_PAGE
        + 1;

  const lastVisibleItem = Math.min(
    currentPage
      * ACCOUNTS_PER_PAGE,
    filteredAccounts.length
  );

  const fallbackAlertCount =
    accounts.filter(
      (account) =>
        account.risk_level
          === "critical"
        || account.risk_level
          === "suspicious"
    ).length;

  const activeAlerts =
    dashboard?.active_alerts
    ?? (
      (
        dashboard?.critical_accounts
        ?? dashboard?.critical_wallets
        ?? 0
      )
      + (
        dashboard?.suspicious_accounts
        ?? dashboard?.suspicious_wallets
        ?? 0
      )
    )
    || fallbackAlertCount;

  const criticalAccounts =
    dashboard?.critical_accounts
    ?? dashboard?.critical_wallets
    ?? accounts.filter(
      (account) =>
        account.risk_level
        === "critical"
    ).length;

  const dailySeries = useMemo(
  () => buildWalletDailySeries(transactions),
  [transactions]
);

const alertTrend = useMemo(
  () =>
    normalizeBarHeights(
      dailySeries.map(
        (day) => day.count
      )
    ),
  [dailySeries]
);

const weeklyLoad = useMemo(
  () =>
    normalizeBarHeights(
      dailySeries.map(
        (day) => day.volume
      )
    ),
  [dailySeries]
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
                  setTableSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="toolbar-filter">
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value
                  )
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

                <option value="watchlist">
                  Watchlist only
                </option>

                <option value="safe">
                  Safe only
                </option>
              </select>
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
  <div className="anatomy-column-header">
    <div className="anatomy-header-title">
      RISK ANATOMY (XAI)

      <span className="anatomy-signal-count">
        7 SIGNALS
      </span>
    </div>

    <div className="anatomy-header-legend">
      <span title="Funds received from multiple independent sources">
        <i className="legend-color legend-multiple" />
        Multiple
      </span>

      <span title="Funds transferred shortly after being received">
        <i className="legend-color legend-rapid" />
        Rapid
      </span>

      <span title="Funds distributed to many unique targets">
        <i className="legend-color legend-fanout" />
        Fan-Out
      </span>

      <span title="Wallet-to-wallet chain activity">
        <i className="legend-color legend-chain" />
        Chain
      </span>

      <span title="Outgoing and incoming volume imbalance">
        <i className="legend-color legend-flow" />
        Flow
      </span>

      <span title="Activity from an unrecognized device">
        <i className="legend-color legend-device" />
        Device
      </span>

      <span title="Isolation Forest anomaly contribution">
        <i className="legend-color legend-ml" />
        ML
      </span>
    </div>
  </div>
</th>
                </tr>
              </thead>

              <tbody>
                {paginatedAccounts.map(
                  (account) => {
                    const accountId =
                      account.account_id
                      || account.wallet_id;

                    const selectedAccountId =
                      selectedUser?.account_id
                      || selectedUser?.wallet_id;

                    const isSelected =
                      selectedAccountId
                      === accountId;

                    const displayedScore =
                      account.hybrid_risk_score
                      ?? account.risk_score
                      ?? 0;

                    const displayedLevel =
                      account.hybrid_risk_level
                      ?? account.risk_level
                      ?? "safe";

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
                              color:
                                getRiskColor(
                                  displayedLevel
                                ),
                            }}
                          >
                            <i
                              className="dot"
                              style={{
                                backgroundColor:
                                  getRiskColor(
                                    displayedLevel
                                  ),
                              }}
                            />

                            {displayedScore}/100
                          </span>
                        </td>

                        <td className="col-anatomy">
                          <RiskAnatomyBar
  breakdown={
    account.risk_breakdown
    || {}
  }
  mlContribution={
    Math.max(
      0,
      Number(
        account.hybrid_risk_score
        ?? account.risk_score
        ?? 0
      )
      -
      Number(
        account.rule_risk_score
        ?? account.risk_score
        ?? 0
      )
    )
  }
/>
                        </td>
                      </tr>
                    );
                  }
                )}

                {filteredAccounts.length
                  === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="empty-row"
                    >
                      No wallets match this
                      filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredAccounts.length > 0 && (
            <div className="monitor-pagination">
              <div className="pagination-summary">
                Showing{" "}
                <strong>
                  {firstVisibleItem}
                  –
                  {lastVisibleItem}
                </strong>{" "}
                of{" "}
                <strong>
                  {filteredAccounts.length}
                </strong>{" "}
                wallets
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >
                  Previous
                </button>

                {visiblePageNumbers.map(
                  (pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        `pagination-number ${
                          currentPage
                            === pageNumber
                            ? "active"
                            : ""
                        }`
                      }
                      onClick={() =>
                        setCurrentPage(
                          pageNumber
                        )
                      }
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pagination-button"
                  disabled={
                    currentPage
                    === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="inspector-panel">
          <div className="inspector-chart-card">
  <div className="inspector-label-row">
    <div className="inspector-label">
      TRANSACTION ACTIVITY (7D)
    </div>

    <span className="inspector-live-data">
      LIVE DATA
    </span>
  </div>

  <div className="mini-bars">
    {alertTrend.map((height, index) => (
      <div
        key={dailySeries[index]?.key ?? index}
        className="mini-bar"
        style={{
          height: `${height}%`,
        }}
        title={`${dailySeries[index]?.label}: ${
          dailySeries[index]?.count ?? 0
        } transactions`}
      />
    ))}
  </div>
</div>

          {!selectedUser ? (
            <div className="inspector-empty">
              Select a wallet to inspect its
              risk signals.
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
    <div className="inspector-metric-card">
      <div className="metric-card-icon">
        <Users size={18} />
      </div>

      <div className="metric-card-content">
        <span>Unique Senders</span>

        <strong>
          {selectedMetrics.unique_senders ?? 0}
        </strong>
      </div>
    </div>

    <div className="inspector-metric-card">
      <div className="metric-card-icon">
        <Send size={18} />
      </div>

      <div className="metric-card-content">
        <span>Unique Targets</span>

        <strong>
          {selectedMetrics.unique_targets ?? 0}
        </strong>
      </div>
    </div>

    <div className="inspector-metric-card">
      <div className="metric-card-icon">
        <Zap size={18} />
      </div>

      <div className="metric-card-content">
        <span>Rapid Transfers</span>

        <strong>
          {selectedMetrics.rapid_transfer_count ?? 0}
        </strong>
      </div>
    </div>

    <div className="inspector-metric-card">
      <div className="metric-card-icon">
        <Shuffle size={18} />
      </div>

      <div className="metric-card-content">
        <span>Wallet Transfers</span>

        <strong>
          {selectedMetrics.wallet_transfer_count ?? 0}
        </strong>
      </div>
    </div>

    <div className="inspector-metric-card money-card incoming-card">
      <div className="metric-card-icon">
        <ArrowDownToLine size={18} />
      </div>

      <div className="metric-card-content">
        <span>Total Incoming</span>

        <strong>
          {formatCurrency(
            selectedMetrics.total_incoming
          )}
        </strong>
      </div>
    </div>

    <div className="inspector-metric-card money-card outgoing-card">
      <div className="metric-card-icon">
        <ArrowUpFromLine size={18} />
      </div>

      <div className="metric-card-content">
        <span>Total Outgoing</span>

        <strong>
          {formatCurrency(
            selectedMetrics.total_outgoing
          )}
        </strong>
      </div>
    </div>
  </div>
)}

              <div className="inspector-signals">
                {Object.entries(
  selectedBreakdown
)
  .filter(
    ([, value]) =>
      Number(value) > 0
  )
  .sort(
    (
      [, firstValue],
      [, secondValue]
    ) =>
      Number(secondValue)
      - Number(firstValue)
  )
  .map(
                  (
                    [key, value],
                    index
                  ) => (
                    <div
                      className="signal-card"
                      key={key}
                    >
                      <div className="signal-head">
                        <span>
                          {index + 1}.{" "}
                          <strong>
                            {IMPACT_META[
                              key
                            ]?.label
                              || key}
                          </strong>
                        </span>

                        <span className="signal-impact">
                          {impactLevel(
                            value
                          )}{" "}
                          Impact
                        </span>
                      </div>

                      <div className="signal-desc">
                        {IMPACT_META[
                          key
                        ]?.text
                          ? IMPACT_META[
                              key
                            ].text(
                              value
                            )
                          : `${value} risk points generated by this signal.`}
                      </div>
                    </div>
                  )
                )}

                {Object.values(
  selectedBreakdown
).every(
  (value) =>
    Number(value) <= 0
) && (
                  <div className="inspector-empty">
                    No risk signals available
                    for this wallet.
                  </div>
                )}
              </div>

              {selectedReasons.length > 0 && (
                <div className="inspector-ai">
                  <strong>
                    Detection Reasons
                  </strong>

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
  <div className="inspector-label-row">
    <div className="inspector-label">
      WEEKLY NETWORK LOAD
    </div>

    <span className="inspector-live-data">
      REAL VOLUME
    </span>
  </div>

  <div className="mini-bars tall">
    {weeklyLoad.map(
      (height, index) => (
        <div
          key={
            dailySeries[index]?.key
            ?? index
          }
          className="mini-bar accent"
          style={{
            height: `${height}%`,
          }}
          title={`${
            dailySeries[index]?.label
            ?? "-"
          }: ${formatCurrency(
            dailySeries[index]?.volume
            ?? 0
          )}`}
        />
      )
    )}
  </div>

  <div className="mini-bars-labels">
    {dailySeries.map((day) => (
      <span key={day.key}>
        {day.label.toUpperCase()}
      </span>
    ))}
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