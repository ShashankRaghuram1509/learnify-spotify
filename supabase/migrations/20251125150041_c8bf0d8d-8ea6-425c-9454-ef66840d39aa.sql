-- Create storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for course thumbnails
CREATE POLICY "Anyone can view course thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can upload course thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-thumbnails' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update course thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-thumbnails' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete course thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-thumbnails' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for course videos
CREATE POLICY "Anyone can view course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update course videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Enable admins to manage all courses
CREATE POLICY "Admins can manage all courses"
ON public.courses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);