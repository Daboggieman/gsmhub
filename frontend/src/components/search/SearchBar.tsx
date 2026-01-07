"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faSpinner, faHistory, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '../../lib/api';
import { SearchResult } from '@shared/types';

const SEARCH_HISTORY_KEY = 'gsmhub_recent_searches';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory([]);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const searchResults = await apiClient.searchDevices(query);
          setResults(searchResults.slice(0, 8)); // Limit to 8 results for the dropdown
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const saveToHistory = (searchTerm: string) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const removeFromHistory = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== term);
    setHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleResultClick = (slug: string, name: string) => {
    saveToHistory(name);
    router.push(`/devices/${slug}`);
    setShowDropdown(false);
    setQuery('');
  };

  const handleHistoryItemClick = (term: string) => {
    setQuery(term);
    saveToHistory(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setShowDropdown(false);
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for phones, tablets..."
          className="w-full bg-white/10 text-white placeholder-white/60 pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 transition-all shadow-inner"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-blue-500 transition-colors">
          <FontAwesomeIcon icon={faSearch} />
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white/50 group-focus-within:text-blue-500" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white group-focus-within:text-gray-400 group-focus-within:hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown Container */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* History Section (When query is empty) */}
          {query.trim().length === 0 && history.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent Searches</h3>
                <button onClick={clearHistory} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase transition-colors">Clear All</button>
              </div>
              {history.map((term, i) => (
                <div
                  key={i}
                  onClick={() => handleHistoryItemClick(term)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faHistory} className="text-gray-300 group-hover:text-blue-500 text-xs" />
                    <span className="text-sm font-bold text-gray-700 capitalize">{term}</span>
                  </div>
                  <button 
                    onClick={(e) => removeFromHistory(e, term)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FontAwesomeIcon icon={faTimes} size="xs" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Results Section */}
          {query.trim().length >= 2 && results.length > 0 && (
            <>
              <div className="p-2">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Suggested Devices</h3>
                {results.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => handleResultClick(result.slug, result.name)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-blue-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="w-12 h-12 relative flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-colors">
                      {result.imageUrl ? (
                        <Image
                          src={result.imageUrl}
                          alt={result.name || 'Device image'}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FontAwesomeIcon icon={faSearch} size="sm" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {highlightMatch(result.name, query)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {result.brand}
                        </span>
                        {result.category && (
                          <span className="truncate">{result.category}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div 
                onClick={handleSearch}
                className="bg-gray-50 p-3 text-center border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <span className="text-sm font-bold text-blue-600">
                  View all results for "{query}"
                </span>
              </div>
            </>
          )}

          {/* No results */}
          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2 text-2xl">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <p className="text-gray-500 font-medium">No devices found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
