-- Add company response letter column to student_applications
ALTER TABLE public.student_applications
ADD COLUMN IF NOT EXISTS company_response_letter_url TEXT,
ADD COLUMN IF NOT EXISTS company_response_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.student_applications.company_response_letter_url IS 'URL to company acceptance/interview letter uploaded by admin';
COMMENT ON COLUMN public.student_applications.company_response_uploaded_at IS 'Timestamp when company response was uploaded';