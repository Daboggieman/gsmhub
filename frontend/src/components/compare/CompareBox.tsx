"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faExchangeAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '@/lib/api';
import { Device, SearchResult } from '@shared/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CompareBoxProps {
  initialDevices?: Device[];
}

const CompareBox: React.FC<CompareBoxProps> = ({ initialDevices = [] }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialDevices.length > 0) {
      setSelectedDevices(initialDevices);
    }
  }, [initialDevices]);

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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-2 mb-6 text-blue-600">
        <FontAwesomeIcon icon={faExchangeAlt} className="text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Compare Devices</h2>
      </div>

      <div className="relative mb-8" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a device to add..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <FontAwesomeIcon 
            icon={loading ? faExchangeAlt : faSearch} 
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${loading ? 'animate-spin' : ''}`} 
          />
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result._id}
                className="flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                onClick={() => addDevice(result)}
              >
                <div className="relative w-12 h-12 bg-gray-100 rounded mr-3 flex-shrink-0">
                  {result.imageUrl ? (
                    <Image src={result.imageUrl} alt={result.name || 'Device thumbnail'} fill style={{ objectFit: 'contain' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{result.name}</div>
                  <div className="text-sm text-gray-500">{result.brand}</div>
                </div>
                <FontAwesomeIcon icon={faPlus} className="ml-auto text-blue-400 text-sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((index) => {
          const device = selectedDevices[index];
          return (
            <div 
              key={index} 
              className={`relative h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all ${
                device ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {device ? (
                <>
                  <button 
                    onClick={() => removeDevice(device.slug)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                  <div className="relative w-20 h-24 mb-2">
                    {device.imageUrl ? (
                      <Image src={device.imageUrl} alt={device.name || 'Selected device'} fill style={{ objectFit: 'contain' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-gray-800 text-center line-clamp-2">{device.name}</div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <FontAwesomeIcon icon={faPlus} className="text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-400">Add Device {index + 1}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleCompare}
        disabled={selectedDevices.length < 2}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
          selectedDevices.length >= 2 
            ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-1' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Compare {selectedDevices.length} Devices
      </button>
    </div>
  );
};

export default CompareBox;
