import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPricesPage from './page';
import { apiClient } from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  apiClient: {
    getPrices: vi.fn(),
    createPrice: vi.fn(),
    updatePrice: vi.fn(),
    deletePrice: vi.fn(),
    getDevices: vi.fn(),
  },
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe('AdminPricesPage', () => {
  const mockPrices = [
    {
      id: 'p1',
      price: 699.99,
      currency: 'USD',
      country: 'USA',
      retailer: 'Amazon',
      date: '2026-01-15T10:00:00Z',
      device: { name: 'Device 1', brand: 'Brand A' },
    },
    {
      id: 'p2',
      price: 899,
      currency: 'EUR',
      country: 'EU',
      date: '2026-02-01T10:00:00Z',
      device: { name: 'Device 2', brand: 'Brand B' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
    (apiClient.getPrices as any).mockResolvedValue({
      prices: mockPrices,
      total: 2,
    });
  });

  it('renders price list', async () => {
    render(<AdminPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.getByText('Device 2')).toBeInTheDocument();
      expect(screen.getByText('$699.99')).toBeInTheDocument();
    });
  });

  it('handles search', async () => {
    render(<AdminPricesPage />);

    const input = screen.getByPlaceholderText(/Search by/i);
    fireEvent.change(input, { target: { value: 'Amazon' } });
    fireEvent.click(screen.getByText('Filter'));

    // URL-driven search: submitting pushes a new URL with ?search= (and
    // resets the page); the fetch effect then picks it up.
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('search=Amazon')
      );
    });
  });

  it('deletes a price entry', async () => {
    (apiClient.deletePrice as any).mockResolvedValue({});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<AdminPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(apiClient.deletePrice).toHaveBeenCalledWith('p1');
      expect(apiClient.getPrices).toHaveBeenCalledTimes(2); // Initial load + after delete
    });
  });

  it('opens edit form prefilled and saves changes', async () => {
    (apiClient.updatePrice as any).mockResolvedValue({});

    render(<AdminPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);

    // Edit mode shows the fixed device and the existing values.
    await waitFor(() => {
      expect(screen.getByText('Device 1', { selector: 'span' })).toBeInTheDocument();
    });
    const priceInput = screen.getByPlaceholderText('699.99') as HTMLInputElement;
    expect(priceInput.value).toBe('699.99');

    fireEvent.change(priceInput, { target: { value: '649.99' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(apiClient.updatePrice).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ price: 649.99 })
      );
      expect(apiClient.getPrices).toHaveBeenCalledTimes(2);
    });
  });
});
