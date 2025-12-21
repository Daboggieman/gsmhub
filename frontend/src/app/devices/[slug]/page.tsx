import React from 'react';
import { notFound } from 'next/navigation';
import { Device, PriceHistory } from '@shared/types';
import DeviceGallery from '@/components/devices/DeviceGallery';
import SpecsTable from '@/components/devices/SpecsTable';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { apiClient } from '@/lib/api';
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

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Devices', href: '/search' },
    { label: device.name, href: '#' },
  ];

  const subNavItems = [
    { label: 'Review', icon: faNewspaper, href: '#review' },
    { label: 'Prices', icon: faShoppingCart, href: '#prices' },
    { label: 'Pictures', icon: faImages, href: '#gallery' },
    { label: 'Compare', icon: faBalanceScale, href: '/compare' },
    { label: 'Opinions', icon: faCommentDots, href: '#opinions' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Versions Header */}
        {device.versions && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-[10px] md:text-xs text-gray-500 uppercase tracking-tight">
            <span className="font-black text-gray-700 mr-2 border-r border-gray-200 pr-2">Versions</span>
            {device.versions}
          </div>
        )}

        {/* GSMArena Style Sub-Nav */}
        <div className="mt-6 flex overflow-x-auto no-scrollbar bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {subNavItems.map((item, i) => (
            <a 
              key={i} 
              href={item.href} 
              className="flex-shrink-0 px-6 py-3 flex items-center text-sm font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <FontAwesomeIcon icon={item.icon} className="mr-2 opacity-50" />
              {item.label}
            </a>
          ))}
          <button className="ml-auto px-6 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all font-bold text-sm flex items-center">
            <FontAwesomeIcon icon={faHeart} className="mr-2" />
            Become a fan
          </button>
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
                  <FontAwesomeIcon icon={faCog} className="mr-2 text-blue-500" />
                  Quick Stats
                </h3>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faWeightHanging} className="mr-3 w-5" />
                  <span className="text-sm font-semibold">Weight</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{device.weight || 'N/A'}</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faCog} className="mr-3 w-5" />
                  <span className="text-sm font-semibold">OS</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{device.os || 'N/A'}</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center text-gray-500">
                  <FontAwesomeIcon icon={faHistory} className="mr-3 w-5" />
                  <span className="text-sm font-semibold">Interest</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{device.views.toLocaleString()} hits</span>
              </div>
              {device.sarEU && (
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center text-gray-500">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-3 w-5 text-blue-400" />
                    <span className="text-sm font-semibold">SAR EU</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{device.sarEU}</span>
                </div>
              )}
            </div>

            {/* Benchmark Tests */}
            {device.specs.some(s => s.category === 'Tests') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Our Tests</h3>
                </div>
                <div className="p-0 divide-y divide-gray-50">
                  {device.specs.filter(s => s.category === 'Tests').map((test, i) => (
                    <div key={i} className="p-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{test.key}</span>
                      <span className="text-sm font-black text-blue-600">{test.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similarly Priced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Similarly Priced</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {similarlyPriced.map((item, i) => (
                  <a key={i} href={`/devices/${item.slug}`} className="p-4 flex items-center hover:bg-blue-50 transition-colors group">
                    <div className="w-10 h-10 bg-gray-100 rounded mr-3 relative flex-shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-1" />}
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 truncate">{item.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              
              {/* Header Info */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">{device.name}</h1>
                  <p className="text-xl text-gray-400 mt-2 font-medium">{device.brand} • {device.releaseDate || 'Upcoming'}</p>
                  {device.colors && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Available Colors</span>
                      <span className="text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-full">{device.colors}</span>
                    </div>
                  )}
                </div>
                {device.latestPrice && (
                  <div className="bg-green-600 px-8 py-4 rounded-2xl shadow-lg shadow-green-100 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-80">Best Global Price</span>
                    <span className="text-4xl font-black">${device.latestPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Highlights Bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-gray-100 rounded-2xl overflow-hidden mb-10 shadow-sm">
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-b md:border-b-0 border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faExpand} className="text-blue-500 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Display</span>
                  <span className="text-sm font-black text-gray-800">{device.displaySize || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-b md:border-b-0 border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faCamera} className="text-blue-500 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Camera</span>
                  <span className="text-sm font-black text-gray-800">{device.mainCamera || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faMemory} className="text-blue-500 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">RAM</span>
                  <span className="text-sm font-black text-gray-800">{device.ram || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center border-r border-gray-50 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faMicrochip} className="text-blue-500 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Chipset</span>
                  <span className="text-sm font-black text-gray-800 line-clamp-1">{device.chipset || '—'}</span>
                </div>
                <div className="p-5 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faBatteryFull} className="text-blue-500 mb-3 text-2xl" />
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Battery</span>
                  <span className="text-sm font-black text-gray-800">{device.battery || '—'}</span>
                </div>
              </div>

              {/* Review Teaser */}
              {device.reviewTeaser && (
                <div id="review" className="mb-10 p-6 bg-blue-900 rounded-2xl text-white relative overflow-hidden group">
                  <FontAwesomeIcon icon={faNewspaper} className="absolute -bottom-4 -right-4 text-8xl opacity-10 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-black mb-3 flex items-center">
                    <FontAwesomeIcon icon={faNewspaper} className="mr-3 text-blue-400" />
                    Review Teaser
                  </h3>
                  <p className="text-blue-100 leading-relaxed italic relative z-10">{device.reviewTeaser}</p>
                  <button className="mt-4 text-sm font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">Read Full Review ›</button>
                </div>
              )}

              {/* Buying Options */}
              <div id="prices" className="mb-10">
                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-3 text-green-500" />
                  Market Prices
                </h3>
                <div className="space-y-3">
                  {priceHistory.length > 0 ? (
                    priceHistory.filter(p => p.affiliateUrl).map((price, i) => (
                      <div key={i} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-blue-400 transition-all hover:shadow-md bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 border border-gray-100">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                          </div>
                          <div>
                            <span className="font-black text-gray-800">{price.retailer || 'Partner Store'}</span>
                            <span className="text-xs text-gray-400 block font-bold uppercase tracking-tighter">{price.country} • Updated today</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-2xl font-black text-gray-900">${price.price.toFixed(2)}</span>
                          <a 
                            href={price.affiliateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black flex items-center transition-all transform hover:-translate-y-0.5"
                          >
                            Buy Now <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 text-xs" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400 font-bold">
                      No retailer links available for this device yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Network Technology */}
              {device.networkTechnology && (
                <div className="mb-10 p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center">
                  <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mr-4 border border-gray-100 text-blue-500">
                    <FontAwesomeIcon icon={faNetworkWired} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Network Technology</span>
                    <span className="font-black text-gray-700">{device.networkTechnology}</span>
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
                    <FontAwesomeIcon icon={faCommentDots} className="mr-3 text-indigo-500" />
                    User Opinions
                  </h3>
                  <button className="text-sm font-black text-blue-600 hover:underline uppercase tracking-widest">Post Opinion ›</button>
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
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{opinion.date}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{opinion.text}</p>
                        <button className="mt-3 text-xs font-black text-blue-500 uppercase tracking-tighter hover:text-blue-700">Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-black hover:bg-gray-50 transition-colors">
                  Read all opinions ({device.opinions.length})
                </button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mt-1" />
              <p className="text-sm text-yellow-800 leading-relaxed">
                <span className="font-black uppercase text-[10px] block mb-1">Disclaimer</span>
                We can not guarantee that the information on this page is 100% correct. <a href="#" className="underline font-bold">Read more</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}