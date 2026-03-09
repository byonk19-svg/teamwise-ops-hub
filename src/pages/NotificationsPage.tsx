import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Calendar,
  ArrowLeftRight,
  X,
  Filter,
  Inbox,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type NotificationType = Database["public"]["Enums"]["notification_type"];
type NotificationPriority = Database["public"]["Enums"]["notification_priority"];

const typeIcons: Record<NotificationType, React.ElementType> = {
  schedule_change: Calendar,
  coverage_issue: AlertTriangle,
  swap_request: ArrowLeftRight,
  swap_approved: Check,
  swap_denied: X,
  urgent_coverage: AlertTriangle,
};

const typeLabels: Record<NotificationType, string> = {
  schedule_change: "Schedule Change",
  coverage_issue: "Coverage Issue",
  swap_request: "Swap Request",
  swap_approved: "Swap Approved",
  swap_denied: "Swap Denied",
  urgent_coverage: "Urgent Coverage",
};

const priorityColors: Record<NotificationPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/20 text-warning-foreground",
  urgent: "bg-destructive/20 text-destructive",
};

const priorityIconBg: Record<NotificationPriority, string> = {
  low: "bg-muted",
  medium: "bg-primary/10",
  high: "bg-warning/20",
  urgent: "bg-destructive/20",
};

type FilterType = "all" | "swap" | "schedule" | "coverage" | "unread";

const filterConfig: { key: FilterType; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: Inbox },
  { key: "unread", label: "Unread", icon: Bell },
  { key: "swap", label: "Swaps", icon: ArrowLeftRight },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "coverage", label: "Coverage", icon: AlertTriangle },
];

const swapTypes: NotificationType[] = ["swap_request", "swap_approved", "swap_denied"];
const scheduleTypes: NotificationType[] = ["schedule_change"];
const coverageTypes: NotificationType[] = ["coverage_issue", "urgent_coverage"];

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useRealtimeNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case "unread":
        return notifications.filter((n) => !n.read_at);
      case "swap":
        return notifications.filter((n) => swapTypes.includes(n.type));
      case "schedule":
        return notifications.filter((n) => scheduleTypes.includes(n.type));
      case "coverage":
        return notifications.filter((n) => coverageTypes.includes(n.type));
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const n of filtered) {
      const day = format(new Date(n.created_at), "yyyy-MM-dd");
      if (!groups[day]) groups[day] = [];
      groups[day].push(n);
    }
    return Object.entries(groups).map(([date, items]) => ({
      date,
      label: format(new Date(date), "EEEE, MMM d"),
      items,
    }));
  }, [filtered]);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="self-start sm:self-auto"
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterConfig.map(({ key, label, icon: Icon }) => {
            const isActive = activeFilter === key;
            const count =
              key === "unread"
                ? unreadCount
                : key === "swap"
                ? notifications.filter((n) => swapTypes.includes(n.type)).length
                : key === "schedule"
                ? notifications.filter((n) => scheduleTypes.includes(n.type)).length
                : key === "coverage"
                ? notifications.filter((n) => coverageTypes.includes(n.type)).length
                : notifications.length;

            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-0.5 text-[10px] rounded-full px-1.5 py-0.5 font-semibold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-1">
              {activeFilter !== "all"
                ? "Try changing your filter"
                : "You'll see activity here when things happen"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.date}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((notification) => {
                    const Icon = typeIcons[notification.type] || Bell;
                    const isUnread = !notification.read_at;

                    return (
                      <Card
                        key={notification.id}
                        onClick={() => isUnread && markAsRead(notification.id)}
                        className={cn(
                          "p-3 sm:p-4 cursor-pointer transition-all hover:shadow-sm border",
                          isUnread
                            ? "bg-primary/[0.03] border-primary/15 shadow-sm"
                            : "bg-card border-border hover:bg-muted/30"
                        )}
                      >
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center",
                              priorityIconBg[notification.priority]
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                notification.priority === "urgent" && "text-destructive",
                                notification.priority === "high" && "text-warning-foreground",
                                notification.priority === "medium" && "text-primary",
                                notification.priority === "low" && "text-muted-foreground"
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <p
                                  className={cn(
                                    "text-sm truncate",
                                    isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                                  )}
                                >
                                  {notification.title}
                                </p>
                                {isUnread && (
                                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <span className="flex-shrink-0 text-[11px] text-muted-foreground/70 whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-none">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-5",
                                  priorityColors[notification.priority]
                                )}
                              >
                                {notification.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-5 bg-muted/50"
                              >
                                {typeLabels[notification.type]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
