import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AssignmentStatus, ASSIGNMENT_STATUSES } from "@/lib/schedule-data";
import { useSchedule } from "@/context/ScheduleContext";
import { cn } from "@/lib/utils";
import { Check, Clock, PhoneOff, PhoneIncoming, PhoneCall } from "lucide-react";

const STATUS_ICONS: Record<AssignmentStatus, React.ReactNode> = {
  active: <Check className="h-3 w-3" />,
  "leave-early": <Clock className="h-3 w-3" />,
  cancelled: <PhoneOff className="h-3 w-3" />,
  "call-in": <PhoneIncoming className="h-3 w-3" />,
  "on-call": <PhoneCall className="h-3 w-3" />,
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
          className="cursor-pointer hover:underline decoration-dotted underline-offset-2"
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-44 p-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
          {therapistName}{isLead ? " (Lead)" : ""}
        </p>
        <div className="space-y-0.5">
          {ASSIGNMENT_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={(e) => {
                e.stopPropagation();
                setAssignmentStatus(slotId, therapistId, s.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors text-left",
                currentStatus === s.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <span className={cn(
                "flex items-center justify-center h-4 w-4",
                currentStatus === s.value ? "text-primary" : s.color
              )}>
                {STATUS_ICONS[s.value]}
              </span>
              {s.label}
              {currentStatus === s.value && (
                <Check className="h-3 w-3 ml-auto text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
