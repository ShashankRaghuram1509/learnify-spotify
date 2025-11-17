-- Fix critical security flaw: Force all new users to be students by default
-- Admin accounts will be created separately through secure admin interface

-- Drop the trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now drop and recreate the function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- SECURITY: Always assign 'student' role by default, ignoring any client input
  -- Teachers and admins must be created through secure admin interface
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student'::app_role);
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policy for admin role management
DROP POLICY IF EXISTS "Admins can manage instructor accounts" ON public.user_roles;
CREATE POLICY "Admins can manage instructor accounts"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role = 'teacher'::app_role
);

-- Enhance payments table to support course-specific purchases
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS plan_name text;

COMMENT ON COLUMN public.payments.course_id IS 'If null, payment is for subscription. If set, payment is for specific course purchase.';