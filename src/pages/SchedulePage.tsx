import { useMemo, useState, useCallback } from "react";
import { format, parseISO, startOfWeek, addWeeks, addDays } from "date-fns";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { AppLayout } from "@/components/AppLayout";
import { ShiftCell } from "@/components/schedule/ShiftCell";
import { TherapistPool } from "@/components/schedule/TherapistPool";
import { TherapistChip } from "@/components/schedule/TherapistChip";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ShiftSlot, Therapist, THERAPISTS, generateSchedule, getCoverageStatus } from "@/lib/schedule-data";
import { ChevronLeft, ChevronRight, CalendarDays, Send, Filter } from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CYCLE_START = new Date(2025, 0, 6); // Jan 6 2025
const TOTAL_WEEKS = 6;

export default function SchedulePage() {
  const [slots, setSlots] = useState<ShiftSlot[]>(() => generateSchedule(CYCLE_START, TOTAL_WEEKS));
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTherapist, setActiveTherapist] = useState<Therapist | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const currentWeekStart = useMemo(
    () => startOfWeek(addWeeks(CYCLE_START, weekOffset), { weekStartsOn: 1 }),
    [weekOffset]
  );

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  const weekSlots = useMemo(() => {
    const dateSet = new Set(weekDates.map((d) => format(d, "yyyy-MM-dd")));
    return slots.filter((s) => dateSet.has(s.date));
  }, [slots, weekDates]);

  const getSlot = useCallback(
    (dateStr: string, type: "day" | "night") =>
      weekSlots.find((s) => s.date === dateStr && s.type === type),
    [weekSlots]
  );

  const coverageSummary = useMemo(() => {
    let errors = 0, warnings = 0;
    slots.forEach((s) => {
      const st = getCoverageStatus(s);
      if (st === "error") errors++;
      else if (st === "warning") warnings++;
    });
    return { errors, warnings, total: slots.length };
  }, [slots]);

  const assignedIds = useMemo(() => {
    const ids = new Set<string>();
    slots.forEach((s) => s.assignments.forEach((a) => ids.add(a.therapistId)));
    return ids;
  }, [slots]);

  function handleDragStart(event: DragStartEvent) {
    const therapist = event.active.data.current?.therapist as Therapist | undefined;
    if (therapist) setActiveTherapist(therapist);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTherapist(null);
    const { active, over } = event;
    if (!over) return;

    const therapist = active.data.current?.therapist as Therapist | undefined;
    if (!therapist) return;

    const slotId = over.id as string;
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        if (s.assignments.some((a) => a.therapistId === therapist.id)) return s;
        if (s.assignments.length >= s.maxStaff) return s;
        return { ...s, assignments: [...s.assignments, { therapistId: therapist.id }] };
      })
    );
  }

  function handleRemoveAssignment(slotId: string, therapistId: string) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        return { ...s, assignments: s.assignments.filter((a) => a.therapistId !== therapistId) };
      })
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 border-b bg-card flex items-center justify-between flex-shrink-0"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-xl font-bold text-foreground tracking-tight">
                Schedule Builder
              </h1>
              <StatusBadge variant="pending">Pre-publish</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(CYCLE_START, "MMM d")} – {format(addWeeks(CYCLE_START, TOTAL_WEEKS), "MMM d, yyyy")} · {TOTAL_WEEKS} weeks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-4 text-xs">
              {coverageSummary.errors > 0 && (
                <StatusBadge variant="error">{coverageSummary.errors} gaps</StatusBadge>
              )}
              {coverageSummary.warnings > 0 && (
                <StatusBadge variant="warning">{coverageSummary.warnings} low</StatusBadge>
              )}
              {coverageSummary.errors === 0 && coverageSummary.warnings === 0 && (
                <StatusBadge variant="success">Coverage complete</StatusBadge>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-3.5 w-3.5" />
              Publish
            </Button>
          </div>
        </motion.div>

        {/* Week nav */}
        <div className="px-6 py-2.5 border-b bg-surface-raised flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-heading font-semibold text-sm">
              Week {weekOffset + 1} of {TOTAL_WEEKS}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(currentWeekStart, "MMM d")} – {format(addDays(currentWeekStart, 6), "MMM d")}
            </span>
          </div>
          <button
            onClick={() => setWeekOffset(Math.min(TOTAL_WEEKS - 1, weekOffset + 1))}
            disabled={weekOffset === TOTAL_WEEKS - 1}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Grid + Pool */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-1 overflow-hidden">
            {/* Grid */}
            <div className="flex-1 overflow-auto p-4">
              <motion.div
                key={weekOffset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDates.map((date, i) => {
                    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    const isWeekend = i >= 5;
                    return (
                      <div
                        key={i}
                        className={`text-center rounded-md py-1.5 px-2 ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : isWeekend
                            ? "bg-muted/70"
                            : "bg-muted/40"
                        }`}
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                          {DAYS[i]}
                        </p>
                        <p className="text-sm font-heading font-bold">{format(date, "d")}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Day shifts row */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDates.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const slot = getSlot(dateStr, "day");
                    return slot ? (
                      <ShiftCell key={slot.id} slot={slot} onRemoveAssignment={handleRemoveAssignment} />
                    ) : (
                      <div key={dateStr} className="min-h-[72px] rounded-md border border-dashed" />
                    );
                  })}
                </div>

                {/* Night shifts row */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const slot = getSlot(dateStr, "night");
                    return slot ? (
                      <ShiftCell key={slot.id} slot={slot} onRemoveAssignment={handleRemoveAssignment} />
                    ) : (
                      <div key={dateStr} className="min-h-[72px] rounded-md border border-dashed" />
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-destructive" /> No coverage
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-warning" /> Below minimum
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success" /> Covered
                  </span>
                  <span className="flex items-center gap-1">★ Lead therapist</span>
                </div>
              </motion.div>
            </div>

            {/* Therapist Pool Sidebar */}
            <div className="border-l p-4 flex-shrink-0">
              <TherapistPool assignedTherapistIds={assignedIds} />
            </div>
          </div>

          <DragOverlay>
            {activeTherapist && <TherapistChip therapist={activeTherapist} isDragOverlay />}
          </DragOverlay>
        </DndContext>
      </div>
    </AppLayout>
  );
}
