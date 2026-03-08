import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
        toast({
          title: "Account created",
          description: "Check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel — gradient hero with depth */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: `linear-gradient(135deg, hsl(var(--sidebar-background)) 0%, hsl(var(--sidebar-background)) 40%, hsl(187 55% 18%) 100%)`,
        }}
      >
        {/* Layered gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-sidebar-ring/25 to-transparent blur-[100px]" />
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-sidebar-accent/30 to-transparent blur-[80px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-sidebar-ring/20 to-transparent blur-[90px]" />
          {/* Subtle noise texture via grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--sidebar-foreground)) 0.5px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/[0.1] shadow-lg">
            <CalendarDays className="h-5 w-5 text-sidebar-primary" />
          </div>
          <span className="font-heading text-xl font-bold text-sidebar-primary tracking-tight">
            Teamwise
          </span>
        </motion.div>

        {/* Center — glassmorphic card */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full max-w-sm"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 -m-8 rounded-3xl bg-sidebar-ring/10 blur-3xl" />
            
            <div className="relative bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/[0.12] shadow-2xl shadow-black/20 p-6">
              {/* Mini schedule header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-sidebar-ring animate-pulse" />
                  <span className="text-xs font-semibold text-sidebar-primary/80 uppercase tracking-wider">Day Shift · This Week</span>
                </div>
              </div>

              {/* Mock 7-day row */}
              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-semibold text-sidebar-primary/40 uppercase">{d}</div>
                ))}
                {[
                  { n: 9, ok: true },
                  { n: 10, ok: true },
                  { n: 11, ok: true },
                  { n: 12, ok: false },
                  { n: 13, ok: true },
                  { n: 14, ok: true },
                  { n: 15, ok: true },
                ].map((cell) => (
                  <div
                    key={cell.n}
                    className={`rounded-md py-2 text-center text-[11px] font-bold transition-all ${
                      cell.ok
                        ? "bg-sidebar-ring/15 text-sidebar-ring border border-sidebar-ring/20"
                        : "bg-white/[0.04] text-sidebar-primary/30 border border-white/[0.06]"
                    }`}
                  >
                    {cell.n}
                  </div>
                ))}
              </div>

              {/* Coverage bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-sidebar-primary/60">Coverage</span>
                  <span className="text-[11px] font-bold text-sidebar-ring">6/7 days</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "86%" }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-sidebar-ring to-sidebar-accent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-heading text-5xl font-bold leading-[1.1] text-sidebar-primary mb-3 tracking-tight">
              Your team,<br />
              <span className="text-sidebar-ring">organized.</span>
            </h1>
            <p className="text-sidebar-primary/50 text-base max-w-md leading-relaxed">
              Everything you need to manage schedules, availability, and shift changes — all in one place.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 relative">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/[0.03] blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <CalendarDays className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground tracking-tight">
              Teamwise
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
                  {isLogin ? "Welcome back" : "Get started"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {isLogin
                    ? "Enter your credentials to access your schedule."
                    : "Create an account to join your team."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                    className="h-12 text-base rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
                  disabled={loading}
                >
                  {loading && <Loader2 className="animate-spin" />}
                  {isLogin ? "Sign in" : "Create account"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="font-semibold text-primary">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 flex items-center justify-center gap-2 text-muted-foreground/60"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="text-xs">Secure, HIPAA-friendly scheduling</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
