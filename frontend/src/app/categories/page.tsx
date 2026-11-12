import React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const dynamic = 'force-dynamic';

async function getCategories() {
  try {
    return await apiClient.getCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

const getCategoryIcon = (slug?: string) => {
  if (!slug) return 'devices_other';
  if (slug.includes('phone') || slug.includes('smart')) return 'smartphone';
  if (slug.includes('tablet') || slug.includes('pad')) return 'tablet_mac';
  if (slug.includes('laptop') || slug.includes('book')) return 'laptop_mac';
  if (slug.includes('watch') || slug.includes('band')) return 'watch';
  if (slug.includes('audio') || slug.includes('headphone')) return 'headphones';
  return 'devices_other'; // Default/Other
};

export default async function CategoriesPage() {
  const allCategories = await getCategories();
  const categories = allCategories.filter(c => c && c.slug);

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-space-md lg:px-space-lg py-space-lg">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-space-xl text-center">
        <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-space-sm">Browse by Category</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Explore our extensive database of devices categorized for your convenience.
          Find the perfect phone, tablet, or gadget that suits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-lg">
        {categories.map((category, index) => (
          <Link
            key={category.id || category.slug || index}
            href={`/categories/${category.slug}`}
            className="group bg-surface-container-low rounded-xl p-space-lg shadow-md md:shadow-none hover:bg-surface-container transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary-container/15 text-secondary-container flex items-center justify-center mb-space-md transition-colors group-hover:bg-secondary-container group-hover:text-background">
              <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                {getCategoryIcon(category.slug)}
              </span>
            </div>

            <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-1 group-hover:text-secondary transition-colors">
              {category.name}
            </h2>

            {category.description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="mt-space-md flex items-center gap-1 font-label-sm font-bold text-secondary-container opacity-0 group-hover:opacity-100 transition-opacity">
              Browse Devices
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
