"use client"; // Mark this as a client component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Import faSpinner
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

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string) => {
  if (!query) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <b key={i} className="text-blue-400">{part}</b>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // For keyboard navigation
  const debouncedQuery = useDebounce(query, 300); // 300ms debounce delay
  const dropdownRef = useRef<HTMLUListElement>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery) {
      setLoading(true); // Set loading to true
      try {
        const searchResults = await apiClient.searchDevices(searchQuery);
        setResults(searchResults);
        setShowDropdown(searchResults.length > 0);
        setHighlightedIndex(-1); // Reset highlighted index
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false); // Set loading to false
      }
    } else {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (results.length > 0 || loading) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding the dropdown to allow click events on results
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prevIndex => (prevIndex + 1) % results.length);
      // Scroll to highlighted item
      dropdownRef.current?.children[highlightedIndex + 1]?.scrollIntoView({
        block: 'nearest',
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prevIndex => (prevIndex - 1 + results.length) % results.length);
      // Scroll to highlighted item
      dropdownRef.current?.children[highlightedIndex - 1]?.scrollIntoView({
        block: 'nearest',
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex !== -1 && results[highlightedIndex]) {
        // Programmatically click the link
        const linkElement = dropdownRef.current?.children[highlightedIndex]?.querySelector('a');
        linkElement?.click();
      }
    }
  }, [showDropdown, results, highlightedIndex]);

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
        onKeyDown={handleKeyDown} // Add keydown handler
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-r-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-white" />
      </button>

      {showDropdown && (
        <ul
          ref={dropdownRef} // Attach ref to dropdown
          className="absolute left-0 right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
        >
          {loading ? ( // Show loading indicator
            <li className="px-4 py-2 text-white flex items-center">
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Loading...
            </li>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <li
                key={result.id}
                className={`border-b border-gray-700 last:border-b-0 ${
                  index === highlightedIndex ? 'bg-blue-600' : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)} // Highlight on hover
                onMouseLeave={() => setHighlightedIndex(-1)} // Remove highlight on leave
              >
                <Link href={`/devices/${result.slug}`} className="block px-4 py-2 hover:bg-gray-700 text-white">
                  {highlightMatch(`${result.name} (${result.brand})`, query)}
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No results found.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
