import React from 'react';
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import DeviceCard from '@/components/devices/DeviceCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';
import SortDropdown from '@/components/ui/SortDropdown';

async function getBrandData(brand: string, page: number = 1, sort: string = 'latest') {
  try {
    const limit = 24;
    const { devices, total } = await apiClient.getDevices({ 
      brand, 
      limit,
      page,
      sort
    });
    
    // Check if the brand actually exists by checking if we got any results 
    // or if the brand is in the list of brands (simplified check)
    if (total === 0 && page === 1) {
       // Optional: verify brand name exists in DB
    }

    return { devices, total, limit, page };
  } catch (error) {
    console.error('Failed to fetch brand data:', error);
    return null;
  }
}

interface BrandPageProps {
  params: Promise<{
    brand: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrandPage({ params: promiseParams, searchParams: promiseSearchParams }: BrandPageProps) {
  const params = await promiseParams;
  const searchParams = await promiseSearchParams;
  
  const decodedBrand = decodeURIComponent(params.brand);
  const page = Number(searchParams.page) || 1;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'latest';

  const data = await getBrandData(decodedBrand, page, sort);

  if (!data) {
    notFound();
  }

  const { devices, total, limit } = data;
  const totalPages = Math.ceil(total / limit);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brands' },
    { label: decodedBrand, href: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{decodedBrand} Devices</h1>
            <p className="text-gray-600 max-w-2xl">
              Explore the latest and most popular devices from {decodedBrand}.
            </p>
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
              baseUrl={`/brands/${params.brand}`}
              searchParams={searchParams}
            />
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No devices found</h2>
            <p className="text-gray-500">
              We couldn't find any devices for {decodedBrand} matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
