"use client";

import React, { useState } from 'react';
import DeviceImage from './DeviceImage';

interface DeviceGalleryProps {
  imageUrls: string[];
  deviceName: string;
}

const DeviceGallery: React.FC<DeviceGalleryProps> = ({ imageUrls, deviceName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="bg-surface-container-low shadow-md md:shadow-none rounded-xl p-space-md flex flex-col items-center justify-center">
        <h2 className="font-headline-md text-headline-md mb-space-md text-on-surface font-bold">Gallery</h2>
        <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-surface-container flex flex-col items-center justify-center rounded-lg text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2" aria-hidden="true">
            image
          </span>
          <span className="font-body-sm text-body-sm">No Image Available</span>
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
    <div className="bg-surface-container-low shadow-md md:shadow-none rounded-xl p-space-md flex flex-col items-center justify-center">
      <h2 className="font-headline-md text-headline-md mb-space-md text-on-surface font-bold">Gallery</h2>
      <div
        className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-surface-container flex items-center justify-center rounded-lg overflow-hidden cursor-zoom-in group"
        onClick={toggleZoom}
      >
        <DeviceImage
          src={currentImageUrl}
          alt={`${deviceName || 'Device'} image ${currentImageIndex + 1}`}
          style={{ objectFit: 'contain' }}
          className="p-2 transition-transform duration-300 group-hover:scale-105"
          priority={currentImageIndex === 0} // Prioritize loading the first image
          fallbackLabel="No Picture"
        />
        <div className="absolute top-2 right-2 bg-surface-container-lowest/80 text-on-surface p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">zoom_in</span>
        </div>

        {imageUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface-container-highest/70 text-on-surface p-1.5 rounded-full hover:bg-surface-container-highest focus:outline-none z-10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_left</span>
            </button>
            <button
              onClick={goToNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-container-highest/70 text-on-surface p-1.5 rounded-full hover:bg-surface-container-highest focus:outline-none z-10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {imageUrls.length > 1 && (
        <div className="flex mt-space-md space-x-2 overflow-x-auto max-w-full pb-2">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className={`relative w-16 h-16 bg-surface-container rounded overflow-hidden flex-shrink-0 cursor-pointer transition-colors ${
                index === currentImageIndex ? 'border-2 border-primary-container' : 'border border-outline-variant'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <DeviceImage
                src={url}
                alt={`${deviceName || 'Device'} thumbnail ${index + 1}`}
                style={{ objectFit: 'cover' }}
                fallbackLabel=""
              />
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={toggleZoom}
          role="dialog"
          aria-modal="true"
          aria-label={`${deviceName} image viewer`}
        >
          <button
            className="absolute top-4 right-4 text-on-surface p-2 hover:text-secondary transition-colors focus:outline-none"
            onClick={toggleZoom}
            aria-label="Close viewer"
          >
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">close</span>
          </button>

          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <DeviceImage
              src={currentImageUrl}
              alt={`${deviceName || 'Device'} zoomed image`}
              style={{ objectFit: 'contain' }}
              className="p-4"
              fallbackLabel="No Picture"
            />
          </div>

          {imageUrls.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface-container-high/60 text-on-surface p-3 rounded-full hover:bg-surface-container-high focus:outline-none transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">chevron_left</span>
              </button>
              <button
                onClick={goToNext}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface-container-high/60 text-on-surface p-3 rounded-full hover:bg-surface-container-high focus:outline-none transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">chevron_right</span>
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="bg-surface-container-lowest/80 text-on-surface inline-block px-4 py-2 rounded font-label-sm text-label-sm tabular-nums">
              {deviceName} - Image {currentImageIndex + 1} of {imageUrls.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceGallery;
