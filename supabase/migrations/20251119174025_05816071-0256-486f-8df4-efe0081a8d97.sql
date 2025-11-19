-- Add LinkedIn profile field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Create course_resources table for PDFs, videos, and external links
CREATE TABLE IF NOT EXISTS public.course_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'video', 'article_link', 'video_link')),
  title TEXT NOT NULL,
  url TEXT,
  file_path TEXT,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course_resources
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view resources for courses
CREATE POLICY "Anyone can view free course resources"
ON public.course_resources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_resources.course_id
    AND (c.is_premium = false OR c.is_premium IS NULL)
  )
);

-- Enrolled students can view premium course resources
CREATE POLICY "Enrolled students can view premium course resources"
ON public.course_resources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE c.id = course_resources.course_id
    AND c.is_premium = true
    AND e.student_id = auth.uid()
  )
);

-- Teachers can manage resources for their own courses
CREATE POLICY "Teachers can manage own course resources"
ON public.course_resources
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_resources.course_id
    AND c.teacher_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_course_resources_updated_at
BEFORE UPDATE ON public.course_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for course materials (PDFs, videos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Allow teachers to upload course materials
CREATE POLICY "Teachers can upload course materials"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow teachers to view their own course materials
CREATE POLICY "Teachers can view own course materials"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'course-materials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow enrolled students to view course materials
CREATE POLICY "Enrolled students can view course materials"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE e.student_id = auth.uid()
    AND (storage.foldername(name))[2] = c.id::text
  )
);