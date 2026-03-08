import { cn } from "@/lib/utils";
import { ShiftSlot, getLeadAssignment, getStaffAssignments, getCoverageStatus } from "@/lib/schedule-data";
import { format, parseISO, isFirstDayOfMonth } from "date-fns";

interface ScheduleDayCellProps {
  slot: ShiftSlot;
  onClick: (slot: ShiftSlot) => void;
}

export function ScheduleDayCell({ slot, onClick }: ScheduleDayCellProps) {
  const status = getCoverageStatus(slot);
  const lead = getLeadAssignment(slot);
  const staff = getStaffAssignments(slot);
  const count = slot.assignments.length;
  const date = parseISO(slot.date);
  const dayNum = format(date, "d");
  const monthLabel = isFirstDayOfMonth(date) ? format(date, "MMM") : null;

  return (
    <button
      onClick={() => onClick(slot)}
      className={cn(
        "flex flex-col items-stretch text-left rounded-lg border p-2.5 min-h-[130px] transition-all hover:ring-2 hover:ring-primary/20 cursor-pointer w-full",
        status === "ok" && "bg-card border-border",
        status === "warning" && "bg-warning/5 border-warning/30",
        status === "error" && "bg-destructive/5 border-destructive/30"
      )}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-baseline gap-1">
          <span className="font-heading font-bold text-sm text-foreground">{dayNum}</span>
          {monthLabel && (
            <span className="text-xs text-muted-foreground">{monthLabel}</span>
          )}
        </div>
        <span
          className={cn(
            "text-[11px] font-semibold font-heading tabular-nums",
            status === "ok" && "text-success",
            status === "warning" && "text-warning-foreground",
            status === "error" && "text-destructive"
          )}
        >
          {count}/{slot.minStaff}
        </span>
      </div>

      {/* Lead */}
      {lead ? (
        <div className="rounded-md bg-primary/10 px-2 py-1 mb-1.5">
          <span className="text-[10px] text-muted-foreground">Lead:</span>
          <p className="text-xs font-medium text-primary">{lead.name}</p>
        </div>
      ) : slot.needsLead && count > 0 ? (
        <div className="rounded-md bg-destructive/10 px-2 py-1 mb-1.5">
          <p className="text-[10px] font-medium text-destructive">No lead</p>
        </div>
      ) : null}

      {/* Staff */}
      {staff.length > 0 ? (
        <div className="space-y-0.5 flex-1">
          {staff.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-primary-foreground flex-shrink-0"
                style={{ backgroundColor: `hsl(${t.color})` }}
              >
                {t.initials}
              </span>
              <span className="text-[11px] text-foreground truncate">{t.name}</span>
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] text-destructive/60 text-center leading-tight">
            No eligible<br />therapists
          </p>
        </div>
      ) : null}
    </button>
  );
}
