"use client";

import { useState, useEffect } from 'react';
import { generateSlug } from '../../../../shared/src/utils/slug';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndustry, faImage, faTimesCircle, faCheckCircle, faEye } from '@fortawesome/free-solid-svg-icons';

interface BrandFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function BrandForm({ initialData, isEdit = false }: BrandFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    isFeatured: true,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAutoSlug, setIsAutoSlug] = useState(!isEdit);

  useEffect(() => {
    if (isAutoSlug && !isEdit && formData.name) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.name) }));
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

    try {
      if (isEdit && initialData?.id) {
        await apiClient.updateBrand(initialData.id, formData);
      } else {
        await apiClient.createBrand(formData);
      }
      router.push('/admin/brands');
    } catch (err: any) {
      setError(err.message || 'Failed to save brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 max-w-2xl">
      <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 text-xl">
          <FontAwesomeIcon icon={faIndustry} />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
            {isEdit ? 'Edit Brand' : 'Register New Brand'}
          </h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Manage manufacturer profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 p-4 text-red-700 rounded-2xl border border-red-100 font-bold animate-shake">
            <FontAwesomeIcon icon={faTimesCircle} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Brand Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Apple"
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-black border p-3 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">URL Slug</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full rounded-xl bg-gray-50 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-xs border p-3 text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Status</label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-6 h-6 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="text-xs font-black text-gray-700 uppercase tracking-widest cursor-pointer">Featured Brand</label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Logo URL</label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-bold border p-3 text-gray-900"
              />
            </div>
            {formData.logoUrl && (
              <div className="relative group rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-6 aspect-video max-w-sm">
                <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain drop-shadow-lg" />
                <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <FontAwesomeIcon icon={faEye} className="text-white text-2xl" />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Description</label>
            <textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Short bio about the brand..."
              className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium border p-3 text-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-12 py-4 rounded-2xl shadow-xl font-black text-white uppercase tracking-widest transition-all transform hover:-translate-y-1 ${
              isSubmitting ? 'bg-gray-400 scale-95' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-100'
            }`}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Brand' : 'Create Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}
