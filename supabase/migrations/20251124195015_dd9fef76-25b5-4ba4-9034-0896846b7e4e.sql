-- Create admin_course_feedback table for admin reviews on courses
CREATE TABLE IF NOT EXISTS public.admin_course_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  improvement_suggestions TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_course_feedback ENABLE ROW LEVEL SECURITY;

-- Admins can manage all feedback
CREATE POLICY "Admins can manage course feedback"
ON public.admin_course_feedback
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Teachers can view feedback for their courses
CREATE POLICY "Teachers can view feedback for their courses"
ON public.admin_course_feedback
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = admin_course_feedback.course_id
    AND courses.teacher_id = auth.uid()
  )
);

-- Create index for better query performance
CREATE INDEX idx_admin_course_feedback_course_id ON public.admin_course_feedback(course_id);
CREATE INDEX idx_admin_course_feedback_review_id ON public.admin_course_feedback(review_id);

-- Add updated_at trigger
CREATE TRIGGER update_admin_course_feedback_updated_at
BEFORE UPDATE ON public.admin_course_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();