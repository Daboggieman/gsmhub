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
    { label: 'Home', href: '/' },
    { label: 'Phones', href: '/devices' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">All Devices</h1>
            <p className="text-gray-600 max-w-2xl">
              Browse our complete collection of mobile phones, tablets, and smart devices.
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
              baseUrl="/devices"
              searchParams={searchParams}
            />
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No devices found</h2>
            <p className="text-gray-500">
              We couldn't find any devices at the moment. Please check back later.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
