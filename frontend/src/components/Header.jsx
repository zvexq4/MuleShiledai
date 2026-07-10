import { Bell, User } from "lucide-react";

const PAGE_LABELS = {
  dashboard: "Dashboard",
  accounts: "Accounts",
  alerts: "Alerts",
  report: "Reports",
  analytics: "Analytics",
  simulator: "Settings & Simulator",
  contact: "Contact",
};

function Header({
  activePage,
  selectedUser,
  searchValue,
  onSearchChange,
}) {
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
            {selectedUser.account_id}
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

  return (
    <header className="topbar">
      <div className="breadcrumb">
        {getBreadcrumb()}
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