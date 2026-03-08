import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AssignmentStatus, ASSIGNMENT_STATUSES, THERAPISTS, Therapist, getTherapist } from "@/lib/schedule-data";
import { useSchedule } from "@/context/ScheduleContext";
import { cn } from "@/lib/utils";
import { Check, Clock, PhoneOff, PhoneIncoming, PhoneCall, CircleCheck, Shield, ArrowRight } from "lucide-react";

const STATUS_ICONS: Record<AssignmentStatus, React.ReactNode> = {
  active: <CircleCheck className="h-3.5 w-3.5" />,
  "leave-early": <Clock className="h-3.5 w-3.5" />,
  cancelled: <PhoneOff className="h-3.5 w-3.5" />,
  "call-in": <PhoneIncoming className="h-3.5 w-3.5" />,
  "on-call": <PhoneCall className="h-3.5 w-3.5" />,
};

const STATUS_COLORS: Record<AssignmentStatus, { bg: string; text: string; icon: string }> = {
  active: { bg: "bg-success/10", text: "text-success", icon: "text-success" },
  "leave-early": { bg: "bg-warning/10", text: "text-warning-foreground", icon: "text-warning-foreground" },
  cancelled: { bg: "bg-destructive/10", text: "text-destructive", icon: "text-destructive" },
  "call-in": { bg: "bg-destructive/10", text: "text-destructive", icon: "text-destructive" },
  "on-call": { bg: "bg-muted", text: "text-muted-foreground", icon: "text-muted-foreground" },
};

interface AssignmentStatusPopoverProps {
  slotId: string;
  therapistId: string;
  therapistName: string;
  currentStatus: AssignmentStatus;
  isLead?: boolean;
  /** IDs of therapists already assigned to this slot */
  assignedIds?: string[];
  children: React.ReactNode;
}

export function AssignmentStatusPopover({
  slotId,
  therapistId,
  therapistName,
  currentStatus,
  isLead,
  assignedIds = [],
  children,
}: AssignmentStatusPopoverProps) {
  const { setAssignmentStatus, replaceLead } = useSchedule();
  const [open, setOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AssignmentStatus | null>(null);

  // The effective status shown (pending or current)
  const effectiveStatus = pendingStatus ?? currentStatus;
  const showReplaceLead = isLead && (effectiveStatus === "cancelled" || effectiveStatus === "call-in");

  // Available replacement leads: lead-role therapists not already on this shift (or cancelled/call-in)
  const replacementLeads = THERAPISTS.filter(
    (t) => t.role === "lead" && t.id !== therapistId && !assignedIds.includes(t.id)
  );

  const handleStatusClick = (status: AssignmentStatus) => {
    if (isLead && (status === "cancelled" || status === "call-in")) {
      // Don't close yet — show replacement picker
      setAssignmentStatus(slotId, therapistId, status);
      setPendingStatus(status);
    } else {
      setAssignmentStatus(slotId, therapistId, status);
      setPendingStatus(null);
      setOpen(false);
    }
  };

  const handleReplace = (replacementId: string) => {
    replaceLead(slotId, therapistId, replacementId);
    setPendingStatus(null);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setPendingStatus(null);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              e.preventDefault();
              setOpen(true);
            }
          }}
          className="cursor-pointer"
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className={cn("p-2 rounded-xl shadow-lg border-border/60", showReplaceLead ? "w-56" : "w-48")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-2 pb-2 mb-1 border-b border-border/50">
          <span className="text-xs font-semibold text-foreground">{therapistName}</span>
          {isLead && (
            <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Lead</span>
          )}
        </div>

        {/* Status options */}
        <div className="space-y-0.5">
          {ASSIGNMENT_STATUSES.map((s) => {
            const colors = STATUS_COLORS[s.value];
            const isSelected = effectiveStatus === s.value;
            return (
              <button
                key={s.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusClick(s.value);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-[11px] font-medium transition-all text-left",
                  isSelected
                    ? cn(colors.bg, colors.text)
                    : "hover:bg-muted/60 text-foreground/80"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center",
                  isSelected ? colors.icon : "text-muted-foreground/60"
                )}>
                  {STATUS_ICONS[s.value]}
                </span>
                <span className="flex-1">{s.label}</span>
                {isSelected && (
                  <Check className="h-3 w-3 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Replace lead section */}
        {showReplaceLead && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 px-2 pb-1.5">
              <Shield className="h-3 w-3 text-primary/60" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Replace Lead</span>
            </div>
            {replacementLeads.length > 0 ? (
              <div className="space-y-0.5">
                {replacementLeads.map((t) => (
                  <button
                    key={t.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplace(t.id);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-[11px] font-medium transition-all text-left hover:bg-primary/8 text-foreground/80 hover:text-primary"
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-primary-foreground flex-shrink-0"
                      style={{ backgroundColor: `hsl(${t.color})` }}
                    >
                      {t.initials}
                    </span>
                    <span className="flex-1">{t.name}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground/60 px-2 py-1 italic">No leads available</p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPendingStatus(null);
                setOpen(false);
              }}
              className="w-full mt-1 rounded-lg px-2 py-1.5 text-[10px] text-muted-foreground hover:bg-muted/60 transition-colors text-center"
            >
              Skip — no replacement
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Small inline pill for non-active statuses shown on the grid */
export function StatusPill({ status }: { status: AssignmentStatus }) {
  if (status === "active") return null;
  const meta = ASSIGNMENT_STATUSES.find((s) => s.value === status);
  const colors = STATUS_COLORS[status];
  if (!meta) return null;

  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[7px] font-semibold uppercase tracking-wide leading-none",
      colors.bg, colors.text
    )}>
      {meta.label}
    </span>
  );
}
