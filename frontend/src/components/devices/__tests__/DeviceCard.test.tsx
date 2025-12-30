import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DeviceCard from '../DeviceCard';
import { Device, DeviceType } from '../../../../shared/src/types';

const mockDevice: Device = {
  _id: '1',
  name: 'Apple iPhone 15 Pro',
  model: 'iPhone 15 Pro',
  brand: 'Apple',
  slug: 'iphone-15-pro',
  type: DeviceType.PHONE,
  imageUrl: 'https://example.com/iphone.jpg',
  displaySize: '6.1 inches',
  ram: '8GB',
  storage: '128GB',
  chipset: 'A17 Pro',
  latestPrice: 999,
  isActive: true,
  specs: [],
};

describe('DeviceCard', () => {
  it('renders device details correctly', () => {
    render(<DeviceCard device={mockDevice} />);
    
    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('Apple iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('6.1 inches')).toBeInTheDocument();
    expect(screen.getByText('8GB RAM')).toBeInTheDocument();
    expect(screen.getByText('128GB')).toBeInTheDocument();
    expect(screen.getByText('A17 Pro')).toBeInTheDocument();
    expect(screen.getByText('$999')).toBeInTheDocument();
  });

  it('renders "Check Price" when latestPrice is missing', () => {
    const deviceWithoutPrice = { ...mockDevice, latestPrice: undefined };
    render(<DeviceCard device={deviceWithoutPrice} />);
    
    expect(screen.getByText('Check Price')).toBeInTheDocument();
  });

  it('contains a link to the device detail page', () => {
    render(<DeviceCard device={mockDevice} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/devices/iphone-15-pro');
  });
});
