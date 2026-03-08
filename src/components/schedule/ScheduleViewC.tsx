import { useMemo } from "react";
import { format, parseISO, isFirstDayOfMonth } from "date-fns";
import { ShiftSlot, getCoverageStatus, getLeadAssignment, getStaffAssignments } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type StaffDisplayMode = "initials" | "dots" | "text";

interface ViewCProps {
  slots: ShiftSlot[];
  shiftView: "day" | "night";
  cycleStart: Date;
  totalWeeks: number;
  staffDisplay: StaffDisplayMode;
  onClickSlot: (slot: ShiftSlot) => void;
}

export function ScheduleViewC({ slots, shiftView, cycleStart, totalWeeks, staffDisplay, onClickSlot }: ViewCProps) {
  const filtered = useMemo(() => slots.filter((s) => s.type === shiftView), [slots, shiftView]);

  const weeks = useMemo(() => {
    const result: ShiftSlot[][] = [];
    for (let w = 0; w < totalWeeks; w++) {
      result.push(filtered.slice(w * 7, (w + 1) * 7));
    }
    return result;
  }, [filtered, totalWeeks]);

  return (
    <div>
      {/* Day headers - sticky */}
      <div className="grid grid-cols-7 gap-2.5 mb-2 sticky top-0 bg-background z-10 py-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="space-y-3">
        {weeks.map((week, wi) => (
          <div key={wi}>
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5 pl-0.5">
              Week {wi + 1}
            </p>
            <div className="grid grid-cols-7 gap-2.5">
              {week.map((slot) => {
                const status = getCoverageStatus(slot);
                const lead = getLeadAssignment(slot);
                const staff = getStaffAssignments(slot);
                const date = parseISO(slot.date);
                const monthLabel = isFirstDayOfMonth(date) ? format(date, "MMM") : null;

                return (
                  <button
                    key={slot.id}
                    onClick={() => onClickSlot(slot)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all hover:ring-2 hover:ring-primary/20",
                      status === "ok" && "bg-card",
                      status === "warning" && "bg-warning/5 border-warning/30",
                      status === "error" && "bg-destructive/5 border-destructive/30"
                    )}
                  >
                    {/* Date */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading font-bold text-sm">{format(date, "d")}</span>
                        {monthLabel && <span className="text-[9px] text-muted-foreground">{monthLabel}</span>}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold font-heading",
                        status === "ok" ? "text-success" : status === "warning" ? "text-warning-foreground" : "text-destructive"
                      )}>
                        {slot.assignments.length}/{slot.minStaff}
                      </span>
                    </div>

                    {/* Lead */}
                    {lead ? (
                      <div className="rounded bg-primary/10 px-1.5 py-1 mb-1.5">
                        <p className="text-[9px] text-muted-foreground leading-none">Lead:</p>
                        <p className="text-[11px] font-medium text-primary">{lead.name}</p>
                      </div>
                    ) : slot.assignments.length > 0 ? (
                      <div className="rounded bg-destructive/10 px-1.5 py-1 mb-1.5">
                        <p className="text-[9px] font-medium text-destructive">No lead</p>
                      </div>
                    ) : null}

                    {/* Staff - 3 display modes */}
                    {staffDisplay === "initials" && (
                      <div className="space-y-0.5">
                        {staff.map((t) => (
                          <div key={t.id} className="flex items-center gap-1">
                            <span
                              className="h-3.5 w-3.5 rounded-full text-[7px] font-bold flex items-center justify-center text-primary-foreground flex-shrink-0"
                              style={{ backgroundColor: `hsl(${t.color})` }}
                            >
                              {t.initials}
                            </span>
                            <span className="text-[10px] text-foreground truncate">{t.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {staffDisplay === "dots" && (
                      <div className="space-y-0.5">
                        {staff.map((t) => (
                          <div key={t.id} className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `hsl(${t.color})` }}
                            />
                            <span className="text-[10px] text-foreground truncate">{t.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {staffDisplay === "text" && staff.length > 0 && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {staff.map((t) => t.name).join(", ")}
                      </p>
                    )}

                    {slot.assignments.length === 0 && (
                      <p className="text-[9px] text-destructive/40 mt-1">Unassigned</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
