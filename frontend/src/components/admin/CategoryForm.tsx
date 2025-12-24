"use client";

import { useState, useEffect } from 'react';
import { Category } from '../../../../shared/src/types';
import { generateSlug } from '../../../../shared/src/utils/slug';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTag, 
  faInfoCircle, 
  faCheckCircle, 
  faTimesCircle,
  faIcons
} from '@fortawesome/free-solid-svg-icons';

interface CategoryFormProps {
  initialData?: Category;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    isActive: true,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAutoSlug, setIsAutoSlug] = useState(!isEdit);

  // Handle auto-slug generation
  useEffect(() => {
    if (isAutoSlug && !isEdit && formData.name) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.name!) }));
    }
  }, [formData.name, isAutoSlug, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    if (name === 'slug') {
      setIsAutoSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Prepare payload
    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      icon: formData.icon,
      isActive: formData.isActive,
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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-2xl">
      <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <FontAwesomeIcon icon={faTag} />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
            {isEdit ? 'Edit Category' : 'Create New Category'}
          </h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Organize your devices efficiently</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 p-4 text-red-700 rounded-xl border border-red-100">
            <FontAwesomeIcon icon={faTimesCircle} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Category Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Smartphones"
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug || ''}
                onChange={handleChange}
                className="w-full rounded-xl bg-gray-50 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm border p-3 text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Icon Name / URL</label>
              <div className="relative">
                <input
                  type="text"
                  name="icon"
                  value={formData.icon || ''}
                  onChange={handleChange}
                  placeholder="e.g. mobile-alt"
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 pl-10 text-gray-900"
                />
                <FontAwesomeIcon icon={faIcons} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-black text-gray-700 uppercase tracking-widest">Active Status</label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="What kind of devices belong here?"
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium border p-3 text-gray-700"
          />
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 rounded-2xl text-sm font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-12 py-4 rounded-2xl shadow-xl font-black text-white uppercase tracking-widest transition-all transform hover:-translate-y-1 ${
              isSubmitting ? 'bg-gray-400 scale-95 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200'
            }`}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
