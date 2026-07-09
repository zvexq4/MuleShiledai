import { Bell, User } from "lucide-react";

const PAGE_LABELS = {
  dashboard: "Mule Account Monitor",
  accounts: "Accounts",
  alerts: "Alerts",
  report: "Reports",
  analytics: "Analytics",
  simulator: "Settings & Simulator",
};

function Header({ activePage, searchValue, onSearchChange }) {
  const pageLabel = PAGE_LABELS[activePage] || "Dashboard";

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span className="brand">MuleShield-AI</span>
        <span className="crumb-sep">›</span>
        <span className="crumb-current">{pageLabel}</span>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications">
          <Bell size={17} />
        </button>

        <div className="avatar">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}

export default Header;