-- Grant admins UPDATE permission on student_applications
DROP POLICY IF EXISTS "Admins can view all applications" ON student_applications;

CREATE POLICY "Admins can manage all applications"
ON student_applications
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));