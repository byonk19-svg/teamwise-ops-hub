import { ShiftSlot, THERAPISTS, Therapist, ShiftAssignment } from "./schedule-data";
import { getPreferences } from "./therapist-preferences";
import { getDay, parseISO } from "date-fns";

/**
 * Auto-draft algorithm:
 * 1. For each slot, pick therapists respecting:
 *    - HARD: firm unavailable days are never violated
 *    - SOFT: prefer therapists whose preferred days include this day
 *    - Each slot needs 1 lead + (minStaff - 1) staff
 *    - Balances shift counts across therapists
 * 2. Returns a new set of slots with assignments filled.
 */

interface TherapistScore {
  therapist: Therapist;
  shiftCount: number; // running total for fairness
  isPreferred: boolean;
  isAvailable: boolean; // not firm-unavailable
}

export interface AutoDraftResult {
  slots: ShiftSlot[];
  conflicts: AutoDraftConflict[];
  stats: { totalAssignments: number; preferencesHonored: number; preferencesViolated: number };
}

export interface AutoDraftConflict {
  slotId: string;
  date: string;
  type: "day" | "night";
  reason: string;
}

export function autoDraft(baseSlots: ShiftSlot[]): AutoDraftResult {
  const leads = THERAPISTS.filter((t) => t.role === "lead");
  const staff = THERAPISTS.filter((t) => t.role === "staff");

  // Track shift counts for fair distribution
  const shiftCounts = new Map<string, number>();
  THERAPISTS.forEach((t) => shiftCounts.set(t.id, 0));

  // Track per-day assignments to avoid double-booking
  const dayAssignments = new Map<string, Set<string>>(); // date -> set of therapist IDs

  const conflicts: AutoDraftConflict[] = [];
  let preferencesHonored = 0;
  let preferencesViolated = 0;
  let totalAssignments = 0;

  // Process slots in order (day shifts first per date, then night)
  const sorted = [...baseSlots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.type === "day" ? -1 : 1;
  });

  const newSlots = new Map<string, ShiftSlot>();

  for (const slot of sorted) {
    const dayOfWeek = getDay(parseISO(slot.date));
    const dateKey = slot.date;

    if (!dayAssignments.has(dateKey)) {
      dayAssignments.set(dateKey, new Set());
    }
    const usedToday = dayAssignments.get(dateKey)!;

    // Score and sort candidates
    const scoreCandidates = (pool: Therapist[]): TherapistScore[] => {
      return pool.map((t) => {
        const prefs = getPreferences(t.id);
        const firmUnavail = prefs.firmUnavailable && prefs.unavailableDays.includes(dayOfWeek);
        const isPreferred = prefs.preferredDays.includes(dayOfWeek);
        return {
          therapist: t,
          shiftCount: shiftCounts.get(t.id) ?? 0,
          isPreferred,
          isAvailable: !firmUnavail,
        };
      });
    };

    const pickBest = (candidates: TherapistScore[], count: number, exclude: Set<string>): Therapist[] => {
      const available = candidates
        .filter((c) => c.isAvailable && !exclude.has(c.therapist.id) && !usedToday.has(c.therapist.id));

      // Sort: preferred first, then by fewest shifts (fairness)
      available.sort((a, b) => {
        if (a.isPreferred !== b.isPreferred) return a.isPreferred ? -1 : 1;
        return a.shiftCount - b.shiftCount;
      });

      const picked = available.slice(0, count);

      // Track preference stats
      for (const p of picked) {
        if (p.isPreferred) preferencesHonored++;
        else preferencesViolated++;
      }

      return picked.map((p) => p.therapist);
    };

    const assigned: ShiftAssignment[] = [];
    const excludeSet = new Set<string>();

    // Pick lead
    if (slot.needsLead) {
      const leadCandidates = scoreCandidates(leads);
      const pickedLeads = pickBest(leadCandidates, 1, excludeSet);
      if (pickedLeads.length > 0) {
        assigned.push({ therapistId: pickedLeads[0].id });
        excludeSet.add(pickedLeads[0].id);
        usedToday.add(pickedLeads[0].id);
        shiftCounts.set(pickedLeads[0].id, (shiftCounts.get(pickedLeads[0].id) ?? 0) + 1);
      } else {
        conflicts.push({
          slotId: slot.id,
          date: slot.date,
          type: slot.type,
          reason: "No available lead therapist",
        });
      }
    }

    // Pick staff to reach minStaff
    const staffNeeded = Math.max(0, slot.minStaff - assigned.length);
    const staffCandidates = scoreCandidates(staff);
    const pickedStaff = pickBest(staffCandidates, staffNeeded, excludeSet);

    for (const s of pickedStaff) {
      assigned.push({ therapistId: s.id });
      excludeSet.add(s.id);
      usedToday.add(s.id);
      shiftCounts.set(s.id, (shiftCounts.get(s.id) ?? 0) + 1);
    }

    if (assigned.length < slot.minStaff) {
      conflicts.push({
        slotId: slot.id,
        date: slot.date,
        type: slot.type,
        reason: `Only ${assigned.length} of ${slot.minStaff} minimum staff could be assigned`,
      });
    }

    totalAssignments += assigned.length;
    newSlots.set(slot.id, { ...slot, assignments: assigned });
  }

  // Rebuild in original order
  const result = baseSlots.map((s) => newSlots.get(s.id) ?? s);

  return {
    slots: result,
    conflicts,
    stats: { totalAssignments, preferencesHonored, preferencesViolated },
  };
}
