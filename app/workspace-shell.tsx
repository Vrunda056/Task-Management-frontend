"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Settings,
  Users,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string | null;
  icon: ComponentType<{ className?: string; size?: number | string; strokeWidth?: number }>;
}

const mainNavigation: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "My tasks", href: null, icon: CheckCircle2 },
  { label: "Projects", href: "/projects", icon: Layers },
  { label: "Calendar", href: null, icon: Calendar },
];

function SidebarLink({
  label,
  href,
  icon: Icon,
  collapsed,
}: {
  label: string;
  href: string | null;
  icon: ComponentType<{ className?: string; size?: number | string; strokeWidth?: number }>;
  collapsed: boolean;
}) {
  const pathname = usePathname();

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className="nav-link nav-link-disabled"
        title={collapsed ? `${label} is coming soon` : undefined}
      >
        <Icon size={18} strokeWidth={1.8} />
        <span className="nav-link-label">{label}</span>
        <span className="coming-soon">Soon</span>
      </span>
    );
  }

  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`nav-link${isActive ? " nav-link-active" : ""}`}
      href={href}
      title={collapsed ? label : undefined}
    >
      <Icon size={18} strokeWidth={1.8} />
      <span className="nav-link-label">{label}</span>
    </Link>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pageTitle =
    pathname === "/users"
      ? "People"
      : pathname === "/projects"
      ? "Projects"
      : "Workspace";

  return (
    <div className={`workspace-shell${isSidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-brand-row">
          <Link aria-label="Taskly home" className="brand" href="/">
            <span className="brand-mark">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="brand-name">
              Taskly<span className="brand-period">.</span>
            </span>
          </Link>
          <button
            aria-expanded={!isSidebarCollapsed}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={16} strokeWidth={1.8} />
            ) : (
              <ChevronLeft size={16} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <nav aria-label="Main navigation" className="sidebar-nav">
          <p className="nav-section-label">WORKSPACE</p>
          {mainNavigation.map((item) => (
            <SidebarLink
              key={item.label}
              {...item}
              collapsed={isSidebarCollapsed}
            />
          ))}

          <p className="nav-section-label nav-section-spaced">MANAGE</p>
          <SidebarLink
            collapsed={isSidebarCollapsed}
            href="/users"
            icon={Users}
            label="People"
          />
        </nav>

        <div className="sidebar-bottom">
          <SidebarLink
            collapsed={isSidebarCollapsed}
            href={null}
            icon={Settings}
            label="Settings"
          />
          <div className="sidebar-profile">
            <span className="avatar avatar-lavender">AM</span>
            <span className="profile-copy">
              <strong>Alex Morgan</strong>
              <small>alex@studio.co</small>
            </span>
            <span aria-hidden="true" className="profile-menu">
              <MoreHorizontal size={16} />
            </span>
          </div>
        </div>
      </aside>

      <div className="workspace-content">
        <header className="topbar">
          <div aria-label="Breadcrumb" className="breadcrumb">
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} strokeWidth={1.8} />
              <input aria-label="Search" placeholder="Search anything..." />
              <kbd>⌘ K</kbd>
            </label>
            <button
              aria-label="Notifications"
              className="icon-button"
              type="button"
            >
              <Bell size={18} strokeWidth={1.8} />
              <span className="notification-dot" />
            </button>
            <span className="topbar-divider" />
            <span className="avatar avatar-lavender topbar-avatar">AM</span>
          </div>
        </header>
        <main className="workspace-main">{children}</main>
      </div>
    </div>
  );
}