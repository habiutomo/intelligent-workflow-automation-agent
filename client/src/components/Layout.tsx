import { Outlet, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "\u25A0" },
  { path: "/workflows", label: "Workflows", icon: "\u25B6" },
  { path: "/runs", label: "Runs", icon: "\u21BB" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>\u26A1</span>
          <span>WorkflowAgent</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`nav-item ${location.pathname.startsWith(item.path) ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "8px 12px" }}>
          v1.0.0
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
