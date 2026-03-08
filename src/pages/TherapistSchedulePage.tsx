import { useMemo } from "react";
import { format, parseISO, addDays, addWeeks, isAfter, isBefore, startOfDay } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { useSchedule } from "@/context/ScheduleContext";
import { getTherapist, AssignmentStatus, ASSIGNMENT_STATUSES } from "@/lib/schedule-data";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sun, Moon, CalendarDays } from "lucide-react";

const CURRENT_USER_ID = "t5"; // Aleyce
const INACTIVE: AssignmentStatus[] = ["cancelled", "call-in", "on-call"];

export default function TherapistSchedulePage() {
  const { slots, cycleStart, totalWeeks } = useSchedule();
  const today = startOfDay(new Date());
  const cycleEnd = addDays(addWeeks(cycleStart, totalWeeks), -1);
  const therapist = getTherapist(CURRENT_USER_ID)!;

  const myShifts = useMemo(() => {
    return slots
      .filter((s) => s.assignments.some((a) => a.therapistId === CURRENT_USER_ID))
      .map((s) => {
        const assignment = s.assignments.find((a) => a.therapistId === CURRENT_USER_ID)!;
        const status = assignment.status ?? "active";
        const date = parseISO(s.date);
        return { slot: s, date, status };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [slots]);

  const upcoming = myShifts.filter((s) => !isBefore(s.date, today));
  const past = myShifts.filter((s) => isBefore(s.date, today)).reverse();
  const activeCount = myShifts.filter((s) => !INACTIVE.includes(s.status)).length;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-5 pb-4 border-b bg-card flex-shrink-0"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground tracking-tight mb-0.5">
                My Schedule
              </h1>
              <p className="text-xs text-muted-foreground">
                {format(cycleStart, "MMM d")} – {format(cycleEnd, "MMM d, yyyy")} · {activeCount} shifts this cycle
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto p-5 space-y-6">
          {/* Upcoming */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4 text-center">No upcoming shifts</p>
            ) : (
              <div className="space-y-1.5">
                {upcoming.map(({ slot, date, status }) => (
                  <ShiftRow key={slot.id} date={date} slot={slot} status={status} isToday={format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")} />
                ))}
              </div>
            )}
          </section>

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Past Shifts ({past.length})
              </h2>
              <div className="space-y-1.5 opacity-60">
                {past.map(({ slot, date, status }) => (
                  <ShiftRow key={slot.id} date={date} slot={slot} status={status} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ShiftRow({ date, slot, status, isToday }: {
  date: Date;
  slot: { id: string; type: "day" | "night"; date: string };
  status: AssignmentStatus;
  isToday?: boolean;
}) {
  const inactive = INACTIVE.includes(status);
  const statusInfo = ASSIGNMENT_STATUSES.find((s) => s.value === status);

  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border px-4 py-3",
      isToday && "ring-2 ring-primary/30 border-primary/20",
      inactive ? "bg-destructive/3" : "bg-card"
    )}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-muted text-center">
          <span className="text-[10px] font-medium text-muted-foreground leading-none">
            {format(date, "EEE")}
          </span>
          <span className={cn("text-sm font-heading font-bold leading-tight", isToday ? "text-primary" : "text-foreground")}>
            {format(date, "d")}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            {slot.type === "day"
              ? <Sun className="h-3 w-3 text-warning-foreground" />
              : <Moon className="h-3 w-3 text-muted-foreground" />
            }
            <span className={cn("text-sm font-medium", inactive && "line-through text-muted-foreground")}>
              {slot.type === "day" ? "Day Shift (7a–7p)" : "Night Shift (7p–7a)"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">{format(date, "MMMM d, yyyy")}</span>
        </div>
      </div>

      {status !== "active" && statusInfo ? (
        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", statusInfo.color)}>
          {statusInfo.label}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-success">
          Confirmed
        </Badge>
      )}
    </div>
  );
}
