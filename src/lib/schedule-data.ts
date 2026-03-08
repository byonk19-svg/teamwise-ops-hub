import { addDays, format, startOfWeek } from "date-fns";

export interface Therapist {
  id: string;
  name: string;
  initials: string;
  role: "lead" | "staff";
  color: string;
}

export interface ShiftAssignment {
  therapistId: string;
}

export interface ShiftSlot {
  id: string;
  date: string; // ISO date string
  type: "day" | "night";
  assignments: ShiftAssignment[];
  minStaff: number;
  maxStaff: number;
  needsLead: boolean;
}

export type ScheduleWeek = ShiftSlot[];

export const THERAPISTS: Therapist[] = [
  { id: "t1", name: "Jamie Mitchell", initials: "JM", role: "lead", color: "187 55% 28%" },
  { id: "t2", name: "Alex Chen", initials: "AC", role: "lead", color: "152 50% 38%" },
  { id: "t3", name: "Sam Rivera", initials: "SR", role: "staff", color: "38 90% 45%" },
  { id: "t4", name: "Jordan Lee", initials: "JL", role: "staff", color: "280 45% 45%" },
  { id: "t5", name: "Taylor Brooks", initials: "TB", role: "staff", color: "0 55% 50%" },
  { id: "t6", name: "Morgan Patel", initials: "MP", role: "staff", color: "210 50% 45%" },
  { id: "t7", name: "Casey Wong", initials: "CW", role: "staff", color: "160 45% 40%" },
  { id: "t8", name: "Riley Nguyen", initials: "RN", role: "staff", color: "30 60% 45%" },
];

export function generateSchedule(startDate: Date, weeks: number = 6): ShiftSlot[] {
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  const slots: ShiftSlot[] = [];

  for (let d = 0; d < weeks * 7; d++) {
    const date = format(addDays(start, d), "yyyy-MM-dd");
    const daySlot: ShiftSlot = {
      id: `${date}-day`,
      date,
      type: "day",
      assignments: [],
      minStaff: 3,
      maxStaff: 5,
      needsLead: true,
    };
    const nightSlot: ShiftSlot = {
      id: `${date}-night`,
      date,
      type: "night",
      assignments: [],
      minStaff: 2,
      maxStaff: 4,
      needsLead: true,
    };

    // Pre-populate some assignments for realism
    if (d % 3 === 0) {
      daySlot.assignments = [{ therapistId: "t1" }, { therapistId: "t3" }, { therapistId: "t5" }];
      nightSlot.assignments = [{ therapistId: "t2" }, { therapistId: "t6" }];
    } else if (d % 3 === 1) {
      daySlot.assignments = [{ therapistId: "t2" }, { therapistId: "t4" }];
      nightSlot.assignments = [{ therapistId: "t1" }, { therapistId: "t7" }, { therapistId: "t8" }];
    } else {
      // Leave some empty for coverage gaps
      daySlot.assignments = [{ therapistId: "t3" }];
      nightSlot.assignments = [];
    }
    slots.push(daySlot, nightSlot);
  }
  return slots;
}

export function getTherapist(id: string): Therapist | undefined {
  return THERAPISTS.find((t) => t.id === id);
}

export function getCoverageStatus(slot: ShiftSlot): "ok" | "warning" | "error" {
  const count = slot.assignments.length;
  const hasLead = slot.needsLead
    ? slot.assignments.some((a) => getTherapist(a.therapistId)?.role === "lead")
    : true;

  if (count === 0) return "error";
  if (count < slot.minStaff || !hasLead) return "warning";
  return "ok";
}
