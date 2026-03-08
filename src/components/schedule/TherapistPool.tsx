import { THERAPISTS, Therapist } from "@/lib/schedule-data";
import { TherapistChip } from "./TherapistChip";
import { Users } from "lucide-react";

interface TherapistPoolProps {
  assignedTherapistIds: Set<string>;
}

export function TherapistPool({ assignedTherapistIds }: TherapistPoolProps) {
  const leads = THERAPISTS.filter((t) => t.role === "lead");
  const staff = THERAPISTS.filter((t) => t.role === "staff");

  return (
    <div className="w-56 flex-shrink-0 rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-heading font-semibold text-sm">Therapists</h3>
      </div>
      <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Lead Therapists
          </p>
          <div className="space-y-1">
            {leads.map((t) => (
              <TherapistChip key={t.id} therapist={t} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Staff Therapists
          </p>
          <div className="space-y-1">
            {staff.map((t) => (
              <TherapistChip key={t.id} therapist={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
