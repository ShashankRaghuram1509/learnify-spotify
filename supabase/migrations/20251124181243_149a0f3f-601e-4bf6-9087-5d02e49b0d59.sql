-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_roles table
CREATE TABLE public.job_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  experience_level TEXT NOT NULL, -- 'entry', 'mid', 'senior'
  salary_min NUMERIC,
  salary_max NUMERIC,
  skills_required JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active', -- 'active', 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student_applications table
CREATE TABLE public.student_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_role_id UUID REFERENCES public.job_roles(id) ON DELETE CASCADE NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'shortlisted', 'rejected', 'selected'
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, job_role_id)
);

-- Create teacher_feedback table
CREATE TABLE public.teacher_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.student_applications(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  technical_skills TEXT,
  soft_skills TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  recommendation TEXT, -- 'highly_recommended', 'recommended', 'not_recommended'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create platform_analytics table for tracking usage
CREATE TABLE public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  total_enrollments INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0, -- in minutes
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Admins can manage companies"
  ON public.companies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view companies"
  ON public.companies FOR SELECT
  USING (true);

-- RLS Policies for job_roles
CREATE POLICY "Admins can manage job roles"
  ON public.job_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Premium students can view job roles"
  ON public.job_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND subscription_tier IN ('pro', 'premium')
      AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
    )
  );

-- RLS Policies for student_applications
CREATE POLICY "Students can manage own applications"
  ON public.student_applications FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all applications"
  ON public.student_applications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view applications of their students"
  ON public.student_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.student_id = student_applications.student_id
      AND c.teacher_id = auth.uid()
      AND has_role(auth.uid(), 'teacher'::app_role)
    )
  );

-- RLS Policies for teacher_feedback
CREATE POLICY "Teachers can create feedback for their students"
  ON public.teacher_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id
    AND has_role(auth.uid(), 'teacher'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.student_id = teacher_feedback.student_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view and update own feedback"
  ON public.teacher_feedback FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view feedback about them"
  ON public.teacher_feedback FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all feedback"
  ON public.teacher_feedback FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for platform_analytics
CREATE POLICY "Admins can manage analytics"
  ON public.platform_analytics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_roles_updated_at
  BEFORE UPDATE ON public.job_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_applications_updated_at
  BEFORE UPDATE ON public.student_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_feedback_updated_at
  BEFORE UPDATE ON public.teacher_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_analytics;