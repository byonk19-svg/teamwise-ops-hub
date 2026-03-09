import { useMemo, useState } from "react";
import {
  format,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { useSchedule } from "@/context/ScheduleContext";
import { AssignmentStatus, ASSIGNMENT_STATUSES } from "@/lib/schedule-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sun, Moon, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const CURRENT_USER_ID = "t5";
const INACTIVE: AssignmentStatus[] = ["cancelled", "call-in", "on-call"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TherapistSchedulePage() {
  const { slots, cycleStart, totalWeeks } = useSchedule();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const cycleEnd = addDays(addWeeks(cycleStart, totalWeeks), -1);

  // Build a map of date -> shifts for quick lookup
  const shiftMap = useMemo(() => {
    const map = new Map<
      string,
      { type: "day" | "night"; status: AssignmentStatus; slotId: string }[]
    >();
    for (const s of slots) {
      const assignment = s.assignments.find((a) => a.therapistId === CURRENT_USER_ID);
      if (!assignment) continue;
      const key = s.date;
      const existing = map.get(key) || [];
      existing.push({
        type: s.type,
        status: assignment.status ?? "active",
        slotId: s.id,
      });
      map.set(key, existing);
    }
    return map;
  }, [slots]);

  // Calendar days for grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Stats for current month
  const monthStats = useMemo(() => {
    let total = 0;
    let dayShifts = 0;
    let nightShifts = 0;
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    shiftMap.forEach((shifts, dateStr) => {
      const date = parseISO(dateStr);
      if (date >= monthStart && date <= monthEnd) {
        for (const s of shifts) {
          if (!INACTIVE.includes(s.status)) {
            total++;
            if (s.type === "day") dayShifts++;
            else nightShifts++;
          }
        }
      }
    });

    return { total, dayShifts, nightShifts };
  }, [shiftMap, currentMonth]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 sm:px-6 pt-5 pb-4 border-b bg-card flex-shrink-0"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground tracking-tight mb-0.5">
                My Schedule
              </h1>
              <p className="text-xs text-muted-foreground">
                {format(cycleStart, "MMM d")} – {format(cycleEnd, "MMM d, yyyy")} cycle
              </p>
            </div>
          </div>

          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-heading text-base font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto p-4 sm:p-5 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card className="p-3 text-center bg-card">
              <p className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                {monthStats.total}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Total Shifts</p>
            </Card>
            <Card className="p-3 text-center bg-card">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Sun className="h-3.5 w-3.5 text-warning-foreground" />
                <p className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                  {monthStats.dayShifts}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Day Shifts</p>
            </Card>
            <Card className="p-3 text-center bg-card">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Moon className="h-3.5 w-3.5 text-primary" />
                <p className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                  {monthStats.nightShifts}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Night Shifts</p>
            </Card>
          </div>

          {/* Calendar grid */}
          <Card className="overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b bg-muted/50">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const shifts = shiftMap.get(dateKey) || [];
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const hasShift = shifts.length > 0;
                const hasActiveShift = shifts.some((s) => !INACTIVE.includes(s.status));

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "relative min-h-[4.5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 border-b border-r transition-colors",
                      idx % 7 === 0 && "border-l-0",
                      !inMonth && "bg-muted/20",
                      today && "bg-primary/[0.04]",
                      hasActiveShift && inMonth && "bg-success/[0.04]"
                    )}
                  >
                    {/* Date number */}
                    <div className="flex justify-end">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                          !inMonth && "text-muted-foreground/40",
                          inMonth && !today && "text-foreground",
                          today && "bg-primary text-primary-foreground font-semibold"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    {/* Shift pills */}
                    {inMonth && shifts.length > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        {shifts.map((shift) => {
                          const inactive = INACTIVE.includes(shift.status);
                          const statusInfo = ASSIGNMENT_STATUSES.find(
                            (s) => s.value === shift.status
                          );

                          return (
                            <div
                              key={shift.slotId}
                              className={cn(
                                "flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] sm:text-[10px] font-medium leading-tight",
                                inactive
                                  ? "bg-destructive/8 text-muted-foreground line-through"
                                  : shift.type === "day"
                                  ? "bg-warning/15 text-warning-foreground"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {shift.type === "day" ? (
                                <Sun className="h-2.5 w-2.5 flex-shrink-0" />
                              ) : (
                                <Moon className="h-2.5 w-2.5 flex-shrink-0" />
                              )}
                              <span className="hidden sm:inline">
                                {shift.type === "day" ? "Day" : "Night"}
                              </span>
                              {inactive && statusInfo && (
                                <span className="hidden sm:inline ml-auto text-[8px]">
                                  {statusInfo.label}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 px-1 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-warning/30" />
              <span>Day Shift</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary/20" />
              <span>Night Shift</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-destructive/15" />
              <span>Cancelled / Call-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[7px] text-primary-foreground font-bold">T</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
