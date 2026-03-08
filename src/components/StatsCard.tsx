import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "flat";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function StatsCard({ label, value, sublabel, icon: Icon, variant = "default", className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5 animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn("text-2xl font-heading font-semibold tracking-tight", {
              "text-foreground": variant === "default",
              "text-success": variant === "success",
              "text-warning": variant === "warning",
              "text-destructive": variant === "error",
            })}
          >
            {value}
          </p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        {Icon && (
          <div
            className={cn("rounded-lg p-2", {
              "bg-muted": variant === "default",
              "bg-success/10": variant === "success",
              "bg-warning/10": variant === "warning",
              "bg-destructive/10": variant === "error",
            })}
          >
            <Icon
              className={cn("h-4 w-4", {
                "text-muted-foreground": variant === "default",
                "text-success": variant === "success",
                "text-warning": variant === "warning",
                "text-destructive": variant === "error",
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
