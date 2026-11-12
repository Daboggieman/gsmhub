import React from 'react';
import { apiClient } from '@/lib/api';
import DeviceCard from '@/components/devices/DeviceCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';
import SortDropdown from '@/components/ui/SortDropdown';

export const dynamic = 'force-dynamic';

async function getAllDevices(page: number = 1, sort: string = 'latest') {
  try {
    const limit = 24;
    const { devices, total } = await apiClient.getDevices({
      limit,
      page,
      sort
    });
    return { devices, total, limit };
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    return { devices: [], total: 0, limit: 24 };
  }
}

interface DevicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DevicesPage({ searchParams: promiseSearchParams }: DevicesPageProps) {
  const searchParams = await promiseSearchParams;
  const page = Number(searchParams.page) || 1;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'latest';

  const { devices, total, limit } = await getAllDevices(page, sort);
  const totalPages = Math.ceil(total / limit);

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Phones', href: '/devices' },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-space-md lg:px-space-lg py-space-lg">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-space-xs">All Devices</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Browse our complete collection of mobile phones, tablets, and smart devices.
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
            baseUrl="/devices"
            searchParams={searchParams}
          />
        </>
      ) : (
        <div className="text-center py-20 bg-surface-container-low rounded-xl shadow-md md:shadow-none">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-space-md" aria-hidden="true">device_unknown</span>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">No devices found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We couldn&apos;t find any devices at the moment. Please check back later.
          </p>
        </div>
      )}
    </main>
  );
}
