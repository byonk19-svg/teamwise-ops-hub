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
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Staggered fade helper
const stagger = {
  parent: { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } },
  child: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const } },
  },
};

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
    <div className="flex h-screen overflow-hidden bg-sidebar">
      {/* ═══════════════════════════════════════════════════
          LEFT — Rich branded panel (hidden on mobile)
         ═══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[56%] relative flex-col">
        {/* Background layers */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 20% 10%, hsl(187 55% 28% / 0.4), transparent),
                radial-gradient(ellipse 60% 50% at 80% 80%, hsl(38 90% 55% / 0.08), transparent),
                radial-gradient(ellipse 100% 80% at 50% 50%, hsl(192 48% 14%), hsl(192 48% 18%))
              `,
            }}
          />
          {/* Dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)`,
              backgroundSize: "20px 20px",
            }}
          />
          {/* Top-left accent glow */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sidebar-ring/10 blur-[120px]" />
          {/* Bottom-right teal glow */}
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[100px]" />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col h-full px-12 py-10"
          variants={stagger.parent}
          initial="initial"
          animate="animate"
        >
          {/* Logo */}
          <motion.div variants={stagger.child} className="flex items-center gap-3 mb-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-ring/20 border border-sidebar-ring/30">
              <CalendarDays className="h-[18px] w-[18px] text-sidebar-ring" />
            </div>
            <span className="font-heading text-lg font-bold text-sidebar-primary tracking-tight">
              Teamwise
            </span>
          </motion.div>

          {/* Central hero area */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div variants={stagger.child}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-ring mb-4">
                Scheduling Platform
              </p>
            </motion.div>

            <motion.h1
              variants={stagger.child}
              className="font-heading text-[3.2rem] leading-[1.05] font-extrabold text-sidebar-primary tracking-tight mb-5"
            >
              Your team,{" "}
              <span className="relative">
                organized
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-sidebar-ring/40" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0 8 Q50 0, 100 6 T200 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              .
            </motion.h1>

            <motion.p
              variants={stagger.child}
              className="text-sidebar-primary/50 text-base leading-relaxed max-w-sm mb-10"
            >
              Everything you need to manage schedules, availability, and shift
              changes&nbsp;— all in one place.
            </motion.p>

            {/* Product preview — glassmorphic card */}
            <motion.div variants={stagger.child} className="relative">
              {/* Ambient glow */}
              <div className="absolute -inset-4 bg-sidebar-ring/6 rounded-3xl blur-2xl" />

              <div className="relative bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/25 overflow-hidden">
                {/* Card header bar */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-5 w-36 rounded-md bg-white/[0.06] flex items-center justify-center">
                      <span className="text-[9px] text-sidebar-primary/30 font-medium">teamwise.app/schedule</span>
                    </div>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Mini dashboard content */}
                <div className="p-5 space-y-4">
                  {/* Metric row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Users, label: "On Shift", value: "6", color: "text-sidebar-ring" },
                      { icon: ArrowLeftRight, label: "Pending Swaps", value: "2", color: "text-sidebar-ring" },
                      { icon: BarChart3, label: "Coverage", value: "92%", color: "text-sidebar-ring" },
                    ].map((metric) => (
                      <div key={metric.label} className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3">
                        <metric.icon className="h-3.5 w-3.5 text-sidebar-primary/30 mb-2" />
                        <p className={`font-heading text-lg font-bold ${metric.color} leading-none`}>{metric.value}</p>
                        <p className="text-[10px] text-sidebar-primary/35 mt-0.5">{metric.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini week strip */}
                  <div>
                    <p className="text-[10px] font-semibold text-sidebar-primary/30 uppercase tracking-wider mb-2">This Week</p>
                    <div className="grid grid-cols-7 gap-1.5">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <div key={i} className="text-center">
                          <span className="text-[8px] font-medium text-sidebar-primary/25 block mb-1">{d}</span>
                          <div
                            className={`h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              i === 3
                                ? "bg-sidebar-ring/25 text-sidebar-ring border border-sidebar-ring/30"
                                : i === 5
                                ? "bg-white/[0.02] text-sidebar-primary/20 border border-white/[0.04]"
                                : "bg-white/[0.05] text-sidebar-primary/50 border border-white/[0.06]"
                            }`}
                          >
                            {9 + i}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom bar — subtle workspace context */}
          <motion.div
            variants={stagger.child}
            className="flex items-center gap-3 mt-auto pt-6"
          >
            <div className="flex -space-x-2">
              {["BY", "KM", "BA", "AD"].map((initials, i) => (
                <div
                  key={initials}
                  className="h-7 w-7 rounded-full bg-sidebar-accent border-2 border-sidebar-background flex items-center justify-center"
                  style={{ zIndex: 4 - i }}
                >
                  <span className="text-[9px] font-bold text-sidebar-accent-foreground">{initials}</span>
                </div>
              ))}
            </div>
            <span className="text-xs text-sidebar-primary/35">Your team is here</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT — Auth form panel
         ═══════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col bg-background relative">
        {/* Soft top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/[0.03] blur-3xl" />

        <div className="flex flex-1 items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-[360px] relative z-10"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-12 justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground tracking-tight">
                Teamwise
              </span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                {isLogin ? "Sign in to Teamwise" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {isLogin
                  ? "Welcome back. Enter your credentials to continue."
                  : "Set up your account to join your team."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-sm rounded-lg border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
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
                  className="h-11 text-sm rounded-lg border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg text-sm font-semibold gap-2 shadow-sm hover:shadow-md transition-all"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Continue" : "Create account"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>


            {/* Toggle */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
