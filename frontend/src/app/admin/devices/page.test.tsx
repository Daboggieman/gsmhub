import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDevicesPage from './page';
import { apiClient } from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  apiClient: {
    getDevices: vi.fn(),
    deleteDevice: vi.fn(),
    syncDevice: vi.fn(),
    syncDevices: vi.fn(),
    bulkImportDevices: vi.fn(),
  },
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));


describe('AdminDevicesPage', () => {
  const mockDevices = [
    { _id: '1', name: 'Device 1', brand: 'Brand A', views: 100 },
    { _id: '2', name: 'Device 2', brand: 'Brand B', views: 200 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.getDevices as any).mockResolvedValue({
      devices: mockDevices,
      total: 2,
    });
  });

  it('renders device list', async () => {
    render(<AdminDevicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.getByText('Device 2')).toBeInTheDocument();
    });
  });

  it('handles search', async () => {
    render(<AdminDevicesPage />);
    
    const input = screen.getByPlaceholderText(/Search by/i);
    fireEvent.change(input, { target: { value: 'Device 1' } });
    fireEvent.click(screen.getByText('Filter'));
    
    await waitFor(() => {
      expect(apiClient.getDevices).toHaveBeenCalledWith(expect.objectContaining({ search: 'Device 1' }));
    });
  });

  it('handles delete', async () => {
    (apiClient.deleteDevice as any).mockResolvedValue({});
    // Mock confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    render(<AdminDevicesPage />);
    
    await waitFor(() => {
        expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
        expect(apiClient.deleteDevice).toHaveBeenCalledWith('1');
        expect(apiClient.getDevices).toHaveBeenCalledTimes(2); // Initial load + after delete
    });
  });
});
