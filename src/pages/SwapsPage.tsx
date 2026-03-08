import { useState, useMemo } from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { getTherapist, ShiftSlot, generateSchedule, getCoverageStatus } from "@/lib/schedule-data";
import { ShiftSwap, SwapMode, generateSwaps, getSwapStats, getSwapModeLabel } from "@/lib/swap-data";
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
  AlertTriangle,
  Shield,
  ArrowRight,
  Users,
  UserCheck,
  Repeat2,
} from "lucide-react";
import { toast } from "sonner";

const CYCLE_START = new Date(2026, 2, 22);
const TOTAL_WEEKS = 6;

interface CoverageImpact {
  label: string; // e.g. "Wed, Mar 25 · Day"
  currentStaff: number;
  afterStaff: number;
  minStaff: number;
  hasLeadBefore: boolean;
  hasLeadAfter: boolean;
  needsLead: boolean;
  claimerAlreadyScheduled: boolean;
  requesterIsLead: boolean;
  claimerIsLead: boolean;
}

interface SwapImpact {
  primary: CoverageImpact | null;    // The requester's shift
  tradeReturn: CoverageImpact | null; // The trade-back shift (only for mutual trades)
  overallSeverity: "ok" | "warning" | "error";
}

function computeSingleImpact(
  slots: ShiftSlot[],
  shiftDate: string,
  shiftType: "day" | "night",
  removedId: string,
  addedId?: string,
  label?: string
): CoverageImpact | null {
  const slotId = `${shiftDate}-${shiftType}`;
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) return null;

  const removed = getTherapist(removedId);
  const added = addedId ? getTherapist(addedId) : null;

  const currentStaff = slot.assignments.length;
  const hasLeadBefore = slot.assignments.some(
    (a) => getTherapist(a.therapistId)?.role === "lead"
  );

  const afterAssignments = slot.assignments
    .filter((a) => a.therapistId !== removedId)
    .concat(added ? [{ therapistId: addedId! }] : []);

  const afterStaff = afterAssignments.length;
  const hasLeadAfter = afterAssignments.some(
    (a) => getTherapist(a.therapistId)?.role === "lead"
  );

  const claimerAlreadyScheduled = added
    ? slot.assignments.some((a) => a.therapistId === addedId)
    : false;

  const shiftDateParsed = parseISO(shiftDate);

  return {
    label: label || `${format(shiftDateParsed, "EEE, MMM d")} · ${shiftType === "day" ? "Day" : "Night"}`,
    currentStaff,
    afterStaff,
    minStaff: slot.minStaff,
    hasLeadBefore,
    hasLeadAfter,
    needsLead: slot.needsLead,
    claimerAlreadyScheduled,
    requesterIsLead: removed?.role === "lead" || false,
    claimerIsLead: added?.role === "lead" || false,
  };
}

function computeSwapImpact(
  slots: ShiftSlot[],
  swap: ShiftSwap
): SwapImpact {
  // Primary shift: requester leaves, claimer joins
  const primary = computeSingleImpact(
    slots,
    swap.shiftDate,
    swap.shiftType,
    swap.requesterId,
    swap.claimedById
  );

  // Trade-return shift (mutual trade only): claimer leaves, requester joins
  let tradeReturn: CoverageImpact | null = null;
  if (swap.mode === "trade" && swap.tradeShiftDate && swap.tradeShiftType && swap.claimedById) {
    tradeReturn = computeSingleImpact(
      slots,
      swap.tradeShiftDate,
      swap.tradeShiftType,
      swap.claimedById,
      swap.requesterId
    );
  }

  const severities = [primary, tradeReturn]
    .filter(Boolean)
    .map((impact) => getImpactSeverity(impact!));

  const overallSeverity = severities.includes("error")
    ? "error"
    : severities.includes("warning")
    ? "warning"
    : "ok";

  return { primary, tradeReturn, overallSeverity };
}

function getImpactSeverity(impact: CoverageImpact): "ok" | "warning" | "error" {
  if (impact.afterStaff < impact.minStaff) return "error";
  if (impact.needsLead && impact.hasLeadBefore && !impact.hasLeadAfter) return "error";
  if (impact.claimerAlreadyScheduled) return "warning";
  if (impact.requesterIsLead && !impact.claimerIsLead && impact.needsLead && !impact.hasLeadAfter) return "warning";
  return "ok";
}

