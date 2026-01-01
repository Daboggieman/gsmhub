"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Device, Category } from '../../../../shared/src/types';
import SearchResults from '@/components/search/SearchResults';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountDown, faTimes } from '@fortawesome/free-solid-svg-icons';

const SearchPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const brand = searchParams.get('brand') || '';
  const categoryParam = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = Number(searchParams.get('page')) || 1;
  const limit = 24;

  const [results, setResults] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await apiClient.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Use getDevices for general search/filter
        const data = await apiClient.getDevices({
          search: query,
          brand: brand,
          category: categoryParam,
          sort: sort,
          page: page,
          limit: limit,
        });
        setResults(data.devices);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, brand, categoryParam, sort, page]);

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 on filter change
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/search');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: query || brand || 'All Devices', href: '#' },
  ];

  const POPULAR_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'Google', 'OnePlus', 'Oppo', 'Vivo', 'Realme'];
  const totalPages = Math.ceil(total / limit);

  // Convert searchParams to object for Pagination component
  const searchParamsObj = Object.fromEntries(searchParams.entries());

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <FontAwesomeIcon icon={faFilter} className="mr-2 text-blue-500" />
                  Filters
                </h2>
                {(query || brand || categoryParam) && (
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-red-500 font-bold hover:underline flex items-center"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> Clear
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Brand</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {POPULAR_BRANDS.map(b => (
                    <label key={b} className="flex items-center group cursor-pointer">
                      <input 
                        type="radio" 
                        name="brand" 
                        checked={brand === b}
                        onChange={() => updateFilters({ brand: b })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                        {b}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Category</h3>
                <select 
                  value={categoryParam}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.slug} value={(cat as any)._id || cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sort By</h3>
                <div className="relative">
                  <select 
                    value={sort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="latest">Latest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                  <FontAwesomeIcon icon={faSortAmountDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {query ? `Results for "${query}"` : brand || 'All Devices'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{total} devices found</p>
              </div>
            </div>

            <SearchResults results={results} query={query} loading={loading} />
            
            {!loading && total > 0 && (
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                baseUrl="/search"
                searchParams={searchParamsObj}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
};

export default SearchPage;
