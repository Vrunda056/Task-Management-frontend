"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  LogOut,
  Users,
} from "lucide-react";

import { useTaskContext } from "@/lib/tasks/task-context";
import { useAuth } from "@/lib/auth/auth-context";
import { ConfirmDialog } from "@/components/ui";
import { ProfileModal } from "@/components/profile/profile-modal";

interface NavItem {
  label: string;
  href: string | null;
  icon: ComponentType<{ className?: string; size?: number | string; strokeWidth?: number }>;
}

const mainNavigation: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "My tasks", href: "/tasks", icon: CheckCircle2 },
  { label: "Projects", href: "/projects", icon: Layers },
  { label: "Calendar", href: "/calendar", icon: Calendar },
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
        <Icon size={20} strokeWidth={1.8} />
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
      <Icon size={20} strokeWidth={1.8} />
      <span className="nav-link-label">{label}</span>
    </Link>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { activeTimer, currentDayEntry, selectedDate } = useTaskContext();
  const {
    accessToken,
    user,
    isInitializing,
    authError,
    logout,
    restoreSession,
  } = useAuth();
  const isAuthPage = pathname === "/login";
  const isManager = user?.role === "MANAGER";
  const isProfileIncomplete = Boolean(user && !user.sheetUrl);

  useEffect(() => {
    if (user && !user.sheetUrl && typeof window !== "undefined") {
      const alreadyPrompted = window.sessionStorage.getItem("taskly_profile_prompted");
      if (!alreadyPrompted) {
        setShowProfileModal(true);
        window.sessionStorage.setItem("taskly_profile_prompted", "true");
      }
    }
  }, [user]);
  const isUserManagementPage = pathname === "/users" || pathname.startsWith("/users/");

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
      return;
    }

    if (isUserManagementPage && !isManager) {
      router.replace("/projects");
    }
  }, [
    accessToken,
    authError,
    isAuthPage,
    isInitializing,
    isManager,
    isUserManagementPage,
    router,
  ]);

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

  if (isUserManagementPage && !isManager) {
    return (
      <div className="auth-redirecting" role="status">
        Redirecting to projects...
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
    pathname === "/profile"
      ? "My Profile"
      : pathname === "/users"
      ? "Users"
      : pathname === "/projects"
        ? "Projects"
        : pathname === "/calendar"
          ? "Calendar"
        : pathname.startsWith("/tasks")
          ? "My Tasks"
          : "Workspace";

  const timerDisplay = activeTimer
    ? `${String(Math.floor(activeTimer.elapsedSeconds / 60)).padStart(2, "0")}:${String(Math.floor(activeTimer.elapsedSeconds % 60)).padStart(2, "0")}`
    : "";

  const todayItems = currentDayEntry?.tasks.flatMap((t) => t.items) ?? [];
  const completedTodayCount = todayItems.filter((i) => i.status === "COMPLETED").length;
  const totalTodayCount = todayItems.length;

  const todayFormatted = (() => {
    try {
      const [y, m, d] = (selectedDate || "").split("-").map(Number);
      if (y && m && d) {
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }
    } catch { }
    return "Today";
  })();

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
          {mainNavigation.map((item) => (
            <SidebarLink
              key={item.label}
              {...item}
              collapsed={isSidebarCollapsed}
            />
          ))}

          {isManager && (
            <>
              <SidebarLink
                collapsed={isSidebarCollapsed}
                href="/users"
                icon={Users}
                label="Users"
              />
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <Link
              href="/profile"
              aria-label="View your profile"
              className="flex flex-1 items-center gap-3 overflow-hidden text-left hover:opacity-90 transition-opacity cursor-pointer group"
              title="View your profile"
            >
              <div className="relative shrink-0">
                <span className="avatar avatar-lavender">{userInitials}</span>
                {isProfileIncomplete && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-canvas animate-pulse"
                    title="Profile setup required"
                  />
                )}
              </div>
              <span className="profile-copy min-w-0">
                <strong className="truncate group-hover:text-ink transition-colors">{user?.name}</strong>
                <small className="truncate flex items-center gap-1.5">
                  {user?.position || (user?.role === "MANAGER" ? "Manager" : "Developer")}
                </small>
              </span>
            </Link>
            <button
              aria-label="Log out"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-danger-border bg-danger-bg text-danger shadow-2xs transition-all hover:-translate-y-px hover:border-danger hover:bg-danger-border/40 hover:shadow-xs active:translate-y-0 cursor-pointer"
              onClick={() => setShowLogoutConfirm(true)}
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
          <div className="topbar-actions flex items-center gap-2.5">
            {activeTimer && (
              <Link
                href="/tasks"
                className="group inline-flex items-center gap-2 h-[36px] pl-3 pr-3 rounded-full bg-purple-subtle/50 border border-purple-border hover:border-purple hover:bg-purple-subtle shadow-2xs transition-all cursor-pointer"
                title={`Tracking: ${activeTimer.itemDescription} (${activeTimer.taskName}) — Click to manage`}
              >
                {/* Live beacon */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {activeTimer.isRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeTimer.isRunning
                      ? "bg-purple"
                      : "bg-warning"
                      }`}
                  />
                </span>

                {/* Digital monospace clock */}
                <span className="font-mono text-sm font-bold text-purple tracking-tight">
                  {timerDisplay}
                </span>

                <span className="text-subtle text-xs">·</span>

                {/* Task name */}
                <span className="max-w-[140px] sm:max-w-[200px] truncate text-xs sm:text-sm font-medium text-ink-secondary group-hover:text-ink transition-colors">
                  {activeTimer.taskName}
                </span>

                {/* Interactive chevron indicator */}
                <ChevronRight
                  size={14}
                  className="text-subtle group-hover:text-purple group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            )}

            {/* At-a-glance status indicators */}
            <div className="flex items-center gap-2">
              {/* Today's Date */}
              <div
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
                title="Current Date"
              >
                <Calendar size={13} className="text-purple shrink-0" />
                <span>{todayFormatted}</span>
              </div>

              {/* Tasks Progress / Clearance */}
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1.5 rounded-lg border border-success-border bg-success-bg px-3 py-1.5 text-xs font-semibold text-success shadow-2xs transition-all hover:-translate-y-px hover:bg-success-border/30"
                title="View today's tasks"
              >
                <CheckCircle2 size={14} className="text-success shrink-0" />
                <span>
                  {totalTodayCount > 0
                    ? `${completedTodayCount}/${totalTodayCount} Tasks Done`
                    : "0 Tasks Scheduled"}
                </span>
              </Link>
            </div>

            {/* Profile Incomplete - Action Required Topbar Pill */}
            {isProfileIncomplete && (
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs transition-all hover:-translate-y-px hover:border-amber-400 hover:bg-amber-100/90 active:translate-y-0"
                title="Profile setup required: Connect your Google Sheet"
              >
                <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                <span className="hidden sm:inline">Complete Profile</span>
                <span className="rounded bg-amber-200/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Action Required
                </span>
              </button>
            )}

            <span className="topbar-divider" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-purple-border bg-purple-subtle px-2.5 py-1 text-xs font-semibold text-purple">
                {user?.role === "MANAGER" ? "Manager" : "Developer"}
              </span>
              <Link
                href="/profile"
                aria-label="View your profile"
                className="relative cursor-pointer hover:opacity-85 transition-opacity"
                title="View your profile"
              >
                <span className="avatar avatar-lavender topbar-avatar">{userInitials}</span>
                {isProfileIncomplete && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-canvas animate-pulse"
                    title="Profile setup required"
                  />
                )}
              </Link>
            </div>
          </div>
        </header>
        <main className="workspace-main">{children}</main>
      </div>

      {/* Profile & Settings Modal */}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign Out"
        description="Are you sure you want to sign out of your Taskly workspace?"
        confirmLabel="Sign Out"
        variant="danger"
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
          router.replace("/login");
        }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}