-- Add meeting_url column to video_call_schedules
ALTER TABLE public.video_call_schedules 
ADD COLUMN IF NOT EXISTS meeting_url TEXT;