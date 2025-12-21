import React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const dynamic = 'force-dynamic';

async function getBrands() {
  try {
    return await apiClient.getBrands();
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return [];
  }
}

const PREDEFINED_BRANDS = [
  'Xiaomi', 'Redmi', 'POCO', 'Oppo', 'Vivo', 'OnePlus', 'Realme', 
  'Motorola', 'Nokia', 'Sony', 'Nubia', 'Redmagic', 'Asus', 
  'ROG Phone', 'Zenfone', 'Honor', 'Huawei', 'Zte', 'Lenovo', 
  'Tcl', 'Alcatel', 'Blackberry', 'Htc', 'Apple', 'Samsung', 'Google'
];

export default async function BrandsPage() {
  const dbBrands = await getBrands();
  
  // Merge, capitalize, and deduplicate brands
  const allBrands = Array.from(
    new Set([...PREDEFINED_BRANDS, ...dbBrands].map(b => 
      b.charAt(0).toUpperCase() + b.slice(1)
    ))
  ).sort((a, b) => a.localeCompare(b));

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brands' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Browse by Brand</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find devices from your favorite manufacturers. We cover everything from major global brands to independent sub-brands.
          </p>
        </div>

        {allBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allBrands.map((brand) => (
              <Link 
                key={brand} 
                href={`/brands/${encodeURIComponent(brand)}`}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-center text-center h-20 hover:border-blue-200 group"
              >
                <span className="font-bold text-gray-700 group-hover:text-blue-600 text-sm md:text-base">{brand}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-700">No brands found</h2>
          </div>
        )}
      </main>
    </div>
  );
}
