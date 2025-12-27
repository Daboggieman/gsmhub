"use client";

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { SearchResult } from '../../../../shared/src/types';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMobileAlt, faTags, faIndustry, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function AdminGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
          className="w-full bg-gray-100 border-none rounded-2xl py-2 pl-10 pr-10 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-2 border-b border-gray-50 bg-gray-50/50">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Quick Results</span>
          </div>
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {results.length > 0 ? results.map((result) => (
              <button
                key={result._id}
                onClick={() => handleResultClick(result)}
                className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 transition-colors text-left group border-b border-gray-50 last:border-0"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 p-1">
                  {result.imageUrl ? (
                    <img src={result.imageUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FontAwesomeIcon icon={faMobileAlt} className="text-xs" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{result.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{result.brand} • {result.category}</p>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs text-indigo-200 group-hover:text-indigo-500 transition-colors" />
              </button>
            )) : (
              <div className="p-8 text-center text-gray-400 font-bold text-sm">
                No matching devices found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
