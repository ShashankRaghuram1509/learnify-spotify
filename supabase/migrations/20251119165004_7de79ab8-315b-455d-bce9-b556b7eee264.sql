-- Create course_materials table to store AI-generated notes and materials
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  overview TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  code_examples JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  practice_exercises JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to ensure one material per course
CREATE UNIQUE INDEX IF NOT EXISTS course_materials_course_id_key ON public.course_materials(course_id);

-- Enable RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view course materials (free courses)
CREATE POLICY "Anyone can view free course materials"
ON public.course_materials
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_materials.course_id
    AND (c.is_premium = false OR c.is_premium IS NULL)
  )
);

-- Policy: Enrolled students can view premium course materials
CREATE POLICY "Enrolled students can view premium course materials"
ON public.course_materials
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = course_materials.course_id
    AND c.is_premium = true
    AND e.student_id = auth.uid()
  )
);

-- Policy: System can insert/update materials
CREATE POLICY "System can manage course materials"
ON public.course_materials
FOR ALL
USING (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON public.course_materials(course_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_materials_timestamp
BEFORE UPDATE ON public.course_materials
FOR EACH ROW
EXECUTE FUNCTION update_course_materials_updated_at();