import { useState, useMemo, useCallback, useRef } from "react";
import { format, addDays, addWeeks } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { ScheduleViewC } from "@/components/schedule/ScheduleViewC";
import { EditShiftDialog } from "@/components/schedule/EditShiftDialog";
import { AutoDraftDialog } from "@/components/schedule/AutoDraftDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ShiftSlot, getCoverageStatus } from "@/lib/schedule-data";
import { useSchedule } from "@/context/ScheduleContext";
import { Send, Printer, Sparkles, AlertTriangle, Undo2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HistoryEntry {
  slots: ShiftSlot[];
  description: string;
}

export default function SchedulePage() {
  const { slots, setSlots, cycleStart, totalWeeks } = useSchedule();
  const CYCLE_START = cycleStart;
  const TOTAL_WEEKS = totalWeeks;
  const [shiftView, setShiftView] = useState<"day" | "night">("day");
  const [editingSlot, setEditingSlot] = useState<ShiftSlot | null>(null);
  const [issuesOnly, setIssuesOnly] = useState(false);
  const undoStack = useRef<HistoryEntry[]>([]);
  const [autoDraftOpen, setAutoDraftOpen] = useState(false);

  const issueCount = useMemo(() => {
    return slots.filter((s) => s.type === shiftView && getCoverageStatus(s) !== "ok").length;
  }, [slots, shiftView]);

  const cycleEnd = addDays(addWeeks(CYCLE_START, TOTAL_WEEKS), -1);

  const handleUpdate = useCallback((slotId: string, assignments: { therapistId: string }[]) => {
    // Save current state for undo
    const prevSlots = slots;
    const targetSlot = slots.find((s) => s.id === slotId);
    const description = targetSlot
      ? `Changed ${format(new Date(targetSlot.date), "MMM d")} ${targetSlot.type} shift`
      : "Changed assignment";

    undoStack.current.push({ slots: prevSlots, description });

    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, assignments } : s)));
    setEditingSlot((prev) => (prev?.id === slotId ? { ...prev, assignments } : prev));

    toast("Assignment updated", {
      description,
      action: {
        label: "Undo",
        onClick: () => {
          const entry = undoStack.current.pop();
          if (entry) {
            setSlots(entry.slots);
            // Update editing slot if still open
            setEditingSlot((prev) => {
              if (!prev) return null;
              const restored = entry.slots.find((s) => s.id === prev.id);
              return restored ?? prev;
            });
            toast.success("Change undone");
          }
        },
      },
      duration: 5000,
    });
  }, [slots]);

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
                Coverage
              </h1>
              <p className="text-xs text-muted-foreground">
                {format(CYCLE_START, "MMM d")} – {format(cycleEnd, "MMM d, yyyy")} · {TOTAL_WEEKS} weeks · Click a day to edit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setAutoDraftOpen(true)}>
                <Sparkles className="h-3.5 w-3.5" /> Auto-draft
              </Button>
              <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="h-3.5 w-3.5" /> Publish
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setShiftView("day")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-medium transition-colors",
                  shiftView === "day"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                Day Shift
              </button>
              <button
                onClick={() => setShiftView("night")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-medium transition-colors",
                  shiftView === "night"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                Night Shift
              </button>
            </div>

            {issueCount > 0 && (
              <button
                onClick={() => setIssuesOnly((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border",
                  issuesOnly
                    ? "bg-destructive/10 border-destructive/25 text-destructive"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                {issueCount} {issueCount === 1 ? "issue" : "issues"}
                {issuesOnly && " · showing"}
              </button>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-5">
          <ScheduleViewC
            slots={slots}
            shiftView={shiftView}
            cycleStart={CYCLE_START}
            totalWeeks={TOTAL_WEEKS}
            issuesOnly={issuesOnly}
            onClickSlot={setEditingSlot}
          />
        </div>
      </div>

      <EditShiftDialog
        slot={editingSlot}
        allSlots={slots}
        open={!!editingSlot}
        onOpenChange={(open) => !open && setEditingSlot(null)}
        onUpdate={handleUpdate}
      />

      <AutoDraftDialog
        open={autoDraftOpen}
        onOpenChange={setAutoDraftOpen}
        currentSlots={slots}
        onApply={(newSlots) => {
          undoStack.current.push({ slots, description: "Auto-draft schedule" });
          setSlots(newSlots);
          toast.success("Auto-draft applied", {
            description: "Schedule generated respecting all preferences",
            action: {
              label: "Undo",
              onClick: () => {
                const entry = undoStack.current.pop();
                if (entry) {
                  setSlots(entry.slots);
                  toast.success("Auto-draft undone");
                }
              },
            },
            duration: 8000,
          });
        }}
      />
    </AppLayout>
  );
}
