import React from 'react';
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import DeviceCard from '@/components/devices/DeviceCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';
import SortDropdown from '@/components/ui/SortDropdown';
import AdUnit from '@/components/ads/AdUnit';

async function getCategoryData(slug: string, page: number = 1, sort: string = 'latest') {
  try {
    const category = await apiClient.getCategory(slug);
    if (!category) return null;

    // Use the category ID to fetch devices.
    const categoryId = (category as any)._id || category.id;
    const limit = 24;

    const { devices, total } = await apiClient.getDevices({
      category: categoryId,
      limit,
      page,
      sort
    });
    return { category, devices, total, limit, page };
  } catch (error) {
    console.error('Failed to fetch category data:', error);
    return null;
  }
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params: promiseParams, searchParams: promiseSearchParams }: CategoryPageProps) {
  const params = await promiseParams;
  const searchParams = await promiseSearchParams;

  const page = Number(searchParams.page) || 1;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'latest';

  const data = await getCategoryData(params.category, page, sort);

  if (!data) {
    notFound();
  }

  const { category, devices, total, limit } = data;
  const totalPages = Math.ceil(total / limit);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: category.name, href: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 max-w-2xl">{category.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Showing {devices.length} of {total} devices
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SortDropdown />
          </div>
        </div>

        {devices.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {devices.map((device) => (
                <DeviceCard key={device._id} device={device} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl={`/categories/${params.category}`}
              searchParams={searchParams}
            />
            <AdUnit slot="category-list-bottom" format="horizontal" className="mt-8" />
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No devices found</h2>
            <p className="text-gray-500">
              We couldn't find any devices in this category matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
