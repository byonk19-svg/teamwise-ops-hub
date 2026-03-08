import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ShiftSlot, THERAPISTS, Therapist, getTherapist, getCoverageStatus } from "@/lib/schedule-data";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, Plus, X, Sun, Moon, Shield } from "lucide-react";

interface EditShiftDialogProps {
  slot: ShiftSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (slotId: string, assignments: { therapistId: string }[]) => void;
}

export function EditShiftDialog({ slot, open, onOpenChange, onUpdate }: EditShiftDialogProps) {
  if (!slot) return null;

  const date = parseISO(slot.date);
  const status = getCoverageStatus(slot);
  const assignedIds = new Set(slot.assignments.map((a) => a.therapistId));
  const leads = THERAPISTS.filter((t) => t.role === "lead");
  const staff = THERAPISTS.filter((t) => t.role === "staff");

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
  onToggle,
}: {
  therapist: Therapist;
  assigned: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
        assigned
          ? "bg-primary/8 border border-primary/20"
          : "hover:bg-muted border border-transparent"
      )}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground flex-shrink-0"
        style={{ backgroundColor: `hsl(${therapist.color})` }}
      >
        {therapist.initials}
      </span>
      <span className="text-sm text-foreground flex-1">{therapist.name}</span>
      {therapist.role === "lead" && (
        <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
          Lead
        </span>
      )}
      {assigned ? (
        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-border" />
      )}
    </button>
  );
}
