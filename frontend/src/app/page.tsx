import React from 'react';
import DeviceCard from '@/components/devices/DeviceCard';
import { Device } from '@shared/types';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faTabletAlt, faLaptop, faClock, faSearch, faArrowRight, faFire, faChartLine } from '@fortawesome/free-solid-svg-icons';

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
  if (!name) return <FontAwesomeIcon icon={faSearch} />;
  const n = name.toLowerCase();
  if (n.includes('phone')) return <FontAwesomeIcon icon={faMobileAlt} />;
  if (n.includes('tablet')) return <FontAwesomeIcon icon={faTabletAlt} />;
  if (n.includes('laptop')) return <FontAwesomeIcon icon={faLaptop} />;
  if (n.includes('watch')) return <FontAwesomeIcon icon={faClock} />;
  return <FontAwesomeIcon icon={faSearch} />;
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

  return (
    <div className="bg-gray-100 min-h-screen">
      
      {/* Hero Section - Full Width */}
      <section className="relative bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-12 px-4 shadow-md">
         <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Find Your <span className="text-blue-400">Perfect Phone</span>
              </h1>
              <p className="text-lg text-blue-100 mb-6 max-w-xl">
                The most comprehensive database of mobile device specifications.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/search" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
                >
                  Search Now
                </Link>
                <Link 
                  href="/compare" 
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30 px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Compare
                </Link>
              </div>
            </div>
            {/* Optional: Add a hero image here if available */}
         </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR: BRANDS */}
          <aside className="w-full lg:w-1/6 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Phone Finder</h3>
              </div>
              <div className="p-0">
                <ul className="divide-y divide-gray-100">
                  {POPULAR_BRANDS.map((brand) => (
                    <li key={brand}>
                      <Link 
                        href={`/search?brand=${brand}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex justify-between items-center"
                      >
                        {brand}
                        <span className="text-gray-400 text-xs font-black">›</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link 
                      href="/search" 
                      className="block px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 text-center"
                    >
                      All Brands...
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* CENTER CONTENT: MAIN FEED */}
          <main className="w-full lg:w-3/6 order-1 lg:order-2">
            
            {/* Popular Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {validCategories.slice(0, 4).map((category) => (
                <Link 
                  key={category.slug} 
                  href={`/categories/${category.slug}`}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center hover:shadow-md transition-all"
                >
                  <div className="text-blue-600 mb-2 text-xl">
                    <CategoryIcon name={category.name} />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{category.name}</span>
                </Link>
              ))}
            </div>

            {/* Latest Devices */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">
                  <FontAwesomeIcon icon={faMobileAlt} className="mr-2 text-blue-600" />
                  Latest Devices
                </h2>
                <Link href="/search" className="text-blue-700 text-sm font-black hover:underline">
                  See All ›
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          <aside className="w-full lg:w-2/6 order-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4">
              <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">
                  <FontAwesomeIcon icon={faChartLine} className="mr-2 text-red-600" />
                  Top 10 by Interest
                </h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {trendingDevices.map((device, index) => (
                  <Link 
                    key={device._id} 
                    href={`/devices/${device.slug}`}
                    className="flex items-center p-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 text-center font-bold text-gray-500 mr-2 group-hover:text-blue-600">
                      {index + 1}.
                    </div>
                    <div className="relative w-12 h-16 mr-3 bg-gray-100 rounded flex-shrink-0 p-1">
                      {device.imageUrl ? (
                        <Image 
                          src={device.imageUrl} 
                          alt={device.name || 'Device image'} 
                          fill 
                          style={{ objectFit: 'contain' }}
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500 font-bold">No Img</div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-600">
                        {device.name}
                      </h4>
                      <p className="text-xs text-gray-600 truncate font-medium">
                        {device.views.toLocaleString()} hits
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                <Link href="/search?filter=trending" className="text-xs font-black text-blue-700 uppercase hover:underline">
                  View Full Leaderboard
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}