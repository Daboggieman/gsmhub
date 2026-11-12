"use client";

import { useState } from 'react';
import { generateSlug } from '@shared/utils/slug';
import { apiClient, AdminBrand } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface BrandFormProps {
  initialData?: Partial<AdminBrand>;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev: typeof formData) => {
      const next = { ...prev, [name]: val };
      // Auto-slug derives from the name in the same update (no follow-up
      // effect, one render per keystroke).
      if (isAutoSlug && !isEdit && name === 'name' && next.name) {
        next.slug = generateSlug(next.name);
      }
      return next;
    });

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none max-w-2xl">
      <div className="flex items-center gap-space-md border-b border-outline-variant bg-surface-container p-space-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">factory</span>
        </div>
        <div>
          <h3 className="font-headline-md font-bold uppercase tracking-tight text-on-surface">
            {isEdit ? 'Edit Brand' : 'Register New Brand'}
          </h3>
          <p className="mt-0.5 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Manage manufacturer profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-space-xl p-space-xl">
        {error && (
          <div className="flex items-center gap-space-md rounded-lg border border-error-container/40 bg-error-container/15 p-space-md font-label-md font-bold text-error">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2">
          <div className="space-y-space-lg">
            <div>
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Brand Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Apple"
                className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">URL Slug</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 font-body-sm text-on-surface-variant focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-space-lg">
            <div>
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Status</label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-5 w-5 rounded bg-surface-container-highest accent-secondary-container"
                />
                <label htmlFor="isFeatured" className="cursor-pointer font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Featured Brand</label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2">
          <div className="space-y-space-lg">
            <div>
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Logo URL</label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {formData.logoUrl && (
              <div className="group relative flex aspect-video max-w-sm items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-space-lg">
                <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Description</label>
            <textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Short bio about the brand..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-body-md text-on-surface-variant placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-space-md border-t border-outline-variant pt-space-lg">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-space-lg py-3 font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-lg px-space-xl py-3 font-label-sm text-label-sm font-bold uppercase tracking-widest transition-colors ${isSubmitting ? 'bg-surface-container-highest text-outline' : 'bg-primary-container text-on-primary-container hover:bg-inverse-primary'}`}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Brand' : 'Create Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}
