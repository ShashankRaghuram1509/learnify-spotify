import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { vi } from 'vitest';

// Mock useAuth hook
vi.mock('@/hooks/useAuth');

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: null, role: null, login: vi.fn(), logout: vi.fn(), signup: vi.fn() });
  });

  it('should highlight the "Courses" link when on a course detail page', () => {
    render(
      <MemoryRouter initialEntries={['/courses/some-course']}>
        <Navbar />
      </MemoryRouter>
    );

    const coursesLink = screen.getByRole('link', { name: /Courses/i });
    expect(coursesLink).toHaveClass('active');
  });
});
