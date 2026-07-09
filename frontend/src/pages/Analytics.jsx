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
} from "recharts";

function Analytics({ dashboard, accounts }) {
  if (!dashboard) return null;

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  const riskDistribution = [
    {
      name: "Safe",
      value: dashboard.safe_accounts,
    },
    {
      name: "Suspicious",
      value: dashboard.suspicious_accounts,
    },
    {
      name: "Critical",
      value: dashboard.critical_accounts,
    },
  ];

  const highestRisk = Math.max(...accounts.map((a) => a.risk_score));

  const averageRisk = Math.round(
    accounts.reduce((sum, a) => sum + a.risk_score, 0) / accounts.length
  );

  const totalCities = new Set(accounts.map((a) => a.city)).size;

  const activeAlerts =
    dashboard.critical_accounts + dashboard.suspicious_accounts;

  const topRiskAccounts = [...accounts]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  const cityRisk = Object.values(
    accounts.reduce((acc, account) => {
      if (!acc[account.city]) {
        acc[account.city] = {
          city: account.city,
          totalRisk: 0,
          accounts: 0,
        };
      }

      acc[account.city].totalRisk += account.risk_score;
      acc[account.city].accounts++;

      return acc;
    }, {})
  ).map((item) => ({
    city: item.city,
    averageRisk: Math.round(item.totalRisk / item.accounts),
  }));

  const highestRiskAccount = topRiskAccounts[0];

  const highestRiskCity = [...cityRisk].sort(
    (a, b) => b.averageRisk - a.averageRisk
  )[0];

  return (
    <main className="analytics-page">
      <section className="analytics-kpis">
        <div className="kpi-card">
          <h4>Highest Risk</h4>
          <h2>{highestRisk}</h2>
          <span>/100</span>
        </div>

        <div className="kpi-card">
          <h4>Average Risk</h4>
          <h2>{averageRisk}</h2>
          <span>/100</span>
        </div>

        <div className="kpi-card">
          <h4>Cities</h4>
          <h2>{totalCities}</h2>
          <span>Locations</span>
        </div>

        <div className="kpi-card">
          <h4>AI Alerts</h4>
          <h2>{activeAlerts}</h2>
          <span>Active</span>
        </div>
      </section>

      <section className="panel analytics-wide">
        <h2>📊 Risk Intelligence Dashboard</h2>
        <p className="empty">
          AI-generated overview of current fraud indicators.
        </p>
      </section>

      <section className="panel">
        <h2>Risk Distribution</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskDistribution}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {riskDistribution.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <h2>Average Risk by City</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cityRisk}>
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="averageRisk" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <h2>🔥 Top Risk Accounts</h2>

        <div className="transaction-list">
          {topRiskAccounts.map((account) => (
            <div className="transaction-item" key={account.account_id}>
              <div>
                <strong>{account.name}</strong>
                <p>
                  {account.account_id} • {account.city}
                </p>
              </div>

              <span
                style={{
                  color:
                    account.risk_score >= 70
                      ? "#ef4444"
                      : account.risk_score >= 30
                      ? "#f59e0b"
                      : "#22c55e",
                  fontWeight: "bold",
                }}
              >
                {account.risk_score}/100
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>🤖 AI Insights</h2>

        <div className="insight-list">
          <p>
            ✓ {dashboard.critical_accounts} critical mule account currently
            detected.
          </p>

          <p>
            ✓ Average platform risk score is {averageRisk}/100.
          </p>

          <p>
            ✓ Highest risk account:{" "}
            <strong>{highestRiskAccount?.name}</strong>.
          </p>

          <p>
            ✓ Highest risk city:{" "}
            <strong>{highestRiskCity?.city}</strong>.
          </p>

          <p>
            ✓ Primary fraud pattern: Rapid transfer combined with new device
            activity.
          </p>

          <p>
            ✓ AI recommendation: Immediate manual investigation for critical
            accounts.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Analytics;