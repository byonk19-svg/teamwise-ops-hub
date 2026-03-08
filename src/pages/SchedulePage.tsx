import { useState, useMemo } from "react";
import { format, addDays, addWeeks } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { ScheduleViewC } from "@/components/schedule/ScheduleViewC";
import { EditShiftDialog } from "@/components/schedule/EditShiftDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ShiftSlot, generateSchedule, getCoverageStatus } from "@/lib/schedule-data";
import { Send, Printer, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CYCLE_START = new Date(2026, 2, 22);
const TOTAL_WEEKS = 6;

export default function SchedulePage() {
  const [slots, setSlots] = useState<ShiftSlot[]>(() => generateSchedule(CYCLE_START, TOTAL_WEEKS));
  const [shiftView, setShiftView] = useState<"day" | "night">("day");
  const [editingSlot, setEditingSlot] = useState<ShiftSlot | null>(null);

  const issueCount = useMemo(() => {
    return slots.filter((s) => s.type === shiftView && getCoverageStatus(s) !== "ok").length;
  }, [slots, shiftView]);

  const cycleEnd = addDays(addWeeks(CYCLE_START, TOTAL_WEEKS), -1);

  function handleUpdate(slotId: string, assignments: { therapistId: string }[]) {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, assignments } : s)));
    setEditingSlot((prev) => (prev?.id === slotId ? { ...prev, assignments } : prev));
  }

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
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
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
              <StatusBadge variant="error">
                <AlertTriangle className="h-3 w-3" />
                {issueCount} {issueCount === 1 ? "issue" : "issues"}
              </StatusBadge>
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
            onClickSlot={setEditingSlot}
          />
        </div>
      </div>

      <EditShiftDialog
        slot={editingSlot}
        open={!!editingSlot}
        onOpenChange={(open) => !open && setEditingSlot(null)}
        onUpdate={handleUpdate}
      />
    </AppLayout>
  );
}
