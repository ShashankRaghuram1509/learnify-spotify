-- Allow teachers to view payments for their courses
CREATE POLICY "Teachers can view payments for their courses"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = payments.course_id
    AND c.teacher_id = auth.uid()
  )
);