"use client";

import React from 'react';
import { Device } from '@shared/types';
import DeviceCard from '../devices/DeviceCard';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface SearchResultsProps {
  results: Device[];
  query: string;
  loading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, query, loading }) => {
  const POPULAR_SEARCHES = ['iPhone 15', 'Samsung S24', 'Pixel 8', 'Redmi Note 13', 'OnePlus 12'];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Searching for devices...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faSearch} className="text-gray-300 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {query ? `No results found for "${query}"` : 'Start searching'}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {query 
              ? "We couldn't find any devices matching your search. Try different keywords or browse our categories."
              : "Use the search bar above to find your favorite smartphones, tablets, and more."}
          </p>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Popular Searches</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map(s => (
                <Link 
                  key={s} 
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-full text-sm font-medium transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-6 border-t border-blue-100 flex items-start gap-4">
          <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mt-1" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Search Tips:</p>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>Check your spelling</li>
              <li>Try more general keywords (e.g., "iPhone" instead of "iPhone 15 Pro Max")</li>
              <li>Filter by brand or category on the left sidebar</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.map((device) => (
        <DeviceCard key={device._id} device={device} />
      ))}
    </div>
  );
};

export default SearchResults;
