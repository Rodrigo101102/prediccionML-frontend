import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

test('renders app without crashing', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // Just check that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
