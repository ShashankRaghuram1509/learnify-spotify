-- Fix enrollment RLS policies to allow users to enroll

-- Drop the broken policy that prevents enrollment
DROP POLICY IF EXISTS "Only authenticated system can create enrollments" ON public.enrollments;

-- Create a proper policy that allows authenticated users to enroll themselves
CREATE POLICY "Users can enroll in courses"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Ensure the service role policy exists for edge functions
DROP POLICY IF EXISTS "Service role can create enrollments" ON public.enrollments;
CREATE POLICY "Service role can create enrollments"
ON public.enrollments
FOR INSERT
TO service_role
WITH CHECK (true);