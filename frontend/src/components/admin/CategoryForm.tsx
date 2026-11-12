"use client";

import { useState } from 'react';
import { Category } from '@shared/types';
import { generateSlug } from '@shared/utils/slug';
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
    description: '',
    icon: '',
    isActive: true,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAutoSlug, setIsAutoSlug] = useState(!isEdit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none max-w-2xl">
      <div className="flex items-center gap-space-md border-b border-outline-variant bg-surface-container p-space-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">sell</span>
        </div>
        <div>
          <h3 className="font-headline-md font-bold uppercase tracking-tight text-on-surface">
            {isEdit ? 'Edit Category' : 'Create New Category'}
          </h3>
          <p className="mt-0.5 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Organize your devices efficiently</p>
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
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Category Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Smartphones"
                className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 font-body-sm text-on-surface-variant focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-space-lg">
            <div>
              <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Icon Name / URL</label>
              <div className="relative">
                <input
                  type="text"
                  name="icon"
                  value={formData.icon || ''}
                  onChange={handleChange}
                  placeholder="e.g. smartphone"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 pl-10 font-label-md font-bold text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline" aria-hidden="true">interests</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 rounded bg-surface-container-highest accent-secondary-container"
              />
              <label htmlFor="isActive" className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Active Status</label>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="What kind of devices belong here?"
            className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 font-body-md text-on-surface-variant placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
