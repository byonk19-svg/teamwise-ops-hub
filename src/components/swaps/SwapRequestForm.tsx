import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const formSchema = z.object({
  requestedDate: z.date({
    required_error: "Please select a date you want to work",
  }),
  requestedShiftType: z.string({
    required_error: "Please select a shift type",
  }),
  offeredDate: z.date({
    required_error: "Please select a date you want to swap",
  }),
  offeredShiftType: z.string({
    required_error: "Please select a shift type",
  }),
  targetTherapistId: z.string().optional(),
  reason: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const shiftTypes = ["Morning", "Afternoon", "Evening", "Night"];

interface SwapRequestFormProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function SwapRequestForm({ children, onSuccess }: SwapRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to submit a swap request");
      return;
    }

    setSubmitting(true);
    try {
      // Insert the swap request
      const { data: swapRequest, error: swapError } = await supabase
        .from("swap_requests")
        .insert([
          {
            requester_id: user.id,
            requested_date: format(data.requestedDate, "yyyy-MM-dd"),
            requested_shift_type: data.requestedShiftType,
            offered_date: format(data.offeredDate, "yyyy-MM-dd"),
            offered_shift_type: data.offeredShiftType,
            target_therapist_id: data.targetTherapistId || null,
            reason: data.reason,
          },
        ])
        .select()
        .single();

      if (swapError) throw swapError;

      // Get requester's profile for notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      const requesterName = profile 
        ? `${profile.first_name} ${profile.last_name}`
        : "Someone";

      // Create notification for managers
      const { data: managers } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "manager"]);

      if (managers && managers.length > 0) {
        const notifications = managers.map((manager) => ({
          user_id: manager.user_id,
          type: "swap_request" as const,
          priority: "medium" as const,
          title: "New Swap Request",
          message: `${requesterName} requested to swap ${data.offeredShiftType} shift on ${format(data.offeredDate, "MMM d")} for ${data.requestedShiftType} shift on ${format(data.requestedDate, "MMM d")}`,
          data: {
            swap_request_id: swapRequest.id,
            requester_id: user.id,
            requested_date: data.requestedDate,
            offered_date: data.offeredDate,
          },
        }));

        await supabase.from("notifications").insert(notifications);
      }

      // Notify target therapist if specified
      if (data.targetTherapistId) {
        await supabase.from("notifications").insert([
          {
            user_id: data.targetTherapistId,
            type: "swap_request" as const,
            priority: "high" as const,
            title: "Swap Request for You",
            message: `${requesterName} wants to swap shifts with you. They're offering their ${data.offeredShiftType} shift on ${format(data.offeredDate, "MMM d")} for your ${data.requestedShiftType} shift on ${format(data.requestedDate, "MMM d")}`,
            data: {
              swap_request_id: swapRequest.id,
              requester_id: user.id,
            },
          },
        ]);
      }

      toast.success("Swap request submitted successfully!");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting swap request:", error);
      toast.error("Failed to submit swap request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Request Shift Swap
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Offering Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-destructive">
                  I want to give up:
                </h3>
                
                <FormField
                  control={form.control}
                  name="offeredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="offeredShiftType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shiftTypes.map((shift) => (
                            <SelectItem key={shift} value={shift}>
                              {shift}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Requesting Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-primary">
                  I want to take:
                </h3>
                
                <FormField
                  control={form.control}
                  name="requestedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestedShiftType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shiftTypes.map((shift) => (
                            <SelectItem key={shift} value={shift}>
                              {shift}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="targetTherapistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Therapist (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Leave empty for any therapist"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why you need this swap..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}