import Logo from "./Logo";

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <Logo />

      <button className={activePage === "dashboard" ? "active" : ""} onClick={() => setActivePage("dashboard")}>
        Dashboard
      </button>

      <button className={activePage === "accounts" ? "active" : ""} onClick={() => setActivePage("accounts")}>
        Accounts
      </button>

	  <button className={activePage === "analytics" ? "active" : ""} onClick={() => setActivePage("analytics")}>
  		Analytics
	  </button>

      <button className={activePage === "report" ? "active" : ""} onClick={() => setActivePage("report")}>
        Report
      </button>

      <button className={activePage === "alerts" ? "active" : ""} onClick={() => setActivePage("alerts")}>
        Alerts
      </button>

      <button className={activePage === "simulator" ? "active" : ""} onClick={() => setActivePage("simulator")}>
        Simulator
      </button>
    </aside>
  );
}

export default Sidebar;