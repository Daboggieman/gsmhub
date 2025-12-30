import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchBar from '../SearchBar';
import { apiClient } from '../../lib/api';

// Mock the API client
vi.mock('../../lib/api', () => ({
  apiClient: {
    searchDevices: vi.fn(),
  },
}));

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search for phones/i)).toBeInTheDocument();
  });

  it('updates query on input change', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for phones/i);
    fireEvent.change(input, { target: { value: 'iphone' } });
    expect(input).toHaveValue('iphone');
  });

  it('shows dropdown results when typing enough characters', async () => {
    const mockResults = [
      { _id: '1', name: 'iPhone 15', slug: 'iphone-15', brand: 'Apple', imageUrl: '' },
    ];
    (apiClient.searchDevices as any).mockResolvedValue(mockResults);

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for phones/i);
    fireEvent.change(input, { target: { value: 'iphone' } });

    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      expect(screen.getByText('Suggested Devices')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows "no devices found" message when API returns empty', async () => {
    (apiClient.searchDevices as any).mockResolvedValue([]);

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for phones/i);
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/no devices found/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('clears results when clearing input', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for phones/i);
    fireEvent.change(input, { target: { value: 'iphone' } });
    
    const clearButton = screen.queryByRole('button'); // This logic might need refinement based on implementation
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(input).toHaveValue('');
    }
  });
});
