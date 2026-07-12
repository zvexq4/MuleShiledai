import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download,
  FileCheck2,
  Link2,
  Search,
  Send,
  ShieldAlert,
  Shuffle,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";

import DetailPanel from "../components/DetailPanel";
import InvestigationPanel from "../components/InvestigationPanel";
import RiskTimeline from "../components/RiskTimeline";
import generateInvestigationPDF from "../utils/generateInvestigationPDF";

const REPORTS_PER_PAGE = 12;

const SIGNAL_META = {
  multiple_senders: {
    label: "Multiple Senders",
    icon: Users,
    className: "signal-multiple",
  },

  rapid_transfer: {
    label: "Rapid Transfer",
    icon: Zap,
    className: "signal-rapid",
  },

  fan_out: {
    label: "Fan-Out",
    icon: Send,
    className: "signal-fanout",
  },

  wallet_chain: {
    label: "Wallet Chain",
    icon: Link2,
    className: "signal-chain",
  },

  flow_imbalance: {
    label: "Flow Imbalance",
    icon: Shuffle,
    className: "signal-flow",
  },

  new_device: {
    label: "New Device",
    icon: Smartphone,
    className: "signal-device",
  },
};

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(safeNumber(value))} TRY`;
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

function getMetrics(account) {
  return account?.metrics || {};
}

function getTransactionCount(account) {
  const metrics = getMetrics(account);

  const explicitTotal =
    metrics.total_transactions ??
    account?.transaction_count;

  if (explicitTotal !== undefined) {
    return safeNumber(explicitTotal);
  }

  return (
    safeNumber(
      metrics.incoming_transaction_count
    ) +
    safeNumber(
      metrics.outgoing_transaction_count
    )
  );
}

function getActiveSignals(account) {
  return Object.entries(
    account?.risk_breakdown || {}
  )
    .filter(
      ([, value]) =>
        safeNumber(value) > 0
    )
    .sort(
      (
        [, firstValue],
        [, secondValue]
      ) =>
        safeNumber(secondValue) -
        safeNumber(firstValue)
    );
}

function getVisibleSignals(account) {
  return getActiveSignals(account).slice(
    0,
    4
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

function buildRecommendedActions(
  breakdown = {}
) {
  const actions = [
    "Prioritize this wallet for manual fraud review.",
  ];

  if (
    safeNumber(
      breakdown.multiple_senders
    ) > 0
  ) {
    actions.push(
      "Review independent funding sources and their relationship with the wallet holder."
    );
  }

  if (
    safeNumber(
      breakdown.rapid_transfer
    ) > 0
  ) {
    actions.push(
      "Investigate outgoing transfers occurring shortly after incoming funds."
    );
  }

  if (
    safeNumber(
      breakdown.fan_out
    ) > 0
  ) {
    actions.push(
      "Review destination concentration and possible fund-distribution behavior."
    );
  }

  if (
    safeNumber(
      breakdown.wallet_chain
    ) > 0
  ) {
    actions.push(
      "Trace connected wallet-to-wallet transfers for coordinated activity."
    );
  }

  if (
    safeNumber(
      breakdown.flow_imbalance
    ) > 0
  ) {
    actions.push(
      "Compare outgoing volume with verified funding sources and account history."
    );
  }

  if (
    safeNumber(
      breakdown.new_device
    ) > 0
  ) {
    actions.push(
      "Verify recent device changes and authentication activity."
    );
  }

  actions.push(
    "Escalate the case to compliance if the suspicious pattern continues."
  );

  return actions;
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
  const [search, setSearch] =
    useState("");

  const [riskFilter, setRiskFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return [...accounts]
      .filter((account) => {
        const searchableText = [
          account.account_id,
          account.wallet_id,
          account.name,
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
          riskFilter === "all" ||
          getRiskLevel(account) ===
            riskFilter;

        return (
          matchesSearch &&
          matchesFilter
        );
      })
      .sort(
        (
          firstAccount,
          secondAccount
        ) =>
          getRiskScore(secondAccount) -
          getRiskScore(firstAccount)
      );
  }, [
    accounts,
    search,
    riskFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAccounts.length /
        REPORTS_PER_PAGE
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    riskFilter,
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
      (currentPage - 1) *
      REPORTS_PER_PAGE;

    return filteredAccounts.slice(
      startIndex,
      startIndex +
        REPORTS_PER_PAGE
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
          REPORTS_PER_PAGE +
        1;

  const lastVisibleItem = Math.min(
    currentPage * REPORTS_PER_PAGE,
    filteredAccounts.length
  );

  const selectedMetrics =
    riskDetail?.metrics ||
    selectedUser?.metrics ||
    {};

  const incomingTotal =
    selectedMetrics.total_incoming ??
    transactions
      .filter((transaction) => {
        const direction = (
          transaction.direction ||
          transaction.type ||
          ""
        ).toLowerCase();

        return direction === "incoming";
      })
      .reduce(
        (sum, transaction) =>
          sum +
          safeNumber(
            transaction.amount
          ),
        0
      );

  const outgoingTotal =
    selectedMetrics.total_outgoing ??
    transactions
      .filter((transaction) => {
        const direction = (
          transaction.direction ||
          transaction.type ||
          ""
        ).toLowerCase();

        return direction === "outgoing";
      })
      .reduce(
        (sum, transaction) =>
          sum +
          safeNumber(
            transaction.amount
          ),
        0
      );

  const selectedAccountId =
    selectedUser
      ? getAccountId(selectedUser)
      : null;

  const selectedRiskLevel =
    riskDetail?.hybrid_risk_level ||
    selectedUser?.hybrid_risk_level ||
    riskDetail?.risk_level ||
    selectedUser?.risk_level ||
    "safe";

  const selectedRiskScore =
    riskDetail?.hybrid_risk_score ??
    selectedUser?.hybrid_risk_score ??
    riskDetail?.risk_score ??
    selectedUser?.risk_score ??
    0;

  const recommendedActions =
    buildRecommendedActions(
      riskDetail?.risk_breakdown ||
        selectedUser?.risk_breakdown ||
        {}
    );

  return (
    <main className="report-page report-v3">
      {!selectedUser && (
        <>
          <section className="panel report-table-hero">
            <div className="report-table-heading">
              <div>
                <span className="report-eyebrow">
                  INVESTIGATION CENTER
                </span>

                <h1>
                  Generate Risk Reports
                </h1>

                <p>
                  Select a wallet to review its
                  explainable risk analysis,
                  transaction evidence and PDF
                  investigation report.
                </p>
              </div>

              <div className="report-ready-badge">
                <FileCheck2 size={20} />

                <div>
                  <strong>
                    Reports Ready
                  </strong>

                  <span>
                    AI evidence pipeline online
                  </span>
                </div>

                <i />
              </div>
            </div>

            <div className="report-table-toolbar">
              <div className="report-table-search">
                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search wallet ID, name or city..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <select
                value={riskFilter}
                onChange={(event) =>
                  setRiskFilter(
                    event.target.value
                  )
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

          <section className="panel report-table-panel">
            <div className="report-table-panel-head">
              <div>
                <h2>
                  Investigation Queue
                </h2>

                <p>
                  Wallets ranked by hybrid risk
                  score.
                </p>
              </div>

              <span>
                {filteredAccounts.length} wallets
              </span>
            </div>

            <div className="report-data-table">
              <div className="report-data-header">
                <span>
                  WALLET ENTITY
                </span>

                <span>
                  RISK SCORE
                  <small>Hybrid</small>
                </span>

                <span>
                  RISK LEVEL
                </span>

                <span>
                  ACTIVE SIGNALS
                </span>

                <span>
                  TRANSACTIONS
                  <small>Total</small>
                </span>

                <span>
                  INCOMING
                  <small>Total</small>
                </span>

                <span>
                  OUTGOING
                  <small>Total</small>
                </span>

                <span>
                  TOP SIGNALS
                </span>

                <span>
                  ACTION
                </span>
              </div>

              <div className="report-data-body">
                {paginatedAccounts.map(
                  (account) => {
                    const accountId =
                      getAccountId(account);

                    const riskScore =
                      getRiskScore(account);

                    const riskLevel =
                      getRiskLevel(account);

                    const riskColor =
                      getRiskColor(riskLevel);

                    const metrics =
                      getMetrics(account);

                    const activeSignals =
                      getActiveSignals(account);

                    const visibleSignals =
                      getVisibleSignals(account);

                    const hiddenSignals =
                      Math.max(
                        0,
                        activeSignals.length -
                          visibleSignals.length
                      );

                    return (
                      <button
                        type="button"
                        className="report-data-row"
                        key={accountId}
                        onClick={() =>
                          loadAccount(account)
                        }
                      >
                        <div className="report-wallet-cell">
                          <span className="report-wallet-icon">
                            <ShieldAlert
                              size={17}
                            />
                          </span>

                          <div>
                            <strong>
                              {account.name ||
                                "Hackathon Wallet"}
                            </strong>

                            <span>
                              {accountId}
                            </span>
                          </div>
                        </div>

                        <div className="report-score-cell">
                          <strong
                            style={{
                              color:
                                riskColor,
                            }}
                          >
                            {riskScore}
                          </strong>

                          <span>/100</span>
                        </div>

                        <div>
                          <span
                            className="report-level-badge"
                            style={{
                              color:
                                riskColor,
                              borderColor:
                                riskColor,
                              backgroundColor:
                                `${riskColor}12`,
                            }}
                          >
                            {riskLevel.toUpperCase()}
                          </span>
                        </div>

                        <div className="report-number-cell">
                          <strong>
                            {
                              activeSignals.length
                            }
                          </strong>

                          <span>active</span>
                        </div>

                        <div className="report-number-cell">
                          <strong>
                            {getTransactionCount(
                              account
                            )}
                          </strong>

                          <span>total</span>
                        </div>

                        <div className="report-money-cell incoming">
                          <strong>
                            {formatCurrency(
                              metrics.total_incoming
                            )}
                          </strong>

                          <span>
                            {safeNumber(
                              metrics.incoming_transaction_count
                            )}{" "}
                            txns
                          </span>
                        </div>

                        <div className="report-money-cell outgoing">
                          <strong>
                            {formatCurrency(
                              metrics.total_outgoing
                            )}
                          </strong>

                          <span>
                            {safeNumber(
                              metrics.outgoing_transaction_count
                            )}{" "}
                            txns
                          </span>
                        </div>

                        <div className="report-signal-icons">
                          {visibleSignals.map(
                            ([key]) => {
                              const meta =
                                SIGNAL_META[
                                  key
                                ];

                              if (!meta) {
                                return null;
                              }

                              const Icon =
                                meta.icon;

                              return (
                                <span
                                  key={key}
                                  className={
                                    meta.className
                                  }
                                  title={
                                    meta.label
                                  }
                                >
                                  <Icon
                                    size={15}
                                  />
                                </span>
                              );
                            }
                          )}

                          {hiddenSignals > 0 && (
                            <small>
                              +{hiddenSignals} more
                            </small>
                          )}
                        </div>

                        <div className="report-open-cell">
                          <span>
                            Open Report
                          </span>

                          <ChevronRight
                            size={17}
                          />
                        </div>
                      </button>
                    );
                  }
                )}

                {paginatedAccounts.length ===
                  0 && (
                  <div className="report-empty-state">
                    <Search size={24} />

                    <strong>
                      No wallets found
                    </strong>

                    <p>
                      No accounts match the
                      selected search and risk
                      filter.
                    </p>
                  </div>
                )}
              </div>

              {filteredAccounts.length > 0 && (
                <div className="report-table-pagination">
                  <div className="report-pagination-summary">
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

                  <div className="report-pagination-controls">
                    <button
                      type="button"
                      disabled={
                        currentPage === 1
                      }
                      onClick={(event) => {
                        event.stopPropagation();

                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        );
                      }}
                    >
                      <ArrowLeft size={15} />
                      Previous
                    </button>

                    {visiblePageNumbers.map(
                      (pageNumber) => (
                        <button
                          type="button"
                          key={pageNumber}
                          className={
                            currentPage ===
                            pageNumber
                              ? "active"
                              : ""
                          }
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            setCurrentPage(
                              pageNumber
                            );
                          }}
                        >
                          {pageNumber}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={(event) => {
                        event.stopPropagation();

                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        );
                      }}
                    >
                      Next
                      <ArrowRight
                        size={15}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {selectedUser && riskDetail && (
        <>
          <section className="panel report-selected-header">
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setSearch("");
                setRiskFilter("all");
                clearSelectedAccount();
              }}
            >
              <ArrowLeft size={16} />
              Back to wallet list
            </button>

            <div className="report-selected-copy">
              <span>
                INVESTIGATION REPORT
              </span>

              <strong>
                {selectedAccountId}
              </strong>
            </div>

            <button
              type="button"
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
              <Download size={16} />
              Download PDF
            </button>
          </section>

          <section className="report-summary-grid">
            <article className="summary-card">
              <p>Wallet Entity</p>

              <h3>
                {selectedUser.name ||
                  "Hackathon Wallet"}
              </h3>

              <span>
                {selectedAccountId}
              </span>
            </article>

            <article className="summary-card">
              <p>Hybrid Risk Score</p>

              <h3
                style={{
                  color:
                    getRiskColor(
                      selectedRiskLevel
                    ),
                }}
              >
                {selectedRiskScore}/100
              </h3>

              <span>
                {selectedRiskLevel.toUpperCase()}
              </span>
            </article>

            <article className="summary-card incoming">
              <p>Total Incoming</p>

              <h3>
                {formatCurrency(
                  incomingTotal
                )}
              </h3>

              <span>
                {safeNumber(
                  selectedMetrics.incoming_transaction_count
                )}{" "}
                transactions
              </span>
            </article>

            <article className="summary-card outgoing">
              <p>Total Outgoing</p>

              <h3>
                {formatCurrency(
                  outgoingTotal
                )}
              </h3>

              <span>
                {safeNumber(
                  selectedMetrics.outgoing_transaction_count
                )}{" "}
                transactions
              </span>
            </article>
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

          <section className="panel report-timeline-panel">
            <RiskTimeline
              transactions={transactions}
            />
          </section>

          <section className="panel report-actions-panel">
            <div className="report-actions-heading">
              <ShieldAlert size={19} />

              <div>
                <span>
                  ANALYST GUIDANCE
                </span>

                <h2>
                  Recommended Actions
                </h2>
              </div>
            </div>

            <div className="insight-list">
              {recommendedActions.map(
                (action, index) => (
                  <p key={index}>
                    <i>{index + 1}</i>
                    {action}
                  </p>
                )
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default Report;