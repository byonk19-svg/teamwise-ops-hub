import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  ArrowLeftRight,
  ClipboardCheck,
  Users,
  Settings,
  Shield,
  CalendarRange,
} from "lucide-react";

const managerNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/schedule", icon: CalendarDays, label: "Schedule" },
  { to: "/availability", icon: CalendarRange, label: "Availability" },
  { to: "/approvals", icon: ClipboardCheck, label: "Approvals" },
  { to: "/swaps", icon: ArrowLeftRight, label: "Shift Swaps" },
  { to: "/coverage", icon: Shield, label: "Coverage" },
  { to: "/team", icon: Users, label: "Team" },
];

const bottomNav = [
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent">
          <CalendarDays className="h-4 w-4 text-sidebar-accent-foreground" />
        </div>
        <div>
          <span className="font-heading text-sm font-bold text-sidebar-primary">Teamwise</span>
          <p className="text-[10px] text-sidebar-muted leading-none">Respiratory Therapy</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="px-2 pb-2 pt-3 text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
          Operations
        </p>
        {managerNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              location.pathname === item.to
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              location.pathname === item.to
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}

        {/* User */}
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 mt-2 border-t border-sidebar-border pt-4">
          <div className="h-7 w-7 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
            JM
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-sidebar-primary truncate">Jamie Mitchell</p>
            <p className="text-[10px] text-sidebar-muted truncate">Lead Therapist</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
