-- Relax RLS so students can update their own submissions (including status changes)
ALTER POLICY "Students can update own submissions"
ON public.assignment_submissions
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);