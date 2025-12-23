"use client";

import { useState } from 'react';
import { Category } from '../../../../shared/src/types';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CategoryFormProps {
  initialData?: Category;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Only send allowed fields to prevent "property id should not exist" etc errors
    const payload = {
      name: formData.name,
      slug: formData.slug,
    };

    try {
      if (isEdit && initialData?.id) {
        await apiClient.updateCategory(initialData.id, payload);
      } else {
        await apiClient.createCategory(payload);
      }
      router.push('/admin/categories');
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {error && <div className="bg-red-50 p-4 text-red-700 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          name="slug"
          required
          value={formData.slug || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}
