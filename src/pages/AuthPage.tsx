import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Loader2,
  Clock,
  Users,
  ArrowLeftRight,
  Shield,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const floatingCards = [
  {
    icon: CalendarDays,
    title: "Schedule",
    detail: "View & manage weekly shifts",
    color: "bg-sidebar-accent",
    position: "top-[18%] left-[8%]",
    delay: 0.6,
  },
  {
    icon: ArrowLeftRight,
    title: "Swaps",
    detail: "Request & approve trades",
    color: "bg-sidebar-ring/20",
    position: "top-[40%] right-[6%]",
    delay: 0.8,
  },
  {
    icon: Users,
    title: "Team",
    detail: "See who's on today",
    color: "bg-sidebar-accent",
    position: "bottom-[32%] left-[12%]",
    delay: 1.0,
  },
  {
    icon: Clock,
    title: "Availability",
    detail: "Set your preferred hours",
    color: "bg-sidebar-ring/20",
    position: "bottom-[14%] right-[10%]",
    delay: 1.2,
  },
];

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
    <div className="flex min-h-screen">
      {/* Left panel — immersive branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-sidebar relative overflow-hidden flex-col justify-between p-14">
        {/* Layered background shapes */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sidebar-accent/40 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-sidebar-ring/15 to-transparent blur-3xl" />
          <div className="absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-sidebar-accent/10 blur-2xl" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--sidebar-foreground)) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--sidebar-foreground)) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-accent shadow-lg shadow-sidebar-accent/30">
            <CalendarDays className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-sidebar-primary tracking-tight">
            Teamwise
          </span>
        </motion.div>

        {/* Floating preview cards */}
        <div className="relative z-10 flex-1 my-8">
          <div className="relative h-full">
            {floatingCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: card.delay,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className={`absolute ${card.position} ${card.color} backdrop-blur-sm rounded-xl px-5 py-4 shadow-xl shadow-black/10 border border-white/[0.06] max-w-[220px]`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <card.icon className="h-3.5 w-3.5 text-sidebar-accent-foreground" />
                  <span className="text-xs font-semibold text-sidebar-accent-foreground uppercase tracking-wide">
                    {card.title}
                  </span>
                </div>
                <p className="text-sm text-sidebar-primary/80 font-medium">{card.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold leading-[1.1] text-sidebar-primary mb-3 tracking-tight">
              Your team,<br />
              <span className="text-sidebar-ring">organized.</span>
            </h1>
            <p className="text-sidebar-muted text-base max-w-md leading-relaxed">
              Everything you need to manage schedules, availability, and shift changes — all in one place.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 relative">
        {/* Subtle background accent */}
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
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
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
