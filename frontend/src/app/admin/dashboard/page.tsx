"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Device } from '@shared/types';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMobileAlt, 
  faTags, 
  faEye, 
  faSearch, 
  faChartLine,
  faArrowRight,
  faDollarSign,
  faShoppingCart,
  faTurnUp
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface Stats {
  devicesCount: number;
  categoriesCount: number;
  totalViews: number;
  topDevices: Device[];
  topSearches: { query: string; count: number }[];
  revenueData: { name: string; revenue: number; ads: number }[];
  affiliatePerformance: { name: string; value: number }[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!stats) return <div className="text-red-600 font-bold p-8 bg-red-50 rounded-2xl">Error loading dashboard data.</div>;

  return (
    <div className="space-y-10 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-4xl font-black text-gray-900 tracking-tight">System Control</h3>
          <p className="text-gray-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Master Performance Dashboard</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live Updates Enabled</span>
        </div>
      </div>
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: faMobileAlt, label: 'Inventory', value: stats.devicesCount, sub: 'Active Units', color: 'blue' },
          { icon: faTags, label: 'Taxonomy', value: stats.categoriesCount, sub: 'Segments', color: 'emerald' },
          { icon: faEye, label: 'Engagement', value: stats.totalViews, sub: 'Page Views', color: 'purple' },
          { icon: faTrendingUp, label: 'Growth', value: '+12.5%', sub: 'Last 30 Days', color: 'orange' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-4">
              <div className={`w-10 h-10 bg-${item.color}-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-${item.color}-100`}>
                <FontAwesomeIcon icon={item.icon} size="sm" />
              </div>
              <div>
                <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">{item.label}</h4>
                <p className="text-2xl font-black text-gray-900 whitespace-nowrap">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Insights - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-black text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faDollarSign} className="text-amber-500" />
                Revenue Analytics
              </h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Earnings across all channels</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <span className="text-[10px] font-bold uppercase text-gray-500">Affiliate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-[10px] font-bold uppercase text-gray-500">Ads</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 900}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 900}} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="ads" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAds)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Affiliate Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h4 className="font-black text-gray-900 flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faShoppingCart} className="text-emerald-500" />
            Vendor Performance
          </h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Clicks per platform</p>
          
          <div className="h-[250px] w-full relative">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">1.2K</p>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Clicks</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {stats.affiliatePerformance.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="font-black text-gray-600 uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="font-black text-gray-900">{((item.value / stats.affiliatePerformance.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Top Devices */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
            <h4 className="font-black text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-indigo-600" />
              Intelligence: Top Content
            </h4>
            <Link href="/admin/devices" className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest border-b-2 border-indigo-100 pb-1">Direct Inventory</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.topDevices.map((device, index) => (
              <div key={device._id} className="px-8 py-5 flex items-center gap-4 hover:bg-indigo-50/20 transition-colors group">
                <div className="w-6 text-[10px] font-black text-gray-300 group-hover:text-indigo-600">0{index + 1}</div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl overflow-hidden p-2 border border-gray-100 group-hover:border-indigo-100 transition-colors">
                  <img src={device.imageUrl || '/placeholder-device.png'} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{device.name}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{device.brand} • {typeof device.category === 'object' ? (device.category as any).name : 'Standard'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 leading-none">{device.views.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Hits</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
            <h4 className="font-black text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="text-orange-500" />
              Consumer Intent
            </h4>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trending Now</span>
          </div>
          <div className="p-8 flex-1">
            <div className="space-y-6">
              {stats.topSearches.length > 0 ? stats.topSearches.map((search, i) => (
                <div key={search.query} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-gray-200 group-hover:text-orange-300">#0{i + 1}</span>
                    <span className="font-black text-gray-800 uppercase text-xs tracking-wider group-hover:translate-x-1 transition-transform">{search.query}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-24 bg-gray-50 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-orange-400" style={{width: `${(search.count / stats.topSearches[0].count) * 100}%`}}></div>
                    </div>
                    <span className="text-xs font-black text-gray-900 min-w-[3ch] text-right">{search.count}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-300 font-black uppercase text-[10px] tracking-widest">
                  Awaiting Search Data Points
                </div>
              )}
            </div>
            
            <div className="mt-12">
              <Link 
                href="/admin/devices/new" 
                className="flex items-center justify-between p-6 bg-gray-900 rounded-[2rem] text-white hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 group"
              >
                <div>
                  <p className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Inventory Management</p>
                  <p className="font-black text-lg">Push Data Objects</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}