import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SwapRequest = Database["public"]["Tables"]["swap_requests"]["Row"];

interface SwapRequestWithProfiles extends SwapRequest {
  requester?: {
    first_name: string;
    last_name: string;
  };
  target_therapist?: {
    first_name: string;
    last_name: string;
  } | null;
}

export function useSwapRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SwapRequestWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("swap_requests")
        .select(`
          *,
          requester:profiles!swap_requests_requester_id_fkey(first_name, last_name),
          target_therapist:profiles!swap_requests_target_therapist_id_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      toast.error("Failed to load swap requests");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    fetchRequests();

    const channel = supabase
      .channel("swap_requests_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "swap_requests",
        },
        (payload) => {
          const event = payload.eventType;
          
          if (event === "INSERT") {
            toast.info("New swap request submitted");
            fetchRequests();
          } else if (event === "UPDATE") {
            const updated = payload.new as SwapRequest;
            if (updated.status !== "pending") {
              const action = updated.status === "approved" ? "approved" : "denied";
              toast.info(`Swap request ${action}`);
            }
            fetchRequests();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchRequests]);

  return {
    requests,
    loading,
    refetch: fetchRequests,
  };
}