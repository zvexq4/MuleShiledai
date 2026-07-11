import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Network,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

const INITIAL_VISIBLE_WALLETS = 8;
const EXPANDED_VISIBLE_WALLETS = 20;

const RISK_COLORS = {
  safe: "#22c55e",
  watchlist: "#3b82f6",
  suspicious: "#f59e0b",
  critical: "#ef4444",
};

const SIGNAL_LABELS = {
  multiple_senders: "Multiple Senders",
  rapid_transfer: "Rapid Transfer",
  fan_out: "Fan-Out Activity",
  wallet_chain: "Wallet Chain",
  flow_imbalance: "Flow Imbalance",
  new_device: "New Device",
};

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#08111f",
    border: "1px solid #334155",
    borderRadius: "10px",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
    padding: "10px 12px",
  },
  labelStyle: {
    color: "#f8fafc",
    fontWeight: 700,
    marginBottom: "7px",
  },
  itemStyle: {
    color: "#cbd5e1",
    fontSize: "12px",
  },
  cursor: {
    fill: "rgba(56, 189, 248, 0.07)",
  },
};

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: digits,
  }).format(safeNumber(value));
}

function formatCurrency(value) {
  return `${formatNumber(value, 2)} TRY`;
}

function getWalletId(wallet) {
  return (
    wallet?.account_id ||
    wallet?.wallet_id ||
    "Unknown Wallet"
  );
}

function getRiskColor(level) {
  return RISK_COLORS[level] || "#94a3b8";
}

