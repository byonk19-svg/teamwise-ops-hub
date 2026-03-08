import { Therapist } from "./schedule-data";

export interface TherapistPreferences {
  preferredDays: number[]; // 0=Sun..6=Sat
  unavailableDays: number[]; // days they prefer NOT to work
  preferredWeekends: "every" | "alternating" | "none" | "as-needed";
  notes: string;
}

const defaults: TherapistPreferences = {
  preferredDays: [1, 2, 3, 4, 5],
  unavailableDays: [],
  preferredWeekends: "as-needed",
  notes: "",
};

// Seed realistic preferences
const SEED: Record<string, Partial<TherapistPreferences>> = {
  t1: { preferredDays: [1, 2, 3, 4, 5], preferredWeekends: "alternating", notes: "Prefers day shifts" },
  t2: { preferredDays: [1, 2, 4, 5], preferredWeekends: "as-needed" },
  t3: { preferredDays: [0, 1, 2, 3, 4], preferredWeekends: "every", notes: "Flexible on Sundays" },
  t4: { preferredDays: [1, 3, 4, 5], preferredWeekends: "none" },
  t5: { preferredDays: [1, 2, 3, 4, 5], preferredWeekends: "alternating" },
  t6: { preferredDays: [2, 3, 4, 5], preferredWeekends: "as-needed", notes: "No Mondays if possible" },
  t7: { preferredDays: [1, 2, 3, 4, 5], preferredWeekends: "none" },
  t8: { preferredDays: [1, 2, 3, 4], preferredWeekends: "alternating" },
  t9: { preferredDays: [1, 2, 3, 4, 5, 6], preferredWeekends: "every" },
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

export const WEEKEND_OPTIONS: { value: TherapistPreferences["preferredWeekends"]; label: string }[] = [
  { value: "every", label: "Every weekend" },
  { value: "alternating", label: "Alternating weekends" },
  { value: "as-needed", label: "As needed" },
  { value: "none", label: "No weekends" },
];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
