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
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function ManagerSwapsPage() {
  const [swaps, setSwaps] = useState<ShiftSwap[]>(() => generateSwaps());

  const stats = useMemo(() => getSwapStats(swaps), [swaps]);

  const pendingApproval = useMemo(
    () => swaps.filter((s) => s.status === "claimed"),
    [swaps]
  );
  const openSwaps = useMemo(
    () => swaps.filter((s) => s.status === "open"),
    [swaps]
  );
  const resolved = useMemo(
    () => swaps.filter((s) => s.status === "approved" || s.status === "rejected" || s.status === "cancelled"),
    [swaps]
  );

  function handleApprove(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) => (s.id === swapId ? { ...s, status: "approved" as const } : s))
    );
    toast.success("Swap approved!");
  }

  function handleReject(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) => (s.id === swapId ? { ...s, status: "rejected" as const } : s))
    );
    toast("Swap rejected");
  }

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
                Review and approve swap requests from your team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {stats.claimed > 0 && (
              <StatusBadge variant="warning">
                <Clock className="h-3 w-3" />
                {stats.claimed} awaiting approval
              </StatusBadge>
            )}
            <StatusBadge variant="info">
              <ArrowLeftRight className="h-3 w-3" />
              {stats.open} open
            </StatusBadge>
            <StatusBadge variant="success">
              <CheckCircle2 className="h-3 w-3" />
              {stats.approved} approved
            </StatusBadge>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 space-y-6">
          {/* Pending Approval Section */}
          {pendingApproval.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-warning" />
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Needs Your Approval
                </h2>
                <span className="text-[10px] bg-warning/10 text-warning-foreground px-2 py-0.5 rounded-full font-medium">
                  {pendingApproval.length}
                </span>
              </div>
              <div className="space-y-2">
                {pendingApproval.map((swap, i) => (
                  <ManagerSwapCard
                    key={swap.id}
                    swap={swap}
                    index={i}
                    onApprove={() => handleApprove(swap.id)}
                    onReject={() => handleReject(swap.id)}
                    highlight
                  />
                ))}
              </div>
            </section>
          )}

          {/* Open Swaps */}
          {openSwaps.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight className="h-4 w-4 text-primary" />
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Open Requests
                </h2>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {openSwaps.length}
                </span>
              </div>
              <div className="space-y-2">
                {openSwaps.map((swap, i) => (
                  <ManagerSwapCard key={swap.id} swap={swap} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-heading text-sm font-semibold text-muted-foreground">
                  Resolved
                </h2>
              </div>
              <div className="space-y-2">
                {resolved.map((swap, i) => (
                  <ManagerSwapCard key={swap.id} swap={swap} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ManagerSwapCard({
  swap,
  index,
  highlight,
  onApprove,
  onReject,
}: {
  swap: ShiftSwap;
  index: number;
  highlight?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const requester = getTherapist(swap.requesterId);
  const claimer = swap.claimedById ? getTherapist(swap.claimedById) : null;
  const shiftDate = parseISO(swap.shiftDate);
  const postedAt = parseISO(swap.postedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        highlight && "border-warning/30 bg-warning/3",
        swap.status === "approved" && "opacity-70",
        swap.status === "rejected" && "opacity-50",
        swap.status === "cancelled" && "opacity-40"
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {requester?.name}
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

          {claimer && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
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
            </div>
          )}
        </div>

        {/* Status + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SwapStatusBadge status={swap.status} />

          {swap.status === "claimed" && onApprove && onReject && (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onReject}>
                Reject
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onApprove}
              >
                <CheckCircle2 className="h-3 w-3" /> Approve
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SwapStatusBadge({ status }: { status: ShiftSwap["status"] }) {
  const config = {
    open: { variant: "info" as const, icon: ArrowLeftRight, label: "Open" },
    claimed: { variant: "warning" as const, icon: Clock, label: "Pending" },
    approved: { variant: "success" as const, icon: CheckCircle2, label: "Approved" },
    rejected: { variant: "error" as const, icon: XCircle, label: "Rejected" },
    cancelled: { variant: "neutral" as const, icon: XCircle, label: "Cancelled" },
  }[status];

  return (
    <StatusBadge variant={config.variant}>
      <config.icon className="h-3 w-3" />
      {config.label}
    </StatusBadge>
  );
}
