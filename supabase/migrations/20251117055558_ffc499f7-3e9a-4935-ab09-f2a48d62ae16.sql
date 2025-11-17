-- Fix Critical Security Issue: Block direct client-side enrollment inserts
-- Only the backend function with service role should create enrollments
DROP POLICY IF EXISTS "Students can enroll in courses" ON public.enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON public.enrollments;

CREATE POLICY "Block direct client enrollment inserts"
  ON public.enrollments FOR INSERT
  WITH CHECK (false);

-- Fix Critical Security Issue: Block direct client-side certificate creation
-- Only the trigger should create certificates
DROP POLICY IF EXISTS "System can create certificates" ON public.certificates;

CREATE POLICY "Block direct client certificate creation"
  ON public.certificates FOR INSERT
  WITH CHECK (false);