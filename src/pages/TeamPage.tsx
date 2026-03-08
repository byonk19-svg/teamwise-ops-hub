import { AppLayout } from "@/components/AppLayout";
import { THERAPISTS, Therapist } from "@/lib/schedule-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Shield, User } from "lucide-react";

const CERTIFICATIONS: Record<string, string[]> = {
  t1: ["RRT", "NPS", "ACCS"],
  t2: ["RRT", "NPS"],
  t3: ["RRT", "RPFT"],
  t4: ["RRT", "NPS", "CPFT"],
  t5: ["RRT"],
  t6: ["RRT", "RPFT"],
  t7: ["CRT"],
  t8: ["RRT"],
  t9: ["CRT", "RRT"],
};

function TherapistCard({ therapist }: { therapist: Therapist }) {
  const certs = CERTIFICATIONS[therapist.id] ?? [];
  const isLead = therapist.role === "lead";

  return (
    <Card className={cn(
      "p-5 flex gap-4 items-start transition-shadow hover:shadow-md",
      isLead && "border-primary/20"
    )}>
      <div className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        isLead
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-muted text-muted-foreground"
      )}>
        {therapist.initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-heading font-semibold text-sm text-foreground">{therapist.name}</h3>
          <Badge variant={isLead ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
            {isLead ? <><Shield className="h-2.5 w-2.5 mr-0.5" />Lead</> : <><User className="h-2.5 w-2.5 mr-0.5" />Staff</>}
          </Badge>
        </div>

        {certs.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {certs.map((cert) => (
              <Badge key={cert} variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                {cert}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

const leads = THERAPISTS.filter((t) => t.role === "lead");
const staff = THERAPISTS.filter((t) => t.role === "staff");

export default function TeamPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Team</h1>
        <p className="text-sm text-muted-foreground mb-6">{THERAPISTS.length} therapists · {leads.length} leads, {staff.length} staff</p>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Lead Therapists</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {leads.map((t) => <TherapistCard key={t.id} therapist={t} />)}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Staff Therapists</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {staff.map((t) => <TherapistCard key={t.id} therapist={t} />)}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
