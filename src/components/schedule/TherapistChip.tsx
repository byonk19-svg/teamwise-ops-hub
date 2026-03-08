import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Therapist } from "@/lib/schedule-data";

interface TherapistChipProps {
  therapist: Therapist;
  compact?: boolean;
  isDragOverlay?: boolean;
}

export function TherapistChip({ therapist, compact = false, isDragOverlay = false }: TherapistChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `therapist-${therapist.id}`,
    data: { therapist },
  });

  if (isDragOverlay) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 shadow-lg ring-2 ring-primary/30">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
          style={{ backgroundColor: `hsl(${therapist.color})` }}
        >
          {therapist.initials}
        </span>
        <span className="text-xs font-medium text-foreground">{therapist.name}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-1.5 rounded-md border bg-card cursor-grab active:cursor-grabbing transition-all",
        compact ? "px-1 py-0.5" : "px-2 py-1",
        isDragging && "opacity-40"
      )}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground flex-shrink-0"
        style={{ backgroundColor: `hsl(${therapist.color})` }}
      >
        {therapist.initials}
      </span>
      {!compact && (
        <span className="text-xs font-medium text-foreground truncate">{therapist.name}</span>
      )}
    </div>
  );
}
