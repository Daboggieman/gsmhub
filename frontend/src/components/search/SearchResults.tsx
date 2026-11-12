"use client";

import React from 'react';
import { Device } from '@shared/types';
import DeviceCard from '../devices/DeviceCard';
import Link from 'next/link';

interface SearchResultsProps {
  results: Device[];
  query: string;
  loading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, query, loading }) => {
  const POPULAR_SEARCHES = ['iPhone 15', 'Samsung S24', 'Pixel 8', 'Redmi Note 13', 'OnePlus 12'];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 bg-surface-container-low rounded-xl shadow-md md:shadow-none">
        <span className="material-symbols-outlined text-[48px] text-secondary animate-spin mb-4" aria-hidden="true">
          progress_activity
        </span>
        <p className="font-body-md text-body-md text-on-surface-variant">Searching for devices...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px] text-outline-variant" aria-hidden="true">search_off</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
            {query ? `No results found for "${query}"` : 'Start searching'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-8">
            {query
              ? "We couldn't find any devices matching your search. Try different keywords or browse our categories."
              : "Use the search bar above to find your favorite smartphones, tablets, and more."}
          </p>

          <div className="space-y-4">
            <h3 className="font-label-sm text-label-sm font-bold text-outline uppercase tracking-wider">Popular Searches</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map(s => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-secondary rounded font-body-sm text-body-sm font-medium transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container p-space-lg border-t border-outline-variant flex items-start gap-space-md">
          <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5 shrink-0" aria-hidden="true">info</span>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            <p className="font-bold text-on-surface mb-1">Search Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spelling</li>
              <li>Try more general keywords (e.g., &quot;iPhone&quot; instead of &quot;iPhone 15 Pro Max&quot;)</li>
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
