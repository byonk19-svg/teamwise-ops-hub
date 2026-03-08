import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { autoDraft, AutoDraftResult } from "@/lib/auto-draft";
import { ShiftSlot } from "@/lib/schedule-data";
import { Sparkles, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSlots: ShiftSlot[];
  onApply: (newSlots: ShiftSlot[]) => void;
}

export function AutoDraftDialog({ open, onOpenChange, currentSlots, onApply }: Props) {
  const [result, setResult] = useState<AutoDraftResult | null>(null);
  const [phase, setPhase] = useState<"confirm" | "preview">("confirm");

  const handleGenerate = () => {
    const r = autoDraft(currentSlots);
    setResult(r);
    setPhase("preview");
  };

  const handleApply = () => {
    if (result) {
      onApply(result.slots);
      onOpenChange(false);
      setPhase("confirm");
      setResult(null);
    }
  };

  const handleClose = (o: boolean) => {
    if (!o) {
      setPhase("confirm");
      setResult(null);
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {phase === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Auto-Draft Schedule
              </DialogTitle>
              <DialogDescription className="text-sm">
                Generate a new schedule that respects therapist preferences and unavailable days. This will replace all current assignments.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground text-sm">How it works:</p>
              <p>• <strong>Firm unavailable days</strong> are never violated</p>
              <p>• <strong>Preferred days</strong> are prioritized when assigning</p>
              <p>• Shifts are distributed fairly across the team</p>
              <p>• Each slot gets 1 lead + staff to meet minimums</p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => handleClose(false)}>Cancel</Button>
              <Button size="sm" onClick={handleGenerate} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />Generate Draft
              </Button>
            </DialogFooter>
          </>
        ) : result ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Draft Ready
              </DialogTitle>
            </DialogHeader>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border bg-card p-3 text-center">
                <p className="text-lg font-bold font-heading text-foreground">{result.stats.totalAssignments}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Assignments</p>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <p className="text-lg font-bold font-heading text-success">{result.stats.preferencesHonored}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">On Pref Days</p>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <p className="text-lg font-bold font-heading text-warning-foreground">{result.stats.preferencesViolated}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Off Pref</p>
              </div>
            </div>

            {/* Conflicts */}
            {result.conflicts.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {result.conflicts.length} {result.conflicts.length === 1 ? "conflict" : "conflicts"}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {result.conflicts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md bg-destructive/5 px-2.5 py-1.5 text-xs">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{c.type}</Badge>
                      <span className="text-muted-foreground">{format(parseISO(c.date), "EEE, MMM d")}</span>
                      <span className="text-destructive">{c.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.conflicts.length === 0 && (
              <p className="text-sm text-success flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                No conflicts — all constraints satisfied
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => { setPhase("confirm"); setResult(null); }}>
                Re-generate
              </Button>
              <Button size="sm" onClick={handleApply} className="gap-1.5">
                Apply Draft
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
