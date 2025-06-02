import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /sephora ingredient analyzer/i });
    expect(heading).toBeInTheDocument();
  });
}); 