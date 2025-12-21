import React from 'react';
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import DeviceCard from '@/components/devices/DeviceCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

async function getCategoryData(slug: string) {
  try {
    const category = await apiClient.getCategory(slug);
    if (!category) return null;

    // Use the category ID to fetch devices. 
    // The Category type in shared/types has 'id', but it might be '_id' from the backend.
    const categoryId = (category as any)._id || category.id;
    
    const { devices } = await apiClient.getDevices({ category: categoryId, limit: 100 });
    return { category, devices };
  } catch (error) {
    console.error('Failed to fetch category data:', error);
    return null;
  }
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params: promiseParams }: CategoryPageProps) {
  const params = await promiseParams;
  const data = await getCategoryData(params.category);

  if (!data) {
    notFound();
  }

  const { category, devices } = data;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: category.name, href: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-gray-600 max-w-3xl">{category.description}</p>
          )}
        </div>

        {devices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {devices.map((device) => (
              <DeviceCard key={device._id} device={device} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-700">No devices found in this category</h2>
            <p className="text-gray-500 mt-2">Check back later for new additions.</p>
          </div>
        )}
      </main>
    </div>
  );
}
