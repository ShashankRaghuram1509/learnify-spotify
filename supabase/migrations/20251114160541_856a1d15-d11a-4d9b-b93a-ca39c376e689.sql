-- Fix profile exposure vulnerability
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create contextual visibility policy for LMS
CREATE POLICY "Users can view relevant profiles"
ON public.profiles FOR SELECT
USING (
  -- Users can see their own profile
  auth.uid() = id 
  OR
  -- Students can see teachers of courses they're enrolled in
  id IN (
    SELECT c.teacher_id 
    FROM public.courses c
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE e.student_id = auth.uid()
  ) 
  OR
  -- Teachers can see students enrolled in their courses
  id IN (
    SELECT e.student_id 
    FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
    WHERE c.teacher_id = auth.uid()
      AND public.has_role(auth.uid(), 'teacher'::app_role)
  )
);