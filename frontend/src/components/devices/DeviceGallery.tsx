"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

interface DeviceGalleryProps {
  imageUrls: string[];
  deviceName: string;
}

const DeviceGallery: React.FC<DeviceGalleryProps> = ({ imageUrls, deviceName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

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

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gallery</h2>
      <div 
        className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden cursor-zoom-in group"
        onClick={toggleZoom}
      >
        <Image
          src={currentImageUrl}
          alt={`${deviceName || 'Device'} image ${currentImageIndex + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          className="p-2 transition-transform duration-300 group-hover:scale-105"
          priority={currentImageIndex === 0} // Prioritize loading the first image
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <FontAwesomeIcon icon={faSearchPlus} />
        </div>
        
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none z-10"
            >
              &#10094;
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none z-10"
            >
              &#10095;
            </button>
          </>
        )}
      </div>

      {imageUrls.length > 1 && (
        <div className="flex mt-4 space-x-2 overflow-x-auto max-w-full pb-2">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className={`relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 cursor-pointer ${
                index === currentImageIndex ? 'border-2 border-blue-500' : 'border border-gray-200'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={url}
                alt={`${deviceName || 'Device'} thumbnail ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={toggleZoom}
        >
          <button 
            className="absolute top-4 right-4 text-white text-3xl p-2 hover:text-gray-300 focus:outline-none"
            onClick={toggleZoom}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image
              src={currentImageUrl}
              alt={`${deviceName || 'Device'} zoomed image`}
              fill
              style={{ objectFit: 'contain' }}
              className="p-4"
            />
          </div>

          {imageUrls.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-4 rounded-full hover:bg-opacity-40 focus:outline-none"
              >
                &#10094;
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-4 rounded-full hover:bg-opacity-40 focus:outline-none"
              >
                &#10095;
              </button>
            </>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <p className="bg-black bg-opacity-50 inline-block px-4 py-2 rounded-full">
              {deviceName} - Image {currentImageIndex + 1} of {imageUrls.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceGallery;
