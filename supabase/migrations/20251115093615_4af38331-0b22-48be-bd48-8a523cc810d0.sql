-- Create transcripts table for storing video transcriptions and summaries
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  transcript TEXT,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on transcripts
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Students can view transcripts for their enrollments
CREATE POLICY "Students can view own transcripts"
  ON public.transcripts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.id = transcripts.enrollment_id
      AND enrollments.student_id = auth.uid()
    )
  );

-- System can insert transcripts
CREATE POLICY "System can insert transcripts"
  ON public.transcripts
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create function to send payment confirmation email
CREATE OR REPLACE FUNCTION public.handle_new_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user details
  SELECT email, full_name INTO user_email, user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Call the send-email edge function via pg_net (if available) or log for manual processing
  -- For now, we'll rely on the application layer to call this
  -- Insert into a notifications queue table for async processing
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment confirmations
DROP TRIGGER IF EXISTS on_payment_created ON public.payments;
CREATE TRIGGER on_payment_created
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_payment();