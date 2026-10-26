"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { useTaskContext } from "@/lib/tasks/task-context";
import { useAuth } from "@/lib/auth/auth-context";

interface NavItem {
  label: string;
  href: string | null;
  icon: ComponentType<{ className?: string; size?: number | string; strokeWidth?: number }>;
}

const mainNavigation: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "My tasks", href: "/tasks", icon: CheckCircle2 },
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
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { activeTimer } = useTaskContext();
  const {
    accessToken,
    user,
    isInitializing,
    authError,
    logout,
    restoreSession,
  } = useAuth();
  const isAuthPage = pathname === "/login";

  useEffect(() => {
    if (isAuthPage) {
      if (accessToken) {
        router.replace("/");
      }
      return;
    }

    if (isInitializing || authError) {
      return;
    }

    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, authError, isAuthPage, isInitializing, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isInitializing) {
    return (
      <div className="auth-redirecting" role="status">
        Restoring your session...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="auth-redirecting">
        <p role="alert">Could not restore your session: {authError}</p>
        <button onClick={() => void restoreSession()} type="button">
          Try again
        </button>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="auth-redirecting" role="status">
        Redirecting to sign in...
      </div>
    );
  }

  const userInitials =
    user?.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";
  const pageTitle =
    pathname === "/users"
      ? "People"
      : pathname === "/projects"
      ? "Projects"
      : pathname.startsWith("/tasks")
      ? "My Tasks"
      : "Workspace";

  const timerDisplay = activeTimer
    ? `${String(Math.floor((activeTimer.mode === "countdown" ? activeTimer.secondsLeft : activeTimer.elapsedSeconds) / 60)).padStart(2, "0")}:${String((activeTimer.mode === "countdown" ? activeTimer.secondsLeft : activeTimer.elapsedSeconds) % 60).padStart(2, "0")}`
    : "";

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
            <span className="avatar avatar-lavender">{userInitials}</span>
            <span className="profile-copy">
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </span>
            <button
              aria-label="Log out"
              className="auth-logout"
              onClick={() => {
                void logout();
                router.replace("/login");
              }}
              title="Log out"
              type="button"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="workspace-content">
        <header className="topbar">
          <div aria-label="Breadcrumb" className="breadcrumb">
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-actions">
            {activeTimer && (
              <Link
                href="/tasks"
                className="group inline-flex items-center gap-2 h-[34px] pl-2.5 pr-2.5 rounded-full bg-purple-subtle/50 border border-purple-border hover:border-purple hover:bg-purple-subtle shadow-2xs transition-all cursor-pointer"
                title={`Tracking: ${activeTimer.itemDescription} (${activeTimer.taskName}) — Click to manage`}
              >
                {/* Live beacon */}
                <span className="relative flex h-2 w-2 shrink-0">
                  {activeTimer.isRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      activeTimer.isRunning
                        ? "bg-purple"
                        : "bg-warning"
                    }`}
                  />
                </span>

                {/* Digital monospace clock */}
                <span className="font-mono text-xs font-bold text-purple tracking-tight">
                  {timerDisplay}
                </span>

                <span className="text-subtle text-xs">·</span>

                {/* Task name */}
                <span className="max-w-[120px] sm:max-w-[170px] truncate text-xs font-semibold text-ink-secondary group-hover:text-ink transition-colors">
                  {activeTimer.taskName}
                </span>

                {/* Interactive chevron indicator */}
                <ChevronRight
                  size={13}
                  className="text-subtle group-hover:text-purple group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            )}
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
            <span className="avatar avatar-lavender topbar-avatar">{userInitials}</span>
          </div>
        </header>
        <main className="workspace-main">{children}</main>
      </div>
    </div>
  );
}