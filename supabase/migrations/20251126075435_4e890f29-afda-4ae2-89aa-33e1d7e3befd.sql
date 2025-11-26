-- Create table to track student interest in external job postings
CREATE TABLE IF NOT EXISTS public.external_job_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_job_id text NOT NULL,
  job_title text NOT NULL,
  company_name text NOT NULL,
  job_url text,
  interested_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, external_job_id)
);

-- Enable RLS
ALTER TABLE public.external_job_interests ENABLE ROW LEVEL SECURITY;

-- Students can manage their own interests
CREATE POLICY "Students can manage own job interests"
  ON public.external_job_interests
  FOR ALL
  USING (auth.uid() = student_id);

-- Admins can view all interests
CREATE POLICY "Admins can view all job interests"
  ON public.external_job_interests
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_external_job_interests_student_id 
  ON public.external_job_interests(student_id);

-- Add trigger to update updated_at
CREATE TRIGGER update_external_job_interests_updated_at
  BEFORE UPDATE ON public.external_job_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();