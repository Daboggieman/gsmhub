import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PriceComparison from './PriceComparison';
import { PriceHistory } from '@shared/types';

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

const makePrice = (overrides: Partial<PriceHistory> & { price: number }): PriceHistory => ({
  _id: Math.random().toString(36).slice(2),
  country: 'USA',
  currency: 'USD',
  date: '2026-01-15T10:00:00Z',
  deviceId: 'd1',
  ...overrides,
} as PriceHistory);

describe('PriceComparison', () => {
  it('shows an empty state without prices', () => {
    render(<PriceComparison prices={[]} deviceName="Galaxy S24" />);
    expect(screen.getByText(/No pricing information available for Galaxy S24/)).toBeInTheDocument();
  });

  it('formats prices with the shared formatter and badges the cheapest offer', () => {
    render(
      <PriceComparison
        prices={[
          makePrice({ price: 899, retailer: 'Store B', _id: 'b' }),
          makePrice({ price: 699.99, retailer: 'Store A', _id: 'a' }),
        ]}
        deviceName="Galaxy S24"
      />
    );

    expect(screen.getByText('$699.99')).toBeInTheDocument();
    expect(screen.getByText('$899.00')).toBeInTheDocument();
    expect(screen.getByText('Best Deal')).toBeInTheDocument();
    // Best badge belongs to Store A (cheapest), not Store B.
    expect(screen.getByText('Store A').textContent).toContain('Best Deal');
  });

  it('does not badge a cross-currency raw-number minimum as best deal', () => {
    // 700 USD vs 500 NGN: raw sorting would crown the NGN row "best",
    // but each currency is judged within its own group.
    render(
      <PriceComparison
        prices={[
          makePrice({ price: 700, currency: 'USD', retailer: 'US Store', _id: 'us' }),
          makePrice({ price: 500, currency: 'NGN', retailer: 'NG Store', _id: 'ng' }),
        ]}
        deviceName="Galaxy S24"
      />
    );

    expect(screen.getByText('Prices in USD')).toBeInTheDocument();
    expect(screen.getByText('Prices in NGN')).toBeInTheDocument();
    const usStore = screen.getByText('US Store').textContent || '';
    const ngStore = screen.getByText('NG Store').textContent || '';
    expect(usStore).toContain('Best Deal');
    expect(ngStore).toContain('Best Deal');
  });

  it('renders Buy Now only for offers with an affiliate URL', () => {
    render(
      <PriceComparison
        prices={[
          makePrice({ price: 699, affiliateUrl: 'https://amazon.com/x?tag=gsmhub-20' }),
          makePrice({ price: 799, affiliateUrl: '' }),
        ]}
        deviceName="Galaxy S24"
      />
    );

    expect(screen.getByText('Buy Now')).toBeInTheDocument();
    expect(screen.getByText('No Link')).toBeInTheDocument();
  });
});
