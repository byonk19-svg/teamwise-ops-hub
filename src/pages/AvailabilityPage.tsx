import { useState, useMemo } from "react";
import { format, addDays, parseISO, isWeekend } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { THERAPISTS, Therapist } from "@/lib/schedule-data";
import {
  AvailabilitySubmission,
  AvailabilityStatus,
  NEXT_CYCLE,
  generateSubmissions,
  getSubmissionStats,
  getTherapistSubmission,
} from "@/lib/availability-data";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  CalendarCheck,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAYS_PER_ROW = 7;

export default function AvailabilityPage() {
  const [submissions, setSubmissions] = useState<AvailabilitySubmission[]>(() =>
    generateSubmissions()
  );
  const [viewingTherapist, setViewingTherapist] = useState<Therapist | null>(null);

  const stats = useMemo(() => getSubmissionStats(submissions), [submissions]);

  function handleApprove(submissionId: string) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: "approved" as const } : s))
    );
  }

  function handleReject(submissionId: string) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: "rejected" as const } : s))
    );
  }

  const viewingSub = viewingTherapist
    ? getTherapistSubmission(submissions, viewingTherapist.id)
    : null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-5 pb-4 border-b bg-card flex-shrink-0"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground tracking-tight mb-0.5">
                Availability Requests
              </h1>
              <p className="text-xs text-muted-foreground">
                Next cycle: {NEXT_CYCLE.label} · {NEXT_CYCLE.weeks} weeks
              </p>
            </div>
            <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
              <CalendarCheck className="h-3.5 w-3.5" /> Send Reminders
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <StatusBadge variant="info">
              <Users className="h-3 w-3" />
              {stats.submitted}/{stats.total} submitted
            </StatusBadge>
            <StatusBadge variant="success">
              <CheckCircle2 className="h-3 w-3" />
              {stats.approved} approved
            </StatusBadge>
            {stats.pending > 0 && (
              <StatusBadge variant="warning">
                <Clock className="h-3 w-3" />
                {stats.pending} pending
              </StatusBadge>
            )}
            {stats.missing > 0 && (
              <StatusBadge variant="error">
                <XCircle className="h-3 w-3" />
                {stats.missing} not submitted
              </StatusBadge>
            )}
          </div>
        </motion.div>

        {/* List */}
        <div className="flex-1 overflow-auto p-5">
          <div className="space-y-2">
            {THERAPISTS.map((therapist) => {
              const sub = getTherapistSubmission(submissions, therapist.id);
              return (
                <TherapistRow
                  key={therapist.id}
                  therapist={therapist}
                  submission={sub}
                  onView={() => setViewingTherapist(therapist)}
                  onApprove={sub ? () => handleApprove(sub.id) : undefined}
                  onReject={sub ? () => handleReject(sub.id) : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <AvailabilityDetailDialog
        therapist={viewingTherapist}
        submission={viewingSub}
        open={!!viewingTherapist}
        onOpenChange={(open) => !open && setViewingTherapist(null)}
        onApprove={viewingSub ? () => handleApprove(viewingSub.id) : undefined}
        onReject={viewingSub ? () => handleReject(viewingSub.id) : undefined}
      />
    </AppLayout>
  );
}

function TherapistRow({
  therapist,
  submission,
  onView,
  onApprove,
  onReject,
}: {
  therapist: Therapist;
  submission?: AvailabilitySubmission;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const unavailableDays = submission
    ? submission.entries.filter((e) => e.status === "unavailable").length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
        submission ? "bg-card border-border" : "bg-muted/30 border-border/50"
      )}
    >
      {/* Avatar */}
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground flex-shrink-0"
        style={{ backgroundColor: `hsl(${therapist.color})` }}
      >
        {therapist.initials}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{therapist.name}</span>
          {therapist.role === "lead" && (
            <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
              Lead
            </span>
          )}
        </div>
        {submission ? (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Submitted {format(parseISO(submission.submittedAt), "MMM d")} · {unavailableDays} days unavailable
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 italic">Not yet submitted</p>
        )}
      </div>

      {/* Status + Actions */}
      <div className="flex items-center gap-2">
        {submission ? (
          <>
            <StatusBadge
              variant={
                submission.status === "approved"
                  ? "success"
                  : submission.status === "rejected"
                  ? "error"
                  : "warning"
              }
            >
              {submission.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
              {submission.status === "pending" && <Clock className="h-3 w-3" />}
              {submission.status === "rejected" && <XCircle className="h-3 w-3" />}
              {submission.status}
            </StatusBadge>

            {submission.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={onReject}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={onApprove}
                >
                  Approve
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onView}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground/50">Awaiting</span>
        )}
      </div>
    </motion.div>
  );
}

function AvailabilityDetailDialog({
  therapist,
  submission,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: {
  therapist: Therapist | null;
  submission?: AvailabilitySubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  if (!therapist) return null;

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totalDays = NEXT_CYCLE.weeks * 7;
  const weeks: string[][] = [];
  for (let w = 0; w < NEXT_CYCLE.weeks; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(format(addDays(NEXT_CYCLE.start, w * 7 + d), "yyyy-MM-dd"));
    }
    weeks.push(week);
  }

  const entryMap = new Map(submission?.entries.map((e) => [e.date, e]));

  function statusColor(status: AvailabilityStatus) {
    switch (status) {
      case "available":
        return "bg-success/15 border-success/25 text-success";
      case "preferred":
        return "bg-primary/10 border-primary/25 text-primary";
      case "unavailable":
        return "bg-destructive/10 border-destructive/25 text-destructive";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
              style={{ backgroundColor: `hsl(${therapist.color})` }}
            >
              {therapist.initials}
            </span>
            {therapist.name}'s Availability
          </DialogTitle>
        </DialogHeader>

        {!submission ? (
          <p className="text-sm text-muted-foreground py-8 text-center italic">
            No submission yet for this cycle.
          </p>
        ) : (
          <>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-3">
              {(["available", "preferred", "unavailable"] as const).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={cn("h-3 w-3 rounded-sm border", statusColor(s))} />
                  <span className="text-[10px] text-muted-foreground capitalize">{s}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[9px] font-semibold uppercase tracking-widest text-muted-foreground py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              <div className="space-y-2">
                {weeks.map((week, wi) => (
                  <div key={wi}>
                    <div className="grid grid-cols-7 gap-1">
                      {week.map((dateStr) => {
                        const entry = entryMap.get(dateStr);
                        const date = parseISO(dateStr);
                        const status = entry?.status ?? "unset";
                        const weekend = isWeekend(date);

                        return (
                          <div
                            key={dateStr}
                            className={cn(
                              "rounded-md border p-1.5 text-center transition-colors",
                              statusColor(status),
                              weekend && status === "available" && "opacity-60"
                            )}
                          >
                            <span className="text-[11px] font-semibold leading-none">
                              {format(date, "d")}
                            </span>
                            {entry?.note && (
                              <p className="text-[8px] mt-0.5 leading-tight opacity-70">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {submission.status === "pending" && (
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={onReject}>
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={onApprove}
                >
                  Approve
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
