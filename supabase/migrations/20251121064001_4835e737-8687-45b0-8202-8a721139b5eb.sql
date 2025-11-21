-- Make the course-materials bucket public so students can access resources
UPDATE storage.buckets 
SET public = true 
WHERE id = 'course-materials';