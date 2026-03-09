import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const progressData = [
  { label: "Day Shifts", completed: 18, total: 21, color: "bg-primary" },
  { label: "Night Shifts", completed: 15, total: 21, color: "bg-accent" },
  { label: "Weekend", completed: 8, total: 12, color: "bg-success" },
];

export function ScheduleProgress() {
  return (
    <div className="rounded-lg border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-sm">Schedule Completion</h3>
        <div className="text-xs text-muted-foreground">Next 6 weeks</div>
      </div>
      
      <div className="space-y-4">
        {progressData.map((item, i) => {
          const percentage = (item.completed / item.total) * 100;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.completed}/{item.total}
                </span>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-2" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(percentage)}% complete</span>
                  <span>{item.total - item.completed} remaining</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Overall Progress</p>
            <p className="text-xs text-muted-foreground">Across all shift types</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-heading font-semibold text-foreground">76%</p>
            <p className="text-xs text-muted-foreground">13 gaps remain</p>
          </div>
        </div>
      </div>
    </div>
  );
}