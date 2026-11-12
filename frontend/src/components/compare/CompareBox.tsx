"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { Device, SearchResult } from '@shared/types';
import DeviceImage from '../devices/DeviceImage';
import { useRouter } from 'next/navigation';

interface CompareBoxProps {
  initialDevices?: Device[];
  /** Number of device slugs in the URL — when it drops below 2, stale boxes are cleared. */
  urlSlugCount?: number;
}

const CompareBox: React.FC<CompareBoxProps> = ({ initialDevices = [], urlSlugCount = 0 }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hydrate/refresh the boxes from URL-driven comparison data.
    // Deferred via a local step so the effect body itself performs no
    // synchronous state updates.
    const syncFromUrl = () => {
      if (initialDevices.length >= 2) {
        setSelectedDevices(initialDevices);
      }
    };
    syncFromUrl();
  }, [initialDevices]);

  // The URL is the source of truth: if it no longer holds a comparison
  // (0-1 slugs), drop any devices still sitting in the boxes — adjusted
  // during render (documented prop-change pattern).
  const [prevSlugCount, setPrevSlugCount] = useState(urlSlugCount);
  if (prevSlugCount !== urlSlugCount) {
    setPrevSlugCount(urlSlugCount);
    if (urlSlugCount < 2) {
      setSelectedDevices([]);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 1) {
      setLoading(true);
      try {
        const searchResults = await apiClient.searchDevices(val);
        setResults(searchResults);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const addDevice = async (result: SearchResult) => {
    if (selectedDevices.length >= 3) {
      alert('You can compare up to 3 devices at a time.');
      return;
    }
    if (selectedDevices.some(d => d.slug === result.slug)) {
      alert('This device is already selected.');
      return;
    }

    try {
      const device = await apiClient.getDevice(result.slug);
      setSelectedDevices([...selectedDevices, device]);
      setQuery('');
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to fetch device details:', error);
    }
  };

  const removeDevice = (slug: string) => {
    setSelectedDevices(selectedDevices.filter(d => d.slug !== slug));
  };

  const handleCompare = () => {
    if (selectedDevices.length < 2) {
      alert('Please select at least 2 devices to compare.');
      return;
    }
    const slugs = selectedDevices.map(d => d.slug).join(',');
    router.push(`/compare?devices=${slugs}`);
  };

  return (
    <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none p-space-md md:p-space-lg">
      <div className="flex items-center gap-space-md mb-space-lg">
        <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px] text-on-primary-container" aria-hidden="true">compare_arrows</span>
        </div>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Compare Devices</h2>
      </div>

      <div className="relative mb-space-lg" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a device to add..."
            aria-label="Search for a device to add"
            className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder-outline outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <span
            className={`material-symbols-outlined text-[20px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${loading ? 'text-secondary animate-spin' : 'text-outline'
              }`}
            aria-hidden="true"
          >
            {loading ? 'progress_activity' : 'search'}
          </span>
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-h-80 overflow-y-auto p-1.5">
            {results.map((result) => (
              <div
                key={result._id}
                className="flex items-center p-space-sm hover:bg-surface-container cursor-pointer rounded-lg transition-colors"
                onClick={() => addDevice(result)}
              >
                <div className="relative w-12 h-12 bg-surface-container rounded mr-space-md flex-shrink-0 overflow-hidden">
                  {result.imageUrl ? (
                    <DeviceImage src={result.imageUrl} alt={result.name || 'Device thumbnail'} style={{ objectFit: 'contain' }} fallbackLabel="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline-variant">
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">image</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-label-md text-label-md font-bold text-on-surface truncate">{result.name}</div>
                  <div className="font-label-xs text-label-xs text-outline uppercase tracking-wider">{result.brand}</div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-secondary ml-auto shrink-0" aria-hidden="true">add</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
        {[0, 1, 2].map((index) => {
          const device = selectedDevices[index];
          return (
            <div
              key={index}
              className={`relative h-48 rounded-xl border border-dashed flex flex-col items-center justify-center p-space-md transition-colors ${device ? 'border-primary-container/40 bg-surface-container' : 'border-outline-variant bg-surface-container-lowest/60'
                }`}
            >
              {device ? (
                <>
                  <button
                    onClick={() => removeDevice(device.slug)}
                    aria-label={`Remove ${device.name} from comparison`}
                    className="absolute top-2 right-2 w-7 h-7 bg-error-container text-on-error-container hover:brightness-110 rounded-full flex items-center justify-center transition-all active:scale-[0.95]"
                  >
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">close</span>
                  </button>
                  <div className="relative w-20 h-24 mb-2 bg-surface-container-low rounded flex items-center justify-center p-1">
                    {device.imageUrl ? (
                      <DeviceImage src={device.imageUrl} alt={device.name || 'Selected device'} style={{ objectFit: 'contain' }} />
                    ) : (
                      <span className="material-symbols-outlined text-[32px] text-outline-variant" aria-hidden="true">mobile_off</span>
                    )}
                  </div>
                  <div className="font-label-sm text-label-sm font-bold text-on-surface text-center line-clamp-2">{device.name}</div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[24px] text-outline-variant" aria-hidden="true">add</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-outline">Add Device {index + 1}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleCompare}
        disabled={selectedDevices.length < 2}
        className={`w-full py-3.5 rounded-lg font-label-md text-label-md font-bold tracking-wide flex items-center justify-center gap-space-sm transition-all active:scale-[0.98] disabled:active:scale-100 ${selectedDevices.length >= 2
            ? 'bg-primary-container hover:bg-inverse-primary text-on-primary-container shadow-md'
            : 'bg-surface-container text-outline cursor-not-allowed'
          }`}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">compare_arrows</span>
        Compare {selectedDevices.length} Devices
      </button>
    </div>
  );
};

export default CompareBox;
