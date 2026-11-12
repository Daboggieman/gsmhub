"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Category } from '@shared/types';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Increment to re-fetch without changing the search term (after
  // mutations and manual search submits).
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async (term: string) => {
      setIsLoading(true);
      try {
        const data = await apiClient.getCategories(term);
        if (!cancelled) setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load(search);
    return () => {
      cancelled = true;
    };
    // `search` is read at trigger time: refetches are explicit (submit,
    // delete) rather than per-keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshTick((t) => t + 1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await apiClient.deleteCategory(id);
        setRefreshTick((t) => t + 1);
      } catch {
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <h3 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          Manage Categories
        </h3>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-lg bg-primary-container px-space-md py-2.5 font-label-sm text-label-sm font-bold text-on-primary-container transition-colors hover:bg-inverse-primary"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
          Add New Category
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-space-sm">
        <input
          type="text"
          placeholder="Search categories..."
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-label-md text-on-surface placeholder-outline focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-surface-container-highest px-space-lg py-2.5 font-label-sm font-bold text-on-surface transition-colors hover:brightness-110"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Name</th>
                <th className="px-space-lg py-space-md font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Slug</th>
                <th className="px-space-lg py-space-md text-right font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {isLoading ? (
                <tr key="loading-row">
                  <td colSpan={3} className="animate-pulse px-space-lg py-space-lg text-center font-label-md text-outline">
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr key="empty-row">
                  <td colSpan={3} className="px-space-lg py-space-lg text-center font-label-md text-outline">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id || (category as { _id?: string })._id}
                    className="transition-colors hover:bg-surface-container"
                  >
                    <td className="px-space-lg py-space-md font-label-md font-bold text-on-surface">{category.name}</td>
                    <td className="px-space-lg py-space-md font-body-sm text-on-surface-variant">{category.slug}</td>
                    <td className="px-space-lg py-space-md text-right">
                      <div className="flex justify-end gap-space-md">
                        <Link
                          href={`/admin/categories/edit/${category.id}`}
                          className="font-label-sm font-bold text-secondary hover:text-secondary-container"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id!)}
                          className="font-label-sm font-bold text-error hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
