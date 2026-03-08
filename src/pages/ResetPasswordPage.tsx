import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast({
        title: "Invalid link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are identical.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Password updated", description: "Your password has been reset successfully." });
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10 relative">
      {/* Ambient depth */}
      <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/[0.02] blur-[100px]" />
      <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-accent/[0.02] blur-[80px]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 0.3px, transparent 0.3px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 mb-3">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground tracking-tight">Teamwise</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mt-1">Team Scheduling Hub</span>
        </div>

        {/* Card */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-7 pb-6 shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="font-heading text-xl font-bold text-foreground mb-1">Password updated</h2>
              <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-[1.6rem] font-bold text-foreground tracking-tight leading-snug">
                Set a new password
              </h2>
              <p className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed mb-6">
                Enter your new password below. Make sure it's at least 6 characters.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[13px] font-medium text-foreground/70">
                    New password
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
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-foreground/70">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Reset password
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Trust signal */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-muted-foreground/40">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">Secured & encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
