"use client";

import { useEffect, useState, use } from 'react';
import BrandForm from '@/components/admin/BrandForm';
import { apiClient } from '@/lib/api';

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const brands = await apiClient.getAdminBrands();
        const found = brands.find((b: any) => b.id === id);
        setBrand(found);
      } catch (error) {
        console.error('Failed to fetch brand', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [id]);

  if (loading) return <div>Loading brand...</div>;
  if (!brand) return <div>Brand not found</div>;

  return (
    <div className="py-6">
      <BrandForm initialData={brand} isEdit />
    </div>
  );
}
