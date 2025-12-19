"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface DeviceGalleryProps {
  imageUrls: string[];
  deviceName: string;
}

const DeviceGallery: React.FC<DeviceGalleryProps> = ({ imageUrls, deviceName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Gallery</h2>
        <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-100 flex items-center justify-center rounded-md text-gray-500">
          No Image Available
        </div>
      </div>
    );
  }

  const currentImageUrl = imageUrls[currentImageIndex];

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gallery</h2>
      <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
        <Image
          src={currentImageUrl}
          alt={`${deviceName} image ${currentImageIndex + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          className="p-2"
          priority={currentImageIndex === 0} // Prioritize loading the first image
        />
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
            >
              &#10094;
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
            >
              &#10095;
            </button>
          </>
        )}
      </div>

      {imageUrls.length > 1 && (
        <div className="flex mt-4 space-x-2 overflow-x-auto">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className={`relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden cursor-pointer ${
                index === currentImageIndex ? 'border-2 border-blue-500' : ''
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={url}
                alt={`${deviceName} thumbnail ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceGallery;
