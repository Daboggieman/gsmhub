"use client";

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { SearchResult } from '@shared/types';
import { useRouter } from 'next/navigation';

export default function AdminGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await apiClient.searchDevices(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/admin/devices/edit/${result._id}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Jump to device..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface-container py-2 pl-10 pr-10 font-label-md text-on-surface placeholder-outline transition-colors focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline" aria-hidden="true">search</span>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
          <div className="border-b border-outline-variant/50 bg-surface-container-low/50 p-2">
            <span className="px-2 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Quick Results</span>
          </div>
          <div className="no-scrollbar max-h-80 overflow-y-auto">
            {results.length > 0 ? results.map((result) => (
              <button
                key={result._id}
                onClick={() => handleResultClick(result)}
                className="group flex w-full items-center gap-space-md border-b border-outline-variant/30 p-space-md text-left transition-colors last:border-0 hover:bg-surface-container"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-surface-container p-1">
                  {result.imageUrl ? (
                    <img src={result.imageUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">smartphone</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-label-md font-bold text-on-surface">{result.name}</p>
                  <p className="font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">{result.brand} • {result.category}</p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline transition-colors group-hover:text-secondary" aria-hidden="true">arrow_forward</span>
              </button>
            )) : (
              <div className="p-space-xl text-center font-label-sm font-bold text-outline">
                No matching devices found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
