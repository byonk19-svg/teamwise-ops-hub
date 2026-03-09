-- Create enum for swap request status
CREATE TYPE public.swap_request_status AS ENUM ('pending', 'approved', 'denied');

-- Create swap_requests table
CREATE TABLE public.swap_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  requested_date DATE NOT NULL,
  requested_shift_type TEXT NOT NULL,
  offered_date DATE NOT NULL,
  offered_shift_type TEXT NOT NULL,
  target_therapist_id UUID,
  reason TEXT,
  status swap_request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for swap requests
CREATE POLICY "Users can view swap requests where they are involved"
ON public.swap_requests FOR SELECT
USING (
  auth.uid() = requester_id 
  OR auth.uid() = target_therapist_id 
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Therapists can create swap requests"
ON public.swap_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Managers can update swap request status"
ON public.swap_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Add trigger for updating timestamps
CREATE TRIGGER update_swap_requests_updated_at
BEFORE UPDATE ON public.swap_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for swap requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.swap_requests;

-- Create indexes for performance
CREATE INDEX idx_swap_requests_requester_id ON public.swap_requests(requester_id);
CREATE INDEX idx_swap_requests_target_therapist_id ON public.swap_requests(target_therapist_id);
CREATE INDEX idx_swap_requests_status ON public.swap_requests(status);
CREATE INDEX idx_swap_requests_created_at ON public.swap_requests(created_at);