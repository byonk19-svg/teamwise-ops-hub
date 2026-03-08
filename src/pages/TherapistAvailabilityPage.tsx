import { useState, useCallback } from "react";
import { format, addDays, parseISO, isWeekend } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AvailabilityStatus, NEXT_CYCLE } from "@/lib/availability-data";
import { motion } from "framer-motion";
import { Send, Check, Info, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_CYCLE: AvailabilityStatus[] = ["available", "preferred", "unavailable"];

function nextStatus(current: AvailabilityStatus): AvailabilityStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

function statusColor(status: AvailabilityStatus) {
  switch (status) {
    case "available":
      return "bg-success/15 border-success/30 text-success";
    case "preferred":
      return "bg-primary/12 border-primary/30 text-primary";
    case "unavailable":
      return "bg-destructive/12 border-destructive/30 text-destructive";
    default:
      return "bg-muted/50 border-border text-muted-foreground";
  }
}

function statusLabel(status: AvailabilityStatus) {
  switch (status) {
    case "available": return "Available";
    case "preferred": return "Preferred";
    case "unavailable": return "Unavailable";
    default: return "Unset";
  }
}

const NOTE_PRESETS = ["PTO", "Appointment", "Training", "Personal"];

export default function TherapistAvailabilityPage() {
  const totalDays = NEXT_CYCLE.weeks * 7;

  const [statuses, setStatuses] = useState<Record<string, AvailabilityStatus>>(() => {
    const map: Record<string, AvailabilityStatus> = {};
    for (let d = 0; d < totalDays; d++) {
      const date = format(addDays(NEXT_CYCLE.start, d), "yyyy-MM-dd");
      map[date] = "available";
    }
    return map;
  });

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const weeks: string[][] = [];
  for (let w = 0; w < NEXT_CYCLE.weeks; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(format(addDays(NEXT_CYCLE.start, w * 7 + d), "yyyy-MM-dd"));
    }
    weeks.push(week);
  }

  const toggleDay = useCallback((dateStr: string) => {
    if (submitted) return;
    setStatuses((prev) => {
      const next = nextStatus(prev[dateStr] ?? "available");
      // Clear note when cycling away from unavailable
      if (next === "available") {
        setNotes((n) => {
          const copy = { ...n };
          delete copy[dateStr];
          return copy;
        });
      }
      return { ...prev, [dateStr]: next };
    });
  }, [submitted]);

  const setNote = useCallback((dateStr: string, note: string) => {
    setNotes((prev) => {
      if (!note.trim()) {
        const copy = { ...prev };
        delete copy[dateStr];
        return copy;
      }
      return { ...prev, [dateStr]: note.trim() };
    });
  }, []);

  const unavailableCount = Object.values(statuses).filter((s) => s === "unavailable").length;
  const preferredCount = Object.values(statuses).filter((s) => s === "preferred").length;
  const notesCount = Object.keys(notes).length;

  function handleSubmit() {
    setSubmitted(true);
    toast.success("Availability submitted!", {
      description: `${unavailableCount} days unavailable, ${preferredCount} preferred, ${notesCount} notes.`,
    });
  }

  function handleEdit() {
    setSubmitted(false);
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-5 pb-4 border-b bg-card flex-shrink-0"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground tracking-tight mb-0.5">
                My Availability
              </h1>
              <p className="text-xs text-muted-foreground">
                Next cycle: {NEXT_CYCLE.label} · Tap a day to cycle through statuses
              </p>
            </div>
            {submitted ? (
              <div className="flex items-center gap-2">
                <StatusBadge variant="success">
                  <Check className="h-3 w-3" /> Submitted
                </StatusBadge>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleEdit}>
                  Edit
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSubmit}
              >
                <Send className="h-3.5 w-3.5" /> Submit
              </Button>
            )}
          </div>

          {/* Legend + stats */}
          <div className="flex items-center gap-4">
            {STATUS_CYCLE.map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn("h-3 w-3 rounded-sm border", statusColor(s))} />
                <span className="text-[10px] text-muted-foreground capitalize">{s}</span>
              </div>
            ))}
            <div className="flex-1" />
            <span className="text-[11px] text-muted-foreground">
              {unavailableCount} unavailable · {preferredCount} preferred
            </span>
          </div>
        </motion.div>

        {/* Instructions */}
        {!submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-6 py-2.5 bg-primary/5 border-b border-primary/10 flex items-center gap-2"
          >
            <Info className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <p className="text-[11px] text-primary/80">
              Click to cycle statuses. On <strong>unavailable</strong> days, click the note icon to add a reason (PTO, appointment, etc).
            </p>
          </motion.div>
        )}

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-5">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="space-y-4">
            {weeks.map((week, wi) => (
              <div key={wi}>
                <div className="flex items-center gap-2 mb-2 pl-0.5">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">
                    Week {wi + 1}
                  </p>
                  <div className="flex-1 h-px bg-border/60" />
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {week.map((dateStr) => {
                    const date = parseISO(dateStr);
                    const status = statuses[dateStr] ?? "available";
                    const weekend = isWeekend(date);
                    const note = notes[dateStr];
                    const isUnavailable = status === "unavailable";

                    return (
                      <DayCell
                        key={dateStr}
                        dateStr={dateStr}
                        date={date}
                        status={status}
                        note={note}
                        weekend={weekend}
                        submitted={submitted}
                        isUnavailable={isUnavailable}
                        onToggle={() => toggleDay(dateStr)}
                        onSetNote={(n) => setNote(dateStr, n)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function DayCell({
  dateStr,
  date,
  status,
  note,
  weekend,
  submitted,
  isUnavailable,
  onToggle,
  onSetNote,
}: {
  dateStr: string;
  date: Date;
  status: AvailabilityStatus;
  note?: string;
  weekend: boolean;
  submitted: boolean;
  isUnavailable: boolean;
  onToggle: () => void;
  onSetNote: (note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState(note ?? "");

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        disabled={submitted}
        className={cn(
          "w-full rounded-lg border p-3 text-center transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          statusColor(status),
          !submitted && "hover:shadow-md hover:-translate-y-px cursor-pointer",
          submitted && "opacity-80 cursor-default",
          weekend && status === "available" && "opacity-60"
        )}
      >
        <span className="font-heading font-bold text-sm leading-none block">
          {format(date, "d")}
        </span>
        {note ? (
          <span className="text-[8px] font-medium mt-1 block truncate">{note}</span>
        ) : (
          <span className="text-[9px] font-medium mt-1 block opacity-70">
            {statusLabel(status)}
          </span>
        )}
      </button>

      {/* Note icon for unavailable days */}
      {isUnavailable && !submitted && (
        <Popover open={noteOpen} onOpenChange={setNoteOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDraft(note ?? "");
                setNoteOpen(true);
              }}
              className={cn(
                "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center transition-colors shadow-sm",
                note
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted border border-border text-muted-foreground hover:bg-accent"
              )}
            >
              <MessageSquare className="h-2.5 w-2.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-3"
            side="top"
            align="center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Reason for {format(date, "MMM d")}
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {NOTE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onSetNote(preset);
                    setDraft(preset);
                    setNoteOpen(false);
                  }}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium border transition-colors",
                    draft === preset
                      ? "bg-primary/10 border-primary/25 text-primary"
                      : "bg-muted border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Custom note..."
                className="h-7 text-xs"
                maxLength={30}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSetNote(draft);
                    setNoteOpen(false);
                  }
                }}
              />
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  onSetNote(draft);
                  setNoteOpen(false);
                }}
              >
                Save
              </Button>
            </div>
            {note && (
              <button
                onClick={() => {
                  onSetNote("");
                  setDraft("");
                  setNoteOpen(false);
                }}
                className="text-[10px] text-destructive hover:underline mt-1.5"
              >
                Remove note
              </button>
            )}
          </PopoverContent>
        </Popover>
      )}

      {/* Show note indicator on submitted/non-unavailable with note */}
      {note && submitted && (
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
          <MessageSquare className="h-2 w-2 text-destructive-foreground" />
        </div>
      )}
    </div>
  );
}
