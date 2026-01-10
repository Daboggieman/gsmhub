"use client";

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { Device, Category } from '@shared/types';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUpload, faFileCsv, faCheckCircle, faTimesCircle, faSpinner, faSync } from '@fortawesome/free-solid-svg-icons';

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSync = async (device: Device) => {
    const deviceId = (device as any).id || device._id;
    if (!deviceId) return;
    
    setSyncingId(deviceId);
    try {
      await apiClient.syncDevice(device.brand, device.model);
      alert(`${device.name} synchronized successfully with External API`);
      fetchDevices();
    } catch (error: any) {
      alert(`Sync Failed: ${error.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncByBrand = async () => {
    const brand = prompt('Enter brand name to sync (e.g., Apple, Samsung):');
    if (!brand) return;

    setIsSyncingAll(true);
    try {
      await apiClient.syncDevices(brand);
      alert(`Sync task for ${brand} started. New devices will appear shortly.`);
      fetchDevices();
    } catch (error: any) {
      alert(`Bulk Sync Failed: ${error.message}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);
    try {
      const result = await apiClient.bulkImportDevices(file);
      setImportStatus(result);
      fetchDevices();
    } catch (error: any) {
      alert(error.message || 'Failed to import devices');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Device Inventory</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your catalog of smartphones and tablets</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncByBrand}
            disabled={isSyncingAll}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50"
          >
            {isSyncingAll ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSync} />}
            Sync Brand
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50"
          >
            {isImporting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faUpload} />
            )}
            Bulk Import
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <Link
            href="/admin/devices/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Device
          </Link>
        </div>
      </div>

      {importStatus && (
        <div className={`mb-8 p-6 rounded-3xl border ${importStatus.failed > 0 ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          <div className="flex items-center gap-3 mb-2">
            <FontAwesomeIcon icon={importStatus.failed > 0 ? faTimesCircle : faCheckCircle} className="text-xl" />
            <span className="font-black uppercase tracking-widest text-sm">Import Results</span>
          </div>
          <p className="font-bold">Successfully imported: {importStatus.success} | Failed: {importStatus.failed}</p>
          {importStatus.errors.length > 0 && (
            <ul className="mt-3 text-xs font-medium list-disc list-inside space-y-1 opacity-80">
              {importStatus.errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
              {importStatus.errors.length > 5 && <li>...and {importStatus.errors.length - 5} more</li>}
            </ul>
          )}
          <button onClick={() => setImportStatus(null)} className="mt-4 text-[10px] font-black uppercase underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg flex gap-2">
            <input
              type="text"
              placeholder="Search by brand, model or name..."
              className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-gray-900 font-bold text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-colors">
              Filter
            </button>
          </form>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Catalog</span>
            <p className="text-2xl font-black text-gray-900">{total.toLocaleString()}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Device</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Metrics</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Inventory...</td></tr>
              ) : devices.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No devices found</td></tr>
              ) : (
                devices.map((device, index) => {
                  const deviceId = (device as any).id || device._id;
                  return (
                    <tr key={deviceId || index} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100 overflow-hidden">
                            <img src={device.imageUrl || '/placeholder-device.png'} alt="" className="max-w-full max-h-full object-contain" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{device.name}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase">{device.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {device.category && typeof device.category === 'object' ? (device.category as any).name : 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-800">{device.views?.toLocaleString()} <span className="text-[10px] text-gray-400 uppercase">Hits</span></p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleSync(device)}
                            disabled={syncingId === deviceId}
                            className="bg-white border border-gray-200 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-50 transition-all disabled:opacity-50"
                          >
                            {syncingId === deviceId ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Sync'}
                          </button>
                          <Link
                            href={`/admin/devices/edit/${deviceId}`}
                            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:border-blue-600 hover:text-blue-600 transition-all"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(deviceId!)}
                            className="bg-white border border-gray-200 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Showing {devices.length} of {total} devices
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-6 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-600 transition-all disabled:opacity-30 disabled:border-gray-100"
            >
              Prev
            </button>
            <button
              disabled={devices.length < 10}
              onClick={() => setPage(page + 1)}
              className="px-6 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-600 transition-all disabled:opacity-30 disabled:border-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
