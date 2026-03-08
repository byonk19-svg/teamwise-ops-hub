import { addDays, format, startOfWeek, getDay } from "date-fns";

export interface Therapist {
  id: string;
  name: string;
  initials: string;
  role: "lead" | "staff";
  color: string; // HSL values
}

export type AssignmentStatus = "active" | "leave-early" | "cancelled" | "call-in" | "on-call";

export const ASSIGNMENT_STATUSES: { value: AssignmentStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "text-success" },
  { value: "leave-early", label: "Leave Early", color: "text-warning-foreground" },
  { value: "cancelled", label: "Cancelled", color: "text-destructive" },
  { value: "call-in", label: "Call In", color: "text-destructive" },
  { value: "on-call", label: "On Call", color: "text-muted-foreground" },
];

export interface ShiftAssignment {
  therapistId: string;
  status?: AssignmentStatus;
}

export interface ShiftSlot {
  id: string;
  date: string; // yyyy-MM-dd
  type: "day" | "night";
  assignments: ShiftAssignment[];
  minStaff: number;
  maxStaff: number;
  needsLead: boolean;
}

export const THERAPISTS: Therapist[] = [
  { id: "t1", name: "Brianna", initials: "BY", role: "lead", color: "187 55% 28%" },
  { id: "t2", name: "Kim", initials: "KM", role: "lead", color: "187 55% 28%" },
  { id: "t3", name: "Barbara", initials: "BA", role: "lead", color: "187 55% 28%" },
  { id: "t4", name: "Adrienne", initials: "AD", role: "lead", color: "187 55% 28%" },
  { id: "t5", name: "Aleyce", initials: "AL", role: "staff", color: "220 12% 55%" },
  { id: "t6", name: "Lynn", initials: "LW", role: "staff", color: "220 12% 55%" },
  { id: "t7", name: "Irene", initials: "IR", role: "staff", color: "220 12% 55%" },
  { id: "t8", name: "Tannie", initials: "TN", role: "staff", color: "220 12% 55%" },
  { id: "t9", name: "Layne", initials: "LN", role: "staff", color: "220 12% 55%" },
];

export function getTherapist(id: string): Therapist | undefined {
  return THERAPISTS.find((t) => t.id === id);
}

/** Returns the active lead (prefers non-cancelled/call-in/on-call) */
export function getLeadAssignment(slot: ShiftSlot): Therapist | undefined {
  // First pass: find an active lead
  for (const a of slot.assignments) {
    const t = getTherapist(a.therapistId);
    if (t?.role === "lead" && (!a.status || a.status === "active" || a.status === "leave-early")) return t;
  }
  // Fallback: any lead
  for (const a of slot.assignments) {
    const t = getTherapist(a.therapistId);
    if (t?.role === "lead") return t;
  }
  return undefined;
}

/** Returns leads that are inactive (cancelled, call-in, on-call) */
export function getInactiveLeads(slot: ShiftSlot): { therapist: Therapist; status: AssignmentStatus }[] {
  return slot.assignments
    .filter((a) => {
      const t = getTherapist(a.therapistId);
      return t?.role === "lead" && a.status && (a.status === "cancelled" || a.status === "call-in" || a.status === "on-call");
    })
    .map((a) => ({
      therapist: getTherapist(a.therapistId)!,
      status: a.status!,
    }));
}

export function getStaffAssignments(slot: ShiftSlot): Therapist[] {
  return slot.assignments
    .map((a) => getTherapist(a.therapistId))
    .filter((t): t is Therapist => !!t && t.role === "staff");
}

const INACTIVE_STATUSES: AssignmentStatus[] = ["cancelled", "call-in", "on-call"];

/** Count only active assignments (excludes cancelled, call-in, on-call) */
export function getActiveAssignmentCount(slot: ShiftSlot): number {
  return slot.assignments.filter((a) => !a.status || !INACTIVE_STATUSES.includes(a.status)).length;
}

export function getCoverageStatus(slot: ShiftSlot): "ok" | "warning" | "error" {
  const count = getActiveAssignmentCount(slot);
  const hasLead = slot.needsLead
    ? slot.assignments.some((a) => {
        const t = getTherapist(a.therapistId);
        return t?.role === "lead" && (!a.status || !INACTIVE_STATUSES.includes(a.status));
      })
    : true;

  if (count === 0) return "error";
  if (count < slot.minStaff || !hasLead) return "warning";
  return "ok";
}

// Rotation patterns for realistic schedule generation
const DAY_PATTERNS: string[][] = [
  ["t1", "t5", "t7", "t9"],   // Brianna + Aleyce, Irene, Layne
  ["t2", "t5", "t6", "t8"],   // Kim + Adrienne, Lynn, Tannie
  ["t3", "t5", "t1", "t9"],   // Barbara + Aleyce, Brianna, Layne
  ["t4", "t5", "t6", "t8"],   // Adrienne(lead) + Aleyce, Lynn, Tannie
  ["t1", "t5", "t9", "t6"],   // Brianna + Aleyce, Layne, Lynn
  ["t3", "t5", "t6", "t8"],   // Barbara + Aleyce, Lynn, Tannie
  ["t2", "t5", "t6", "t8"],   // Kim + Adrienne, Lynn, Tannie
];

const NIGHT_PATTERNS: string[][] = [
  ["t3", "t6", "t8"],
  ["t1", "t5", "t9"],
  ["t4", "t6", "t8"],
  ["t2", "t5", "t9"],
  ["t3", "t6", "t8"],
  ["t1", "t5", "t9"],
  ["t4", "t6", "t8"],
];

export function generateSchedule(startDate: Date, weeks: number = 6): ShiftSlot[] {
  const start = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday start
  const slots: ShiftSlot[] = [];

  for (let d = 0; d < weeks * 7; d++) {
    const date = format(addDays(start, d), "yyyy-MM-dd");
    const dayOfWeek = getDay(addDays(start, d)); // 0=Sun, 6=Sat
    const patternIdx = d % 7;

    const isSaturday = dayOfWeek === 6;

    // Day shift
    const dayAssignments: ShiftAssignment[] = isSaturday
      ? d % 21 === 0
        ? [] // Some Saturdays empty
        : [{ therapistId: "t2" }, { therapistId: "t7" }, { therapistId: "t5" }] // Sat staffing
      : DAY_PATTERNS[patternIdx].map((id) => ({ therapistId: id }));

    // Night shift
    const nightAssignments: ShiftAssignment[] = isSaturday
      ? [{ therapistId: "t3" }, { therapistId: "t6" }, { therapistId: "t8" }]
      : NIGHT_PATTERNS[patternIdx].map((id) => ({ therapistId: id }));

    const minDay = isSaturday ? 3 : 4;
    const minNight = isSaturday ? 3 : 3;

    slots.push({
      id: `${date}-day`,
      date,
      type: "day",
      assignments: dayAssignments,
      minStaff: minDay,
      maxStaff: 5,
      needsLead: true,
    });

    slots.push({
      id: `${date}-night`,
      date,
      type: "night",
      assignments: nightAssignments,
      minStaff: minNight,
      maxStaff: 5,
      needsLead: true,
    });
  }
  return slots;
}
