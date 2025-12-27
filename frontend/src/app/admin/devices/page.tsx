"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Device } from '../../../../shared/src/types';
import Link from 'next/link';

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getDevices({ page, limit: 10, search });
      setDevices(data.devices);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDevices();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        await apiClient.deleteDevice(id);
        fetchDevices();
      } catch (error) {
        alert('Failed to delete device');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Manage Devices</h3>
        <Link 
          href="/admin/devices/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Add New Device
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input 
          type="text" 
          placeholder="Search devices..." 
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 font-bold"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-700 transition-colors">
          Search
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Brand</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Views</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : devices.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">No devices found.</td></tr>
            ) : (
              devices.map((device) => {
                const deviceId = device.id || device._id;
                return (
                  <tr key={deviceId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{device.name}</td>
                    <td className="px-6 py-4 text-gray-600">{device.brand}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {device.category && typeof device.category === 'object' ? (device.category as any).name : 'General'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{device.views?.toLocaleString()}</td>
                    <td className="px-6 py-4 space-x-3">
                      <Link href={`/admin/devices/edit/${deviceId}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                      <button onClick={() => handleDelete(deviceId!)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {devices.length} of {total} devices
        </p>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            disabled={devices.length < 10}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
