import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Device } from '../../../../shared/src/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDisplay, 
  faMemory, 
  faHardDrive, 
  faMicrochip,
  faTag
} from '@fortawesome/free-solid-svg-icons';

interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  return (
    <Link href={`/devices/${device.slug}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative w-full h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
          {device.imageUrl ? (
            <Image
              src={device.imageUrl}
              alt={device.name || `${device.brand} ${device.model}`}
              fill
              style={{ objectFit: 'contain' }}
              className="p-6 transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <FontAwesomeIcon icon={faMobileScreen} className="text-4xl mb-2 opacity-20" />
              <span className="text-xs font-medium">No Image</span>
            </div>
          )}
          
          {/* Brand Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-blue-600 shadow-sm uppercase tracking-wider border border-blue-50">
              {device.brand}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {device.model}
          </h3>
          <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-tight truncate">
            {device.name}
          </p>
          
          <div className="space-y-2.5 mb-6 flex-grow">
            {device.displaySize && (
              <div className="flex items-center text-xs text-gray-600 gap-3">
                <div className="w-5 flex justify-center text-blue-500/70">
                  <FontAwesomeIcon icon={faDisplay} />
                </div>
                <span className="truncate">{device.displaySize}</span>
              </div>
            )}
            {device.ram && (
              <div className="flex items-center text-xs text-gray-600 gap-3">
                <div className="w-5 flex justify-center text-blue-500/70">
                  <FontAwesomeIcon icon={faMemory} />
                </div>
                <span className="truncate">{device.ram} RAM</span>
              </div>
            )}
            {device.storage && (
              <div className="flex items-center text-xs text-gray-600 gap-3">
                <div className="w-5 flex justify-center text-blue-500/70">
                  <FontAwesomeIcon icon={faHardDrive} />
                </div>
                <span className="truncate">{device.storage}</span>
              </div>
            )}
            {device.chipset && (
              <div className="flex items-center text-xs text-gray-600 gap-3">
                <div className="w-5 flex justify-center text-blue-500/70">
                  <FontAwesomeIcon icon={faMicrochip} />
                </div>
                <span className="truncate">{device.chipset}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center text-blue-600 font-bold">
              {device.latestPrice ? (
                <span className="text-xl tracking-tighter">
                  ${device.latestPrice.toFixed(0)}
                  <span className="text-xs font-medium ml-0.5 opacity-70">.{(device.latestPrice % 1).toFixed(2).split('.')[1]}</span>
                </span>
              ) : (
                <span className="text-gray-400 text-sm font-semibold">Check Price</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FontAwesomeIcon icon={faTag} className="text-xs" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Add faMobileScreen to the imports above if needed, but faMobileScreenButton is already available in common icons
import { faMobileScreen } from '@fortawesome/free-solid-svg-icons';

export default DeviceCard;