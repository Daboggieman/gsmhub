"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ devicesCount: 0, categoriesCount: 0, totalViews: 0 });
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

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Welcome to the Dashboard</h3>
      <p className="text-gray-600 mb-8">Quick overview of GSMHub performance and status.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h4 className="text-blue-800 font-bold text-lg mb-2">Devices</h4>
          <p className="text-3xl font-bold text-blue-900">{stats.devicesCount.toLocaleString()}</p>
          <p className="text-sm text-blue-600 mt-2">Total registered devices</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h4 className="text-green-800 font-bold text-lg mb-2">Categories</h4>
          <p className="text-3xl font-bold text-green-900">{stats.categoriesCount.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2">Active categories</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <h4 className="text-purple-800 font-bold text-lg mb-2">Total Views</h4>
          <p className="text-3xl font-bold text-purple-900">{stats.totalViews.toLocaleString()}</p>
          <p className="text-sm text-purple-600 mt-2">Device page views</p>
        </div>
      </div>
    </div>
  );
}