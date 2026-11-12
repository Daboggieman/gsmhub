import React from 'react';
import DeviceCard from '@/components/devices/DeviceCard';
import DeviceImage from '@/components/devices/DeviceImage';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

async function getHomeData() {
  try {
    const [trendingDevices, popularDevices, categories, latestDevicesData] = await Promise.all([
      apiClient.getTrendingDevices(10),
      apiClient.getPopularDevices(8),
      apiClient.getCategories(),
      apiClient.getDevices({ limit: 12 }) // Fetch "latest" (or just a batch of) devices
    ]);
    return {
      trendingDevices,
      popularDevices,
      categories,
      latestDevices: latestDevicesData.devices
    };
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    return { trendingDevices: [], popularDevices: [], categories: [], latestDevices: [] };
  }
}

const CategoryIcon = ({ name }: { name?: string }) => {
  const iconName = !name ? 'devices_other' : (() => {
    const n = name.toLowerCase();
    if (n.includes('phone')) return 'smartphone';
    if (n.includes('tablet')) return 'tablet_mac';
    if (n.includes('laptop')) return 'laptop_mac';
    if (n.includes('watch')) return 'watch';
    if (n.includes('audio') || n.includes('headphone')) return 'headphones';
    return 'devices_other';
  })();
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
      {iconName}
    </span>
  );
};

const POPULAR_BRANDS = [
  'Samsung', 'Apple', 'Huawei', 'Nokia', 'Sony', 'LG', 'HTC', 'Motorola',
  'Lenovo', 'Xiaomi', 'Google', 'Honor', 'Oppo', 'Realme', 'OnePlus',
  'Vivo', 'Meizu', 'Asus', 'Tecno', 'Infinix'
];

