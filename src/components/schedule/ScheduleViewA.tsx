import { useMemo, useState } from "react";
import { format, parseISO, addDays, startOfWeek, addWeeks } from "date-fns";
import { ShiftSlot, getCoverageStatus, getLeadAssignment, getStaffAssignments } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ViewAProps {
  slots: ShiftSlot[];
  shiftView: "day" | "night";
  cycleStart: Date;
  totalWeeks: number;
  onClickSlot: (slot: ShiftSlot) => void;
}

export function ScheduleViewA({ slots, shiftView, cycleStart, totalWeeks, onClickSlot }: ViewAProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const filtered = useMemo(() => slots.filter((s) => s.type === shiftView), [slots, shiftView]);

  // Mini overview data - all weeks
  const weekSummaries = useMemo(() => {
    return Array.from({ length: totalWeeks }, (_, w) => {
      const weekSlots = filtered.slice(w * 7, (w + 1) * 7);
      const issues = weekSlots.filter((s) => getCoverageStatus(s) !== "ok").length;
      return { weekSlots, issues };
    });
  }, [filtered, totalWeeks]);

  // Current week slots
  const currentWeek = weekSummaries[weekOffset]?.weekSlots || [];
  const weekStart = addWeeks(startOfWeek(cycleStart, { weekStartsOn: 0 }), weekOffset);

  return (
    <div className="flex flex-col gap-4">
      {/* Mini 6-week strip */}
      <div className="flex gap-1 items-end px-1">
        {weekSummaries.map((ws, i) => (
          <button
            key={i}
            onClick={() => setWeekOffset(i)}
            className={cn(
              "flex-1 rounded-md p-2 transition-all text-center",
              i === weekOffset
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
          >
            <p className="text-[9px] font-medium">Wk {i + 1}</p>
            <div className="flex justify-center gap-px mt-1">
              {ws.weekSlots.map((s) => {
                const st = getCoverageStatus(s);
                return (
                  <span
                    key={s.id}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      st === "ok" && "bg-success",
                      st === "warning" && (i === weekOffset ? "bg-warning" : "bg-warning/60"),
                      st === "error" && (i === weekOffset ? "bg-destructive" : "bg-destructive/60")
                    )}
                  />
                );
              })}
            </div>
            {ws.issues > 0 && (
              <p className={cn("text-[8px] mt-0.5 font-medium", i === weekOffset ? "text-primary-foreground/80" : "text-destructive")}>
                {ws.issues} issue{ws.issues > 1 ? "s" : ""}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          disabled={weekOffset === 0}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-heading font-semibold text-sm">
          {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <button
          onClick={() => setWeekOffset(Math.min(totalWeeks - 1, weekOffset + 1))}
          disabled={weekOffset === totalWeeks - 1}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Rich day cells */}
      <motion.div
        key={weekOffset}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-7 gap-3"
      >
        {currentWeek.map((slot) => {
          const status = getCoverageStatus(slot);
          const lead = getLeadAssignment(slot);
          const staff = getStaffAssignments(slot);
          const date = parseISO(slot.date);

          return (
            <button
              key={slot.id}
              onClick={() => onClickSlot(slot)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all hover:ring-2 hover:ring-primary/20 min-h-[160px] flex flex-col",
                status === "ok" && "bg-card",
                status === "warning" && "bg-warning/5 border-warning/30",
                status === "error" && "bg-destructive/5 border-destructive/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-base">{format(date, "d")}</span>
                <span className={cn(
                  "text-xs font-semibold font-heading",
                  status === "ok" ? "text-success" : status === "warning" ? "text-warning-foreground" : "text-destructive"
                )}>
                  {slot.assignments.length}/{slot.minStaff}
                </span>
              </div>
              {lead && (
                <div className="rounded-md bg-primary/10 px-2 py-1.5 mb-2">
                  <p className="text-[10px] text-muted-foreground">Lead</p>
                  <p className="text-xs font-semibold text-primary">{lead.name}</p>
                </div>
              )}
              {!lead && slot.assignments.length > 0 && (
                <div className="rounded-md bg-destructive/10 px-2 py-1 mb-2">
                  <p className="text-[10px] font-medium text-destructive">No lead assigned</p>
                </div>
              )}
              <div className="space-y-1 flex-1">
                {staff.map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5">
                    <span
                      className="h-4 w-4 rounded-full text-[8px] font-bold flex items-center justify-center text-primary-foreground flex-shrink-0"
                      style={{ backgroundColor: `hsl(${t.color})` }}
                    >
                      {t.initials}
                    </span>
                    <span className="text-xs text-foreground">{t.name}</span>
                  </div>
                ))}
              </div>
              {slot.assignments.length === 0 && (
                <p className="text-[10px] text-destructive/50 text-center flex-1 flex items-center justify-center">Unassigned</p>
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}


