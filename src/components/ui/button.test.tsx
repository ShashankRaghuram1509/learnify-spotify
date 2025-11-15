import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders as a child component', () => {
    render(
      <Button asChild>
        <a href="#">Click me</a>
      </Button>
    );
    expect(screen.getByRole('link', { name: /click me/i })).toBeInTheDocument();
  });
});
