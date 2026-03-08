import { AppLayout } from "@/components/AppLayout";
import { THERAPISTS, Therapist } from "@/lib/schedule-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Phone, Mail, Shield, User } from "lucide-react";

const CONTACT_INFO: Record<string, { phone: string; email: string; certifications: string[] }> = {
  t1: { phone: "(555) 201-0101", email: "brianna.y@clinic.org", certifications: ["RRT", "NPS", "ACCS"] },
  t2: { phone: "(555) 201-0102", email: "kim.m@clinic.org", certifications: ["RRT", "NPS"] },
  t3: { phone: "(555) 201-0103", email: "barbara.a@clinic.org", certifications: ["RRT", "RPFT"] },
  t4: { phone: "(555) 201-0104", email: "adrienne.d@clinic.org", certifications: ["RRT", "NPS", "CPFT"] },
  t5: { phone: "(555) 201-0105", email: "aleyce.l@clinic.org", certifications: ["RRT"] },
  t6: { phone: "(555) 201-0106", email: "lynn.w@clinic.org", certifications: ["RRT", "RPFT"] },
  t7: { phone: "(555) 201-0107", email: "irene.r@clinic.org", certifications: ["CRT"] },
  t8: { phone: "(555) 201-0108", email: "tannie.n@clinic.org", certifications: ["RRT"] },
  t9: { phone: "(555) 201-0109", email: "layne.n@clinic.org", certifications: ["CRT", "RRT"] },
};

function TherapistCard({ therapist }: { therapist: Therapist }) {
  const info = CONTACT_INFO[therapist.id];
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
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-heading font-semibold text-sm text-foreground">{therapist.name}</h3>
          <Badge variant={isLead ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
            {isLead ? <><Shield className="h-2.5 w-2.5 mr-0.5" />Lead</> : <><User className="h-2.5 w-2.5 mr-0.5" />Staff</>}
          </Badge>
        </div>

        {info && (
          <>
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />{info.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />{info.email}
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {info.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                  {cert}
                </Badge>
              ))}
            </div>
          </>
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
