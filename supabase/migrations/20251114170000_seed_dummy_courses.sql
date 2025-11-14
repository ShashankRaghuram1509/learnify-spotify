-- Seed a dummy teacher
INSERT INTO auth.users (id, email, encrypted_password, role)
VALUES ('f5a28b70-42c1-42a1-87a4-315574d71234', 'teacher@example.com', crypt('password123', gen_salt('bf')), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name)
VALUES ('f5a28b70-42c1-42a1-87a4-315574d71234', 'teacher@example.com', 'Dummy Teacher')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('f5a28b70-42c1-42a1-87a4-315574d71234', 'teacher')
ON CONFLICT (user_id, role) DO NOTHING;

-- Seed dummy courses
INSERT INTO public.courses (title, description, price, thumbnail_url, video_url, is_premium, teacher_id)
VALUES
('Introduction to TypeScript', 'Learn the basics of TypeScript and its features.', 49.99, 'https://example.com/thumb1.jpg', 'https://example.com/video1.mp4', false, 'f5a28b70-42c1-42a1-87a4-315574d71234'),
('Advanced React Patterns', 'Master advanced React concepts and patterns.', 99.99, 'https://example.com/thumb2.jpg', 'https://example.com/video2.mp4', true, 'f5a28b70-42c1-42a1-87a4-315574d71234'),
('Building a REST API with Node.js', 'Create a robust REST API using Node.js and Express.', 79.99, 'https://example.com/thumb3.jpg', 'https://example.com/video3.mp4', false, 'f5a28b70-42c1-42a1-87a4-315574d71234');
