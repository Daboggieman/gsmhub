"use client"; // Mark this as a client component

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '@/lib/api'; // Import the apiClient
import { SearchResult } from '../../../../../shared/src/types'; // Import the SearchResult type
import Link from 'next/link'; // Import Link for navigation

// A simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300); // 300ms debounce delay

  useEffect(() => {
    if (debouncedQuery) {
      const fetchResults = async () => {
        try {
          const searchResults = await apiClient.searchDevices(debouncedQuery);
          setResults(searchResults);
          setShowDropdown(searchResults.length > 0);
        } catch (error) {
          console.error('Failed to fetch search results:', error);
          setResults([]);
          setShowDropdown(false);
        }
      };
      fetchResults();
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding the dropdown to allow click events on results
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  return (
    <div className="relative flex items-center w-64">
      <input
        type="text"
        placeholder="Search for devices..."
        className="w-full px-4 py-2 rounded-l-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-r-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-white" />
      </button>

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li key={result.id} className="border-b border-gray-700 last:border-b-0">
              <Link href={`/devices/${result.slug}`} className="block px-4 py-2 hover:bg-gray-700 text-white">
                {result.name} ({result.brand})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
