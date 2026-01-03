
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
import AdvancedFilter from '@/components/search/AdvancedFilter';

const SearchPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q') || '';
  const brand = searchParams.get('brand') || '';
  const categoryParam = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = Number(searchParams.get('page')) || 1;
  const limit = 24;

  // Additional Advanced Filters
  const minPrice = Number(searchParams.get('minPrice')) || undefined;
  const maxPrice = Number(searchParams.get('maxPrice')) || undefined;
  const minRam = Number(searchParams.get('minRam')) || undefined;
  const maxRam = Number(searchParams.get('maxRam')) || undefined;
  const minStorage = Number(searchParams.get('minStorage')) || undefined;
  const maxStorage = Number(searchParams.get('maxStorage')) || undefined;
  const minBattery = Number(searchParams.get('minBattery')) || undefined;
  const maxBattery = Number(searchParams.get('maxBattery')) || undefined;
  const minDisplay = Number(searchParams.get('minDisplay')) || undefined;
  const maxDisplay = Number(searchParams.get('maxDisplay')) || undefined;

  const [results, setResults] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const [cats, brandList] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getBrands()
        ]);
        setCategories(cats);
        setBrands(brandList);
      } catch (err) {
        console.error('Failed to load initial data');
      }
    };
    loadInitData();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getDevices({
          search: query,
          brand: brand,
          category: categoryParam,
          sort: sort,
          page: page,
          limit: limit,
          minPrice, maxPrice,
          minRam, maxRam,
          minStorage, maxStorage,
          minBattery, maxBattery,
          minDisplay, maxDisplay,
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
  }, [
    query, brand, categoryParam, sort, page,
    minPrice, maxPrice, minRam, maxRam, minStorage, maxStorage, minBattery, maxBattery, minDisplay, maxDisplay
  ]);

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
  ].map(item => ({ ...item, name: item.label })); // Adapt to BreadcrumbItem type

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
            <AdvancedFilter
              filters={{
                brand, category: categoryParam,
                minPrice, maxPrice,
                minRam, maxRam,
                minStorage, maxStorage,
                minBattery, maxBattery,
                minDisplay, maxDisplay
              }}
              categories={categories}
              availableBrands={brands}
              onUpdate={updateFilters}
              onClear={clearFilters}
            />
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
