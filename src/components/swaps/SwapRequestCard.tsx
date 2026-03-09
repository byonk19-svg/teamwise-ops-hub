import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, X, ArrowLeftRight, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SwapRequest = Database["public"]["Tables"]["swap_requests"]["Row"];
type SwapRequestStatus = Database["public"]["Enums"]["swap_request_status"];

interface SwapRequestCardProps {
  request: SwapRequest & {
    requester?: {
      first_name: string;
      last_name: string;
    };
    target_therapist?: {
      first_name: string;
      last_name: string;
    } | null;
  };
  isManager?: boolean;
  onUpdate?: () => void;
}

const statusColors: Record<SwapRequestStatus, string> = {
  pending: "bg-warning/10 text-warning-foreground border-warning/20",
  approved: "bg-success/10 text-success-foreground border-success/20",
  denied: "bg-destructive/10 text-destructive-foreground border-destructive/20",
};

const statusLabels: Record<SwapRequestStatus, string> = {
  pending: "Pending Review",
  approved: "Approved",
  denied: "Denied",
};

export function SwapRequestCard({ request, isManager, onUpdate }: SwapRequestCardProps) {
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const handleStatusChange = async (newStatus: SwapRequestStatus) => {
    if (!user || !isManager) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("swap_requests")
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (error) throw error;

      // Get reviewer profile for notification
      const { data: reviewerProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      const reviewerName = reviewerProfile 
        ? `${reviewerProfile.first_name} ${reviewerProfile.last_name}`
        : "A manager";

      // Create notification for requester
      await supabase.from("notifications").insert([
        {
          user_id: request.requester_id,
          type: newStatus === "approved" ? "swap_approved" : "swap_denied",
          priority: newStatus === "approved" ? "high" : "medium",
          title: `Swap Request ${newStatus === "approved" ? "Approved" : "Denied"}`,
          message: `${reviewerName} has ${newStatus} your swap request for ${request.requested_shift_type} shift on ${format(new Date(request.requested_date), "MMM d")}`,
          data: {
            swap_request_id: request.id,
            reviewer_id: user.id,
            status: newStatus,
          },
        },
      ]);

      // Notify target therapist if specified and approved
      if (request.target_therapist_id && newStatus === "approved") {
        await supabase.from("notifications").insert([
          {
            user_id: request.target_therapist_id,
            type: "swap_approved" as const,
            priority: "high" as const,
            title: "Swap Request Approved",
            message: `The swap request involving your ${request.requested_shift_type} shift on ${format(new Date(request.requested_date), "MMM d")} has been approved`,
            data: {
              swap_request_id: request.id,
              requester_id: request.requester_id,
            },
          },
        ]);
      }

      toast.success(`Swap request ${newStatus} successfully`);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating swap request:", error);
      toast.error("Failed to update swap request");
    } finally {
      setUpdating(false);
    }
  };

  const requesterName = request.requester 
    ? `${request.requester.first_name} ${request.requester.last_name}`
    : "Unknown";

  const targetName = request.target_therapist
    ? `${request.target_therapist.first_name} ${request.target_therapist.last_name}`
    : "Any therapist";

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {request.requester 
                  ? getInitials(request.requester.first_name, request.requester.last_name)
                  : <User className="h-4 w-4" />
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{requesterName}</CardTitle>
              <CardDescription className="text-xs">
                Submitted {format(new Date(request.created_at), "MMM d, h:mm a")}
              </CardDescription>
            </div>
          </div>
          <Badge className={statusColors[request.status]}>
            {statusLabels[request.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Giving up
            </p>
            <p className="text-sm font-medium text-destructive">
              {request.offered_shift_type}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(request.offered_date), "MMM d, yyyy")}
            </p>
          </div>
          
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Wants to take
            </p>
            <p className="text-sm font-medium text-primary">
              {request.requested_shift_type}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(request.requested_date), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {request.target_therapist_id && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Target Therapist:
            </p>
            <p className="text-sm">{targetName}</p>
          </div>
        )}

        {request.reason && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Reason:
            </p>
            <p className="text-sm text-muted-foreground">{request.reason}</p>
          </div>
        )}

        {isManager && request.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={updating}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Swap Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve this swap request? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusChange("approved")}
                    disabled={updating}
                  >
                    {updating ? "Approving..." : "Approve"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10"
                  disabled={updating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Deny
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deny Swap Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to deny this swap request? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusChange("denied")}
                    disabled={updating}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {updating ? "Denying..." : "Deny"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}