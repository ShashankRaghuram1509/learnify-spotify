-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'test')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 100,
  duration_minutes INTEGER, -- For tests
  instructions TEXT,
  attachment_url TEXT,
  allow_late_submission BOOLEAN DEFAULT false,
  proctoring_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create assignment_submissions table
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  submission_url TEXT,
  submission_text TEXT,
  marks_obtained INTEGER,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'late')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  graded_at TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create proctoring_logs table
CREATE TABLE public.proctoring_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.assignment_submissions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('tab_switch', 'window_blur', 'copy_attempt', 'paste_attempt', 'right_click', 'fullscreen_exit', 'suspicious_activity')),
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY "Teachers can manage own course assignments"
ON public.assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = assignments.course_id
    AND courses.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view assignments for enrolled courses"
ON public.assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = assignments.course_id
    AND enrollments.student_id = auth.uid()
  )
);

-- RLS Policies for assignment_submissions
CREATE POLICY "Students can view own submissions"
ON public.assignment_submissions
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create own submissions"
ON public.assignment_submissions
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own submissions"
ON public.assignment_submissions
FOR UPDATE
USING (auth.uid() = student_id AND status = 'pending');

CREATE POLICY "Teachers can view submissions for their courses"
ON public.assignment_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    WHERE a.id = assignment_submissions.assignment_id
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can grade submissions"
ON public.assignment_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    WHERE a.id = assignment_submissions.assignment_id
    AND c.teacher_id = auth.uid()
  )
);

-- RLS Policies for proctoring_logs
CREATE POLICY "Students can insert own proctoring logs"
ON public.proctoring_logs
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view proctoring logs for their courses"
ON public.proctoring_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assignment_submissions sub
    JOIN public.assignments a ON a.id = sub.assignment_id
    JOIN public.courses c ON c.id = a.course_id
    WHERE sub.id = proctoring_logs.submission_id
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view own proctoring logs"
ON public.proctoring_logs
FOR SELECT
USING (auth.uid() = student_id);

-- Create triggers for updated_at
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at
BEFORE UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();