export default async function Home() {
  const { trendingDevices, popularDevices, categories, latestDevices } = await getHomeData();

  // Filter out categories without name or slug to prevent errors
  const validCategories = categories.filter(c => c && c.name && c.slug);

  // Reference point for the trending hit-bars (relative interest)
  const maxViews = Math.max(1, ...trendingDevices.map((d: { views?: number }) => d.views || 0));

  return (
    <div>
      {/* Hero Section - Full Width */}
      <section className="relative border-b border-outline-variant bg-surface-container-low overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-container opacity-10 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary-container opacity-10 rounded-full blur-3xl" aria-hidden="true"></div>

        <div className="relative max-w-[1440px] mx-auto px-space-md lg:px-space-lg py-space-xl lg:py-20 flex flex-col items-center text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface mb-space-lg">
              Device Info? <span className="text-secondary-container">we&apos;ve got you covered</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl max-w-xl mx-auto">
              The most comprehensive database of Tech device specifications.
            </p>
            <div className="flex flex-wrap justify-center gap-space-md">
              <Link
                href="/search"
                className="inline-flex items-center gap-space-sm bg-primary-container hover:bg-inverse-primary text-on-primary-container px-space-xl py-3 rounded-lg font-label-md font-bold transition-all active:scale-[0.98] shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span>
                Search Now
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-space-sm border border-outline-variant text-on-surface hover:bg-surface-container px-space-xl py-3 rounded-lg font-label-md font-bold transition-colors active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">compare_arrows</span>
                Compare
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-space-md lg:px-space-lg py-space-lg">
        <div className="flex flex-col lg:flex-row gap-space-lg">

          {/* LEFT SIDEBAR: BRANDS */}
          <aside className="w-full lg:w-[220px] shrink-0 order-2 lg:order-1">
            <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none overflow-hidden">
              <div className="px-space-md py-space-md border-b border-outline-variant flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary-container" aria-hidden="true">tune</span>
                <h3 className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">Phone Finder</h3>
              </div>
              <ul className="divide-y divide-outline-variant/50">
                {POPULAR_BRANDS.map((brand) => (
                  <li key={brand}>
                    <Link
                      href={`/search?brand=${brand}`}
                      className="flex justify-between items-center px-space-md py-2.5 font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors group"
                    >
                      {brand}
                      <span className="material-symbols-outlined text-[16px] text-outline-variant group-hover:text-secondary transition-colors" aria-hidden="true">chevron_right</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-outline-variant">
                <Link
                  href="/search"
                  className="flex justify-center items-center gap-space-xs px-space-md py-space-md font-label-sm text-label-sm font-bold text-secondary-container hover:bg-surface-container transition-colors"
                >
                  All Brands
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* CENTER CONTENT: MAIN FEED */}
          <main className="w-full lg:w-3/6 order-1 lg:order-2 lg:flex-1 min-w-0">

            {/* Popular Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md mb-space-xl">
              {validCategories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="bg-surface-container-low p-space-md rounded-xl shadow-md md:shadow-none flex flex-col items-center gap-space-sm text-center hover:bg-surface-container-high transition-colors"
                >
                  <span className="w-10 h-10 rounded-lg bg-secondary-container/15 text-secondary-container flex items-center justify-center">
                    <CategoryIcon name={category.name} />
                  </span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">{category.name}</span>
                </Link>
              ))}
            </div>

            {/* Latest Devices */}
            <div className="mb-space-xl">
              <div className="flex justify-between items-center mb-space-md bg-surface-container-low px-space-md py-space-md rounded-xl shadow-md md:shadow-none">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[20px] text-secondary-container" aria-hidden="true">smartphone</span>
                  Latest Devices
                </h2>
                <Link href="/search" className="font-label-xs text-label-xs text-secondary-container uppercase font-bold hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
                {latestDevices.length > 0 ? (
                  latestDevices.slice(0, 6).map((device) => (
                    <DeviceCard key={device._id} device={device} />
                  ))
                ) : (
                  popularDevices.map((device) => (
                    <DeviceCard key={device._id} device={device} />
                  ))
                )}
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR: TRENDING & INTEREST */}
          <aside className="w-full lg:w-[320px] shrink-0 order-3">
            <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none overflow-hidden">
              <div className="px-space-md py-space-md border-b border-outline-variant flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary-container" aria-hidden="true">trending_up</span>
                <h3 className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">Top 10 by Interest</h3>
              </div>

              <div className="divide-y divide-outline-variant/50">
                {trendingDevices.map((device, index) => (
                  <Link
                    key={device._id}
                    href={`/devices/${device.slug}`}
                    className="flex items-center p-space-sm md:p-space-md hover:bg-surface-container transition-colors group"
                  >
                    <div className="w-6 text-center font-headline-md text-label-md tabular-nums text-outline mr-space-sm group-hover:text-secondary transition-colors">
                      {index + 1}
                    </div>
                    <div className="w-12 h-16 mr-space-md bg-surface-container rounded shrink-0 p-1">
                      {device.imageUrl ? (
                        <DeviceImage
                          src={device.imageUrl}
                          alt={device.name || 'Device image'}
                          style={{ objectFit: 'contain' }}
                          sizes="48px"
                          fallbackLabel=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline-variant">
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">mobile_off</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-label-md text-label-md font-bold text-on-surface truncate group-hover:text-secondary transition-colors">
                        {device.name}
                      </h4>
                      <p className="font-label-xs text-label-xs text-outline tabular-nums mb-1">
                        {device.views.toLocaleString()} hits
                      </p>
                      <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden" aria-hidden="true">
                        <div
                          className="h-full bg-secondary-container rounded-full"
                          style={{ width: `${Math.max(6, Math.round(((device.views || 0) / maxViews) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-space-md bg-surface-container border-t border-outline-variant text-center">
                <Link href="/search?filter=trending" className="inline-flex items-center gap-1 font-label-xs text-label-xs text-secondary-container uppercase font-bold hover:underline">
                  View Full Leaderboard
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
