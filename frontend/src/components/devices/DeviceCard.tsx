import React from 'react';
import Link from 'next/link';
import { Device } from '@shared/types';
import DeviceImage from './DeviceImage';

interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const specRows: { icon: string; label: string; value?: string }[] = [
    { icon: 'memory', label: 'Chipset', value: device.chipset },
    { icon: 'smartphone', label: 'Display', value: device.displaySize },
    {
      icon: 'sd_card',
      label: 'Memory',
      value:
        device.ram && device.storage
          ? `${device.ram} • ${device.storage}`
          : device.ram || device.storage,
    },
  ];

  return (
    <Link
      href={`/devices/${device.slug}`}
      className="bg-surface-container-low rounded-lg p-space-sm md:p-space-md flex flex-col justify-between hover:bg-surface-container transition-all group shadow-md md:shadow-none"
    >
      <div>
        {/* Top Row: Brand Pill */}
        <div className="flex items-center justify-between mb-space-xs">
          <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs uppercase font-bold truncate">
            {device.brand}
          </span>
        </div>

        {/* Product Image Frame */}
        <div className="w-full h-36 bg-surface-container rounded flex items-center justify-center p-2 relative overflow-hidden mb-space-sm">
          {device.imageUrl ? (
            <DeviceImage
              src={device.imageUrl}
              alt={device.name || `${device.brand} ${device.model}`}
              className="h-full w-auto object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105"
            />
          ) : (
            <span
              className="material-symbols-outlined text-[40px] text-outline-variant"
              aria-hidden="true"
            >
              mobile_off
            </span>
          )}
          {device.displaySize && (
            <span className="absolute bottom-1 right-2 font-label-xs text-label-xs text-outline bg-surface-container-lowest/80 px-1 py-0.5 rounded">
              {device.displaySize}
            </span>
          )}
        </div>

        {/* Title & Brand */}
        <div className="mb-space-xs">
          <span className="font-label-xs text-label-xs text-outline uppercase tracking-wider">
            {device.brand}
          </span>
          <h3 className="font-label-md text-label-md font-bold text-on-surface line-clamp-2">
            {device.model || device.name}
          </h3>
        </div>

        {/* Spec Matrix (Compact rows) */}
        {specRows.some((r) => r.value) && (
          <div className="space-y-1 mb-space-sm bg-surface-container-lowest/60 p-2 rounded font-body-sm text-body-sm">
            {specRows
              .filter((r) => r.value)
              .map((row) => (
                <div key={row.label} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-outline">
                    <span className="material-symbols-outlined text-secondary text-[13px]" aria-hidden="true">
                      {row.icon}
                    </span>
                    {row.label}
                  </span>
                  <span className="text-on-surface font-medium truncate max-w-[130px] tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Price & Bottom Action */}
      <div className="pt-space-xs flex items-center justify-between">
        <div>
          <span className="block font-label-xs text-label-xs text-outline uppercase">
            {device.latestPrice ? 'Est. Price' : 'Availability'}
          </span>
          {device.latestPrice ? (
            <span className="font-headline-md text-headline-md text-secondary font-bold tabular-nums">
              ${device.latestPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          ) : (
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Check Price
            </span>
          )}
        </div>
        <span
          className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-secondary transition-colors"
          aria-hidden="true"
        >
          arrow_forward
        </span>
      </div>
    </Link>
  );
};

export default DeviceCard;
