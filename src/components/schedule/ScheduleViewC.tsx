import { useMemo, useRef, useCallback } from "react";
import { format, parseISO, isFirstDayOfMonth, isToday, isWeekend } from "date-fns";
import { ShiftSlot, getCoverageStatus, getLeadAssignment, getStaffAssignments, AssignmentStatus, ASSIGNMENT_STATUSES } from "@/lib/schedule-data";
import { useSchedule } from "@/context/ScheduleContext";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AssignmentStatusPopover, StatusPill } from "./AssignmentStatusPopover";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ViewCProps {
  slots: ShiftSlot[];
  shiftView: "day" | "night";
  cycleStart: Date;
  totalWeeks: number;
  issuesOnly?: boolean;
  onClickSlot: (slot: ShiftSlot) => void;
}

export function ScheduleViewC({ slots, shiftView, cycleStart, totalWeeks, issuesOnly = false, onClickSlot }: ViewCProps) {
  const { swappedSlotIds, swapDetails } = useSchedule();
  const filtered = useMemo(() => slots.filter((s) => s.type === shiftView), [slots, shiftView]);
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const focusedIndex = useRef<number>(0);

  const weeks = useMemo(() => {
    const result: ShiftSlot[][] = [];
    for (let w = 0; w < totalWeeks; w++) {
      result.push(filtered.slice(w * 7, (w + 1) * 7));
    }
    return result;
  }, [filtered, totalWeeks]);

  const flatSlots = useMemo(() => weeks.flat(), [weeks]);

  const focusCell = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, flatSlots.length - 1));
    const slot = flatSlots[clamped];
    if (slot) {
      const el = cellRefs.current.get(slot.id);
      el?.focus();
      focusedIndex.current = clamped;
    }
  }, [flatSlots]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let next = index;
    switch (e.key) {
      case "ArrowRight":
        next = index + 1;
        break;
      case "ArrowLeft":
        next = index - 1;
        break;
      case "ArrowDown":
        next = index + 7;
        break;
      case "ArrowUp":
        next = index - 7;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onClickSlot(flatSlots[index]);
        return;
      default:
        return;
    }
    e.preventDefault();
    focusCell(next);
  }, [flatSlots, focusCell, onClickSlot]);

  return (
    <div role="grid" aria-label={`${shiftView} shift schedule`}>
      {/* Day headers - sticky */}
      <div role="row" className="grid grid-cols-7 gap-2 mb-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2.5 -mx-1 px-1">
        {DAYS.map((day) => (
          <div key={day} role="columnheader" className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="space-y-4">
        {weeks.map((week, wi) => {
          const weekStartIndex = wi * 7;
          return (
            <div key={wi}>
              <div className="flex items-center gap-2 mb-2 pl-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">
                  Week {wi + 1}
                </p>
                <div className="flex-1 h-px bg-border/60" />
              </div>
              <div role="row" className="grid grid-cols-7 gap-2">
                {week.map((slot, di) => {
                  const cellIndex = weekStartIndex + di;
                  const status = getCoverageStatus(slot);
                  const lead = getLeadAssignment(slot);
                  const staff = getStaffAssignments(slot);
                  const date = parseISO(slot.date);
                  const monthLabel = isFirstDayOfMonth(date) ? format(date, "MMM") : null;
                  const today = isToday(date);
                  const weekend = isWeekend(date);
                  const dimmed = issuesOnly && status === "ok";
                  const swapped = swappedSlotIds.has(slot.id);

                  return (
                    <button
                      key={slot.id}
                      ref={(el) => {
                        if (el) cellRefs.current.set(slot.id, el);
                        else cellRefs.current.delete(slot.id);
                      }}
                      role="gridcell"
                      tabIndex={cellIndex === 0 ? 0 : -1}
                      onClick={() => onClickSlot(slot)}
                      onKeyDown={(e) => handleKeyDown(e, cellIndex)}
                      aria-label={`${format(date, "EEEE, MMMM d")} — ${slot.assignments.length} of ${slot.minStaff} staff assigned${swapped ? " (modified by swap)" : ""}`}
                      className={cn(
                        "group relative rounded-lg border p-2.5 text-left transition-all duration-150",
                        "hover:shadow-md hover:-translate-y-px hover:border-primary/25",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        status === "ok" && !swapped && "bg-card border-border",
                        status === "ok" && !swapped && weekend && "bg-muted/40 border-border/70",
                        status === "ok" && swapped && "bg-accent/8 border-accent/30",
                        status === "warning" && "bg-warning/5 border-warning/25",
                        status === "error" && "bg-destructive/4 border-destructive/25",
                        today && "ring-2 ring-primary/30 shadow-sm",
                        dimmed && "opacity-25 hover:opacity-60"
                      )}
                    >
                      {/* Swap indicator with tooltip */}
                      {swapped && (() => {
                        const detail = swapDetails.get(slot.id);
                        const tooltipText = detail
                          ? `${detail.removedName}${detail.addedName ? ` → ${detail.addedName}` : " removed"} · Approved ${format(detail.approvedAt, "MMM d, h:mm a")}`
                          : "Modified by swap";
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <div className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-accent/15 border border-accent/25 cursor-help">
                                <ArrowLeftRight className="h-2.5 w-2.5 text-accent-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[200px]">
                              {tooltipText}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })()}
                      {/* Date header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-baseline gap-1">
                          <span className={cn(
                            "font-heading font-bold text-sm leading-none",
                            today && "text-primary"
                          )}>
                            {format(date, "d")}
                          </span>
                          {monthLabel && (
                            <span className="text-[9px] font-medium text-muted-foreground">{monthLabel}</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold font-heading tabular-nums leading-none",
                          status === "ok" ? "text-success" : status === "warning" ? "text-warning-foreground" : "text-destructive"
                        )}>
                          {slot.assignments.length}/{slot.minStaff}
                        </span>
                      </div>

                      {/* Lead */}
                      {lead ? (() => {
                        const leadAssignment = slot.assignments.find(a => a.therapistId === lead.id);
                        const leadStatus: AssignmentStatus = leadAssignment?.status ?? "active";
                        const statusMeta = ASSIGNMENT_STATUSES.find(s => s.value === leadStatus);
                        return (
                          <div className={cn(
                            "rounded-md px-2 py-1 mb-1.5 border",
                            leadStatus === "active" ? "bg-primary/8 border-primary/10" :
                            leadStatus === "cancelled" || leadStatus === "call-in" ? "bg-destructive/8 border-destructive/10" :
                            "bg-warning/8 border-warning/10"
                          )}>
                            <p className="text-[8px] text-primary/60 leading-none font-medium uppercase tracking-wider">Lead</p>
                            <AssignmentStatusPopover slotId={slot.id} therapistId={lead.id} therapistName={lead.name} currentStatus={leadStatus} isLead>
                              <span className={cn(
                                "text-[11px] font-semibold mt-0.5 inline-flex items-center gap-1",
                                leadStatus === "active" ? "text-primary" :
                                leadStatus === "cancelled" || leadStatus === "call-in" ? "text-destructive line-through" :
                                "text-warning-foreground"
                              )}>
                                {lead.name}
                                {leadStatus !== "active" && (
                                  <span className={cn("text-[8px] font-medium no-underline", statusMeta?.color)}>
                                    {statusMeta?.label}
                                  </span>
                                )}
                              </span>
                            </AssignmentStatusPopover>
                          </div>
                        );
                      })() : slot.assignments.length > 0 ? (
                        <div className="rounded-md bg-destructive/8 px-2 py-1 mb-1.5 border border-destructive/10">
                          <p className="text-[9px] font-medium text-destructive">No lead</p>
                        </div>
                      ) : null}

                      {/* Staff */}
                      {staff.length > 0 && (
                        <div className="space-y-0">
                          {staff.map((t) => {
                            const assignment = slot.assignments.find(a => a.therapistId === t.id);
                            const assignmentStatus: AssignmentStatus = assignment?.status ?? "active";
                            const statusMeta = ASSIGNMENT_STATUSES.find(s => s.value === assignmentStatus);
                            return (
                              <AssignmentStatusPopover key={t.id} slotId={slot.id} therapistId={t.id} therapistName={t.name} currentStatus={assignmentStatus}>
                                <span className={cn(
                                  "text-[10px] leading-relaxed inline-flex items-center gap-1",
                                  assignmentStatus === "active" ? "text-foreground/60" :
                                  assignmentStatus === "cancelled" || assignmentStatus === "call-in" ? "text-destructive/60 line-through" :
                                  "text-warning-foreground/70"
                                )}>
                                  {t.name}
                                  {assignmentStatus !== "active" && (
                                    <span className={cn("text-[8px] font-medium no-underline", statusMeta?.color)}>
                                      {statusMeta?.label}
                                    </span>
                                  )}
                                </span>
                              </AssignmentStatusPopover>
                            );
                          })}
                        </div>
                      )}

                      {slot.assignments.length === 0 && (
                        <p className="text-[9px] text-destructive/30 mt-2 text-center italic">Unassigned</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
