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
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-space-md lg:px-space-lg py-space-lg">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-space-xs">{decodedBrand} Devices</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Explore the latest and most popular devices from {decodedBrand}.
          </p>
          <p className="font-label-sm text-label-sm text-outline mt-space-sm font-medium tabular-nums">
            Showing {devices.length} of {total.toLocaleString()} devices
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <SortDropdown />
        </div>
      </div>

      {devices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-lg">
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
        <div className="text-center py-20 bg-surface-container-low rounded-xl shadow-md md:shadow-none">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-space-md" aria-hidden="true">apps</span>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">No devices found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We couldn&apos;t find any devices for {decodedBrand} matching your criteria.
          </p>
        </div>
      )}
    </main>
  );
}