function Analytics({
  dashboard,
  accounts = [],
}) {
  const [walletListExpanded, setWalletListExpanded] =
    useState(false);

  const analyticsData = useMemo(() => {
    const walletList = Array.isArray(accounts)
      ? accounts
      : [];

    const sortedWallets = [...walletList].sort(
      (firstWallet, secondWallet) =>
        safeNumber(secondWallet.risk_score) -
        safeNumber(firstWallet.risk_score)
    );

    const loadedWalletCount = walletList.length;

    const average = (selector) => {
      if (loadedWalletCount === 0) {
        return 0;
      }

      return (
        walletList.reduce(
          (sum, wallet) =>
            sum + safeNumber(selector(wallet)),
          0
        ) / loadedWalletCount
      );
    };

    const highestRiskScore =
      sortedWallets.length > 0
        ? safeNumber(
            sortedWallets[0].risk_score
          )
        : 0;

    const mlAnomalyCount = walletList.filter(
      (wallet) => wallet.is_ml_anomaly
    ).length;

    const signalFrequency = Object.keys(
      SIGNAL_LABELS
    )
      .map((signalKey) => {
        const activeWallets = walletList.filter(
          (wallet) =>
            safeNumber(
              wallet.risk_breakdown?.[
                signalKey
              ]
            ) > 0
        );

        return {
          key: signalKey,
          name: SIGNAL_LABELS[signalKey],
          wallets: activeWallets.length,
          totalPoints: activeWallets.reduce(
            (sum, wallet) =>
              sum +
              safeNumber(
                wallet.risk_breakdown?.[
                  signalKey
                ]
              ),
            0
          ),
        };
      })
      .filter((signal) => signal.wallets > 0)
      .sort(
        (firstSignal, secondSignal) =>
          secondSignal.wallets -
          firstSignal.wallets
      );

    const comparisonWallets = sortedWallets
      .slice(0, 8)
      .map((wallet) => ({
        wallet: getWalletId(wallet),
        shortWallet: getWalletId(wallet).slice(
          0,
          8
        ),
        rule: safeNumber(
          wallet.rule_risk_score
        ),
        ml: safeNumber(
          wallet.ml_anomaly_score
        ),
        hybrid: safeNumber(
          wallet.hybrid_risk_score ??
            wallet.risk_score
        ),
      }));

    const totalIncoming = walletList.reduce(
      (sum, wallet) =>
        sum +
        safeNumber(
          wallet.metrics?.total_incoming
        ),
      0
    );

    const totalOutgoing = walletList.reduce(
      (sum, wallet) =>
        sum +
        safeNumber(
          wallet.metrics?.total_outgoing
        ),
      0
    );

    const totalRapidTransfers =
      walletList.reduce(
        (sum, wallet) =>
          sum +
          safeNumber(
            wallet.metrics
              ?.rapid_transfer_count
          ),
        0
      );

    const totalWalletTransfers =
      walletList.reduce(
        (sum, wallet) =>
          sum +
          safeNumber(
            wallet.metrics
              ?.wallet_transfer_count
          ),
        0
      );

    return {
      sortedWallets,
      loadedWalletCount,
      highestRiskScore,
      averageHybridScore: average(
        (wallet) =>
          wallet.hybrid_risk_score ??
          wallet.risk_score
      ),
      averageRuleScore: average(
        (wallet) =>
          wallet.rule_risk_score
      ),
      averageMlScore: average(
        (wallet) =>
          wallet.ml_anomaly_score
      ),
      averageUniqueSenders: average(
        (wallet) =>
          wallet.metrics?.unique_senders
      ),
      averageUniqueTargets: average(
        (wallet) =>
          wallet.metrics?.unique_targets
      ),
      mlAnomalyCount,
      signalFrequency,
      comparisonWallets,
      totalIncoming,
      totalOutgoing,
      totalRapidTransfers,
      totalWalletTransfers,
    };
  }, [accounts]);

  if (!dashboard) {
    return null;
  }

  const totalWallets =
    dashboard.total_wallets ??
    dashboard.total_accounts ??
    accounts.length;

  const safeWallets =
    dashboard.safe_wallets ??
    dashboard.safe_accounts ??
    0;

  const watchlistWallets =
    dashboard.watchlist_wallets ?? 0;

  const suspiciousWallets =
    dashboard.suspicious_wallets ??
    dashboard.suspicious_accounts ??
    0;

  const criticalWallets =
    dashboard.critical_wallets ??
    dashboard.critical_accounts ??
    0;

  const activeAlerts =
    watchlistWallets +
    suspiciousWallets +
    criticalWallets;

  const riskDistribution = [
    {
      name: "Safe",
      value: safeWallets,
      key: "safe",
    },
    {
      name: "Watchlist",
      value: watchlistWallets,
      key: "watchlist",
    },
    {
      name: "Suspicious",
      value: suspiciousWallets,
      key: "suspicious",
    },
    {
      name: "Critical",
      value: criticalWallets,
      key: "critical",
    },
  ].filter((item) => item.value > 0);

  const visibleWalletCount =
    walletListExpanded
      ? EXPANDED_VISIBLE_WALLETS
      : INITIAL_VISIBLE_WALLETS;

  const visibleWallets =
    analyticsData.sortedWallets.slice(
      0,
      visibleWalletCount
    );

  const canExpand =
    analyticsData.sortedWallets.length >
    INITIAL_VISIBLE_WALLETS;

  const highestRiskWallet =
    analyticsData.sortedWallets[0];

  const mostCommonSignal =
    analyticsData.signalFrequency[0];

  return (
    <main className="analytics-page analytics-v2">
      <section className="panel analytics-hero">
        <div>
          <span className="analytics-eyebrow">
            HYBRID EXPLAINABLE AI
          </span>

          <h1>Analytics Center</h1>

          <p>
            Behavioral rule intelligence and
            Isolation Forest anomaly detection
            across the wallet network.
          </p>
        </div>

        <div className="analytics-model-badge">
          <BrainCircuit size={20} />

          <div>
            <strong>Model Online</strong>
            <span>
              60% rules · 40% ML
            </span>
          </div>
        </div>
      </section>

      <section className="analytics-kpis analytics-kpis-v2">
        <article className="kpi-card">
          <div className="kpi-icon">
            <WalletCards size={19} />
          </div>

          <div>
            <span>Total Wallets</span>
            <strong>
              {formatNumber(totalWallets, 0)}
            </strong>
            <small>Analyzed entities</small>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-icon danger">
            <ShieldAlert size={19} />
          </div>

          <div>
            <span>Critical Wallets</span>
            <strong>{criticalWallets}</strong>
            <small>Immediate review</small>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-icon warning">
            <AlertTriangle size={19} />
          </div>

          <div>
            <span>AI Alerts</span>
            <strong>{activeAlerts}</strong>
            <small>
              Watchlist + suspicious + critical
            </small>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-icon purple">
            <Activity size={19} />
          </div>

          <div>
            <span>Highest Hybrid Score</span>
            <strong>
              {analyticsData.highestRiskScore}
              <em>/100</em>
            </strong>
            <small>
              Highest detected risk
            </small>
          </div>
        </article>
      </section>

      <section className="analytics-grid analytics-grid-top">
        <article className="panel analytics-chart-card">
          <div className="analytics-section-head">
            <div>
              <h2>Hybrid Risk Distribution</h2>
              <p>
                Risk levels across all analyzed
                wallets.
              </p>
            </div>
          </div>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={riskDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={62}
                paddingAngle={2}
              >
                {riskDistribution.map(
                  (entry) => (
                    <Cell
                      key={entry.key}
                      fill={
                        RISK_COLORS[
                          entry.key
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value, name) => [
                  formatNumber(value, 0),
                  name,
                ]}
              />

              <Legend
                verticalAlign="bottom"
                height={30}
              />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel analytics-chart-card">
          <div className="analytics-section-head">
            <div>
              <h2>Rule vs ML vs Hybrid</h2>
              <p>
                Score composition for the
                highest-risk wallets.
              </p>
            </div>
          </div>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart
              data={
                analyticsData.comparisonWallets
              }
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.12}
              />

              <XAxis
                dataKey="shortWallet"
                tick={{ fontSize: 10 }}
              />

              <YAxis domain={[0, 100]} />

              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value, name) => [
                  `${formatNumber(value, 2)}/100`,
                  name,
                ]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.wallet || ""
                }
              />

              <Legend />

              <Bar
                dataKey="rule"
                name="Rule"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="ml"
                name="ML"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="hybrid"
                name="Hybrid"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="panel analytics-chart-card">
          <div className="analytics-section-head">
            <div>
              <h2>Risk Signal Frequency</h2>
              <p>
                Number of loaded wallets that
                activated each behavioral signal.
              </p>
            </div>
          </div>

          <ResponsiveContainer
            width="100%"
            height={310}
          >
            <BarChart
              data={
                analyticsData.signalFrequency
              }
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.12}
              />

              <XAxis
                type="number"
                allowDecimals={false}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={115}
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value) => [
                  `${formatNumber(value, 0)} wallets`,
                  "Triggered",
                ]}
              />

              <Bar
                dataKey="wallets"
                fill="#3b82f6"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel flow-panel">
          <div className="analytics-section-head">
            <div>
              <h2>Network Flow Overview</h2>
              <p>
                Aggregate behavior for the
                currently loaded wallet set.
              </p>
            </div>

            <Network size={22} />
          </div>

          <div className="flow-metric-grid">
            <div className="flow-metric">
              <span>Total Incoming</span>
              <strong>
                {formatCurrency(
                  analyticsData.totalIncoming
                )}
              </strong>
            </div>

            <div className="flow-metric">
              <span>Total Outgoing</span>
              <strong>
                {formatCurrency(
                  analyticsData.totalOutgoing
                )}
              </strong>
            </div>

            <div className="flow-metric">
              <span>Avg. Unique Senders</span>
              <strong>
                {formatNumber(
                  analyticsData
                    .averageUniqueSenders
                )}
              </strong>
            </div>

            <div className="flow-metric">
              <span>Avg. Unique Targets</span>
              <strong>
                {formatNumber(
                  analyticsData
                    .averageUniqueTargets
                )}
              </strong>
            </div>

            <div className="flow-metric">
              <span>Rapid Transfers</span>
              <strong>
                {formatNumber(
                  analyticsData
                    .totalRapidTransfers,
                  0
                )}
              </strong>
            </div>

            <div className="flow-metric">
              <span>Wallet Transfers</span>
              <strong>
                {formatNumber(
                  analyticsData
                    .totalWalletTransfers,
                  0
                )}
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel top-wallet-panel">
        <div className="analytics-section-head">
          <div>
            <h2>Top Hybrid-Risk Wallets</h2>
            <p>
              Highest-priority entities ranked by
              the combined AI risk score.
            </p>
          </div>

          <span className="wallet-count-label">
            Showing {visibleWallets.length} of{" "}
            {
              analyticsData.loadedWalletCount
            }{" "}
            loaded wallets
          </span>
        </div>

        <div className="top-wallet-table">
          <div className="top-wallet-table-head">
            <span>Wallet</span>
            <span>Rule</span>
            <span>ML</span>
            <span>Hybrid</span>
            <span>Status</span>
          </div>

          {visibleWallets.map((wallet) => {
            const walletId =
              getWalletId(wallet);

            const riskLevel =
              wallet.risk_level || "safe";

            return (
              <div
                className="top-wallet-row"
                key={walletId}
              >
                <div className="top-wallet-id">
                  <strong>{walletId}</strong>
                  <small>
                    {wallet.is_ml_anomaly
                      ? "ML anomaly detected"
                      : "Normal ML profile"}
                  </small>
                </div>

                <span>
                  {formatNumber(
                    wallet.rule_risk_score,
                    0
                  )}
                  /100
                </span>

                <span>
                  {formatNumber(
                    wallet.ml_anomaly_score,
                    2
                  )}
                </span>

                <strong
                  style={{
                    color:
                      getRiskColor(riskLevel),
                  }}
                >
                  {formatNumber(
                    wallet.hybrid_risk_score ??
                      wallet.risk_score,
                    0
                  )}
                  /100
                </strong>

                <span
                  className="analytics-risk-badge"
                  style={{
                    color:
                      getRiskColor(riskLevel),
                    borderColor:
                      getRiskColor(riskLevel),
                  }}
                >
                  {riskLevel.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {canExpand && (
          <button
            type="button"
            className="analytics-expand-button"
            onClick={() =>
              setWalletListExpanded(
                (currentValue) =>
                  !currentValue
              )
            }
          >
            {walletListExpanded ? (
              <>
                <ChevronUp size={17} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={17} />
                View More Wallets
              </>
            )}
          </button>
        )}
      </section>

      <section className="panel analytics-insights-panel">
        <div className="analytics-section-head">
          <div>
            <h2>AI Intelligence Summary</h2>
            <p>
              Automated insights derived from the
              loaded hybrid risk results.
            </p>
          </div>

          <BrainCircuit size={22} />
        </div>

        <div className="analytics-insight-grid">
          <article>
            <span>ML Anomalies</span>
            <strong>
              {analyticsData.mlAnomalyCount}
            </strong>
            <p>
              Loaded wallets classified as
              Isolation Forest outliers.
            </p>
          </article>

          <article>
            <span>Average Hybrid Risk</span>
            <strong>
              {formatNumber(
                analyticsData
                  .averageHybridScore
              )}
              /100
            </strong>
            <p>
              Combined rules and anomaly model
              score.
            </p>
          </article>

          <article>
            <span>Average Rule Score</span>
            <strong>
              {formatNumber(
                analyticsData
                  .averageRuleScore
              )}
              /100
            </strong>
            <p>
              Explainable behavioral contribution.
            </p>
          </article>

          <article>
            <span>
              Average ML Anomaly Percentile
            </span>
            <strong>
              {formatNumber(
                analyticsData.averageMlScore
              )}
              /100
            </strong>
            <p>
              Relative anomaly rank, not fraud
              probability.
            </p>
          </article>

          <article>
            <span>Highest-Risk Wallet</span>
            <strong className="small-value">
              {highestRiskWallet
                ? getWalletId(
                    highestRiskWallet
                  )
                : "No wallet"}
            </strong>
            <p>
              Highest combined hybrid score.
            </p>
          </article>

          <article>
            <span>Most Common Signal</span>
            <strong className="small-value">
              {mostCommonSignal?.name ||
                "No signal"}
            </strong>
            <p>
              {mostCommonSignal
                ? `${mostCommonSignal.wallets} loaded wallets triggered this signal.`
                : "No active signal detected."}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Analytics;