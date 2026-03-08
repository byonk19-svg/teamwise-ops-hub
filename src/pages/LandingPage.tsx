import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users, ArrowLeftRight, Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description: "Auto-draft shifts based on availability, preferences, and coverage needs.",
  },
  {
    icon: ArrowLeftRight,
    title: "Seamless Shift Swaps",
    description: "Staff request swaps peer-to-peer with built-in manager approval.",
  },
  {
    icon: Clock,
    title: "Real-Time Availability",
    description: "Team members submit availability on their own time — no back-and-forth.",
  },
  {
    icon: Shield,
    title: "Coverage Confidence",
    description: "Instantly see gaps, risks, and staffing levels across every shift.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <CalendarDays className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">Teamwise</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              Built for respiratory therapy teams
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Scheduling that{" "}
            <span className="text-primary">works for everyone.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed"
          >
            Coordinate your team with confidence. Less time on spreadsheets, more time on patient care.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center gap-3"
          >
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Started Free
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-12"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">
              Everything you need
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl font-bold text-foreground">
              Built around your workflow
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 2}
                className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-base font-semibold text-card-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-2xl bg-sidebar p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-sidebar-accent/30" />
          <div className="absolute bottom-8 left-8 h-32 w-32 rounded-full bg-sidebar-ring/10" />

          <motion.h2
            variants={fadeUp}
            custom={0}
            className="relative z-10 font-heading text-2xl md:text-3xl font-bold text-sidebar-primary mb-3"
          >
            Ready to simplify your schedule?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="relative z-10 text-sidebar-muted mb-8 max-w-md mx-auto"
          >
            Get your team set up in minutes — no spreadsheets required.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="relative z-10">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">
                Start for free
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Teamwise</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Teamwise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
