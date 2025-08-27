import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Kingdom Wars')).toBeDefined();
  });
  
  it('renders the kingdom creation form', () => {
    render(<App />);
    expect(screen.getByText('Create Your Kingdom')).toBeDefined();
    expect(screen.getByLabelText('Kingdom Name')).toBeDefined();
  });
});