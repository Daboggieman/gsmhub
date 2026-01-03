import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Device, PriceHistory } from '../../../../../shared/src/types';
import DeviceGallery from '@/components/devices/DeviceGallery';
import SpecsTable from '@/components/devices/SpecsTable';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { apiClient } from '@/lib/api';
import { generateMetadata as generateSeoMetadata, generateProductJsonLd } from '@/lib/seo';
import PriceComparison from '@/components/prices/PriceComparison';
import AdUnit from '@/components/ads/AdUnit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faExternalLinkAlt,
  faHistory,
  faCheckCircle,
  faExpand,
  faCamera,
  faMicrochip,
  faBatteryFull,
  faMemory,
  faWeightHanging,
  faCog,
  faNetworkWired,
  faNewspaper,
  faCommentDots,
  faExclamationTriangle,
  faHeart,
  faImages,
  faBalanceScale
} from '@fortawesome/free-solid-svg-icons';
import FavoriteButton from '@/components/users/FavoriteButton';

async function getDeviceData(slug: string): Promise<{ device: Device; priceHistory: PriceHistory[]; similarlyPriced: Device[] } | null> {
  try {
    const device = await apiClient.getDevice(slug);
    if (!device) return null;

    const deviceId = (device as any)._id || device._id;
    let priceHistory: PriceHistory[] = [];
    let similarlyPriced: Device[] = [];

    if (deviceId) {
      try {
        const [prices, allDevices] = await Promise.all([
          apiClient.getDevicePriceHistory(deviceId),
          apiClient.getDevices({ limit: 5 }) // Simplification for "similarly priced"
        ]);
        priceHistory = prices;
        similarlyPriced = allDevices.devices.filter(d => d.slug !== slug);
      } catch (err) {
        console.error('Failed to fetch auxiliary device data:', err);
      }
    }

    return { device, priceHistory, similarlyPriced };
  } catch (error) {
    console.error('Failed to fetch device data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDeviceData(slug);

  if (!data) return {};

  const { device } = data;
  const description = `${device.brand} ${device.model} - Full specifications: ${device.displaySize} display, ${device.mainCamera} camera, ${device.ram} RAM, ${device.battery} battery. Latest price and features.`;

  return generateSeoMetadata({
    title: `${device.name} - Full Specifications & Price`,
    description,
    path: `/devices/${slug}`,
    imageUrl: device.imageUrl,
    type: 'website',
  });
}

// Function to generate static params for SSG
export async function generateStaticParams() {
  try {
    const { devices } = await apiClient.getDevices({ limit: 100 });
    return devices.map((device) => ({
      slug: device.slug,
    }));
  } catch (err) {
    return [];
  }
}

export default async function DevicePage({ params: promiseParams }: { params: Promise<{ slug: string }> }) {
  const params = await promiseParams;
  const data = await getDeviceData(params.slug);

  if (!data) {
    notFound();
  }

  const { device, priceHistory, similarlyPriced } = data;
  const jsonLd = generateProductJsonLd(device);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Devices', href: '/search' },
    { label: device.name, href: '#' },
  ].map(item => ({ ...item, name: item.label })); // Adapt to BreadcrumbItem type

  const subNavItems = [
    { label: 'Review', icon: faNewspaper, href: '#review' },
    { label: 'Prices', icon: faShoppingCart, href: '#prices' },
    { label: 'Pictures', icon: faImages, href: '#gallery' },
    { label: 'Compare', icon: faBalanceScale, href: '/compare' },
    { label: 'Opinions', icon: faCommentDots, href: '#opinions' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Versions Header */}
        {device.versions && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-[10px] md:text-xs text-gray-600 uppercase tracking-tight">
            <span className="font-black text-gray-800 mr-2 border-r border-gray-200 pr-2">Versions</span>
            {device.versions}
          </div>
        )}

        {/* GSMArena Style Sub-Nav */}
        <div className="mt-6 flex overflow-x-auto no-scrollbar bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {subNavItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="flex-shrink-0 px-6 py-3 flex items-center text-sm font-bold text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
            >
              <FontAwesomeIcon icon={item.icon} className="mr-2 opacity-70" />
              {item.label}
            </a>
          ))}
          <div className="ml-auto px-4 flex items-center">
            <FavoriteButton deviceId={device._id?.toString() || (device as any)._id?.toString()} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Gallery & Sidebar Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div id="gallery">
              <DeviceGallery
                imageUrls={device.images && device.images.length > 0 ? device.images : [device.imageUrl].filter(Boolean) as string[]}
                deviceName={device.name}
              />
            </div>

            {/* Quick Stats Sidebar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest flex items-center">
                  <FontAwesomeIcon icon={faCog} className="mr-2 text-blue-600" />
                  Quick Stats
                </h3>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faWeightHanging} className="mr-3 w-5" />
                  <span className="text-sm font-semibold">Weight</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{device.weight || 'N/A'}</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faCog} className="mr-3 w-5" />
                  <span className="text-sm font-semibold">OS</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{device.os || 'N/A'}</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faHistory} className="mr-3 w-5" />
                  <span className="text-sm font-semibold">Interest</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{device.views.toLocaleString()} hits</span>
              </div>
              {device.sarEU && (
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center text-gray-600">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-3 w-5 text-blue-500" />
                    <span className="text-sm font-semibold">SAR EU</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{device.sarEU}</span>
                </div>
              )}
            </div>
            <AdUnit slot="device-details-sidebar" className="rounded-xl overflow-hidden" />
          </div>

          {/* Right Column: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              {/* Header Info */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">{device.name}</h1>
                  <p className="text-xl text-gray-600 mt-2 font-medium">{device.brand} • {device.releaseDate || 'Upcoming'}</p>
                  {device.colors && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Available Colors</span>
                      <span className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full">{device.colors}</span>
                    </div>
                  )}
                </div>
                {device.latestPrice && (
                  <div className="bg-green-600 px-8 py-4 rounded-2xl shadow-lg shadow-green-100 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-90">Best Global Price</span>
                    <span className="text-4xl font-black">${device.latestPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Highlights Bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-gray-100 rounded-2xl overflow-hidden mb-10 shadow-sm">
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-b md:border-b-0 border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faExpand} className="text-blue-600 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-1">Display</span>
                  <span className="text-sm font-black text-gray-900">{device.displaySize || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-b md:border-b-0 border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faCamera} className="text-blue-600 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-1">Camera</span>
                  <span className="text-sm font-black text-gray-900">{device.mainCamera || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faMemory} className="text-blue-600 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-1">RAM</span>
                  <span className="text-sm font-black text-gray-900">{device.ram || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faMicrochip} className="text-blue-600 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-1">Chipset</span>
                  <span className="text-sm font-black text-gray-900 line-clamp-1">{device.chipset || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faBatteryFull} className="text-blue-600 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-1">Battery</span>
                  <span className="text-sm font-black text-gray-900">{device.battery || '—'}</span>
                </div>
              </div>

              {/* Review Teaser */}
              {device.reviewTeaser && (
                <div id="review" className="mb-10 p-6 bg-blue-900 rounded-2xl text-white relative overflow-hidden group">
                  <FontAwesomeIcon icon={faNewspaper} className="absolute -bottom-4 -right-4 text-8xl opacity-10 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-black mb-3 flex items-center">
                    <FontAwesomeIcon icon={faNewspaper} className="mr-3 text-blue-300" />
                    Review Teaser
                  </h3>
                  <p className="text-blue-50 leading-relaxed italic relative z-10 font-medium">{device.reviewTeaser}</p>
                  <button className="mt-4 text-sm font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors">Read Full Review ›</button>
                </div>
              )}

              {/* Buying Options */}
              <div id="prices" className="mb-10">
                <PriceComparison prices={priceHistory} deviceName={device.name} />
              </div>

              <AdUnit slot="device-details-mid" className="rounded-2xl overflow-hidden" />

              {/* Network Technology */}
              {device.networkTechnology && (
                <div className="mb-10 p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center">
                  <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mr-4 border border-gray-100 text-blue-600">
                    <FontAwesomeIcon icon={faNetworkWired} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Network Technology</span>
                    <span className="font-black text-gray-800">{device.networkTechnology}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Specs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <SpecsTable device={device} />
            </div>

            {/* User Opinions Section */}
            {device.opinions && device.opinions.length > 0 && (
              <div id="opinions" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faCommentDots} className="mr-3 text-indigo-600" />
                    User Opinions
                  </h3>
                  <button className="text-sm font-black text-blue-700 hover:underline uppercase tracking-widest">Post Opinion ›</button>
                </div>
                <div className="space-y-6">
                  {device.opinions.map((opinion, i) => (
                    <div key={i} className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                        {opinion.avatarInitials || opinion.user.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-black text-gray-800">{opinion.user}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{opinion.date}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed font-medium">{opinion.text}</p>
                        <button className="mt-3 text-xs font-black text-blue-600 uppercase tracking-tighter hover:text-blue-800">Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-600 font-black hover:bg-gray-50 transition-colors">
                  Read all opinions ({device.opinions.length})
                </button>
              </div>
            )}

            {/* Similarly Priced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
              <div className="bg-gray-50 p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Similarly Priced</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {similarlyPriced.map((item, i) => (
                  <a key={i} href={`/devices/${item.slug}`} className="p-4 flex items-center hover:bg-blue-50 transition-colors group">
                    <div className="w-10 h-10 bg-gray-100 rounded mr-3 relative flex-shrink-0">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="object-contain p-1 w-full h-full"
                        />
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 truncate">{item.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}