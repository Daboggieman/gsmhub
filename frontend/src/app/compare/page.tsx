"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Device } from '@shared/types';
import ComparisonTable from '@/components/compare/ComparisonTable';
import CompareBox from '@/components/compare/CompareBox';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const ComparePageContent = () => {
  const searchParams = useSearchParams();
  const devicesQuery = searchParams.get('devices') || '';
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      const slugs = devicesQuery.split(',').filter(s => s.length > 0);
      if (slugs.length > 0) {
        setLoading(true);
        try {
          const fetchedDevices = await Promise.all(
            slugs.map(slug => apiClient.getDevice(slug))
          );
          setDevices(fetchedDevices);
        } catch (error) {
          console.error('Failed to fetch devices for comparison:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setDevices([]);
      }
    };

    fetchDevices();
  }, [devicesQuery]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Compare', href: '/compare' },
    { label: devices.length > 0 ? devices.map(d => d.name).join(' vs ') : 'Select Devices', href: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-12">
          <CompareBox />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : devices.length > 0 ? (
          <div className="mt-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">
              Comparison: {devices.map(d => d.name).join(' vs ')}
            </h1>
            <ComparisonTable devices={devices} />
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700">No devices selected for comparison</h2>
            <p className="text-gray-500 mt-2">Use the search box above to add devices and compare them side-by-side.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const ComparePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComparePageContent />
    </Suspense>
  );
};

export default ComparePage;
