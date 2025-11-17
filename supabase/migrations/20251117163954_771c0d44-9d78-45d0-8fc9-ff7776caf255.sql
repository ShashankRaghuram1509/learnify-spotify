-- Create trigger to automatically set up new users with default role
-- The function public.handle_new_user() already exists and handles:
-- 1. Creating profile entry
-- 2. Assigning default 'student' role

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();