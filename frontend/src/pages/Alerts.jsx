import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BellRing,
  ChevronRight,
  Search,
  ShieldAlert,
} from "lucide-react";

const ALERTS_PER_PAGE = 10;

const SIGNAL_LABELS = {
  multiple_senders: "Multiple Senders",
  rapid_transfer: "Rapid Transfer",
  fan_out: "Fan-Out",
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

function getAccountId(account) {
  return (
    account?.account_id ||
    account?.wallet_id ||
    "Unknown Wallet"
  );
}

function getRiskScore(account) {
  return safeNumber(
    account?.hybrid_risk_score ??
    account?.risk_score
  );
}

function getRiskLevel(account) {
  return (
    account?.hybrid_risk_level ||
    account?.risk_level ||
    "safe"
  );
}

function getActiveSignals(account) {
  return Object.entries(
    account?.risk_breakdown || {}
  )
    .filter(([, value]) =>
      safeNumber(value) > 0
    )
    .sort(
      (
        [, firstValue],
        [, secondValue]
      ) =>
        safeNumber(secondValue) -
        safeNumber(firstValue)
    )
    .slice(0, 3)
    .map(([key]) =>
      SIGNAL_LABELS[key] || key
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

function Alerts({
  accounts = [],
  loadAccount,
  setActivePage,
  getRiskColor,
}) {
  const [search, setSearch] =
    useState("");

  const [severity, setSeverity] =
    useState("all");

  const [sortOrder, setSortOrder] =
    useState("highest");

  const [currentPage, setCurrentPage] =
    useState(1);

  const alertAccounts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return accounts
      .filter((account) => {
        const level =
          getRiskLevel(account);

        return (
          level === "critical" ||
          level === "suspicious"
        );
      })
      .filter((account) => {
        const level =
          getRiskLevel(account);

        const searchableText = [
          account.name,
          account.account_id,
          account.wallet_id,
          account.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          searchableText.includes(
            normalizedSearch
          );

        const matchesSeverity =
          severity === "all" ||
          level === severity;

        return (
          matchesSearch &&
          matchesSeverity
        );
      })
      .sort((firstAccount, secondAccount) => {
        const firstScore =
          getRiskScore(firstAccount);

        const secondScore =
          getRiskScore(secondAccount);

        return sortOrder === "highest"
          ? secondScore - firstScore
          : firstScore - secondScore;
      });
  }, [
    accounts,
    search,
    severity,
    sortOrder,
  ]);

  const criticalCount = useMemo(
    () =>
      accounts.filter(
        (account) =>
          getRiskLevel(account) ===
          "critical"
      ).length,
    [accounts]
  );

  const suspiciousCount = useMemo(
    () =>
      accounts.filter(
        (account) =>
          getRiskLevel(account) ===
          "suspicious"
      ).length,
    [accounts]
  );

  const averageRisk = useMemo(() => {
    const activeAccounts =
      accounts.filter((account) => {
        const level =
          getRiskLevel(account);

        return (
          level === "critical" ||
          level === "suspicious"
        );
      });

    if (activeAccounts.length === 0) {
      return 0;
    }

    return Math.round(
      activeAccounts.reduce(
        (sum, account) =>
          sum + getRiskScore(account),
        0
      ) / activeAccounts.length
    );
  }, [accounts]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      alertAccounts.length /
      ALERTS_PER_PAGE
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    severity,
    sortOrder,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedAlerts = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      ALERTS_PER_PAGE;

    return alertAccounts.slice(
      startIndex,
      startIndex +
      ALERTS_PER_PAGE
    );
  }, [
    alertAccounts,
    currentPage,
  ]);

  const visiblePageNumbers =
    getVisiblePageNumbers(
      currentPage,
      totalPages
    );

  const firstVisibleItem =
    alertAccounts.length === 0
      ? 0
      : (currentPage - 1) *
          ALERTS_PER_PAGE +
        1;

  const lastVisibleItem = Math.min(
    currentPage * ALERTS_PER_PAGE,
    alertAccounts.length
  );

  const openInvestigation = async (
    account
  ) => {
    await loadAccount(account);
    setActivePage("report");
  };

  return (
    <main className="alerts-page">
      <section className="panel alerts-hero">
        <div>
          <span className="alerts-eyebrow">
            FRAUD OPERATIONS QUEUE
          </span>

          <h1>Active Alerts</h1>

          <p>
            Prioritize high-risk wallets and
            open evidence-backed investigations.
          </p>
        </div>

        <div className="alerts-live-badge">
          <BellRing size={18} />

          <div>
            <strong>Alert Queue Live</strong>
            <span>
              Hybrid detection engine online
            </span>
          </div>
        </div>
      </section>

      <section className="alerts-kpis">
        <article className="alerts-kpi-card">
          <div className="alerts-kpi-icon">
            <BellRing size={18} />
          </div>

          <div>
            <span>Open Alerts</span>
            <strong>
              {criticalCount +
                suspiciousCount}
            </strong>
            <small>
              Requiring analyst review
            </small>
          </div>
        </article>

        <article className="alerts-kpi-card critical">
          <div className="alerts-kpi-icon">
            <ShieldAlert size={18} />
          </div>

          <div>
            <span>Critical</span>
            <strong>{criticalCount}</strong>
            <small>Immediate priority</small>
          </div>
        </article>

        <article className="alerts-kpi-card suspicious">
          <div className="alerts-kpi-icon">
            <AlertTriangle size={18} />
          </div>

          <div>
            <span>Suspicious</span>
            <strong>
              {suspiciousCount}
            </strong>
            <small>Elevated risk</small>
          </div>
        </article>

        <article className="alerts-kpi-card average">
          <div className="alerts-kpi-icon">
            <AlertTriangle size={18} />
          </div>

          <div>
            <span>Average Risk</span>
            <strong>
              {averageRisk}
              <em>/100</em>
            </strong>
            <small>
              Across active alerts
            </small>
          </div>
        </article>
      </section>

      <section className="panel alerts-toolbar">
        <div className="alerts-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search wallet ID, name or city..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={severity}
          onChange={(event) =>
            setSeverity(
              event.target.value
            )
          }
        >
          <option value="all">
            All Severities
          </option>

          <option value="critical">
            Critical
          </option>

          <option value="suspicious">
            Suspicious
          </option>
        </select>

        <select
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(
              event.target.value
            )
          }
        >
          <option value="highest">
            Highest Risk First
          </option>

          <option value="lowest">
            Lowest Risk First
          </option>
        </select>
      </section>

      <section className="panel alerts-queue-panel">
        <div className="alerts-section-head">
          <div>
            <h2>Analyst Review Queue</h2>

            <p>
              Ranked by hybrid fraud risk
              score.
            </p>
          </div>

          <span>
            {alertAccounts.length} alerts
          </span>
        </div>

        <div className="alerts-list">
          {paginatedAlerts.map(
            (account) => {
              const accountId =
                getAccountId(account);

              const riskScore =
                getRiskScore(account);

              const riskLevel =
                getRiskLevel(account);

              const riskColor =
                getRiskColor
                  ? getRiskColor(riskLevel)
                  : riskLevel === "critical"
                    ? "#ef4444"
                    : "#f59e0b";

              const signals =
                getActiveSignals(account);

              return (
                <article
                  key={accountId}
                  className={`alert-row alert-${riskLevel}`}
                  style={{
                    "--alert-color":
                      riskColor,
                  }}
                >
                  <div className="alert-severity-line" />

                  <div className="alert-score-block">
                    <span>
                      {riskLevel.toUpperCase()}
                    </span>

                    <strong
                      style={{
                        color: riskColor,
                      }}
                    >
                      {riskScore}
                      <small>/100</small>
                    </strong>
                  </div>

                  <div className="alert-identity">
                    <span className="alert-entity-label">
                      WALLET ENTITY
                    </span>

                    <h3>
                      {account.name ||
                        "Hackathon Wallet"}
                    </h3>

                    <p>{accountId}</p>
                  </div>

                  <div className="alert-signals">
                    {signals.length > 0 ? (
                      signals.map((signal) => (
                        <span key={signal}>
                          {signal}
                        </span>
                      ))
                    ) : (
                      <span>
                        ML Anomaly
                      </span>
                    )}
                  </div>

                  <div className="alert-action">
                    <button
                      type="button"
                      onClick={() =>
                        openInvestigation(
                          account
                        )
                      }
                    >
                      Open Investigation
                      <ChevronRight
                        size={16}
                      />
                    </button>
                  </div>
                </article>
              );
            }
          )}

          {paginatedAlerts.length === 0 && (
            <div className="alerts-empty">
              <Search size={24} />

              <strong>
                No alerts found
              </strong>

              <p>
                No wallets match the selected
                filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {alertAccounts.length > 0 && (
        <section className="alerts-pagination">
          <div className="alerts-pagination-summary">
            Showing{" "}
            <strong>
              {firstVisibleItem}–
              {lastVisibleItem}
            </strong>{" "}
            of{" "}
            <strong>
              {alertAccounts.length}
            </strong>{" "}
            alerts
          </div>

          <div className="alerts-pagination-controls">
            <button
              type="button"
              className="alerts-page-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(
                    1,
                    page - 1
                  )
                )
              }
            >
              <ArrowLeft size={15} />
              Previous
            </button>

            {visiblePageNumbers.map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`alerts-page-number ${
                    currentPage ===
                    pageNumber
                      ? "active"
                      : ""
                  }`}
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
              className="alerts-page-button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
                )
              }
            >
              Next
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Alerts;