-- Add foreign key constraint from assignment_submissions to profiles
ALTER TABLE public.assignment_submissions
ADD CONSTRAINT assignment_submissions_student_id_fkey
FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;