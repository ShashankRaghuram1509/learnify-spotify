-- Fix duplicate role assignment issue
-- Drop the redundant trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- The handle_new_user function and trigger already handle both profiles and roles correctly