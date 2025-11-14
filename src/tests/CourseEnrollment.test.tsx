import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseDetail from '../pages/CourseDetail';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/toaster";

// Mock supabase client
const mockInsert = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth');

// Mock course data
const mockCourse = {
  id: "react-masterclass",
  title: "React.js Masterclass",
  instructor: "Amanda Lee",
  rating: 4.8,
  students: 1876,
  duration: "10 weeks",
  level: "Intermediate",
  price: 89.99,
  discountPrice: 59.99,
  image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
  description: "Master React.js with this comprehensive course covering hooks, context, state management, and modern React patterns.",
  externalLink: null,
  modules: [
    { title: "React Fundamentals", content: "Components, JSX, and props" },
    { title: "Hooks & State Management", content: "useState, useEffect, and custom hooks" },
    { title: "Context API", content: "Global state management with Context" },
    { title: "Advanced Patterns", content: "Higher-order components and render props" }
  ]
};

describe('CourseDetail Enrollment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'test-user-id' }, role: 'student', login: vi.fn(), logout: vi.fn(), signup: vi.fn() } as any);
  });

  it('should insert a record into the enrollments table when a user enrolls', async () => {
    // Arrange
    mockInsert.mockResolvedValueOnce({ data: {}, error: null } as any);

    render(
      <MemoryRouter initialEntries={['/courses/react-masterclass']}>
        <Routes>
          <Route path="/courses/:id" element={<CourseDetail course={mockCourse} />} />
        </Routes>
        <Toaster />
      </MemoryRouter>
    );

    // Act
    // Wait for the course to load and the button to be available
    const enrollButton = await screen.findByRole('button', { name: /Enroll Now/i });
    fireEvent.click(enrollButton);

    // Assert
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('enrollments');
      expect(mockInsert).toHaveBeenCalledWith([
        {
          student_id: 'test-user-id',
          course_id: 'react-masterclass',
        },
      ]);
    });
  });
});
