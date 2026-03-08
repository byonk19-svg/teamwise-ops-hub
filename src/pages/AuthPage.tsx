import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Loader2,
  ArrowRight,
  Users,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"manager" | "therapist">("therapist");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent you a password reset link." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { first_name: firstName, last_name: lastName },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("user_roles").insert({ user_id: data.user.id, role });
          await supabase.from("profiles").update({ phone }).eq("id", data.user.id);
        }

        toast({ title: "Account created", description: "Check your email to verify your account." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { d: "S", n: 9, staff: 4, status: "filled" as const },
    { d: "M", n: 10, staff: 6, status: "filled" as const },
    { d: "T", n: 11, staff: 5, status: "filled" as const },
    { d: "W", n: 12, staff: 6, status: "today" as const },
    { d: "T", n: 13, staff: 3, status: "warning" as const },
    { d: "F", n: 14, staff: 5, status: "filled" as const },
    { d: "S", n: 15, staff: 0, status: "empty" as const },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ═══════════════════════════════════════════
          LEFT PANEL — Atmospheric brand + preview
         ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col bg-sidebar overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 20% 0%, hsl(187 55% 32% / 0.4), transparent 65%),
                radial-gradient(ellipse 50% 50% at 80% 100%, hsl(38 90% 55% / 0.05), transparent 65%),
                linear-gradient(175deg, hsl(192 48% 17%) 0%, hsl(192 48% 11%) 100%)
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)`,
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute top-[8%] left-[3%] h-96 w-96 rounded-full bg-sidebar-ring/6 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[8%] h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-10">
          {/* Logo */}
          <motion.div {...fade(0.1)} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-ring/15 border border-sidebar-ring/25">
              <CalendarDays className="h-4 w-4 text-sidebar-ring" />
            </div>
            <span className="font-heading text-[15px] font-bold text-sidebar-primary/90 tracking-tight">
              Teamwise
            </span>
          </motion.div>

          {/* Compact headline */}
          <div className="mt-12 mb-8 max-w-[380px]">
            <motion.p
              {...fade(0.15)}
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-sidebar-ring/70 mb-4"
            >
              Team Scheduling Hub
            </motion.p>
            <motion.h1
              {...fade(0.22)}
              className="font-heading text-[1.55rem] xl:text-[1.7rem] leading-[1.2] font-bold text-sidebar-primary/80 tracking-tight"
            >
              Scheduling, availability, and
              <br />
              coverage — <span className="text-sidebar-ring">in sync.</span>
            </motion.h1>
            <motion.p
              {...fade(0.28)}
              className="text-[13px] text-sidebar-primary/30 mt-3 leading-relaxed"
            >
              Built for the teams that keep things running.
            </motion.p>
          </div>

          {/* ── Product preview — bright, realistic ── */}
          <motion.div {...fade(0.34)} className="flex-1 flex flex-col min-h-0">
            <div className="relative flex-1 flex flex-col min-h-0">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-sidebar-ring/[0.04] rounded-[28px] blur-2xl" />

              <div className="relative flex-1 flex flex-col min-h-0 bg-white/[0.07] backdrop-blur-xl rounded-xl border border-white/[0.1] shadow-2xl shadow-black/25 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.03] shrink-0">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-400/30" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400/30" />
                    <div className="h-2 w-2 rounded-full bg-green-400/30" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-5 w-40 rounded-md bg-white/[0.05] flex items-center justify-center">
                      <span className="text-[9px] text-sidebar-primary/30 font-medium tracking-wide">teamwise / schedule</span>
                    </div>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Dashboard body */}
                <div className="p-4 xl:p-5 space-y-3 overflow-hidden flex-1">
                  {/* KPI strip */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Users, label: "On Shift", val: "6", color: "text-sidebar-ring" },
                      { icon: ArrowLeftRight, label: "Swaps", val: "2", color: "text-blue-300" },
                      { icon: TrendingUp, label: "Coverage", val: "92%", color: "text-emerald-300" },
                      { icon: Clock, label: "Open Slots", val: "3", color: "text-amber-300" },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/[0.05] rounded-lg border border-white/[0.07] px-3 py-2.5">
                        <m.icon className="h-3.5 w-3.5 text-sidebar-primary/25 mb-1.5" />
                        <p className={`font-heading text-lg font-bold leading-none ${m.color}`}>{m.val}</p>
                        <p className="text-[9px] text-sidebar-primary/35 mt-1 font-medium">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Weekly schedule grid */}
                  <div className="bg-white/[0.04] rounded-lg border border-white/[0.07] p-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-sidebar-primary/35 uppercase tracking-wider">This Week</span>
                      <span className="text-[9px] text-sidebar-ring/70 font-semibold bg-sidebar-ring/10 px-2 py-0.5 rounded-full">Mar 9 – 15</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {weekDays.map((cell, i) => (
                        <div key={i} className="text-center">
                          <span className="text-[8px] font-semibold text-sidebar-primary/25 block mb-1">{cell.d}</span>
                          <div
                            className={`h-11 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                              cell.status === "today"
                                ? "bg-sidebar-ring/20 border-sidebar-ring/40 ring-1 ring-sidebar-ring/25 shadow-sm shadow-sidebar-ring/10"
                                : cell.status === "warning"
                                ? "bg-amber-400/10 border-amber-400/20"
                                : cell.status === "empty"
                                ? "bg-white/[0.015] border-white/[0.04]"
                                : "bg-white/[0.05] border-white/[0.08]"
                            }`}
                          >
                            <span className={`text-[11px] font-bold leading-none ${
                              cell.status === "today" ? "text-sidebar-ring" :
                              cell.status === "warning" ? "text-amber-300/80" :
                              cell.status === "empty" ? "text-sidebar-primary/15" :
                              "text-sidebar-primary/55"
                            }`}>{cell.n}</span>
                            {cell.staff > 0 && (
                              <span className={`text-[7px] font-medium ${
                                cell.status === "today" ? "text-sidebar-ring/70" :
                                cell.status === "warning" ? "text-amber-300/50" :
                                "text-sidebar-primary/25"
                              }`}>{cell.staff} staff</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity tiles */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.04] rounded-lg border border-white/[0.07] px-3 py-2.5 flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-emerald-400/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/80" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-sidebar-primary/50 truncate">Swap approved</p>
                        <p className="text-[8px] text-sidebar-primary/25">Mon → Wed shift</p>
                      </div>
                    </div>
                    <div className="bg-white/[0.04] rounded-lg border border-white/[0.07] px-3 py-2.5 flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-blue-400/12 flex items-center justify-center shrink-0">
                        <CalendarDays className="h-3.5 w-3.5 text-blue-300/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-sidebar-primary/50 truncate">Draft published</p>
                        <p className="text-[8px] text-sidebar-primary/25">Week of Mar 16</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — Authentication
         ═══════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col bg-background relative overflow-y-auto">
        {/* Divider line */}
        <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-border/0 via-border/60 to-border/0 hidden lg:block" />
        {/* Ambient depth */}
        <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/[0.02] blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-accent/[0.02] blur-[80px]" />
        {/* Subtle surface pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 0.3px, transparent 0.3px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="flex flex-1 items-center justify-center px-8 sm:px-12 py-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-[400px] relative z-10"
          >
            {/* Mobile branding */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 mb-3">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground tracking-tight">Teamwise</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mt-1">Team Scheduling Hub</span>
            </div>

            {/* Form card */}
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-7 pb-6 shadow-sm">
              {/* Eyebrow */}
              <p className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-2.5">
                Team Scheduling Hub
              </p>

              {/* Heading */}
              <h2 className="font-heading text-[1.6rem] font-bold text-foreground tracking-tight leading-snug">
                {isLogin ? "Access your Teamwise workspace" : "Create your employee account"}
              </h2>
              <p className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed mb-6">
                {isLogin
                  ? "Sign in to view your schedule, manage availability, and coordinate with your team."
                  : "Set up your account to access schedules, shifts, and team coordination tools."}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Sign-up only fields */}
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-[13px] font-medium text-foreground/70">
                          First name
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Jane"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="h-11 text-sm rounded-lg border-border/70 bg-background/80 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-[13px] font-medium text-foreground/70">
                          Last name
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Smith"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="h-11 text-sm rounded-lg border-border/70 bg-background/80 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-[13px] font-medium text-foreground/70">
                        Phone number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 text-sm rounded-lg border-border/70 bg-background/80 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="role" className="text-[13px] font-medium text-foreground/70">
                        Your role
                      </Label>
                      <Select value={role} onValueChange={(v) => setRole(v as "manager" | "therapist")}>
                        <SelectTrigger className="h-11 text-sm rounded-lg border-border/70 bg-background/80 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="therapist">Therapist / Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[13px] font-medium text-foreground/70">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 text-sm rounded-lg border-border/70 bg-background/80 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all shadow-sm"
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
                    className="h-11 text-sm rounded-lg border-border/70 bg-background/80 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all shadow-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg text-sm font-semibold gap-2 shadow-md hover:shadow-lg hover:brightness-110 transition-all mt-1"
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

              {/* Toggle — inside card */}
              <div className="mt-5 pt-4 border-t border-border/40 text-center">
                <p className="text-[13px] text-muted-foreground">
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
            </div>

            {/* Trust signal */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-muted-foreground/40">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Secured & encrypted</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
