import { render, screen } from '@testing-library/react';
import PremiumCourses from '../pages/PremiumCourses';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { vi } from 'vitest';

vi.mock('@/hooks/useAuth');

describe('PremiumCourses', () => {
  it('should not be visible for unauthorized users', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, role: null, login: vi.fn(), logout: vi.fn(), signup: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/premium-courses']}>
        <Routes>
          <Route path="/premium-courses" element={<PremiumCourses />} />
          <Route path="/dashboard/student/upgrade" element={<div>Upgrade Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const heading = screen.queryByRole('heading', {
      name: /Premium Courses/i,
    });

    expect(heading).not.toBeInTheDocument();
  });
});