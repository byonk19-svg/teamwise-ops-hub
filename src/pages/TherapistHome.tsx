import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isAfter, startOfDay, addWeeks, addDays } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useSchedule } from "@/context/ScheduleContext";
import { getTherapist, AssignmentStatus } from "@/lib/schedule-data";
import { getPreferences, DAY_LABELS } from "@/lib/therapist-preferences";
import {
  CalendarDays,
  Clock,
  ArrowLeftRight,
  CheckCircle2,
  ArrowRight,
  Inbox,
  Send,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CURRENT_USER_ID = "t5"; // Aleyce
const INACTIVE: AssignmentStatus[] = ["cancelled", "call-in", "on-call"];

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

export default function TherapistHome() {
  const navigate = useNavigate();
  const { slots, cycleStart, totalWeeks } = useSchedule();
  const today = startOfDay(new Date());
  const cycleEnd = addDays(addWeeks(cycleStart, totalWeeks), -1);
  const therapist = getTherapist(CURRENT_USER_ID)!;
  const prefs = getPreferences(CURRENT_USER_ID);

  const myShifts = useMemo(() => {
    return slots
      .filter((s) => s.assignments.some((a) => a.therapistId === CURRENT_USER_ID))
      .map((s) => {
        const assignment = s.assignments.find((a) => a.therapistId === CURRENT_USER_ID)!;
        const status = assignment.status ?? "active";
        return { slot: s, date: parseISO(s.date), status };
      });
  }, [slots]);

  const upcoming = useMemo(
    () => myShifts.filter((s) => !s.date || isAfter(s.date, today) || format(s.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"))
      .filter((s) => !INACTIVE.includes(s.status))
      .slice(0, 5),
    [myShifts, today]
  );

  const totalShifts = myShifts.filter((s) => !INACTIVE.includes(s.status)).length;
  const cancelledShifts = myShifts.filter((s) => INACTIVE.includes(s.status)).length;

  return (
    <AppLayout>
      <div className="px-8 py-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Hi, {therapist.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(cycleStart, "MMM d")} – {format(cycleEnd, "MMM d, yyyy")} · <StatusBadge variant="success" className="ml-1">Published</StatusBadge>
          </p>
        </motion.div>

        {/* Availability Banner */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-lg border border-accent/30 bg-accent/5 px-5 py-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/15 p-2">
              <Send className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Next cycle availability due</p>
              <p className="text-xs text-muted-foreground">Submit your preferred and unavailable days</p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/therapist/availability")}>
            Submit Availability
          </Button>
        </motion.div>

        <div className="grid grid-cols-5 gap-6">
          {/* Upcoming Shifts */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="col-span-3 rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h2 className="font-heading font-semibold text-sm">Upcoming Shifts</h2>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {upcoming.length}
                </span>
              </div>
            </div>
            {upcoming.length > 0 ? (
              <div className="divide-y">
                {upcoming.map(({ slot, date, status }) => (
                  <div key={slot.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-muted text-center">
                        <span className="text-[10px] font-medium text-muted-foreground leading-none">
                          {format(date, "EEE")}
                        </span>
                        <span className="text-sm font-heading font-bold text-foreground leading-tight">
                          {format(date, "d")}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          {slot.type === "day"
                            ? <Sun className="h-3 w-3 text-warning-foreground" />
                            : <Moon className="h-3 w-3 text-muted-foreground" />
                          }
                          <p className="text-sm font-medium text-foreground">
                            {slot.type === "day" ? "Day (7a–7p)" : "Night (7p–7a)"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{therapist.role}</p>
                      </div>
                    </div>
                    <StatusBadge variant={status === "active" ? "success" : "pending"}>
                      {status === "active" ? "Confirmed" : status === "leave-early" ? "Leave Early" : status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title="No upcoming shifts"
                description="You have no shifts scheduled for this cycle."
              />
            )}
          </motion.div>

          {/* Preferences Summary */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="col-span-2 rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="font-heading font-semibold text-sm">My Preferences</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preferred Days</p>
                <div className="flex gap-1">
                  {DAY_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-7 w-8 rounded text-[10px] font-medium flex items-center justify-center border",
                        prefs.preferredDays.includes(i)
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted/50 text-muted-foreground/40 border-transparent"
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              {prefs.unavailableDays.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Unavailable</p>
                  <div className="flex gap-1">
                    {prefs.unavailableDays.map((d) => (
                      <span key={d} className="h-7 px-2 rounded text-[10px] font-medium flex items-center justify-center border bg-destructive/10 text-destructive border-destructive/20">
                        {DAY_LABELS[d]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {prefs.notes && (
                <p className="text-xs text-muted-foreground italic">"{prefs.notes}"</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-3 gap-4"
        >
          <div className="rounded-lg border bg-card px-5 py-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-foreground">{totalShifts}</p>
              <p className="text-xs text-muted-foreground">Total shifts this cycle</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card px-5 py-4 flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-foreground">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming shifts</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/therapist/swaps")}
            className="rounded-lg border bg-card px-5 py-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
          >
            <div className="rounded-lg bg-accent/10 p-2">
              <ArrowLeftRight className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Shift Swaps</p>
              <p className="text-xs text-muted-foreground">View open swaps →</p>
            </div>
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
