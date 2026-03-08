import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Loader2,
  ArrowRight,
  Users,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email to verify your account." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ════════════════════════════════════════════════
          LEFT PANEL — Branded workspace visual
         ════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[54%] relative flex-col bg-sidebar overflow-hidden">
        {/* ── Background treatment ── */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 70% 50% at 15% 5%, hsl(187 55% 30% / 0.35), transparent 70%),
                radial-gradient(ellipse 50% 40% at 85% 90%, hsl(38 90% 55% / 0.06), transparent 70%),
                linear-gradient(175deg, hsl(192 48% 16%) 0%, hsl(192 48% 12%) 100%)
              `,
            }}
          />
          {/* Fine dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)`,
              backgroundSize: "18px 18px",
            }}
          />
          {/* Ambient orbs */}
          <div className="absolute top-[10%] left-[5%] h-80 w-80 rounded-full bg-sidebar-ring/8 blur-[100px]" />
          <div className="absolute bottom-[5%] right-[10%] h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />
        </div>

        {/* ── Content stack ── */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <motion.div {...fade(0.1)} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-ring/15 border border-sidebar-ring/25">
              <CalendarDays className="h-4 w-4 text-sidebar-ring" />
            </div>
            <span className="font-heading text-[15px] font-bold text-sidebar-primary/90 tracking-tight">
              Teamwise
            </span>
          </motion.div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center max-w-[440px] -mt-6">
            <motion.p
              {...fade(0.2)}
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-sidebar-ring/80 mb-5"
            >
              Team Scheduling Hub
            </motion.p>

            <motion.h1
              {...fade(0.28)}
              className="font-heading text-[2.6rem] leading-[1.08] font-extrabold text-sidebar-primary tracking-tight mb-4"
            >
              Your team's scheduling
              <br />
              workspace, all in
              <br />
              <span className="text-sidebar-ring">one place.</span>
            </motion.h1>

            <motion.p
              {...fade(0.36)}
              className="text-[15px] text-sidebar-primary/40 leading-relaxed max-w-sm mb-10"
            >
              Manage shifts, coverage, availability, and swap requests
              — built for the teams that keep things running.
            </motion.p>

            {/* ── Product preview card ── */}
            <motion.div {...fade(0.44)} className="relative">
              <div className="absolute -inset-6 bg-sidebar-ring/5 rounded-[28px] blur-2xl" />

              <div className="relative bg-white/[0.05] backdrop-blur-lg rounded-xl border border-white/[0.08] shadow-2xl shadow-black/20 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
                    <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
                    <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-[18px] w-32 rounded bg-white/[0.04] flex items-center justify-center">
                      <span className="text-[8px] text-sidebar-primary/20 font-medium tracking-wide">teamwise / schedule</span>
                    </div>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Dashboard preview */}
                <div className="p-4 space-y-3">
                  {/* KPI row */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Users, label: "On Shift", val: "6" },
                      { icon: ArrowLeftRight, label: "Swaps", val: "2" },
                      { icon: TrendingUp, label: "Coverage", val: "92%" },
                      { icon: Clock, label: "Open Slots", val: "3" },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/[0.03] rounded-lg border border-white/[0.05] px-3 py-2.5">
                        <m.icon className="h-3 w-3 text-sidebar-primary/20 mb-1.5" />
                        <p className="font-heading text-base font-bold text-sidebar-ring leading-none">{m.val}</p>
                        <p className="text-[8px] text-sidebar-primary/25 mt-0.5 font-medium">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Schedule strip */}
                  <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] p-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[9px] font-bold text-sidebar-primary/25 uppercase tracking-wider">This Week</span>
                      <span className="text-[8px] text-sidebar-ring/60 font-semibold">Mar 9 – 15</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {[
                        { d: "S", n: 9, s: "filled" },
                        { d: "M", n: 10, s: "filled" },
                        { d: "T", n: 11, s: "filled" },
                        { d: "W", n: 12, s: "today" },
                        { d: "T", n: 13, s: "warning" },
                        { d: "F", n: 14, s: "filled" },
                        { d: "S", n: 15, s: "empty" },
                      ].map((cell, i) => (
                        <div key={i} className="text-center">
                          <span className="text-[7px] font-semibold text-sidebar-primary/20 block mb-1">{cell.d}</span>
                          <div
                            className={`h-8 rounded-md flex flex-col items-center justify-center gap-0.5 border ${
                              cell.s === "today"
                                ? "bg-sidebar-ring/20 border-sidebar-ring/35 ring-1 ring-sidebar-ring/20"
                                : cell.s === "warning"
                                ? "bg-sidebar-ring/8 border-sidebar-ring/15"
                                : cell.s === "empty"
                                ? "bg-white/[0.01] border-white/[0.03]"
                                : "bg-white/[0.04] border-white/[0.06]"
                            }`}
                          >
                            <span className={`text-[10px] font-bold leading-none ${
                              cell.s === "today" ? "text-sidebar-ring" :
                              cell.s === "empty" ? "text-sidebar-primary/15" :
                              "text-sidebar-primary/45"
                            }`}>{cell.n}</span>
                            {cell.s === "filled" && (
                              <div className="flex gap-px">
                                <div className="h-1 w-1 rounded-full bg-sidebar-ring/40" />
                                <div className="h-1 w-1 rounded-full bg-sidebar-ring/25" />
                              </div>
                            )}
                            {cell.s === "today" && (
                              <div className="flex gap-px">
                                <div className="h-1 w-1 rounded-full bg-sidebar-ring" />
                                <div className="h-1 w-1 rounded-full bg-sidebar-ring/60" />
                                <div className="h-1 w-1 rounded-full bg-sidebar-ring/30" />
                              </div>
                            )}
                            {cell.s === "warning" && (
                              <div className="h-1 w-1 rounded-full bg-sidebar-ring/50" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent activity row */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/[0.03] rounded-lg border border-white/[0.05] px-3 py-2 flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-md bg-sidebar-ring/12 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-sidebar-ring/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold text-sidebar-primary/40 truncate">Swap approved</p>
                        <p className="text-[8px] text-sidebar-primary/20">Mon → Wed shift</p>
                      </div>
                    </div>
                    <div className="flex-1 bg-white/[0.03] rounded-lg border border-white/[0.05] px-3 py-2 flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-md bg-white/[0.06] flex items-center justify-center shrink-0">
                        <CalendarDays className="h-3 w-3 text-sidebar-primary/25" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold text-sidebar-primary/40 truncate">Draft published</p>
                        <p className="text-[8px] text-sidebar-primary/20">Week of Mar 16</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom — team presence */}
          <motion.div {...fade(0.6)} className="flex items-center gap-3 mt-auto pt-4">
            <div className="flex -space-x-1.5">
              {["BY", "KM", "BA", "AD", "IR"].map((initials, i) => (
                <div
                  key={initials}
                  className="h-6 w-6 rounded-full bg-sidebar-accent border-[1.5px] border-sidebar-background flex items-center justify-center"
                  style={{ zIndex: 5 - i }}
                >
                  <span className="text-[8px] font-bold text-sidebar-accent-foreground">{initials}</span>
                </div>
              ))}
            </div>
            <span className="text-[11px] text-sidebar-primary/30 font-medium">Your team is already here</span>
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT PANEL — Authentication form
         ════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col bg-background relative overflow-hidden">
        {/* Subtle edge highlight */}
        <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-border/0 via-border/60 to-border/0 hidden lg:block" />
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/[0.025] blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/[0.015] blur-[60px]" />

        <div className="flex flex-1 items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-[380px] relative z-10"
          >
            {/* Mobile branding */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 mb-3">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground tracking-tight">Teamwise</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mt-1">Team Scheduling Hub</span>
            </div>

            {/* Eyebrow */}
            <p className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-3">
              Team Scheduling Hub
            </p>

            {/* Heading */}
            <h2 className="font-heading text-[1.65rem] font-bold text-foreground tracking-tight leading-snug">
              {isLogin ? "Access your Teamwise workspace" : "Create your employee account"}
            </h2>
            <p className="mt-2.5 text-[14px] text-muted-foreground leading-relaxed mb-8">
              {isLogin
                ? "Sign in to view your schedule, manage availability, and coordinate with your team."
                : "Set up your account to access schedules, shifts, and team coordination tools."}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[13px] font-medium text-foreground/70">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@yourorganization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-sm rounded-lg border-border/80 bg-muted/20 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[13px] font-medium text-foreground/70">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 text-sm rounded-lg border-border/80 bg-muted/20 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg text-sm font-semibold gap-2 shadow-sm hover:shadow-md hover:brightness-110 transition-all mt-1"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign in" : "Create account"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle */}
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Need access?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {isLogin ? "Create your employee account" : "Sign in instead"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
