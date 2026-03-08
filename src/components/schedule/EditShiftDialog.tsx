import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ShiftSlot, THERAPISTS, Therapist, getTherapist, getCoverageStatus } from "@/lib/schedule-data";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, Sun, Moon, Shield, AlertCircle } from "lucide-react";

interface EditShiftDialogProps {
  slot: ShiftSlot | null;
  allSlots?: ShiftSlot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (slotId: string, assignments: { therapistId: string }[]) => void;
}

export function EditShiftDialog({ slot, allSlots = [], open, onOpenChange, onUpdate }: EditShiftDialogProps) {
  const therapistMeta = useMemo(() => {
    if (!slot) return {};
    const date = parseISO(slot.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
    const assignedIds = new Set(slot.assignments.map((a) => a.therapistId));
    const meta: Record<string, { weekShifts: number; sameDayConflict: boolean }> = {};

    for (const t of THERAPISTS) {
      let weekShifts = 0;
      let sameDayConflict = false;

      for (const s of allSlots) {
        if (s.id === slot.id) continue;
        const sDate = parseISO(s.date);

        const isAssigned = s.assignments.some((a) => a.therapistId === t.id);
        if (!isAssigned) continue;

        // Same day, opposite shift = conflict
        if (s.date === slot.date && s.type !== slot.type) {
          sameDayConflict = true;
        }

        // Count shifts this week
        if (isWithinInterval(sDate, { start: weekStart, end: weekEnd })) {
          weekShifts++;
        }
      }

      // Include current assignment in count
      if (assignedIds.has(t.id)) {
        weekShifts++;
      }

      meta[t.id] = { weekShifts, sameDayConflict };
    }

    return meta;
  }, [allSlots, slot, assignedIds]);

  function toggleTherapist(therapistId: string) {
    const newAssignments = assignedIds.has(therapistId)
      ? slot!.assignments.filter((a) => a.therapistId !== therapistId)
      : [...slot!.assignments, { therapistId }];
    onUpdate(slot!.id, newAssignments);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            {slot.type === "day" ? (
              <Sun className="h-4 w-4 text-warning" />
            ) : (
              <Moon className="h-4 w-4 text-primary" />
            )}
            {format(date, "EEEE, MMM d")} · {slot.type === "day" ? "Day Shift" : "Night Shift"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <StatusBadge variant={status === "ok" ? "success" : status === "warning" ? "warning" : "error"}>
            {slot.assignments.length}/{slot.minStaff} staff
          </StatusBadge>
          {slot.needsLead && !slot.assignments.some((a) => getTherapist(a.therapistId)?.role === "lead") && (
            <StatusBadge variant="error">
              <Shield className="h-3 w-3" /> Lead required
            </StatusBadge>
          )}
        </div>

        {/* Lead Therapists */}
        <div className="mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Lead Therapists
          </p>
          <div className="space-y-1">
            {leads.map((t) => (
              <TherapistRow
                key={t.id}
                therapist={t}
                assigned={assignedIds.has(t.id)}
                weekShifts={therapistMeta[t.id]?.weekShifts ?? 0}
                sameDayConflict={therapistMeta[t.id]?.sameDayConflict ?? false}
                onToggle={() => toggleTherapist(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Staff Therapists */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Staff Therapists
          </p>
          <div className="space-y-1">
            {staff.map((t) => (
              <TherapistRow
                key={t.id}
                therapist={t}
                assigned={assignedIds.has(t.id)}
                weekShifts={therapistMeta[t.id]?.weekShifts ?? 0}
                sameDayConflict={therapistMeta[t.id]?.sameDayConflict ?? false}
                onToggle={() => toggleTherapist(t.id)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TherapistRow({
  therapist,
  assigned,
  weekShifts,
  sameDayConflict,
  onToggle,
}: {
  therapist: Therapist;
  assigned: boolean;
  weekShifts: number;
  sameDayConflict: boolean;
  onToggle: () => void;
}) {
  const isHeavy = weekShifts >= 5;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
        assigned
          ? "bg-primary/8 border border-primary/20"
          : "hover:bg-muted border border-transparent",
        sameDayConflict && !assigned && "opacity-60"
      )}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground flex-shrink-0"
        style={{ backgroundColor: `hsl(${therapist.color})` }}
      >
        {therapist.initials}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground">{therapist.name}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn(
            "text-[10px] tabular-nums",
            isHeavy ? "text-warning-foreground font-medium" : "text-muted-foreground"
          )}>
            {weekShifts} shifts this week
          </span>
          {sameDayConflict && (
            <span className="flex items-center gap-0.5 text-[10px] text-warning-foreground font-medium">
              <AlertCircle className="h-3 w-3" /> Other shift
            </span>
          )}
        </div>
      </div>
      {therapist.role === "lead" && (
        <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
          Lead
        </span>
      )}
      {assigned ? (
        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-border flex-shrink-0" />
      )}
    </button>
  );
}
