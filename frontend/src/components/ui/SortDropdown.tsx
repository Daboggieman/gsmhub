"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faCheck } from '@fortawesome/free-solid-svg-icons';

const sortOptions = [
  { label: 'Newest First', value: 'latest' },
  { label: 'Popularity', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
  { label: 'Alphabetical', value: 'alphabetical' },
];

const SortDropdown: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get('sort') || 'latest';
  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Sort By';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    // Reset to page 1 when sorting changes
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <FontAwesomeIcon icon={faSort} className="text-gray-400" />
        <span>{currentLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1.5">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  currentSort === option.value
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
                {currentSort === option.value && (
                  <FontAwesomeIcon icon={faCheck} className="text-blue-500 text-xs" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
