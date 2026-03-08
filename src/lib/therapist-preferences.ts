import { Therapist } from "./schedule-data";
import { getDay, parseISO } from "date-fns";

export interface TherapistPreferences {
  preferredDays: number[]; // 0=Sun..6=Sat
  unavailableDays: number[]; // days they prefer NOT to work
  firmUnavailable: boolean; // true = hard constraint for auto-draft
  preferredWeekends: "every" | "alternating" | "none" | "as-needed";
  notes: string;
}

const defaults: TherapistPreferences = {
  preferredDays: [1, 2, 3, 4, 5],
  unavailableDays: [],
  firmUnavailable: true,
  preferredWeekends: "as-needed",
  notes: "",
};

// Seed realistic preferences
const SEED: Record<string, Partial<TherapistPreferences>> = {
  t1: { preferredDays: [1, 2, 3, 4, 5], unavailableDays: [0], firmUnavailable: true, preferredWeekends: "alternating", notes: "Prefers day shifts" },
  t2: { preferredDays: [1, 2, 4, 5], unavailableDays: [3], firmUnavailable: true, preferredWeekends: "as-needed" },
  t3: { preferredDays: [0, 1, 2, 3, 4], unavailableDays: [6], firmUnavailable: true, preferredWeekends: "every", notes: "Flexible on Sundays" },
  t4: { preferredDays: [1, 3, 4, 5], unavailableDays: [0, 6], firmUnavailable: true, preferredWeekends: "none" },
  t5: { preferredDays: [1, 2, 3, 4, 5], unavailableDays: [], firmUnavailable: true, preferredWeekends: "alternating" },
  t6: { preferredDays: [2, 3, 4, 5], unavailableDays: [1], firmUnavailable: true, preferredWeekends: "as-needed", notes: "No Mondays if possible" },
  t7: { preferredDays: [1, 2, 3, 4, 5], unavailableDays: [0, 6], firmUnavailable: true, preferredWeekends: "none" },
  t8: { preferredDays: [1, 2, 3, 4], unavailableDays: [5], firmUnavailable: true, preferredWeekends: "alternating" },
  t9: { preferredDays: [1, 2, 3, 4, 5, 6], unavailableDays: [], firmUnavailable: true, preferredWeekends: "every" },
};

// In-memory store (would come from DB in production)
const store = new Map<string, TherapistPreferences>();

export function getPreferences(therapistId: string): TherapistPreferences {
  if (store.has(therapistId)) return store.get(therapistId)!;
  return { ...defaults, ...SEED[therapistId] };
}

export function setPreferences(therapistId: string, prefs: TherapistPreferences) {
  store.set(therapistId, prefs);
}

/** Check if a therapist is assigned on one of their unavailable days */
export function isOnUnavailableDay(therapistId: string, dateStr: string): boolean {
  const prefs = getPreferences(therapistId);
  if (prefs.unavailableDays.length === 0) return false;
  const dayOfWeek = getDay(parseISO(dateStr));
  return prefs.unavailableDays.includes(dayOfWeek);
}

export const WEEKEND_OPTIONS: { value: TherapistPreferences["preferredWeekends"]; label: string }[] = [
  { value: "every", label: "Every weekend" },
  { value: "alternating", label: "Alternating weekends" },
  { value: "as-needed", label: "As needed" },
  { value: "none", label: "No weekends" },
];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