export default function ManagerSwapsPage() {
  const [swaps, setSwaps] = useState<ShiftSwap[]>(() => generateSwaps());
  const [schedule] = useState<ShiftSlot[]>(() => generateSchedule(CYCLE_START, TOTAL_WEEKS));

  const stats = useMemo(() => getSwapStats(swaps), [swaps]);

  const pendingApproval = useMemo(
    () => swaps.filter((s) => s.status === "claimed"),
    [swaps]
  );
  const pendingPeer = useMemo(
    () => swaps.filter((s) => s.status === "pending_peer"),
    [swaps]
  );
  const openSwaps = useMemo(
    () => swaps.filter((s) => s.status === "open"),
    [swaps]
  );
  const resolved = useMemo(
    () =>
      swaps.filter(
        (s) =>
          s.status === "approved" ||
          s.status === "rejected" ||
          s.status === "cancelled"
      ),
    [swaps]
  );

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
            {stats.pendingPeer > 0 && (
              <StatusBadge variant="neutral">
                <UserCheck className="h-3 w-3" />
                {stats.pendingPeer} awaiting peer
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
                    impact={computeSwapImpact(schedule, swap)}
                    onApprove={() => handleApprove(swap.id)}
                    onReject={() => handleReject(swap.id)}
                    highlight
                  />
                ))}
              </div>
            </section>
          )}

          {/* Awaiting Peer Response */}
          {pendingPeer.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Awaiting Peer Response
                </h2>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                  {pendingPeer.length}
                </span>
              </div>
              <div className="space-y-2">
                {pendingPeer.map((swap, i) => (
                  <ManagerSwapCard key={swap.id} swap={swap} index={i} impact={computeSwapImpact(schedule, swap)} />
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
                  <ManagerSwapCard
                    key={swap.id}
                    swap={swap}
                    index={i}
                    impact={computeImpact(schedule, swap)}
                  />
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

function CoverageImpactBadge({ impact }: { impact: CoverageImpact }) {
  const warnings: string[] = [];
  let severity: "ok" | "warning" | "error" = "ok";

  if (impact.afterStaff < impact.minStaff) {
    warnings.push(`Drops to ${impact.afterStaff}/${impact.minStaff} staff`);
    severity = "error";
  }

  if (impact.needsLead && impact.hasLeadBefore && !impact.hasLeadAfter) {
    warnings.push("Loses lead coverage");
    severity = "error";
  }

  if (impact.claimerAlreadyScheduled) {
    warnings.push("Claimer already on this shift");
    severity = severity === "ok" ? "warning" : severity;
  }

  if (impact.requesterIsLead && !impact.claimerIsLead && impact.needsLead) {
    if (impact.hasLeadAfter) {
      // Another lead exists, just note the role change
    } else {
      warnings.push("Lead replaced by staff");
      severity = severity === "ok" ? "warning" : severity;
    }
  }

  const isOk = severity === "ok";
  const afterOk = impact.afterStaff >= impact.minStaff;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 mt-2",
        severity === "ok" && "bg-success/5 border-success/20",
        severity === "warning" && "bg-warning/5 border-warning/20",
        severity === "error" && "bg-destructive/5 border-destructive/20"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {severity === "ok" ? (
          <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
        ) : severity === "warning" ? (
          <AlertTriangle className="h-3 w-3 text-warning flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
        )}
        <span
          className={cn(
            "text-[11px] font-semibold",
            severity === "ok" && "text-success",
            severity === "warning" && "text-warning-foreground",
            severity === "error" && "text-destructive"
          )}
        >
          {isOk ? "No coverage impact" : warnings.length === 1 ? warnings[0] : `${warnings.length} concerns`}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px]">
        {/* Staff count */}
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Staff:</span>
          <span className="font-semibold tabular-nums">{impact.currentStaff}</span>
          <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
          <span
            className={cn(
              "font-semibold tabular-nums",
              afterOk ? "text-success" : "text-destructive"
            )}
          >
            {impact.afterStaff}
          </span>
          <span className="text-muted-foreground">/ {impact.minStaff} min</span>
        </div>

        {/* Lead status */}
        {impact.needsLead && (
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Lead:</span>
            <span
              className={cn(
                "font-semibold",
                impact.hasLeadAfter ? "text-success" : "text-destructive"
              )}
            >
              {impact.hasLeadAfter ? "Covered" : "Missing"}
            </span>
          </div>
        )}
      </div>

      {warnings.length > 1 && (
        <ul className="mt-1.5 space-y-0.5">
          {warnings.map((w, i) => (
            <li key={i} className="text-[10px] text-destructive/80 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-destructive/50" />
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ManagerSwapCard({
  swap,
  index,
  highlight,
  impact,
  onApprove,
  onReject,
}: {
  swap: ShiftSwap;
  index: number;
  highlight?: boolean;
  impact?: CoverageImpact | null;
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
            <ManagerSwapModeBadge mode={swap.mode} />
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

          {/* Trade info */}
          {swap.mode === "trade" && swap.tradeShiftDate && (
            <div className="flex items-center gap-2 mb-2">
              <Repeat2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">In exchange for:</span>
              <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                {swap.tradeShiftType === "day" ? (
                  <Sun className="h-2.5 w-2.5 text-warning" />
                ) : (
                  <Moon className="h-2.5 w-2.5 text-primary" />
                )}
                <span className="text-[10px] font-medium text-foreground">
                  {format(parseISO(swap.tradeShiftDate), "EEE, MMM d")}
                </span>
              </div>
            </div>
          )}

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

          {/* Coverage Impact */}
          {impact && swap.status === "claimed" && (
            <CoverageImpactBadge impact={impact} />
          )}
        </div>

        {/* Status + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SwapStatusBadge status={swap.status} />

          {swap.status === "claimed" && onApprove && onReject && (
            <div className="flex items-center gap-1.5">
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
    pending_peer: { variant: "neutral" as const, icon: Clock, label: "Awaiting Peer" },
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

function ManagerSwapModeBadge({ mode }: { mode: SwapMode }) {
  const config = {
    open: { icon: ArrowLeftRight, label: "Open", className: "bg-muted text-muted-foreground" },
    direct: { icon: UserCheck, label: "Direct", className: "bg-primary/10 text-primary" },
    trade: { icon: Repeat2, label: "Trade", className: "bg-accent/10 text-accent-foreground" },
  }[mode];

  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium", config.className)}>
      <config.icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}
