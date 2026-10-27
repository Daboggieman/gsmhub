"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Device } from '@shared/types';
import ComparisonTable from '@/components/compare/ComparisonTable';
import CompareBox from '@/components/compare/CompareBox';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdUnit from '@/components/ads/AdUnit';

const ComparePageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const devicesQuery = searchParams.get('devices') || '';
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      const slugs = devicesQuery.split(',').filter(s => s.length > 0);
      if (slugs.length >= 2) {
        setLoading(true);
        setError(null);
        try {
          const data = await apiClient.compareDevices(slugs);
          setComparisonData(data);
        } catch (error: any) {
          console.error('Failed to fetch comparison data:', error);
          setComparisonData(null);
          setError(error.message || 'Failed to load comparison. One of the devices may not exist.');
        } finally {
          setLoading(false);
        }
      } else {
        // 0 or 1 device in the URL: nothing to compare yet
        setComparisonData(null);
        setError(null);
      }
    };

    fetchComparison();
  }, [devicesQuery]);

  const devices = comparisonData?.devices || [];
  const urlSlugCount = devicesQuery.split(',').filter(s => s.length > 0).length;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: devices.length > 0 ? devices.map((d: any) => d.name).join(' vs ') : 'Select Devices', href: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mb-12">
          <CompareBox initialDevices={devices} urlSlugCount={urlSlugCount} />
        </div>

        {error && (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-black text-red-600 mb-3">{error}</p>
            <button
              onClick={() => router.push('/compare')}
              className="text-xs font-black uppercase tracking-widest text-red-500 hover:underline"
            >
              Clear comparison
            </button>
          </div>
        )}

        <AdUnit slot="compare-top" format="horizontal" className="mb-8" />

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Analyzing differences...</p>
          </div>
        ) : comparisonData ? (
          <div className="mt-8">
            <h1 className="text-3xl font-black mb-8 text-gray-900 tracking-tight">
              Comparison: <span className="text-blue-600">{devices.map((d: any) => d.name).join(' vs ')}</span>
            </h1>
            <ComparisonTable comparisonData={comparisonData} />
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No devices selected for comparison</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Add at least 2 devices to see a detailed side-by-side comparison with difference highlighting.
            </p>
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