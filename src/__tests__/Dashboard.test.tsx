import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

// Mock the hooks
jest.mock('../hooks/useAuth');
jest.mock('../hooks/useToast');

// Mock the API service
jest.mock('../services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'testuser', createdAt: '', updatedAt: '' },
      isLoading: false,
      logout: jest.fn(),
    });
    
    mockUseToast.mockReturnValue({
      success: jest.fn(),
      error: jest.fn(),
    });
  });

  test('renders dashboard with user greeting', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Bienvenido, testuser/)).toBeInTheDocument();
  });

  test('displays panel de control title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Panel de Control de Captura')).toBeInTheDocument();
  });

  test('shows duration input with proper validation attributes', () => {
    render(<Dashboard />);
    const durationInput = screen.getByRole('spinbutton');
    expect(durationInput).toHaveAttribute('min', '10');
    expect(durationInput).toHaveAttribute('max', '300');
  });
});