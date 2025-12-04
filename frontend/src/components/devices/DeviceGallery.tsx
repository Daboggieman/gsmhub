import React from 'react';
import Image from 'next/image';

interface DeviceGalleryProps {
  imageUrls: string[];
  deviceName: string;
}

const DeviceGallery: React.FC<DeviceGalleryProps> = ({ imageUrls, deviceName }) => {
  const primaryImageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gallery</h2>
      {primaryImageUrl ? (
        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
          <Image
            src={primaryImageUrl}
            alt={`${deviceName} image`}
            fill
            style={{ objectFit: 'contain' }}
            className="p-2"
            priority // Prioritize loading the main image
          />
        </div>
      ) : (
        <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-100 flex items-center justify-center rounded-md text-gray-500">
          No Image Available
        </div>
      )}
      {/* Future: Implement image carousel and zoom functionality */}
      {/* {imageUrls && imageUrls.length > 1 && (
        <div className="flex mt-4 space-x-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden cursor-pointer">
              <Image
                src={url}
                alt={`${deviceName} thumbnail ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default DeviceGallery;
