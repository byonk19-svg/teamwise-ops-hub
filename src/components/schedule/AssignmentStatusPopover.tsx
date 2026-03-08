import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AssignmentStatus, ASSIGNMENT_STATUSES } from "@/lib/schedule-data";
import { useSchedule } from "@/context/ScheduleContext";
import { cn } from "@/lib/utils";
import { Check, Clock, PhoneOff, PhoneIncoming, PhoneCall, CircleCheck } from "lucide-react";

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
  children: React.ReactNode;
}

export function AssignmentStatusPopover({
  slotId,
  therapistId,
  therapistName,
  currentStatus,
  isLead,
  children,
}: AssignmentStatusPopoverProps) {
  const { setAssignmentStatus } = useSchedule();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        className="w-48 p-2 rounded-xl shadow-lg border-border/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-2 pb-2 mb-1 border-b border-border/50">
          <span className="text-xs font-semibold text-foreground">{therapistName}</span>
          {isLead && (
            <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Lead</span>
          )}
        </div>
        <div className="space-y-0.5">
          {ASSIGNMENT_STATUSES.map((s) => {
            const colors = STATUS_COLORS[s.value];
            const isSelected = currentStatus === s.value;
            return (
              <button
                key={s.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignmentStatus(slotId, therapistId, s.value);
                  setOpen(false);
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
