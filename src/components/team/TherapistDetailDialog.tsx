import { useMemo, useState } from "react";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { Therapist, AssignmentStatus, ASSIGNMENT_STATUSES } from "@/lib/schedule-data";
import { useSchedule } from "@/context/ScheduleContext";
import { getPreferences, setPreferences, TherapistPreferences, WEEKEND_OPTIONS, DAY_LABELS } from "@/lib/therapist-preferences";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, Settings2, Sun, Moon } from "lucide-react";

interface Props {
  therapist: Therapist | null;
  certifications: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INACTIVE: AssignmentStatus[] = ["cancelled", "call-in", "on-call"];

export function TherapistDetailDialog({ therapist, certifications, open, onOpenChange }: Props) {
  const { slots } = useSchedule();
  const today = startOfDay(new Date());

  const shifts = useMemo(() => {
    if (!therapist) return { upcoming: [], past: [] };
    const all = slots
      .filter((s) => s.assignments.some((a) => a.therapistId === therapist.id))
      .map((s) => {
        const assignment = s.assignments.find((a) => a.therapistId === therapist.id)!;
        const status = assignment.status ?? "active";
        return { slot: s, date: parseISO(s.date), status };
      });
    return {
      upcoming: all.filter((s) => !isBefore(s.date, today)).slice(0, 14),
      past: all.filter((s) => isBefore(s.date, today)).reverse().slice(0, 14),
    };
  }, [therapist, slots, today]);

  const [prefs, setLocalPrefs] = useState<TherapistPreferences | null>(null);

  const currentPrefs = prefs ?? (therapist ? getPreferences(therapist.id) : null);

  const handleSavePrefs = () => {
    if (therapist && currentPrefs) {
      setPreferences(therapist.id, currentPrefs);
      setLocalPrefs(null);
    }
  };

  const toggleDay = (day: number) => {
    if (!currentPrefs) return;
    const next = currentPrefs.preferredDays.includes(day)
      ? currentPrefs.preferredDays.filter((d) => d !== day)
      : [...currentPrefs.preferredDays, day].sort();
    // Remove from unavailable if adding to preferred
    const nextUnavail = currentPrefs.unavailableDays.filter((d) => d !== day);
    setLocalPrefs({ ...currentPrefs, preferredDays: next, unavailableDays: nextUnavail });
  };

  const toggleUnavailableDay = (day: number) => {
    if (!currentPrefs) return;
    const next = currentPrefs.unavailableDays.includes(day)
      ? currentPrefs.unavailableDays.filter((d) => d !== day)
      : [...currentPrefs.unavailableDays, day].sort();
    // Remove from preferred if adding to unavailable
    const nextPref = currentPrefs.preferredDays.filter((d) => d !== day);
    setLocalPrefs({ ...currentPrefs, unavailableDays: next, preferredDays: nextPref });
  };

  if (!therapist || !currentPrefs) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
              therapist.role === "lead"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground"
            )}>
              {therapist.initials}
            </div>
            <div>
              <DialogTitle className="text-base">{therapist.name}</DialogTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={therapist.role === "lead" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {therapist.role === "lead" ? "Lead" : "Staff"}
                </Badge>
                {certifications.map((c) => (
                  <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0 font-mono">{c}</Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="upcoming" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="text-xs gap-1"><CalendarDays className="h-3 w-3" />Upcoming</TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1"><Clock className="h-3 w-3" />History</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs gap-1"><Settings2 className="h-3 w-3" />Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-3">
            <ShiftList shifts={shifts.upcoming} emptyText="No upcoming shifts" />
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            <ShiftList shifts={shifts.past} emptyText="No past shifts" />
          </TabsContent>

          <TabsContent value="preferences" className="mt-3 space-y-4">
            {/* Preferred days */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preferred Days</p>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "h-8 w-9 rounded-md text-xs font-medium transition-colors border",
                      currentPrefs.preferredDays.includes(i)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekend preference */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Weekend Availability</p>
              <Select
                value={currentPrefs.preferredWeekends}
                onValueChange={(v) => setLocalPrefs({ ...currentPrefs, preferredWeekends: v as TherapistPreferences["preferredWeekends"] })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKEND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
              <Textarea
                value={currentPrefs.notes}
                onChange={(e) => setLocalPrefs({ ...currentPrefs, notes: e.target.value })}
                placeholder="Scheduling notes..."
                className="text-sm min-h-[60px]"
              />
            </div>

            <Button size="sm" onClick={handleSavePrefs} disabled={!prefs}>
              Save Preferences
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ShiftList({ shifts, emptyText }: { shifts: { slot: { id: string; date: string; type: "day" | "night" }; date: Date; status: AssignmentStatus }[]; emptyText: string }) {
  if (shifts.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6 italic">{emptyText}</p>;
  }

  return (
    <div className="space-y-1">
      {shifts.map(({ slot, date, status }) => {
        const inactive = INACTIVE.includes(status);
        const statusInfo = ASSIGNMENT_STATUSES.find((s) => s.value === status);
        return (
          <div key={slot.id} className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm",
            inactive ? "bg-destructive/5" : "bg-muted/40"
          )}>
            <div className="flex items-center gap-2">
              {slot.type === "day"
                ? <Sun className="h-3.5 w-3.5 text-warning-foreground" />
                : <Moon className="h-3.5 w-3.5 text-muted-foreground" />
              }
              <span className={cn("font-medium", inactive && "line-through text-muted-foreground")}>
                {format(date, "EEE, MMM d")}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{slot.type}</span>
            </div>
            {status !== "active" && statusInfo && (
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
