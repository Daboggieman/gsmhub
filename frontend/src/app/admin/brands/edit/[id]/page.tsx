"use client";

import { useEffect, useState, use } from 'react';
import BrandForm from '@/components/admin/BrandForm';
import { apiClient, AdminBrand } from '@/lib/api';

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [brand, setBrand] = useState<AdminBrand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const brands = await apiClient.getAdminBrands();
        const found = brands.find((b) => b.id === id);
        setBrand(found ?? null);
      } catch (error) {
        console.error('Failed to fetch brand', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-48 items-center justify-center gap-space-md font-label-md font-bold text-outline">
        <span className="material-symbols-outlined progress_activity animate-spin text-[24px] text-secondary" aria-hidden="true"></span>
        Loading brand...
      </div>
    );
  if (!brand)
    return (
      <div className="rounded-xl border border-error-container/40 bg-error-container/15 p-space-lg font-label-md font-bold text-error">
        Brand not found
      </div>
    );

  return (
    <div>
      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          Edit Brand
        </h1>
        <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
          Update manufacturer profile
        </p>
      </div>
      <BrandForm initialData={brand} isEdit />
    </div>
  );
}
