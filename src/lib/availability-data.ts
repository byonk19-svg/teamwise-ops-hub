import { addDays, format } from "date-fns";
import { THERAPISTS, Therapist } from "./schedule-data";

export type AvailabilityStatus = "available" | "unavailable" | "preferred" | "unset";

export interface AvailabilityEntry {
  id: string;
  therapistId: string;
  date: string; // yyyy-MM-dd
  status: AvailabilityStatus;
  note?: string;
}

export interface AvailabilitySubmission {
  id: string;
  therapistId: string;
  submittedAt: string;
  cycleLabel: string;
  entries: AvailabilityEntry[];
  status: "pending" | "approved" | "rejected";
}

const CYCLE_START = new Date(2026, 4, 3); // Next cycle: May 3
const CYCLE_WEEKS = 6;
const CYCLE_DAYS = CYCLE_WEEKS * 7;

export const NEXT_CYCLE = {
  start: CYCLE_START,
  end: addDays(CYCLE_START, CYCLE_DAYS - 1),
  weeks: CYCLE_WEEKS,
  label: `${format(CYCLE_START, "MMM d")} – ${format(addDays(CYCLE_START, CYCLE_DAYS - 1), "MMM d, yyyy")}`,
};

function generateEntries(therapistId: string, seed: number): AvailabilityEntry[] {
  const entries: AvailabilityEntry[] = [];
  for (let d = 0; d < CYCLE_DAYS; d++) {
    const date = format(addDays(CYCLE_START, d), "yyyy-MM-dd");
    const rand = ((seed * 31 + d * 17) % 100);
    let status: AvailabilityStatus = "available";
    if (rand < 12) status = "unavailable";
    else if (rand < 22) status = "preferred";

    entries.push({
      id: `${therapistId}-${date}`,
      therapistId,
      date,
      status,
      note: status === "unavailable" && rand < 8 ? "PTO" : undefined,
    });
  }
  return entries;
}

// Pre-generate some submissions (some therapists have submitted, others haven't)
export function generateSubmissions(): AvailabilitySubmission[] {
  const submitted: AvailabilitySubmission[] = [];

  // First 5 therapists have submitted
  const submittedTherapists = THERAPISTS.slice(0, 5);
  submittedTherapists.forEach((t, i) => {
    submitted.push({
      id: `sub-${t.id}`,
      therapistId: t.id,
      submittedAt: format(addDays(new Date(), -(5 - i)), "yyyy-MM-dd'T'HH:mm"),
      cycleLabel: NEXT_CYCLE.label,
      entries: generateEntries(t.id, i * 7 + 3),
      status: i < 2 ? "approved" : "pending",
    });
  });

  return submitted;
}

export function getTherapistSubmission(
  submissions: AvailabilitySubmission[],
  therapistId: string
): AvailabilitySubmission | undefined {
  return submissions.find((s) => s.therapistId === therapistId);
}

export function getSubmissionStats(submissions: AvailabilitySubmission[]) {
  const total = THERAPISTS.length;
  const submitted = submissions.length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  return { total, submitted, approved, pending, missing: total - submitted };
}
