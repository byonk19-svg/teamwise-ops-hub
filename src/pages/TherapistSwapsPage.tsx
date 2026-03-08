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
import { getTherapist } from "@/lib/schedule-data";
import { ShiftSwap, generateSwaps } from "@/lib/swap-data";
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
} from "lucide-react";
import { toast } from "sonner";

const CURRENT_USER_ID = "t5"; // Aleyce

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
  const myClaims = useMemo(
    () => swaps.filter((s) => s.claimedById === CURRENT_USER_ID && s.requesterId !== CURRENT_USER_ID),
    [swaps]
  );

  function handleClaim(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId
          ? {
              ...s,
              status: "claimed" as const,
              claimedById: CURRENT_USER_ID,
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
      prev.map((s) => (s.id === swapId ? { ...s, status: "cancelled" as const } : s))
    );
    toast("Swap request cancelled");
  }

  function handlePost(shiftDate: string, shiftType: "day" | "night", reason: string) {
    const newSwap: ShiftSwap = {
      id: `sw-${Date.now()}`,
      requesterId: CURRENT_USER_ID,
      shiftDate,
      shiftType,
      reason,
      postedAt: new Date().toISOString(),
      status: "open",
    };
    setSwaps((prev) => [newSwap, ...prev]);
    toast.success("Swap posted!", {
      description: `${format(parseISO(shiftDate), "EEE, MMM d")} ${shiftType} shift is now open for pick-up.`,
    });
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
                Post a shift you need covered or pick up an open shift
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowPostDialog(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Post a Swap
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge variant="info">
              <ArrowLeftRight className="h-3 w-3" />
              {openFromOthers.length} available to pick up
            </StatusBadge>
            {myRequests.length > 0 && (
              <StatusBadge variant="neutral">
                {myRequests.length} my {myRequests.length === 1 ? "request" : "requests"}
              </StatusBadge>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 space-y-6">
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
                  <TherapistSwapCard
                    key={swap.id}
                    swap={swap}
                    index={i}
                    onClaim={() => handleClaim(swap.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* My Requests */}
          {myRequests.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  My Requests
                </h2>
              </div>
              <div className="space-y-2">
                {myRequests.map((swap, i) => (
                  <TherapistSwapCard
                    key={swap.id}
                    swap={swap}
                    index={i}
                    isOwn
                    onCancel={swap.status === "open" ? () => handleCancel(swap.id) : undefined}
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
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Shifts I Picked Up
                </h2>
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
      />
    </AppLayout>
  );
}

function TherapistSwapCard({
  swap,
  index,
  isOwn,
  isClaim,
  onClaim,
  onCancel,
}: {
  swap: ShiftSwap;
  index: number;
  isOwn?: boolean;
  isClaim?: boolean;
  onClaim?: () => void;
  onCancel?: () => void;
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
              <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                Lead
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(postedAt, { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-1.5">
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

          {/* Status context */}
          {swap.status === "claimed" && claimer && !isClaim && (
            <p className="text-[11px] text-muted-foreground">
              Picked up by <strong>{claimer.name}</strong> · awaiting manager approval
            </p>
          )}
          {swap.status === "claimed" && isClaim && (
            <p className="text-[11px] text-warning-foreground">
              Awaiting manager approval
            </p>
          )}
          {swap.status === "approved" && (
            <p className="text-[11px] text-success">Swap approved ✓</p>
          )}
          {swap.status === "rejected" && (
            <p className="text-[11px] text-destructive">Swap rejected by manager</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SwapBadge status={swap.status} />

          {swap.status === "open" && !isOwn && onClaim && (
            <Button
              size="sm"
              className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onClaim}
            >
              <Hand className="h-3 w-3" /> Pick Up
            </Button>
          )}

          {swap.status === "open" && isOwn && onCancel && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SwapBadge({ status }: { status: ShiftSwap["status"] }) {
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

function PostSwapDialog({
  open,
  onOpenChange,
  onPost,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPost: (date: string, type: "day" | "night", reason: string) => void;
}) {
  const [shiftType, setShiftType] = useState<"day" | "night">("day");
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("");

  // Generate upcoming shift dates for selection
  const upcomingDates = useMemo(() => {
    const dates: string[] = [];
    const now = new Date();
    for (let d = 1; d <= 14; d++) {
      dates.push(format(addDays(now, d), "yyyy-MM-dd"));
    }
    return dates;
  }, []);

  function handleSubmit() {
    if (!selectedDate || !reason.trim()) return;
    onPost(selectedDate, shiftType, reason.trim());
    setSelectedDate("");
    setReason("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            Post a Shift Swap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shift type */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Shift Type
            </label>
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setShiftType("day")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  shiftType === "day"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="h-3 w-3" /> Day (7a–7p)
              </button>
              <button
                onClick={() => setShiftType("night")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  shiftType === "night"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="h-3 w-3" /> Night (7p–7a)
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Shift Date
            </label>
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

          {/* Reason */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Reason
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {["Medical appointment", "Family event", "Personal day", "Training conflict"].map(
                (preset) => (
                  <button
                    key={preset}
                    onClick={() => setReason(preset)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors",
                      reason === preset
                        ? "bg-primary/10 border-primary/25 text-primary"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {preset}
                  </button>
                )
              )}
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
            disabled={!selectedDate || !reason.trim()}
            onClick={handleSubmit}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Post Swap Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
