import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ShiftSlot, generateSchedule } from "@/lib/schedule-data";

const CYCLE_START = new Date(2026, 2, 22);
const TOTAL_WEEKS = 6;

interface ScheduleContextValue {
  slots: ShiftSlot[];
  cycleStart: Date;
  totalWeeks: number;
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
      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.id !== `${shiftDate}-${shiftType}`) return slot;

          let assignments = slot.assignments.filter(
            (a) => a.therapistId !== removedId
          );
          if (addedId && !assignments.some((a) => a.therapistId === addedId)) {
            assignments = [...assignments, { therapistId: addedId }];
          }
          return { ...slot, assignments };
        })
      );
    },
    []
  );

  return (
    <ScheduleContext.Provider
      value={{ slots, cycleStart: CYCLE_START, totalWeeks: TOTAL_WEEKS, setSlots, applySwap }}
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
