import { format, addDays } from "date-fns";
import { THERAPISTS, Therapist } from "./schedule-data";

// Must match the schedule cycle start in SchedulePage
const SCHEDULE_CYCLE_START = new Date(2026, 2, 22);

export type SwapStatus = "open" | "claimed" | "approved" | "rejected" | "cancelled" | "pending_peer";
export type SwapMode = "open" | "direct" | "trade";

export interface ShiftSwap {
  id: string;
  mode: SwapMode;
  requesterId: string;
  shiftDate: string;
  shiftType: "day" | "night";
  reason: string;
  postedAt: string;
  // For open swaps: who picked it up
  claimedById?: string;
  claimedAt?: string;
  // For direct requests: who was asked
  targetId?: string;
  // For mutual trades: the shift being offered in return
  tradeShiftDate?: string;
  tradeShiftType?: "day" | "night";
  status: SwapStatus;
  managerNote?: string;
}

export function generateSwaps(): ShiftSwap[] {
  const now = new Date();
  const cycleBase = SCHEDULE_CYCLE_START;
  const swaps: ShiftSwap[] = [
    // Open swaps
    {
      id: "sw1",
      mode: "open",
      requesterId: "t1",
      shiftDate: format(addDays(cycleBase, 3), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Medical appointment",
      postedAt: format(addDays(now, -0.125), "yyyy-MM-dd'T'HH:mm"),
      status: "open",
    },
    {
      id: "sw5",
      mode: "open",
      requesterId: "t7",
      shiftDate: format(addDays(cycleBase, 10), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Out of town",
      postedAt: format(addDays(now, -0.25), "yyyy-MM-dd'T'HH:mm"),
      status: "open",
    },
    // Direct request (accepted by target, pending manager)
    {
      id: "sw3",
      mode: "direct",
      requesterId: "t6",
      shiftDate: format(addDays(cycleBase, 2), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Personal day",
      postedAt: format(addDays(now, -1), "yyyy-MM-dd'T'HH:mm"),
      targetId: "t8",
      claimedById: "t8",
      claimedAt: format(addDays(now, -0.5), "yyyy-MM-dd'T'HH:mm"),
      status: "claimed",
    },
    // Direct request (waiting for target to accept)
    {
      id: "sw7",
      mode: "direct",
      requesterId: "t1",
      shiftDate: format(addDays(cycleBase, 12), "yyyy-MM-dd"),
      shiftType: "night",
      reason: "Family event",
      postedAt: format(addDays(now, -0.3), "yyyy-MM-dd'T'HH:mm"),
      targetId: "t5",
      status: "pending_peer",
    },
    // Mutual trade (both agreed, pending manager)
    {
      id: "sw6",
      mode: "trade",
      requesterId: "t2",
      shiftDate: format(addDays(cycleBase, 1), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Childcare issue",
      postedAt: format(addDays(now, -2), "yyyy-MM-dd'T'HH:mm"),
      targetId: "t4",
      claimedById: "t4",
      claimedAt: format(addDays(now, -1.5), "yyyy-MM-dd'T'HH:mm"),
      tradeShiftDate: format(addDays(cycleBase, 4), "yyyy-MM-dd"),
      tradeShiftType: "day",
      status: "claimed",
    },
    // Mutual trade (waiting for peer)
    {
      id: "sw8",
      mode: "trade",
      requesterId: "t3",
      shiftDate: format(addDays(cycleBase, 7), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Schedule conflict",
      postedAt: format(addDays(now, -0.5), "yyyy-MM-dd'T'HH:mm"),
      targetId: "t5",
      tradeShiftDate: format(addDays(cycleBase, 9), "yyyy-MM-dd"),
      tradeShiftType: "night",
      status: "pending_peer",
    },
    // Approved
    {
      id: "sw4",
      mode: "open",
      requesterId: "t3",
      shiftDate: format(addDays(cycleBase, 8), "yyyy-MM-dd"),
      shiftType: "night",
      reason: "Training conflict",
      postedAt: format(addDays(now, -3), "yyyy-MM-dd'T'HH:mm"),
      claimedById: "t9",
      claimedAt: format(addDays(now, -2), "yyyy-MM-dd'T'HH:mm"),
      status: "approved",
    },
  ];

  return swaps;
}

export function getSwapStats(swaps: ShiftSwap[]) {
  return {
    open: swaps.filter((s) => s.status === "open").length,
    claimed: swaps.filter((s) => s.status === "claimed").length,
    pendingPeer: swaps.filter((s) => s.status === "pending_peer").length,
    approved: swaps.filter((s) => s.status === "approved").length,
    total: swaps.length,
  };
}

export function getSwapModeLabel(mode: SwapMode): string {
  switch (mode) {
    case "open": return "Open Board";
    case "direct": return "Direct Request";
    case "trade": return "Mutual Trade";
  }
}
