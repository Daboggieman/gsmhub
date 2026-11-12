"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, DetailedComparison } from '@/lib/api';
import ComparisonTable from '@/components/compare/ComparisonTable';
import CompareBox from '@/components/compare/CompareBox';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdUnit from '@/components/ads/AdUnit';

const ComparePageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const devicesQuery = searchParams.get('devices') || '';
  const [comparisonData, setComparisonData] = useState<DetailedComparison | null>(null);
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
        } catch (error: unknown) {
          console.error('Failed to fetch comparison data:', error);
          setComparisonData(null);
          setError(error instanceof Error ? error.message : 'Failed to load comparison. One of the devices may not exist.');
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
    { name: devices.length > 0 ? devices.map((d) => d.name).join(' vs ') : 'Select Devices', href: '#' },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-space-md lg:px-space-lg py-space-lg">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-space-xl">
        <CompareBox initialDevices={devices} urlSlugCount={urlSlugCount} />
      </div>

      {error && (
        <div className="mb-space-lg rounded-xl border border-error-container bg-error-container/15 p-space-md text-center">
          <p className="font-label-md font-bold text-error mb-space-md">{error}</p>
          <button
            onClick={() => router.push('/compare')}
            className="font-label-xs font-bold uppercase tracking-widest text-error hover:underline"
          >
            Clear comparison
          </button>
        </div>
      )}

      <AdUnit slot="compare-top" format="horizontal" className="mb-space-lg" />

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 bg-surface-container-low rounded-xl shadow-md md:shadow-none">
          <span className="material-symbols-outlined text-[48px] text-secondary animate-spin mb-space-md" aria-hidden="true">progress_activity</span>
          <p className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-on-surface-variant">Analyzing differences...</p>
        </div>
      ) : comparisonData ? (
        <div className="mt-space-lg">
          <h1 className="font-headline-lg text-headline-lg font-bold mb-space-lg text-on-surface tracking-tight">
            Comparison: <span className="text-secondary-container">{devices.map((d) => d.name).join(' vs ')}</span>
          </h1>
          <ComparisonTable comparisonData={comparisonData} />
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-space-lg">
            <span className="material-symbols-outlined text-[40px] text-outline-variant" aria-hidden="true">compare_arrows</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">No devices selected for comparison</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
            Add at least 2 devices to see a detailed side-by-side comparison with difference highlighting.
          </p>
        </div>
      )}
    </main>
  );
};

const ComparePage = () => {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-[48px] text-secondary animate-spin" aria-hidden="true">progress_activity</span>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
};

export default ComparePage;