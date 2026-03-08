import { useMemo, useState, useCallback } from "react";
import { format, addDays, startOfWeek, addWeeks, getDay } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { ScheduleDayCell } from "@/components/schedule/ScheduleDayCell";
import { EditShiftDialog } from "@/components/schedule/EditShiftDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ShiftSlot, generateSchedule, getCoverageStatus } from "@/lib/schedule-data";
import { Send, Printer, History, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CYCLE_START = new Date(2026, 2, 22); // Mar 22 2026 (Sunday)
const TOTAL_WEEKS = 6;
const DAYS_HEADER = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function SchedulePage() {
  const [slots, setSlots] = useState<ShiftSlot[]>(() => generateSchedule(CYCLE_START, TOTAL_WEEKS));
  const [shiftView, setShiftView] = useState<"day" | "night">("day");
  const [editingSlot, setEditingSlot] = useState<ShiftSlot | null>(null);

  // Group slots by week rows
  const weeks = useMemo(() => {
    const filtered = slots.filter((s) => s.type === shiftView);
    const result: ShiftSlot[][] = [];
    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const weekSlots = filtered.slice(w * 7, (w + 1) * 7);
      result.push(weekSlots);
    }
    return result;
  }, [slots, shiftView]);

  const issueCount = useMemo(() => {
    return slots.filter((s) => s.type === shiftView && getCoverageStatus(s) !== "ok").length;
  }, [slots, shiftView]);

  const cycleEnd = addDays(addWeeks(CYCLE_START, TOTAL_WEEKS), -1);

  function handleUpdate(slotId: string, assignments: { therapistId: string }[]) {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, assignments } : s))
    );
    // Update the editing slot too
    setEditingSlot((prev) => (prev?.id === slotId ? { ...prev, assignments } : prev));
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-6 pb-4"
        >
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight mb-1">
            Coverage
          </h1>
          <p className="text-sm text-muted-foreground">
            Click a day to edit therapist assignments
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print schedule
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              Week roster
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <History className="h-3.5 w-3.5" /> Publish history
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Auto-draft
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
              Clear draft
            </Button>
            <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-3.5 w-3.5" /> Publish
            </Button>
          </div>
        </motion.div>

        {/* Cycle info */}
        <div className="mx-6 rounded-lg border bg-card px-5 py-4 mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Cycle
          </p>
          <p className="font-heading font-bold text-foreground">
            {format(CYCLE_START, "MMM d")}–{format(cycleEnd, "MMM d")}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(CYCLE_START, "MMM d, yyyy")} to {format(cycleEnd, "MMM d, yyyy")}
          </p>
        </div>

        {/* Shift tabs + issues */}
        <div className="px-6 flex items-center gap-3 mb-3">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setShiftView("day")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
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
                "px-4 py-1.5 text-sm font-medium transition-colors",
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
              {issueCount} {issueCount === 1 ? "Issue" : "Issues"}
            </StatusBadge>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="px-6 pb-6 flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {DAYS_HEADER.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1.5"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Week rows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="space-y-1.5"
          >
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1.5">
                {week.map((slot) => (
                  <ScheduleDayCell
                    key={slot.id}
                    slot={slot}
                    onClick={(s) => setEditingSlot(s)}
                  />
                ))}
              </div>
            ))}
          </motion.div>
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
