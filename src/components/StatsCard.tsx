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
  onClick?: () => void;
  clickable?: boolean;
}

export function StatsCard({ label, value, sublabel, icon: Icon, variant = "default", className, onClick, clickable = false }: StatsCardProps) {
  const Component = clickable ? "button" : "div";
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card px-5 py-4 animate-fade-in text-left",
        clickable && "cursor-pointer hover:bg-muted/30 transition-colors duration-200 active:scale-[0.98] transform",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p
            className={cn("text-2xl font-heading font-semibold tracking-tight mt-1", {
              "text-foreground": variant === "default",
              "text-success": variant === "success",
              "text-warning": variant === "warning",
              "text-destructive": variant === "error",
            })}
          >
            {value}
          </p>
          {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
        </div>
        {Icon && (
          <div
            className={cn("rounded-lg p-2 flex-shrink-0", {
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
    </Component>
  );
}
