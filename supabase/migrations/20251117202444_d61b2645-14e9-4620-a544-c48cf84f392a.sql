-- Fix search_path security warning for cleanup_schedules_trigger function
CREATE OR REPLACE FUNCTION public.cleanup_schedules_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM public.delete_expired_schedules();
  RETURN NULL;
END;
$$;