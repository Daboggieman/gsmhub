import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Device, PriceHistory } from '@shared/types';
import DeviceGallery from '@/components/devices/DeviceGallery';
import SpecsTable from '@/components/devices/SpecsTable';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { apiClient } from '@/lib/api';
import { generateMetadata as generateSeoMetadata, generateProductJsonLd } from '@/lib/seo';
import PriceComparison from '@/components/prices/PriceComparison';
import AdUnit from '@/components/ads/AdUnit';
import SocialShare from '@/components/devices/SocialShare';
import SimilarDevices from '@/components/devices/SimilarDevices';
import FavoriteButton from '@/components/users/FavoriteButton';

async function getDeviceData(slug: string): Promise<{ device: Device; priceHistory: PriceHistory[] } | null> {
  try {
    const device = await apiClient.getDevice(slug);
    if (!device) return null;

    const deviceId = device._id;
    let priceHistory: PriceHistory[] = [];

    if (deviceId) {
      try {
        priceHistory = await apiClient.getDeviceCurrentPrices(deviceId);
      } catch (err) {
        console.error('Failed to fetch auxiliary device data:', err);
      }
    }

    return { device, priceHistory };
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
    title: device.seoTitle || `${device.name} - Full Specifications & Price`,
    description: device.seoDescription || description,
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
  } catch {
    return [];
  }
}

