import { useState, useMemo } from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { getTherapist } from "@/lib/schedule-data";
import { ShiftSwap, generateSwaps, getSwapStats } from "@/lib/swap-data";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Sun,
  Moon,
  Hand,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

type FilterTab = "all" | "open" | "claimed" | "approved";

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<ShiftSwap[]>(() => generateSwaps());
  const [filter, setFilter] = useState<FilterTab>("all");

  const stats = useMemo(() => getSwapStats(swaps), [swaps]);

  const filtered = useMemo(() => {
    if (filter === "all") return swaps;
    return swaps.filter((s) => s.status === filter);
  }, [swaps, filter]);

  // Current therapist (simulated as t5 - Aleyce for demo)
  const currentUserId = "t5";

  function handleClaim(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId
          ? {
              ...s,
              status: "claimed" as const,
              claimedById: currentUserId,
              claimedAt: new Date().toISOString(),
            }
          : s
      )
    );
    toast.success("Shift claimed!", {
      description: "Waiting for manager approval.",
    });
  }

  function handleCancel(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId ? { ...s, status: "cancelled" as const } : s
      )
    );
    toast("Swap request cancelled");
  }

  function handleApprove(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId ? { ...s, status: "approved" as const } : s
      )
    );
    toast.success("Swap approved!");
  }

  function handleReject(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId ? { ...s, status: "rejected" as const } : s
      )
    );
    toast("Swap rejected");
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: swaps.length },
    { key: "open", label: "Open", count: stats.open },
    { key: "claimed", label: "Pending Approval", count: stats.claimed },
    { key: "approved", label: "Approved", count: stats.approved },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-5 pb-4 border-b bg-card flex-shrink-0"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground tracking-tight mb-0.5">
                Shift Swaps
              </h1>
              <p className="text-xs text-muted-foreground">
                Post a shift you need covered or pick up an open shift from a teammate
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> Post a Swap
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "text-[10px] tabular-nums rounded-full px-1.5 py-0.5",
                    filter === tab.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Swap Cards */}
        <div className="flex-1 overflow-auto p-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ArrowLeftRight className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No swaps in this category</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Check other tabs or post a new swap request
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((swap, i) => (
                <SwapCard
                  key={swap.id}
                  swap={swap}
                  index={i}
                  currentUserId={currentUserId}
                  onClaim={() => handleClaim(swap.id)}
                  onCancel={() => handleCancel(swap.id)}
                  onApprove={() => handleApprove(swap.id)}
                  onReject={() => handleReject(swap.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function SwapCard({
  swap,
  index,
  currentUserId,
  onClaim,
  onCancel,
  onApprove,
  onReject,
}: {
  swap: ShiftSwap;
  index: number;
  currentUserId: string;
  onClaim: () => void;
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const requester = getTherapist(swap.requesterId);
  const claimer = swap.claimedById ? getTherapist(swap.claimedById) : null;
  const shiftDate = parseISO(swap.shiftDate);
  const postedAt = parseISO(swap.postedAt);
  const isOwn = swap.requesterId === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        swap.status === "open" && "border-primary/15 hover:border-primary/25",
        swap.status === "claimed" && "border-warning/20",
        swap.status === "approved" && "border-success/20",
        swap.status === "rejected" && "border-destructive/15 opacity-60",
        swap.status === "cancelled" && "border-border opacity-40"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Requester avatar */}
        {requester && (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `hsl(${requester.color})` }}
          >
            {requester.initials}
          </span>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {requester?.name ?? "Unknown"}
            </span>
            {requester?.role === "lead" && (
              <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                Lead
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(postedAt, { addSuffix: true })}
            </span>
          </div>

          {/* Shift info */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1">
              {swap.shiftType === "day" ? (
                <Sun className="h-3 w-3 text-warning" />
              ) : (
                <Moon className="h-3 w-3 text-primary" />
              )}
              <span className="text-xs font-medium text-foreground">
                {format(shiftDate, "EEE, MMM d")}
              </span>
              <span className="text-[10px] text-muted-foreground">
                · {swap.shiftType === "day" ? "7a–7p" : "7p–7a"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{swap.reason}</span>
          </div>

          {/* Claimed info */}
          {claimer && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 mb-2">
              <Hand className="h-3 w-3 text-primary" />
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-primary-foreground"
                style={{ backgroundColor: `hsl(${claimer.color})` }}
              >
                {claimer.initials}
              </span>
              <span className="text-xs text-foreground">
                <strong>{claimer.name}</strong> picked this up
              </span>
              {swap.claimedAt && (
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(parseISO(swap.claimedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge
            variant={
              swap.status === "open"
                ? "info"
                : swap.status === "claimed"
                ? "warning"
                : swap.status === "approved"
                ? "success"
                : swap.status === "rejected"
                ? "error"
                : "neutral"
            }
          >
            {swap.status === "open" && <ArrowLeftRight className="h-3 w-3" />}
            {swap.status === "claimed" && <Clock className="h-3 w-3" />}
            {swap.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
            {swap.status === "rejected" && <XCircle className="h-3 w-3" />}
            {swap.status === "open" && "Open"}
            {swap.status === "claimed" && "Pending"}
            {swap.status === "approved" && "Approved"}
            {swap.status === "rejected" && "Rejected"}
            {swap.status === "cancelled" && "Cancelled"}
          </StatusBadge>

          <div className="flex items-center gap-1.5">
            {/* Therapist can claim open swaps (not their own) */}
            {swap.status === "open" && !isOwn && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onClaim}
              >
                <Hand className="h-3 w-3" /> Pick Up
              </Button>
            )}

            {/* Own open swap can be cancelled */}
            {swap.status === "open" && isOwn && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}

            {/* Manager can approve/reject claimed swaps */}
            {swap.status === "claimed" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={onReject}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={onApprove}
                >
                  <CheckCircle2 className="h-3 w-3" /> Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
