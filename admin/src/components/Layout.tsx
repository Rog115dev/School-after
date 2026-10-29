import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

const overview = [{ to: "/", label: "Usage", end: true, icon: "home" }];
const content = [
  { to: "/content", label: "Questions", icon: "doc" },
  { to: "/stories", label: "Stories", icon: "book" },
  { to: "/top-tips", label: "Top Tips", icon: "bulb" },
];
const access = [{ to: "/schools", label: "Schools & codes", icon: "school" }];

const titles: Record<string, string> = {
  "/": "Usage",
  "/content": "Questions",
  "/stories": "Stories",
  "/top-tips": "Top Tips",
  "/schools": "Schools & codes",
};

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const initial = (user?.name || "A").slice(0, 1).toUpperCase();

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/content/")) return "Subtopic";
    return titles[location.pathname] || "Dashboard";
  }, [location.pathname]);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  useEffect(() => {
    document.body.classList.toggle("nav-locked", navOpen);
    return () => document.body.classList.remove("nav-locked");
  }, [navOpen]);

  return (
    <div className={`shell${navOpen ? " nav-open" : ""}`}>
      <button
        type="button"
        className="nav-backdrop"
        aria-label="Close menu"
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      />

      <aside className="sidebar" id="admin-sidebar">
        <div className="sidebar-head">
          <div className="brand">
            <img src="/brand-logo.png" alt="Speech, Language & Communication" />
          </div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="nav">
          <NavGroup label="Overview" items={overview} />
          <NavGroup label="Content" items={content} />
          <NavGroup label="Access" items={access} />
        </div>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="avatar" aria-hidden>
              {initial}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <div className="muted">{user?.email}</div>
            </div>
          </div>
          <button type="button" className="btn secondary small block" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="nav-toggle"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              aria-controls="admin-sidebar"
              onClick={() => setNavOpen((open) => !open)}
            >
              <MenuIcon />
            </button>
            <img
              className="topbar-logo"
              src="/brand-logo.png"
              alt=""
              aria-hidden
            />
            <div className="topbar-title">
              <div className="topbar-kicker">Speech, Language & Communication</div>
              <strong>{pageTitle}</strong>
            </div>
          </div>
          <div className="topbar-user">
            <span className="avatar" aria-hidden>
              {initial}
            </span>
            <div className="topbar-user-meta">
              <strong>{user?.name}</strong>
              <div className="muted">{user?.email}</div>
            </div>
            <button type="button" className="btn secondary small topbar-signout" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>

        <nav className="mobile-tabs" aria-label="Primary">
          {[...overview, ...content, ...access].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <span className="nav-ico">
                <NavIcon name={item.icon} />
              </span>
              <span>{item.label.replace(" & codes", "")}</span>
            </NavLink>
          ))}
        </nav>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavGroup({
  label,
  items,
}: {
  label: string;
  items: Array<{ to: string; label: string; end?: boolean; icon: string }>;
}) {
  return (
    <div className="nav-group">
      <div className="nav-label">{label}</div>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end}>
          <span className="nav-ico">
            <NavIcon name={item.icon} />
          </span>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (name === "doc") {
    return (
      <svg {...common}>
        <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M14 3v6h6M8 13h8M8 17h6" />
      </svg>
    );
  }
  if (name === "book") {
    return (
      <svg {...common}>
        <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22.5z" />
        <path d="M5 4.5A2.5 2.5 0 0 1 7.5 7H20" />
      </svg>
    );
  }
  if (name === "bulb") {
    return (
      <svg {...common}>
        <path d="M9 18h6M10 21h4" />
        <path d="M8 14a6 6 0 1 1 8 0c-.8.8-1.2 1.6-1.4 2.5h-5.2C9.2 15.6 8.8 14.8 8 14z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
