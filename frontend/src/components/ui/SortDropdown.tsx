"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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
        className="h-9 px-space-md flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">sort</span>
        <span>{currentLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant z-50 p-1.5">
          <div className="p-0.5">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 font-body-md text-body-md rounded-lg transition-colors ${
                  currentSort === option.value
                    ? 'bg-primary-container/15 text-primary font-semibold'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                {option.label}
                {currentSort === option.value && (
                  <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">check</span>
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