export default async function DevicePage({ params: promiseParams }: { params: Promise<{ slug: string }> }) {
  const params = await promiseParams;
  const data = await getDeviceData(params.slug);

  if (!data) {
    notFound();
  }

  const { device, priceHistory } = data;
  const jsonLd = generateProductJsonLd(device);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Devices', href: '/search' },
    { label: device.name, href: '#' },
  ].map(item => ({ ...item, name: item.label })); // Adapt to BreadcrumbItem type

  const subNavItems = [
    { label: 'Review', icon: 'article', href: '#review' },
    { label: 'Prices', icon: 'sell', href: '#prices' },
    { label: 'Pictures', icon: 'photo_library', href: '#gallery' },
    { label: 'Compare', icon: 'compare_arrows', href: '/compare' },
    { label: 'Opinions', icon: 'forum', href: '#opinions' },
  ];

  const quickStats = [
    { label: 'Weight', icon: 'monitor_weight', value: device.weight || 'N/A' },
    { label: 'OS', icon: 'settings', value: device.os || 'N/A' },
    { label: 'Interest', icon: 'visibility', value: `${device.views.toLocaleString()} hits` },
    ...(device.sarEU ? [{ label: 'SAR EU', icon: 'verified', value: device.sarEU, accent: true }] : []),
  ];

  const highlights = [
    { label: 'Display', icon: 'aspect_ratio', value: device.displaySize },
    { label: 'Camera', icon: 'photo_camera', value: device.mainCamera },
    { label: 'RAM', icon: 'memory', value: device.ram },
    { label: 'Chipset', icon: 'developer_board', value: device.chipset, clamp: true },
    { label: 'Battery', icon: 'battery_full', value: device.battery },
  ];

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://gsmhub.com/devices/${device.slug}`;

  return (
    <div className="pb-space-xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1440px] mx-auto px-space-md lg:px-space-lg py-space-lg">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Versions Header */}
        {device.versions && (
          <div className="mt-space-md px-space-md py-2 bg-surface-container-low rounded shadow-md md:shadow-none font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
            <span className="font-bold text-on-surface border-r border-outline-variant pr-space-sm mr-space-sm">Versions</span>
            {device.versions}
          </div>
        )}

        {/* Sub-Nav */}
        <div className="mt-space-md flex overflow-x-auto no-scrollbar bg-surface-container-low rounded-xl shadow-md md:shadow-none p-1.5 gap-1">
          {subNavItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="shrink-0 px-space-lg py-2.5 flex items-center gap-space-xs rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] opacity-80" aria-hidden="true">{item.icon}</span>
              {item.label}
            </a>
          ))}
          <div className="ml-auto px-space-sm flex items-center">
            <FavoriteButton deviceId={device._id?.toString()} />
          </div>
        </div>

        <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          {/* Left Column: Gallery & Sidebar Stats */}
          <div className="lg:col-span-1 space-y-space-lg">
            <div id="gallery">
              <DeviceGallery
                imageUrls={device.images && device.images.length > 0 ? device.images : [device.imageUrl].filter(Boolean) as string[]}
                deviceName={device.name}
              />
            </div>

            {/* Quick Stats Sidebar */}
            <div className="bg-surface-container-low rounded-xl shadow-md md:shadow-none divide-y divide-outline-variant/50 overflow-hidden">
              <div className="px-space-md py-space-md border-b border-outline-variant">
                <h3 className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-widest flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container" aria-hidden="true">tune</span>
                  Quick Stats
                </h3>
              </div>
              {quickStats.map((stat) => (
                <div key={stat.label} className="px-space-md py-space-md flex items-center justify-between hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-space-md text-on-surface-variant">
                    <span className={`material-symbols-outlined text-[18px] ${stat.accent ? 'text-tertiary' : 'text-outline'}`} aria-hidden="true">{stat.icon}</span>
                    <span className="font-label-md">{stat.label}</span>
                  </div>
                  <span className="font-label-md font-bold text-on-surface tabular-nums">{stat.value}</span>
                </div>
              ))}
            </div>
            <AdUnit slot="device-details-sidebar" className="rounded-xl overflow-hidden" />
          </div>

          {/* Right Column: Main Info */}
          <div className="lg:col-span-2 space-y-space-lg">
            <div className="bg-surface-container-low p-space-md md:p-space-lg rounded-xl shadow-md md:shadow-none">
              {/* Header Info */}
              <div className="flex flex-wrap justify-between items-start gap-space-md mb-space-lg">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-on-surface">{device.name}</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm">{device.brand} • {device.releaseDate || 'Upcoming'}</p>
                  {device.colors && (
                    <div className="mt-space-md flex items-center gap-space-sm">
                      <span className="font-label-xs text-label-xs font-bold text-outline uppercase tracking-widest">Available Colors</span>
                      <span className="font-label-sm font-bold text-on-surface bg-surface-container px-space-md py-1 rounded">{device.colors}</span>
                    </div>
                  )}
                </div>
                {device.latestPrice && (
                  <div className="bg-surface-container-highest px-space-lg py-space-md rounded-xl text-right">
                    <span className="font-label-xs text-label-xs font-bold text-outline uppercase tracking-widest block mb-0.5">Best Global Price</span>
                    <span className="font-headline-lg text-headline-lg font-bold text-tertiary tabular-nums">${device.latestPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Highlights Bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 rounded-xl overflow-hidden border border-outline-variant divide-x divide-y md:divide-y-0 divide-outline-variant mb-space-lg">
                {highlights.map((hl) => (
                  <div key={hl.label} className="p-space-md flex flex-col items-center justify-center text-center hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[22px] text-secondary-container mb-space-sm" aria-hidden="true">{hl.icon}</span>
                    <span className="font-label-xs text-label-xs uppercase font-bold text-outline tracking-wider mb-0.5">{hl.label}</span>
                    <span className={`font-label-md font-bold text-on-surface tabular-nums ${hl.clamp ? 'line-clamp-1' : ''}`}>{hl.value || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Social Share Component */}
              <SocialShare url={currentUrl} title={`Check out the ${device.name} specifications on GSMHub!`} />

              {/* Affiliate Buttons (Priority) */}
              {device.affiliateLinks && device.affiliateLinks.length > 0 && (
                <div className="flex flex-wrap gap-space-md mb-space-xl">
                  {device.affiliateLinks.map((link, i: number) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[150px] bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md font-bold py-space-md px-space-lg rounded-lg flex items-center justify-center gap-space-sm transition-all active:scale-[0.98] shadow-md"
                    >
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">shopping_cart</span>
                      Buy on {link.platform} {link.price ? `($${link.price})` : ''}
                    </a>
                  ))}
                </div>
              )}

              {/* Review Teaser */}
              {device.reviewTeaser && (
                <div id="review" className="mb-space-xl p-space-lg bg-surface-container rounded-xl border border-outline-variant relative overflow-hidden group">
                  <span className="material-symbols-outlined text-[96px] absolute -bottom-4 -right-4 text-outline-variant opacity-10 group-hover:scale-110 transition-transform" aria-hidden="true">article</span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-md flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[20px] text-secondary-container" aria-hidden="true">article</span>
                    Review Teaser
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed italic relative z-10">{device.reviewTeaser}</p>
                  <button className="mt-space-md font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary hover:text-secondary-container transition-colors">Read Full Review</button>
                </div>
              )}

              {/* Buying Options */}
              <div id="prices" className="mb-space-xl">
                <PriceComparison prices={priceHistory} deviceName={device.name} />
              </div>

              <AdUnit slot="device-details-mid" className="rounded-xl overflow-hidden" />

              {/* Network Technology */}
              {device.networkTechnology && (
                <div className="mb-space-xl p-space-md bg-surface-container rounded-xl flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-secondary-container">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">lan</span>
                  </div>
                  <div>
                    <span className="font-label-xs text-label-xs font-bold text-outline uppercase tracking-widest block">Network Technology</span>
                    <span className="font-label-md font-bold text-on-surface">{device.networkTechnology}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Specs Table */}
            <SpecsTable device={device} />

            {/* User Opinions Section */}
            {device.opinions && device.opinions.length > 0 && (
              <div id="opinions" className="bg-surface-container-low p-space-md md:p-space-lg rounded-xl shadow-md md:shadow-none">
                <div className="flex justify-between items-center mb-space-lg">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[20px] text-secondary-container" aria-hidden="true">forum</span>
                    User Opinions
                  </h3>
                  <button className="font-label-sm text-label-sm font-bold text-secondary uppercase tracking-wider hover:underline">Post Opinion</button>
                </div>
                <div className="space-y-space-md">
                  {device.opinions.map((opinion, i) => (
                    <div key={i} className="flex gap-space-md p-space-md bg-surface-container rounded-xl border border-outline-variant/50">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-md font-bold shrink-0">
                        {opinion.avatarInitials || opinion.user.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-space-sm mb-1">
                          <span className="font-label-md font-bold text-on-surface">{opinion.user}</span>
                          <span className="font-label-xs text-label-xs font-bold text-outline uppercase">{opinion.date}</span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{opinion.text}</p>
                        <button className="mt-space-sm font-label-xs text-label-xs font-bold text-secondary uppercase tracking-wider hover:text-secondary-container transition-colors">Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-space-lg py-3 border border-dashed border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                  Read all opinions ({device.opinions.length})
                </button>
              </div>
            )}

            {/* Similar Devices Section */}
            <SimilarDevices deviceId={device._id?.toString()} />

          </div>
        </div>
      </div>
    </div>
  );
}
