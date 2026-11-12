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
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-space-md lg:px-space-lg py-space-lg">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-space-xl text-center">
        <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-space-sm">Browse by Brand</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Find devices from your favorite manufacturers. We cover everything from major global brands to independent sub-brands.
        </p>
      </div>

      {allBrands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-space-md">
          {allBrands.map((brand) => (
            <Link
              key={brand}
              href={`/brands/${encodeURIComponent(brand)}`}
              className="bg-surface-container-low rounded-xl px-space-md py-space-md shadow-md md:shadow-none hover:bg-surface-container-high transition-colors flex items-center justify-center text-center min-h-20 group"
            >
              <span className="font-label-md font-bold text-on-surface-variant group-hover:text-secondary transition-colors">{brand}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container-low rounded-xl">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-space-md" aria-hidden="true">apps</span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface-variant">No brands found</h2>
        </div>
      )}
    </main>
  );
}
