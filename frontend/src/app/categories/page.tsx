import React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileScreenButton, faTabletScreenButton, faLaptop, faStopwatch, faHeadphones, faGamepad } from '@fortawesome/free-solid-svg-icons';

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
  if (!slug) return faGamepad;
  if (slug.includes('phone') || slug.includes('smart')) return faMobileScreenButton;
  if (slug.includes('tablet') || slug.includes('pad')) return faTabletScreenButton;
  if (slug.includes('laptop') || slug.includes('book')) return faLaptop;
  if (slug.includes('watch') || slug.includes('band')) return faStopwatch;
  if (slug.includes('audio') || slug.includes('headphone')) return faHeadphones;
  return faGamepad; // Default/Other
};

const getCategoryColor = (index: number) => {
  const colors = [
    'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
    'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white',
    'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
  ];
  return colors[index % colors.length];
};

export default async function CategoriesPage() {
  const allCategories = await getCategories();
  const categories = allCategories.filter(c => c && c.slug);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Browse by Category</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our extensive database of devices categorized for your convenience.
            Find the perfect phone, tablet, or gadget that suits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={category.id || category.slug || index} 
              href={`/categories/${category.slug}`}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-colors duration-300 ${getCategoryColor(index)}`}>
                <FontAwesomeIcon icon={getCategoryIcon(category.slug)} />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h2>
              
              {category.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="mt-4 flex items-center text-sm font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                Browse Devices &rarr;
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
