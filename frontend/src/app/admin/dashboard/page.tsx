"use client";

import { useEffect, useState } from 'react';
import { apiClient, AdminStats } from '@/lib/api';
import Link from 'next/link';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Theme-container colors (constant across light/dark) + fixed-dim accents
const COLORS = ['#0066ff', '#008259', '#4edea3', '#b3c5ff', '#ffb4ab'];
const CHART_OUTLINE = 'var(--color-outline-variant)';
const CHART_TICK = 'var(--color-outline)';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <span className="material-symbols-outlined progress_activity animate-spin text-[48px] text-secondary" aria-hidden="true"></span>
    </div>
  );

  if (!stats) return <div className="rounded-xl border border-error-container bg-error-container/15 p-space-lg font-label-md font-bold text-error">Error loading dashboard data.</div>;

  return (
    <div className="space-y-space-xl">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h3 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">System Control</h3>
          <p className="mt-1 font-label-sm text-label-sm font-bold uppercase tracking-widest text-outline">Master Performance Dashboard</p>
        </div>
        <div className="flex items-center gap-space-sm rounded-lg border border-tertiary-container/30 bg-tertiary-container/15 px-space-md py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-tertiary"></div>
          <span className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-tertiary">Live Updates Enabled</span>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: 'smartphone', label: 'Inventory', value: stats.devicesCount, sub: 'Active Units', tile: 'bg-primary-container text-on-primary-container' },
          { icon: 'category', label: 'Taxonomy', value: stats.categoriesCount, sub: 'Segments', tile: 'bg-tertiary-container text-on-tertiary-container' },
          { icon: 'visibility', label: 'Engagement', value: stats.totalViews, sub: 'Page Views', tile: 'bg-secondary-container/15 text-secondary-container' },
          { icon: 'trending_up', label: 'Growth', value: '+12.5%', sub: 'Last 30 Days', tile: 'bg-surface-container-highest text-on-surface' },
        ].map((item, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-md md:shadow-none">
            <div className="relative z-10 flex flex-col gap-space-md">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.tile}`}>
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
              </div>
              <div>
                <h4 className="mb-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">{item.label}</h4>
                <p className="font-headline-lg whitespace-nowrap text-on-surface tabular-nums">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</p>
                <p className="mt-1 font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Insights - Charts */}
      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-3">
        {/* Revenue Growth Chart */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-xl shadow-md md:shadow-none lg:col-span-2">
          <div className="mb-space-xl flex items-center justify-between">
            <div>
              <h4 className="flex items-center gap-space-sm font-headline-md font-bold text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-tertiary" aria-hidden="true">payments</span>
                Revenue Analytics
              </h4>
              <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Earnings across all channels</p>
            </div>
            <div className="flex gap-space-md">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary-container"></div>
                <span className="font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">Affiliate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-tertiary-container"></div>
                <span className="font-label-xs text-label-xs font-bold uppercase text-on-surface-variant">Ads</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066ff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008259" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#008259" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_OUTLINE} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: CHART_TICK, fontSize: 10, fontWeight: 600}}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: CHART_TICK, fontSize: 10, fontWeight: 600}}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface-container-highest)',
                    color: 'var(--color-on-surface)',
                    fontWeight: 600
                  }}
                  itemStyle={{color: 'var(--color-on-surface)'}}
                  labelStyle={{color: 'var(--color-on-surface-variant)'}}
                  cursor={{stroke: CHART_OUTLINE}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0066ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="ads" stroke="#008259" strokeWidth={2} fillOpacity={1} fill="url(#colorAds)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Affiliate Distribution */}
        <div className="rounded-xl bg-surface-container-low p-space-xl shadow-md md:shadow-none">
          <h4 className="mb-2 flex items-center gap-space-sm font-headline-md font-bold text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-tertiary" aria-hidden="true">shopping_cart</span>
            Vendor Performance
          </h4>
          <p className="mb-space-xl font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Clicks per platform</p>

          <div className="relative h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.affiliatePerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats.affiliatePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface-container-highest)',
                    color: 'var(--color-on-surface)',
                    fontWeight: 600
                  }}
                  itemStyle={{color: 'var(--color-on-surface)'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-headline-lg font-bold text-on-surface tabular-nums">1.2K</p>
                <p className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Total Clicks</p>
              </div>
            </div>
          </div>

          <div className="mt-space-md space-y-2">
            {stats.affiliatePerformance.map((item, i) => (
              <div key={i} className="flex items-center justify-between font-body-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="font-bold uppercase text-on-surface-variant">{item.name}</span>
                </div>
                <span className="font-bold text-on-surface tabular-nums">{((item.value / stats.affiliatePerformance.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-2">
        {/* Top Devices */}
        <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container p-space-xl">
            <h4 className="flex items-center gap-space-sm font-headline-md font-bold text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-secondary-container" aria-hidden="true">leaderboard</span>
              Intelligence: Top Content
            </h4>
            <Link href="/admin/devices" className="border-b border-secondary-container/40 pb-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-secondary hover:text-secondary-container">Direct Inventory</Link>
          </div>
          <div className="divide-y divide-outline-variant/40">
            {stats.topDevices.map((device, index) => (
              <div key={device._id} className="group flex items-center gap-space-md px-space-xl py-space-md transition-colors hover:bg-surface-container">
                <div className="w-6 font-headline-md text-label-md tabular-nums text-outline">{String(index + 1).padStart(2, '0')}</div>
                <div className="h-12 w-12 overflow-hidden rounded-lg border border-outline-variant/50 bg-surface-container p-2">
                  <img src={device.imageUrl || '/placeholder-device.png'} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="flex-1">
                  <p className="font-label-md font-bold text-on-surface">{device.name}</p>
                  <p className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">{device.brand} • {typeof device.category === 'object' && 'name' in device.category ? device.category.name : 'Standard'}</p>
                </div>
                <div className="text-right">
                  <p className="font-label-md font-bold leading-none text-on-surface tabular-nums">{device.views.toLocaleString()}</p>
                  <p className="mt-1 font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Hits</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-low shadow-md md:shadow-none">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container p-space-xl">
            <h4 className="flex items-center gap-space-sm font-headline-md font-bold text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-secondary-container" aria-hidden="true">manage_search</span>
              Consumer Intent
            </h4>
            <span className="font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">Trending Now</span>
          </div>
          <div className="flex-1 p-space-xl">
            <div className="space-y-space-lg">
              {stats.topSearches.length > 0 ? stats.topSearches.map((search, i) => (
                <div key={search.query} className="group flex items-center justify-between">
                  <div className="flex items-center gap-space-md">
                    <span className="font-label-xs text-label-xs font-bold tabular-nums text-outline">#{i + 1}</span>
                    <span className="font-label-md font-bold uppercase tracking-wider text-on-surface">{search.query}</span>
                  </div>
                  <div className="flex items-center gap-space-md">
                    <div className="hidden h-1 w-24 overflow-hidden rounded-full bg-surface-container-highest sm:block">
                      <div className="h-full bg-secondary-container" style={{width: `${(search.count / stats.topSearches[0].count) * 100}%`}}></div>
                    </div>
                    <span className="min-w-[3ch] text-right font-body-sm font-bold text-on-surface tabular-nums">{search.count}</span>
                  </div>
                </div>
              )) : (
                <div className="py-space-xl text-center font-label-xs text-label-xs font-bold uppercase tracking-widest text-outline">
                  Awaiting Search Data Points
                </div>
              )}
            </div>

            <div className="mt-space-xl">
              <Link
                href="/admin/devices/new"
                className="group flex items-center justify-between rounded-xl bg-primary-container p-space-lg text-on-primary-container shadow-md transition-colors hover:bg-inverse-primary"
              >
                <div>
                  <p className="font-label-xs text-label-xs font-bold uppercase tracking-widest opacity-80">Inventory Management</p>
                  <p className="font-headline-md font-bold">Push Data Objects</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
