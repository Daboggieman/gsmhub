"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DeviceImage from '../devices/DeviceImage';
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
    // Load search history from localStorage — deferred via a local step
    // so the effect body itself performs no synchronous state updates
    // (and the read stays post-hydration, avoiding a hydration mismatch).
    const loadHistory = () => {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch {
          setHistory([]);
        }
      }
    };
    loadHistory();

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
    // Escape metacharacters so typing e.g. "(" doesn't throw inside RegExp
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-tertiary-container text-on-tertiary-container px-0.5 rounded">
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
          placeholder="Search phones, specs..."
          aria-label="Search devices"
          className="w-full h-9 bg-surface-container text-on-surface placeholder-outline pl-9 pr-8 rounded-lg border border-transparent focus:outline-none focus:bg-surface-container-high focus:ring-1 focus:ring-primary focus:border-transparent transition-colors text-body-sm"
        />
        <span
          className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant group-focus-within:text-secondary transition-colors pointer-events-none"
          aria-hidden="true"
        >
          search
        </span>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant animate-spin" aria-hidden="true">
              progress_activity
            </span>
          )}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="p-0.5 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
            </button>
          )}
        </div>
      </form>

      {/* Dropdown Container */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant overflow-hidden z-[200]">
          {/* History Section (When query is empty) */}
          {query.trim().length === 0 && history.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="font-label-xs text-label-xs text-outline uppercase tracking-wider">Recent Searches</h3>
                <button
                  onClick={clearHistory}
                  className="font-label-xs text-label-xs text-error hover:text-on-error-container uppercase transition-colors"
                >
                  Clear All
                </button>
              </div>
              {history.map((term, i) => (
                <div
                  key={i}
                  onClick={() => handleHistoryItemClick(term)}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-surface-container rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-secondary transition-colors" aria-hidden="true">
                      history
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface capitalize truncate">{term}</span>
                  </div>
                  <button
                    onClick={(e) => removeFromHistory(e, term)}
                    aria-label={`Remove ${term} from history`}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Results Section */}
          {query.trim().length >= 2 && results.length > 0 && (
            <>
              <div className="p-2">
                <h3 className="font-label-xs text-label-xs text-outline uppercase tracking-wider px-3 py-2">
                  Suggested Devices
                </h3>
                {results.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => handleResultClick(result.slug, result.name)}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-surface-container rounded-lg transition-colors group text-left"
                  >
                    <div className="w-10 h-10 relative flex-shrink-0 bg-surface-container rounded-lg overflow-hidden">
                      {result.imageUrl ? (
                        <DeviceImage
                          src={result.imageUrl}
                          alt={result.name || 'Device image'}
                          className="object-contain p-1"
                          fallbackLabel=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">search</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-body-md text-body-md text-on-surface truncate">
                        <span className="sr-only">{result.name}</span>
                        <span aria-hidden="true">{highlightMatch(result.name, query)}</span>
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
                        <span className="bg-surface-container px-1.5 py-0.5 rounded font-label-xs text-label-xs uppercase text-on-surface-variant">
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
                className="bg-surface-container p-3 text-center border-t border-outline-variant hover:bg-surface-container-high cursor-pointer transition-colors"
              >
                <span className="font-body-sm text-body-sm text-secondary">
                  View all results for &quot;{query}&quot;
                </span>
              </div>
            </>
          )}

          {/* No results */}
          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant mb-2 block" aria-hidden="true">
                search_off
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                No devices found for &quot;{query}&quot;
              </p>
              <p className="font-body-sm text-body-sm text-outline mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
