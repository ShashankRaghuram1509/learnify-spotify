-- Fix security warning: Set search_path for generate_certificate_on_completion function
CREATE OR REPLACE FUNCTION public.generate_certificate_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.progress = 100 AND (OLD.progress IS NULL OR OLD.progress < 100) THEN
    INSERT INTO public.certificates (student_id, course_id, enrollment_id)
    VALUES (NEW.student_id, NEW.course_id, NEW.id)
    ON CONFLICT (student_id, course_id) DO NOTHING;
    
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;