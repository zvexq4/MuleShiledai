import {
  LayoutGrid,
  Users,
  Bell,
  FileText,
  BarChart2,
  Sliders,
  Mail,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Monitor", icon: LayoutGrid },
  { key: "accounts", label: "Accounts", icon: Users },
  { key: "alerts", label: "Alerts", icon: Bell },
  { key: "report", label: "Reports", icon: FileText },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "simulator", label: "Settings", icon: Sliders },
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="icon-sidebar">
      <div className="icon-sidebar-top">
        <div className="icon-logo">M</div>

        <nav className="icon-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`icon-nav-btn ${activePage === key ? "active" : ""}`}
              onClick={() => setActivePage(key)}
              title={label}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <button
        className={`icon-nav-btn icon-nav-exit ${activePage === "contact" ? "active" : ""
          }`}
        title="Contact"
        onClick={() => setActivePage("contact")}
      >
        <Mail size={19} />
        <span>Contact</span>
      </button>
    </aside>
  );
}

export default Sidebar;