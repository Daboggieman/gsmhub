import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SpecsTable from '../SpecsTable';
import { Device, DeviceType } from '../../../../../shared/src/types';

const mockDevice: Device = {
  _id: '1',
  name: 'iPhone 15 Pro',
  model: 'A3102',
  brand: 'Apple',
  slug: 'iphone-15-pro',
  type: DeviceType.PHONE,
  imageUrl: 'https://example.com/iphone15.jpg',
  displaySize: '6.1 inches',
  ram: '8GB',
  storage: '128GB',
  chipset: 'A17 Pro',
  latestPrice: 999,
  isActive: true,
  category: 'Smartphones',
  views: 1000,
  specs: [
    {
      category: 'Display',
      items: [
        { name: 'Resolution', value: '2556 x 1179' },
        { name: 'Type', value: 'OLED' }
      ]
    },
    {
      category: 'Platform',
      items: [
        { name: 'OS', value: 'iOS 17' }
      ]
    }
  ]
};

describe('SpecsTable', () => {
  it('renders all spec categories and items', () => {
    render(<SpecsTable device={mockDevice} />);
    
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.getByText('2556 x 1179')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('OS')).toBeInTheDocument();
    expect(screen.getByText('iOS 17')).toBeInTheDocument();
  });

  it('filters specs when searching', () => {
    render(<SpecsTable device={mockDevice} />);
    
    const searchInput = screen.getByPlaceholderText(/search specs/i);
    fireEvent.change(searchInput, { target: { value: 'Resolution' } });
    
    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.queryByText('Platform')).not.toBeInTheDocument();
    expect(screen.queryByText('OS')).not.toBeInTheDocument();
  });

  it('shows no results message when no specs match search', () => {
    render(<SpecsTable device={mockDevice} />);
    
    const searchInput = screen.getByPlaceholderText(/search specs/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText(/no matching specifications found/i)).toBeInTheDocument();
  });
});
