import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import {
  CalendarDays,
  Clock,
  ArrowLeftRight,
  CheckCircle2,
  ArrowRight,
  Inbox,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

const upcomingShifts = [
  { day: "Mon Jan 6", shift: "Day (7a–7p)", unit: "NICU", role: "Lead", status: "confirmed" as const },
  { day: "Tue Jan 7", shift: "Night (7p–7a)", unit: "Adult ICU", role: "Staff", status: "confirmed" as const },
  { day: "Thu Jan 9", shift: "Day (7a–7p)", unit: "NICU", role: "Staff", status: "pending" as const },
];

const openSwaps = [
  { from: "Alex Chen", date: "Fri Jan 10", shift: "Day", reason: "Personal appointment", posted: "3h ago" },
  { from: "Taylor Brooks", date: "Sun Jan 12", shift: "Night", reason: "Family event", posted: "1d ago" },
];

export default function TherapistHome() {
  const navigate = useNavigate();
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
            My Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Current cycle: Jan 6 – Feb 14 · <StatusBadge variant="success" className="ml-1">Published</StatusBadge>
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
              <p className="text-xs text-muted-foreground">Feb 15 – Mar 28 · Due by Jan 20</p>
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
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                View Full Schedule <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="divide-y">
              {upcomingShifts.map((shift, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-muted text-center">
                      <span className="text-[10px] font-medium text-muted-foreground leading-none">
                        {shift.day.split(" ")[0]}
                      </span>
                      <span className="text-sm font-heading font-bold text-foreground leading-tight">
                        {shift.day.split(" ")[2]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{shift.shift}</p>
                      <p className="text-xs text-muted-foreground">{shift.unit} · {shift.role}</p>
                    </div>
                  </div>
                  <StatusBadge variant={shift.status === "confirmed" ? "success" : "pending"}>
                    {shift.status === "confirmed" ? "Confirmed" : "Pending"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Open Shift Swaps */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="col-span-2 rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-primary" />
                <h2 className="font-heading font-semibold text-sm">Open Swaps</h2>
                <StatusBadge variant="info">{openSwaps.length} available</StatusBadge>
              </div>
            </div>
            {openSwaps.length > 0 ? (
              <div className="divide-y">
                {openSwaps.map((swap, i) => (
                  <div key={i} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-foreground">{swap.date} · {swap.shift}</p>
                      <span className="text-[10px] text-muted-foreground">{swap.posted}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2.5">
                      Posted by {swap.from} · {swap.reason}
                    </p>
                     <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => navigate("/therapist/swaps")}>
                       Pick Up Shift
                     </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title="No open swaps"
                description="Check back later for available shift swaps from your team."
              />
            )}
          </motion.div>
        </div>

        {/* Quick Status */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-3 gap-4"
        >
          <div className="rounded-lg border bg-card px-5 py-4 flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Availability</p>
              <p className="text-xs text-muted-foreground">Submitted for current cycle</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card px-5 py-4 flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Swap Requests</p>
              <p className="text-xs text-muted-foreground">No pending requests</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card px-5 py-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Next Shift</p>
              <p className="text-xs text-muted-foreground">Mon Jan 6 · Day · NICU</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
