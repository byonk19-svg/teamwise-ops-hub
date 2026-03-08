import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-heading transition-colors",
  {
    variants: {
      variant: {
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning-foreground",
        error: "bg-destructive/10 text-destructive",
        info: "bg-primary/10 text-primary",
        neutral: "bg-muted text-muted-foreground",
        pending: "bg-accent/15 text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ variant, children, dot = true, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-success": variant === "success",
            "bg-warning": variant === "warning",
            "bg-destructive": variant === "error",
            "bg-primary": variant === "info",
            "bg-muted-foreground": variant === "neutral",
            "bg-accent": variant === "pending",
          })}
        />
      )}
      {children}
    </span>
  );
}
