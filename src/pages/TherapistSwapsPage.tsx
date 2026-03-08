import { useState, useMemo } from "react";
import { format, parseISO, formatDistanceToNow, addDays } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getTherapist, THERAPISTS, generateSchedule, ShiftSlot } from "@/lib/schedule-data";
import { ShiftSwap, SwapMode, generateSwaps, getSwapModeLabel } from "@/lib/swap-data";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Sun,
  Moon,
  Hand,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Inbox,
  UserCheck,
  Repeat2,
  Send,
  Users,
  ArrowRight,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const CURRENT_USER_ID = "t5"; // Aleyce
const SCHEDULE_CYCLE_START = new Date(2026, 2, 22);

export default function TherapistSwapsPage() {
  const [swaps, setSwaps] = useState<ShiftSwap[]>(() => generateSwaps());
  const [showPostDialog, setShowPostDialog] = useState(false);

  const myRequests = useMemo(
    () => swaps.filter((s) => s.requesterId === CURRENT_USER_ID),
    [swaps]
  );
  const openFromOthers = useMemo(
    () => swaps.filter((s) => s.status === "open" && s.requesterId !== CURRENT_USER_ID),
    [swaps]
  );
  const directToMe = useMemo(
    () => swaps.filter((s) => s.targetId === CURRENT_USER_ID && s.status === "pending_peer" && s.requesterId !== CURRENT_USER_ID),
    [swaps]
  );
  const myClaims = useMemo(
    () => swaps.filter((s) => s.claimedById === CURRENT_USER_ID && s.requesterId !== CURRENT_USER_ID),
    [swaps]
  );

  function handleClaim(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId
          ? { ...s, status: "claimed" as const, claimedById: CURRENT_USER_ID, claimedAt: new Date().toISOString() }
          : s
      )
    );
    toast.success("Shift claimed!", { description: "Waiting for manager approval." });
  }

  function handleAcceptDirect(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId
          ? { ...s, status: "claimed" as const, claimedById: CURRENT_USER_ID, claimedAt: new Date().toISOString() }
          : s
      )
    );
    toast.success("Request accepted!", { description: "Sent to manager for approval." });
  }

  function handleDeclineDirect(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) => (s.id === swapId ? { ...s, status: "rejected" as const } : s))
    );
    toast("Request declined");
  }

  function handleCancel(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) => (s.id === swapId ? { ...s, status: "cancelled" as const } : s))
    );
    toast("Swap request cancelled");
  }

  function handlePost(swap: Omit<ShiftSwap, "id" | "postedAt">) {
    const newSwap: ShiftSwap = {
      ...swap,
      id: `sw-${Date.now()}`,
      postedAt: new Date().toISOString(),
    };
    setSwaps((prev) => [newSwap, ...prev]);

    const dateLabel = format(parseISO(swap.shiftDate), "EEE, MMM d");
    if (swap.mode === "open") {
      toast.success("Swap posted!", { description: `${dateLabel} ${swap.shiftType} shift is now open for pick-up.` });
    } else if (swap.mode === "direct") {
      const target = getTherapist(swap.targetId!);
      toast.success("Request sent!", { description: `Waiting for ${target?.name} to accept.` });
    } else {
      const target = getTherapist(swap.targetId!);
      toast.success("Trade proposed!", { description: `Waiting for ${target?.name} to accept the trade.` });
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
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
                Post a shift you need covered, request a specific person, or propose a trade
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowPostDialog(true)}
            >
              <Plus className="h-3.5 w-3.5" /> New Swap
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {directToMe.length > 0 && (
              <StatusBadge variant="warning">
                <UserCheck className="h-3 w-3" />
                {directToMe.length} request{directToMe.length > 1 ? "s" : ""} for you
              </StatusBadge>
            )}
            <StatusBadge variant="info">
              <ArrowLeftRight className="h-3 w-3" />
              {openFromOthers.length} open
            </StatusBadge>
            {myRequests.length > 0 && (
              <StatusBadge variant="neutral">
                {myRequests.length} my {myRequests.length === 1 ? "request" : "requests"}
              </StatusBadge>
            )}
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto p-5 space-y-6">
          {/* Requests directed to me */}
          {directToMe.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-4 w-4 text-warning" />
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Requests for You
                </h2>
                <span className="text-[10px] bg-warning/10 text-warning-foreground px-2 py-0.5 rounded-full font-medium">
                  {directToMe.length}
                </span>
              </div>
              <div className="space-y-2">
                {directToMe.map((swap, i) => (
                  <TherapistSwapCard
                    key={swap.id}
                    swap={swap}
                    index={i}
                    isTargeted
                    onAccept={() => handleAcceptDirect(swap.id)}
                    onDecline={() => handleDeclineDirect(swap.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Available to Pick Up */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Hand className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-sm font-semibold text-foreground">
                Available to Pick Up
              </h2>
              {openFromOthers.length > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {openFromOthers.length}
                </span>
              )}
            </div>
            {openFromOthers.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 py-8 flex flex-col items-center text-center">
                <Inbox className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No open swaps right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {openFromOthers.map((swap, i) => (
                  <TherapistSwapCard key={swap.id} swap={swap} index={i} onClaim={() => handleClaim(swap.id)} />
                ))}
              </div>
            )}
          </section>

          {/* My Requests */}
          {myRequests.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-heading text-sm font-semibold text-foreground">My Requests</h2>
              </div>
              <div className="space-y-2">
                {myRequests.map((swap, i) => (
                  <TherapistSwapCard
                    key={swap.id}
                    swap={swap}
                    index={i}
                    isOwn
                    onCancel={swap.status === "open" || swap.status === "pending_peer" ? () => handleCancel(swap.id) : undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* My Claims */}
          {myClaims.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-heading text-sm font-semibold text-foreground">Shifts I Picked Up</h2>
              </div>
              <div className="space-y-2">
                {myClaims.map((swap, i) => (
                  <TherapistSwapCard key={swap.id} swap={swap} index={i} isClaim />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <PostSwapDialog
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
        onPost={handlePost}
        currentUserId={CURRENT_USER_ID}
      />
    </AppLayout>
  );
}

function TherapistSwapCard({
  swap,
  index,
  isOwn,
  isClaim,
  isTargeted,
  onClaim,
  onCancel,
  onAccept,
  onDecline,
}: {
  swap: ShiftSwap;
  index: number;
  isOwn?: boolean;
  isClaim?: boolean;
  isTargeted?: boolean;
  onClaim?: () => void;
  onCancel?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const requester = getTherapist(swap.requesterId);
  const claimer = swap.claimedById ? getTherapist(swap.claimedById) : null;
  const target = swap.targetId ? getTherapist(swap.targetId) : null;
  const shiftDate = parseISO(swap.shiftDate);
  const postedAt = parseISO(swap.postedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        isTargeted && "border-warning/30 bg-warning/3",
        swap.status === "open" && !isOwn && "border-primary/15 hover:border-primary/25",
        swap.status === "claimed" && "border-warning/20",
        swap.status === "approved" && "border-success/20",
        (swap.status === "rejected" || swap.status === "cancelled") && "opacity-50"
      )}
    >
      <div className="flex items-start gap-4">
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
              {isOwn ? "You" : requester?.name}
            </span>
            {requester?.role === "lead" && !isOwn && (
              <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">Lead</span>
            )}
            <SwapModeBadge mode={swap.mode} />
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(postedAt, { addSuffix: true })}
            </span>
          </div>

          {/* Shift info */}
          <div className="flex items-center gap-3 mb-1.5">
            <ShiftPill date={swap.shiftDate} type={swap.shiftType} />
            <span className="text-xs text-muted-foreground">{swap.reason}</span>
          </div>

          {/* Trade info */}
          {swap.mode === "trade" && swap.tradeShiftDate && (
            <div className="flex items-center gap-2 mb-1.5">
              <Repeat2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">In exchange for:</span>
              <ShiftPill date={swap.tradeShiftDate} type={swap.tradeShiftType!} small />
            </div>
          )}

          {/* Direct target */}
          {swap.mode === "direct" && target && swap.status === "pending_peer" && !isTargeted && (
            <p className="text-[11px] text-muted-foreground">
              Requested <strong>{target.name}</strong> — waiting for response
            </p>
          )}
          {isTargeted && (
            <p className="text-[11px] text-warning-foreground font-medium">
              {swap.mode === "trade" ? "Wants to trade shifts with you" : "Wants you to cover this shift"}
            </p>
          )}

          {/* Claimed/status context */}
          {swap.status === "claimed" && claimer && !isClaim && !isOwn && (
            <p className="text-[11px] text-muted-foreground">
              {claimer.name} accepted · awaiting manager approval
            </p>
          )}
          {swap.status === "claimed" && isOwn && claimer && (
            <p className="text-[11px] text-muted-foreground">
              {claimer.name} accepted · awaiting manager approval
            </p>
          )}
          {swap.status === "claimed" && isClaim && (
            <p className="text-[11px] text-warning-foreground">Awaiting manager approval</p>
          )}
          {swap.status === "approved" && (
            <p className="text-[11px] text-success">Swap approved ✓</p>
          )}
          {swap.status === "rejected" && (
            <p className="text-[11px] text-destructive">
              {swap.mode !== "open" ? "Declined" : "Rejected by manager"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SwapStatusBadge status={swap.status} />

          {/* Targeted: accept/decline */}
          {isTargeted && onAccept && onDecline && (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onDecline}>
                Decline
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onAccept}
              >
                <CheckCircle2 className="h-3 w-3" /> Accept
              </Button>
            </div>
          )}

          {/* Open: pick up */}
          {swap.status === "open" && !isOwn && onClaim && (
            <Button
              size="sm"
              className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onClaim}
            >
              <Hand className="h-3 w-3" /> Pick Up
            </Button>
          )}

          {/* Own: cancel */}
          {(swap.status === "open" || swap.status === "pending_peer") && isOwn && onCancel && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShiftPill({ date, type, small }: { date: string; type: "day" | "night"; small?: boolean }) {
  const parsed = parseISO(date);
  return (
    <div className={cn("flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1", small && "px-2 py-0.5")}>
      {type === "day" ? (
        <Sun className={cn("text-warning", small ? "h-2.5 w-2.5" : "h-3 w-3")} />
      ) : (
        <Moon className={cn("text-primary", small ? "h-2.5 w-2.5" : "h-3 w-3")} />
      )}
      <span className={cn("font-medium text-foreground", small ? "text-[10px]" : "text-xs")}>
        {format(parsed, "EEE, MMM d")}
      </span>
      <span className={cn("text-muted-foreground", small ? "text-[9px]" : "text-[10px]")}>
        · {type === "day" ? "7a–7p" : "7p–7a"}
      </span>
    </div>
  );
}

function SwapModeBadge({ mode }: { mode: SwapMode }) {
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

function SwapStatusBadge({ status }: { status: ShiftSwap["status"] }) {
  const config = {
    open: { variant: "info" as const, icon: ArrowLeftRight, label: "Open" },
    pending_peer: { variant: "warning" as const, icon: Clock, label: "Awaiting Response" },
    claimed: { variant: "warning" as const, icon: Clock, label: "Pending Approval" },
    approved: { variant: "success" as const, icon: CheckCircle2, label: "Approved" },
    rejected: { variant: "error" as const, icon: XCircle, label: "Declined" },
    cancelled: { variant: "neutral" as const, icon: XCircle, label: "Cancelled" },
  }[status];

  return (
    <StatusBadge variant={config.variant}>
      <config.icon className="h-3 w-3" />
      {config.label}
    </StatusBadge>
  );
}

// ─── Post Swap Dialog ────────────────────────────────────────────────────────

function PostSwapDialog({
  open,
  onOpenChange,
  onPost,
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPost: (swap: Omit<ShiftSwap, "id" | "postedAt">) => void;
  currentUserId: string;
}) {
  const [mode, setMode] = useState<SwapMode>("open");
  const [shiftType, setShiftType] = useState<"day" | "night">("day");
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("");
  const [targetId, setTargetId] = useState("");
  const [tradeDate, setTradeDate] = useState("");
  const [tradeType, setTradeType] = useState<"day" | "night">("day");

  const teammates = useMemo(
    () => THERAPISTS.filter((t) => t.id !== currentUserId),
    [currentUserId]
  );

  const schedule = useMemo(
    () => generateSchedule(SCHEDULE_CYCLE_START, 6),
    []
  );

  const upcomingDates = useMemo(() => {
    const dates: string[] = [];
    const base = SCHEDULE_CYCLE_START;
    for (let d = 0; d < 42; d++) {
      dates.push(format(addDays(base, d), "yyyy-MM-dd"));
    }
    return dates;
  }, []);

  function reset() {
    setMode("open");
    setShiftType("day");
    setSelectedDate("");
    setReason("");
    setTargetId("");
    setTradeDate("");
    setTradeType("day");
  }

  function handleSubmit() {
    if (!selectedDate || !reason.trim()) return;
    if ((mode === "direct" || mode === "trade") && !targetId) return;
    if (mode === "trade" && !tradeDate) return;

    const swap: Omit<ShiftSwap, "id" | "postedAt"> = {
      mode,
      requesterId: currentUserId,
      shiftDate: selectedDate,
      shiftType,
      reason: reason.trim(),
      status: mode === "open" ? "open" : "pending_peer",
      ...(mode !== "open" && { targetId }),
      ...(mode === "trade" && { tradeShiftDate: tradeDate, tradeShiftType: tradeType }),
    };

    onPost(swap);
    reset();
    onOpenChange(false);
  }

  const canSubmit =
    selectedDate &&
    reason.trim() &&
    (mode === "open" || targetId) &&
    (mode !== "trade" || tradeDate);

  const modes: { key: SwapMode; icon: typeof ArrowLeftRight; label: string; desc: string }[] = [
    { key: "open", icon: ArrowLeftRight, label: "Open Board", desc: "Anyone can pick up" },
    { key: "direct", icon: UserCheck, label: "Direct Request", desc: "Ask a specific person" },
    { key: "trade", icon: Repeat2, label: "Mutual Trade", desc: "Swap shifts with someone" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            New Swap Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Mode Selection */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Swap Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    mode === m.key
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/20 hover:bg-muted/50"
                  )}
                >
                  <m.icon className={cn("h-4 w-4 mb-1.5", mode === m.key ? "text-primary" : "text-muted-foreground")} />
                  <p className="text-xs font-medium text-foreground">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Your Shift */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              {mode === "trade" ? "Your Shift (giving up)" : "Shift to Cover"}
            </label>
            <div className="flex rounded-lg border overflow-hidden mb-2">
              <button
                onClick={() => setShiftType("day")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  shiftType === "day" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="h-3 w-3" /> Day
              </button>
              <button
                onClick={() => setShiftType("night")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  shiftType === "night" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="h-3 w-3" /> Night
              </button>
            </div>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select a date..." />
              </SelectTrigger>
              <SelectContent>
                {upcomingDates.map((d) => (
                  <SelectItem key={d} value={d}>
                    {format(parseISO(d), "EEEE, MMM d")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Person (direct & trade) */}
          {mode !== "open" && (
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                {mode === "direct" ? "Request From" : "Trade With"}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {teammates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTargetId(t.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors text-left",
                      targetId === t.id
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/20 hover:bg-muted/50"
                    )}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-primary-foreground flex-shrink-0"
                      style={{ backgroundColor: `hsl(${t.color})` }}
                    >
                      {t.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{t.name}</p>
                      {t.role === "lead" && (
                        <p className="text-[9px] text-primary">Lead</p>
                      )}
                    </div>
                    {targetId === t.id && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trade: Their shift (what you want) */}
          {mode === "trade" && (
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                Their Shift (you'll take)
              </label>
              <div className="flex rounded-lg border overflow-hidden mb-2">
                <button
                  onClick={() => setTradeType("day")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                    tradeType === "day" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="h-3 w-3" /> Day
                </button>
                <button
                  onClick={() => setTradeType("night")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                    tradeType === "night" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="h-3 w-3" /> Night
                </button>
              </div>
              <Select value={tradeDate} onValueChange={setTradeDate}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select their shift date..." />
                </SelectTrigger>
                <SelectContent>
                  {upcomingDates.map((d) => (
                    <SelectItem key={d} value={d}>
                      {format(parseISO(d), "EEEE, MMM d")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Reason
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {["Medical appointment", "Family event", "Personal day", "Training conflict"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setReason(preset)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors",
                    reason === preset ? "bg-primary/10 border-primary/25 text-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Or type a custom reason..."
              className="text-sm"
              maxLength={60}
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <Send className="h-3.5 w-3.5" />
            {mode === "open" && "Post to Open Board"}
            {mode === "direct" && "Send Request"}
            {mode === "trade" && "Propose Trade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
