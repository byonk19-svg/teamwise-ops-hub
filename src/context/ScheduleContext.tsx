import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ShiftSlot, generateSchedule, getTherapist } from "@/lib/schedule-data";

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

  return (
    <ScheduleContext.Provider
      value={{ slots, cycleStart: CYCLE_START, totalWeeks: TOTAL_WEEKS, swappedSlotIds, swapDetails, setSlots, applySwap }}
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
