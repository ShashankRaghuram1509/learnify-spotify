
-- Add columns to enrollments table for progress tracking
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS video_minutes_watched integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS test_progress_bonus integer DEFAULT 0;

-- Create student_test_attempts table to track test attempts
CREATE TABLE IF NOT EXISTS public.student_test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  marks_obtained integer,
  passed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(student_id, assignment_id, attempt_number)
);

-- Create proctoring_violations table for tracking violations
CREATE TABLE IF NOT EXISTS public.proctoring_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  violation_count integer DEFAULT 0,
  failed_attempts integer DEFAULT 0,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_student_violations FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(student_id, assignment_id)
);

-- Create video_watch_tracking table
CREATE TABLE IF NOT EXISTS public.video_watch_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  minutes_watched integer DEFAULT 0,
  last_position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_student_watch FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(student_id, course_id, video_url)
);

-- Enable RLS on new tables
ALTER TABLE public.student_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_test_attempts
CREATE POLICY "Students can view own attempts"
ON public.student_test_attempts FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attempts"
ON public.student_test_attempts FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view attempts for their courses"
ON public.student_test_attempts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    WHERE a.id = student_test_attempts.assignment_id
    AND c.teacher_id = auth.uid()
  )
);

-- RLS policies for proctoring_violations
CREATE POLICY "Students can view own violations"
ON public.proctoring_violations FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can manage violations"
ON public.proctoring_violations FOR ALL
USING (true);

CREATE POLICY "Teachers can view violations for their courses"
ON public.proctoring_violations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    WHERE a.id = proctoring_violations.assignment_id
    AND c.teacher_id = auth.uid()
  )
);

-- RLS policies for video_watch_tracking
CREATE POLICY "Students can manage own watch tracking"
ON public.video_watch_tracking FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view watch tracking for their courses"
ON public.video_watch_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = video_watch_tracking.course_id
    AND c.teacher_id = auth.uid()
  )
);

-- Function to update enrollment progress based on test results
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_marks integer;
  v_percentage numeric;
  v_enrollment_id uuid;
  v_course_id uuid;
BEGIN
  -- Only process when status changes to 'graded'
  IF NEW.status = 'graded' AND (OLD.status IS NULL OR OLD.status != 'graded') THEN
    
    -- Get assignment details
    SELECT total_marks, course_id INTO v_total_marks, v_course_id
    FROM public.assignments
    WHERE id = NEW.assignment_id;
    
    -- Calculate percentage
    v_percentage := (NEW.marks_obtained::numeric / v_total_marks::numeric) * 100;
    
    -- Get enrollment
    SELECT id INTO v_enrollment_id
    FROM public.enrollments
    WHERE student_id = NEW.student_id AND course_id = v_course_id;
    
    -- If passed with > 75%, add 10% progress bonus
    IF v_percentage > 75 THEN
      UPDATE public.enrollments
      SET test_progress_bonus = LEAST(test_progress_bonus + 10, 100)
      WHERE id = v_enrollment_id;
      
      -- Record successful attempt
      INSERT INTO public.student_test_attempts (
        student_id, assignment_id, submission_id, 
        attempt_number, marks_obtained, passed
      )
      SELECT 
        NEW.student_id, NEW.assignment_id, NEW.id,
        COALESCE(MAX(attempt_number), 0) + 1, NEW.marks_obtained, true
      FROM public.student_test_attempts
      WHERE student_id = NEW.student_id AND assignment_id = NEW.assignment_id;
    ELSE
      -- Record failed attempt
      INSERT INTO public.student_test_attempts (
        student_id, assignment_id, submission_id,
        attempt_number, marks_obtained, passed
      )
      SELECT 
        NEW.student_id, NEW.assignment_id, NEW.id,
        COALESCE(MAX(attempt_number), 0) + 1, NEW.marks_obtained, false
      FROM public.student_test_attempts
      WHERE student_id = NEW.student_id AND assignment_id = NEW.assignment_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for enrollment progress update
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress ON public.assignment_submissions;
CREATE TRIGGER trigger_update_enrollment_progress
AFTER UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_enrollment_progress();

-- Function to check and block students for proctoring violations
CREATE OR REPLACE FUNCTION public.check_proctoring_violations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_violation_count integer;
  v_failed_attempts integer;
BEGIN
  -- Count violations for this submission
  SELECT COUNT(*) INTO v_violation_count
  FROM public.proctoring_logs
  WHERE submission_id = NEW.id;
  
  -- If high violation count, increment failed attempts
  IF v_violation_count >= 10 THEN
    INSERT INTO public.proctoring_violations (
      student_id, assignment_id, violation_count, failed_attempts
    )
    VALUES (NEW.student_id, NEW.assignment_id, v_violation_count, 1)
    ON CONFLICT (student_id, assignment_id)
    DO UPDATE SET
      violation_count = proctoring_violations.violation_count + v_violation_count,
      failed_attempts = proctoring_violations.failed_attempts + 1,
      blocked_until = CASE 
        WHEN proctoring_violations.failed_attempts + 1 >= 3 
        THEN now() + interval '10 days'
        ELSE proctoring_violations.blocked_until
      END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for proctoring violations
DROP TRIGGER IF EXISTS trigger_check_proctoring_violations ON public.assignment_submissions;
CREATE TRIGGER trigger_check_proctoring_violations
AFTER INSERT OR UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.check_proctoring_violations();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_test_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proctoring_violations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_watch_tracking;
