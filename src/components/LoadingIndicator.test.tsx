import { render, screen } from '@testing-library/react';
import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders with the default message', () => {
    render(<LoadingIndicator />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with a custom message', () => {
    render(<LoadingIndicator message="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('renders the spinner SVG', () => {
    const { container } = render(<LoadingIndicator />);
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument();
  });
});