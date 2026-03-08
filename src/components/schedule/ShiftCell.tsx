import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ShiftSlot, getTherapist, getCoverageStatus } from "@/lib/schedule-data";
import { TherapistChip } from "./TherapistChip";
import { Moon, Sun, AlertTriangle, X } from "lucide-react";

interface ShiftCellProps {
  slot: ShiftSlot;
  onRemoveAssignment: (slotId: string, therapistId: string) => void;
}

export function ShiftCell({ slot, onRemoveAssignment }: ShiftCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: slot.id,
    data: { slot },
  });

  const status = getCoverageStatus(slot);
  const count = slot.assignments.length;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[72px] rounded-md border p-1.5 transition-all",
        slot.type === "night" ? "bg-muted/50" : "bg-card",
        isOver && "ring-2 ring-primary/40 bg-primary/5",
        status === "error" && "border-destructive/40",
        status === "warning" && "border-warning/40",
        status === "ok" && "border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          {slot.type === "day" ? (
            <Sun className="h-2.5 w-2.5 text-warning" />
          ) : (
            <Moon className="h-2.5 w-2.5 text-primary" />
          )}
          <span className="text-[9px] font-medium text-muted-foreground uppercase">
            {slot.type}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {status !== "ok" && <AlertTriangle className={cn("h-2.5 w-2.5", status === "error" ? "text-destructive" : "text-warning")} />}
          <span className={cn(
            "text-[9px] font-medium",
            status === "ok" && "text-success",
            status === "warning" && "text-warning",
            status === "error" && "text-destructive",
          )}>
            {count}/{slot.minStaff}
          </span>
        </div>
      </div>

      {/* Assignments */}
      <div className="space-y-0.5">
        {slot.assignments.map((a) => {
          const therapist = getTherapist(a.therapistId);
          if (!therapist) return null;
          return (
            <div key={a.therapistId} className="group flex items-center gap-0.5">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-primary-foreground flex-shrink-0"
                  style={{ backgroundColor: `hsl(${therapist.color})` }}
                >
                  {therapist.initials}
                </span>
                <span className="text-[10px] text-foreground truncate">
                  {therapist.name.split(" ")[0]}
                  {therapist.role === "lead" && (
                    <span className="text-primary ml-0.5">★</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => onRemoveAssignment(slot.id, a.therapistId)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-3 w-3 flex items-center justify-center rounded-sm hover:bg-destructive/10"
              >
                <X className="h-2 w-2 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Drop hint */}
      {count === 0 && !isOver && (
        <p className="text-[9px] text-muted-foreground/50 text-center mt-2">Drop here</p>
      )}
      {isOver && (
        <div className="text-[9px] text-primary text-center mt-1 font-medium">+ Assign</div>
      )}
    </div>
  );
}
