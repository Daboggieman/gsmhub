import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Device } from '@shared/types'; // Import the shared Device type

interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  return (
    <Link href={`/devices/${device.slug}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
          {device.imageUrl ? (
            <Image
              src={device.imageUrl}
              alt={device.name}
              fill
              style={{ objectFit: 'contain' }}
              className="p-2"
            />
          ) : (
            <span className="text-gray-500">No Image</span>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {device.brand} {device.model}
          </h3>
          <p className="text-sm text-gray-600 mb-2 truncate">{device.name}</p>
          <div className="text-gray-700 text-sm flex-grow">
            {device.displaySize && (
              <p>
                <span className="font-medium">Display:</span> {device.displaySize}
              </p>
            )}
            {device.ram && (
              <p>
                <span className="font-medium">RAM:</span> {device.ram}
              </p>
            )}
            {device.storage && (
              <p>
                <span className="font-medium">Storage:</span> {device.storage}
              </p>
            )}
            {/* Add more key specs here as needed */}
          </div>
          {/* Price will be added later when we integrate pricing data */}
          {/* <p className="text-lg font-bold text-green-600 mt-3">
            {device.price ? `$${device.price.toFixed(2)}` : 'N/A'}
          </p> */}
        </div>
      </div>
    </Link>
  );
};

export default DeviceCard;
