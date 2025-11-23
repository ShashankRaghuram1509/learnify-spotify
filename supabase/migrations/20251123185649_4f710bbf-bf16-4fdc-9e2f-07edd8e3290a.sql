-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Teachers can upload course materials" ON storage.objects;

-- Create a better policy that allows teachers to upload to their course folders
CREATE POLICY "Teachers can upload course materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id::text = (storage.foldername(name))[1]
    AND courses.teacher_id = auth.uid()
  )
);