-- Modify video_call_schedules table for timetable approach
-- Remove meeting_url since calls will be initiated in real-time
ALTER TABLE public.video_call_schedules DROP COLUMN IF EXISTS meeting_url;

-- Add new status values for the timetable approach
ALTER TABLE public.video_call_schedules ALTER COLUMN status SET DEFAULT 'scheduled'::text;

-- Create function to auto-delete expired schedule slots (15 minutes after scheduled time)
CREATE OR REPLACE FUNCTION public.delete_expired_schedules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.video_call_schedules
  WHERE scheduled_at < (now() - interval '15 minutes')
  AND status = 'scheduled';
END;
$$;

-- Create trigger to run cleanup after insert/update
CREATE OR REPLACE FUNCTION public.cleanup_schedules_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.delete_expired_schedules();
  RETURN NULL;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_cleanup_schedules ON public.video_call_schedules;
CREATE TRIGGER trigger_cleanup_schedules
AFTER INSERT OR UPDATE ON public.video_call_schedules
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_schedules_trigger();