import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const progressData = [
  { label: "Day Shifts", completed: 18, total: 21, color: "bg-primary" },
  { label: "Night Shifts", completed: 15, total: 21, color: "bg-accent" },
  { label: "Weekend", completed: 8, total: 12, color: "bg-success" },
];

export function ScheduleProgress() {
  return (
    <div className="rounded-lg border bg-card h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="font-heading font-semibold text-sm">Schedule Completion</h3>
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Next 6 weeks</span>
      </div>
      
      <div className="px-5 py-4 space-y-5 flex-1">
        {progressData.map((item, i) => {
          const percentage = (item.completed / item.total) * 100;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {item.completed}/{item.total}
                </span>
              </div>
              <Progress value={percentage} className="h-1.5" />
              <div className="mt-1 flex justify-between">
                <span className="text-[11px] text-muted-foreground">{Math.round(percentage)}%</span>
                <span className="text-[11px] text-muted-foreground">{item.total - item.completed} remaining</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="px-5 py-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Overall</p>
            <p className="text-[11px] text-muted-foreground">All shift types</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-heading font-bold text-foreground tabular-nums">76%</p>
            <p className="text-[11px] text-muted-foreground">13 gaps</p>
          </div>
        </div>
      </div>
    </div>
  );
}