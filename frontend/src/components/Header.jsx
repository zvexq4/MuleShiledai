import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronRight, ShieldAlert, X } from "lucide-react";

const PAGE_LABELS = {
  dashboard: "Dashboard",
  accounts: "Accounts",
  alerts: "Alerts",
  report: "Reports",
  analytics: "Analytics",
  simulator: "Settings & Simulator",
  contact: "Contact",
};

function getAccountId(account) {
  return account?.account_id || account?.wallet_id || "Unknown Wallet";
}

function Header({
  activePage,
  selectedUser,
  accounts = [],
  loadAccount,
  setActivePage,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  const criticalAccounts = useMemo(() => {
    return [...accounts]
      .filter((account) => {
        const level =
          account.hybrid_risk_level ||
          account.risk_level;

        return level === "critical";
      })
      .sort((firstAccount, secondAccount) => {
        const firstScore = Number(
          firstAccount.hybrid_risk_score ??
            firstAccount.risk_score ??
            0
        );

        const secondScore = Number(
          secondAccount.hybrid_risk_score ??
            secondAccount.risk_score ??
            0
        );

        return secondScore - firstScore;
      });
  }, [accounts]);

  const visibleNotifications = criticalAccounts.slice(0, 5);

  useEffect(() => {
    const closeNotifications = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeNotifications);

    return () => {
      document.removeEventListener("mousedown", closeNotifications);
    };
  }, []);

  const getBreadcrumb = () => {
    if (activePage === "report" && selectedUser) {
      return (
        <>
          <span className="brand">MuleShield</span>
          <span className="crumb-sep">›</span>

          <span>Accounts</span>
          <span className="crumb-sep">›</span>

          <span>Reports</span>
          <span className="crumb-sep">›</span>

          <span className="crumb-current">
            {getAccountId(selectedUser)}
          </span>
        </>
      );
    }

    return (
      <>
        <span className="brand">MuleShield</span>
        <span className="crumb-sep">›</span>

        <span className="crumb-current">
          {PAGE_LABELS[activePage] || "Dashboard"}
        </span>
      </>
    );
  };

  const openCriticalAccount = async (account) => {
    setNotificationsOpen(false);

    if (typeof loadAccount === "function") {
      await loadAccount(account);
    }

    if (typeof setActivePage === "function") {
      setActivePage("dashboard");
    }
  };

  const openAllAlerts = () => {
    setNotificationsOpen(false);

    if (typeof setActivePage === "function") {
      setActivePage("alerts");
    }
  };

  return (
    <header className="topbar">
      <div className="breadcrumb">
        {getBreadcrumb()}
      </div>

      <div className="topbar-actions">
        <div
          className="notification-wrapper"
          ref={notificationRef}
        >
          <button
            type="button"
            className={`icon-btn notification-button ${
              notificationsOpen ? "active" : ""
            }`}
            title="Critical notifications"
            aria-label="Open critical notifications"
            aria-expanded={notificationsOpen}
            onClick={() =>
              setNotificationsOpen((currentValue) => !currentValue)
            }
          >
            <Bell size={17} />

            {criticalAccounts.length > 0 && (
              <span className="notification-badge">
                {criticalAccounts.length > 99
                  ? "99+"
                  : criticalAccounts.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <div>
                  <span>CRITICAL ALERT CENTER</span>
                  <h3>Risk Notifications</h3>
                </div>

                <button
                  type="button"
                  className="notification-close"
                  title="Close notifications"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="notification-summary">
                <ShieldAlert size={17} />

                <div>
                  <strong>
                    {criticalAccounts.length} critical wallets
                  </strong>

                  <span>
                    Immediate analyst review recommended
                  </span>
                </div>
              </div>

              <div className="notification-list">
                {visibleNotifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={20} />
                    <strong>No critical alerts</strong>
                    <span>
                      The monitoring engine has not found a critical wallet.
                    </span>
                  </div>
                ) : (
                  visibleNotifications.map((account) => {
                    const accountId = getAccountId(account);

                    const riskScore =
                      account.hybrid_risk_score ??
                      account.risk_score ??
                      0;

                    return (
                      <button
                        type="button"
                        className="notification-item"
                        key={accountId}
                        onClick={() => openCriticalAccount(account)}
                      >
                        <span className="notification-risk-dot" />

                        <span className="notification-wallet">
                          <strong>{accountId}</strong>
                          <small>
                            Critical wallet activity detected
                          </small>
                        </span>

                        <span className="notification-score">
                          {riskScore}/100
                        </span>

                        <ChevronRight size={15} />
                      </button>
                    );
                  })
                )}
              </div>

              {criticalAccounts.length > 0 && (
                <button
                  type="button"
                  className="notification-view-all"
                  onClick={openAllAlerts}
                >
                  View all critical alerts
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;