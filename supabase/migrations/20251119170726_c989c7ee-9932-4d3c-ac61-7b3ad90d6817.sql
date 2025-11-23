-- Add profile fields for student information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS college text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS resume_url text,
ADD COLUMN IF NOT EXISTS resume_text text;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for resume uploads
CREATE POLICY "Users can upload their own resume"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resume"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own resume"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resume"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure certificate generation trigger exists
CREATE OR REPLACE FUNCTION public.generate_certificate_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.progress = 100 AND (OLD.progress IS NULL OR OLD.progress < 100) THEN
    INSERT INTO public.certificates (student_id, course_id, enrollment_id)
    VALUES (NEW.student_id, NEW.course_id, NEW.id)
    ON CONFLICT (enrollment_id) DO NOTHING;
    
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_enrollment_progress_update ON public.enrollments;
CREATE TRIGGER on_enrollment_progress_update
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.generate_certificate_on_completion();