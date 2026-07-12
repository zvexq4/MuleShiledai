import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  Search,
  Send,
  Users,
  Zap,
} from "lucide-react";
import RiskAnatomyBar from "../components/RiskAnatomyBar";

const ACCOUNTS_PER_PAGE = 12;

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function formatCompactCurrency(value) {
  const numericValue = safeNumber(value);

  return new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue) + " TRY";
}

function getAccountId(account) {
  return (
    account?.account_id ||
    account?.wallet_id ||
    "Unknown Wallet"
  );
}

function getDisplayedScore(account) {
  return safeNumber(
    account?.hybrid_risk_score ??
    account?.risk_score
  );
}

function getDisplayedLevel(account) {
  return (
    account?.hybrid_risk_level ||
    account?.risk_level ||
    "safe"
  );
}

function getRuleScore(account) {
  return safeNumber(
    account?.rule_risk_score ??
    account?.risk_score
  );
}

function getMlAnomalyScore(account) {
  return safeNumber(
    account?.ml_anomaly_score
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
      length: endPage - startPage + 1,
    },
    (_, index) => startPage + index
  );
}

function Accounts({
  accounts = [],
  loadAccount,
  setActivePage,
  getRiskColor,
}) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const accountStats = useMemo(() => {
    const counts = {
      critical: 0,
      suspicious: 0,
      watchlist: 0,
      safe: 0,
    };

    accounts.forEach((account) => {
      const level =
        getDisplayedLevel(account);

      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          level
        )
      ) {
        counts[level] += 1;
      }
    });

    return counts;
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return [...accounts]
      .filter((account) => {
        const level =
          getDisplayedLevel(account);

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

        const matchesFilter =
          filter === "all" ||
          level === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      })
      .sort(
        (firstAccount, secondAccount) =>
          getDisplayedScore(secondAccount) -
          getDisplayedScore(firstAccount)
      );
  }, [
    accounts,
    search,
    filter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAccounts.length /
      ACCOUNTS_PER_PAGE
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

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
      (currentPage - 1) *
      ACCOUNTS_PER_PAGE;

    return filteredAccounts.slice(
      startIndex,
      startIndex +
      ACCOUNTS_PER_PAGE
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
      : (currentPage - 1) *
          ACCOUNTS_PER_PAGE +
        1;

  const lastVisibleItem = Math.min(
    currentPage * ACCOUNTS_PER_PAGE,
    filteredAccounts.length
  );

  const openInvestigation = async (
    account
  ) => {
    await loadAccount(account);
    setActivePage("report");
  };

  return (
    <main className="accounts-page accounts-v2">
      <section className="panel accounts-header">
        <div className="accounts-heading-row">
          <div className="page-title">
            <span className="accounts-eyebrow">
              WALLET INTELLIGENCE
            </span>

            <h1>Accounts</h1>

            <p>
              Monitor wallet behavior,
              review hybrid risk and open
              detailed investigations.
            </p>
          </div>

          <div className="accounts-result-label">
            {filteredAccounts.length} matching
            wallets
          </div>
        </div>

        <div className="account-stats">
          <article className="stat-box">
            <span>Total Accounts</span>
            <strong>{accounts.length}</strong>
            <small>Loaded wallets</small>
          </article>

          <article className="stat-box critical">
            <span>Critical</span>
            <strong>
              {accountStats.critical}
            </strong>
            <small>Immediate review</small>
          </article>

          <article className="stat-box suspicious">
            <span>Suspicious</span>
            <strong>
              {accountStats.suspicious}
            </strong>
            <small>Elevated risk</small>
          </article>

          <article className="stat-box watchlist">
            <span>Watchlist</span>
            <strong>
              {accountStats.watchlist}
            </strong>
            <small>Ongoing monitoring</small>
          </article>

          <article className="stat-box safe">
            <span>Safe</span>
            <strong>
              {accountStats.safe}
            </strong>
            <small>Low-risk profile</small>
          </article>
        </div>

        <div className="accounts-toolbar">
          <div className="accounts-search">
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
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="all">
              All Risk Levels
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="suspicious">
              Suspicious
            </option>

            <option value="watchlist">
              Watchlist
            </option>

            <option value="safe">
              Safe
            </option>
          </select>
        </div>
      </section>

      {paginatedAccounts.length > 0 ? (
        <section className="account-grid">
          {paginatedAccounts.map(
            (account) => {
              const accountId =
                getAccountId(account);

              const riskScore =
                getDisplayedScore(account);

              const riskLevel =
                getDisplayedLevel(account);

              const riskColor =
                getRiskColor(riskLevel);

              const metrics =
                account.metrics || {};

              return (
                <article
                  className={`account-card account-level-${riskLevel}`}
                  key={accountId}
                >
                  <div className="account-card-top">
                    <div className="account-identity">
                      <span className="account-card-label">
                        WALLET ENTITY
                      </span>

                      <h3>
                        {account.name ||
                          "Hackathon Wallet"}
                      </h3>

                      <p>{accountId}</p>
                    </div>

                    <span
                      className="account-risk-badge"
                      style={{
                        color: riskColor,
                        borderColor: riskColor,
                        backgroundColor:
                          `${riskColor}14`,
                      }}
                    >
                      {riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="account-risk-section">
                    <div className="account-risk-line">
                      <span>
                        Hybrid Risk Score
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

                    <RiskAnatomyBar
                      breakdown={
                        account.risk_breakdown ||
                        {}
                      }
                    />

                    <div className="account-risk-components">
                      <span>
                        Rule
                        <strong>{getRuleScore(account)}/100</strong>
                      </span>

                      <span>
                        ML anomaly percentile
                        <strong>
                          {getMlAnomalyScore(account).toFixed(2)}/100
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="account-signal-summary">
                    <div>
                      <Users size={15} />

                      <span>
                        Senders
                        <strong>
                          {safeNumber(
                            metrics.unique_senders
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Send size={15} />

                      <span>
                        Targets
                        <strong>
                          {safeNumber(
                            metrics.unique_targets
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Zap size={15} />

                      <span>
                        Rapid
                        <strong>
                          {safeNumber(
                            metrics
                              .rapid_transfer_count
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="account-flow-summary">
                    <div className="account-flow incoming">
                      <ArrowDownToLine
                        size={16}
                      />

                      <span>
                        Incoming
                        <strong>
                          {formatCompactCurrency(
                            metrics.total_incoming
                          )}
                        </strong>
                      </span>
                    </div>

                    <div className="account-flow outgoing">
                      <ArrowUpFromLine
                        size={16}
                      />

                      <span>
                        Outgoing
                        <strong>
                          {formatCompactCurrency(
                            metrics.total_outgoing
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="account-investigate-button"
                    onClick={() =>
                      openInvestigation(account)
                    }
                  >
                    Open Investigation
                    <ArrowRight size={16} />
                  </button>
                </article>
              );
            }
          )}
        </section>
      ) : (
        <section className="panel accounts-empty">
          <Search size={24} />

          <strong>
            No wallets found
          </strong>

          <p>
            No accounts match the selected
            search and risk filters.
          </p>
        </section>
      )}

      {filteredAccounts.length > 0 && (
        <section className="accounts-pagination">
          <div className="accounts-pagination-summary">
            Showing{" "}
            <strong>
              {firstVisibleItem}–
              {lastVisibleItem}
            </strong>{" "}
            of{" "}
            <strong>
              {filteredAccounts.length}
            </strong>{" "}
            wallets
          </div>

          <div className="accounts-pagination-controls">
            <button
              type="button"
              className="accounts-page-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
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
                  className={`accounts-page-number ${
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
              className="accounts-page-button"
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

export default Accounts;
