-- Drop the existing policy that allows direct client inserts
DROP POLICY IF EXISTS "Students can enroll in courses" ON public.enrollments;

-- Create a new restrictive policy that only allows system (service role) to insert
CREATE POLICY "Only authenticated system can create enrollments"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Allow service role to insert (for Edge Functions)
CREATE POLICY "Service role can create enrollments"
ON public.enrollments
FOR INSERT
TO service_role
WITH CHECK (true);