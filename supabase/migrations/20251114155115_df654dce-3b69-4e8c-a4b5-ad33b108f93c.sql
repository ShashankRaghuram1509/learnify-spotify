-- Fix video call schedules to verify course enrollment
DROP POLICY IF EXISTS "Users can view their own schedules" ON video_call_schedules;

CREATE POLICY "Authorized users can view schedules"
ON video_call_schedules FOR SELECT
USING (
  auth.uid() = teacher_id OR
  (auth.uid() = student_id AND EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.student_id = auth.uid()
      AND e.course_id = video_call_schedules.course_id
  ))
);

-- Create trigger to auto-assign student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign student role when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();