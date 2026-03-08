import { format, addDays } from "date-fns";
import { THERAPISTS, Therapist } from "./schedule-data";

export type SwapStatus = "open" | "claimed" | "approved" | "rejected" | "cancelled";

export interface ShiftSwap {
  id: string;
  requesterId: string;
  shiftDate: string; // yyyy-MM-dd
  shiftType: "day" | "night";
  reason: string;
  postedAt: string;
  claimedById?: string;
  claimedAt?: string;
  status: SwapStatus;
  managerNote?: string;
}

const REASONS = [
  "Medical appointment",
  "Family event",
  "Personal day",
  "Training conflict",
  "Childcare issue",
  "Out of town",
  "Schedule conflict",
];

export function generateSwaps(): ShiftSwap[] {
  const now = new Date();
  const swaps: ShiftSwap[] = [
    {
      id: "sw1",
      requesterId: "t1",
      shiftDate: format(addDays(now, 3), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Medical appointment",
      postedAt: format(addDays(now, -0.125), "yyyy-MM-dd'T'HH:mm"),
      status: "open",
    },
    {
      id: "sw2",
      requesterId: "t5",
      shiftDate: format(addDays(now, 5), "yyyy-MM-dd"),
      shiftType: "night",
      reason: "Family event",
      postedAt: format(addDays(now, -0.5), "yyyy-MM-dd'T'HH:mm"),
      status: "open",
    },
    {
      id: "sw3",
      requesterId: "t6",
      shiftDate: format(addDays(now, 2), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Personal day",
      postedAt: format(addDays(now, -1), "yyyy-MM-dd'T'HH:mm"),
      claimedById: "t8",
      claimedAt: format(addDays(now, -0.5), "yyyy-MM-dd'T'HH:mm"),
      status: "claimed",
    },
    {
      id: "sw4",
      requesterId: "t3",
      shiftDate: format(addDays(now, -1), "yyyy-MM-dd"),
      shiftType: "night",
      reason: "Training conflict",
      postedAt: format(addDays(now, -3), "yyyy-MM-dd'T'HH:mm"),
      claimedById: "t9",
      claimedAt: format(addDays(now, -2), "yyyy-MM-dd'T'HH:mm"),
      status: "approved",
    },
    {
      id: "sw5",
      requesterId: "t7",
      shiftDate: format(addDays(now, 7), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Out of town",
      postedAt: format(addDays(now, -0.25), "yyyy-MM-dd'T'HH:mm"),
      status: "open",
    },
    {
      id: "sw6",
      requesterId: "t2",
      shiftDate: format(addDays(now, 1), "yyyy-MM-dd"),
      shiftType: "day",
      reason: "Childcare issue",
      postedAt: format(addDays(now, -2), "yyyy-MM-dd'T'HH:mm"),
      claimedById: "t4",
      claimedAt: format(addDays(now, -1.5), "yyyy-MM-dd'T'HH:mm"),
      status: "claimed",
    },
  ];

  return swaps;
}

export function getSwapStats(swaps: ShiftSwap[]) {
  return {
    open: swaps.filter((s) => s.status === "open").length,
    claimed: swaps.filter((s) => s.status === "claimed").length,
    approved: swaps.filter((s) => s.status === "approved").length,
    total: swaps.length,
  };
}
