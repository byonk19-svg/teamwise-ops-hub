import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarDays,
  ArrowRight,
  FileCheck,
  Users,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { ScheduleProgress } from "@/components/ScheduleProgress";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

// Mock data
const coverageIssues = [
  { day: "Mon Jan 13", shift: "Day", issue: "No lead coverage", severity: "error" as const },
  { day: "Wed Jan 15", shift: "Night", issue: "Below minimum (2/3)", severity: "warning" as const },
  { day: "Fri Jan 17", shift: "Day", issue: "No lead coverage", severity: "error" as const },
];

const pendingApprovals = [
  { name: "Alex Chen", type: "Availability", date: "Jan 6–17", submitted: "2h ago" },
  { name: "Sam Rivera", type: "Swap Request", date: "Jan 8 Day → Jan 10 Day", submitted: "5h ago" },
  { name: "Jordan Lee", type: "Time Off", date: "Jan 13–14", submitted: "1d ago" },
];

export default function ManagerHome() {
  return (
    <AppLayout>
      <div className="px-8 py-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                Good morning, Jamie
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Jan 6–Feb 14 cycle needs attention · <span className="font-medium text-destructive">3 coverage gaps</span> · <span className="font-medium text-accent">6 therapists pending availability</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Open Schedule
              </Button>
              <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="h-3.5 w-3.5" />
                Publish Schedule
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Coverage Issues", value: "3", icon: Shield, variant: "error" as const, sub: "2 critical, 1 warning" },
            { label: "Pending Approvals", value: "5", icon: FileCheck, variant: "warning" as const, sub: "3 availability, 2 swaps" },
            { label: "Availability Received", value: "18/24", icon: Users, variant: "default" as const, sub: "6 therapists pending" },
            { label: "Publish Readiness", value: "62%", icon: CheckCircle2, variant: "warning" as const, sub: "3 issues to resolve" },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="show">
              <StatsCard {...stat} sublabel={stat.sub} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Schedule Progress */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <ScheduleProgress />
          </motion.div>

          {/* Coverage Risks */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="col-span-2 rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                <h2 className="font-heading font-semibold text-sm">Coverage Risks</h2>
                <StatusBadge variant="error">3 issues</StatusBadge>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Fix Coverage <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="divide-y divide-border/50">
              {coverageIssues.map((issue, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3.5">
                    {issue.severity === "error" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-warning" />
                    )}
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{issue.day} · {issue.shift}</p>
                      <p className="text-xs text-muted-foreground">{issue.issue}</p>
                    </div>
                  </div>
                  <StatusBadge variant={issue.severity}>{issue.severity === "error" ? "Critical" : "Warning"}</StatusBadge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-accent" />
                <h2 className="font-heading font-semibold text-sm">Approvals</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Review All <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="divide-y">
              {pendingApprovals.map((item, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <span className="text-[10px] text-muted-foreground">{item.submitted}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.type} · {item.date}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Schedule Context / Publish Readiness */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 rounded-lg border bg-card"
        >
          <div className="px-5 py-4 border-b">
            <h2 className="font-heading font-semibold text-sm">Publish Readiness</h2>
          </div>
          <div className="px-5 py-5">
            <div className="space-y-3">
              {[
                { label: "All availability collected", done: false, detail: "6 of 24 therapists pending" },
                { label: "Coverage meets minimum staffing", done: false, detail: "3 gaps remaining" },
                { label: "Lead therapist assigned all shifts", done: false, detail: "2 shifts unassigned" },
                { label: "No conflicting swap requests", done: true, detail: "All clear" },
                { label: "Schedule reviewed by manager", done: false, detail: "Not yet reviewed" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? "bg-success" : "border-2 border-border"
                    }`}
                  >
                    {item.done && <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
