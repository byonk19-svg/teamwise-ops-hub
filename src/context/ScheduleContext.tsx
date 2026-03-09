import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { ShiftSlot, generateSchedule, getTherapist, AssignmentStatus } from "@/lib/schedule-data";
import { useRealtimeSchedule } from "@/hooks/useRealtimeSchedule";

const CYCLE_START = new Date(2026, 2, 22);
const TOTAL_WEEKS = 6;

export interface SwapDetail {
  removedName: string;
  addedName?: string;
  approvedAt: Date;
}

interface ScheduleContextValue {
  slots: ShiftSlot[];
  cycleStart: Date;
  totalWeeks: number;
  swappedSlotIds: Set<string>;
  swapDetails: Map<string, SwapDetail>;
  setSlots: React.Dispatch<React.SetStateAction<ShiftSlot[]>>;
  setAssignmentStatus: (slotId: string, therapistId: string, status: AssignmentStatus) => void;
  replaceLead: (slotId: string, oldLeadId: string, newLeadId: string) => void;
  applySwap: (params: {
    shiftDate: string;
    shiftType: "day" | "night";
    removedId: string;
    addedId?: string;
  }) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<ShiftSlot[]>(() =>
    generateSchedule(CYCLE_START, TOTAL_WEEKS)
  );
  const [swappedSlotIds, setSwappedSlotIds] = useState<Set<string>>(new Set());
  const [swapDetails, setSwapDetails] = useState<Map<string, SwapDetail>>(new Map());

  const { logScheduleEvent } = useRealtimeSchedule({
    onScheduleChange: (event) => {
      // Refetch slots if needed based on schedule events
      console.log('Schedule changed:', event);
    }
  });

  const applySwap = useCallback(
    ({
      shiftDate,
      shiftType,
      removedId,
      addedId,
    }: {
      shiftDate: string;
      shiftType: "day" | "night";
      removedId: string;
      addedId?: string;
    }) => {
      const slotId = `${shiftDate}-${shiftType}`;

      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.id !== slotId) return slot;

          let assignments = slot.assignments.filter(
            (a) => a.therapistId !== removedId
          );
          if (addedId && !assignments.some((a) => a.therapistId === addedId)) {
            assignments = [...assignments, { therapistId: addedId }];
          }
          return { ...slot, assignments };
        })
      );

      setSwappedSlotIds((prev) => new Set(prev).add(slotId));
      setSwapDetails((prev) => {
        const next = new Map(prev);
        next.set(slotId, {
          removedName: getTherapist(removedId)?.name ?? removedId,
          addedName: addedId ? getTherapist(addedId)?.name : undefined,
          approvedAt: new Date(),
        });
        return next;
      });
    },
    []
  );

  const setAssignmentStatus = useCallback(
    (slotId: string, therapistId: string, status: AssignmentStatus) => {
      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.id !== slotId) return slot;
          return {
            ...slot,
            assignments: slot.assignments.map((a) =>
              a.therapistId === therapistId ? { ...a, status } : a
            ),
          };
        })
      );
    },
    []
  );

  const replaceLead = useCallback(
    (slotId: string, oldLeadId: string, newLeadId: string) => {
      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.id !== slotId) return slot;
          // Keep old lead with their status (cancelled/call-in), add new lead
          let assignments = [...slot.assignments];
          if (!assignments.some((a) => a.therapistId === newLeadId)) {
            assignments = [...assignments, { therapistId: newLeadId }];
          }
          return { ...slot, assignments };
        })
      );
    },
    []
  );

  return (
    <ScheduleContext.Provider
      value={{ slots, cycleStart: CYCLE_START, totalWeeks: TOTAL_WEEKS, swappedSlotIds, swapDetails, setSlots, setAssignmentStatus, replaceLead, applySwap }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
