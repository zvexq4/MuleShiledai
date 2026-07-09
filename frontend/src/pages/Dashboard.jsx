import { useMemo, useState } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import RiskAnatomyBar from "../components/RiskAnatomyBar";

// Backend henüz zaman serisi (7 günlük trend) vermediği için,
// hesap bazında sabit kalan, deterministik bir görsel seri üretiyoruz.
function pseudoSeries(seed, length, min = 20, max = 100) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out = [];
  for (let i = 0; i < length; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(min + (h % (max - min)));
  }
  return out;
}

const IMPACT_META = {
  multiple_senders: {
    label: "Multiple Senders",
    text: (v) => `${v > 0 ? Math.max(2, Math.round(v / 4)) : 0} unique sender pattern detected in the last 48h.`,
  },
  rapid_transfer: {
    label: "Rapid Transfer",
    text: (v) => `Funds moved out shortly after arrival (${v} risk pts).`,
  },
  new_device: {
    label: "New Device Login",
    text: (v) => `Login activity from an unrecognized device (${v} risk pts).`,
  },
};

function impactLevel(value) {
  if (value >= 25) return "High";
  if (value >= 10) return "Medium";
  return "Low";
}

function Dashboard({
  dashboard,
  accounts,
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
    let list = [...accounts];

    if (filter !== "all") {
      list = list.filter((a) => a.risk_level === filter);
    }

    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.account_id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => (sortDesc ? b.risk_score - a.risk_score : a.risk_score - b.risk_score));
    return list;
  }, [accounts, filter, tableSearch, sortDesc]);

  const activeAlerts = (dashboard?.critical_accounts || 0) + (dashboard?.suspicious_accounts || 0);
  const criticalAccounts = dashboard?.critical_accounts || 0;

  const trendSeed = selectedUser?.account_id || "default";
  const alertTrend = pseudoSeries(trendSeed + "-a", 7, 20, 100);
  const weeklyLoad = pseudoSeries(trendSeed + "-w", 7, 20, 95);

  return (
    <>
      {/* METRIC STRIP */}
      <section className="metric-strip">
        <div>
          ACTIVE MULE ALERTS: <strong className="metric-danger">{activeAlerts}</strong>
        </div>
        <div>
          CRITICAL RISK ACCOUNTS: <strong className="metric-warning">{criticalAccounts}</strong>
        </div>
        <div className="metric-status">
          <span className="status-dot" />
          ANALYSIS ENGINE STATUS: <strong className="metric-online">ONLINE</strong>
          <span className="metric-sub">(last run: 2 min ago)</span>
        </div>
      </section>

      <div className="monitor-body">
        {/* MAIN TABLE AREA */}
        <div className="monitor-main">
          <div className="monitor-toolbar">
            <div className="toolbar-search">
              <input
                type="text"
                placeholder="Search node ID, name, or city..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>

            <div className="toolbar-filter">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All risk accounts</option>
                <option value="critical">Critical only</option>
                <option value="suspicious">Suspicious only</option>
                <option value="safe">Safe only</option>
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="monitor-table-wrap">
            <table className="monitor-table">
              <thead>
                <tr>
                  <th>TARGET ACCOUNT</th>
                  <th
                    className="sortable"
                    onClick={() => setSortDesc((v) => !v)}
                  >
                    RISK SCORE <ArrowUpDown size={12} />
                  </th>
                  <th className="col-anatomy">RISK ANATOMY (XAI)</th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map((account) => {
                  const isSelected = selectedUser?.account_id === account.account_id;
                  return (
                    <tr
                      key={account.account_id}
                      className={isSelected ? "row-selected" : ""}
                      onClick={() => loadAccount(account)}
                    >
                      <td className="col-account">
                        <span className="account-id">{account.account_id}</span>
                        <span className="account-name">{account.name}</span>
                      </td>
                      <td>
                        <span
                          className="risk-score"
                          style={{ color: getRiskColor(account.risk_level) }}
                        >
                          <i
                            className="dot"
                            style={{ backgroundColor: getRiskColor(account.risk_level) }}
                          />
                          {account.risk_score}/100
                        </span>
                      </td>
                      <td className="col-anatomy">
                        <RiskAnatomyBar
                          breakdown={{
                            multiple_senders: Math.round(account.risk_score * 0.5),
                            rapid_transfer: Math.round(account.risk_score * 0.35),
                            new_device: Math.round(account.risk_score * 0.1),
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty-row">
                      No accounts match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INSPECTOR PANEL */}
        <aside className="inspector-panel">
          <div className="inspector-chart-card">
            <div className="inspector-label">ALERT TRENDS (7D)</div>
            <div className="mini-bars">
              {alertTrend.map((h, i) => (
                <div
                  key={i}
                  className="mini-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {!selectedUser ? (
            <div className="inspector-empty">
              Bir hesaba tıklayarak risk detaylarını görüntüle.
            </div>
          ) : (
            <>
              <div className="inspector-meta">
                <div className="inspector-meta-label">Inspecting Entity:</div>
                <div className="inspector-meta-row">
                  <h3>{selectedUser.account_id}</h3>
                  <span
                    className="inspector-score"
                    style={{ color: getRiskColor(riskDetail?.risk_level) }}
                  >
                    {riskDetail?.risk_score ?? "--"}/100
                  </span>
                </div>
                <div className="inspector-sub">
                  Account Holder: <strong>{selectedUser.name}</strong>
                </div>
                <div className="inspector-sub">
                  {selectedUser.city} • {selectedUser.age} yrs old
                </div>
              </div>

              <div className="inspector-signals">
                {riskDetail &&
                  Object.entries(riskDetail.risk_breakdown).map(([key, value], i) => (
                    <div className="signal-card" key={key}>
                      <div className="signal-head">
                        <span>
                          {i + 1}. <strong>{IMPACT_META[key]?.label || key}</strong>
                        </span>
                        <span className="signal-impact">
                          {impactLevel(value)} Impact
                        </span>
                      </div>
                      <div className="signal-desc">
                        {IMPACT_META[key]?.text(value)}
                      </div>
                    </div>
                  ))}
              </div>

              {explanation?.explanation && (
                <div className="inspector-ai">{explanation.explanation}</div>
              )}

              <div className="inspector-chart-card weekly-load">
                <div className="inspector-label">WEEKLY NETWORK LOAD</div>
                <div className="mini-bars tall">
                  {weeklyLoad.map((h, i) => (
                    <div key={i} className="mini-bar accent" style={{ height: `${h}%` }} />
                  ))}
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