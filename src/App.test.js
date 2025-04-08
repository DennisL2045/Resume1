import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the correct header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Hello, React with Jest!/i);
  expect(headerElement).toBeInTheDocument();
});
