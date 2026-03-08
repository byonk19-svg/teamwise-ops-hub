import { useMemo, useState } from "react";
import { format, parseISO, isFirstDayOfMonth } from "date-fns";
import { ShiftSlot, getCoverageStatus, getLeadAssignment, getStaffAssignments } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";
import { X, Shield, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ViewBProps {
  slots: ShiftSlot[];
  shiftView: "day" | "night";
  cycleStart: Date;
  totalWeeks: number;
  onClickSlot: (slot: ShiftSlot) => void;
}

export function ScheduleViewB({ slots, shiftView, cycleStart, totalWeeks, onClickSlot }: ViewBProps) {
  const [selectedSlot, setSelectedSlot] = useState<ShiftSlot | null>(null);

  const filtered = useMemo(() => slots.filter((s) => s.type === shiftView), [slots, shiftView]);

  const weeks = useMemo(() => {
    const result: ShiftSlot[][] = [];
    for (let w = 0; w < totalWeeks; w++) {
      result.push(filtered.slice(w * 7, (w + 1) * 7));
    }
    return result;
  }, [filtered, totalWeeks]);

  // Keep selectedSlot in sync with slots state
  const activeSlot = selectedSlot ? slots.find((s) => s.id === selectedSlot.id) || selectedSlot : null;
  const activeLead = activeSlot ? getLeadAssignment(activeSlot) : undefined;
  const activeStaff = activeSlot ? getStaffAssignments(activeSlot) : [];
  const activeStatus = activeSlot ? getCoverageStatus(activeSlot) : "ok";

  return (
    <div className="flex gap-0 h-full">
      {/* Compact Grid */}
      <div className={cn("flex-1 transition-all", activeSlot ? "pr-0" : "")}>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Compact week rows */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((slot) => {
                const status = getCoverageStatus(slot);
                const date = parseISO(slot.date);
                const isSelected = activeSlot?.id === slot.id;
                const monthLabel = isFirstDayOfMonth(date) ? format(date, "MMM") : null;
                const lead = getLeadAssignment(slot);

                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(isSelected ? null : slot)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-left transition-all h-16 flex flex-col justify-between",
                      isSelected && "ring-2 ring-primary shadow-sm",
                      !isSelected && status === "ok" && "bg-card hover:bg-muted/30",
                      !isSelected && status === "warning" && "bg-warning/5 border-warning/30 hover:bg-warning/10",
                      !isSelected && status === "error" && "bg-destructive/5 border-destructive/30 hover:bg-destructive/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-heading font-bold text-sm leading-none">{format(date, "d")}</span>
                        {monthLabel && <span className="text-[9px] text-muted-foreground">{monthLabel}</span>}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold font-heading",
                        status === "ok" ? "text-success" : status === "warning" ? "text-warning-foreground" : "text-destructive"
                      )}>
                        {slot.assignments.length}/{slot.minStaff}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {lead && (
                        <span className="text-[9px] text-primary font-medium truncate">{lead.name}</span>
                      )}
                      {!lead && slot.assignments.length > 0 && (
                        <span className="text-[9px] text-destructive">No lead</span>
                      )}
                      {slot.assignments.length === 0 && (
                        <span className="text-[9px] text-destructive/50">Empty</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {activeSlot && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-l bg-card overflow-hidden flex-shrink-0"
          >
            <div className="w-[280px] p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {activeSlot.type === "day" ? <Sun className="h-3.5 w-3.5 text-warning" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
                    <span className="font-heading font-bold text-sm">
                      {format(parseISO(activeSlot.date), "EEE, MMM d")}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground capitalize">{activeSlot.type} shift</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="p-1 rounded hover:bg-muted">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Status */}
              <div className={cn(
                "rounded-lg px-3 py-2 mb-4 text-xs",
                activeStatus === "ok" && "bg-success/10 text-success",
                activeStatus === "warning" && "bg-warning/10 text-warning-foreground",
                activeStatus === "error" && "bg-destructive/10 text-destructive"
              )}>
                {activeSlot.assignments.length}/{activeSlot.minStaff} staff · {activeStatus === "ok" ? "Fully covered" : activeStatus === "warning" ? "Below minimum" : "Coverage gap"}
              </div>

              {/* Lead */}
              <div className="mb-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Lead</p>
                {activeLead ? (
                  <div className="flex items-center gap-2 rounded-md bg-primary/8 px-2.5 py-2 border border-primary/15">
                    <span
                      className="h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center text-primary-foreground"
                      style={{ backgroundColor: `hsl(${activeLead.color})` }}
                    >
                      {activeLead.initials}
                    </span>
                    <span className="text-sm font-medium text-foreground">{activeLead.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-destructive text-xs bg-destructive/5 rounded-md px-2.5 py-2">
                    <Shield className="h-3.5 w-3.5" /> No lead assigned
                  </div>
                )}
              </div>

              {/* Staff */}
              <div className="mb-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Staff</p>
                {activeStaff.length > 0 ? (
                  <div className="space-y-1">
                    {activeStaff.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 rounded-md px-2.5 py-1.5 border">
                        <span
                          className="h-5 w-5 rounded-full text-[9px] font-bold flex items-center justify-center text-primary-foreground"
                          style={{ backgroundColor: `hsl(${t.color})` }}
                        >
                          {t.initials}
                        </span>
                        <span className="text-sm text-foreground">{t.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No staff assigned</p>
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={() => {
                  onClickSlot(activeSlot);
                }}
                className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 hover:bg-primary/90 transition-colors"
              >
                Edit Assignments
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
