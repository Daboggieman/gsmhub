"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Device } from '../../../../shared/src/types';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMobileAlt, 
  faTags, 
  faEye, 
  faSearch, 
  faChartLine,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

interface Stats {
  devicesCount: number;
  categoriesCount: number;
  totalViews: number;
  topDevices: Device[];
  topSearches: { query: string; count: number }[];
}

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
    <div className="space-y-10">
      <div>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h3>
        <p className="text-gray-600 font-medium mt-1 uppercase text-xs tracking-widest">Real-time performance metrics</p>
      </div>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-50 border border-blue-50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <FontAwesomeIcon icon={faMobileAlt} />
            </div>
            <h4 className="text-gray-500 font-black text-xs uppercase tracking-widest mb-1">Total Devices</h4>
            <p className="text-4xl font-black text-gray-900 leading-none">{stats.devicesCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-green-50 border border-green-50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <FontAwesomeIcon icon={faTags} />
            </div>
            <h4 className="text-gray-500 font-black text-xs uppercase tracking-widest mb-1">Categories</h4>
            <p className="text-4xl font-black text-gray-900 leading-none">{stats.categoriesCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-purple-50 border border-purple-50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
              <FontAwesomeIcon icon={faEye} />
            </div>
            <h4 className="text-gray-500 font-black text-xs uppercase tracking-widest mb-1">Total Hits</h4>
            <p className="text-4xl font-black text-gray-900 leading-none">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Top Devices */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
            <h4 className="font-black text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
              Most Popular Devices
            </h4>
            <Link href="/admin/devices" className="text-xs font-black text-blue-600 hover:underline uppercase">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.topDevices.map((device, index) => (
              <div key={device._id} className="p-4 flex items-center gap-4 hover:bg-blue-50/30 transition-colors group">
                <div className="w-8 text-center font-black text-gray-300 group-hover:text-blue-600">{index + 1}</div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden p-1">
                  <img src={device.imageUrl} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 truncate">{device.name}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">{device.brand} • {device.category?.name || 'Device'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-blue-600 text-sm">{device.views.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Hits</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100">
            <h4 className="font-black text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="text-indigo-600" />
              Trending Searches
            </h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topSearches.length > 0 ? stats.topSearches.map((search) => (
                <div key={search.query} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="font-bold text-gray-800 capitalize tracking-tight">{search.query}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900">{search.count}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase">Lookups</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400 font-bold uppercase text-xs tracking-widest">
                  No search data collected yet
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <Link 
                href="/admin/devices/new" 
                className="flex items-center justify-between p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group"
              >
                <span className="font-black uppercase tracking-widest text-sm">Add New Content</span>
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}