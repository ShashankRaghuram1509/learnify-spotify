import { render, screen, fireEvent } from '@testing-library/react';
import CourseDetail from '../pages/CourseDetail';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { vi } from 'vitest';

vi.mock('@/hooks/useAuth');

describe('CourseDetail', () => {
  it('should change the enroll button text to "Enrolled" after clicking', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, role: null, login: vi.fn(), logout: vi.fn(), signup: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/courses/react-masterclass']}>
        <Routes>
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const enrollButton = await screen.findByText('Enroll Now');
    fireEvent.click(enrollButton);

    const enrolledButton = await screen.findByText('Enrolled');
    expect(enrolledButton).toBeInTheDocument();
  });
});