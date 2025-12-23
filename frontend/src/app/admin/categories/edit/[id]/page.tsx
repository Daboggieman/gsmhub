"use client";

import { useEffect, useState, use } from 'react';
import CategoryForm from '@/components/admin/CategoryForm';
import { apiClient } from '@/lib/api';
import { Category } from '../../../../../../../shared/src/types';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await apiClient.getCategoryById(id);
        setCategory(data);
      } catch (error) {
        console.error('Failed to fetch category', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Category</h2>
      <CategoryForm initialData={category} isEdit />
    </div>
  );
}
