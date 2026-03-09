import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ScheduleEvent = Database["public"]["Tables"]["schedule_events"]["Row"];

interface UseRealtimeScheduleOptions {
  onScheduleChange?: (event: ScheduleEvent) => void;
}

export function useRealtimeSchedule({ onScheduleChange }: UseRealtimeScheduleOptions = {}) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("schedule_events")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "schedule_events",
        },
        (payload) => {
          const event = payload.new as ScheduleEvent;
          
          // Show toast notification for schedule changes
          const eventLabels: Record<string, string> = {
            assignment_added: "New assignment added",
            assignment_removed: "Assignment removed",
            status_changed: "Status updated",
            swap_approved: "Swap approved",
            swap_rejected: "Swap rejected",
          };

          const label = eventLabels[event.event_type] || "Schedule updated";
          
          toast.info(label, {
            description: `${event.shift_date} ${event.shift_type} shift`,
          });

          onScheduleChange?.(event);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onScheduleChange]);

  const logScheduleEvent = useCallback(
    async (
      eventType: string,
      shiftDate: string,
      shiftType: string,
      therapistId?: string,
      oldValue?: Record<string, unknown>,
      newValue?: Record<string, unknown>
    ) => {
      if (!user) return;

      const { error } = await supabase.from("schedule_events").insert([
        {
          event_type: eventType,
          shift_date: shiftDate,
          shift_type: shiftType,
          therapist_id: therapistId || null,
          changed_by: user.id,
          old_value: (oldValue || {}) as any,
          new_value: (newValue || {}) as any,
        },
      ]);

      if (error) {
        console.error("Failed to log schedule event:", error);
      }
    },
    [user]
  );

  return { logScheduleEvent };
}
